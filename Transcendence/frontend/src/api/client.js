const BASE_URL = 'http://localhost:3000'

// Le moteur unique : toute requête vers le back passe par ici.
export async function apiRequest(path, options = {}) {
  // Bracelet d'Auth : null tant que la vrai auth n'existe pas
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
      throw new Error(`Erreur ${response.status} sur ${path}`)
    }
    // On décode le corps JSON et on le renvoie à celui qui a appelé.
    return await response.json()
	} catch (error) {
    	console.error('Appel API echoue :', error.message)
    	throw error
  }
}

