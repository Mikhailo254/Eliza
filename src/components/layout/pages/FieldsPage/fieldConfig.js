// Загальні налаштування/константи для підсистеми "Поля"

export const MAX_TOTAL_FIELD_PARAMS = 10;
export const MAX_PREDECESSORS = 10;

export const CROP_OPTIONS = [
  "Соя",
  "Пшениця",
  "Ячмінь",
  "Кукурудза",
  "Соняшник",
];

// Базовий набір рядків-параметрів
export const createDefaultAttributes = () => [
  { id: "area", label: "Площа, га", value: "" },
  { id: "crop", label: "Засіяна культура", value: "" },
  { id: "ownership", label: "Форма власності", value: "" },
  { id: "number", label: "Номер", value: "" },
];

// Шаблон порожнього поля (під БД)
export const EMPTY_FIELD = {
  id: null,
  name: "",
  geometry: null,
  mapView: null,
  predecessors: [],
  attributes: createDefaultAttributes(),
  notebook: "",
};

// Тимчасові демо-дані (можна буде потім прибрати/замінити завантаженням з БД)
export const initialFields = [
  {
    id: 1,
    name: "Поле 1",
    geometry: null,
    mapView: null,
    predecessors: [],
    attributes: [
      { id: "area", label: "Площа, га", value: "28.4" },
      { id: "crop", label: "Засіяна культура", value: "Пшениця" },
      { id: "ownership", label: "Форма власності", value: "Комунальна" },
      { id: "number", label: "Номер", value: "1" },
    ],
  },
  {
    id: 2,
    name: "Поле 2",
    geometry: null,
    mapView: null,
    predecessors: [],
    attributes: [
      { id: "area", label: "Площа, га", value: "169.34" },
      { id: "crop", label: "Засіяна культура", value: "Соняшник" },
      { id: "ownership", label: "Форма власності", value: "Приватна" },
      { id: "number", label: "Номер", value: "2" },
    ],
  },
];
