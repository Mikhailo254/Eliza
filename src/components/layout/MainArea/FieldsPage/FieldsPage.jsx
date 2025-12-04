// src/components/layout/MainArea/FieldsPage/FieldsPage.jsx
import { useState } from "react";
import FieldCard from "./FieldCard";
import FieldModal from "./FieldModal";

// загальний ліміт параметрів (рядків) на одне поле
export const MAX_TOTAL_FIELD_PARAMS = 10;

// Функція, що створює базовий набір рядків параметрів
const createDefaultAttributes = () => [
  { id: "area", label: "Площа, га", value: "" },
  { id: "crop", label: "Засіяна культура", value: "" },
  { id: "ownership", label: "Форма власності", value: "" },
  { id: "number", label: "Номер", value: "" },
];

// Шаблон порожнього поля (під БД)
const EMPTY_FIELD = {
  id: null,
  name: "",
  geometry: null,
  mapView: null,
  predecessors: [],
  attributes: createDefaultAttributes(),
};

const initialFields = [
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

function FieldsPage() {
  const [fields, setFields] = useState(initialFields);
  const [selectedField, setSelectedField] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddField = () => {
    const newField = {
      ...EMPTY_FIELD,
      id: Date.now(), // тимчасовий id, потім замінимо на id з БД
    };

    setSelectedField(newField);
    setIsModalOpen(true);
  };

  const handleEditField = (field) => {
    setSelectedField(field);
    setIsModalOpen(true);
  };

  const handleDeleteField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setIsModalOpen(false);
  };

  const handleSaveField = (fieldData) => {
    setFields((prev) => {
      const exists = prev.some((f) => f.id === fieldData.id);
      if (exists) {
        return prev.map((f) => (f.id === fieldData.id ? fieldData : f));
      }
      return [...prev, fieldData];
    });
    setIsModalOpen(false);
  };

  return (
    <div className="fields-page">
      <h2>Поля господарства</h2>

      <div className="fields-grid">
        {fields.map((field) => (
          <FieldCard
            key={field.id}
            field={field}
            onClick={() => handleEditField(field)}
          />
        ))}

        <button className="field-card field-card--add" onClick={handleAddField}>
          +
        </button>
      </div>

      {isModalOpen && selectedField && (
        <FieldModal
          field={selectedField}
          onSave={handleSaveField}
          onDelete={handleDeleteField}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default FieldsPage;
