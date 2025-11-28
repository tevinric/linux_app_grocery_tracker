import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getAllGroceries = async () => {
  const response = await api.get('/groceries')
  return response.data
}

export const getLowStockGroceries = async () => {
  const response = await api.get('/groceries/low-stock')
  return response.data
}

export const getGroceryById = async (id) => {
  const response = await api.get(`/groceries/${id}`)
  return response.data
}

export const createGrocery = async (data) => {
  const response = await api.post('/groceries', data)
  return response.data
}

export const updateGrocery = async (id, data) => {
  const response = await api.put(`/groceries/${id}`, data)
  return response.data
}

export const deleteGrocery = async (id) => {
  const response = await api.delete(`/groceries/${id}`)
  return response.data
}

export default api
