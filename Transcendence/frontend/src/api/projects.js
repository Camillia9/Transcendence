import { mockProjects } from "../data/mockProjet"
//import { apiRequest } from "./client" (A importer lorsque la route existera)


// true : on utilise le mock / false : le vrai back (quand on aurra les routes)
const USE_MOCK = true

export async function getProjects() {
	if (USE_MOCK)
		return mockProjects // pou l'instant. A modifier
}

// Plus tard, quand la route existera, il suffira de basculer USE_MOCK à false.
// et return await apiRequest('/api/projects')