import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clientesService from '../services/clientesService';
import Modal from '../components/Modal';
import Tabla from '../components/Tabla';

const FORM_VACIO = { id: null, nombre: '', correo: '', telefono: '', direccion: '' };

export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');
  const [historial, setHistorial] = useState(null);
  const [historialCliente, setHistorialCliente] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await clientesService.listar();
      setClientes(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar clientes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => { setForm(FORM_VACIO); setFormError(''); setModalAbierto(true); };
  const abrirEditar = (c) => { setForm({ id: c.id, nombre: c.nombre, correo: c.correo || '', telefono: c.telefono || '', direccion: c.direccion || '' }); setFormError(''); setModalAbierto(true); };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setGuardando(true);
    try {
      const datos = { nombre: form.nombre, correo: form.correo, telefono: form.telefono, direccion: form.direccion };
      if (form.id) {
        await clientesService.editar(form.id, datos);
      } else {
        await clientesService.crear(datos);
      }
      setModalAbierto(false);
      cargar();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar cliente');
    } finally {
      setGuardando(false);
    }
  };

  const handleEstado = async (c) => {
    try {
      await clientesService.cambiarEstado(c.id);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar estado');
    }
  };

  const verHistorial = async (c) => {
    setHistorialCliente(c);
    setHistorial(null);
    try {
      const data = await clientesService.historial(c.id);
      setHistorial(data);
    } catch (err) {
      setHistorial([]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Arial, sans-serif' }}>
      <header style={s.header}>
        <button onClick={() => navigate('/dashboard')} style={s.volver}>← Dashboard</button>
        <h1 style={s.tituloHeader}>Gestión de Clientes</h1>
        <button onClick={abrirNuevo} style={s.btnNuevo}>+ Nuevo cliente</button>
      </header>
      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {error && <div style={s.error}>⚠️ {error}</div>}
        {cargando ? (
          <p style={{ color: '#6B7280' }}>Cargando...</p>
        ) : (
          <Tabla
            columnas={[
              { key: 'nombre', label: 'Nombre' },
              { key: 'correo', label: 'Correo' },
              { key: 'telefono', label: 'Teléfono' },
              { key: 'activo', label: 'Estado', render: (c) => (
                <span style={{ ...s.badge, background: c.activo ? '#DCFCE7' : '#FEE2E2', color: c.activo ? '#166534' : '#991B1B' }}>
                  {c.activo ? 'Activo' : 'Inactivo'}
                </span>
              ) },
            ]}
            filas={clientes}
            renderAcciones={(c) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => abrirEditar(c)} style={s.btnAccion}>Editar</button>
                <button onClick={() => verHistorial(c)} style={s.btnAccion}>Historial</button>
                <button onClick={() => handleEstado(c)} style={{ ...s.btnAccion, color: c.activo ? '#991B1B' : '#166534' }}>
                  {c.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            )}
          />
        )}
      </main>

      {modalAbierto && (
        <Modal titulo={form.id ? 'Editar cliente' : 'Nuevo cliente'} onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.campo}>
              <label style={s.label}>Nombre</label>
              <input name="nombre" required value={form.nombre} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Correo</label>
              <input name="correo" type="email" value={form.correo} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Dirección</label>
              <textarea name="direccion" value={form.direccion} onChange={handleChange} style={{ ...s.input, minHeight: '70px', resize: 'vertical' }} />
            </div>
            {formError && <div style={s.error}>⚠️ {formError}</div>}
            <button type="submit" disabled={guardando} style={s.btnGuardar}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </Modal>
      )}

      {historialCliente && (
        <Modal titulo={`Historial: ${historialCliente.nombre}`} onClose={() => setHistorialCliente(null)} ancho="520px">
          {historial === null ? (
            <p style={{ color: '#6B7280' }}>Cargando...</p>
          ) : historial.length === 0 ? (
            <p style={{ color: '#9CA3AF' }}>Sin eventos registrados.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {historial.map((h) => (
                <li key={h.id} style={s.itemHistorial}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#111827' }}>{h.detalle}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    {h.usuario || 'Sistema'} · {new Date(h.creado_en).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </div>
  );
}

const s = {
  header: { background: '#1A3A6B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 2rem', color: '#fff' },
  tituloHeader: { fontSize: '16px', fontWeight: 'bold', margin: 0 },
  volver: { background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' },
  btnNuevo: { background: '#fff', color: '#1A3A6B', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
  error: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#991B1B', marginBottom: '1rem' },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  btnAccion: { background: 'none', border: '1px solid #D1D5DB', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', color: '#374151' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  campo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#374151' },
  input: { padding: '10px 12px', border: '1.5px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' },
  btnGuardar: { background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  itemHistorial: { background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 12px' },
};
