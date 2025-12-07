// src/components/pages/FieldsPage/FieldsPage.jsx
import { useState } from "react";
import FieldCard from "./FieldCard";
import FieldModal from "./FieldModal";
import { EMPTY_FIELD, initialFields } from "./fieldConfig";

function FieldsPage() {
  const [fields, setFields] = useState(initialFields);
  const [selectedField, setSelectedField] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const openModalWithField = (field, { createMode = false } = {}) => {
    setSelectedField(field);
    setIsCreateMode(createMode);
    setIsModalOpen(true);
  };

  const handleAddField = () => {
    const newField = {
      ...EMPTY_FIELD,
      id: Date.now(), // тимчасовий id, потім заміниш на id з БД
    };
    openModalWithField(newField, { createMode: true });
  };

  const handleEditField = (field) => {
    openModalWithField(field, { createMode: false });
  };

  const handleDeleteField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setIsModalOpen(false);
    setSelectedField(null);
    setIsCreateMode(false);
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
    setIsCreateMode(false);
  };

  return (
    <div className="fields-page">
      <h2 className="fields-page__title">Поля господарства</h2>

      <div className="fields-page__grid">
        {fields.map((field) => (
          <FieldCard
            key={field.id}
            field={field}
            onClick={() => handleEditField(field)}
          />
        ))}

        <button
          type="button"
          className="field-card field-card--add"
          onClick={handleAddField}
        >
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
            setIsCreateMode(false);
          }}
          initialEditing={isCreateMode}
        />
      )}
    </div>
  );
}

export default FieldsPage;
