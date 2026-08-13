
// invitation sil a un compte il recoit une notif d'invitation
// quand il accepte tt le monde, recoit la notif

// quand on ajoute un membre a l'orga tt le monde recoit
// quand on supprime un membre a un projet tt le monde recoit
// quand on ajoute qq1 a un projet tt le monde recoit


import express from 'express';
import prisma from '../../../prisma/prisma.js';
import { authenticate } from '../../../shared/auth.middleware.js';
import bcrypt from 'bcrypt';

const router = express.Router();


// voir son profil
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId,
            },
            select: {
                id: true,
                pseudo: true,
                email: true,
                avatar: true,
                statut: true,
                langue: true,
                twoFactorEnabled: true,
            },
        });

        if (!user)
            return res.status(404).json({ error: 'User not found' });

        return res.json(user);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// modifier son profil
router.patch('/profile', authenticate, async (req, res) => {
    try {
        const { pseudo, avatar, langue, statut } = req.body;

        if (pseudo !== undefined && pseudo.trim().length < 3)
            return res.status(400).json({ error: 'Username must be at least 3 characters' });

        const allowedStatus = ['Available', 'Busy', 'Away'];
        const allowedLanguages = ['fr', 'en', 'cn'];

        if (langue && !allowedLanguages.includes(langue))
            return res.status(400).json({ error: 'Invalid language' });

        if (statut && !allowedStatus.includes(statut))
            return res.status(400).json({ error: 'Invalid status' });

        if (pseudo !== undefined) {
            const pseudoAlreadyExist = await prisma.user.findUnique({
                where: {
                    pseudo,
                },
            });

            // verfier que le pseudo n'existe pas deja car doit etre unique selon le schema prisma et que ce n'est pas son propre pseudo s'il le change pas
            if (pseudoAlreadyExist && pseudoAlreadyExist.id !== req.user.userId)
                 return res.status(409).json({ error: 'Pseudo already used' });
        }

        const user = await prisma.user.update({
            where: {
                id: req.user.userId,
            },
            data: {
                ...(pseudo !== undefined && { pseudo }),
                ...(avatar !== undefined && { avatar }),
                ...(langue !== undefined && { langue }),
                ...(statut !== undefined && { statut }),
            },
            select: {
                id: true,
                pseudo: true,
                email: true,
                avatar: true,
                statut: true,
                langue: true,
            },
        });

        return res.json({
            message: 'Profile updated',
            user,
    });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// voir le profil d'un user
router.get('/users/:userId', authenticate, async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!Number.isInteger(userId) || userId <= 0)
            return res.status(400).json({ error: "Invalid user id" });

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                pseudo: true,
                avatar: true,
            }
        });

        if(!user)
           return res.status(404).json({ error: 'User not found' });

        return res.json(user);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// changer son mdp
router.patch('/profile/password', authenticate, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword)
            return res.status(400).json({ error: 'Old password and new password are required' });

        if (newPassword.length < 6)
            return res.status(400).json({ error: 'Password must be at least 6 characters' });

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId,
            },
        });

        if (!user)
            return res.status(404).json({ error: 'User not found' });

        const match = await bcrypt.compare(oldPassword, user.passwordHash);

        if (!match)
            return res.status(401).json({ error: 'Incorrect password' });

        if (oldPassword === newPassword)
            return res.status(400).json({ error: 'New password must be different' });

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: {
                id: req.user.userId,
            },
            data: {
                passwordHash,
            },
        });

        return res.json({ message: 'Password changed' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// delete profile
router.delete('/profile', authenticate, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password)
            return res.status(400).json({ error: 'Password required' });

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId,
            },
        });

        if (!user)
            return res.status(404).json({ error: 'User not found' });

        const match = await bcrypt.compare(password, user.passwordHash);

        if (!match)
            return res.status(401).json({ error: 'Incorrect password' });

        // recupere tte les orga ou le user est admin
        await prisma.$transaction(async (tx) => {
            const adminMemberships = await tx.member.findMany({
                where: {
                    userId: req.user.userId,
                    role: 'Admin',
                },
                select: {
                    orgId: true,
                },
            });
            for (const {orgId} of adminMemberships) {
                const nbAdmins = await tx.member.count({
                    where: {
                        orgId,
                        role: 'Admin',
                    },
                });

                if (nbAdmins === 1) {
                    throw new Error('LAST_ADMIN');
                }
            }

            // si tte les orga ont encore au moins 1 admin, on peut supprimer
            await prisma.user.delete({
                where: {
                    id: req.user.userId,
                },
            });
        })

        return res.json({ message: 'Profile deleted', });

    } catch (error) {
        if (error.message === 'LAST_ADMIN') {
            return res.status(400).json({ error: 'An organisation must always have at least one Admin' });
        }
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

export default router;