import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productosService from '../services/productosService';
import Modal from '../components/Modal';
import Tabla from '../components/Tabla';

const FORM_VACIO = { id: null, nombre: '', descripcion: '', precio: '', stock: '' };

export default function Productos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await productosService.listar();
      setProductos(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar productos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => { setForm(FORM_VACIO); setFormError(''); setModalAbierto(true); };
  const abrirEditar = (p) => { setForm({ id: p.id, nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock }); setFormError(''); setModalAbierto(true); };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setGuardando(true);
    try {
      const datos = { nombre: form.nombre, descripcion: form.descripcion, precio: Number(form.precio), stock: Number(form.stock) };
      if (form.id) {
        await productosService.editar(form.id, datos);
      } else {
        await productosService.crear(datos);
      }
      setModalAbierto(false);
      cargar();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar producto');
    } finally {
      setGuardando(false);
    }
  };

  const handleEstado = async (p) => {
    try {
      await productosService.cambiarEstado(p.id);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar estado');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Arial, sans-serif' }}>
      <header style={s.header}>
        <button onClick={() => navigate('/dashboard')} style={s.volver}>← Dashboard</button>
        <h1 style={s.tituloHeader}>Gestión de Productos</h1>
        <button onClick={abrirNuevo} style={s.btnNuevo}>+ Nuevo producto</button>
      </header>
      <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        {error && <div style={s.error}>⚠️ {error}</div>}
        {cargando ? (
          <p style={{ color: '#6B7280' }}>Cargando...</p>
        ) : (
          <Tabla
            columnas={[
              { key: 'nombre', label: 'Nombre' },
              { key: 'precio', label: 'Precio', render: (p) => `$${Number(p.precio).toFixed(2)}` },
              { key: 'stock', label: 'Stock' },
              { key: 'activo', label: 'Estado', render: (p) => (
                <span style={{ ...s.badge, background: p.activo ? '#DCFCE7' : '#FEE2E2', color: p.activo ? '#166534' : '#991B1B' }}>
                  {p.activo ? 'Activo' : 'Inactivo'}
                </span>
              ) },
            ]}
            filas={productos}
            renderAcciones={(p) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => abrirEditar(p)} style={s.btnAccion}>Editar</button>
                <button onClick={() => handleEstado(p)} style={{ ...s.btnAccion, color: p.activo ? '#991B1B' : '#166534' }}>
                  {p.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            )}
          />
        )}
      </main>

      {modalAbierto && (
        <Modal titulo={form.id ? 'Editar producto' : 'Nuevo producto'} onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.campo}>
              <label style={s.label}>Nombre</label>
              <input name="nombre" required value={form.nombre} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} style={{ ...s.input, minHeight: '60px', resize: 'vertical' }} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Precio</label>
              <input name="precio" type="number" min="0" step="0.01" required value={form.precio} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Stock</label>
              <input name="stock" type="number" min="0" step="1" required value={form.stock} onChange={handleChange} style={s.input} />
            </div>
            {formError && <div style={s.error}>⚠️ {formError}</div>}
            <button type="submit" disabled={guardando} style={s.btnGuardar}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
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
};
