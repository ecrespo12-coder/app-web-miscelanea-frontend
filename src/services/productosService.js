import { API } from './authService';

const productosService = {
  listar: () => API.get('/productos').then((r) => r.data),
  crear: (datos) => API.post('/productos', datos).then((r) => r.data),
  editar: (id, datos) => API.put(`/productos/${id}`, datos).then((r) => r.data),
  cambiarEstado: (id) => API.patch(`/productos/${id}/estado`).then((r) => r.data),
};

export default productosService;
