import React from 'react';

export default function Tabla({ columnas, filas, renderAcciones }) {
  return (
    <div style={s.wrapper}>
      <table style={s.tabla}>
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col.key} style={s.th}>{col.label}</th>
            ))}
            {renderAcciones && <th style={s.th}>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 && (
            <tr><td colSpan={columnas.length + 1} style={s.vacio}>Sin registros</td></tr>
          )}
          {filas.map((fila) => (
            <tr key={fila.id} style={s.tr}>
              {columnas.map((col) => (
                <td key={col.key} style={s.td}>
                  {col.render ? col.render(fila) : fila[col.key]}
                </td>
              ))}
              {renderAcciones && <td style={s.td}>{renderAcciones(fila)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const s = {
  wrapper: { background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' },
  tabla: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { textAlign: 'left', padding: '10px 14px', background: '#F3F4F6', color: '#374151', fontWeight: 'bold', borderBottom: '1px solid #E5E7EB' },
  tr: { borderBottom: '1px solid #F3F4F6' },
  td: { padding: '10px 14px', color: '#111827' },
  vacio: { padding: '1.5rem', textAlign: 'center', color: '#9CA3AF' },
};
