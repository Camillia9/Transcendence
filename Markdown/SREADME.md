*This project has been created as part of the 42 curriculum by [camansou], [makoon], [sachanai], [eieong] and [niclee].*

<div align="center">

# TaskBoard

### A collaborative dashboard for organizing and tracking team projects

</div>

---

## Description

**TaskBoard** is a collaborative web application developed as part of the **ft_transcendence** project at 42.

Our goal was to create a shared workspace that helps teams organize their projects and keep track of their work from a single dashboard.

Users can work together inside organizations, create projects and tasks, manage permissions, communicate with other members and receive updates in real time.

### Main features

* User registration and authentication
* User profiles and friends
* OAuth and two-factor authentication
* Organizations and member management
* Advanced permissions
* Projects and task management
* Real-time collaboration
* Chat
* Notifications
* Multilingual interface
* Custom design system
* Microservices architecture
* Health checks and status page
* Prometheus & Grafana monitoring
* GDPR features

---

# Team Information

We worked as a team of five. Alongside development, we shared project responsibilities such as product management, project management and technical coordination.


### Makoon

**Role:** Developer

Responsible for:

* Backend development
* API routing
* Database management (Prisma schema, migrations, seed)
* Authentification (JWT, login, Google OAuth, GitHub OAuth, 2FA)
* Authorization and middleware (permissions, roles)


### Camansou

**Roles:** Product Owner, Project Manager, Developer

Responsible for:

* Product planning and priorities
* Project organization
* Frontend development
* Dashboard and UI components
* Internationalization

### Eieong

**Roles:** Technical Lead, Developer

Responsible for:

* Technical decisions and architecture
* Backend microservices
* Docker, Nginx and Makefile
* Monitoring, health checks and backups

### Niclee

**Role:** Developer

Responsible for:

* Real-time collaboration (WebSockets / Socket.IO) across Kanban, Chat, Organisation and Friends pages
* Chat feature (backend routes, conversations, messages, read/unread status)
* Notification system (task, chat and organisation/project events)
* Permission and access-control fixes tied to real-time events (removal from an organisation/project, task assignment)
* Input validation limits (username, password, organisation, project, task)

### Sachanai

**Roles:** Developer

Responsible for :

* Product planning and priorities
* Project organization
* Internationalization (i18n): full French, English and Chinese support across TaskBoard, language switcher, and the related localization fixes

---

# Project Management

We divided the project into features and technical areas so that several members could work in parallel.

For larger features, we split the work into smaller tasks and assigned them to one or more members.

Our workflow was mainly based on:

* **Git / GitHub** for version control
* **GitHub Issues / Project board** for task management
* **Feature branches** for development
* **Pull requests** for integrating changes
* **Discord** for communication
* Regular meetings to discuss progress, blockers and technical decisions

Because frontend, backend and database changes are often connected, we regularly discussed changes before integrating them to avoid breaking another part of the application.

---

# Technical Stack

## Frontend

**React**

We chose React as the JavaScript library used to build the user interface. Its component-based model fits our application well, since the dashboard is made of many repeated and reusable elements such as cards, board columns, modals and inputs. React's reactive state management also makes it straightforward to keep the interface in sync with real-time updates coming from the backend, and its large ecosystem gave us reliable tools for routing, drag-and-drop and internationalization.

**Vite**

We chose Vite as the build tool and development server for the frontend. It provides a very fast development experience thanks to instant hot module replacement, which noticeably sped up our iteration while building the UI. Vite relies on native ES modules and requires minimal configuration, while still producing an optimized bundle for production.

**Tailwind CSS**

We chose Tailwind CSS as our styling solution, following a utility-first approach with no inline styles. Applying styles directly through utility classes let us build a consistent design system and keep visual choices uniform across the whole application without maintaining separate CSS files. It also made it fast to develop a responsive, mobile-first interface that stays coherent with our reusable component library.

---

## Backend

**Node.js**

We chose Node.js as the JavaScript runtime used to run the backend services. It allows us to use JavaScript across both the frontend and backend, making development more consistent across the project. Node.js is particularly well-suited for applications that need to handle many simultaneous connections and asynchronous exchanges. It also provides a large ecosystem of libraries through npm and fits well with our multi-service backend architecture.

**Express.js**

We chose Express.js as the web framework used to build our REST API with Node.js and handle HTTP routing and middleware. Its lightweight and flexible architecture allows us to organize our different backend services and easily implement features such as authentication, authorization, and request processing.

**Passport.js**

We chose Passport.js to simplify the implementation of OAuth authentication with external providers such as Google and GitHub. Its middleware-based approach integrates naturally with Express.js and allows us to keep authentication logic separate from the rest of the application.

**JWT (JSON Web Token)**

We chose JWT token-based authentication for securing API requests because it provides a stateless and lightweight way to identify users when communicating with our backend services. The token is sent with authenticated requests, allowing each backend service to verify the user's identity without relying on a centralized server-side session. This makes authentication easier to share across our identity, workspace, and chat services.


---

## Database

**PostgreSQL**

We chose PostgreSQL because our application contains many relationships between users, organizations, projects, tasks and other resources.

A relational database fits this structure well and helps keep the data consistent.

---

## Prisma

**Prisma** is used as our ORM (Object-Relational Mapper) to simplify the interaction between our Node.js backend and PostgreSQL database.

It allows us to define the database schema and access related data from the application in a structured way.

Prisma also provides migration tools, making it easier to manage changes to our database schema throughout the development of the project.

---

## WebSockets

WebSockets are used for features that need real-time communication.

They allow connected users to receive updates without having to refresh the page.

---

## Docker

Docker is used to containerize the different parts of the application.

This gives every member of the team a more consistent development environment and allows the services to be run together.

---

## Prometheus & Grafana

**Prometheus** collects application metrics and **Grafana** is used to visualize them.

This gives us a way to monitor the application and identify problems through metrics and dashboards.

---

# Architecture

TaskBoard uses a **microservice architecture**.

The application is split into several services, each with a specific responsibility.

A simplified view of the architecture is:

```text
                         ┌──────────────┐
                         │   Browser    │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │    Nginx     │
                         └──────┬───────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
       ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
       │   Identity  │   │  Workspace  │   │    Chat     │
       │   Service   │   │   Service   │   │   Service   │
       └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
              │                 │                 │
              └─────────────────┼─────────────────┘
                                │
                         ┌──────▼───────┐
                         │  PostgreSQL  │
                         └──────────────┘

                    ┌─────────────────────┐
                    │ Prometheus / Grafana│
                    └─────────────────────┘

```

---

# Database Schema

TaskBoard uses **PostgreSQL** with **Prisma**.

The main relationships are based around users and collaborative workspaces:

```text
User
 │
 ├──< Member >── Organisation
 │                  │
 │                  └──< Project
 │                         │
 │                         ├──< ProjectMember >── User
 │                         │
 │                         └──< Task
 │                                │
 │                                ├── assignedTo ──> User
 │                                ├── createdBy ───> User
 │                                └──< Comment >── User
 │
 ├──< Invitation >── Organisation
 │
 ├──< Notification
 │
 ├──< Friend >── User
 │
 └──< ConversationMember >── Conversation
                                  │
                                  └──< Message >── User
                                           │
                                           └──< MessageRead >── User

```

### Main entities

* **User** — application users and their account/profile information.
* **Organisation** — shared workspaces containing members and projects.
* **Project** — projects belonging to an organization.
* **Task** — pieces of work belonging to a project.
* **Notification** — notifications associated with users.
* **Comment** - comments on tasks
* **Conversation** - private and group conversations

### Relationships

* User ↔ Organisation: A many-to-many relationship managed through the Member table. A member also has an organisation role (Admin or Member).
* Organisation → Project: An organisation can contain multiple projects, while each project belongs to one organisation.
* User ↔ Project: A many-to-many relationship managed through ProjectMember, which also stores the user's project role (Manager or User).
* Project → Task: A project can contain multiple tasks. Tasks can be assigned to users and have a creator.
* Task → Comment: A task can contain multiple comments, each associated with a user.
* User ↔ Conversation: A many-to-many relationship managed through ConversationMember.
* Conversation → Message: A conversation contains multiple messages, with each message associated with its sender.
* Message ↔ User: The MessageRead table tracks which users have read each message.
* User → Notification: Users can receive notifications related to organisations, projects, tasks, or invitations.
* User ↔ User: Friend relationships are represented by the Friend table.

### Data types

The database primarily uses:

* **Int** for primary keys and foreign keys.
* **String** for text-based data such as usernames, emails, titles, and messages.
* **Boolean** for boolean states such as online status and notification read status.
* **DateTime** for timestamps and deadlines.
* **Enum** for predefined values such as roles, task statuses, priorities, invitation statuses, and notification types.

Optional fields are represented with ?, for example description: String? means that a description is not required.

The database uses several enums to restrict values and maintain data consistency:

| Enum | Values | Usage |
| --- | --- | --- |
| OrganisationRole | Admin, Member | Organization roles |
| ProjectRole | Manager, User | Project roles |
| Priority | Low, Normal, Urgent | Task priority |
| Colonne | ToDo, Doing, Blocked, Done | Task/board columns |
| TypeConversation | Private, Group | Conversation type |
| UserStatus | Available, Away, Busy | User availability |
| Language | fr, en, cn | User language |
| InvitationStatus | Pending, Accepted, Declined, Cancelled | Invitation state |
| TypeNotification | Assignment, InvitationSent, InvitationAccepted, InvitationDeclined, InvitationCancelled, MemberLeftOrga, RoleChanged, RemovedFromOrga, MemberRemoved, OrgaUpdated, OrgaDeleted, ProjectUpdated, ProjectDeleted, RemovedFromProject, ProjectRoleUpdated, DeplacementTache | Notification events |

### Data integrity

Several constraints are used to ensure database consistency:

* Primary keys are defined with @id.
* Unique fields such as User.pseudo, User.email, User.githubId and User.googleId prevent duplicate accounts.
* Composite primary keys are used for junction tables such as Member, ProjectMember, ConversationMember and MessageRead.
* Foreign keys maintain relationships between entities.
* onDelete: Cascade is used when dependent records should be removed automatically.
* onDelete: SetNull is used for optional relationships where the referenced entity can be deleted without deleting the dependent record.
* Tasks use a unique constraint on (projectId, status, position) to guarantee a unique position within each board column.



---

# Features

## Authentication & User Management

Users can create and manage their accounts and profiles. Authentication allows users to securely authenticate to the application.

The application also provides user interaction features such as profiles, friends and online status.

**Contributor:** Makoon

---

## OAuth & 2FA

OAuth provides an alternative authentication method using an external identity provider.

Two-factor authentication adds an additional security step to user accounts.

**OAuth provider:** Google, GitHub
**Two-factor provider:** Authenticator app

**Contributor:** Makoon

---

## Organizations & Permissions

Organizations provide a shared workspace for several users.

Members have different permissions depending on their role. This controls which actions they can perform on organizations, projects and other resources.

**Contributor:** Makoon

---

## Projects & Tasks

Projects and tasks are the main organizational part of TaskBoard.

Users can create and manage projects and tasks and assign work to members according to their permissions.

**Contributors:** Camansou, Makoon

---

## Invitations

This allows users to invite other users to join an organization and manage invitation requests.

**Contributor:** Makoon

---

## Chat & User Interaction

Users can interact through:

* profiles;
* friends;
* online status;
* chat.

These features allow TaskBoard to be used as a collaborative workspace rather than only as a task tracker.

**Contributors:** Makoon, Niclee

---

## Real-Time Collaboration

WebSockets are used to synchronize relevant changes between connected users.

This means that users can receive updates without manually refreshing the application.

**Implementation:** Socket.IO rooms are used per organisation, project and conversation. Events keep the Kanban board (task creation, deletion and drag-and-drop between columns), the organisation/friends pages and the chat in sync between all connected members in real time.

**Contributors:** Niclee

---

## Notifications

The notification system informs users about relevant events happening in the application.

**Contributors:** Makoon, Niclee

---


## Custom Design System

We created reusable UI components to keep the interface consistent across the application.

The design system currently includes at least ten reusable components:

1. Button
2. Card
3. Input
4. Avatar
5. Badge
6. Logo
7. Modal
8. TaskCard
9. TaskPanel
10. KanbanColumn

**Contributors:** Camansou

---

# Chosen Modules

We chose modules that fit naturally with the idea of a collaborative project management platform.

According to the subject, a **Major is worth 2 points** and a **Minor is worth 1 point**.

Our selected modules give us a total of **26 points**.

---

## Web — 10 points

### Major — Framework for frontend and backend — 2 pts

We use frameworks for both the frontend and backend to structure the application and its different services.

**Why we chose it:** it provides a clear structure for a large web application and makes it easier to separate responsibilities.

**Implementation:** React for frontend framework and Express for backend framework

**Contributors:** Camansou, Makoon, Eieong

---

### Major — WebSockets — 2 pts

We use WebSockets for real-time communication between connected users.

**Why we chose it:** collaborative features are much more useful when updates are visible immediately.

**Implementation:** real-time events are sent to connected clients when relevant changes occur.

**Contributors:** Niclee

---

### Major — User Interaction — 2 pts

This module is implemented through user profiles, friends, online status and chat.

**Why we chose it:** TaskBoard is designed around collaboration between users.

**Contributors:** Camansou, Makoon, Niclee

---

### Minor — Prisma ORM — 1 pt

Prisma is used to manage the PostgreSQL database from the backend.

**Why we chose it:** it makes database access and relations easier to maintain.

**Contributor:** Makoon

---

### Minor — Notification System — 1 pt

The application provides notifications for relevant actions.

**Why we chose it:** users should be informed about important changes without having to constantly check every project.

**Contributors:** Makoon, Niclee, Camansou

---

### Minor — Real-Time Collaborative Features — 1 pt

Real-time updates allow several connected users to see relevant changes without refreshing the page.

**Why we chose it:** it improves the collaborative experience of the dashboard.

**Contributors:** Niclee

---

### Minor — Custom Design System — 1 pt

We created our own reusable UI components and a common visual style.

**Why we chose it:** using shared components keeps the interface consistent and avoids duplicated code.

**Contributors:** Camansou, Sachanai

---

## Accessibility — 2 points

### Minor — Multiple Languages — 1 pt

The application supports three languages: English, French and Chinese.

**Why we chose it:** we wanted the application to be usable by people with different language preferences.

**Implementation:** i18n system + language switcher.

**Contributors:** Sachanai

---

### Minor — Support for additional browsers  — 1 pt

The application is compatible with Firefox, Chrome and Brave.

**Why we chose it:** we wanted the application to be usable on different browsers.

**Contributors:** Camansou

---

## User Management — 8 points

### Major — User Management & Authentication — 2 pts

Users can manage their accounts and profiles, interact with other users and see their online status.

**Contributors:** Makoon

---

### Minor — OAuth 2.0 — 1 pt

OAuth provides an alternative way to authenticate users through an external identity provider.

**Provider:** Google, GitHub

**Contributors:** Makoon

---

### Major — Advanced Permissions — 2 pts

Different roles have different permissions inside organizations and projects.

**Why we chose it:** a collaborative application needs to control which members can perform administrative or project-related actions.

**Contributors:** Makoon

---

### Major — Organization System — 2 pts

Organizations group users and projects into shared workspaces.

Members can be managed and their permissions can be controlled according to their role.

**Why we chose it:** organizations are at the center of our collaborative dashboard.

**Contributors:** Makoon

---

### Minor — Two-Factor Authentication — 1 pt

2FA adds an additional authentication step to protect user accounts.

**Implementation:** Authenticator app

**Contributors:** Makoon

---

## DevOps — 5 points

### Major — Backend as Microservices — 2 pts

The backend is divided into several services with different responsibilities.

**Why we chose it:** separating the application into services makes the different parts easier to isolate and maintain.

**Implementation:** three Node.js services behind Nginx, orchestrated with Docker Compose: **identity**, **chat** and **workspace**. They share PostgreSQL via Prisma. Inter-service calls use an internal API key and stay on the backend network.

**Contributors:** Eieong

---

### Major — Monitoring System — 2 pts

We use Prometheus and Grafana to monitor the application.

Prometheus collects metrics while Grafana provides dashboards and visualizations.

**Implementation:** Prometheus scrapes `/metrics` on the three services plus **postgres-exporter**. Grafana ships two dashboards: overview (uptime, HTTP traffic, firing alerts) and Postgres. Alert rules: **ServiceDown** and **PostgresDown**.

**Contributors:** Eieong

---

### Minor — Health Check & Status Page — 1 pt

The application provides health checks and a status page showing the state of the different services.

**Why we chose it:** it makes service failures easier to identify.

**Implementation:** each service has a `/health` endpoint. A status page shows whether identity, chat and workspace are up. Backups of the database run automatically.

**Contributors:** Eieong

---

## Data & Analytics — 1 point

### Minor — GDPR Compliance — 1 pt

We implemented features allowing users to have control over their personal data.

These include:

* requesting personal data;
* exporting personal data;
* deleting personal data;
* confirmation before destructive operations.

**Implementation:** GET /profile/export returns the user's personal data as a downloadable payload, excluding passwordHash and twoFactorSecret. Export and account deletion both trigger a confirmation email (nodemailer + Mailhog in dev), and destructive operations require explicit confirmation.

**Contributors:** Camansou

---

# Module Point Calculation

```text
Web                                      10 pts
Accessibility                             2 pts
User Management                           8 pts
DevOps                                    5 pts
Data & Analytics                          1 pt
                                          ─────
TOTAL                                    26 pts
```

---

# Individual Contributions

This section summarizes the concrete work done by each member.

## Sachanai

**Roles:** Developer

**Main contributions:**

* Built the i18n module with react-i18next: the whole app in French, English and Chinese, with a language switcher and the choice saved between sessions. Ten pages plus the shared components — MainLayout, DesignSystem, TaskCard, TaskPanel, OrgaCard, FriendCard — and the status, priority and time helpers.
* Fixed localization bugs found along the way: dates and timestamps stayed in French format whatever the language, presence statuses were hardcoded in French, and TaskPanel called its React hooks in a wrong order.
* Reported the pre-existing bugs found while going through every page, outside this module's scope, so the team could pick them up.

**Main challenge:**

Some text could not simply be wrapped in a translation call. On Chat, the functions that build the messages are declared outside the React component, so they cannot use the translation hook. The legal pages had the same issue, since their content comes from static files rather than the API.

**How it was solved:**

For Chat, the translation function and the active language are passed in as parameters, with a mapping to real locale codes (`cn` had to become `zh-CN`). For the legal pages, one content file per language and a hook that picks the right one. For sentences with bold text inside, react-i18next's `Trans` component.

---

## Camansou

**Roles:** Product Owner, Project Manager, Developer

**Main contributions:**

* Frontend architecture and all UI development (React + Vite + Tailwind, mobile-first)
* Kanban dashboard with drag-and-drop task management (@dnd-kit)
* Reusable design system components (Avatar, Button, Modal, Input, Card, Badge, …)
* Centralized frontend API layer (apiRequest) with progressive mock-to-real wiring
* Notifications display, friends, and organization/project member management UI
* Cross-browser compatibility (Firefox / Chromium / Brave)
* GDPR: personal data export endpoint (GET /profile/export) with confirmation emails
* Product ownership and project management: roadmap, module selection, task distribution

**Main challenge:**

Building the entire frontend before the backend was ready, without blocking the team.

**How it was solved:**

I developed each frontend resource using mock data and a resource-specific `USE_MOCK` flag, allowing the user interface to evolve independently of the backend. As actual endpoints became available, I toggled the flag and connected the resource to the real API via the centralized `apiRequest` utility function, while ensuring consistency between optimistic UI updates and server responses. This approach enabled the team to work in parallel without mutual dependencies and facilitated a gradual integration process.

---

## Eieong

**Roles:** Technical Lead, Developer

**Main contributions:**

* Technical architecture and backend split into microservices (identity, chat, workspace)
* Docker Compose, Nginx reverse proxy and HTTPS
* Makefile (Docker / Podman)
* Internal service-to-service communication
* Health checks, status page and automated database backups
* Prometheus and Grafana monitoring

**Main challenge:**

Splitting a single backend into three services without breaking the frontend, while keeping Docker rebuilds usable.

**How it was solved:**

Services were isolated behind Nginx, with a shared database and an internal API key for calls between them. Dockerfiles and the Makefile were reworked so rebuilds became much faster.

---

## Niclee

**Role:** Developer

**Main contributions:**

* Real-time collaboration with WebSockets (Socket.IO): live updates on the Kanban board (task creation, deletion, drag-and-drop between columns), the organisation and friends pages, and the chat
* Chat feature: backend routes for conversations and messages, read/unread status
* Notification system: task, chat and organisation/project events
* Bug fixes and permission handling around real-time events (redirect to home when a user is kicked from or their organisation/project is deleted, removing task permissions when unassigned) and input validation limits (username, password, organisation, project, task)

**Main challenge:**

Keeping the application state consistent in real time across several connected clients. Since Kanban tasks, organisation membership and chat all needed to update instantly for every affected user, a change made by one member (e.g. being kicked from an organisation, or a task being reassigned) had to be reflected immediately and safely on every other connected client, without breaking permissions or leaving a user on a page they no longer had access to.

**How it was solved:**

Socket.IO rooms were used to scope real-time events per organisation, project and conversation, so updates are only broadcast to the members concerned. Several iterations were needed to fix edge cases (users staying on a page after losing access, stale permissions on tasks, notifications not matching the read/unread state) by refining the socket events and adding redirects and permission checks whenever a user's access changed.

---

## Makoon

**Role:** Developer

**Main contributions:**

* Backend development
* API routing
* Database management (Prisma schema, migrations, seed)
* Authentication (JWT, login, Google OAuth, GitHub OAuth, 2FA)
* Authorization and middleware (permissions, roles)

**Main challenge:**

One of the main challenges was designing the database structure and managing the relationships between users, organizations, projects and tasks. The application contains several connected entities, with many-to-many relationships for organization and project members, as well as different roles and permissions depending on  the context.

The second one is designing a secure and consistent authentication and authorization system while supporting multiple authentication methods, including traditional login, Google OAuth, GitHub OAuth and two-factor authentication.

**How it was solved:**

The database schema was designed using Prisma and carefully defined the relationships between the different models. Junction tables such as Member and ProjectMember were used to handle many-to-many relationships while storing the user's role. Prisma migrations and seed data were used to test and validate the database structure during development.

The authentication system was centralized around JWT-based sessions, with dedicated flows for each authentication method. Middleware was implemented to verify authentication tokens and check user permissions before accessing protected API routes. Roles and permissions were handled at both the organization and project levels. Prisma was used to maintain the relationships between users, organizations, projects and roles.

---

# Instructions

## Prerequisites

The following tools are required:

* Git
* Docker/Podman
* Docker/Podman Compose


**Versions used:**

```text
Docker: 29.4.3
Docker Compose: 5.1.4
Podman: 5.8.4
Podman-compose: 1.6.0
```

---

## Environment

The project uses environment variables for configuration and sensitive information.

Create the local environment file:

```bash
cp .env.example .env
```

Then fill in the required variables:

```text
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
DATABASE_URL
INTERNAL_API_KEY
JWT_SECRET
PORT
APP_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
BACKUP_RETENTION_DAYS
BACKUP_INTERVAL_SECOND
GRAFANA_ADMIN_USER
GRAFANA_ADMIN_PASSWORD
```

The `.env` file must not be committed to the repository.

---

## Installation

Clone the repository:

```bash
git clone [REPOSITORY_URL]
cd ft_transcendence
```

Create the environment file:

```bash
cp .env.example .env
```

Build and start the project:

```bash
make
```

---

## Access

Once the containers are running:

```text
Application: https://localhost:8443
Status page: https://localhost:8443/status
Grafana:     https://localhost:8443/grafana
```

---

# Resources

We mainly used official documentation and technical references while developing the project.

**Frontend**

* React — https://react.dev
* Vite — https://vite.dev
* Tailwind CSS — https://tailwindcss.com/docs
* React Router — https://reactrouter.com
* dnd kit (drag-and-drop) — https://docs.dndkit.com
* i18next / react-i18next — https://www.i18next.com · https://react.i18next.com

**Backend**

* Node.js — https://nodejs.org/docs/latest/api/
* Express — https://expressjs.com
* Passport.js — https://www.passportjs.org
* JSON Web Tokens — https://jwt.io

**Database**

* PostgreSQL — https://www.postgresql.org/docs/
* Prisma — https://www.prisma.io/docs

**Real-time**

* Socket.IO — https://socket.io/docs/v4/

**DevOps & Monitoring**

* Docker — https://docs.docker.com
* Docker Compose — https://docs.docker.com/compose/
* Nginx — https://nginx.org/en/docs/
* Prometheus — https://prometheus.io/docs/
* Grafana — https://grafana.com/docs/

**Authentication providers**

* Google OAuth 2.0 — https://developers.google.com/identity/protocols/oauth2
* GitHub OAuth — https://docs.github.com/en/apps/oauth-apps

We used these resources mainly to understand APIs, authentication, database relations, WebSockets, containerization and monitoring.

## AI Usage

AI tools were used as a support during the project.

We mainly used AI to:

* understand unfamiliar concepts and documentation;
* help debug problems and compare possible solutions;
* brainstorm implementation ideas;
* help with translations;
* improve documentation and wording.

AI-generated answers were always reviewed by the team. We tested the proposed solutions and adapted them to our own code instead of blindly copying them.

Each member remains responsible for understanding and being able to explain the code they contributed.

