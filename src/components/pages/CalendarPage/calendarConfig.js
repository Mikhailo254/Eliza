// src/components/pages/CalendarPage/calendarConfig.js

// ==============================
// Режими календаря (План / Факт)
// ==============================
export const CALENDAR_MODES = [
  { id: "plan", label: "План" },
  { id: "fact", label: "Факт" },
];

// =======================================
// Статуси виконання (для контролю/моделі)
// =======================================
export const EVENT_STATUSES = [
  { id: "planned", label: "Заплановано" },
  { id: "in_progress", label: "В процесі" },
  { id: "done", label: "Виконано" },
  { id: "canceled", label: "Скасовано" },
];

// =======================================
// Типи подій (операція / нотатка)
// =======================================
export const EVENT_TYPES = [
  { id: "operation", label: "Агротехнічна операція" },
  { id: "note", label: "Нотатка / подія" },
];

// =======================================
// Мінімальний шаблон події календаря
// =======================================
export const EMPTY_EVENT = {
  id: null,

  mode: "plan", // plan | fact
  type: "operation", // operation | note

  date: "", // YYYY-MM-DD
  startTime: "", // HH:MM (опціонально)
  endTime: "", // HH:MM (опціонально)

  fieldId: "", // привʼязка до поля
  cropId: "", // привʼязка до культури
  operationId: "", // оранка / сівба / хімобробка...
  machineId: "", // техніка
  workerIds: [], // працівники

  status: "planned", // planned | in_progress | done | canceled
  durationHours: "", // тривалість (для моделі)

  notes: "",

  // Під заготовку погодних сценаріїв
  weatherScenarioId: "",
  weatherConstraint: "", // "ранок / вечір / вітер / опади"
};

// ==================================================
// Демо-дані (пізніше заміниш на реальні з вкладок)
// ==================================================
export const initialDemoFields = [
  { id: "f1", name: "Поле №1", areaHa: 42.5 },
  { id: "f2", name: "Поле №2", areaHa: 31.2 },
];

export const initialDemoCrops = [
  // Y0 (т/га) та Pc (грн/т) потрібні для економіки (розділ 2.5)
  { id: "c1", name: "Соя", baseYield: 2.6, pricePerTon: 15000 },
  { id: "c2", name: "Пшениця", baseYield: 4.8, pricePerTon: 7000 },
];

// ==============================
// Демо-погодні сценарії
// ==============================
// Коефіцієнти yieldFactor є аналогом \u03b1_{c,s} з моделі (2.4.3)
export const initialDemoWeatherScenarios = [
  {
    id: "ws_norm",
    name: "Нормальний рік",
    probability: 0.5,
    cropImpacts: [
      { cropId: "c1", yieldFactor: 1.0 },
      { cropId: "c2", yieldFactor: 1.0 },
    ],
  },
  {
    id: "ws_drought",
    name: "Посуха",
    probability: 0.3,
    cropImpacts: [
      { cropId: "c1", yieldFactor: 0.82 },
      { cropId: "c2", yieldFactor: 0.78 },
    ],
  },
  {
    id: "ws_wet",
    name: "Надмірна вологість",
    probability: 0.2,
    cropImpacts: [
      { cropId: "c1", yieldFactor: 0.92 },
      { cropId: "c2", yieldFactor: 0.9 },
    ],
  },
];

// ==============================
// Демо-вартості операцій (грн/га)
// ==============================
// Це спрощене представлення параметрів k^{own}_{c,j} та k^{hire}_{c,j} (2.5.1)
export const initialDemoOperationCosts = [
  { cropId: "c1", operationId: "o_pl", costOwn: 1500, costHire: 2200 },
  { cropId: "c1", operationId: "o_sow", costOwn: 1200, costHire: 1800 },
  { cropId: "c1", operationId: "o_chem", costOwn: 900, costHire: 1300 },
  { cropId: "c1", operationId: "o_harv", costOwn: 2200, costHire: 3200 },

  { cropId: "c2", operationId: "o_pl", costOwn: 1400, costHire: 2100 },
  { cropId: "c2", operationId: "o_sow", costOwn: 1100, costHire: 1700 },
  { cropId: "c2", operationId: "o_chem", costOwn: 850, costHire: 1250 },
  { cropId: "c2", operationId: "o_harv", costOwn: 2000, costHire: 3000 },
];

export const initialDemoOperations = [
  { id: "o_pl", name: "Оранка" },
  { id: "o_sow", name: "Сівба" },
  { id: "o_chem", name: "Хімобробка" },
  { id: "o_harv", name: "Збирання" },
];

export const initialDemoMachines = [
  { id: "m1", name: "Трактор МТЗ-82" },
  { id: "m2", name: "Обприскувач 3000л" },
];

export const initialDemoWorkers = [
  { id: 1, name: "Іван Петрович" },
  { id: 2, name: "Олег" },
];

// ==============================
// Початкові події календаря
// ==============================
export const initialEvents = [
  {
    id: 101,
    mode: "plan",
    type: "operation",
    date: "2025-12-12",
    startTime: "",
    endTime: "",
    fieldId: "f1",
    cropId: "c1",
    operationId: "o_sow",
    machineId: "m1",
    workerIds: [1],
    status: "planned",
    durationHours: 6,
    notes: "Сівалка + трактор. Перевірити насіння.",
    weatherScenarioId: "",
    weatherConstraint: "",
  },
  {
    id: 102,
    mode: "fact",
    type: "operation",
    date: "2025-12-11",
    startTime: "17:30",
    endTime: "20:00",
    fieldId: "f2",
    cropId: "c2",
    operationId: "o_chem",
    machineId: "m2",
    workerIds: [2],
    status: "done",
    durationHours: 2.5,
    notes: "Вечірнє вікно, вітер норм.",
    weatherScenarioId: "",
    weatherConstraint: "Вечір / ніч",
  },
];
