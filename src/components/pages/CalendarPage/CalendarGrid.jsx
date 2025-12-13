// src/components/pages/CalendarPage/CalendarGrid.jsx

import { useMemo } from "react";

function pad(n) {
  return String(n).padStart(2, "0");
}

function toISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfCalendarGrid(monthCursor) {
  // Починаємо з понеділка
  const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const day = (first.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const start = new Date(first);
  start.setDate(first.getDate() - day);
  return start;
}

function CalendarGrid({
  monthCursor,
  selectedDate,
  onSelectDate,
  eventsByDay,
  onQuickAdd,
}) {
  const days = useMemo(() => {
    const start = startOfCalendarGrid(monthCursor);
    const arr = [];

    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      arr.push(d);
    }

    return arr;
  }, [monthCursor]);

  const monthIndex = monthCursor.getMonth();
  const weekNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  const handleCellKeyDown = (e, iso) => {
    // Enter/Space -> select
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectDate(iso);
    }
  };

  return (
    <div className="calendar-grid">
      <div className="calendar-grid__week">
        {weekNames.map((w) => (
          <div key={w} className="calendar-grid__weekcell">
            {w}
          </div>
        ))}
      </div>

      <div className="calendar-grid__cells">
        {days.map((d) => {
          const iso = toISODate(d);
          const inMonth = d.getMonth() === monthIndex;
          const isSelected = iso === selectedDate;

          const dayEvents = eventsByDay.get(iso) || [];
          const count = dayEvents.length;

          return (
            <div
              key={iso}
              role="button"
              tabIndex={0}
              className={
                "calendar-grid__cell " +
                (inMonth ? "" : "calendar-grid__cell--muted ") +
                (isSelected ? "calendar-grid__cell--selected" : "")
              }
              onClick={() => onSelectDate(iso)}
              onKeyDown={(e) => handleCellKeyDown(e, iso)}
              title={iso}
            >
              <div className="calendar-grid__cell-top">
                <span className="calendar-grid__daynum">{d.getDate()}</span>

                <button
                  type="button"
                  className="calendar-grid__add"
                  onClick={(e) => {
                    e.stopPropagation(); // щоб не тригерити select дня
                    onQuickAdd(iso);
                  }}
                  title="Додати подію"
                >
                  +
                </button>
              </div>

              <div className="calendar-grid__cell-bottom">
                {count > 0 ? (
                  <div className="calendar-grid__badge">{count} под.</div>
                ) : (
                  <div className="calendar-grid__empty" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarGrid;
