import { mockTasks } from '../data/mockTasks'
import { apiRequest } from './client'

const USE_MOCK = false;

// projectId : recup les taches d'un projet precis
export async function getTasks(projectId) {
	if (USE_MOCK)
		return mockTasks.filter((task) => task.projectId === Number(projectId))
	return await apiRequest(`/projects/${projectId}/tasks`)
}

// On convertit l'id qui vient de l'URL (/projet/4) arrive en "4" mais dans le mock projectId = 4. 
