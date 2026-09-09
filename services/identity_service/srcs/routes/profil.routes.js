import express from 'express';
import prisma from '../../../prisma/prisma.js';
import { authenticate } from '../../../shared/auth.middleware.js';
import { emitToUsers } from '../../../shared/chatClient.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: 'mailhog',   // ← le nom du service, PAS localhost (piège du db:5432)
  port: 1025,        // ← le port SMTP interne de Mailhog
  secure: false,     // ← pas de TLS, c'est un serveur de dev
});


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
                passwordHash: true,
            },
        });

        if (!user)
            return res.status(404).json({ error: 'User not found' });

        // Retourner le profil avec hasPassword (ne pas retourner le hash)
        const { passwordHash, ...profileData } = user;
        return res.json({
            ...profileData,
            hasPassword: !!passwordHash,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// modifier son profil
router.patch('/profile', authenticate, async (req, res) => {
    try {
        const { pseudo, avatar, langue, statut } = req.body;

        const pseudoTrimmed = pseudo?.trim()
        if (pseudoTrimmed !== undefined && pseudoTrimmed.length < 3)
            return res.status(400).json({ error: 'Username must be at least 3 characters' });

        if (pseudoTrimmed !== undefined && pseudoTrimmed.length > 20)
            return res.status(400).json({ error: 'Username must be at most 20 characters' });

        const allowedStatus = ['Available', 'Busy', 'Away'];
        const allowedLanguages = ['fr', 'en', 'cn'];

        if (langue && !allowedLanguages.includes(langue))
            return res.status(400).json({ error: 'Invalid language' });

        if (statut && !allowedStatus.includes(statut))
            return res.status(400).json({ error: 'Invalid status' });

        if (pseudoTrimmed !== undefined) {
            const pseudoAlreadyExist = await prisma.user.findUnique({
                where: {
                    pseudo: pseudoTrimmed
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
                ...(pseudoTrimmed !== undefined && { pseudo: pseudoTrimmed }),
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
                isOnline: true,
            },
        });

        if (statut !== undefined) {
            const watchers = await prisma.friend.findMany({
                where: { friendId: req.user.userId },
                select: { userId: true },
            });
            await emitToUsers(watchers.map(w => w.userId), 'user:status', {
                userId: req.user.userId,
                statut: user.statut,
                isOnline: user.isOnline,
            });
        }

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

        if (newPassword.length > 30)
            return res.status(400).json({ error: 'Password must be at most 30 characters' });

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

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId,
            },
        });

        if (!user)
            return res.status(404).json({ error: 'User not found' });

        // Compte classique : on exige et on vérifie le mot de passe.
        // Compte OAuth (pas de passwordHash) : on saute cette vérif, le token suffit.
        if (user.passwordHash) {
            if (!password)
                return res.status(400).json({ error: 'Password required' });

            const match = await bcrypt.compare(password, user.passwordHash);

            if (!match)
                return res.status(401).json({ error: 'Incorrect password' });
        }

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
            await tx.user.delete({
                where: {
                    id: req.user.userId,
                },
            });
        })

        if (user.email) {
            await transporter.sendMail({
              from: 'noreply@taskboard.com',
              to: user.email,
              subject: 'Suppression de votre compte TaskBoard',
              text: `Bonjour ${user.pseudo}, votre compte et toutes vos données ont été définitivement supprimés. Nous sommes désolés de vous voir partir.`,
            });
        }

        return res.json({ message: 'Profile deleted', });

    } catch (error) {
        if (error.message === 'LAST_ADMIN') {
            return res.status(400).json({ error: 'An organisation must always have at least one Admin' });
        }
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// export profile data (RGPD)
router.get('/profile/export', authenticate, async (req, res) => {
    try {
        const data = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                members:               { include: { organisation: true } },
                projectMembers:        { include: { project: true } },
                createdTasks:          true,
                assignedTasks:         true,
                messages:              true,
                comments:              true,
                notificationsReceived: true,
                notificationsSent:     true,
                sentInvitations:       true,
                receivedInvitations:   true,
                conversationMembers:   true,
                messageReads:          true,
                friends:               true,
                friendOf:              true,
            },
        });

        if (!data)
            return res.status(404).json({ error: 'User not found' });

        delete data.passwordHash;
        delete data.twoFactorSecret;

        if (data.email) {
            await transporter.sendMail({
              from: 'noreply@taskboard.com',
              to: data.email,
              subject: 'Export de vos données TaskBoard',
              text: `Bonjour ${data.pseudo}, vous avez demandé l'export de vos données personnelles. Vous le trouverez en pièce jointe de cette demande.`,
            });
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="taskboard-mes-donnees.json"');
        return res.send(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

export default router;