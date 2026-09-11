import { apiRequest } from './client'

export async function getTasks(projectId) {
	return await apiRequest(`/projects/${projectId}/tasks`)
}

export async function updateTask(projectId, taskId, data) {
	const response = await apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
		method: 'PATCH',
		body: JSON.stringify(data),
	})
	return response.task // le back enveloppe { message, task }
}

export async function deleteTask(projectId, taskId) {
	return await apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
		method: 'DELETE',
	})
}

export async function assignTask(projectId, taskId, userId) {
	const response = await apiRequest(`/projects/${projectId}/tasks/${taskId}/assign`, {
		method: 'PATCH',
		body: JSON.stringify({userId}),
	})
	return response.task
}

export async function moveTask(projectId, taskId, status) {
	const response = await apiRequest(`/projects/${projectId}/tasks/${taskId}/move`, {
		method: 'PATCH',
		body: JSON.stringify({status}),
	})
	return response.task
}

export async function createTask(projectId, data) {
	const response = await apiRequest(`/projects/${projectId}/tasks`, {
		method: 'POST',
		body: JSON.stringify(data),
	})
	return response // cette route renvoie la tache directement (201) : res.status(201).json(task)
}

export async function addComment(projectId, taskId, content) {
	return await apiRequest(`/projects/${projectId}/tasks/${taskId}/comments`, {
		method: 'POST',
		body: JSON.stringify({ content }), // POST renvoie le commentaire DIRECTEMENT (res.status(201).json(comment))
	})
}

export async function deleteComment(projectId, taskId, commentId) {
	return await apiRequest(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
		method: 'DELETE'
	})
}