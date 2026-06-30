import { API } from './authService';

const clientesService = {
  listar: () => API.get('/clientes').then((r) => r.data),
  crear: (datos) => API.post('/clientes', datos).then((r) => r.data),
  editar: (id, datos) => API.put(`/clientes/${id}`, datos).then((r) => r.data),
  cambiarEstado: (id) => API.patch(`/clientes/${id}/estado`).then((r) => r.data),
  historial: (id) => API.get(`/clientes/${id}/historial`).then((r) => r.data),
};

export default clientesService;
