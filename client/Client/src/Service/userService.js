import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'http://localhost:5001/api/users'; // Mettez votre URL d'API ici

// Fonction pour récupérer tous les utilisateurs
export const getUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    // Ajoutez un identifiant unique à chaque utilisateur
    const usersWithId = response.data.map(user => ({ ...user, id: uuidv4() }));
    console.log(usersWithId);
    return usersWithId;
  }catch (error) {
    console.error('Error while fetching users:', error);
    throw error;
  }
};

// Fonction pour ajouter un nouvel utilisateur
export const addUsers = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData);
    console.log(response.data);
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
