// src/components/layout/MainArea/FieldsPage/FieldModal.jsx
import { useState } from "react";
import FieldMapEditor from "./FieldMapEditor";
import { MAX_TOTAL_FIELD_PARAMS } from "./FieldsPage";

const CROP_OPTIONS = ["Соя", "Пшениця", "Ячмінь", "Кукурудза", "Соняшник"];
const MAX_PREDECESSORS = 10;
const CURRENT_YEAR = new Date().getFullYear();

function FieldModal({ field, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    ...field,
    predecessors: field.predecessors || [],
    geometry: field.geometry || null,
    mapView: field.mapView || null,
    attributes: field.attributes || [],
    notebook: field.notebook || "",
  });

  const [isEditingPredecessors, setIsEditingPredecessors] = useState(false);
  const [isExpandedPredecessors, setIsExpandedPredecessors] = useState(false);

  // режим редагування параметрів (рядків)
  const [isEditingAttributes, setIsEditingAttributes] = useState(false);

  // записник відкритий / закритий
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
    });
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
    setForm((prev) => {
      const attrs = [...(prev.attributes || [])];
      attrs.splice(index, 1);
      return { ...prev, attributes: attrs };
    });
  };

  /* ===== ПОПЕРЕДНИКИ ===== */

  const predecessors = form.predecessors || [];

  const handleAddPredecessorRow = () => {
    setForm((prev) => {
      const preds = prev.predecessors || [];
      if (preds.length >= MAX_PREDECESSORS) return prev;
      return { ...prev, predecessors: [...preds, ""] };
    });
  };

  const handleToggleEditPredecessors = () => {
    if (!isEditingPredecessors) {
      setIsEditingPredecessors(true);
      setIsExpandedPredecessors(true);
      if (!predecessors.length) {
        handleAddPredecessorRow();
      }
    } else {
      setIsEditingPredecessors(false);
      setIsExpandedPredecessors(false);
    }
  };

  const handlePredecessorChange = (index, value) => {
    setForm((prev) => {
      const preds = [...(prev.predecessors || [])];
      preds[index] = value;
      return { ...prev, predecessors: preds };
    });
  };

  const handleRemovePredecessor = (index) => {
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

  if (isEditingPredecessors) {
    indicesToShow = predecessors.map((_, idx) => idx);
  } else if (isExpandedPredecessors) {
    indicesToShow = nonEmptyIndices.map((x) => x.idx);
  } else {
    if (nonEmptyIndices.length > 0) {
      indicesToShow = [nonEmptyIndices[0].idx];
    }
  }

  const canToggleByTitle = !isEditingPredecessors && nonEmptyIndices.length > 0;

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
        <h3>Редагування поля</h3>

        {/* інтерактивна мапа */}
        <FieldMapEditor
          geometry={form.geometry}
          view={form.mapView}
          onGeometryChange={handleGeometryChange}
          onViewChange={handleViewChange}
        />

        <form onSubmit={handleSubmit} className="modal__form">
          {/* БЛОК: Параметри ділянки (включно з Назвою) */}
          <div className="modal__attributes">
            <div className="modal__attributes-header">
              <span>Параметри ділянки (до {MAX_TOTAL_FIELD_PARAMS})</span>

              {!isEditingAttributes ? (
                <button
                  type="button"
                  onClick={() => setIsEditingAttributes(true)}
                >
                  Редагувати рядки
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    disabled={attributes.length >= MAX_TOTAL_FIELD_PARAMS}
                  >
                    Створити
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingAttributes(false)}
                  >
                    Завершити
                  </button>
                </>
              )}
            </div>

            {/* Рядок "Назва" – окремо, але в тому ж блоці */}
            <div className="modal__attr-row">
              <div className="modal__attr-name">Назва</div>
              {isEditingAttributes ? (
                <input
                  className="modal__attr-value"
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                  placeholder="Назва ділянки"
                />
              ) : (
                <div className="modal__attr-value">{form.name || "—"}</div>
              )}
              <span className="modal__predecessor-remove-placeholder" />
            </div>

            {attributes.length === 0 && (
              <p className="modal__attributes-empty">
                Додаткові параметри не задані.
              </p>
            )}

            {attributes.map((attr, index) => (
              <div key={attr.id || index} className="modal__attr-row">
                {isEditingAttributes ? (
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

          {/* БЛОК: Попередники культур */}
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
                Попередники культур (0–10)
              </span>

              <button
                type="button"
                onClick={handleToggleEditPredecessors}
                disabled={
                  !isEditingPredecessors &&
                  predecessors.length >= MAX_PREDECESSORS
                }
              >
                {isEditingPredecessors
                  ? "Закінчити додавання"
                  : "Додати попередника"}
              </button>
            </div>

            {!predecessors.length && !isEditingPredecessors && (
              <p className="modal__predecessors-empty">
                Дані про попередників відсутні.
              </p>
            )}

            {indicesToShow.map((index) => {
              const pred = predecessors[index];
              const year = CURRENT_YEAR - 1 - index;

              const rowClass =
                "modal__predecessor-row" +
                (!isEditingPredecessors
                  ? " modal__predecessor-row--no-remove"
                  : "");

              return (
                <div key={index} className={rowClass}>
                  <span className="modal__predecessor-year">{year}</span>

                  {isEditingPredecessors ? (
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

                  {isEditingPredecessors ? (
                    <button
                      type="button"
                      className="modal__predecessor-remove"
                      onClick={() => handleRemovePredecessor(index)}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              );
            })}

            {isEditingPredecessors &&
              predecessors.length < MAX_PREDECESSORS && (
                <div className="modal__predecessors-addmore">
                  <button type="button" onClick={handleAddPredecessorRow}>
                    Додати ще рядок
                  </button>
                </div>
              )}
          </div>

          {/* БЛОК: Записник */}
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
                  setForm((prev) => ({ ...prev, notebook: e.target.value }))
                }
                placeholder="Тут ви можете залишити будь-які примітки щодо ділянки..."
              />
            )}
          </div>

          <div className="modal__buttons">
            <button type="submit">Зберегти дані</button>
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
