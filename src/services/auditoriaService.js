import { API } from './authService';

const auditoriaService = {
  listar: (accion) => API.get('/auditoria', { params: accion ? { accion } : {} }).then((r) => r.data),
};

export default auditoriaService;
