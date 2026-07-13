import { mockNotifications } from "../data/mockNotifs";

const USE_MOCK = true;

export async function getNotifs() {
	if (USE_MOCK)
		return mockNotifications // A Modifier apres
}

// PLUS TARD :
// return await apiRequest(`/api/notifs`)