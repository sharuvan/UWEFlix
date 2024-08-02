import axios from 'axios'

export const getAccounts = () => axios.get('/api/accounts/')

export const getAccount = (id) => axios.get(`/api/accounts/${id}/`)

export const createAccount = (account) => axios.post('/api/accounts/', account)

export const updateAccount = (id, account) => axios.put(`/api/accounts/${id}/`, account)

export const deleteAccount = (id) => axios.delete(`/api/accounts/${id}/`)
