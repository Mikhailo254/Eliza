// src/components/pages/CalendarPage/DayEventsPanel.jsx

import { formatUAH, formatTons } from "./economics";

function labelById(list, id, fallback = "—") {
  return list.find((x) => String(x.id) === String(id))?.name || fallback;
}

function workerNames(workers, ids) {
  const set = new Set((ids || []).map((x) => Number(x)));

  return workers
    .filter((w) => set.has(Number(w.id)))
    .map((w) => w.name)
    .join(", ");
}

function formatDateUA(iso) {
  if (!iso) return "";

  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);

  return date.toLocaleDateString("uk-UA", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function DayEventsPanel({
  dateISO,
  events,
  mode,
  refs,
  economics,
  selectedScenario,
  onAdd,
  onEdit,
}) {
  const { fields, crops, operations, machines, workers } = refs;

  return (
    <div className="day-panel">
      {/* ======================
          Header
      ====================== */}
      <div className="day-panel__top">
        <div className="day-panel__title">
          {formatDateUA(dateISO)}
          <span className="day-panel__mode">
            {mode === "plan" ? "План" : "Факт"}
          </span>
        </div>

        <button type="button" className="day-panel__add" onClick={onAdd}>
          + Додати
        </button>
      </div>

      {/* ======================
          Economics (for selected day)
      ====================== */}
      {economics &&
        (economics.totalCosts > 0 || economics.expectedRevenue > 0) && (
          <div className="day-panel__econ">
            <div className="day-panel__econ-row">
              <span>Витрати дня:</span>{" "}
              <b>{formatUAH(economics.totalCosts)} грн</b>
            </div>

            {selectedScenario ? (
              <>
                <div className="day-panel__econ-row">
                  <span>Виручка (сценарій):</span>{" "}
                  <b>{formatUAH(selectedScenario.revenue)} грн</b>
                </div>
                <div className="day-panel__econ-row">
                  <span>Обсяг:</span>{" "}
                  <b>{formatTons(selectedScenario.tons)} т</b>
                </div>
              </>
            ) : (
              <div className="day-panel__econ-row">
                <span>Виручка (очікувана):</span>{" "}
                <b>{formatUAH(economics.expectedRevenue)} грн</b>
              </div>
            )}
          </div>
        )}

      {/* ======================
          Content
      ====================== */}
      {events.length === 0 ? (
        <div className="day-panel__empty">
          На цей день подій немає. Натисни “Додати”, щоб створити запис.
        </div>
      ) : (
        <div className="day-panel__list">
          {events.map((e) => {
            const op = labelById(
              operations,
              e.operationId,
              "Операція не задана"
            );
            const field = labelById(fields, e.fieldId, "Поле не задане");
            const crop = labelById(crops, e.cropId, "Культура не задана");
            const machine = labelById(
              machines,
              e.machineId,
              "Техніка не задана"
            );
            const wnames = workerNames(workers, e.workerIds);

            const time =
              e.startTime && e.endTime
                ? `${e.startTime}–${e.endTime}`
                : e.startTime
                ? `${e.startTime}`
                : e.durationHours
                ? `${e.durationHours} год`
                : "—";

            return (
              <button
                key={e.id}
                type="button"
                className="day-panel__item"
                onClick={() => onEdit(e)}
              >
                <div className="day-panel__item-top">
                  <div className="day-panel__item-title">{op}</div>
                  <div className="day-panel__item-time">{time}</div>
                </div>

                <div className="day-panel__meta">
                  <div className="day-panel__meta-row">
                    <span>Поле:</span> <b>{field}</b>
                  </div>

                  <div className="day-panel__meta-row">
                    <span>Культура:</span> <b>{crop}</b>
                  </div>

                  <div className="day-panel__meta-row">
                    <span>Техніка:</span> <b>{machine}</b>
                  </div>

                  <div className="day-panel__meta-row">
                    <span>Працівники:</span> <b>{wnames || "—"}</b>
                  </div>

                  {e.weatherConstraint && (
                    <div className="day-panel__meta-row">
                      <span>Погодні умови:</span>
                      <b>{e.weatherConstraint}</b>
                    </div>
                  )}
                </div>

                {e.notes && <div className="day-panel__note">{e.notes}</div>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DayEventsPanel;
