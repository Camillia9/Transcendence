import { apiRequest } from './client';

export async function getConversations() {
	return await apiRequest('/conversations');
}

export async function getMessages(conversationId) {
	return await apiRequest(`/messages/${conversationId}`);
}

export async function createConversation(participantIds, type = 'private', name = '') {
	return await apiRequest('/conversations', {
		method: 'POST',
		body: JSON.stringify({ participantIds, type, name }),
	});
}

export async function getUnreadCount() {
	return await apiRequest('/conversations/unread-count');
}

export async function markConversationRead(conversationId) {
	return await apiRequest(`/conversations/${conversationId}/read`, { method: 'PATCH' });
}
