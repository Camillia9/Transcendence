import { apiRequest } from './client';

const USE_MOCK = false;

export async function getNotifs() {
	if (USE_MOCK)
		return mockNotifications
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