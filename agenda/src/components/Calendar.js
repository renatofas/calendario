import React, { useMemo, useState, useEffect } from "react";
import DayCell from "./DayCell";
import Modal from "./Modal";

// Helpers de storage
function loadEvents(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveEvents(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export default function Calendar({ year, month, storageKey }) {
  const [events, setEvents] = useState(() => loadEvents(storageKey)); // { "YYYY-MM-DD": [{id,title,desc}] }
  const [editing, setEditing] = useState(null); // { date: "YYYY-MM-DD", item?: {...} }

  useEffect(() => { saveEvents(storageKey, events); }, [events, storageKey]);

  const firstDay = useMemo(() => new Date(year, month, 1), [year, month]);
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);

  const startWeekday = (firstDay.getDay() + 6) % 7; // Lunes=0 ... Domingo=6
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

  function cryptoRandom() {
    // ID simple
    return Math.random().toString(36).slice(2, 9);
  }

  return (
    <div className="calendar">
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
  const [title, setTitle] = useState(initial?.title || "");
  const [desc, setDesc] = useState(initial?.desc || "");
  return (
    <div className="modal-body">
      <h3>{initial ? "Editar" : "Agregar"} evento</h3>
      <p className="date-tag">{date}</p>
      <label className="field">
        <span>Título (ej: Prueba de Matemática)</span>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Historia - Trabajo grupal" />
      </label>
      <label className="field">
        <span>Detalle (opcional)</span>
        <textarea rows="4" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Capítulos, rúbrica, materiales, etc." />
      </label>
      <div className="actions">
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button
          className="btn primary"
          onClick={() => onSave({ title: title.trim(), desc: desc.trim() })}
          disabled={!title.trim()}
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
