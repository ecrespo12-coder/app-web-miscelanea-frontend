import { API } from './authService';
import facturasService from './facturasService';

const cxcService = {
  listar: () => API.get('/cxc').then((r) => r.data),
  registrarPago: facturasService.registrarPago,
};

export default cxcService;
