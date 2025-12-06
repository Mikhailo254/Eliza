// src/components/layout/MainArea/MachinesPage/machineConfig.js

/** ===== ДОВІДНИК КУЛЬТУР (з моделі) ===== */
export const CROPS = [
  { id: "soy", label: "Соя" },
  { id: "wheat", label: "Пшениця" },
  { id: "barley", label: "Ячмінь" },
  { id: "corn", label: "Кукурудза" },
  { id: "sunflower", label: "Соняшник" },
];

/** ===== ДОВІДНИК ТИПІВ ОПЕРАЦІЙ (id → назва) ===== */
/** МАПА: тип техніки → доступні операції */
export const MACHINE_OPERATIONS = {
  tractor: [
    "o_pl",
    "o_disk",
    "o_cult",
    "o_sow",
    "o_roll",
    "o_hoe",
    "o_herb",
    "o_fung",
    "o_insect",
    "o_harv",
  ],
  combine: ["o_harv"],
  sprayer: ["o_herb", "o_fung", "o_insect"],
  selfprop_sprayer: ["o_herb", "o_fung", "o_insect"],
  tank: [],
  trailer: [],
  cultivator: ["o_cult"],
  hoe: ["o_hoe"],
  disk: ["o_disk"],
  plow: ["o_pl"],
  deep_ripper: ["o_pl"],
  spreader: [], // лійка – окрема історія, окремої операції немає
};

/** ===== ДОВІДНИК ТИПІВ ТЕХНІКИ + БАЗОВІ АТРИБУТИ ===== */
export const MACHINE_TYPES = [
  {
    id: "tractor",
    label: "Трактор",
    attributes: [
      { id: "power", label: "Потужність, к.с.", type: "number" },
      { id: "fuel", label: "Тип пального", type: "text" },
      { id: "weight", label: "Маса, т", type: "number" },
    ],
    operationsMode: "single",
  },
  {
    id: "combine",
    label: "Комбайн",
    attributes: [
      { id: "hopper", label: "Обʼєм бункера, м³", type: "number" },
      { id: "fuel", label: "Тип пального", type: "text" },
    ],
    operationsMode: "perCrop",
  },
  {
    id: "sprayer",
    label: "Обприскувач (причіпний/навісний)",
    attributes: [
      { id: "tank", label: "Обʼєм бака, л", type: "number" },
      { id: "boomWidth", label: "Ширина штанги, м", type: "number" },
    ],
    operationsMode: "single",
  },
  {
    id: "selfprop_sprayer",
    label: "Обприскувач самохідний",
    attributes: [
      { id: "tank", label: "Обʼєм бака, л", type: "number" },
      { id: "boomWidth", label: "Ширина штанги, м", type: "number" },
      { id: "clearance", label: "Кліренс, см", type: "number" },
    ],
    operationsMode: "single",
  },
  {
    id: "tank",
    label: "Бочка (цистерна)",
    attributes: [
      { id: "volume", label: "Обʼєм, м³", type: "number" },
      { id: "purpose", label: "Призначення", type: "text" },
    ],
    operationsMode: "none",
  },
  {
    id: "trailer",
    label: "Причіп",
    attributes: [
      { id: "capacity", label: "Вантажопідйомність, т", type: "number" },
      { id: "volume", label: "Обʼєм кузова, м³", type: "number" },
    ],
    operationsMode: "none",
  },
  {
    id: "cultivator",
    label: "Культиватор",
    attributes: [
      { id: "width", label: "Робоча ширина, м", type: "number" },
      { id: "rows", label: "Кількість рядів", type: "number" },
    ],
    operationsMode: "single",
  },
  {
    id: "hoe",
    label: "Мотига / міжрядний культиватор",
    attributes: [
      { id: "width", label: "Робоча ширина, м", type: "number" },
      { id: "rowSpacing", label: "Міжряддя, см", type: "number" },
    ],
    operationsMode: "single",
  },
  {
    id: "disk",
    label: "Диски / дискатор",
    attributes: [
      { id: "width", label: "Робоча ширина, м", type: "number" },
      { id: "depth", label: "Робоча глибина, см", type: "number" },
    ],
    operationsMode: "single",
  },
  {
    id: "plow",
    label: "Плуг",
    attributes: [
      { id: "bodies", label: "Кількість корпусів", type: "number" },
      { id: "width", label: "Загальна ширина захвату, м", type: "number" },
    ],
    operationsMode: "single",
  },
  {
    id: "deep_ripper",
    label: "Глибокорозрихлювач",
    attributes: [
      { id: "depth", label: "Глибина обробітку, см", type: "number" },
      { id: "width", label: "Ширина захвату, м", type: "number" },
    ],
    operationsMode: "single",
  },
  {
    id: "spreader",
    label: "Лійка (розкидач міндобрив)",
    attributes: [
      { id: "volume", label: "Обʼєм бункера, л", type: "number" },
      { id: "width", label: "Ширина розкидання, м", type: "number" },
    ],
    operationsMode: "none",
  },
];

/** Пошук типу за id */
export const findMachineType = (typeId) =>
  MACHINE_TYPES.find((t) => t.id === typeId) || null;
