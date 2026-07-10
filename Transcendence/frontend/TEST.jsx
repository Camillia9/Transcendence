// L'adresse de base du back, écrite UNE SEULE FOIS dans tout le projet.
// Le jour où elle change (Nginx, HTTPS...), on ne modifie QUE cette ligne.
const BASE_URL = 'http://localhost:3000'

// Le moteur unique : toute requête vers le back passe par ici.
// - path : la route qu'on veut appeler, ex. '/api/health'
// - options : réglages optionnels (méthode, corps...), vide par défaut
export async function apiRequest(path, options = {}) {
	try {
		// On construit l'URL complète : base + route.
		const response = await fetch(`${BASE_URL}${path}`, {
			// On annonce qu'on échange du JSON (utile dès qu'on enverra des données).
			headers: {
				'Content-Type': 'application/json',
			},
			// On étale les options reçues : elles peuvent compléter/écraser ce qui précède.
			...options,
		})

		// fetch ne considère PAS un 404 ou un 500 comme une erreur.
		// On vérifie donc nous-mêmes que la réponse est "ok" (statut 200-299).
		if (!response.ok) {
			throw new Error(`Erreur ${response.status} sur ${path}`)
		}

		// On décode le corps JSON et on le renvoie à celui qui a appelé.
		return await response.json()
	} catch (error) {
		// On log pour le debug, puis on relance : l'appelant décidera quoi afficher.
		console.error('Appel API échoué :', error.message)
		throw error
	}
}

