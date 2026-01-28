import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5050/api',
})

export const attachRole = (role) => ({
  headers: {
    'x-role': role,
  },
})

export default api
