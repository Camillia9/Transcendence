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
  return response.user
}

// recup le back
export function getProfile() {
  if (USE_MOCK)
    return { pseudo: 'alice', email: '...', statut: 'Available', langue: 'fr' }
  return apiRequest(`/profile`)
}