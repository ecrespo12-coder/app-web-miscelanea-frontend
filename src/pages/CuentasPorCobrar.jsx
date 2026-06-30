import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cxcService from '../services/cxcService';
import Modal from '../components/Modal';
import Tabla from '../components/Tabla';

export default function CuentasPorCobrar() {
  const navigate = useNavigate();
  const [cuentas, setCuentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [pagoFactura, setPagoFactura] = useState(null);
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState('efectivo');
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await cxcService.listar();
      setCuentas(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar cuentas por cobrar');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirPago = (f) => { setPagoFactura(f); setMonto(''); setMetodo('efectivo'); setFormError(''); };

  const handlePago = async (e) => {
    e.preventDefault();
    setFormError('');
    setGuardando(true);
    try {
      await cxcService.registrarPago(pagoFactura.id, { monto: Number(monto), metodo });
      setPagoFactura(null);
      cargar();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al registrar pago');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Arial, sans-serif' }}>
      <header style={s.header}>
        <button onClick={() => navigate('/dashboard')} style={s.volver}>← Dashboard</button>
        <h1 style={s.tituloHeader}>Cuentas por Cobrar</h1>
        <div />
      </header>
      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {error && <div style={s.error}>⚠️ {error}</div>}
        {cargando ? (
          <p style={{ color: '#6B7280' }}>Cargando...</p>
        ) : (
          <Tabla
            columnas={[
              { key: 'numero', label: 'Factura' },
              { key: 'cliente', label: 'Cliente' },
              { key: 'total', label: 'Total', render: (f) => `$${Number(f.total).toFixed(2)}` },
              { key: 'total_pagado', label: 'Pagado', render: (f) => `$${Number(f.total_pagado).toFixed(2)}` },
              { key: 'saldo', label: 'Saldo', render: (f) => <strong>${Number(f.saldo).toFixed(2)}</strong> },
              { key: 'estado', label: 'Estado' },
            ]}
            filas={cuentas}
            renderAcciones={(f) => (
              <button onClick={() => abrirPago(f)} style={s.btnAccion}>Registrar pago</button>
            )}
          />
        )}
      </main>

      {pagoFactura && (
        <Modal titulo={`Registrar pago — ${pagoFactura.numero}`} onClose={() => setPagoFactura(null)}>
          <p style={{ fontSize: '13px', color: '#374151', marginTop: 0 }}>
            Saldo pendiente: <strong>${Number(pagoFactura.saldo).toFixed(2)}</strong>
          </p>
          <form onSubmit={handlePago} style={s.form}>
            <div style={s.campo}>
              <label style={s.label}>Monto</label>
              <input type="number" min="0.01" step="0.01" max={pagoFactura.saldo} required value={monto} onChange={(e) => setMonto(e.target.value)} style={s.input} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Método</label>
              <select value={metodo} onChange={(e) => setMetodo(e.target.value)} style={s.input}>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
            {formError && <div style={s.error}>⚠️ {formError}</div>}
            <button type="submit" disabled={guardando} style={s.btnGuardar}>
              {guardando ? 'Registrando...' : 'Registrar pago'}
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
  error: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#991B1B', marginBottom: '1rem' },
  btnAccion: { background: 'none', border: '1px solid #D1D5DB', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', color: '#374151' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  campo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#374151' },
  input: { padding: '10px 12px', border: '1.5px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' },
  btnGuardar: { background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
};
