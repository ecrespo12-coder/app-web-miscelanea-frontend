import React from 'react';

export default function Modal({ titulo, onClose, children, ancho = '420px' }) {
  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={{ ...s.card, maxWidth: ancho }} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <h3 style={s.titulo}>{titulo}</h3>
          <button onClick={onClose} style={s.cerrar}>✕</button>
        </div>
        <div style={s.body}>{children}</div>
      </div>
    </div>
  );
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 },
  card: { background: '#fff', borderRadius: '12px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #E5E7EB' },
  titulo: { margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#0A1628' },
  cerrar: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#6B7280' },
  body: { padding: '1.25rem' },
};
