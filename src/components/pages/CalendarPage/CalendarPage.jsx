// src/components/pages/CalendarPage/CalendarPage.jsx

import { useMemo, useState } from "react";

import CalendarGrid from "./CalendarGrid";
import DayEventsPanel from "./DayEventsPanel";
import CalendarEventModal from "./CalendarEventModal";

import {
  CALENDAR_MODES,
  EMPTY_EVENT,
  initialEvents,
  initialDemoFields,
  initialDemoCrops,
  initialDemoOperations,
  initialDemoMachines,
  initialDemoWorkers,
  initialDemoWeatherScenarios,
  initialDemoOperationCosts,
} from "./calendarConfig";

import {
  computeEconomics,
  formatUAH,
  formatPct,
  formatTons,
} from "./economics";

function toISODate(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function isSameMonth(isoDate, monthCursor) {
  if (!isoDate) return false;
  const [y, m] = isoDate.split("-").map(Number);
  return y === monthCursor.getFullYear() && m === monthCursor.getMonth() + 1;
}

function CalendarPage() {
  // Тимчасово: демо-довідники. Потім заміниш на свої стани/дані з інших вкладок або з БД.
  const [fields] = useState(initialDemoFields);
  const [crops] = useState(initialDemoCrops);
  const [operations] = useState(initialDemoOperations);
  const [machines] = useState(initialDemoMachines);
  const [workers] = useState(initialDemoWorkers);
  const [weatherScenarios] = useState(initialDemoWeatherScenarios);
  const [operationCosts] = useState(initialDemoOperationCosts);

  const [events, setEvents] = useState(initialEvents);

  const today = useMemo(() => new Date(), []);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(() => toISODate(today));

  const [mode, setMode] = useState("plan"); // plan | fact

  // Фільтри
  const [filterFieldId, setFilterFieldId] = useState("");
  const [filterOperationId, setFilterOperationId] = useState("");
  const [filterMachineId, setFilterMachineId] = useState("");
  const [filterWorkerId, setFilterWorkerId] = useState("");

  // Економіка: сценарій для перегляду ("" = очікувані значення)
  const [economyScenarioId, setEconomyScenarioId] = useState("");

  // Згортання економіки
  const [isEconCollapsed, setIsEconCollapsed] = useState(false);

  // Модалка
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const openCreate = (dateISO) => {
    const newEvent = {
      ...EMPTY_EVENT,
      id: Date.now(),
      mode,
      date: dateISO,
      status: mode === "plan" ? "planned" : "done",
    };

    setSelectedEvent(newEvent);
    setIsCreateMode(true);
    setIsModalOpen(true);
  };

  const openEdit = (evt) => {
    setSelectedEvent(evt);
    setIsCreateMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setIsModalOpen(false);
    setSelectedEvent(null);
    setIsCreateMode(false);
  };

  const handleSave = (evt) => {
    setEvents((prev) => {
      const exists = prev.some((x) => x.id === evt.id);
      if (exists) return prev.map((x) => (x.id === evt.id ? evt : x));
      return [...prev, evt];
    });

    setIsModalOpen(false);
    setSelectedEvent(null);
    setIsCreateMode(false);
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => e.mode === mode)
      .filter((e) => (filterFieldId ? e.fieldId === filterFieldId : true))
      .filter((e) =>
        filterOperationId ? e.operationId === filterOperationId : true
      )
      .filter((e) => (filterMachineId ? e.machineId === filterMachineId : true))
      .filter((e) =>
        filterWorkerId
          ? (e.workerIds || []).includes(Number(filterWorkerId))
          : true
      );
  }, [
    events,
    mode,
    filterFieldId,
    filterOperationId,
    filterMachineId,
    filterWorkerId,
  ]);

  const monthEvents = useMemo(() => {
    return filteredEvents.filter((e) => isSameMonth(e.date, monthCursor));
  }, [filteredEvents, monthCursor]);

  const econ = useMemo(() => {
    return computeEconomics({
      events: monthEvents,
      fields,
      crops,
      weatherScenarios,
      operationCosts,
    });
  }, [monthEvents, fields, crops, weatherScenarios, operationCosts]);

  const selectedScenario = useMemo(() => {
    return econ.scenarioResults.find((s) => s.scenarioId === economyScenarioId);
  }, [econ.scenarioResults, economyScenarioId]);

  const eventsByDay = useMemo(() => {
    const map = new Map();

    for (const e of filteredEvents) {
      const key = e.date || "";
      if (!key) continue;

      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    }

    // стабільне сортування по часу/ID
    for (const [k, arr] of map.entries()) {
      arr.sort(
        (a, b) =>
          (a.startTime || "").localeCompare(b.startTime || "") ||
          String(a.id).localeCompare(String(b.id))
      );
      map.set(k, arr);
    }

    return map;
  }, [filteredEvents]);

  const dayEvents = eventsByDay.get(selectedDate) || [];

  const dayEcon = useMemo(() => {
    return computeEconomics({
      events: dayEvents,
      fields,
      crops,
      weatherScenarios,
      operationCosts,
    });
  }, [dayEvents, fields, crops, weatherScenarios, operationCosts]);

  const daySelectedScenario = useMemo(() => {
    if (!economyScenarioId) return null;
    return (
      dayEcon.scenarioResults.find((s) => s.scenarioId === economyScenarioId) ||
      null
    );
  }, [dayEcon.scenarioResults, economyScenarioId]);

  return (
    <div className="calendar-page">
      {/* ======================
          TOP BAR
      ====================== */}
      <div className="calendar-page__top">
        <div className="calendar-page__title-block">
          <h2 className="calendar-page__title">Календар</h2>
          <div className="calendar-page__subtitle">
            Планування та факт виконання робіт (з прив’язкою до ресурсів і
            погодних вікон)
          </div>
        </div>

        <div className="calendar-page__actions">
          <div className="calendar-page__segmented">
            {CALENDAR_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={
                  "calendar-page__seg-btn " +
                  (mode === m.id ? "calendar-page__seg-btn--active" : "")
                }
                onClick={() => setMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="calendar-page__primary-btn"
            onClick={() => openCreate(selectedDate)}
          >
            + Додати подію
          </button>
        </div>
      </div>

      {/* ======================
          FILTERS
      ====================== */}
      <div className="calendar-page__filters">
        <div className="calendar-page__filter">
          <div className="calendar-page__filter-label">Поле</div>
          <select
            className="calendar-page__select"
            value={filterFieldId}
            onChange={(e) => setFilterFieldId(e.target.value)}
          >
            <option value="">— всі —</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="calendar-page__filter">
          <div className="calendar-page__filter-label">Операція</div>
          <select
            className="calendar-page__select"
            value={filterOperationId}
            onChange={(e) => setFilterOperationId(e.target.value)}
          >
            <option value="">— всі —</option>
            {operations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <div className="calendar-page__filter">
          <div className="calendar-page__filter-label">Техніка</div>
          <select
            className="calendar-page__select"
            value={filterMachineId}
            onChange={(e) => setFilterMachineId(e.target.value)}
          >
            <option value="">— вся —</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="calendar-page__filter">
          <div className="calendar-page__filter-label">Працівник</div>
          <select
            className="calendar-page__select"
            value={filterWorkerId}
            onChange={(e) => setFilterWorkerId(e.target.value)}
          >
            <option value="">— всі —</option>
            {workers.map((w) => (
              <option key={w.id} value={String(w.id)}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="calendar-page__ghost-btn"
          onClick={() => {
            setFilterFieldId("");
            setFilterOperationId("");
            setFilterMachineId("");
            setFilterWorkerId("");
          }}
        >
          Скинути фільтри
        </button>
      </div>

      {/* ======================
          MAIN LAYOUT
          (1) calendar
          (2) daypanel
          (3) economics (full width via SCSS: grid-column: 1 / -1)
      ====================== */}
      <div className="calendar-page__layout">
        {/* Calendar */}
        <div className="calendar-page__calendar">
          <div className="calendar-page__monthbar">
            <button
              type="button"
              className="calendar-page__month-btn"
              onClick={() => setMonthCursor((d) => addMonths(d, -1))}
            >
              ←
            </button>

            <div className="calendar-page__month-title">
              {monthCursor.toLocaleDateString("uk-UA", {
                month: "long",
                year: "numeric",
              })}
            </div>

            <button
              type="button"
              className="calendar-page__month-btn"
              onClick={() => setMonthCursor((d) => addMonths(d, +1))}
            >
              →
            </button>

            <button
              type="button"
              className="calendar-page__today-btn"
              onClick={() => {
                const now = new Date();
                setMonthCursor(startOfMonth(now));
                setSelectedDate(toISODate(now));
              }}
            >
              Сьогодні
            </button>
          </div>

          <CalendarGrid
            monthCursor={monthCursor}
            selectedDate={selectedDate}
            onSelectDate={(iso) => setSelectedDate(iso)}
            eventsByDay={eventsByDay}
            onQuickAdd={(iso) => openCreate(iso)}
          />
        </div>

        {/* Day panel */}
        <div className="calendar-page__daypanel">
          <DayEventsPanel
            dateISO={selectedDate}
            events={dayEvents}
            mode={mode}
            refs={{ fields, crops, operations, machines, workers }}
            economics={dayEcon}
            selectedScenario={daySelectedScenario}
            onAdd={() => openCreate(selectedDate)}
            onEdit={openEdit}
          />
        </div>

        {/* ======================
            ECONOMICS (month) — ТЕПЕР ПІД УСІМ ЛЕЙАУТОМ (FULL WIDTH)
        ====================== */}
        <div className="calendar-page__economics">
          <div className="calendar-page__econ-top">
            <div className="calendar-page__econ-title">
              Економіка за{" "}
              {monthCursor.toLocaleDateString("uk-UA", {
                month: "long",
                year: "numeric",
              })}
            </div>

            <div className="calendar-page__econ-controls">
              <div className="calendar-page__econ-label">
                Сценарій (для перегляду)
              </div>
              <select
                className="calendar-page__select"
                value={economyScenarioId}
                onChange={(e) => setEconomyScenarioId(e.target.value)}
                disabled={isEconCollapsed}
              >
                <option value="">— Очікуване (усі сценарії) —</option>
                {weatherScenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="calendar-page__econ-toggle"
              onClick={() => setIsEconCollapsed((v) => !v)}
              aria-expanded={!isEconCollapsed}
              aria-controls="calendar-econ-body"
              title={
                isEconCollapsed ? "Розгорнути економіку" : "Згорнути економіку"
              }
            >
              <span className="calendar-page__econ-toggle-text">
                {isEconCollapsed ? "Показати" : "Сховати"}
              </span>
              <span
                className={
                  "calendar-page__econ-toggle-icon " +
                  (isEconCollapsed
                    ? "calendar-page__econ-toggle-icon--collapsed"
                    : "")
                }
                aria-hidden="true"
              >
                ▾
              </span>
            </button>
          </div>

          <div
            id="calendar-econ-body"
            className={
              "calendar-page__econ-body " +
              (isEconCollapsed ? "calendar-page__econ-body--collapsed" : "")
            }
          >
            <div className="calendar-page__econ-grid">
              <div className="calendar-page__econ-card">
                <div className="calendar-page__econ-k">Витрати</div>
                <div className="calendar-page__econ-v">
                  {formatUAH(econ.totalCosts)} грн
                </div>
              </div>

              <div className="calendar-page__econ-card">
                <div className="calendar-page__econ-k">Виручка</div>
                <div className="calendar-page__econ-v">
                  {formatUAH(econ.expectedRevenue)} грн
                </div>
                <div className="calendar-page__econ-s">(очікувана)</div>
              </div>

              <div className="calendar-page__econ-card">
                <div className="calendar-page__econ-k">Прибуток</div>
                <div className="calendar-page__econ-v">
                  {formatUAH(econ.expectedProfit)} грн
                </div>
                <div className="calendar-page__econ-s">(очікуваний)</div>
              </div>

              <div className="calendar-page__econ-card">
                <div className="calendar-page__econ-k">Ризик</div>
                <div className="calendar-page__econ-v">
                  σ = {formatUAH(econ.stdProfit)} грн
                </div>
                <div className="calendar-page__econ-s">
                  Var = {formatUAH(econ.varianceProfit)} грн²
                </div>
              </div>
            </div>

            {selectedScenario && (
              <div className="calendar-page__econ-details">
                <div className="calendar-page__econ-detail">
                  <span>Тоннаж:</span>{" "}
                  <b>{formatTons(selectedScenario.tons)} т</b>
                </div>
                <div className="calendar-page__econ-detail">
                  <span>Виручка (сценарій):</span>{" "}
                  <b>{formatUAH(selectedScenario.revenue)} грн</b>
                </div>
                <div className="calendar-page__econ-detail">
                  <span>Прибуток (сценарій):</span>{" "}
                  <b>{formatUAH(selectedScenario.profit)} грн</b>
                </div>
                <div className="calendar-page__econ-detail">
                  <span>Собівартість:</span>{" "}
                  <b>{formatUAH(selectedScenario.costPerTon)} грн/т</b>
                </div>
                <div className="calendar-page__econ-detail">
                  <span>Рентабельність реалізації:</span>{" "}
                  <b>{formatPct(selectedScenario.rentSales)}%</b>
                </div>
                <div className="calendar-page__econ-detail">
                  <span>Рентабельність витрат:</span>{" "}
                  <b>{formatPct(selectedScenario.rentCosts)}%</b>
                </div>
              </div>
            )}

            {econ.missingCostRows.length > 0 && (
              <div className="calendar-page__econ-warn">
                Не задані витрати (грн/га) для деяких пар «культура–операція».
                Через це частина витрат не врахована.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================
          MODAL
      ====================== */}
      {isModalOpen && selectedEvent && (
        <CalendarEventModal
          event={selectedEvent}
          refs={{ fields, crops, operations, machines, workers }}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
            setIsCreateMode(false);
          }}
          initialEditing={isCreateMode}
        />
      )}
    </div>
  );
}

export default CalendarPage;
