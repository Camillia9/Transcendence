import { mockUsers } from "../data/mockUsers"
 import { apiRequest } from "./client"

const USE_MOCK = false

// Connexion: envoie identifiant + mot de passe, reçoit { token, user }
export async function loginRequest(credentials) {
	if (USE_MOCK) {
		// Simule la reponse du back : Un faux token + un user
		return {
			token: 'fakw-jwt-token',
			user: mockUsers[0]
		}
	}
  return await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

// Inscription: envoie les champs, recois { token, user }
export async function signupRequest(data) {
  if (USE_MOCK) {
    return {
      token: 'fake-jwt-token',
      user: { id: 99, pseudo: data.username, email: data.email}
    }
  }
  return await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

