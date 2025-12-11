// src/components/pages/ResourcesPage/resourcesConfig.js

// --- Культури для таблиці економіки операцій ---
export const CROPS_FOR_OPS = [
  { id: "soy", label: "Соя" },
  { id: "wheat", label: "Пшениця" },
  { id: "barley", label: "Ячмінь" },
  { id: "corn", label: "Кукурудза" },
  { id: "sunflower", label: "Соняшник" },
];

// --- Операції (узгоджені з рештою системи) ---
export const OPERATIONS_FOR_OPS = [
  { id: "o_pl", label: "Оранка" },
  { id: "o_disk", label: "Дискування" },
  { id: "o_cult", label: "Культивація" },
  { id: "o_sow", label: "Сівба" },
  { id: "o_roll", label: "Коткування" },
  { id: "o_hoe", label: "Міжрядний обробіток / мотига" },
  { id: "o_herb", label: "Гербіцидна обробка" },
  { id: "o_fung", label: "Фунгіцидна обробка" },
  { id: "o_insect", label: "Інсектицидна обробка" },
  { id: "o_harv", label: "Збирання врожаю" },
];

// --- Базові (приблизні) значення вартості операцій, грн/га ---
const OPERATION_COST_DEFAULTS = {
  o_pl: { own: 1500, hire: 1800 },
  o_disk: { own: 800, hire: 1000 },
  o_cult: { own: 700, hire: 900 },
  o_sow: { own: 900, hire: 1100 },
  o_roll: { own: 500, hire: 650 },
  o_hoe: { own: 600, hire: 800 },
  o_herb: { own: 450, hire: 650 },
  o_fung: { own: 500, hire: 700 },
  o_insect: { own: 450, hire: 650 },
  o_harv: { own: 1600, hire: 1900 },
};

// --- Початковий масив для "Економіка польових операцій" ---
export const INITIAL_OPERATION_COSTS = (() => {
  const rows = [];

  CROPS_FOR_OPS.forEach((crop) => {
    OPERATIONS_FOR_OPS.forEach((op) => {
      const def = OPERATION_COST_DEFAULTS[op.id] || { own: null, hire: null };

      rows.push({
        id: `${crop.id}-${op.id}`,
        cropId: crop.id,
        cropName: crop.label,
        operationId: op.id,
        operationName: op.label,
        costOwn: def.own,
        costHire: def.hire,
      });
    });
  });

  return rows;
})();

// --- Матеріальні ресурси: секції + стартові значення ---

export const MATERIAL_SECTIONS = [
  {
    id: "seed",
    label: "Насіння",
    items: [
      {
        id: "seed-soy",
        name: "Насіння сої",
        availability: "", // НОВЕ
        unit: "кг",
        price: 45,
        note: "",
      },
      {
        id: "seed-wheat",
        name: "Насіння пшениці",
        availability: "",
        unit: "кг",
        price: 20,
        note: "",
      },
    ],
  },
  {
    id: "fertilizers",
    label: "Добрива",
    items: [
      {
        id: "fert-npk",
        name: "Комплексне NPK",
        availability: "",
        unit: "кг",
        price: 38,
        note: "",
      },
      {
        id: "fert-urea",
        name: "Сечовина",
        availability: "",
        unit: "кг",
        price: 32,
        note: "",
      },
    ],
  },
  {
    id: "cpp",
    label: "Засоби захисту рослин",
    items: [
      {
        id: "cpp-herb",
        name: "Гербіцид (загальний)",
        availability: "",
        unit: "л",
        price: 420,
        note: "",
      },
      {
        id: "cpp-fung",
        name: "Фунгіцид (загальний)",
        availability: "",
        unit: "л",
        price: 520,
        note: "",
      },
      {
        id: "cpp-insect",
        name: "Інсектицид (загальний)",
        availability: "",
        unit: "л",
        price: 380,
        note: "",
      },
    ],
  },
  {
    id: "fuel",
    label: "Паливо та мастила",
    items: [
      {
        id: "fuel-diesel",
        name: "Дизельне паливо",
        availability: "",
        unit: "л",
        price: 65,
        note: "",
      },
      {
        id: "fuel-oil",
        name: "Мастильні матеріали",
        availability: "",
        unit: "л",
        price: 140,
        note: "",
      },
    ],
  },
];

// --- Партнери / постачальники / підрядники (за бажанням моделі) ---
export const INITIAL_PARTNERS = [
  {
    id: "partner-1",
    name: "ТОВ «Агропостач»",
    role: "Постачальник ЗЗР та добрив",
    contact: "+380...",
    note: "",
  },
  {
    id: "partner-2",
    name: "ФОП Іваненко",
    role: "Польові роботи (оранка, культивація)",
    contact: "+380...",
    note: "",
  },
];
