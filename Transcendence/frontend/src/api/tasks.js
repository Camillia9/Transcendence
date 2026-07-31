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

export async function assignTask(projectId, taskId, userId) {
	if (USE_MOCK)
		return { assignedToId, id: taskId }

	const response = await apiRequest(`/projects/${projectId}/tasks/${taskId}/assign`, {
		method: 'PATCH',
		body: JSON.stringify({userId}),
	})
	return response.task
}

export async function moveTask(projectId, taskId, status) {
	if (USE_MOCK)
		return { id: taskId, status }

	const response = await apiRequest(`/projects/${projectId}/tasks/${taskId}/move`, {
		method: 'PATCH',
		body: JSON.stringify({status}),
	})
	return response.task
}

export async function createTask(projectId, data) {
	if (USE_MOCK)
		return{ ...data, id: Date.now() }

	const response = await apiRequest(`/projects/${projectId}/tasks`, {
		method: 'POST',
		body: JSON.stringify(data),
	})
	return response // cette route renvoie la tache directement (201) : res.status(201).json(task)
}

export async function addComment(projectId, taskId, content) {
	if (USE_MOCK)
		return { id: Date.now(), content, user: { id: 0, pseudo: 'moi', avatar: null }, createdAt: new Date().toISOString() }

	return await apiRequest(`/projects/${projectId}/tasks/${taskId}/comments`, {
		method: 'POST',
		body: JSON.stringify({ content }), // POST renvoie le commentaire DIRECTEMENT (res.status(201).json(comment))
	})
}