// javascript// Simule la BDD tant que Dev 5 n'a pas livré Prisma
// // Quand Prisma est prêt, tu supprimes ce fichier et tu branches les vrais modèles

// const fakeDB = {
//   users: [],      // { id, pseudo, email, passwordHash, avatar, createdAt }
//   orgs: [],       // { id, orgName, createdAt }
//   orgMembers: [],    // { userId, orgId, role (admin | member) }
//   projets: [],    // { id, name, description, createdBy, createdAt }
//   invitations: [], // { id, email, orgId, token, createdAt, expireAt }
//   projectMembers: [], // { projectId, userId, role (manager | user) }
//   tasks: []        // { id, projectId, title, description, createdBy (createur), createdAt, assignedTo (optionnel), status (todo/doing/done), dueDate}
// };

// let nextId = 1;
// const newId = () => nextId++;

// export { fakeDB, newId };

// Simule la BDD tant que Dev 5 n'a pas livré Prisma

export const fakeDB = {
    users: [],
    orgs: [],
    orgMembers: [],
    projets: [],
    projectMembers: [],
    tasks: [],
    invitations: [],
};


export function newId() {
    return Date.now();
}