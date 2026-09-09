import { apiRequest } from "./client"

// GET /friends → lignes Friend, user imbriqué sous .friend
export async function getFriends() {
  return await apiRequest('/friends')
}

// GET /users/search?q=... → users à plat
export async function searchUsers(query) {
  // encodeURIComponent : protège les caractères spéciaux dans l'URL
  return await apiRequest(`/users/search?q=${encodeURIComponent(query)}`)
}

// POST /friends → renvoie { friend: {...} }
export async function addFriend(friendId) {
  return await apiRequest('/friends', {
    method: 'POST',
    body: JSON.stringify({ friendId }),
  })
}

// DELETE /friends/:friendId → renvoie { message }
export async function removeFriend(friendId) {
  return await apiRequest(`/friends/${friendId}`, {
    method: 'DELETE',
  })
}