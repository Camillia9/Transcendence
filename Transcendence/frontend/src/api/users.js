import { apiRequest } from "./client";

export function getUsers() {
  return apiRequest("/users");
}

// envoie au back
export async function updateProfile(data) {
  const response = await apiRequest(`/profile`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
  return response.user // le back enoie message et user. On veut juste user. On l'extrait donc.
}

// recup le back
export function getProfile() {
  return apiRequest(`/profile`) // ou response. Le back retorune deja le user complet. Rien a extraire.
}

export async function changePassword(pass, newPass ) {
  const response = await apiRequest(`/profile/password`, {
    method: 'PATCH',
    body: JSON.stringify( {oldPassword: pass, newPassword: newPass })
  })
  return response // Ou rien. On attend pas de reponses particulieres, on veut juste savoir si ca a reussi (dans le try/catch)
}

export async function deleteAccount(password) {
  const response = await apiRequest(`/profile`, {
    method: "DELETE",
    body: JSON.stringify({ password })
  })
  return response // ou rien
}