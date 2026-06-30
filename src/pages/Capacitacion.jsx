import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import capacitacionService from '../services/capacitacionService';
import Modal from '../components/Modal';

const FORM_VACIO = { id: null, titulo: '', descripcion: '', enlace: '', categoria: '' };

export default function Capacitacion() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'Administrador';

  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await capacitacionService.listar();
      setCursos(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar cursos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => { setForm(FORM_VACIO); setFormError(''); setModalAbierto(true); };
  const abrirEditar = (c) => { setForm({ id: c.id, titulo: c.titulo, descripcion: c.descripcion || '', enlace: c.enlace || '', categoria: c.categoria || '' }); setFormError(''); setModalAbierto(true); };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setGuardando(true);
    try {
      const datos = { titulo: form.titulo, descripcion: form.descripcion, enlace: form.enlace, categoria: form.categoria };
      if (form.id) {
        await capacitacionService.editar(form.id, datos);
      } else {
        await capacitacionService.crear(datos);
      }
      setModalAbierto(false);
      cargar();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar curso');
    } finally {
      setGuardando(false);
    }
  };

  const handleEstado = async (c) => {
    try {
      await capacitacionService.cambiarEstado(c.id);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar estado');
    }
  };

  const handleCompletar = async (c) => {
    try {
      await capacitacionService.completar(c.id);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al marcar como completado');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Arial, sans-serif' }}>
      <header style={s.header}>
        <button onClick={() => navigate('/dashboard')} style={s.volver}>← Dashboard</button>
        <h1 style={s.tituloHeader}>Capacitación</h1>
        {esAdmin ? <button onClick={abrirNuevo} style={s.btnNuevo}>+ Nuevo curso</button> : <div />}
      </header>
      <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        {error && <div style={s.error}>⚠️ {error}</div>}
        {cargando ? (
          <p style={{ color: '#6B7280' }}>Cargando...</p>
        ) : cursos.length === 0 ? (
          <p style={{ color: '#9CA3AF' }}>No hay cursos disponibles.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {cursos.map((c) => (
              <div key={c.id} style={s.card}>
                <div style={s.cardHeader}>
                  <h3 style={s.cardTitulo}>{c.titulo}</h3>
                  {c.completado && <span style={s.badgeOk}>✓ Completado</span>}
                </div>
                {c.categoria && <span style={s.categoria}>{c.categoria}</span>}
                <p style={s.cardDescripcion}>{c.descripcion}</p>
                {c.enlace && (
                  <a href={c.enlace} target="_blank" rel="noreferrer" style={s.enlace}>Ver material →</a>
                )}
                <div style={s.cardAcciones}>
                  {!c.completado && (
                    <button onClick={() => handleCompletar(c)} style={s.btnCompletar}>Marcar completado</button>
                  )}
                  {esAdmin && (
                    <>
                      <button onClick={() => abrirEditar(c)} style={s.btnAccion}>Editar</button>
                      <button onClick={() => handleEstado(c)} style={{ ...s.btnAccion, color: '#991B1B' }}>Desactivar</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalAbierto && (
        <Modal titulo={form.id ? 'Editar curso' : 'Nuevo curso'} onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.campo}>
              <label style={s.label}>Título</label>
              <input name="titulo" required value={form.titulo} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} style={{ ...s.input, minHeight: '60px', resize: 'vertical' }} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Categoría</label>
              <input name="categoria" value={form.categoria} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Enlace al material</label>
              <input name="enlace" type="url" value={form.enlace} onChange={handleChange} style={s.input} placeholder="https://..." />
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
  card: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' },
  cardTitulo: { margin: 0, fontSize: '15px', color: '#111827' },
  badgeOk: { fontSize: '11px', fontWeight: 'bold', color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap' },
  categoria: { fontSize: '11px', color: '#1A3A6B', background: '#E0E7FF', padding: '2px 8px', borderRadius: '20px', alignSelf: 'flex-start' },
  cardDescripcion: { fontSize: '13px', color: '#6B7280', margin: 0, flexGrow: 1 },
  enlace: { fontSize: '13px', color: '#1A3A6B', fontWeight: 'bold', textDecoration: 'none' },
  cardAcciones: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' },
  btnCompletar: { background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  btnAccion: { background: 'none', border: '1px solid #D1D5DB', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', color: '#374151' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  campo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#374151' },
  input: { padding: '10px 12px', border: '1.5px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' },
  btnGuardar: { background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
};
