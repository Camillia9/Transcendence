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
* Public API
* Multilingual interface
* Custom design system
* Microservices architecture
* Health checks and status page
* Prometheus & Grafana monitoring
* GDPR features

---

# Team Information

We worked as a team of five. Alongside development, we shared project responsibilities such as product management, project management and technical coordination.


### Mary-line

**Role:** Developer

Responsible for:

* backend et database


### Camillia

**Roles:** Product Owner, Project Manager, Developer

Responsible for:

* Product planning and priorities
* Project organization
* Frontend development
* Dashboard and UI components
* Internationalization

### Emmanuel

**Roles:** Technical Lead, Developer

Responsible for:

* Technical decisions and architecture
* Backend microservices
* Docker, Nginx and Makefile
* Monitoring, health checks and backups

### Nicolas

**Role:** Developer

Responsible for:

* [Features / modules — TO COMPLETE]

### Sarah

**Roles:** Product Owner, Project Manager, Developer

Responsible for:

* Product planning and priorities
* Project organization
* [Development responsibilities — TO COMPLETE]

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

**[EXACT FRONTEND TECHNOLOGY — TO COMPLETE]**

Used to build the dashboard, pages and reusable interface components.

The frontend communicates with the backend through the API and WebSockets and also handles the multilingual interface.

---

## Backend

**[EXACT BACKEND TECHNOLOGY — TO COMPLETE]**

Used for the application logic, authentication, permissions, API endpoints, database access and communication between services.

---

## Database

**PostgreSQL**

We chose PostgreSQL because our application contains many relationships between users, organizations, projects, tasks and other resources.

A relational database fits this structure well and helps keep the data consistent.

---

## Prisma

**Prisma** is used as our ORM between the backend and PostgreSQL.

It allows us to define the database schema and access related data from the application in a structured way.

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
                         │   Frontend   │
                         └──────┬───────┘
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
          ┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼─────┐
          │    User    │ │   Project  │ │   Other    │
          │  Service   │ │   Service  │ │  Services  │
          └──────┬─────┘ └──────┬─────┘ └──────┬─────┘
                 │              │              │
                 └──────────────┼──────────────┘
                                │
                         ┌──────▼───────┐
                         │  PostgreSQL  │
                         └──────────────┘

                    Prometheus → Grafana
```

> The diagram should be adjusted with the exact services and communication paths used in the final version of the project.

---

# Database Schema

TaskBoard uses **PostgreSQL** with **Prisma**.

The main relationships are based around users and collaborative workspaces:

```text
User
 │
 ├──── Organization
 │          │
 │          └──── Project
 │                    │
 │                    └──── Task
 │
 ├──── Notification
 │
 └──── User relationships
```

### Main entities

* **User** — application users and their account/profile information.
* **Organization** — shared workspaces containing members and projects.
* **Project** — projects belonging to an organization.
* **Task** — pieces of work belonging to a project.
* **Notification** — notifications associated with users.
* **[Other entities — TO COMPLETE]**

For the final version, the complete Prisma schema / ER diagram should be included here, with the main fields, data types and relationships.

---

# Features

## Authentication & User Management

Users can create and manage their accounts and profiles.

The application also provides user interaction features such as profiles, friends and online status.

**Contributors:** [TO COMPLETE]

---

## OAuth & 2FA

OAuth provides an alternative authentication method using an external identity provider.

Two-factor authentication adds an additional security step to user accounts.

**OAuth provider:** [TO COMPLETE]

**Contributors:** [TO COMPLETE]

---

## Organizations & Permissions

Organizations provide a shared workspace for several users.

Members have different permissions depending on their role. This controls which actions they can perform on organizations, projects and other resources.

**Contributors:** [TO COMPLETE]

---

## Projects & Tasks

Projects and tasks are the main organizational part of TaskBoard.

Users can create and manage projects and tasks and assign work to members according to their permissions.

**Contributors:** Cam, Marylin, [TO COMPLETE]

---

## Chat & User Interaction

Users can interact through:

* profiles;
* friends;
* online status;
* chat.

These features allow TaskBoard to be used as a collaborative workspace rather than only as a task tracker.

**Contributors:** [TO COMPLETE]

---

## Real-Time Collaboration

WebSockets are used to synchronize relevant changes between connected users.

This means that users can receive updates without manually refreshing the application.

**Contributors:** [TO COMPLETE]

---

## Notifications

The notification system informs users about relevant events happening in the application.

**Contributors:** [TO COMPLETE]

---

## Public API

TaskBoard provides a public API that can be used by external clients.

The API includes:

* secured API key authentication;
* rate limiting;
* API documentation;
* at least five endpoints;
* several HTTP methods.

### Main endpoints

```text
GET     /api/[endpoint]
POST    /api/[endpoint]
PUT     /api/[endpoint]
DELETE  /api/[endpoint]
...
```

**Exact endpoints:** [TO COMPLETE]

**Contributors:** [TO COMPLETE]

---


## Custom Design System

We created reusable UI components to keep the interface consistent across the application.

The design system currently includes at least ten reusable components:

1. Button
2. Card
3. Input
4. [Component]
5. [Component]
6. [Component]
7. [Component]
8. [Component]
9. [Component]
10. [Component]

**Contributors:** Cam [TO COMPLETE]

---

# Chosen Modules

We chose modules that fit naturally with the idea of a collaborative project management platform.

According to the subject, a **Major is worth 2 points** and a **Minor is worth 1 point**.

Our selected modules give us a total of **27 points**.

---

## Web — 12 points

### Major — Framework for frontend and backend — 2 pts

We use frameworks for both the frontend and backend to structure the application and its different services.

**Why we chose it:** it provides a clear structure for a large web application and makes it easier to separate responsibilities.

**Implementation:** [EXACT FRAMEWORKS — TO COMPLETE]

**Contributors:** [TO COMPLETE]

---

### Major — WebSockets — 2 pts

We use WebSockets for real-time communication between connected users.

**Why we chose it:** collaborative features are much more useful when updates are visible immediately.

**Implementation:** real-time events are sent to connected clients when relevant changes occur.

**Contributors:** [TO COMPLETE]

---

### Major — User Interaction — 2 pts

This module is implemented through user profiles, friends, online status and chat.

**Why we chose it:** TaskBoard is designed around collaboration between users.

**Contributors:** [TO COMPLETE]

---

### Major — Public API — 2 pts

The application exposes a public API with secured API keys, rate limiting, documentation and multiple endpoints using different HTTP methods.

**Why we chose it:** it allows external clients to interact with TaskBoard without depending directly on the frontend.

**Contributors:** [TO COMPLETE]

---

### Minor — Prisma ORM — 1 pt

Prisma is used to manage the PostgreSQL database from the backend.

**Why we chose it:** it makes database access and relations easier to maintain.

**Contributors:** [TO COMPLETE]

---

### Minor — Notification System — 1 pt

The application provides notifications for relevant actions.

**Why we chose it:** users should be informed about important changes without having to constantly check every project.

**Contributors:** [TO COMPLETE]

---

### Minor — Real-Time Collaborative Features — 1 pt

Real-time updates allow several connected users to see relevant changes without refreshing the page.

**Why we chose it:** it improves the collaborative experience of the dashboard.

**Contributors:** [TO COMPLETE]

---

### Minor — Custom Design System — 1 pt

We created our own reusable UI components and a common visual style.

**Why we chose it:** using shared components keeps the interface consistent and avoids duplicated code.

**Contributors:** Camillia, Sarah

---

## Accessibility — 1 point

### Minor — Multiple Languages — 1 pt

The application supports three languages: English, French and Chinese.

**Why we chose it:** we wanted the application to be usable by people with different language preferences.

**Implementation:** i18n system + language switcher.

**Contributors:** Sarah

---

## User Management — 8 points

### Major — User Management & Authentication — 2 pts

Users can manage their accounts and profiles, interact with other users and see their online status.

**Contributors:** [TO COMPLETE]

---

### Minor — OAuth 2.0 — 1 pt

OAuth provides an alternative way to authenticate users through an external identity provider.

**Provider:** [TO COMPLETE]

**Contributors:** [TO COMPLETE]

---

### Major — Advanced Permissions — 2 pts

Different roles have different permissions inside organizations and projects.

**Why we chose it:** a collaborative application needs to control which members can perform administrative or project-related actions.

**Contributors:** [TO COMPLETE]

---

### Major — Organization System — 2 pts

Organizations group users and projects into shared workspaces.

Members can be managed and their permissions can be controlled according to their role.

**Why we chose it:** organizations are at the center of our collaborative dashboard.

**Contributors:** [TO COMPLETE]

---

### Minor — Two-Factor Authentication — 1 pt

2FA adds an additional authentication step to protect user accounts.

**Implementation:** [TO COMPLETE]

**Contributors:** [TO COMPLETE]

---

## DevOps — 5 points

### Major — Backend as Microservices — 2 pts

The backend is divided into several services with different responsibilities.

**Why we chose it:** separating the application into services makes the different parts easier to isolate and maintain.

**Implementation:** three Node.js services behind Nginx, orchestrated with Docker Compose: **identity**, **chat** and **workspace**. They share PostgreSQL via Prisma. Inter-service calls use an internal API key and stay on the backend network.

**Contributors:** Emmanuel

---

### Major — Monitoring System — 2 pts

We use Prometheus and Grafana to monitor the application.

Prometheus collects metrics while Grafana provides dashboards and visualizations.

**Implementation:** Prometheus scrapes `/metrics` on the three services plus **postgres-exporter**. Grafana ships two dashboards: overview (uptime, HTTP traffic, firing alerts) and Postgres. Alert rules: **ServiceDown** and **PostgresDown**.

**Contributors:** Emmanuel

---

### Minor — Health Check & Status Page — 1 pt

The application provides health checks and a status page showing the state of the different services.

**Why we chose it:** it makes service failures easier to identify.

**Implementation:** each service has a `/health` endpoint. A status page shows whether identity, chat and workspace are up. Backups of the database run automatically.

**Contributors:** Emmanuel

---

## Data & Analytics — 1 point

### Minor — GDPR Compliance — 1 pt

We implemented features allowing users to have control over their personal data.

These include:

* requesting personal data;
* exporting personal data;
* deleting personal data;
* confirmation before destructive operations.

**Implementation:** [TO COMPLETE]

**Contributors:** [TO COMPLETE]

---

# Module Point Calculation

```text
Web                                      12 pts
Accessibility                             1 pt
User Management                           8 pts
DevOps                                    5 pts
Data & Analytics                          1 pt
                                          ─────
TOTAL                                    27 pts
```

---

# Individual Contributions

This section summarizes the concrete work done by each member.

## Sarah

**Roles:** Product Owner, Project Manager, Developer

**Main contributions:**

* [TO COMPLETE]
* [TO COMPLETE]
* [TO COMPLETE]

**Main challenge:**

[TO COMPLETE]

**How it was solved:**

[TO COMPLETE]

---

## Camillia

**Roles:** Product Owner, Project Manager, Developer

**Main contributions:**

* Frontend development
* Dashboard
* Reusable UI components
* i18n
* [TO COMPLETE]

**Main challenge:**

[TO COMPLETE]

**How it was solved:**

[TO COMPLETE]

---

## Emmanuel

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

## Nicolas

**Role:** Developer

**Main contributions:**

* [TO COMPLETE]
* [TO COMPLETE]
* [TO COMPLETE]

**Main challenge:**

[TO COMPLETE]

**How it was solved:**

[TO COMPLETE]

---

## Mary-line

**Role:** Developer

**Main contributions:**

* Frontend development
* Dashboard pages
* i18n integration
* English / French / Chinese translations
* Language switcher
* Reusable UI components
* [TO COMPLETE]

**Main challenge:**

[TO COMPLETE]

**How it was solved:**

[TO COMPLETE]

---

# Instructions

## Prerequisites

The following tools are required:

* Git
* Docker
* Docker Compose
* [Other requirements — TO COMPLETE]

**Versions used:**

```text
Docker: [VERSION]
Docker Compose: [VERSION]
[Other: VERSION]
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
[LIST REQUIRED VARIABLES — TO COMPLETE]
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

* React / frontend framework documentation
* Backend framework documentation
* PostgreSQL documentation
* Prisma documentation
* Docker documentation
* WebSocket / Socket.IO documentation
* Prometheus documentation
* Grafana documentation
* OAuth documentation
* [Other documentation actually used by the team]

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

