import { mockConversations } from "../data/mockConversations";

const USE_MOCK = true;

export async function getConversations() {
	if (USE_MOCK)
		return mockConversations // A MODIF AVEC return await apiRequest(`/api/conversations`)
}