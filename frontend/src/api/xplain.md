*API* : Fichier regroupant tous les appels au back. Intermédiaire entre le front et le back. Une API n'est pas un logiciel à part. C'est l'interface publique du backend. C'est l'ensemble des points d'entrée que le frontend (ou d'autres applications) peut utiliser pour communiquer avec lui.

# client.js — le moteur unique des appels API (`apiRequest`)

## À quoi sert ce fichier ?

Toutes les requêtes du front vers le back passent par UNE seule fonction : `apiRequest()`.
C'est un **péage unique** : au lieu que chaque page écrive son propre `fetch` avec ses
propres réglages (et fasse des erreurs différentes à chaque fois), tout le monde passe
par ici. Avantage : le jour où on doit changer quelque chose (l'adresse du serveur,
l'authentification...), on le change à UN seul endroit.

### `const BASE_URL = 'http://localhost:3000'`
L'adresse du serveur backend. Toutes les requêtes partent vers cette adresse.
Si le back change de port ou d'adresse un jour → une seule ligne à modifier.

### `export async function apiRequest(path, options = {})`
- **export** : la fonction est utilisable depuis d'autres fichiers (nos fichiers
  `api/tasks.js`, `api/projects.js`... l'importent).
- **async** : la fonction contient des opérations qui prennent du temps (parler au
  serveur). `async` permet d'utiliser `await` à l'intérieur (= "attends le résultat
  avant de continuer").
- **path** : le chemin demandé APRÈS l'adresse de base. Ex : `'/api/tasks'`.
  Le fetch assemblera `BASE_URL + path` → `http://localhost:3000/api/tasks`.
- **options = {}** : un objet de réglages optionnels fourni par l'appelant
  (ex : `{ method: 'POST', body: ... }` pour envoyer des données). Le `= {}` est la
  *valeur par défaut* : si l'appelant ne fournit rien, options vaut un objet vide,
  et la fonction marche quand même (ce sera une simple requête GET).

### `const token = localStorage.getItem('token')`
- **localStorage** : un petit espace de stockage DANS le navigateur, qui survit au
  rechargement de la page et même à sa fermeture.
- **token** : notre "bracelet de festival". Au login, le serveur nous remettra un
  jeton signé (le token JWT) qui prouve qui on est. Ensuite, au lieu de redonner
  email + mot de passe à chaque requête, on montre juste le bracelet.
- ⚠️ **Aujourd'hui, l'auth n'existe pas encore** : personne n'a jamais stocké de
  token, donc `getItem('token')` renvoie `null`. C'est prévu : voir plus bas,
  le header d'auth ne sera tout simplement pas ajouté. Le branchement est prêt,
  l'interrupteur est sur off.

### `const response = await fetch(...)`
- **fetch** : la fonction du navigateur qui envoie une requête HTTP au serveur.
- **await** : "attends la réponse du serveur avant de passer à la ligne suivante".
- On lui passe 2 arguments : l'URL complète, et un objet de configuration.

### La configuration du fetch — et POURQUOI cet ordre précis

```js
{
  ...options,
  headers: { ... },
}
```

- **Les headers** (= "en-têtes") sont les étiquettes collées sur le colis de la
  requête : des métadonnées que le serveur lit. Ex : "le contenu est du JSON".
- **...options** (le **spread**, les 3 points) : déplie toutes les clés de l'objet
  options ici. Si l'appelant a passé `{ method: 'POST', body: ... }`, ces clés
  atterrissent dans la config.
- ⚠️ **Règle du spread : le DERNIER écrit gagne.** Si deux sources définissent la
  même clé, celle écrite en dernier écrase l'autre. C'est pour ça que l'ordre
  compte : on met `...options` EN PREMIER et `headers` EN DERNIER. Ainsi, un
  appelant ne peut jamais écraser accidentellement tout notre bloc headers
  (et perdre le Content-Type + le token).

### Les 3 lignes à l'intérieur de headers

```js
'Content-Type': 'application/json',
```
Étiquette : "je t'envoie du JSON". Nécessaire dès qu'on POST des données.

```js
...(token && { Authorization: `Bearer ${token}` }),
```
La ligne la plus dense du fichier. Décomposons :
- `Authorization` : l'étiquette standard HTTP pour dire "voici qui je suis".
- `Bearer` = "porteur" : le format standard. `Authorization: Bearer eyJhbG...`
  signifie "le porteur de ce jeton est authentifié".
- `token && {...}` : un "si" compressé. Si token est `null` (aujourd'hui),
  l'expression vaut `null` → le spread ne déplie RIEN → aucune étiquette ajoutée.
  Si token existe (après le login, plus tard), l'expression vaut l'objet
  `{ Authorization: ... }` → le spread le déplie → l'étiquette part avec la requête.
- Résultat : le jour où le login stockera un vrai token, TOUTES les requêtes
  seront automatiquement authentifiées, sans modifier ce fichier ni aucune page.

```js
...options.headers,
```
Si l'appelant veut AJOUTER une étiquette personnalisée, on la fusionne ici,
à l'intérieur du bloc — au lieu de le laisser remplacer le bloc entier.
Fusion fine plutôt que remplacement brutal.

### `if (!response.ok)`
- **response.ok** : vrai si le serveur a répondu avec un code de succès (200-299).
  Faux pour une erreur (404 = pas trouvé, 500 = erreur serveur...).
- ⚠️ Piège connu : `fetch` ne considère PAS une erreur 404/500 comme une erreur —
  pour lui, le serveur a répondu, mission accomplie. C'est à NOUS de vérifier
  le code et de déclencher l'erreur nous-mêmes : c'est le rôle du `throw`.
- **throw new Error(...)** : fabrique une erreur et interrompt tout — on saute
  directement dans le bloc `catch`.

### `return await response.json()`
Le corps de la réponse arrive sous forme de texte brut. `.json()` le décode en
objet/tableau JavaScript utilisable. C'est CE résultat que reçoit l'appelant
(ex : le tableau des tâches).

### `try { ... } catch (error) { ... }`
- **try/catch** : "essaie ce bloc ; si une erreur survient n'importe où dedans,
  saute dans le catch au lieu de faire planter la page".
- Dans le catch : on affiche l'erreur en console (pour débugger), puis
  **throw error** : on RELANCE l'erreur vers l'appelant. Pourquoi ? Parce que
  c'est la page qui a appelé qui sait quoi faire de l'échec (afficher un message
  "impossible de charger les tâches", etc.). Le péage signale ; la page décide.

## Comment on s'en sert (dans les fichiers api/*.js)

```js
// Lire :
const tasks = await apiRequest('/api/tasks')

// Envoyer :
await apiRequest('/api/tasks', {
  method: 'POST',
  body: JSON.stringify(newTask),
})
```

L'appelant ne s'occupe ni de l'adresse du serveur, ni des headers, ni du token,
ni des erreurs HTTP : le péage gère tout ça pour lui.