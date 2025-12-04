// src/components/layout/MainArea/FieldsPage/FieldsPage.jsx
import { useState } from "react";
import FieldCard from "./FieldCard";
import FieldModal from "./FieldModal";
import { EMPTY_FIELD, initialFields } from "./fieldConfig";

function FieldsPage() {
  const [fields, setFields] = useState(initialFields);
  const [selectedField, setSelectedField] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModalWithField = (field) => {
    setSelectedField(field);
    setIsModalOpen(true);
  };

  const handleAddField = () => {
    const newField = {
      ...EMPTY_FIELD,
      id: Date.now(), // тимчасовий id, потім заміниш на id з БД
    };
    openModalWithField(newField);
  };

  const handleEditField = (field) => {
    openModalWithField(field);
  };

  const handleDeleteField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setIsModalOpen(false);
    setSelectedField(null);
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
    setSelectedField(null);
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
          onClose={() => {
            setIsModalOpen(false);
            setSelectedField(null);
          }}
        />
      )}
    </div>
  );
}

export default FieldsPage;
