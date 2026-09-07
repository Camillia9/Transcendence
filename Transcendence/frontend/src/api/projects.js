import { apiRequest } from "./client"

export async function getProjects() {
	return await apiRequest('/projects')
}

export async function getProjectById(projectId) {
	return await apiRequest(`/projects/${projectId}`)
}

export async function updateProject(projectId, data) {
	const response = await apiRequest(`/projects/${projectId}`, {
		method: 'PATCH',
		body: JSON.stringify(data),
	})
	return response.project // le back enveloppe : { message, project }
}

export async function deleteProject(projectId) {
	return await apiRequest(`/projects/${projectId}`, {
		method: 'DELETE'
	})
}

export async function createProject(orgId, data) {
	const response = await apiRequest(`/organisations/${orgId}/projects`, {
		method: 'POST',
		body: JSON.stringify(data),
	})
	return response
}

export async function getAvailableMembers(projectId) {
	return await apiRequest(`/projects/${projectId}/available-members`)
}

export async function addProjectMember(projectId, userId, role = 'User') {
	const response = await apiRequest(`/projects/${projectId}/members`, {
		method: 'POST',
		body: JSON.stringify( { userId, role } )
	})
	return response
}

export async function removeProjectMember(projectId, userId) {
	return await apiRequest(`/projects/${projectId}/members/${userId}`, {
		method: 'DELETE'
	})
}

export async function updateProjectMemberRole(projectId, userId, role) {
	const response = await apiRequest(`/projects/${projectId}/members/${userId}`, {
		method: 'PATCH',
		body: JSON.stringify({ role }),
	});

	return response;
}