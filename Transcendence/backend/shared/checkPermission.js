import { verifyToken } from './jwt.utils.js';
import prisma from './prisma.js';

//table des droits par role
// create_project dans orga car a la creation le role sur le project n'existe pas
const ORGA_PERMISSIONS = {
    Admin: ['view_member', 'edit_orga', 'delete_orga', 'change_role', 'delete_member', 'invit_member', 'create_project'],

    Member: ['view_member'],
};

const PROJECT_PERMISSIONS = {
    Manager:['create_task', 'view_task', 'edit_task', 'move_task', 'delete_task', 'assign_task', 'view_project', 'edit_project', 'delete_project'],

    User: ['create_task', 'view_task', 'edit_task', 'move_task', 'delete_task', 'view_project'],
};


//verifie que le token est valide, mais ne verifie pas les permissions
export function authenticate(req, res, next) {
    //recuperer le token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Unauthenticated'});
    
    try {
        //on split et on prend le 2eme element, par ex Bearer abc123, token = abc123
        const token = authHeader.split(' ')[1];
        req.user = verifyToken(token);

        // next ca veut dire si c'est ok, continue vers la route
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token'})
    }
}

// recupere les informations de l'utilisateur dans l'organisation (org + role)
// le front indique l'organisation concernee dans l'URL
export async function loadOrgMembership(req, res, next) {
    try {
        const orgId = Number(req.params.orgId);
        if (!Number.isInteger(orgId) || orgId <= 0)
            return res.status(400).json({ error: 'Invalid organisation id' });

        // const membre = fakeDB.orgMembers.find(m => m.userId === req.user.userId && m.orgId === orgId);
        const membre = await prisma.member.findUnique({
            where: {
                userId_orgId: {
                    userId: req.user.userId,
                    orgId: orgId,
                },
            },
        });

        if (!membre)
            return res.status(403).json({ error: 'Not member of this organisation' });

        //req.membership = propriete qu'on a ajouter soi meme a l'objet req pour transmettre des infos aux middlewares
        // req.membership vaut par ex
        // {
        // userId: 5,
        // orgId: 2,
        // role: "Admin"
        // }
        // on peut l'utiliser ailleurs par ex const permissions = PERMISSIONS[req.membership.role] ?? []; ou req.membership.role vaut donc "Admin" ou "Member"
        req.orgMembership = membre;
        req.orgId = orgId;

        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Database error" });
    }
}

export async function loadProject(req, res, next) {
    try {
        // const project = fakeDB.projets.find(p => p.id === Number(req.params.projectId));
        const projectId = Number(req.params.projectId);
        if (!Number.isInteger(projectId) || projectId <= 0)
            return res.status(400).json({ error: 'Invalid project id' });
        
        const project = await prisma.project.findUnique({
            where: {
                id: projectId,
            },
        });

        if (!project)
            return res.status(404).json({ error: 'Project not found' });

        const projectMember = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: req.user.userId,
                    projectId: project.id,
                },
            },
        });
        // const projectMember = fakeDB.projectMembers.find(
        //     pm => 
        //         pm.projectId === project.id &&
        //         pm.userId === req.user.userId
        // )

        if (!projectMember)
            return res.status(403).json({ error: 'User is not part of this project' });
        // verifie que le projet appartient a l'orga
        // sinon on pourrait avoir un truc comme /orgs/1/projects/15 alors que le projet 15 appartient à l'orga 2
        // if (project.orgId !== req.orgId)
        //     return res.status(404).json({ error: 'Project not found' });

        req.project = project;
        req.projectMembership = projectMember;

        next();

    } catch(error) {
        console.error(error);
        return res.status(500).json({ error: "Database error" });
    }
}

export async function loadTask(req, res, next) {
    try {
        const taskId = Number(req.params.taskId);

        if (!Number.isInteger(taskId) || taskId <= 0)
            return res.status(400).json({ error: 'Invalid taskId' });

        const task = await prisma.task.findUnique({ where: { id: taskId }, });

        if (!task || task.projectId !== req.project.id)
            return res.status(404).json({ error: 'Task not found' });

        req.task = task;

        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
}


//verifie qu'un utilisateur est connecter et a le droit de faire une action avant de laisser passer une requete
// req = request = la requete envoyer
// res = result = la reponse
// next = fonction pour passer au     // on peut l'utiliser ailleurs par ex const permissions = PERMISSIONS[req.membership.role] ?? []; ou req.membership.role vaut donc "Admin" ou "Member"middleware suivant (continuer la chaine)
// return (req, res, next) =>{} = fonction anonyme que l'on retourne
// pareil que de faire : return function(req, res, next) {};
//req, res, next = argument de la fonction qui est retourner

export function checkPermissionOrga(action) {
    return (req, res, next) => {
        if (!req.orgMembership)
            return res.status(500).json({ error: 'Membership not loaded' });
        //verifier les droits
        // ?? [] = si le role n'existe pas, donne un tableau vide
        const permissions = ORGA_PERMISSIONS[req.orgMembership.role] ?? [];
        if (!permissions.includes(action))
            return res.status(403).json({ error: 'Access denied'});

        //verification terminer, peut passer a la suite
        next();
    };
}

export function checkPermissionProject(action) {
    return (req, res, next) => {
        if (!req.projectMembership)
            return res.status(500).json({ error: 'Membership not loaded' });

        const permissions = PROJECT_PERMISSIONS[req.projectMembership.role] ?? [];
        if (!permissions.includes(action))
            return res.status(403).json({ error: 'Access denied'});

        next();
    };
}

export function canManageTask(req, res, next) {
    if (!req.task)
        return res.status(500).json({ error: 'Task not loaded' });

    // manager a acces a toutes les taches
    if (req.projectMembership.role === 'Manager')
        return next();

    // user a acces a uniquement ses taches
    if (req.task.createdById !== req.user.userId && req.task.assignedToId !== req.user.userId)
        return res.status(403).json({ error: 'Not allowed' });

    next();
}
