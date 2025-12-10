// src/components/pages/CropsPage/cropConfig.js
// src/components/pages/CropsPage/cropConfig.js

import soyImg from "./CropsPhoto/soy.jpg";
import wheatImg from "./CropsPhoto/wheat.jpg";
import barleyImg from "./CropsPhoto/barley.jpg";
import cornImg from "./CropsPhoto/corn.jpg";
import sunflowerImg from "./CropsPhoto/sunflower.jpg";

// Максимальна кількість «додаткових параметрів»
export const MAX_CROP_ATTRIBUTES = 10;

// ===== ДЕФОЛТНІ ВІКНА ОПЕРАЦІЙ (у днях від початку сезону) =====
// ЦЕ МОЖНА І ПОТІМ ПІДРІВНЯТИ ПІД ТАБЛИЦІ З 2 РОЗДІЛУ.
// Зараз поставив умовні, але логічні межі.
export const DEFAULT_OPERATION_WINDOWS = {
  o_pl: { fromDay: 1, toDay: 15 }, // оранка
  o_disk: { fromDay: 10, toDay: 25 }, // дискування
  o_cult: { fromDay: 15, toDay: 30 }, // культивація
  o_sow: { fromDay: 20, toDay: 40 }, // сівба
  o_roll: { fromDay: 20, toDay: 45 }, // коткування
  o_hoe: { fromDay: 40, toDay: 80 }, // міжрядка
  o_herb: { fromDay: 30, toDay: 80 }, // гербіциди
  o_fung: { fromDay: 40, toDay: 90 }, // фунгіциди
  o_insect: { fromDay: 40, toDay: 90 }, // інсектициди
  o_harv: { fromDay: 90, toDay: 140 }, // збирання
};

// 5 фіксованих культур для моделі
// name – показуємо користувачу
// id / code – внутрішні для моделі / БД, користувач їх НЕ бачить
export const CROPS = [
  {
    id: "soy",
    code: "SOY",
    name: "Соя",
    photo: soyImg,
    modelParams: {
      vegetationDays: 110,
      baseYield: 2.8,
      pricePerTon: 14000,
      minRotationYears: 3,
    },
    technologyId: "tech_disk_cult_sow", // базово для сої – мінімальний обробіток
    operationWindows: [], // заповнимо в модалці з DEFAULT_OPERATION_WINDOWS
    attributes: [],
    notes: "",
  },
  {
    id: "wheat",
    code: "WHEAT",
    name: "Пшениця",
    photo: wheatImg,
    modelParams: {
      vegetationDays: 270,
      baseYield: 5.0,
      pricePerTon: 9000,
      minRotationYears: 3,
    },
    technologyId: "tech_pl_cult_sow", // класична оранкова
    operationWindows: [],
    attributes: [],
    notes: "",
  },
  {
    id: "barley",
    code: "BARLEY",
    name: "Ячмінь",
    photo: barleyImg,
    modelParams: {
      vegetationDays: 250,
      baseYield: 4.5,
      pricePerTon: 8500,
      minRotationYears: 2,
    },
    technologyId: "tech_pl_cult_sow",
    operationWindows: [],
    attributes: [],
    notes: "",
  },
  {
    id: "corn",
    code: "CORN",
    name: "Кукурудза",
    photo: cornImg,
    modelParams: {
      vegetationDays: 140,
      baseYield: 8.0,
      pricePerTon: 6000,
      minRotationYears: 3,
    },
    technologyId: "tech_disk_cult_sow",
    operationWindows: [],
    attributes: [],
    notes: "",
  },
  {
    id: "sunflower",
    code: "SUN",
    name: "Соняшник",
    photo: sunflowerImg,
    modelParams: {
      vegetationDays: 130,
      baseYield: 3.0,
      pricePerTon: 16000,
      minRotationYears: 4,
    },
    technologyId: "tech_disk_sow",
    operationWindows: [],
    attributes: [],
    notes: "",
  },
];

// Операції з розділу 2 (можна синхронізувати з operationsConfig)
export const CROP_OPERATIONS = [
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

// Технології – поки як набір операцій (без впливу на врожайність)
export const CROP_TECHNOLOGIES = [
  {
    id: "tech_pl_cult_sow",
    label: "Оранка",
    operations: ["o_pl", "o_cult", "o_sow"],
  },
  {
    id: "tech_disk_cult_sow",
    label: "Культивація",
    operations: ["o_disk", "o_cult", "o_sow"],
  },
  {
    id: "tech_disk_sow",
    label: "Дисковка",
    operations: ["o_disk", "o_sow"],
  },
];

// Допоміжні функції
export const findCropById = (id) => CROPS.find((c) => c.id === id) || null;

export const findOperationById = (opId) =>
  CROP_OPERATIONS.find((op) => op.id === opId) || null;

export const findTechnologyById = (techId) =>
  CROP_TECHNOLOGIES.find((t) => t.id === techId) || null;
