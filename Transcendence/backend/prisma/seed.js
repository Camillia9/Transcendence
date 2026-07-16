import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const OrganisationRole = {
  Admin: "Admin",
  Member: "Member",
};

const ProjectRole = {
  Manager: "Manager",
  User: "User",
};

const Priority = {
  Low: "Low",
  Normal: "Normal",
  Urgent: "Urgent",
};

const Colonne = {
  ToDo: "ToDo",
  Doing: "Doing",
  Blocked: "Blocked",
  Done: "Done",
};

const TypeConversation = {
  Private: "Private",
  Group: "Group",
};

async function main() {

  // Nettoyage base
  await prisma.comment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.member.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organisation.deleteMany();
  await prisma.user.deleteMany();

  // =====================
  // USERS
  // =====================

  const alice = await prisma.user.create({
    data:{
      pseudo:"alice",
      firstname:"Alice",
      lastname:"Martin",
      email:"alice@test.com",
      passwordHash:"fake_hash",
    }
  });


  const bob = await prisma.user.create({
    data:{
      pseudo:"bob",
      firstname:"Bob",
      lastname:"Dupont",
      email:"bob@test.com",
      passwordHash:"fake_hash",
    }
  });


  const charlie = await prisma.user.create({
    data:{
      pseudo:"charlie",
      firstname:"Charlie",
      lastname:"Durand",
      email:"charlie@test.com",
      passwordHash:"fake_hash",
    }
  });



  // =====================
  // ORGANISATION
  // =====================


  const organisation = await prisma.organisation.create({
    data:{
      name:"Transcendence Team"
    }
  });



  await prisma.member.createMany({
    data:[
      {
        userId:alice.id,
        orgId:organisation.id,
        role:OrganisationRole.Admin
      },
      {
        userId:bob.id,
        orgId:organisation.id,
        role:OrganisationRole.Member
      },
      {
        userId:charlie.id,
        orgId:organisation.id,
        role:OrganisationRole.Member
      }
    ]
  });



  // =====================
  // PROJECT
  // =====================


  const project = await prisma.project.create({
    data:{
      title:"Clone Trello",
      description:"Application Kanban",
      orgId:organisation.id
    }
  });



  await prisma.projectMember.createMany({
    data:[
      {
        userId:alice.id,
        projectId:project.id,
        role:ProjectRole.Manager
      },
      {
        userId:bob.id,
        projectId:project.id,
        role:ProjectRole.User
      },
      {
        userId:charlie.id,
        projectId:project.id,
        role:ProjectRole.User
      }
    ]
  });



  // =====================
  // TASKS
  // =====================


  const task1 = await prisma.task.create({
    data:{
      title:"Créer la page login",
      description:"Créer le formulaire de connexion",

      priority:Priority.Urgent,
      status:Colonne.Doing,
      position:1,

      projectId:project.id,

      // nouveau champ obligatoire
      createdById:alice.id
    }
  });



  const task2 = await prisma.task.create({
    data:{
      title:"Créer le Kanban",
      description:"Drag and drop des tâches",

      priority:Priority.Normal,
      status:Colonne.ToDo,
      position:1,

      projectId:project.id,

      createdById:bob.id
    }
  });



  // =====================
  // COMMENTS
  // =====================


  await prisma.comment.create({
    data:{
      taskId:task1.id,
      userId:bob.id,
      content:"Je vais m'occuper du formulaire."
    }
  });


  await prisma.comment.create({
    data:{
      taskId:task1.id,
      userId:alice.id,
      content:"Pense à ajouter la validation."
    }
  });



  // =====================
  // CONVERSATION
  // =====================


  const conversation = await prisma.conversation.create({
    data:{
      name:"Discussion projet",
      type:TypeConversation.Group,
      projectId:project.id
    }
  });



  await prisma.conversationMember.createMany({
    data:[
      {
        userId:alice.id,
        conversationId:conversation.id
      },
      {
        userId:bob.id,
        conversationId:conversation.id
      },
      {
        userId:charlie.id,
        conversationId:conversation.id
      }
    ]
  });



  await prisma.message.create({
    data:{
      content:"Bienvenue sur le projet !",
      userId:alice.id,
      conversationId:conversation.id
    }
  });



  await prisma.message.create({
    data:{
      content:"Je commence le Kanban.",
      userId:bob.id,
      conversationId:conversation.id
    }
  });



  console.log("Seed terminé !");
}



main()
.catch((e)=>{
  console.error(e);
  process.exit(1);
})
.finally(async()=>{
  await prisma.$disconnect();
});