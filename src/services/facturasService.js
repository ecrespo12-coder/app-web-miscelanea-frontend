import { API } from './authService';

const facturasService = {
  listar: () => API.get('/facturas').then((r) => r.data),
  obtener: (id) => API.get(`/facturas/${id}`).then((r) => r.data),
  crear: (datos) => API.post('/facturas', datos).then((r) => r.data),
  registrarPago: (id, datos) => API.post(`/facturas/${id}/pagos`, datos).then((r) => r.data),
  anular: (id) => API.patch(`/facturas/${id}/anular`).then((r) => r.data),
};

export default facturasService;
