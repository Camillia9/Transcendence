import express from 'express';
import { checkPermission, authenticate, loadMembership } from '../middleware/checkPermission.js';
// import { fakeDB, newId } from '../fakeDB.js';
import prisma from '../prisma.js';

const router = express.Router();

// creer une organisation
router.post('/organisations', authenticate, async (req, res) => {
    // le front envoie {"orgName": "Mon entreprise"} donc on recupere cet info
    const { orgName } = req.body;
    if (!orgName)
        return res.status(400).json({ error: 'Organisation name required'});
    // ajoute une nouvelle orga dans fakeDB
    const orgId = newId();
    fakeDB.orgs.push({
        id : orgId,
        orgName,
        createdAt: new Date()
    });

    // le createur devient Admin
    // req.user = verifyToken(token); et le JWT contient { userId: 123 }
    fakeDB.orgMembers.push({
        userId: req.user.userId,
        orgId,
        role: 'Admin'
    });
    res.json({ message: 'The organisation is created' });
});

// voir mon organisation
// GET /organisations/:orgId
// accessible a tous les membres connecter et on sait que l'utilisateur appartient a cette orga car loadmembership verifier
router.get('/organisations/:orgId', authenticate, loadMembership, checkPermission('view_member'), 
    async (req, res) => {
        const org = await prisma.organisation.findUnique({
            where: {id: req.orgId},
        });
        // const org = fakeDB.orgs.find(o => o.id === req.orgId);
        if (!org)
            return res.status(404).json({ error: 'Organisation not found'});
        res.json(org);

});

// modifier mon organisation
router.patch('/organisations/:orgId', authenticate, loadMembership, checkPermission('edit_orga'),
    async (req, res) => {
        const { orgName } = req.body;
        if (!orgName)
            return res.status(400).json({ error: 'Organisation name required' });

        const org = fakeDB.orgs.find(o => o.id === req.orgId);
        if (!org)
            return res.status(404).json({ error: 'Organisation not found'});
        org.orgName = orgName;
        res.json({
            message: 'Organisation modified',
            organisation: org
        });
});

// supprimer mon organisation et donc de ses membres aussi
router.delete('/organisations/:orgId', authenticate, loadMembership, checkPermission('delete_orga'),
    (req, res) => {
        //remplace l'ancien tableau par le tableau sans celui rechercher
        fakeDB.orgs = fakeDB.orgs.filter(o => o.id !== req.orgId);
        fakeDB.orgMembers = fakeDB.orgMembers.filter(m => m.orgId != req.orgId);
        res.json({ message: 'Organisation deleted'});
})

// voir les membres d'une organisation
router.get('/organisations/:orgId/membres', authenticate, loadMembership, checkPermission('view_member'),
    (req, res) => {
        const membres = fakeDB.orgMembers
            .filter(m => m.orgId === req.orgId)
            // map() parcourt chaque membre, puis avec find() va rechercher a l'interieur le user pour recuperer ses infos
            .map(m => { const user = fakeDB.users.find(u => u.id === m.userId);
                if (!user)
                    return null;

                return {
                    id : user.id,
                    pseudo: user.pseudo,
                    email: user.email,
                    avatar: user.avatar,
                    role: m.role
                };
            })
            // pour enlever du tableau les valeur ou user = null
            .filter(Boolean);
            // et on renvoie ce nouveau tableau au front (ca depend des infos qu'il a besoin)
        res.json(membres);
});

// changer un role, par ex tu passes de admin a membre
router.patch('/organisations/:orgId/membres/:userId', authenticate, loadMembership, checkPermission('change_role'),
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
        
        // recherche le bon user dans la bonne orga
        const membre = fakeDB.orgMembers.find(m => m.orgId === req.orgId && m.userId === cible);
        if (!membre)
            return res.status(404).json({ error: 'Member not found' });
        
        // verifie qu'il y a tjs au moins 1 admin sur l'orga
        if (membre.role === 'Admin' && role !== 'Admin') {
            const admins = fakeDB.orgMembers.filter(
                m => m.orgId === req.orgId && m.role === 'Admin'
            );
            if (admins.length === 1) {
                return res.status(400).json({ error: 'An organisation must always have at least one Admin' });
            }
        }
        // modifie directement l'objet dans fakeDB
        membre.role = role;

        res.json({
            message: 'Role modified',
            membre
        });
});

// supprimer un membre d'une orga
router.delete('/organisations/:orgId/membres/:userId', authenticate, loadMembership, checkPermission('delete_member'),
    (req, res) => {
        const cible = Number(req.params.userId);

        const membre = fakeDB.orgMembers.find(m => m.orgId === req.orgId && m.userId === cible);
        if (!membre)
            return res.status(404).json({ error: 'Member not found'});

        // verifie qu'il y a tjs au moins 1 admin dans l'orga
        if (membre.role === 'Admin') {
            const admins = fakeDB.orgMembers.filter(
                m => m.orgId === req.orgId && m.role === 'Admin'
            );
            if (admins.length === 1) {
                return res.status(400).json({ error: 'An organisation must always have at least one Admin' });
            }
        }

        fakeDB.orgMembers = fakeDB.orgMembers.filter(m => !(m.orgId === req.orgId && m.userId === cible));

        res.json({ message: 'Member deleted' });
});

export default router;