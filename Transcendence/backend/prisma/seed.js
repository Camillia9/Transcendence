import { PrismaClient } from "@prisma/client";
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

const Role = {
  Admin: "Admin",
  Member: "Member",
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

  // Nettoyage de la base
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.member.deleteMany();
  await prisma.organisation.deleteMany();
  await prisma.user.deleteMany();


  // Users
  const alice = await prisma.user.create({
    data: {
      pseudo: "alice",
      firstname: "Alice",
      lastname: "Martin",
      email: "alice@test.com",
      passwordHash: "fake_hash",
    },
  });


  const bob = await prisma.user.create({
    data: {
      pseudo: "bob",
      firstname: "Bob",
      lastname: "Dupont",
      email: "bob@test.com",
      passwordHash: "fake_hash",
    },
  });


  const charlie = await prisma.user.create({
    data: {
      pseudo: "charlie",
      firstname: "Charlie",
      lastname: "Durand",
      email: "charlie@test.com",
      passwordHash: "fake_hash",
    },
  });


  // Organisation
  const organisation = await prisma.organisation.create({
    data: {
      name: "Transcendence Team",
    },
  });


  // Membres organisation

  await prisma.member.create({
    data: {
      userId: alice.id,
      orgId: organisation.id,
      role: Role.Admin,
    },
  });


  await prisma.member.create({
    data: {
      userId: bob.id,
      orgId: organisation.id,
      role: Role.Member,
    },
  });


  await prisma.member.create({
    data: {
      userId: charlie.id,
      orgId: organisation.id,
      role: Role.Member,
    },
  });


  // Projet

  const project = await prisma.project.create({
    data: {
      title: "Clone Trello",
      description: "Application de gestion de projets façon Kanban",
      orgId: organisation.id,
    },
  });


  // Membres projet

  await prisma.projectMember.create({
    data: {
      userId: alice.id,
      projectId: project.id,
      role: Role.Manager,
    },
  });


  await prisma.projectMember.create({
    data: {
      userId: bob.id,
      projectId: project.id,
      role: Role.User,
    },
  });


  // Tasks

  const task1 = await prisma.task.create({
    data: {
      title: "Créer la page login",
      description: "Créer le formulaire de connexion",
      priority: Priority.Urgent,
      status: Colonne.Doing,
      position: 1,
      projectId: project.id,
    },
  });


  const task2 = await prisma.task.create({
    data: {
      title: "Créer le Kanban",
      description: "Drag and drop des tâches",
      priority: Priority.Normal,
      status: Colonne.ToDo,
      position: 1,
      projectId: project.id,
    },
  });


  await prisma.assignment.create({
    data: {
      userId: bob.id,
      taskId: task1.id,
    },
  });


  await prisma.assignment.create({
    data: {
      userId: alice.id,
      taskId: task2.id,
    },
  });


  // Conversation projet

  const conversation = await prisma.conversation.create({
    data: {
      name: "Discussion projet",
      type: TypeConversation.Group,
      projectId: project.id,
    },
  });


  await prisma.conversationMember.createMany({
    data: [
      {
        userId: alice.id,
        conversationId: conversation.id,
      },
      {
        userId: bob.id,
        conversationId: conversation.id,
      },
    ],
  });


  await prisma.message.create({
    data: {
      content: "Bienvenue sur le projet !",
      userId: alice.id,
      conversationId: conversation.id,
    },
  });


  console.log("Seed terminé !");
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });