import React, { useState } from "react";
import CalendarPage from "./pages/CalendarPage";

export default function App() {
  const [route, setRoute] = useState("home"); // "home" | "calendar"

  if (route === "calendar") return <CalendarPage onBack={() => setRoute("home")} />;

  // Portada (estática; solo "Calendario" funciona)
  return (
    <div className="hero">
      <div className="hero-left">
        <h1 className="title">AGENDA CACH</h1>
        <div className="year">2025</div>

        <p className="subtitle">
          Calendarios, evaluaciones y comunicación eficiente en un solo lugar.
        </p>

        <div className="grado">III°A</div>

        <div className="btns">
          <button className="btn primary" onClick={() => setRoute("calendar")}>
            Calendario
          </button>
          <button className="btn" disabled>Rachas de motivación</button>
          <button className="btn" disabled>Mis notas</button>
          <button className="btn" disabled>Mi progreso</button>
        </div>

        <button className="cta" disabled>Más información aquí</button>

        <div className="footer">@colegio_Cach</div>
      </div>

      <div className="hero-right">
        {/* Ilustración representativa */}
        <div className="card-illustration">
          <div className="lamp"></div>
          <div className="person"></div>
          <div className="books"></div>
          <div className="plant"></div>
        </div>
      </div>
    </div>
  );
}
