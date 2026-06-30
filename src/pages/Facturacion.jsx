import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import facturasService from '../services/facturasService';
import clientesService from '../services/clientesService';
import productosService from '../services/productosService';
import Modal from '../components/Modal';
import Tabla from '../components/Tabla';

const ESTADO_COLOR = {
  pendiente: { bg: '#FEF3C7', text: '#92400E' },
  parcial: { bg: '#DBEAFE', text: '#1E40AF' },
  pagada: { bg: '#DCFCE7', text: '#166534' },
  anulada: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function Facturacion() {
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalNueva, setModalNueva] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [impuestoPct, setImpuestoPct] = useState(0);
  const [lineas, setLineas] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');

  const [detalle, setDetalle] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const [f, c, p] = await Promise.all([facturasService.listar(), clientesService.listar(), productosService.listar()]);
      setFacturas(f);
      setClientes(c);
      setProductos(p);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar facturación');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirNueva = () => {
    setClienteId('');
    setImpuestoPct(0);
    setLineas([]);
    setFormError('');
    setModalNueva(true);
  };

  const agregarLinea = () => setLineas((l) => [...l, { producto_id: '', cantidad: 1 }]);
  const actualizarLinea = (idx, campo, valor) => setLineas((l) => l.map((ln, i) => i === idx ? { ...ln, [campo]: valor } : ln));
  const quitarLinea = (idx) => setLineas((l) => l.filter((_, i) => i !== idx));

  const productoPorId = (id) => productos.find((p) => String(p.id) === String(id));

  const subtotalCalc = lineas.reduce((acc, ln) => {
    const p = productoPorId(ln.producto_id);
    return acc + (p ? Number(p.precio) * Number(ln.cantidad || 0) : 0);
  }, 0);
  const impuestoCalc = subtotalCalc * (Number(impuestoPct || 0) / 100);
  const totalCalc = subtotalCalc + impuestoCalc;

  const handleCrearFactura = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!clienteId) return setFormError('Selecciona un cliente');
    if (lineas.length === 0) return setFormError('Agrega al menos un producto');
    setGuardando(true);
    try {
      await facturasService.crear({
        cliente_id: clienteId,
        impuesto_pct: Number(impuestoPct) || 0,
        items: lineas.map((l) => ({ producto_id: l.producto_id, cantidad: Number(l.cantidad) })),
      });
      setModalNueva(false);
      cargar();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al crear factura');
    } finally {
      setGuardando(false);
    }
  };

  const verDetalle = async (f) => {
    setDetalle({ cargando: true });
    try {
      const data = await facturasService.obtener(f.id);
      setDetalle(data);
    } catch (err) {
      setDetalle(null);
    }
  };

  const handleAnular = async (f) => {
    try {
      await facturasService.anular(f.id);
      cargar();
      setDetalle(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al anular factura');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Arial, sans-serif' }}>
      <header style={s.header}>
        <button onClick={() => navigate('/dashboard')} style={s.volver}>← Dashboard</button>
        <h1 style={s.tituloHeader}>Facturación</h1>
        <button onClick={abrirNueva} style={s.btnNuevo}>+ Nueva factura</button>
      </header>
      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {error && <div style={s.error}>⚠️ {error}</div>}
        {cargando ? (
          <p style={{ color: '#6B7280' }}>Cargando...</p>
        ) : (
          <Tabla
            columnas={[
              { key: 'numero', label: 'Número' },
              { key: 'cliente', label: 'Cliente' },
              { key: 'total', label: 'Total', render: (f) => `$${Number(f.total).toFixed(2)}` },
              { key: 'estado', label: 'Estado', render: (f) => (
                <span style={{ ...s.badge, background: ESTADO_COLOR[f.estado]?.bg, color: ESTADO_COLOR[f.estado]?.text }}>
                  {f.estado}
                </span>
              ) },
              { key: 'creado_en', label: 'Fecha', render: (f) => new Date(f.creado_en).toLocaleDateString() },
            ]}
            filas={facturas}
            renderAcciones={(f) => (
              <button onClick={() => verDetalle(f)} style={s.btnAccion}>Ver</button>
            )}
          />
        )}
      </main>

      {modalNueva && (
        <Modal titulo="Nueva factura" onClose={() => setModalNueva(false)} ancho="560px">
          <form onSubmit={handleCrearFactura} style={s.form}>
            <div style={s.campo}>
              <label style={s.label}>Cliente</label>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} style={s.input}>
                <option value="">Selecciona un cliente</option>
                {clientes.filter(c => c.activo).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div style={s.campo}>
              <label style={s.label}>Productos</label>
              {lineas.map((ln, idx) => {
                const prod = productoPorId(ln.producto_id);
                return (
                  <div key={idx} style={s.filaLinea}>
                    <select value={ln.producto_id} onChange={(e) => actualizarLinea(idx, 'producto_id', e.target.value)} style={{ ...s.input, flex: 2 }}>
                      <option value="">Producto</option>
                      {productos.filter(p => p.activo).map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>
                      ))}
                    </select>
                    <input type="number" min="1" max={prod?.stock || 999} value={ln.cantidad}
                      onChange={(e) => actualizarLinea(idx, 'cantidad', e.target.value)}
                      style={{ ...s.input, flex: 1 }} />
                    <span style={{ flex: 1, fontSize: '13px', color: '#374151' }}>
                      ${prod ? (Number(prod.precio) * Number(ln.cantidad || 0)).toFixed(2) : '0.00'}
                    </span>
                    <button type="button" onClick={() => quitarLinea(idx)} style={s.btnQuitar}>✕</button>
                  </div>
                );
              })}
              <button type="button" onClick={agregarLinea} style={s.btnAgregar}>+ Agregar producto</button>
            </div>

            <div style={s.campo}>
              <label style={s.label}>Impuesto (%)</label>
              <input type="number" min="0" step="0.01" value={impuestoPct} onChange={(e) => setImpuestoPct(e.target.value)} style={s.input} />
            </div>

            <div style={s.resumen}>
              <div>Subtotal: <strong>${subtotalCalc.toFixed(2)}</strong></div>
              <div>Impuesto: <strong>${impuestoCalc.toFixed(2)}</strong></div>
              <div>Total: <strong>${totalCalc.toFixed(2)}</strong></div>
            </div>

            {formError && <div style={s.error}>⚠️ {formError}</div>}
            <button type="submit" disabled={guardando} style={s.btnGuardar}>
              {guardando ? 'Creando...' : 'Crear factura'}
            </button>
          </form>
        </Modal>
      )}

      {detalle && (
        <Modal titulo={detalle.numero ? `Factura ${detalle.numero}` : 'Factura'} onClose={() => setDetalle(null)} ancho="560px">
          {detalle.cargando ? (
            <p style={{ color: '#6B7280' }}>Cargando...</p>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: '#374151' }}>
                <strong>Cliente:</strong> {detalle.cliente} · <strong>Estado:</strong>{' '}
                <span style={{ ...s.badge, background: ESTADO_COLOR[detalle.estado]?.bg, color: ESTADO_COLOR[detalle.estado]?.text }}>
                  {detalle.estado}
                </span>
              </p>
              <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                <thead>
                  <tr style={{ background: '#F3F4F6' }}>
                    <th style={s.thMini}>Producto</th><th style={s.thMini}>Cant.</th><th style={s.thMini}>Precio</th><th style={s.thMini}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.items?.map((it) => (
                    <tr key={it.id || it.nombre_producto}>
                      <td style={s.tdMini}>{it.nombre_producto || it.nombre}</td>
                      <td style={s.tdMini}>{it.cantidad}</td>
                      <td style={s.tdMini}>${Number(it.precio_unitario || it.precio).toFixed(2)}</td>
                      <td style={s.tdMini}>${Number(it.subtotal_linea || it.subtotalLinea).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={s.resumen}>
                <div>Subtotal: <strong>${Number(detalle.subtotal).toFixed(2)}</strong></div>
                <div>Impuesto ({detalle.impuesto_pct}%): <strong>${Number(detalle.impuesto_monto).toFixed(2)}</strong></div>
                <div>Total: <strong>${Number(detalle.total).toFixed(2)}</strong></div>
                <div>Pagado: <strong>${Number(detalle.total_pagado || 0).toFixed(2)}</strong></div>
              </div>
              {detalle.pagos?.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <strong style={{ fontSize: '13px' }}>Pagos:</strong>
                  <ul style={{ fontSize: '12px', color: '#6B7280', paddingLeft: '1.2rem' }}>
                    {detalle.pagos.map((p) => (
                      <li key={p.id}>${Number(p.monto).toFixed(2)} ({p.metodo}) — {new Date(p.creado_en).toLocaleString()}</li>
                    ))}
                  </ul>
                </div>
              )}
              {detalle.estado !== 'anulada' && (!detalle.pagos || detalle.pagos.length === 0) && (
                <button onClick={() => handleAnular(detalle)} style={s.btnAnular}>Anular factura</button>
              )}
            </div>
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
  filaLinea: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' },
  btnQuitar: { background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontSize: '14px' },
  btnAgregar: { background: 'none', border: '1px dashed #1A3A6B', color: '#1A3A6B', borderRadius: '6px', padding: '8px', fontSize: '13px', cursor: 'pointer', marginTop: '4px' },
  resumen: { background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#374151', display: 'flex', flexDirection: 'column', gap: '4px' },
  thMini: { textAlign: 'left', padding: '6px 8px', fontSize: '12px' },
  tdMini: { padding: '6px 8px', fontSize: '12px', borderBottom: '1px solid #F3F4F6' },
  btnAnular: { marginTop: '1rem', background: '#991B1B', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', width: '100%' },
};
