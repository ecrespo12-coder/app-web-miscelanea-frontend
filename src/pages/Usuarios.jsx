import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usuariosService from '../services/usuariosService';
import Modal from '../components/Modal';
import Tabla from '../components/Tabla';

const ROLES = [
  { id: 1, nombre: 'Administrador' },
  { id: 2, nombre: 'Gerente' },
  { id: 3, nombre: 'Colaborador' },
  { id: 4, nombre: 'Auditor' },
];

const FORM_VACIO = { id: null, nombre: '', correo: '', contrasena: '', rol_id: 3 };

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await usuariosService.listar();
      setUsuarios(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => { setForm(FORM_VACIO); setFormError(''); setModalAbierto(true); };
  const abrirEditar = (u) => { setForm({ id: u.id, nombre: u.nombre, correo: u.correo, contrasena: '', rol_id: u.rol_id }); setFormError(''); setModalAbierto(true); };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setGuardando(true);
    try {
      if (form.id) {
        await usuariosService.editar(form.id, { nombre: form.nombre, correo: form.correo, rol_id: form.rol_id });
      } else {
        await usuariosService.crear({ nombre: form.nombre, correo: form.correo, contrasena: form.contrasena, rol_id: form.rol_id });
      }
      setModalAbierto(false);
      cargar();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar usuario');
    } finally {
      setGuardando(false);
    }
  };

  const handleEstado = async (u) => {
    try {
      await usuariosService.cambiarEstado(u.id);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar estado');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Arial, sans-serif' }}>
      <header style={s.header}>
        <button onClick={() => navigate('/dashboard')} style={s.volver}>← Dashboard</button>
        <h1 style={s.tituloHeader}>Gestión de Usuarios</h1>
        <button onClick={abrirNuevo} style={s.btnNuevo}>+ Nuevo usuario</button>
      </header>
      <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        {error && <div style={s.error}>⚠️ {error}</div>}
        {cargando ? (
          <p style={{ color: '#6B7280' }}>Cargando...</p>
        ) : (
          <Tabla
            columnas={[
              { key: 'nombre', label: 'Nombre' },
              { key: 'correo', label: 'Correo' },
              { key: 'rol', label: 'Rol' },
              { key: 'activo', label: 'Estado', render: (u) => (
                <span style={{ ...s.badge, background: u.activo ? '#DCFCE7' : '#FEE2E2', color: u.activo ? '#166534' : '#991B1B' }}>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </span>
              ) },
            ]}
            filas={usuarios}
            renderAcciones={(u) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => abrirEditar(u)} style={s.btnAccion}>Editar</button>
                <button onClick={() => handleEstado(u)} style={{ ...s.btnAccion, color: u.activo ? '#991B1B' : '#166534' }}>
                  {u.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            )}
          />
        )}
      </main>

      {modalAbierto && (
        <Modal titulo={form.id ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.campo}>
              <label style={s.label}>Nombre</label>
              <input name="nombre" required value={form.nombre} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Correo</label>
              <input name="correo" type="email" required value={form.correo} onChange={handleChange} style={s.input} />
            </div>
            {!form.id && (
              <div style={s.campo}>
                <label style={s.label}>Contraseña</label>
                <input name="contrasena" type="password" required value={form.contrasena} onChange={handleChange} style={s.input} />
              </div>
            )}
            <div style={s.campo}>
              <label style={s.label}>Rol</label>
              <select name="rol_id" value={form.rol_id} onChange={handleChange} style={s.input}>
                {ROLES.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
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
  input: { padding: '10px 12px', border: '1.5px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  btnGuardar: { background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
};
