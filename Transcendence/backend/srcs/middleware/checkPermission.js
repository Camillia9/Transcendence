import { verifyToken } from '../auth/jwt.utils.js';
import { fakeDB } from '../fakeDB.js';

//table des droits par role
const PERMISSIONS = {
    Admin: ['view_member', 'edit_orga', 'delete_orga', 'change_role', 'delete_member', 'invit_member'],

    Member: ['view_member'],

    Manager:['create_task', 'view_task', 'edit_task', 'move_task', 'delete_task', 'assign_task', 'create_project', 'view_project', 'edit_project', 'delete_project'],

    User: ['create_task', 'view_task', 'edit_task', 'move_task', 'delete_task', 'view_project'],
    
    // Manager:['create_task', 'edit_task', 'delete_task', 'assign_task', 'create_project', 'view_projects', 'edit_project', 'delete_project', 'view_all_tasks', 'move_all_tasks'],

    // User: ['create_task', 'edit_own_task', 'view_own_tasks', 'move_own_tasks', 'delete_own_task'],
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

        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token'})
    }
}

// recupere les informations de l'utilisateur dans l'organisation (org + role)
// le front indique l'organisation concernee dans l'URL
export function loadMembership(req, res, next) {
    const orgId = Number(req.params.orgId);
    if (Number.isNaN(orgId))
        return res.status(400).json({ error: 'Invalid organisation id' });

    const membre = fakeDB.orgMembers.find(m => m.userId === req.user.userId && m.orgId === orgId);

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
    req.membership = membre;
    req.orgId = orgId;
    req.role = membre.role;

    next();
}

export function loadProject(req, res, next) {
    const project = fakeDB.projets.find(p => p.id === Number(req.params.projectId));
    if (!project)
        return res.status(404).json({ error: 'Project not found' });
    
    const projectMember = fakeDB.projectMembers.find(
        pm => 
            pm.projectId === project.id &&
            pm.userId === req.user.userId
    )

    if (!projectMember)
        return res.status(403).json({ error: 'User is not part of this project' });
    // verifie que le projet appartient a l'orga
    // sinon on pourrait avoir un truc comme /orgs/1/projects/15 alors que le projet 15 appartient à l'orga 2
    // if (project.orgId !== req.orgId)
    //     return res.status(404).json({ error: 'Project not found' });
    
    req.project = project;
    req.projectMember = projectMember;
    
    next();
}


//verifie qu'un utilisateur est connecter et a le droit de faire une action avant de laisser passer une requete
// req = request = la requete envoyer
// res = result = la reponse
// next = fonction pour passer au     // on peut l'utiliser ailleurs par ex const permissions = PERMISSIONS[req.membership.role] ?? []; ou req.membership.role vaut donc "Admin" ou "Member"middleware suivant (continuer la chaine)
// return (req, res, next) =>{} = fonction anonyme que l'on retourne
// pareil que de faire : return function(req, res, next) {};
//req, res, next = argument de la fonction qui est retourner

export function checkPermission(action) {
    return (req, res, next) => {
        if (!req.membership)
            return res.status(500).json({ error: 'Membership not loaded' });
        //verifier les droits
        // ?? [] = si le role n'existe pas, donne un tableau vide
        const permissions = PERMISSIONS[req.membership.role] ?? [];
        if (!permissions.includes(action))
            return res.status(403).json({ error: 'Access denied'});

        //verification terminer, peut passer a la suite
        next();
    };
}

export function canManageTask(req, res, next) {
    const task = fakeDB.tasks.find(
        t =>
            t.id === Number(req.params.taskId) &&
            t.projectId === req.project.id
    );

    if (!task)
        return res.status(404).json({ error: "Task not found "});

    req.task = task;

    // manager a acces a toutes les taches
    if (req.membership.role === "Manager") {
        return next();
    }

    // user a acces a uniquement ses taches
    if (task.userId !== req.user.userId) {
        return res.status(403).json({ error: "Not allowed" });
    }

    next();
}
