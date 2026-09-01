# Plan de test — TaskBoard (ft_transcendence)

Checklist de validation avant évaluation. Coche au fur et à mesure. Chaque `[ ]` est un test concret à faire à la main.

---

## Comment utiliser ce plan

**Setup avant de commencer :**
- [ ] Repartir d'une **base fraîchement seedée** (`make fclean` + `make` + seed si besoin d'un état propre)
- [ ] Ouvrir **deux sessions en parallèle** : un navigateur normal **+** une fenêtre privée (ou deux navigateurs). C'est indispensable pour tout ce qui est temps réel / multi-user.
- [ ] Sur les **deux** sessions : DevTools ouvert, onglet **Console**, **Preserve log** activé. **Aucune erreur rouge ne doit apparaître** pendant les tests — c'est une règle de rejet du sujet.
- [ ] Garder **Mailhog** ouvert (`http://localhost:8025`) pour les tests RGPD.
- [ ] Faire au moins une passe complète sur **Chrome** (navigateur imposé).

**Ordre conseillé :** fais d'abord la section « Rejet automatique », puis « Multi-user & temps réel » — ce sont les deux qui coulent un projet entier. Le reste page par page ensuite.

---

## 🚨 Rejet automatique (à sécuriser en priorité)

Ces points font **rejeter tout le projet**, indépendamment des modules.

- [ok] Le projet se lance avec **une seule commande** (`make`)
- [non] **Aucune erreur ni warning** dans la console navigateur, sur toutes les pages
- [ok] **Aucun crash** de conteneur pendant l'usage (`podman ps -a` → tous `Up`, pas de `Exited`/`Restarting`)
- [ok] Page **Privacy Policy** accessible (footer) avec du contenu réel, pas un placeholder
- [ok] Page **Terms of Service** accessible (footer) avec du contenu réel
- [ok] Toutes les connexions passent en **HTTPS** (localhost:8443)
- [ok] `.env` bien **gitignore**, `.env.example` présent dans le repo
- [ok] Frontend **responsive** : redimensionner la fenêtre + tester en vue mobile (DevTools device toolbar)
- [ ] Chaque formulaire est **validé côté front ET côté back** (voir tests par page)

---

## 🔄 Multi-user & temps réel (le point critique 42)

À faire avec **deux comptes connectés en même temps**. Le sujet exige que le temps réel fonctionne « là où c'est pertinent » et qu'il n'y ait **aucune corruption de données** en cas d'actions concurrentes.

- [ok] Deux users peuvent être **connectés et actifs en même temps** sans conflit
- [~] **Kanban** : user A déplace/crée/modifie une tâche → user B (même projet) le voit **en direct** sans refresh
- [ok] **Chat** : message de A → apparaît en direct chez B
- [ok] **Notifications** : action de A concernant B → notif temps réel chez B
- [ok] **Statut en ligne** : A se connecte/déconnecte → B voit le statut changer
- [?] **Déconnexion/reconnexion** : couper une session (fermer l'onglet) et rouvrir → l'état se resynchronise proprement, pas de doublon ni de socket zombie
- [ok] **Actions concurrentes** : A et B agissent sur la même tâche/ressource quasi simultanément → pas d'incohérence ni de crash
- [ok] Rafraîchir une page pendant une session active → l'état est correctement rechargé depuis le back

> Note : suppression d'orga reflétée en direct et commentaire propagé à l'admin sans refresh étaient des **gaps connus**. Vérifie leur état, mais ce ne sont pas des bloquants du module tant que board + chat + notifs + présence sont bien live.

---

## 🔐 Login / SignUp

**SignUp — cas nominal**
- [ok] Inscription d'un nouveau user valide → compte créé + connecté/redirigé
- [ok] Le pseudo et l'email s'enregistrent correctement (vérifier en base ou via export RGPD)

**SignUp — validation front**
- [ok] Champs vides → message d'erreur, pas de soumission
- [ok] Email au format invalide → refusé
- [ok] Mot de passe trop faible/court (selon tes règles) → refusé
- [~] Pseudo déjà pris → message clair
- [~] Email déjà utilisé → message clair

**SignUp — validation back (contourner le front)**
- [~] Envoyer une requête invalide directement (curl/console) → le **back refuse aussi** (pas seulement le front)

**Login**
- [ok] Identifiants valides → connexion + redirection
- [ok] Mauvais mot de passe → erreur affichée, pas de crash
- [ok] User inexistant → erreur
- [ok] Se déconnecter → token effacé, redirection vers login
- [ok] Rafraîchir en étant connecté → reste connecté (token persistant)
- [ok] Accéder à une route protégée sans être connecté → redirigé vers login

**2FA (si activée sur le compte)**
- [ok] Login sur un compte 2FA → déclenche `twoFactorRequired` (demande le code)
- [ok] Bon code → connexion réussie
- [NON] Mauvais code → refusé, pas de connexion

**OAuth**
- [~] Login **Google** → compte créé/lié, connexion réussie
- [~] Login **GitHub** → compte créé/lié, connexion réussie
- [OK] User OAuth **sans email** (`email` null) → ne casse rien ailleurs (notifs, RGPD, profil)

ERR CONSOLE: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render. react-dom_client.js:2634:138

Too many calls to Location or History APIs within a short timeframe. chunk-KS7C4IRE.mjs:329:19
Erreur OAuth: DOMException: The operation is insecure.

**Divers**
- [?] Les boutons dans les formulaires ont `type="button"` là où il faut → **pas de reload sauvage** de la page
- [~] i18n : changer de langue sur Login → **toutes** les chaînes se traduisent (page de référence) 
- [~] Console propre sur toute la séquence

Console error lorsqu'on rjoint une orga avec un utilisateur google en attente : GET
https://lh3.googleusercontent.com/a/ACg8ocJQ4UT2Q93taqPOgMrTu28CZtqZjU2khgRX_8lRZ02GIn5C=s96-c
NS_BINDING_ABORTED

---

## 💬 Chat

- [ok] Créer une **conversation privée** → apparaît chez les deux users
- [ok] Créer une **conversation de groupe** (multi-select) → tous les membres la voient
- [ok] Envoyer un message → livré en **temps réel** au(x) destinataire(s)
- [ok] Message reçu alors qu'on est sur une **autre page** → notification
- [ok] **Compteur de non-lus** s'incrémente correctement (la partie back récente) → à tester en vrai
- [ok] Ouvrir la conversation → le compteur de non-lus **retombe à 0**
- [ok] **Persistance** : recharger la page → l'historique des messages est toujours là
- [ok] Conversation **vide** → état propre, pas de crash
- [ok] Messages longs / caractères spéciaux / emoji → affichage correct
- [~] Beaucoup de messages → scroll correct (auto-scroll en bas à la réception)
		Pas d'autot-scroll. Reste en haut.
- [ok] Déconnecter puis reconnecter un client → les messages manqués se resynchronisent
- [OK] Console propre

---

## 👥 Friends

- [Ok] Rechercher un user par pseudo → résultats corrects
- [ok] Recherche sans résultat → état vide propre
- [ ] Envoyer une demande d'ami → l'autre reçoit une **notification**
- [ ] **Accepter** une demande → les deux se voient dans la liste d'amis (**les deux listes** se mettent à jour)
- [ ] **Refuser** une demande → disparaît, pas d'ajout
- [ ] **Supprimer** un ami → retiré des **deux** côtés (double refresh d'état)
		Oblige pour valider le module ?
- [ok] **Statut en ligne** d'un ami reflète la réalité entre deux sessions
- [OK] Impossible de s'ajouter soi-même / d'ajouter un ami déjà présent (message clair)
- [OK] Dropdown / modal contextuelle s'affiche bien **au-dessus** du reste (z-index / overlay)
- [OK] Console propre

---

## 🏠 Home (projets) NICOOOOOO

- [ok] Créer un projet → le **select d'organisation** ne montre que les orgas où tu es **admin**
- [~] Créer un projet sans titre → validation, refusé
	-> Pas de message d'ereur. Juste ca ne parche pas
- [ok] Liste des projets s'affiche correctement
- [ok] Ouvrir un projet → arrive sur le Kanban du bon projet
- [NON] Supprimer un projet → redirection `/home` + retiré de la liste
	-> Non, erreur 
- [ok] Aucun projet → **état vide** propre
- [ok] Un membre de l'orga voit bien les projets auxquels il a accès (et pas les autres)
- [~] Console propre
	-> err pour la suppression d'unprojet si le user est dedans

---

## 📋 Kanban

- [ok] Créer une tâche → apparaît dans la bonne colonne
- [~] Modifier une tâche (titre, description, priorité, deadline)
- [ok] **Assigner** un membre → l'assignation s'affiche (attention `assignedTo` objet vs `assignedToId`)
- [ok] **Désassigner** → l'assignation disparaît
- [~] **Drag & drop** entre colonnes → la position **persiste après reload** (ordre conservé)
- [~] Réordonner dans une même colonne → position correcte après reload
- [ok] Supprimer une tâche → retirée, pas de crash
- [ok] **Commentaires** : ajouter, supprimer
- [ok] Ouvrir une tâche **sans aucun commentaire** → pas de crash (`task.comments` doit être géré même si absent)
- [ok] Visibilité/actions **selon le rôle projet** (Manager vs User) → un User ne peut pas ce qu'un Manager peut
- [ok] Colonne vide → état propre
- [ok] **Temps réel** : un autre membre crée/déplace une tâche → tu la vois **en direct**
- [ok] Console propre

---

## 🏢 Organisation

- [ok] Créer une organisation
- [ok] Modifier une organisation (nom, etc.)
- [ok] Supprimer une organisation → retirée (vérifier le comportement temps réel si applicable)
- [ok] **Inviter** un membre → l'invité reçoit une **notification**
- [ok] L'invité **accepte** → devient membre, les deux vues se mettent à jour
- [ok] L'invité **refuse** → pas d'ajout
- [ok] **Annuler** une invitation en attente
- [ok] **Retirer** un membre → génère bien la notif `MemberRemoved` (cas de notif à vérifier)
- [ok] **Gestion des rôles** (Admin / Member) → changement pris en compte, droits qui suivent
	-> Pas en temps reel pour la personne pas concernee
- [ok] **Protection dernier admin** : impossible de retirer / faire partir le **dernier Admin** d'une orga (message clair)
- [ok] **Quitter** une organisation
- [ok] **Permissions** : un non-admin **ne peut pas** faire les actions admin (tester en agissant sans les droits → refus back, pas juste bouton caché)
- [ok] Voir la liste des membres
- [?] Console propre
	-> Lorsque le dernier admin veut s'ejecter : XHR DELETE
	https://localhost:8443/api/organisations/2/me
	[HTTP/1.1 400 Bad Request 5ms]
	Appel API echoue : An organisation must always have at least one Admin

---

## 👤 Profil

- [ok] Modifier les infos de profil (pseudo, etc.) → sauvegardé
- [ok] **Upload avatar** → s'affiche (compression OK, pas d'erreur 413 sur une grosse image)
- [ok] User **sans avatar** → avatar par défaut affiché
- [ok] **Changer de mot de passe** : ancien + nouveau → OK
- [ok] Changer de mot de passe avec **mauvais ancien mot de passe** → refusé
- [ok] **Activer la 2FA** : QR code affiché, code de vérification accepté
- [ok] **Désactiver la 2FA** : confirmation par mot de passe
- [ok] **RGPD — Export** : bouton « Télécharger mes données » → fichier JSON téléchargé
- [ok] Le JSON exporté **ne contient PAS** `passwordHash` ni `twoFactorSecret`
- [ok] Le JSON exporté est **lisible** et contient bien les données de l'user
- [ok] Un **mail d'export** apparaît dans Mailhog
	-> OU trouver la pj dans mailhog ?
- [ok] **RGPD — Suppression** : demande **confirmation par mot de passe**
	-> Impossible de supprimer un compte github car pas de mdp (database error)
- [ok] Suppression bloquée si **dernier admin** d'une orga (message clair)
- [ok] Un **mail de suppression** apparaît dans Mailhog
- [ok] Préférence de **langue** persiste après reload
- [ok] Console propre

---

## 🐛 Régression — bugs connus à revérifier

Tes points sensibles historiques. À vérifier explicitement une fois tout le reste passé.

- [ok] **`formatNotification`** : les 14 types de notif s'affichent, **aucun titre `undefined`** (attention `MemberRemoved`, `ProjectDeleted`)
- [ok] Notifications : le chemin **au montage (GET)** ET le chemin **socket temps réel** fonctionnent tous les deux
- [ok] **Double refresh d'état** : actions ami/membre → les deux états concernés se rechargent
- [ok] **Modals** : chaque modal a son propre reset → pas d'erreur stale affichée dans la mauvaise modal
- [ok] **CSS** : la Card de suppression profil utilise bien `flex` (pas `flec`)
- [ok] **Atomicité** : `tx.user.delete` (pas `prisma.user.delete`) dans la transaction de suppression
- [ ] **i18n** : au fur et à mesure que Sarah gèle les pages, vérifier qu'il ne reste **aucune chaîne en dur** sur les pages traduites

---

## Bilan

- [ ] Passe multi-user complète faite (2 comptes)
- [ ] Passe console propre faite sur toutes les pages
- [ ] Pages légales vérifiées
- [ ] Tous les modules démontrables de bout en bout sur base réelle