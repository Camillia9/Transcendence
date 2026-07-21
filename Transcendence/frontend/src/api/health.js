import { apiRequest } from "./client"

export async function getHealth() {
	return await apiRequest('/health')
}

// Donne simplement sa route a l'API qui se charge du reste 