import { apiRequest } from './client';

export async function getNotifs() {
	return await apiRequest(`/notifications`)
}

export async function markNotifRead(id) {
	return await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' })
}

export async function markAllNotifsRead() {
	return await apiRequest(`/notifications/read-all`, { method: 'PATCH' })
}

// PLUS TARD :
// return await apiRequest(`/api/notifs`)