import { mockUsers } from "../mocks/mockUsers" // adapte le chemin au tien
// import { apiRequest } from "./client"  (à décommenter quand la route existera)

const USE_MOCK = true

// Connexion : envoie identifiant + mot de passe, reçoit { token, user }
export async function loginRequest(credentials) {
  if (USE_MOCK) {
    // On simule la réponse du back : un faux token + un utilisateur
    return {
      token: 'fake-jwt-token',
      user: mockUsers[0], // en mock, on "se connecte" en tant qu'Alice
    }
  }
  // return await apiRequest('/api/auth/login', {
  //   method: 'POST',
  //   body: JSON.stringify(credentials),
  // })
}

// Inscription : envoie les champs, reçoit { token, user }
export async function signupRequest(data) {
  if (USE_MOCK) {
    return {
      token: 'fake-jwt-token',
      user: { id: 99, pseudo: data.username, email: data.email },
    }
  }
  // return await apiRequest('/api/auth/register', {
  //   method: 'POST',
  //   body: JSON.stringify(data),
  // })
}