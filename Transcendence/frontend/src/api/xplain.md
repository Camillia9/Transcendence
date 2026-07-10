*API* : Fichier regroupant tous les appels au back. Intermédiaire entre le front et le back. Une API n'est pas un logiciel à part. C'est l'interface publique du backend. C'est l'ensemble des points d'entrée que le frontend (ou d'autres applications) peut utiliser pour communiquer avec lui.

## client.js

const BASE_URL : Maintenant l'URL vit seulement ici. A changer ici lorsqu'on passera au HTTPS/NGINX 

function apiRequest(path, options = {})
   - path : la route qu'on veut appeler, ex. '/api/health'
   - options = {} — la valeur par défaut. Si on appelle apiRequest('/api/health') sans second argument, options vaut un objet vide, et rien ne casse. On s'en servira plus tard pour les POST/PUT (envoyer des données).

	if (!response.ok) : Fetch ne se met pas en erreur si le serveur répond « 404 non trouvé » ou « 500 plantage » : pour lui, avoir reçu une réponse, c'est un succès. Donc c'est à nous de vérifier que le statut est bon (response.ok est vrai pour les statuts 200-299). Sans cette vérif, une route en erreur passerait pour un succès et donnerait des bugs.

	