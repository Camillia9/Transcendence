Étape 1 — Obtenir les clés OAuth

Google : console.cloud.google.com → Créer un projet → APIs & Services → Identifiants

Configurer l'écran de consentement OAuth
Si Google vous le demande :

Cliquez sur OAuth consent screen.
Choisissez External (si c'est pour un projet étudiant).
Remplissez :
Nom de l'application : Transcendence
Email de support : votre email
Email développeur : votre email

Ajouter les URLs autorisées
Si votre projet tourne en local sur le port 3000 :

Authorized JavaScript origins
http://localhost:3000

Authorized redirect URIs
http://localhost:3000/auth/google/callback

ou
http://localhost:3000/api/auth/google/callback

recup le client ID et le client secret

GitHub : Settings → Developer Settings → OAuth Apps
Aller sur :
https://github.com/settings/developers
OAuth Apps
New OAuth App
Remplir :
Application name : Transcendence
Homepage URL : http://localhost:3000
Authorization callback URL : celle utilisée par votre backend

GitHub vous donnera :

GITHUB_CLIENT_ID=xxxx
GITHUB_CLIENT_SECRET=xxxx

Étape 2 — Installer les dépendances (si Node.js)
npm install passport passport-google-oauth20 passport-github2 jsonwebtoken dotenv

ces paquets servent a mettre en place une authentification dans une application Node.js
passport.js = bibliotheaue qui gere l'authentification. Au lieu de coder soi meme : connextion utilisateur, verification d'identite, OAuth Google/GitHub, gestion des sessions

passport-google-oauth20 = permet a passport d'utiliser la connexion avec google
google demande l'autorisation, renvoie les informations de l'utilisateur, Passsport les recupere

passport-github2 = pareil mais pour github, donc l'utilisateur n'a pas besoin de creer un mdp pour le site

jsonwebtoken = permet de creer et verifier des JWT (JSON Web Tokens)
un JWT est un jeton qui contient l'identite de l'utilisateur.
le serveur verifie le token au lieu de redemander un mot de passe

dotenv = permet de charger des variables depuis un fichier .env. cela evite de mettre les secrets directement dans le code source


google strategy

Utilisateur
      │
      │
Clique sur "Connexion Google"
      │
      ▼
Google vérifie son identité
      │
      ▼
Google renvoie son profil
      │
      ▼
Récupération de son email
      │
      ▼
Recherche dans la base de données
      │
      ├───────────────► Utilisateur trouvé
      │                     │
      │                     ▼
      │               Génération du JWT
      │                     │
      │                     ▼
      │               Connexion terminée
      │
      ▼
Utilisateur introuvable
      │
      ▼
Création d'une organisation
      │
      ▼
Création du compte utilisateur
      │
      ▼
Création du lien utilisateur ↔ organisation
      │
      ▼
Génération du JWT
      │
      ▼
Connexion terminée


auth.routes.js
ce fichier ne gère pas lui-même la connexion à Google : il délègue cette tâche à Passport. Son rôle est de définir les routes, lancer l'authentification Google, récupérer le résultat via le callback, renvoyer un JWT et les informations essentielles de l'utilisateur au front, puis fournir une route de déconnexion qui, dans une architecture basée sur les JWT, consiste simplement à informer le client de supprimer le token qu'il stocke.
Utilisateur
      │
      │ GET /auth/google
      ▼
Express
      │
      ▼
Passport
      │
      ▼
Google (page de connexion)
      │
      │ L'utilisateur accepte
      ▼
Google redirige vers
/auth/google/callback
      │
      ▼
Passport vérifie l'identité
      │
      ▼
Création ou récupération de l'utilisateur
      │
      ▼
Génération d'un JWT
      │
      ▼
Le serveur renvoie :
{
  token,
  user
}
      │
      ▼
Le front stocke le token (par exemple dans `localStorage`)
      │
      ▼
Pour chaque requête protégée, le front envoie ce token dans l'en-tête `Authorization: Bearer <token>`.


organisation.routes.js
Ce code permet de mettre en place un système d'invitation à une organisation. Il y a deux étapes :
1. Un administrateur envoie une invitation par e-mail.
2. Le destinataire clique sur le lien pour rejoindre l'organisation.


A CORRIGER
Dans ce code, il y a une incohérence à corriger : la route de validation utilise req.user.id, ce qui suppose que l'utilisateur est déjà authentifié lorsque le lien d'invitation est ouvert. Or un destinataire peut cliquer sur le lien sans être connecté. En pratique, il faut soit protéger cette route avec un middleware d'authentification et demander à l'utilisateur de se connecter avant de rejoindre l'organisation, soit intégrer un flux où le lien d'invitation mène d'abord à une page de connexion ou d'inscription, puis utilise le token pour finaliser l'ajout à l'organisation.


JWT
Qui est connecté ?

authenticate
Le token est-il valide ?

loadMembership
Dans quelle organisation est-il ?
Quel est son rôle ?

checkPermission
Ce rôle peut-il faire cette action ?

Route
Que faut-il faire ?


Ce middleware fait exactement ça :
1. lire Authorization header
2. vérifier format Bearer
3. extraire le token
4. vérifier le JWT
5. décoder userId
6. stocker dans req.user
7. continuer la requête


1. Les JWT sont isolés dans un utilitaire

generateToken()
verifyToken()

C'est exactement ce qu'on fait généralement. Si un jour tu changes la durée d'expiration ou la clé, tu n'as qu'un seul fichier à modifier.

2. La GoogleStrategy ne s'occupe que de l'authentification Google

Elle fait uniquement son travail :

récupérer le profil Google ;
chercher l'utilisateur ;
le créer si besoin ;
générer un JWT ;
appeler done().

Elle ne vérifie pas les permissions ni les rôles, ce qui est une bonne séparation des responsabilités.

3. Le middleware authenticate est indépendant

authenticate

ne sait pas si le token provient :

d'un login classique ;
d'un login Google ;
d'un login GitHub (plus tard).

Il vérifie seulement que le JWT est valide.

C'est exactement le but d'un middleware d'authentification.

4. loadMembership est également bien séparé

L'authentification répond à :

Qui est l'utilisateur ?

Puis loadMembership répond à :

Quel est son rôle dans cette organisation ?

Enfin checkPermission répond à :

A-t-il le droit de faire cette action ?

Cette séparation est très propre.

⚠️ Les points que je corrigerais

2. Le contenu du JWT

Aujourd'hui tu mets uniquement

{
    userId
}

C'est très bien.

J'éviterais d'y mettre :

le rôle ;
l'organisation.

Pourquoi ?

Parce qu'un utilisateur peut changer de rôle sans se reconnecter.

Avec ton système actuel :

JWT
      ↓
authenticate
      ↓
loadMembership
      ↓
lecture du rôle dans la base

les permissions sont toujours à jour.

Je trouve cette approche meilleure.

3. Générer le token dans la Strategy

Personnellement, je déplacerais cette partie.

Au lieu de :

GoogleStrategy

↓
generateToken()

↓
done()

je ferais plutôt :

GoogleStrategy

↓

done(user)

↓

route callback

↓

generateToken(user)

↓

res.json({ token })

Pourquoi ?

Parce que la Strategy sert uniquement à dire :

"Google m'a authentifié cet utilisateur."

La décision de créer un JWT appartient davantage à ta route.

Mais ce n'est pas une erreur de le faire dans la Strategy, c'est surtout une question d'architecture.


Mon avis global

Je dirais que ton architecture ressemble à ceci :

jwt.utils
    │
    ├── crée et vérifie les JWT

GoogleStrategy
    │
    ├── authentifie avec Google

authenticate
    │
    ├── vérifie le JWT

loadMembership
    │
    ├── récupère le rôle dans l'organisation

checkPermission
    │
    └── vérifie les droits




Utilisateur
    |
    ├── appartient à une ou plusieurs organisations
    |
    └── participe à des projets
              |
              └── possède des tâches


Permissions organisation
Pour :
inviter un membre ;
modifier l'organisation ;
changer les rôles.

Permissions projet
Pour :
modifier une tâche ;
supprimer un projet ;
assigner une tâche.

Utilisateur
    |
    | appartient à
    |
Organisation(s)

Utilisateur
    |
    | participe à
    |
Projet
    |
    | contient
    |
Tâches

Un utilisateur peut donc :
appartenir à l'organisation A ;
appartenir aussi à l'organisation B ;
participer à un projet créé par quelqu'un d'une autre organisation.

Donc ton architecture actuelle :
✅ utilisateurs multi-organisations
✅ projets collaboratifs
✅ membres de projet indépendants des organisations
✅ permissions au niveau projet
✅ tâches liées aux projets

Les prochaines améliorations naturelles seraient :
remplacer status par des listes ;
ajouter l'invitation d'utilisateurs à un projet ;
ajouter les commentaires sur les tâches ;
ajouter les labels/priorités ;
ajouter un historique des modifications.


avatar(URL de l'image de profil c'est optionnel)

Un utilisateur peut :
appartenir à plusieurs organisations
être assigné à plusieurs tâches
envoyer plusieurs messages
recevoir plusieurs notifications

Une organisation possède plusieurs projets.

Chaque projet appartient à une organisation.

position -> pour le kanban pour deplacer les taches 

Chaque projet possède un chat.

schema prisma
model Project {
  id             Int           @id @default(autoincrement())
  title          String
  description    String?
  colour         String?

  organisationId Int
  organisation   Organisation @relation(fields: [organisationId], references: [id])

  tasks          Task[]
  conversation   Conversation?
}


Le schéma complet
                    Organisation
                         │
         ┌───────────────┴───────────────┐
         │                               │
      Project                        Member
         │                               │
         │                               │
         │                            User
         │                          /  |   \
         │                         /   |    \
         │                        /    |     \
      Conversation          Assignment Message Notification
            │                  │
            │                  │
         Message             Task



schema.prisma

installation avec npm install prisma @prisma/client
puis npx prisma init (si le dossier prisma n'existe pas encore)
sinon npx prisma generate (si le dossier prisma existe deja)

generator client {
      provider = "prisma-client-js"
      }
genere le package @prisma/client utiliser dans le code Node.js

datasource db {
      provider = "postgresql"
      url = env("DATABASE_URL")
      }
indique que la base est PostgreSQL et que l'URL vient de la variable d'environnement DATABASE_URL

enum permet de limiter les valeurs possibles

model = table
model User {
      id Int @id @default(autoincrement()) 
      pseudo String 
      email String @unique 
      createdAt DateTime @default(now()) 
      }
revient a ecrire
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  pseudo TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

@id = clé primaire
@default(autoincrement()) = auto-incrément
@default(now()) = date actuelle
@unique = valeur unique
String? = champ nullable
DateTime? = champ nullable

les relations
orgId Int 
organisation Organisation 
@relation(fields: [orgId], references: [id], onDelete: Cascade)
Cela signifie :
la table Projet possède une colonne orgId,
orgId référence Organisation.id,
onDelete: Cascade = si l’organisation est supprimée, ses projets le sont aussi.

les relations plusieurs a plusieurs
model Assignation { 
      userId Int 
      tacheId Int 
      @@id([userId, tacheId]) 
      }

  @@id([userId, taskId]) cree une cle primaire composite
un user ne peut etre assigner qu'une seule foi a une tache

les relations optionnelles
projetId Int? 
projet Projet? 
@relation(fields: [projetId], references: [id], onDelete: SetNull)
Une conversation peut exister sans projet.
Si le projet est supprimé, projetId devient NULL au lieu de supprimer la conversation.

model Message {
  id             Int      @id @default(autoincrement())
  contenu        String
  userId         Int
  conversationId Int
  createdAt      DateTime @default(now())

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}
user User
Le message est lié à un User

fields: [userId]
La colonne locale utilisée est userId

references: [id]
Cette colonne pointe vers User.id

onDelete: Cascade
Si l’utilisateur est supprimé, ses messages sont supprimés

Message.userId pointe vers User.id
references: [id] signifie « La valeur de userId doit correspondre à la colonne id du modèle User. »



organisation et user relation many to many
un utilisateur peut appartenir a plusieurs organisations, et une organisation peut avoir plusieurs utilisateurs
donc il faut une table entre les 2 (ici member) qui va stocker userId, orgId et role

si on avait mis userId direct dams organisation, ca veut dire que une organisation n'a qu'un seul utilisateur

on aurait pu faire users User[] pour que Prisma cree une table de liaison automatique mais il manquerait le role donc obliger de faire une table member



model Member {
  userId  Int
  orgId   Int
  Role    Role  @default(User)

  user    User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  organisation  Organisation  @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@id([userId, orgId])
// un user ne peut etre membre qu'une fois par org
}
pas besoin de rajouter id Int @id @default(autoincrement()) car la cle primiaire est userId + orgId
@@id([userId, orgId]) signifie : La combinaison de userId et orgId identifie une ligne de manière unique.

model User{
      createdTasks Task[] @relation("TaskCreator")
}
model Task{
createdBy User @relation(
  "TaskCreator",
  fields: [createdById],
  references: [id]
) 
}
fields: [createdById], -> field = le nom qu'on va donner au champ qu'on va prendre dans Task
references: [id] -> reference = la variable qu'on va recup dans User

exemple de friends
on est obliger de mettre @relation("UserFriends") car on a une relation entre le meme modele User 2 fois (relation User -> User, relation entre 2 lignes de la meme table) et prisma ne sait pas faire la difference
friends User[]
friendOf User[]

prisma a besoin d'un cote inverse pour les relations implicites many to many auto referencer 
@relation("UserFriends") sert a dire a prisma que ces deux relations pointent vers la même table User mais représentent deux rôles différents"

si par ex, on ecrit
model User {
  ...
  friends Friend[]
}
model Friend {
  id       Int @id @default(autoincrement())
  userId   Int
  friendId Int

  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  friend User @relation(fields: [friendId], references: [id], onDelete: Cascade)

  @@unique([userId, friendId])
}
ya 2 relations qui vont de Friend vers User
pour prisma, ca veut dire :
Friend.user     ---> User
Friend.friend   ---> User
2 liens differents vers User, mais dans User on a que friends Friend[]
donc prisma se demande si le tableau friends correspond à Friend.user ou à Friend.friend
la table Friend contient deux clés étrangères
Friend
----------------
id
userId    ---> User.id
friendId  ---> User.id
Donc PostgreSQL sait qu'il y a deux liens vers User


a chaque changement : format puis validate (puis migrate reset si les donnees de la db pas utile et on peut les remettre avec le seed) puis migrate dev --name puis generate puis seed puis npx prisma studio
deja verifier que postgre est lancer avec docker ps
puis si pas lancer mettre make start

npx prisma format -> pour mettre au format
npx prisma validate -> pour voir si le schema prisma est valid 

npx prisma db pull -> sert a lire une base existante et a generer le schema prisma a partir de ses tables

npx prisma dev -> commande sert à lancer Prisma Postgres local (le service prisma+postgres://...)

npx prisma migrate dev --name init -> synchronise la database avec mon schema prisma

podman compose exec backend npx prisma migrate dev --name update_schema -> va generer que les changements necessaire 
mettre podman compose exec backend a partir de Transcendence car l'url est dans le .env du dossier et pas dans le back

npx prisma generate -> regenerer le client apres la migration ou a chaque modification du schema prisma

npx prisma migrate reset -> reinitalise la base

npx prisma db seed -> lance le seed

npx prisma db push -> quand on veut juste appliquer le schema a la base mais pas d'historique
npx prisma migrate dev --name nom_de_ta_migration -> on cree une migration qui permettra d'avoir un suivi des changement sur le schema

npx prisma studio -> va lancer prisma studio pour voir les tables

a installer
npm install -D ts-node
ts-node =  un outil qui permet d'exécuter directement des fichiers TypeScript (.ts) sans devoir les compiler manuellement en JavaScript avant. Car Node comprend JavaScript (.js), pas TypeScript (.ts).
on devrait faire sinon tsc prisma/seed.ts qui genere seed.js puis faire node seed.js



npx prisma db seed -> pour lancer le seed

a installer pour que prisma saches comment se connecter a PostreSQL
npm install @prisma/adapter-pg


Un middleware peut faire plusieurs choses avant que la requête arrive à la route :
vérifier quelque chose (authentification, permissions, validation, etc.) ;
modifier la requête (req) ;
modifier la réponse (res) ;
arrêter la requête en renvoyant une erreur ;
ou laisser passer avec next().


met un try/catch si requete prisma plante car async et peut echouer

ex de fake database
const fakeDB = {
  users: [],      // { id, pseudo, email, passwordHash, avatar, createdAt }
  orgs: [],       // { id, orgName, createdAt }
  orgMembers: [],    // { userId, orgId, role (admin | member) }
  projets: [],    // { id, name, description, createdBy, createdAt }
  invitations: [], // { id, email, orgId, token, createdAt, expireAt }
  projectMembers: [], // { projectId, userId, role (manager | user) }
  tasks: []        // { id, projectId, title, description, createdBy (createur), createdAt, assignedTo (optionnel), status (todo/doing/done), dueDate}
};

Parcours le tableau fakeDB.membres et retourne le premier membre dont le userId est égal à l'identifiant (id) de l'utilisateur trouvé précédemment. Si aucun utilisateur n'a été trouvé (user vaut undefined), alors user?.id renvoie simplement undefined au lieu de provoquer une erreur.
let user = fakeDB.users.find(u => u.email === email);

pour creer user
const userId = newId();
fakeDB.users.push({ id: userId, pseudo, email, passwordHash: null, avatar, createdAt: new Date() });

supprimer mon organisation et donc de ses membres aussi
//remplace l'ancien tableau par le tableau sans celui rechercher
fakeDB.orgs = fakeDB.orgs.filter(o => o.id !== req.orgId);
fakeDB.orgMembers = fakeDB.orgMembers.filter(m => m.orgId != req.orgId);

voir les membres d'une organisation
const membres = fakeDB.orgMembers
    .filter(m => m.orgId === req.orgId)
    // map() parcourt chaque membre, puis avec find() va rechercher a l'interieur le user pour recuperer ses infos
    .map(m => {
        const user = fakeDB.users.find(u => u.id === m.userId);
        if (!user)
            return n
        return {
            id: user.id,
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


voir toutes les projets accessibles par l'utilisateur
const projectIds = fakeDB.projectMembers
    .filter(pm => pm.userId === req.user.userId)
    .map(pm => pm.projectId);
const projects = fakeDB.projets.filter(p => projectIds.includes(p.id));


voir une task precise
const task = fakeDB.tasks.find(
    t =>
        t.id === Number(req.params.taskId) &&
        t.projectId === Number(req.params.projectId)
);


comportement de drag & drop :
✅ on ne peut pas réordonner les tâches dans une même colonne ;
✅ lorsqu'une tâche change de colonne, elle est toujours ajoutée à la fin de la nouvelle colonne ;
mais on ne peut pas déplacer une tâche à n'importe quelle position dans une colonne ou entre colonnes.


double authentification
on doit installer : npm install otplib qrcode
otplib : genere les secrets et verifie les codes
qrcode : transforme le secret en QR code

voir si ca marche avec la derniere version de chrome
F12 ou ctrl + shift + I 
puis console, ne pas voir de rouge sur javascript
et network pour voir si ya des erreurs
Ctrl + shift + M pour voir si c'est responsive, ca va changer la taille d'ecran


register : pas de 2FA
login : pas de 2FA
si on veut le 2FA, le user doit activer l'option dans ses parametres et a la prochaine co, il y aura
si on veut github + 2FA par ex, on github va authentifier le user, puis on va faire le 2FA puis generate token
workflow
login
↓

2FA activée ?

↓

oui
↓

renvoie
{
   twoFactorRequired: true
}

↓

frontend demande le code

↓

/auth/login/2fa

↓

JWT



Utilisateur normal sans 2FA
POST /auth/login

password OK
↓
JWT
↓
connexion

Utilisateur avec 2FA
POST /auth/login

password OK
↓
twoFactorRequired:true
↓
POST /auth/login/2fa

code TOTP OK
↓
JWT
↓
connexion


Google/GitHub avec 2FA

Google/GitHub OAuth
↓
user trouvé
↓
twoFactorEnabled ?
        oui
        ↓
twoFactorRequired:true
        ↓
/auth/login/2fa
        ↓
JWT


La bonne solution avec les WebSockets

Tu as déjà besoin des WebSockets pour :

le chat,
les parties de Pong,
éventuellement les notifications en direct.

Tu peux donc les utiliser aussi pour la présence.

1. L'utilisateur change son statut

Le front appelle :

PATCH /users/me/status

Le backend :

met à jour la base :
status = "Busy"
puis envoie un événement WebSocket :
{
    "type": "user_status_changed",
    "userId": 5,
    "status": "Busy"
}

Tous les amis connectés reçoivent l'événement.

Leur interface met immédiatement à jour :

🟢 Nico

↓

🔴 Nico

sans recharger la page.

2. L'utilisateur se connecte

À la connexion du WebSocket :

isOnline = true

Puis le serveur envoie :

{
    "type": "user_online",
    "userId": 5
}

Les amis voient apparaître le point vert.

3. L'utilisateur ferme son navigateur

Le WebSocket déclenche :

isOnline = false

Puis le serveur envoie :

{
    "type": "user_offline",
    "userId": 5
}

Tous les amis mettent immédiatement à jour l'affichage.

Pourquoi séparer isOnline et status ?

Parce que ce sont deux informations différentes.

Exemple :

Nico

peut être

🟢 Occupé

ou

🟢 Absent

mais aussi

⚫ Hors ligne

Le statut "Busy" n'est pas remplacé par "Online" : il décrit la disponibilité, tandis que isOnline décrit la connexion.

Le front décide ensuite quoi afficher.

Par exemple :

if (!user.isOnline)
    afficher("⚫ Hors ligne");
else if (user.status === "Busy")
    afficher("🔴 Occupé");
else if (user.status === "Away")
    afficher("🟡 Absent");
else
    afficher("🟢 En ligne");