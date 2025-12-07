// src/components/pages/WorkersPage/workerConfig.js

// Максимальна кількість «додаткових параметрів»
export const MAX_WORKER_ATTRIBUTES = 10;

// Типи зайнятості
export const EMPLOYMENT_TYPES = [
  { id: "permanent", label: "Постійний працівник" },
  { id: "seasonal", label: "Сезонний працівник" },
  { id: "hired", label: "Найм на окремі роботи" },
];

// Ролі (типові посади)
export const WORKER_ROLES = [
  { id: "mechanizator", label: "Механізатор" },
  { id: "tractor_driver", label: "Тракторист" },
  { id: "combine_operator", label: "Комбайнер" },
  { id: "sprayer_operator", label: "Оператор обприскувача" },
  { id: "hand_labor", label: "Різноробочий" },
  { id: "agronomist", label: "Агроном / бригадир" },
];

// Навички по операціях
export const WORKER_OPERATION_SKILLS = [
  { id: "o_pl", label: "Оранка" },
  { id: "o_disk", label: "Дискування" },
  { id: "o_cult", label: "Культивація" },
  { id: "o_sow", label: "Сівба" },
  { id: "o_roll", label: "Коткування" },
  { id: "o_hoe", label: "Міжрядний обробіток / мотига" },
  { id: "o_chem", label: "Хімобробки (гербіциди/фунгіциди/інсектициди)" },
  { id: "o_harv", label: "Збирання врожаю" },
];

// Навички по роботі з технікою
export const WORKER_MACHINE_SKILLS = [
  { id: "tractor", label: "Тракторна техніка" },
  { id: "combine", label: "Комбайни" },
  { id: "sprayer", label: "Обприскувачі" },
  { id: "trailer", label: "Причепи / бочки" },
  { id: "other", label: "Інша техніка" },
];

// Базові атрибути працівника
export const createDefaultWorkerAttributes = () => [
  { id: "experience", label: "Стаж роботи, років", value: "" },
  { id: "category", label: "Кваліфікація / категорія", value: "" },
  { id: "phone", label: "Контактний телефон", value: "" },
];

// Порожній шаблон
export const EMPTY_WORKER = {
  id: null,
  name: "",
  roleId: "",
  employmentType: "permanent",
  isActive: true,
  hoursPerDay: 8,
  daysPerWeek: 6,
  seasonFrom: "",
  seasonTo: "",
  operationSkills: [],
  machineSkills: [],
  attributes: createDefaultWorkerAttributes(),
  notes: "",
  photo: null, // >>> додано
};

// Тимчасові демо-дані
export const initialWorkers = [
  {
    id: 1,
    name: "Іван Петрович",
    roleId: "mechanizator",
    employmentType: "permanent",
    isActive: true,
    hoursPerDay: 8,
    daysPerWeek: 6,
    seasonFrom: "",
    seasonTo: "",
    operationSkills: ["o_pl", "o_disk", "o_cult", "o_harv"],
    machineSkills: ["tractor", "combine"],
    attributes: [
      { id: "experience", label: "Стаж роботи, років", value: "7" },
      {
        id: "category",
        label: "Кваліфікація / категорія",
        value: "Тракторист-машиніст А2",
      },
      { id: "phone", label: "Контактний телефон", value: "+380..." },
    ],
    notes: "Основний механізатор по важких агрегатах.",
    photo: null, // >>> додано (поки без фото)
  },
  {
    id: 2,
    name: "Олег",
    roleId: "hand_labor",
    employmentType: "seasonal",
    isActive: true,
    hoursPerDay: 6,
    daysPerWeek: 5,
    seasonFrom: "",
    seasonTo: "",
    operationSkills: ["o_hoe"],
    machineSkills: [],
    attributes: [
      { id: "experience", label: "Стаж роботи, років", value: "2" },
      {
        id: "category",
        label: "Кваліфікація / категорія",
        value: "Різноробочий",
      },
      { id: "phone", label: "Контактний телефон", value: "" },
    ],
    notes: "Працює на ручних роботах та допоміжних операціях.",
    photo: null, // >>> додано
  },
];
