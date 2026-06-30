import { API } from './authService';

const capacitacionService = {
  listar: () => API.get('/capacitacion').then((r) => r.data),
  crear: (datos) => API.post('/capacitacion', datos).then((r) => r.data),
  editar: (id, datos) => API.put(`/capacitacion/${id}`, datos).then((r) => r.data),
  cambiarEstado: (id) => API.patch(`/capacitacion/${id}/estado`).then((r) => r.data),
  completar: (id) => API.post(`/capacitacion/${id}/completar`).then((r) => r.data),
};

export default capacitacionService;
