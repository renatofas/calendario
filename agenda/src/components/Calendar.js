import React, { useMemo, useState, useEffect } from "react";
import DayCell from "./DayCell";
import Modal from "./Modal";

export default function Calendar({ year, month, storageKey }) {
  // Cargamos del JSON público una sola vez
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { date, item? }
  const [events, setEvents] = useState({});     // copia editable en memoria

  useEffect(() => {
    async function load() {
  try {
    const res = await fetch("/calendar.json", { cache: "no-store" });
    const data = await res.json();
    setEvents(data || {}); // todos ven esto igual
  } catch (e) {
    console.error("No se pudo cargar calendar.json", e);
    setEvents({});
  } finally {
    setLoading(false);
  }
}

    load();
  }, []);

  // --- Si quieres permitir edición local (no global) quita estos handlers ---
  function addOrEdit(dateStr, payload, existingId) {
    setEvents(prev => {
      const list = prev[dateStr] ? [...prev[dateStr]] : [];
      if (existingId) {
        const idx = list.findIndex(x => x.id === existingId);
        if (idx !== -1) list[idx] = { ...list[idx], ...payload };
      } else {
        list.push({ id: cryptoRandom(), ...payload });
      }
      return { ...prev, [dateStr]: list };
    });
  }
  function removeItem(dateStr, id) {
    setEvents(prev => {
      const list = (prev[dateStr] || []).filter(x => x.id !== id);
      const next = { ...prev };
      if (list.length) next[dateStr] = list; else delete next[dateStr];
      return next;
    });
  }
  function cryptoRandom() { return Math.random().toString(36).slice(2, 9); }

  // Exportar JSON para que lo subas tú al repo (manual, sin backend)
  function exportJson() {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "calendar.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const firstDay = useMemo(() => new Date(year, month, 1), [year, month]);
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startWeekday + 1;
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
    const dateObj = new Date(year, month, inMonth ? dayNum : 0);
    const y = dateObj.getFullYear();
    const m = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    const d = ("0" + dateObj.getDate()).slice(-2);
    const key = `${y}-${m}-${d}`;
    cells.push({ key, dayNum: inMonth ? dayNum : null, inMonth });
  }

  if (loading) return <div style={{padding:16}}>Cargando calendario...</div>;

  return (
    <div className="calendar">
      <div style={{display:"flex", justifyContent:"flex-end", marginBottom:10, gap:8}}>
        <button className="btn" onClick={exportJson} title="Descarga el JSON y súbelo a /public para que todos lo vean">
          Exportar JSON
        </button>
      </div>

      <div className="weekdays">
        {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid">
        {cells.map(c => (
          <DayCell
            key={c.key}
            dateKey={c.key}
            dayNum={c.dayNum}
            inMonth={c.inMonth}
            items={events[c.key] || []}
            onAdd={() => setEditing({ date: c.key })}
            onEdit={(item) => setEditing({ date: c.key, item })}
            onDelete={(item) => removeItem(c.key, item.id)}
          />
        ))}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <EventForm
            date={editing.date}
            initial={editing.item}
            onCancel={() => setEditing(null)}
            onSave={(data) => {
              addOrEdit(editing.date, data, editing.item?.id);
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function EventForm({ date, initial, onSave, onCancel }) {
  const [title, setTitle] = React.useState(initial?.title || "");
  const [desc, setDesc] = React.useState(initial?.desc || "");
  return (
    <div className="modal-body">
      <h3>{initial ? "Editar" : "Agregar"} evento</h3>
      <p className="date-tag">{date}</p>
      <label className="field">
        <span>Título</span>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Prueba de Física" />
      </label>
      <label className="field">
        <span>Detalle (opcional)</span>
        <textarea rows="4" value={desc} onChange={e => setDesc(e.target.value)} />
      </label>
      <div className="actions">
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn primary" onClick={() => onSave({ title: title.trim(), desc: desc.trim() })} disabled={!title.trim()}>
          Guardar
        </button>
      </div>
    </div>
  );
}
