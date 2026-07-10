const BASE_URL = 'http://localhost:3000'

// Le moteur unique : toute requête vers le back passe par ici.
export async function apiRequest(path, options = {}) {
	try {
		const response = await fetch(`${BASE_URL}${path}`, {
      // On annonce qu'on échange du JSON (utile dès qu'on enverra des données).
			headers: {
				'Content-Type': 'application/json',
			},
      ...options,
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

