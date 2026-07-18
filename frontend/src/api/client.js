import axios from 'axios'

const API_BASE_URL = import.meta.evn.VITE_APPPI_URL || 'http://localhost:8000'

const client = axios.create({
    baseURL: API_BASE_URL,
})

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = 'Bearer ${token}'
    }

    return config
}) 

export default client