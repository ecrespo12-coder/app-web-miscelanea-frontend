import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

const authService = {
  login: async (correo, contrasena) => {
    const { data } = await API.post('/auth/login', { correo, contrasena });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    return data;
  },
  logout: async () => {
    try { await API.post('/auth/logout'); } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },
  me: () => API.get('/auth/me').then((r) => r.data),
  getUsuario: () => {
    const raw = localStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  },
  estaAutenticado: () => !!localStorage.getItem('token'),
};

export default authService;
export { API };