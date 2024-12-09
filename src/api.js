import { showLoading, hideLoading } from "./loading.js";

const BASE_URL = "https://notes-api.dicoding.dev/v2";

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

async function fetchWithToken(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
}

export async function getNotes() {
  try {
    const response = await fetchWithToken(`${BASE_URL}/notes`);
    const responseJson = await response.json();

    if (responseJson.status !== "success") {
      throw new Error(responseJson.message);
    }

    return responseJson.data;
  } catch (error) {
    console.error("Error getting notes:", error);
    throw error;
  }
}

export async function getArchivedNotes() {
  try {
    const response = await fetchWithToken(`${BASE_URL}/notes/archived`);
    const responseJson = await response.json();

    if (responseJson.status !== "success") {
      throw new Error(responseJson.message);
    }

    return responseJson.data;
  } catch (error) {
    console.error("Error getting archived notes:", error);
    throw error;
  }
}

export async function addNote(title, body) {
  try {
    const response = await fetchWithToken(`${BASE_URL}/notes`, {
      method: "POST",
      body: JSON.stringify({ title, body }),
    });

    const responseJson = await response.json();

    if (responseJson.status !== "success") {
      throw new Error(responseJson.message);
    }

    return responseJson.data;
  } catch (error) {
    console.error("Error adding note:", error);
    throw error;
  }
}

export async function archiveNote(id) {
  try {
    const response = await fetchWithToken(`${BASE_URL}/notes/${id}/archive`, {
      method: "POST",
    });

    const responseJson = await response.json();

    if (responseJson.status !== "success") {
      throw new Error(responseJson.message);
    }

    return responseJson.message;
  } catch (error) {
    console.error("Error archiving note:", error);
    throw error;
  }
}

export async function unarchiveNote(id) {
  try {
    const response = await fetchWithToken(`${BASE_URL}/notes/${id}/unarchive`, {
      method: "POST",
    });

    const responseJson = await response.json();

    if (responseJson.status !== "success") {
      throw new Error(responseJson.message);
    }

    return responseJson.message;
  } catch (error) {
    console.error("Error unarchiving note:", error);
    throw error;
  }
}

export async function deleteNote(id) {
  try {
    const response = await fetchWithToken(`${BASE_URL}/notes/${id}`, {
      method: "DELETE",
    });

    const responseJson = await response.json();

    if (responseJson.status !== "success") {
      throw new Error(responseJson.message);
    }

    return responseJson.message;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}
