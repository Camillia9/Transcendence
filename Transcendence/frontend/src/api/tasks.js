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

export async function updateTask(projectId, taskId, data) {
	if (USE_MOCK)
		return { ...data, id:  taskId }

	const response = await apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
		method: 'PATCH',
		body: JSON.stringify(data),
	})
	return response.task // le back enveloppe { message, task }
}

export async function deleteTask(projectId, taskId) {
	if (USE_MOCK)
		return { message: 'Task deleted' }

	return await apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
		method: 'DELETE',
	})
}