import { useMemo } from "react";
import { mockUsers } from "../data/mockUsers";
import { apiRequest } from "./client";

const USE_MOCK = false;

export function getUsers() {
  if (USE_MOCK) {
    return mockUsers;
  }
  return apiRequest("/users");
}

// PLus utilise ?
export function getUserById(id) {
  if (USE_MOCK) {
    return mockUsers.find((u) => u.id === id) ?? null;
  }
  return apiRequest(`/users/${id}`);
}

// envoie au back
export async function updateProfile(data) {
  if (USE_MOCK)
    return {...data}

  const response = await apiRequest(`/profile`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
  return response.user // le back enoie message et user. On veut juste user. On l'extrait donc.
}

// recup le back
export function getProfile() {
  if (USE_MOCK)
    return { pseudo: 'alice', email: '...', statut: 'Available', langue: 'fr' }
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