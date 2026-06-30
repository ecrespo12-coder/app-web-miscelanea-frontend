import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Facturacion from './pages/Facturacion';
import CuentasPorCobrar from './pages/CuentasPorCobrar';
import Capacitacion from './pages/Capacitacion';
import Auditoria from './pages/Auditoria';

function RutaProtegida({ roles }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/sin-acceso" replace />;
  return <Outlet />;
}

function Proximamente({ nombre }) {
  const navigate = React.useCallback(() => window.history.back(), []);
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#1A3A6B' }}>Módulo: {nombre}</h2>
      <p style={{ color: '#6B7280' }}>Este módulo se desarrollará en las siguientes fases.</p>
      <button onClick={navigate}
        style={{ background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', marginTop: '1rem' }}>
        ← Volver al dashboard
      </button>
    </div>
  );
}

function SinAcceso() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h2 style={{ color: '#991B1B' }}>⛔ Acceso denegado</h2>
      <p style={{ color: '#6B7280' }}>No tienes permisos para esta sección.</p>
      <button onClick={() => window.location.href = '/dashboard'}
        style={{ background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px' }}>
        Ir al dashboard
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/sin-acceso" element={<SinAcceso />} />
          <Route element={<RutaProtegida />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/facturacion" element={<Facturacion />} />
            <Route path="/cxc" element={<CuentasPorCobrar />} />
            <Route path="/capacitacion" element={<Capacitacion />} />
          </Route>
          <Route element={<RutaProtegida roles={['Administrador']} />}>
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/configuracion" element={<Proximamente nombre="Configuración" />} />
          </Route>
          <Route element={<RutaProtegida roles={['Administrador','Auditor']} />}>
            <Route path="/auditoria" element={<Auditoria />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
