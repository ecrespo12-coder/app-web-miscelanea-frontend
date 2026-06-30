import { API } from './authService';

const usuariosService = {
  listar: () => API.get('/usuarios').then((r) => r.data),
  crear: (datos) => API.post('/usuarios', datos).then((r) => r.data),
  editar: (id, datos) => API.put(`/usuarios/${id}`, datos).then((r) => r.data),
  cambiarEstado: (id) => API.patch(`/usuarios/${id}/estado`).then((r) => r.data),
};

export default usuariosService;
