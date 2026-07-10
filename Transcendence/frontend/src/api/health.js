import { apiRequest } from "./client"

export async function getHealth() {
	return await apiRequest('/api/health')
}

// Donne simplement sa route a l'API qui se charge du reste 