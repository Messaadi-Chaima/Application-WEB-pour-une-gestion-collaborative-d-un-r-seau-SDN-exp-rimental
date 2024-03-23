import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users'; // Mettez votre URL d'API ici

// Fonction pour récupérer tous les utilisateurs
export const getUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error while fetching users:', error);
    throw error;
  }
};

// Fonction pour ajouter un nouvel utilisateur
export const addUsers = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData);
    return response.data;
  } catch (error) {
    console.error('Error while adding user:', error);
    throw error;
  }
};

// Fonction pour mettre à jour un utilisateur existant
export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_URL}/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error while updating user:', error);
    throw error;
  }
};

// Fonction pour supprimer un utilisateur
export const deleteUsers = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error while deleting user:', error);
    throw error;
  }
};
