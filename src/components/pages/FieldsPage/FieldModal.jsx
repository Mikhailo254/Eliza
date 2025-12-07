// src/components/pages/FieldsPage/FieldModal.jsx
import { useState } from "react";
import FieldMapEditor from "./FieldMapEditor";
import {
  MAX_TOTAL_FIELD_PARAMS,
  MAX_PREDECESSORS,
  CROP_OPTIONS,
} from "./fieldConfig";

const CURRENT_YEAR = new Date().getFullYear();

function FieldModal({
  field,
  onSave,
  onDelete,
  onClose,
  initialEditing = false,
}) {
  const [form, setForm] = useState({
    ...field,
    predecessors: field.predecessors || [],
    geometry: field.geometry || null,
    mapView: field.mapView || null,
    attributes: field.attributes || [],
    notebook: field.notebook || "",
  });

  // Глобальний режим: перегляд / редагування (як у MachineModal)
  const [isEditing, setIsEditing] = useState(initialEditing);

  // Попередники: тільки розгортання/згортання списку
  const [isExpandedPredecessors, setIsExpandedPredecessors] = useState(false);

  // Записник: чи показувати поле
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form });
  };

  /* ===== МАПА: геометрія + площа ===== */

  const handleGeometryChange = (geometry, areaHa) => {
    setForm((prev) => {
      let attrs = prev.attributes || [];

      if (areaHa != null) {
        const areaStr = areaHa.toFixed(2);

        const idx = attrs.findIndex((a) => a.id === "area");
        if (idx !== -1) {
          attrs = [...attrs];
          attrs[idx] = { ...attrs[idx], value: areaStr };
        } else if (attrs.length < MAX_TOTAL_FIELD_PARAMS) {
          attrs = [
            ...attrs,
            { id: "area", label: "Площа, га", value: areaStr },
          ];
        }
      }

      return {
        ...prev,
        geometry,
        attributes: attrs,
      };
    });
  };

  const handleViewChange = (view) => {
    setForm((prev) => ({
      ...prev,
      mapView: view,
    }));
  };

  /* ===== ДИНАМІЧНІ ПАРАМЕТРИ (рядки) ===== */

  const attributes = form.attributes || [];

  const handleAttrChange = (index, key, value) => {
    setForm((prev) => {
      const attrs = [...(prev.attributes || [])];
      attrs[index] = { ...attrs[index], [key]: value };
      return { ...prev, attributes: attrs };
    });
  };

  const handleAddAttribute = () => {
    if (!isEditing) return;

    setForm((prev) => {
      const attrs = prev.attributes || [];
      if (attrs.length >= MAX_TOTAL_FIELD_PARAMS) return prev;

      const newAttr = {
        id: `attr-${Date.now()}`,
        label: "Новий параметр",
        value: "",
      };

      return { ...prev, attributes: [...attrs, newAttr] };
    });
  };

  const handleRemoveAttribute = (index) => {
    if (!isEditing) return;

    setForm((prev) => {
      const attrs = [...(prev.attributes || [])];
      attrs.splice(index, 1);
      return { ...prev, attributes: attrs };
    });
  };

  /* ===== ПОПЕРЕДНИКИ ===== */

  const predecessors = form.predecessors || [];

  const handleAddPredecessorRow = () => {
    if (!isEditing) return;

    setForm((prev) => {
      const preds = prev.predecessors || [];
      if (preds.length >= MAX_PREDECESSORS) return prev;
      return { ...prev, predecessors: [...preds, ""] };
    });
  };

  const handlePredecessorChange = (index, value) => {
    if (!isEditing) return;

    setForm((prev) => {
      const preds = [...(prev.predecessors || [])];
      preds[index] = value;
      return { ...prev, predecessors: preds };
    });
  };

  const handleRemovePredecessor = (index) => {
    if (!isEditing) return;

    setForm((prev) => {
      const preds = [...(prev.predecessors || [])];
      preds.splice(index, 1);
      return { ...prev, predecessors: preds };
    });
  };

  const nonEmptyIndices = predecessors
    .map((p, idx) => ({ value: p, idx }))
    .filter((x) => x.value && x.value.trim() !== "");

  let indicesToShow = [];

  if (isEditing) {
    // У режимі редагування показуємо всі рядки
    indicesToShow = predecessors.map((_, idx) => idx);
  } else if (isExpandedPredecessors) {
    // У перегляді, коли розгорнуто — всі заповнені
    indicesToShow = nonEmptyIndices.map((x) => x.idx);
  } else if (nonEmptyIndices.length > 0) {
    // У перегляді, коли згорнуто — тільки перший заповнений
    indicesToShow = [nonEmptyIndices[0].idx];
  }

  const canToggleByTitle = !isEditing && nonEmptyIndices.length > 0;

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        className="modal"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Верхній заголовок + глобальний перемикач режиму (як у MachineModal) */}
        <div className="modal__top">
          <h3>Поле</h3>

          {!isEditing ? (
            <button
              type="button"
              className="modal__top-edit-btn"
              onClick={() => setIsEditing(true)}
            >
              Редагувати
            </button>
          ) : (
            <button
              type="button"
              className="modal__top-edit-btn"
              onClick={() => setIsEditing(false)}
            >
              Закінчити редагування
            </button>
          )}
        </div>

        <FieldMapEditor
          geometry={form.geometry}
          view={form.mapView}
          onGeometryChange={handleGeometryChange}
          onViewChange={handleViewChange}
        />

        <form onSubmit={handleSubmit} className="modal__form">
          {/* ПАРАМЕТРИ ДІЛЯНКИ */}
          <div className="modal__attributes">
            <div className="modal__attributes-header">
              <span>Параметри ділянки (до {MAX_TOTAL_FIELD_PARAMS})</span>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddAttribute}
                  disabled={attributes.length >= MAX_TOTAL_FIELD_PARAMS}
                >
                  Створити рядок
                </button>
              )}
            </div>

            {/* Назва ділянки */}
            <div className="modal__attr-row">
              <div className="modal__attr-name modal__attr-row__V1">Назва</div>
              {isEditing ? (
                <input
                  className="modal__attr-value modal__attr-row__V2"
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                  placeholder="Назва ділянки"
                />
              ) : (
                <div className="modal__attr-value">{form.name || "—"}</div>
              )}
              {/* Плейсхолдер під потенційну кнопку видалення, щоб сітка не зʼїжджала */}
              <span className="modal__predecessor-remove-placeholder" />
            </div>

            {attributes.length === 0 && (
              <p className="modal__attributes-empty">
                Додаткові параметри не задані.
              </p>
            )}

            {attributes.map((attr, index) => (
              <div key={attr.id || index} className="modal__attr-row">
                {isEditing ? (
                  <>
                    <input
                      className="modal__attr-name"
                      placeholder="Назва параметра"
                      value={attr.label}
                      onChange={(e) =>
                        handleAttrChange(index, "label", e.target.value)
                      }
                    />
                    <input
                      className="modal__attr-value"
                      placeholder="Значення"
                      value={attr.value}
                      onChange={(e) =>
                        handleAttrChange(index, "value", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="modal__attr-remove"
                      onClick={() => handleRemoveAttribute(index)}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <>
                    <div className="modal__attr-name">{attr.label}</div>
                    <div className="modal__attr-value">{attr.value || "—"}</div>
                    <span className="modal__predecessor-remove-placeholder" />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* ПОПЕРЕДНИКИ */}
          <div className="modal__predecessors">
            <div className="modal__predecessors-header">
              <span
                className={
                  "modal__predecessors-title" +
                  (canToggleByTitle
                    ? " modal__predecessors-title--clickable"
                    : "") +
                  (isExpandedPredecessors ? " is-expanded" : "")
                }
                onClick={() => {
                  if (canToggleByTitle) {
                    setIsExpandedPredecessors((prev) => !prev);
                  }
                }}
              >
                Попередники культур (0–{MAX_PREDECESSORS})
              </span>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddPredecessorRow}
                  disabled={predecessors.length >= MAX_PREDECESSORS}
                >
                  Додати попередника
                </button>
              )}
            </div>

            {!predecessors.length && !isEditing && (
              <p className="modal__predecessors-empty">
                Дані про попередників відсутні.
              </p>
            )}

            {indicesToShow.map((index) => {
              const pred = predecessors[index];
              const year = CURRENT_YEAR - 1 - index;

              const rowClass =
                "modal__predecessor-row" +
                (!isEditing ? " modal__predecessor-row--no-remove" : "");

              return (
                <div key={index} className={rowClass}>
                  <span className="modal__predecessor-year">{year}</span>

                  {isEditing ? (
                    <select
                      value={pred}
                      onChange={(e) =>
                        handlePredecessorChange(index, e.target.value)
                      }
                    >
                      <option value="">— Оберіть культуру —</option>
                      {CROP_OPTIONS.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="modal__predecessor-display">
                      {pred || "— немає даних —"}
                    </div>
                  )}

                  {isEditing && (
                    <button
                      type="button"
                      className="modal__predecessor-remove"
                      onClick={() => handleRemovePredecessor(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* ЗАПИСНИК */}
          <div className="modal__notebook">
            <div className="modal__notebook-header">
              <span>Записник</span>
              <button
                type="button"
                onClick={() => setIsNotebookOpen((prev) => !prev)}
              >
                {isNotebookOpen ? "Закрити" : "Відкрити"}
              </button>
            </div>

            {isNotebookOpen && (
              <textarea
                className="modal__notebook-text"
                value={form.notebook}
                onChange={(e) =>
                  isEditing &&
                  setForm((prev) => ({ ...prev, notebook: e.target.value }))
                }
                placeholder="Тут ви можете залишити будь-які примітки щодо ділянки..."
                readOnly={!isEditing}
              />
            )}
          </div>

          <div className="modal__buttons">
            <button type="submit" disabled={!isEditing}>
              Зберегти дані
            </button>
            <button type="button" onClick={() => onDelete(form.id)}>
              Видалити поле
            </button>
            <button type="button" onClick={onClose}>
              Закрити
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FieldModal;
