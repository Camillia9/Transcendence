const BASE_URL = 'https://localhost/api'

// Le moteur unique : toute requête vers le back passe par ici.
export async function apiRequest(path, options = {}) {
  // Bracelet d'Auth, le token stocke a la connexion est attache aux requetes
  const token = localStorage.getItem('token')
	try {
		const response = await fetch(`${BASE_URL}${path}`, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...(token && { Authorization: `Bearer ${token}` }),
				...options.headers,
			},
		})

    if (!response.ok) {
      // Recupere l'erreur du back direct dans la console
      const errorBody = await response.json().catch(() => ({}))
  	  throw new Error(errorBody.error || `Erreur ${response.status} sur ${path}`)
    }
    // On décode le corps JSON et on le renvoie à celui qui a appelé.
    return await response.json()
	} catch (error) {
    	console.error('Appel API echoue :', error.message)
    	throw error
  }
}

