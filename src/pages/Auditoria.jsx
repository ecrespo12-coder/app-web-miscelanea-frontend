import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import auditoriaService from '../services/auditoriaService';
import Tabla from '../components/Tabla';

const ACCIONES = [
  { value: '', label: 'Todas las acciones' },
  { value: 'login_exitoso', label: 'Login exitoso' },
  { value: 'cuenta_bloqueada', label: 'Cuenta bloqueada' },
  { value: 'cambio_rol', label: 'Cambio de rol' },
  { value: 'cambio_estado_usuario', label: 'Cambio de estado de usuario' },
  { value: 'factura_anulada', label: 'Factura anulada' },
];

const ACCION_COLOR = {
  login_exitoso: { bg: '#DCFCE7', text: '#166534' },
  cuenta_bloqueada: { bg: '#FEE2E2', text: '#991B1B' },
  cambio_rol: { bg: '#DBEAFE', text: '#1E40AF' },
  cambio_estado_usuario: { bg: '#FEF3C7', text: '#92400E' },
  factura_anulada: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function Auditoria() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');

  const cargar = async (accion) => {
    setCargando(true);
    try {
      const data = await auditoriaService.listar(accion);
      setEventos(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar auditoría');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(filtro); }, [filtro]);

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Arial, sans-serif' }}>
      <header style={s.header}>
        <button onClick={() => navigate('/dashboard')} style={s.volver}>← Dashboard</button>
        <h1 style={s.tituloHeader}>Auditoría</h1>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} style={s.select}>
          {ACCIONES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </header>
      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {error && <div style={s.error}>⚠️ {error}</div>}
        {cargando ? (
          <p style={{ color: '#6B7280' }}>Cargando...</p>
        ) : (
          <Tabla
            columnas={[
              { key: 'creado_en', label: 'Fecha', render: (e) => new Date(e.creado_en).toLocaleString() },
              { key: 'usuario', label: 'Usuario', render: (e) => e.usuario ? `${e.usuario} (${e.correo})` : 'Sistema' },
              { key: 'accion', label: 'Acción', render: (e) => (
                <span style={{ ...s.badge, background: ACCION_COLOR[e.accion]?.bg || '#E5E7EB', color: ACCION_COLOR[e.accion]?.text || '#374151' }}>
                  {e.accion}
                </span>
              ) },
              { key: 'detalle', label: 'Detalle' },
            ]}
            filas={eventos}
          />
        )}
      </main>
    </div>
  );
}

const s = {
  header: { background: '#1A3A6B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 2rem', color: '#fff' },
  tituloHeader: { fontSize: '16px', fontWeight: 'bold', margin: 0 },
  volver: { background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' },
  select: { padding: '6px 10px', borderRadius: '6px', border: 'none', fontSize: '13px' },
  error: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#991B1B', marginBottom: '1rem' },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
};
