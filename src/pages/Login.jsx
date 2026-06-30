import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, cargando } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState('');
  const [mostrar, setMostrar] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.correo, form.contrasena);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.logo}>AW</div>
          <h1 style={s.titulo}>Aplicación Web</h1>
          <p style={s.subtitulo}>Miscelánea</p>
        </div>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.campo}>
            <label style={s.label}>Correo electrónico</label>
            <input name="correo" type="email" required placeholder="usuario@empresa.com"
              value={form.correo} onChange={handleChange} style={s.input} />
          </div>
          <div style={s.campo}>
            <label style={s.label}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input name="contrasena" type={mostrar ? 'text' : 'password'}
                required placeholder="••••••••" value={form.contrasena}
                onChange={handleChange} style={{ ...s.input, paddingRight: '44px' }} />
              <button type="button" onClick={() => setMostrar(v => !v)}
                style={s.ojo}>{mostrar ? '🙈' : '👁️'}</button>
            </div>
          </div>
          {error && <div style={s.error}>⚠️ {error}</div>}
          <button type="submit" disabled={cargando || !form.correo || !form.contrasena}
            style={{ ...s.btn, opacity: cargando ? 0.6 : 1 }}>
            {cargando ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>
        <p style={s.footer}>¿Problemas? Contacta al administrador.</p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0A1628', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', padding: '1rem' },
  card: { background: '#fff', borderRadius: '16px', padding: '2.5rem 2rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' },
  header: { textAlign: 'center', marginBottom: '2rem' },
  logo: { width: '64px', height: '64px', borderRadius: '50%', background: '#1A3A6B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', fontWeight: 'bold', marginBottom: '0.75rem' },
  titulo: { fontSize: '20px', fontWeight: 'bold', color: '#0A1628', margin: '0 0 4px' },
  subtitulo: { fontSize: '13px', color: '#6B7280', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  campo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#374151' },
  input: { padding: '10px 12px', border: '1.5px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  ojo: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  error: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#991B1B' },
  btn: { background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  footer: { textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginTop: '1.5rem', marginBottom: 0 },
};