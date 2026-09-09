import { apiRequest } from "./client"

// Connexion: envoie identifiant + mot de passe, reçoit { token, user }
export async function loginRequest(credentials) {
  return await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

// Inscription: envoie les champs, recois { token, user }
export async function signupRequest(data) {
  return await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Envoyer le QrCode de la 2FA
export async function setup2FA() {
  return await apiRequest(`/auth/2fa/setup`, {
    method: 'POST',
  })
}

// Confirme la 2fa
export async function verify2FA(code) {
  const response = await apiRequest(`/auth/2fa/verify`, {
    method: 'POST',
    body: JSON.stringify({code})
  })
  return response
}

// Se connecter apres la 2FA
export async function login2FA(userId, code) {
  return await apiRequest('/auth/login/2fa', {
    method: 'POST',
    body: JSON.stringify({ userId, code })
  })
}

export async function disable2FA(password) {
  const response = await apiRequest(`/auth/2fa/disable`, {
    method: 'POST',
    body: JSON.stringify({ password })
  })
  return response
}