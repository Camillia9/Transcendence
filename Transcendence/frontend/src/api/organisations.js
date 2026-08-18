// import { mockProjects } from "../data/mockProjet"
import { apiRequest } from "./client"


// true : on utilise le mock / false : le vrai back (quand on aurra les routes)
const USE_MOCK = false

export async function createOrganisation(data) {
	// if (USE_MOCK)
	// 	return{ ...data, id: Date.now() }

	const response = await apiRequest('/organisations', {
		method: 'POST',
		body: JSON.stringify(data),
	})
	return response // cette route renvoie la tache directement (201) : res.status(201).json(task)
}

export async function getMyOrganisations() {
    // if (USE_MOCK)
    //     return mockProjects // pou l'instant. A modifier
    return await apiRequest('/organisations')
}

// Plus tard, quand la route existera, il suffira de basculer USE_MOCK à false.

export async function getOrganisationById(orgId) {
    // if (USE_MOCK)
    //     return mockProjects.find(p => p.id === projectId)
    return await apiRequest(`/organisations/${orgId}`)
}

export async function getMembers(orgId) {
    return await apiRequest(`/organisations/${orgId}/membres`)
}

export async function updateOrganisation(orgId, data) {
    // if (USE_MOCK)
    //     return { ...USE_MOCK, data, id: projectId}

    const response = await apiRequest(`/organisations/${orgId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    })
    return response.organisation // le back enveloppe : { message, organisation }
}

export async function updateMemberRole(orgId, userId, role) {
    // if (USE_MOCK)
    //     return { ...USE_MOCK, data, id: projectId}

    const response = await apiRequest(`/organisations/${orgId}/membres/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: role }),
    })
    return response.organisation // le back enveloppe : { message, organisation }
}

export async function deleteOrganisation(orgId) {
    // if (USE_MOCK)
    //     return { message: 'Project deleted' }

    return await apiRequest(`/organisations/${orgId}`, {
        method: 'DELETE'
    })
}

export async function deleteMember(orgId, userId) {
    return await apiRequest(`/organisations/${orgId}/membres/${userId}`, {
        method: "DELETE",
    })
}

export async function sendInvitation(orgId, userId) {
    return await apiRequest(`/organisations/${orgId}/invitations`, {
        method: "POST",
        body: JSON.stringify({ userId })
    })  
}

export async function deleteInvitation(orgId, id) {
    // if (USE_MOCK)
    //     return { message: 'Project deleted' }

    return await apiRequest(`/organisations/${orgId}/invitations/${id}`, {
        method: 'DELETE'
    })
}

export async function searchUser(pseudo) {
    return await apiRequest(`/users/by-pseudo?pseudo=${pseudo}`);
}

export async function getMyInvitations() {
    return await apiRequest(`/invitations`)
}

export async function acceptInvitation(id) {
    return await apiRequest(`/invitations/${id}/accept`, {
        method: 'PATCH'
    })
}

export async function declineInvitation(id) {
    return await apiRequest(`/invitations/${id}/decline`, {
        method: 'PATCH'
    })
}

export async function leaveOrganisation(orgId) {
    return await apiRequest(`/organisations/${orgId}/me`, {
        method: 'DELETE'
    })
}