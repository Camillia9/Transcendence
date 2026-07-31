import express from 'express';
import prisma from "../prisma.js";
import { authenticate } from '../middleware/checkPermission.js';

const router = express.Router();

// recuperer la liste des amis avec leur status
router.get('/friends', authenticate, async (req, res) => {
    try {
        const friends = await prisma.friend.findMany({
            where: {
                userId: req.user.userId,
            },
            include: {
                friend: {
                    select: {
                        id: true,
                        pseudo: true,
                        avatar: true,
                        statut: true,
                        isOnline: true,
                    },
                },
            },
        });

        return res.json(friends);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// ajouter un Friend
router.post('/friends', authenticate, async (req, res) => {
    try {
        const friendId = Number(req.body.friendId);

        if (!Number.isInteger(friendId))
            return res.status(400).json({ error: "Invalid friend id" });

        if (friendId === req.user.userId)
            return res.status(400).json({ error: 'Can not add yourself' });

        const friend = await prisma.user.findUnique({
            where: {
                id: friendId,
            },
        });

        if(!friend)
           return res.status(404).json({ error: 'User not found' }); 

        const alreadyFriend = await prisma.friend.findUnique({
            where: {
                userId_friendId: {
                    userId: req.user.userId,
                    friendId,
                },
            },
        });

        if (alreadyFriend)
            return res.status(409).json({ error: 'Already friend' });

        const newFriend = await prisma.friend.create({
            data: {
                userId: req.user.userId,
                friendId,
            },
            select: {
                friend: {
                    select: {
                        id: true,
                        pseudo: true,
                        avatar: true,
                        statut: true,
                        isOnline: true,
                    }
                }
            }
        });

        return res.status(201).json(newFriend);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// supprimer un friend
router.delete('/friends/:friendId', authenticate, async (req, res) => {
    try {
        const friendId = Number(req.params.friendId);

        if (!Number.isInteger(friendId))
            return res.status(400).json({ error: "Invalid friend id" });

        await prisma.friend.delete({
            where: {
                userId_friendId: {
                    userId: req.user.userId,
                    friendId,
                },
            },
        });

        return res.json({ message: "Friend removed", });

    } catch (error) {
        if (error.code === "P2025")
            return res.status(404).json({ error: "Friend not found" });

        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// controleur route pour rechercher l'id du friend qu'on veut ajouter (pour avoir FriendId a envoyer a POST)
router.get('/users/search', authenticate, async (req, res) => {
    try {
        const query = req.query.q;

        if (!query || query.length < 2)
            return res.status(400).json({ error: "Search must contain at least 2 characters", });

        // insensitive permet de pas faire attention a upper ou lowercase 
        const users = await prisma.user.findMany({
            where: {
                pseudo: {
                    contains: query,
                    mode: "insensitive",
                },
                NOT: {
                    id: req.user.userId,
                },
            },
            select: {
                id: true,
                pseudo: true,
                avatar: true,
                statut: true,
                isOnline: true,
            },
            orderBy: {
                pseudo: "asc",
            },
            // take = limite du nbre de resultat retourner
            take: 20,
        });

        return res.json(users);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

export default router;