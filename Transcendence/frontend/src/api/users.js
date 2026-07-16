import { mockUsers } from "../data/mockUsers";
// import { apiRequest } from "./client";

const USE_MOCK = true;

export function getUsers() {
  if (USE_MOCK) {
    return mockUsers;
  }
  // return apiRequest("/users");
}

export function getUserById(id) {
  if (USE_MOCK) {
    return mockUsers.find((u) => u.id === id) ?? null;
  }
  // return apiRequest(`/users/${id}`);
}