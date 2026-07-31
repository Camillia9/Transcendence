import { mockFriends } from "../data/mockFriends"
import { mockUsers } from "../data/mockUsers"
import { apiRequest } from "./client"

const USE_MOCK = false

// GET /friends → lignes Friend, user imbriqué sous .friend
export async function getFriends() {
  if (USE_MOCK)
    return mockFriends
  return await apiRequest('/friends')
}

// GET /users/search?q=... → users à plat
export async function searchUsers(query) {
  if (USE_MOCK)
    return mockUsers.filter(u => u.pseudo.toLowerCase().includes(query.toLowerCase())).slice(0, 20)

  // encodeURIComponent : protège les caractères spéciaux dans l'URL
  return await apiRequest(`/users/search?q=${encodeURIComponent(query)}`)
}

// POST /friends → renvoie { friend: {...} }
export async function addFriend(friendId) {
  if (USE_MOCK)
    return { friend: mockUsers.find(u => u.id === friendId) }

  return await apiRequest('/friends', {
    method: 'POST',
    body: JSON.stringify({ friendId }),
  })
}

// DELETE /friends/:friendId → renvoie { message }
export async function removeFriend(friendId) {
  if (USE_MOCK)
    return { message: 'Friend removed' }

  return await apiRequest(`/friends/${friendId}`, {
    method: 'DELETE',
  })
}