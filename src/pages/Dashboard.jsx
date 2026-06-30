import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MODULOS = [
  { key: 'usuarios',      label: 'Usuarios',           emoji: '👥', ruta: '/usuarios',      roles: ['Administrador'] },
  { key: 'clientes',      label: 'Clientes',           emoji: '🤝', ruta: '/clientes',      roles: ['Administrador','Gerente','Colaborador'] },
  { key: 'productos',     label: 'Productos',          emoji: '📦', ruta: '/productos',     roles: ['Administrador','Gerente','Colaborador'] },
  { key: 'facturacion',   label: 'Facturación',        emoji: '🧾', ruta: '/facturacion',   roles: ['Administrador','Gerente','Colaborador'] },
  { key: 'cxc',           label: 'Cuentas por cobrar', emoji: '💰', ruta: '/cxc',           roles: ['Administrador','Gerente','Colaborador'] },
  { key: 'capacitacion',  label: 'Capacitación',       emoji: '🎓', ruta: '/capacitacion',  roles: ['Administrador','Gerente','Colaborador'] },
  { key: 'configuracion', label: 'Configuración',      emoji: '⚙️', ruta: '/configuracion', roles: ['Administrador'] },
  { key: 'auditoria',     label: 'Auditoría',          emoji: '🔍', ruta: '/auditoria',     roles: ['Administrador','Auditor'] },
];

const COLOR_ROL = {
  Administrador: { bg: '#1A3A6B', text: '#D6E4F7' },
  Gerente:       { bg: '#0F6E56', text: '#E1F5EE' },
  Colaborador:   { bg: '#2563A8', text: '#E6F1FB' },
  Auditor:       { bg: '#3C3489', text: '#EEEDFE' },
};

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const permisos = usuario?.permisos?.modulos || [];
  const modulosVisibles = MODULOS.filter(
    m => m.roles.includes(usuario?.rol) && permisos.includes(m.key)
  );
  const colores = COLOR_ROL[usuario?.rol] || COLOR_ROL.Colaborador;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ background: colores.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 2rem', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>AW</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>Aplicación Web Miscelánea</div>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)' }}>{usuario?.rol}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px' }}>Hola, {usuario?.nombre?.split(' ')[0]}</span>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px' }}>Panel de control</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 1.5rem' }}>
          Tienes acceso a {modulosVisibles.length} módulo(s).
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {modulosVisibles.map(mod => (
            <button key={mod.key} onClick={() => navigate(mod.ruta)}
              style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#374151' }}>
              <span style={{ fontSize: '32px' }}>{mod.emoji}</span>
              <span>{mod.label}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: '2rem', padding: '12px 16px', background: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#6B7280' }}>
          <strong>Sesión:</strong> {usuario?.correo} · <strong>Rol:</strong> {usuario?.rol}
        </div>
      </main>
    </div>
  );
}