import { apiRequest } from './client';

export async function getConversations() {
	return await apiRequest('/conversations');
}

export async function getMessages(conversationId) {
	return await apiRequest(`/messages/${conversationId}`);
}

export async function sendMessage(conversationId, content) {
	return await apiRequest(`/messages/${conversationId}`, {
		method: 'POST',
		body: JSON.stringify({ content }),
	});
}

export async function createConversation(participantIds, type = 'private', name = '') {
	return await apiRequest('/conversations', {
		method: 'POST',
		body: JSON.stringify({ participantIds, type, name }),
	});
}
