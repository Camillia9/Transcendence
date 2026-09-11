Les layouts en React Router servent à partager une structure commune entre plusieurs pages.

## Le fichier AuthLayout veut dire par exemple:
“Toutes les pages d’auth auront le même fond noir + le même centrage”

Si dans mes routes j'ai : 

<Route element={<AuthLayout />}>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
</Route>

mon layout devient :
<div className="min-h-screen bg-black flex items-center justify-center">
      <Login />

<div className="min-h-screen bg-black flex items-center justify-center">
      <Register />

ca copie colle le theme


## MainLayout entoure toutes les pages après connexion. Il contient la navbar (barre de navigation)

*La cloche* : dropdown de notifs. Une cloche avec badge rouge, qui ouvre un panneau listant les notifs. 

  Ses etats :
- notifOpen → un état booléen (panneau ouvert ou fermé)
- notifications → la liste des notifications (un tableau de données)
- unreadCount → le nombre de notifications non lues garce a l'inversion de la valeur booleenne : !true → false et !false → true
Donc !n.read veut dire "l'inverse de n.read" :
Si n.read === true (lue) → !n.read vaut false → jetée par le filter
Si n.read === false (non lue) → !n.read vaut true → gardée par le filter

relative car on doir adapter le menu deroulant a la cloche.

Panneau deroulant: S'ouvre que lorsque notifOpen(true) : click cloche. 

En tete: "Notifications + nb de notifs non lue si unreadCount > 0. Sinon rien

Liste: S'il n y a pas de notifications (lue ou pas) : "Aucune notifications". Sinon : on parcours toutes les notifs garce a map et au id. Lorsqu'on clique sur une (onClick) on navigue sur le sujet en question puis on ferme le menu deroulant. MarkAsRead enleve le point bleu du non lu
Elles sont affiche :
<span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.read ? 'bg-transparent' : 'bg-primary-400'}`} />
- C'est un petit point qui indique visuellement si la notif est lue ou non :
notif.read est true (lu) → bg-transparent → invisible (pas de point)
notif.read est false (non-lu) → bg-primary-400 → point bleu visible


fct markAsRead (marquer une notif comme lu lorsqu'on click dessus)
      - On parcourt toutes les notifs, et si l'id coreespond a la notif sur laquelle on vient de cliquer, on renvoie une copie en modifiant "read: true". Sinon, on renvoie inchangee. 

fctMarkAsAllRead() (marque toute les notifs comme lu)
      - On parcourt toute les notifs et quoi qu'il arrive grace au spread (...) on change le read: false en true