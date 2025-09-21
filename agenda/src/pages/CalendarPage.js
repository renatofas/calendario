import React, { useState } from "react";
import Calendar from "../components/Calendar";

export default function CalendarPage({ onBack }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-11

  function prevMonth() {
    const d = new Date(year, month, 1);
    d.setMonth(d.getMonth() - 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  function nextMonth() {
    const d = new Date(year, month, 1);
    d.setMonth(d.getMonth() + 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  const monthNames = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <button className="back" onClick={onBack}>← Volver</button>
        <div className="nav">
          <button onClick={prevMonth}>‹</button>
          <h2>{monthNames[month]} {year}</h2>
          <button onClick={nextMonth}>›</button>
        </div>
      </header>

      <Calendar year={year} month={month} storageKey="agendaCachIIIa" />
    </div>
  );
}
