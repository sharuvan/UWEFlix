'use client';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

function removeEmptyStringValues(obj) {
  for (const key in obj) {
      if (obj[key] === '') {
          delete obj[key];
      }
  }
  return obj;
}

export const login = async (data) => {
  const response = await api.post('/login/', data);
  return response.data;
};

export const logout = async (data) => {
  const response = await api.post('/logout/', data);
  return response.data;
};

export const getShowingsByDate = async (date) => {
  const response = await api.get(`/showing/?date=${date}`);
  return response.data;
};

export const getShowingsForNextTwoWeeks = async () => {
  const response = await api.get('/showings/nextTwoWeeks');
  return response.data;
};

export const bookTicket = async (bookingData) => {
  const response = await api.post('/ticket/', bookingData);
  return response.data;
};

export const getSeatAvailability = async (showingId) => {
  const response = await api.get(`/showing/${showingId}/seat_availability/`);
  return response.data;
};

// export const getShowingsByDate = async (date) => {
//   const response = await api.get(`/showing/?show_time=${date}&format=json`);
//   return response.data;
// };

// export const bookTicket = async (bookingData) => {
//   const response = await api.post('/book/', bookingData);
//   return response.data;
// };

export const createTicket = async (data) => {
  const response = await api.post('/ticket/', data);
  return response.data;
};

export const getAccounts = () => api.get('/accounts/');

export const getAccount = (id) => api.get(`/accounts/${id}/`);

export const createAccount = (account) => api.post('/accounts/', account);

export const updateAccount = (id, account) => api.put(`/accounts/${id}/`, account);

export const deleteAccount = (id) => api.delete(`/accounts/${id}/`);

export const getUsersByType = (userType) => api.get(`/users/`, { params: { user_type: userType } });


export const getUsers = () => api.get('/users/');

export const createUser = (user) => {
  const user_filtered = removeEmptyStringValues(user);
  return api.post('/users/create/', user_filtered);
}

export const updateUser = (id, user) => {
  const user_filtered = removeEmptyStringValues(user);
  return api.put(`/users/${id}/edit/`, user_filtered);
}

export const deleteUser = (id) => api.delete(`/users/${id}/delete/`);

export const getFilms = () => api.get('/film/');

export const createFilm = (film) => {
  const formData = new FormData();
  for (const key in film) {
    formData.append(key, film[key]);
  }
  return api.post('/film/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateFilm = (id, film) => {
  const formData = new FormData();
  for (const key in film) {
    formData.append(key, film[key]);
  }
  return api.put(`/film/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteFilm = (id) => api.delete(`/film/${id}/`);


export const getScreens = () => api.get('/screen/');

export const createScreen = (screen) => {
  const screen_filtered = removeEmptyStringValues(screen);
  return api.post('/screen/', screen_filtered);
};

export const updateScreen = (id, screen) => {
  const screen_filtered = removeEmptyStringValues(screen);
  return api.put(`/screen/${id}/`, screen_filtered);
};

export const deleteScreen = (id) => api.delete(`/screen/${id}/`);

export const getShowings = () => api.get('/showing/');

export const createShowing = (showing) => {
  const formData = new FormData();
  for (const key in showing) {
    formData.append(key, showing[key]);
  }
  return api.post('/showing/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateShowing = (id, showing) => {
  const formData = new FormData();
  for (const key in showing) {
    formData.append(key, showing[key]);
  }
  return api.put(`/showing/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteShowing = (id) => api.delete(`/showing/${id}/`);

export const getTransactions = ({ accountNumber }) => {
  return api.get(`/transactions/?account_number=${accountNumber}`);
};

export const getAccountBalance = ({ accountNumber }) => {
  return api.get(`/accounts/${accountNumber}/balance/`);
};

export const authorizePayment = ({ accountNumber, amount }) => {
  return api.post(`/accounts/${accountNumber}/authorize_payment/`, { amount });
};

export const getAccountStatements = (accountId) => api.get(`/accounts/${accountId}/statements/`);

export const getMyAccount = () => api.get('/account/my_account/');

export const getMyTransactions = () => api.get('/account/my_transactions/');

export const getDailyTransactions = () => api.get('/accounts/daily_transactions/');
export const getMonthlyReport = () => api.get('/accounts/monthly_report/');
export const getAnnualReport = () => api.get('/accounts/annual_report/');

export const requestTransactionCancel = (transactionId) => {
  return api.post(`/transaction/${transactionId}/request_cancel/`);
};

export const requestTransactionDiscount = (transactionId, discountAmount) => {
  return api.post(`/transaction/${transactionId}/request_discount/`, { discount_amount: discountAmount });
};

export const getAllTransactions = () => api.get('/transaction/all_transactions/');

export const approveTransactionDiscount = (transactionId, discountAmount) => {
  return api.post(`/transaction/${transactionId}/approve_discount/`, { discount_amount: discountAmount });
};

export const cancelTransaction = (transactionId) => {
  return api.post(`/transaction/${transactionId}/cancel_transaction/`);
};

export const getClubs = () => api.get('/club/');
export const createClub = (club) => {
  const club_filtered = removeEmptyStringValues(club);
  return api.post('/club/', club_filtered);
}
export const updateClub = (id, club) => {
  const club_filtered = removeEmptyStringValues(club);
  return api.put(`/club/${id}/`, club_filtered);
}
export const deleteClub = (id) => api.delete(`/club/${id}/`);

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        console.log("refreshToken", refreshToken);
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });
        localStorage.setItem('accessToken', response.data.access);
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.replace('/login');
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
