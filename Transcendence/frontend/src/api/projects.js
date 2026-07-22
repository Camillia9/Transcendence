import { mockProjects } from "../data/mockProjet"
import { apiRequest } from "./client"


// true : on utilise le mock / false : le vrai back (quand on aurra les routes)
const USE_MOCK = false

export async function getProjects() {
	if (USE_MOCK)
		return mockProjects // pou l'instant. A modifier
	return await apiRequest('/projects')
}

// Plus tard, quand la route existera, il suffira de basculer USE_MOCK à false.

export async function getProjectById(projectId) {
	if (USE_MOCK)
		return mockProjects.find(p => p.id === projectId)
	return await apiRequest(`/projects/${projectId}`)
}