import React from "react";

export default function DayCell({ dateKey, dayNum, inMonth, items, onAdd, onEdit, onDelete }) {
  return (
    <div className={`cell ${inMonth ? "" : "muted"}`}>
      <div className="cell-head">
        <span className="day">{dayNum || ""}</span>
        {inMonth && <button className="add" title="Agregar" onClick={onAdd}>＋</button>}
      </div>

      <div className="cell-items">
        {(items || []).map(it => (
          <div key={it.id} className="pill" title={it.desc || ""}>
            <span className="pill-title" onClick={() => onEdit(it)}>{it.title}</span>
            <button className="pill-del" onClick={() => onDelete(it)} title="Eliminar">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
