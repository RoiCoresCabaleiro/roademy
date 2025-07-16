// src/services/api.js

import axios from 'axios';

// Crear instancia de Axios
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // '/api'
  withCredentials: true,  // Permite enviar cookies (como refreshToken)
  headers: { 'Content-Type': 'application/json' }
});

let isRefreshing = false;
let subscribers = [];

/** Llama a todos los callbacks con el token nuevo */
function onRefreshed(token) {
  subscribers.forEach(cb => cb(token));
  subscribers = [];
}

/** Añade una petición 401 a la cola */
function addSubscriber(callback) {
  subscribers.push(callback);
}

// 1) Interceptor de request: se añade Authorization si hay token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2) Interceptor de response: al 401, se intenta refresh y se repite la petición
api.interceptors.response.use(
  res => res,
  error => {
    const { config, response } = error;
    const originalRequest = config;

    // si no es 401 o ya se reintentó, se rechaza
    if (response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    // si ya hay un refresh en curso, se encola la petición
    if (isRefreshing) {
      return new Promise(resolve => {
        addSubscriber(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    // sino, se arranca el refresh
    isRefreshing = true;
    return new Promise((resolve, reject) => {
      axios.post(
        import.meta.env.VITE_API_URL + '/auth/refresh',
        {},
        { withCredentials: true }
      )
      .then(({ data }) => {
        localStorage.setItem('accessToken', data.accessToken);
        isRefreshing = false;
        onRefreshed(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;  // reintenta la petición que arrancó el refresh
        resolve(api(originalRequest));
      })
      .catch(err => {
        isRefreshing = false;
        subscribers = [];
        localStorage.removeItem('accessToken');  // Limpia el token de acceso del localStorage
        window.location.href = '/login';  // Redirige al login de forma imperativa
        reject(err);
      });
    });
  }
);

export default api;
