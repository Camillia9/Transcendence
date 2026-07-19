import express from 'express';
import { checkPermissionOrga, authenticate, loadMembership } from '../middleware/checkPermission.js';
// import { fakeDB, newId } from '../fakeDB.js';
import prisma from '../prisma.js';

const router = express.Router();

// creer une organisation
router.post('/organisations', authenticate, async (req, res) => {
    // le front envoie {"orgName": "Mon entreprise"} donc on recupere cet info
    const { orgName } = req.body;
    if (!orgName)
        return res.status(400).json({ error: 'Organisation name required' });
   
    const orgaAlreadyExist = await prisma.organisation.findUnique({ where: { name }});
    if (orgaAlreadyExist)
        return res.status(409).json({ error: 'Organisation name already taken' });
    
    // transaction : creer l'orga et ajoute le createur en admin en 1 seul operation
    // si l'une echoue, les 2 sont annulees
    const { org } = await prisma.$transaction(async (tx) => {
        const org = await tx.organisation.create({ data: { name } });

        await tx.member.create({ 
            data: {
                userId: req.user.userId,
                orgId: org.id,
                role: 'Admin',
            },
        });
        return { org };
    });

    // ajoute une nouvelle orga dans fakeDB
    // const orgId = newId();
    // fakeDB.orgs.push({
    //     id: orgId,
    //     orgName,
    //     createdAt: new Date()
    // });

    // // le createur devient Admin
    // // req.user = verifyToken(token); et le JWT contient { userId: 123 }
    // fakeDB.orgMembers.push({
    //     userId: req.user.userId,
    //     orgId,
    //     role: 'Admin'
    // });
    res.status(201).json({ message: 'The organisation is created', organisation: org });
});

// voir mon organisation
// GET /organisations/:orgId
// accessible a tous les membres connecter et on sait que l'utilisateur appartient a cette orga car loadmembership verifier
router.get('/organisations/:orgId', authenticate, loadMembership, checkPermissionOrga('view_member'), 
    async (req, res) => {
        const org = await prisma.organisation.findUnique({
            where: {id: req.orgId},
        });
        // const org = fakeDB.orgs.find(o => o.id === req.orgId);
        if (!org)
            return res.status(404).json({ error: 'Organisation not found' });
        
        res.json(org);
    });

// modifier mon organisation
router.patch('/organisations/:orgId', authenticate, loadMembership, checkPermissionOrga('edit_orga'),
    async (req, res) => {
        const { orgName } = req.body;
        if (!orgName)
            return res.status(400).json({ error: 'Organisation name required' });
        
        // where pour dire de trouver l'organisation dont l'id correspond a req.orgId
        // data pour dire quel colonne a modifier
        const org = await prisma.organisation.update({
            where: { id: req.orgId },
            data: { name: orgName },
        })
        // const org = fakeDB.orgs.find(o => o.id === req.orgId);
        // if (!org)
        //     return res.status(404).json({ error: 'Organisation not found' });
        // org.orgName = orgName;
        res.json({
            message: 'Organisation updated',
            organisation: org
        });
    });

// supprimer mon organisation et donc de ses membres aussi
router.delete('/organisations/:orgId', authenticate, loadMembership, checkPermissionOrga('delete_orga'),
    (req, res) => {
        // //remplace l'ancien tableau par le tableau sans celui rechercher
        // fakeDB.orgs = fakeDB.orgs.filter(o => o.id !== req.orgId);
        // fakeDB.orgMembers = fakeDB.orgMembers.filter(m => m.orgId != req.orgId);
        
        // prisma gere la suppression en cascade grace aux onDelete: Cascade du schema
        await prisma.organisation.delete({ where: { id: req.orgId }});
        
        res.json({ message: 'Organisation deleted' });
    })

// voir les membres d'une organisation
router.get('/organisations/:orgId/membres', authenticate, loadMembership, checkPermissionOrga('view_member'),
    (req, res) => {
        const membres = await prisma.member.findMany({
            where: { orgId: req.orgId },
            include: {
                user: {
                    select: { id: true, pseudo: true, email: true, avatar: true },
                },
            },
        });
        
        // formater pour le front
        const result = membres.map(m => ({
            id : m.user.id,
            pseudo: m.user,pseudo,
            email: m.user.email,
            avatar: m.user.avatar,
            role: m.role,
        }));

        res.json(result);

        // const membres = fakeDB.orgMembers
        //     .filter(m => m.orgId === req.orgId)
        //     // map() parcourt chaque membre, puis avec find() va rechercher a l'interieur le user pour recuperer ses infos
        //     .map(m => {
        //         const user = fakeDB.users.find(u => u.id === m.userId);
        //         if (!user)
        //             return null;

        //         return {
        //             id: user.id,
        //             pseudo: user.pseudo,
        //             email: user.email,
        //             avatar: user.avatar,
        //             role: m.role
        //         };
        //     })
        //     // pour enlever du tableau les valeur ou user = null
        //     .filter(Boolean);
        // // et on renvoie ce nouveau tableau au front (ca depend des infos qu'il a besoin)
        // res.json(membres);
    });

// changer un role, par ex tu passes de admin a membre
router.patch('/organisations/:orgId/membres/:userId', authenticate, loadMembership, checkPermissionOrga('change_role'),
    (req, res) => {
        // cherche quel utilisateur on veut modifier avec req.params.userId (en recuperant sur l'URL)
        // on utilise Number() car l'URL est en char et on veut un num
        const cible = Number(req.params.userId);
        const { role } = req.body;
        const roles = [
            'Admin',
            'Member'
        ];

        if (!roles.includes(role))
            return res.status(400).json({ error: 'Invalid role' });

        // verifier que la cible est bien dans l'orga
        const membre = await prisma.member.findUnique({
            where: { userId_orgId:
                { 
                    userId: cible,
                    orgId: req.orgId
                }
            },
        });
        // const membre = fakeDB.orgMembers.find(m => m.orgId === req.orgId && m.userId === cible);
        if (!membre)
            return res.status(404).json({ error: 'Member not found' });

        // verifie qu'il y a tjs au moins 1 admin sur l'orga
        if (membre.role === 'Admin' && role !== 'Admin') {
            const nbAdmins = await prisma.member.count({
                where: {
                    orgId: req.orgId,
                    role: 'Admin'},
            });

            if (nbAdmins === 1)
                return res.status(400).json({ error: 'An organisation must always have at least one Admin' });
            // const admins = fakeDB.orgMembers.filter(
            //     m => m.orgId === req.orgId && m.role === 'Admin'
            // );
            // if (admins.length === 1) {
            //     return res.status(400).json({ error: 'An organisation must always have at least one Admin' });
            // }
        }
        
        const updated = await prisma.member.update({
            where: {
                userId_orgId: {
                    userId: cible,
                    orgId: req.orgId
                }
            },
            data: { role },
        });

        // // modifie directement l'objet dans fakeDB
        // membre.role = role;

        res.json({
            message: 'Role updated',
            membre: updated
        });
    });

// supprimer un membre d'une orga
router.delete('/organisations/:orgId/membres/:userId', authenticate, loadMembership, checkPermissionOrga('delete_member'),
    (req, res) => {
        const cible = Number(req.params.userId);

        const membre = await prisma.member.findUnique({
            where: { userId_orgId: {
                userId: cible,
                orgId: req.orgId
                }
            },
        });

        // const membre = fakeDB.orgMembers.find(m => m.orgId === req.orgId && m.userId === cible);
        if (!membre)
            return res.status(404).json({ error: 'Member not found' });

        // verifie qu'il y a tjs au moins 1 admin dans l'orga
        if (membre.role === 'Admin') {
            const nbAdmins = await prisma.member.count({
                where: {
                    orgId: req.orgId,
                    role: 'Admin'
                },
            });

            if (nbAdmins === 1)
                return res.status(400).json({ error: 'An organisation must always have at least one Admin' });
            
            // const admins = fakeDB.orgMembers.filter(
            //     m => m.orgId === req.orgId && m.role === 'Admin'
            // );
            // if (admins.length === 1) {
            //     return res.status(400).json({ error: 'An organisation must always have at least one Admin' });
            // }
        }

        await prisma.member.delete({
            where: {
                userId_orgId: {
                    userId: cible,
                    orgId: req.orgId
                }
            },
        });
        // fakeDB.orgMembers = fakeDB.orgMembers.filter(m => !(m.orgId === req.orgId && m.userId === cible));

        res.json({ message: 'Member deleted' });
    });

export default router;