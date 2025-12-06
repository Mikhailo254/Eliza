// src/components/layout/MainArea/MachinesPage/MachineModal.jsx
import { useMemo, useState } from "react";
import {
  MACHINE_TYPES,
  findMachineType,
  MACHINE_OPERATIONS,
  CROPS,
} from "./machineConfig";
import { OPERATIONS } from "./operationsConfig";

function MachineModal({
  machine,
  onSave,
  onDelete,
  onClose,
  initialEditing = false,
}) {
  const [form, setForm] = useState(() => ({
    ...machine,
    photo: machine.photo || "",
    attributes: machine.attributes || [],
    operations: machine.operations || [],
    notes: machine.notes || "",
  }));
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(machine.photo || "");

  // Файл фото (для можливого майбутнього завантаження на бекенд)
  photoFile;
  // Те, що реально показуємо в UI (dataURL / objectURL / URL з БД)

  const [isEditing, setIsEditing] = useState(initialEditing);

  const machineType = useMemo(() => findMachineType(form.type), [form.type]);
  const operationsMode = machineType?.operationsMode || "none";
  const availableOperationIds = MACHINE_OPERATIONS[form.type] || [];
  const availableOperations = OPERATIONS.filter((op) =>
    availableOperationIds.includes(op.id)
  );

  const typeLabel = MACHINE_TYPES.find((t) => t.id === form.type)?.label || "";

  /** ====== Зміна простих полів (name, type, тощо) ====== */
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /** При зміні типу – підтягуємо дефолтні атрибути, чистимо операції */
  const handleTypeChange = (e) => {
    const typeId = e.target.value;
    const typeDef = findMachineType(typeId);

    setForm((prev) => {
      const baseAttrs =
        typeDef?.attributes?.map((a) => ({
          ...a,
          value: "",
        })) || [];

      return {
        ...prev,
        type: typeId,
        attributes: baseAttrs,
        operations: [],
      };
    });
  };

  /** ====== Фото техніки ====== */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  /** ====== АТРИБУТИ ====== */

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
      return {
        ...prev,
        attributes: [
          ...attrs,
          {
            id: `attr-${Date.now()}`,
            label: "Новий атрибут",
            type: "text",
            value: "",
          },
        ],
      };
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

  /** ====== ОПЕРАЦІЇ: допоміжні ====== */

  const findOperationEntry = (operationId, cropId = null) =>
    form.operations?.find(
      (op) =>
        op.operationId === operationId &&
        (cropId == null ? !op.cropId : op.cropId === cropId)
    ) || null;

  const upsertOperationEntry = (operationId, cropId, newData) => {
    setForm((prev) => {
      const ops = [...(prev.operations || [])];
      const idx = ops.findIndex(
        (op) =>
          op.operationId === operationId &&
          (cropId == null ? !op.cropId : op.cropId === cropId)
      );

      if (idx === -1) {
        ops.push({
          operationId,
          ...(cropId ? { cropId } : {}),
          productivityHaPerDay: 0,
          ...newData,
        });
      } else {
        ops[idx] = {
          ...ops[idx],
          ...newData,
        };
      }

      return { ...prev, operations: ops };
    });
  };

  const removeOperationEntry = (operationId, cropId = null) => {
    setForm((prev) => {
      const ops = (prev.operations || []).filter((op) => {
        if (cropId == null) {
          return !(op.operationId === operationId && !op.cropId);
        }
        return !(op.operationId === operationId && op.cropId === cropId);
      });
      return { ...prev, operations: ops };
    });
  };

  /** ====== ОПЕРАЦІЇ: perCrop (комбайн) ====== */

  const handleCombineCropToggle = (cropId, checked) => {
    if (!isEditing) return;

    if (checked) {
      const existing = findOperationEntry("o_harv", cropId);
      if (!existing) {
        upsertOperationEntry("o_harv", cropId, {
          productivityHaPerDay: 0,
        });
      }
    } else {
      removeOperationEntry("o_harv", cropId);
    }
  };

  const handleCombineProductivityChange = (cropId, value) => {
    if (!isEditing) return;

    const num = value === "" ? "" : Number(value);
    upsertOperationEntry("o_harv", cropId, {
      productivityHaPerDay: Number.isNaN(num) ? 0 : num,
    });
  };

  const isCropSelectedForCombine = (cropId) =>
    !!findOperationEntry("o_harv", cropId);

  /** ====== ОПЕРАЦІЇ: manual / single ====== */

  const handleOperationProductivityChange = (operationId, value) => {
    if (!isEditing) return;

    const num = value === "" ? "" : Number(value);
    upsertOperationEntry(operationId, null, {
      productivityHaPerDay: Number.isNaN(num) ? 0 : num,
    });
  };

  const isOperationSelected = (operationId) =>
    !!findOperationEntry(operationId, null);

  const handleOperationCheckboxChange = (operationId, checked) => {
    if (!isEditing) return;

    if (checked) {
      const exists = findOperationEntry(operationId, null);
      if (!exists) {
        upsertOperationEntry(operationId, null, {
          productivityHaPerDay: 0,
        });
      }
    } else {
      removeOperationEntry(operationId, null);
    }
  };

  /** ====== Записник ====== */

  const handleNotesChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, notes: value }));
  };

  /** ====== Submit / Delete / Close ====== */

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...form,
      photo: photoPreview,
      _photoFile: photoFile, // 👈 на майбутнє для БД
    });
  };

  const handleBackdropClick = () => {
    onClose();
  };

  /** ===== Допоміжне для view-значень ===== */
  const formatProductivity = (val) => {
    if (val == null || val === 0 || val === "") return null;
    return `${val} га/день`;
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        className="modal modal--machines"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Техніка</h3>

        <form
          onSubmit={handleSubmit}
          className="modal__form modal__form--machines"
        >
          {/* ===== Блок загальних даних ===== */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Загальні дані</span>

              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)}>
                  Редагувати
                </button>
              ) : (
                <button type="button" onClick={() => setIsEditing(false)}>
                  Закінчити редагування
                </button>
              )}
            </div>

            <div className="modal__section modal__section--machine-main">
              {/* Ліва частина — назва та тип */}
              <div className="modal__main-info">
                {/* Назва техніки */}
                <div className="modal__row">
                  <label className="modal__label">Назва техніки</label>

                  {isEditing ? (
                    <input
                      name="name"
                      className="modal__input"
                      value={form.name || ""}
                      onChange={handleBasicChange}
                      placeholder="Наприклад, John Deere 8295R"
                    />
                  ) : (
                    <div
                      className={
                        form.name && form.name.trim()
                          ? "modal__value"
                          : "modal__value modal__value--placeholder"
                      }
                    >
                      {form.name && form.name.trim()
                        ? form.name
                        : "Не встановлена"}
                    </div>
                  )}
                </div>

                {/* Тип техніки */}
                <div className="modal__row">
                  <label className="modal__label">Тип техніки</label>

                  {isEditing ? (
                    <select
                      name="type"
                      className="modal__input"
                      value={form.type || ""}
                      onChange={handleTypeChange}
                    >
                      <option value="">— Оберіть тип —</option>
                      {MACHINE_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div
                      className={
                        typeLabel
                          ? "modal__value"
                          : "modal__value modal__value--placeholder"
                      }
                    >
                      {typeLabel || "Не встановлений"}
                    </div>
                  )}
                </div>
              </div>

              {/* Права частина — фото */}
              <div className="modal__photo-block">
                <div className="modal__photo-preview">
                  {photoPreview ? (
                    <img src={photoPreview} alt={form.name || "Фото техніки"} />
                  ) : (
                    <div className="modal__photo-placeholder">Без фото</div>
                  )}
                </div>

                {isEditing && (
                  <label className="modal__photo-upload">
                    Завантажити фото
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* ===== Блок атрибутів ===== */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Атрибути техніки</span>
              {isEditing && (
                <button type="button" onClick={handleAddAttribute}>
                  Додати атрибут
                </button>
              )}
            </div>

            <div className="modal__section">
              {(!form.attributes || form.attributes.length === 0) && (
                <p className="modal__hint">
                  Атрибути не задані. Оберіть тип техніки або додайте власні
                  атрибути.
                </p>
              )}

              {isEditing ? (
                (form.attributes || []).map((attr, index) => (
                  <div
                    key={attr.id || index}
                    className="modal__row modal__row--attr"
                  >
                    <>
                      {/* Ліва половина (50%) — назва атрибута */}
                      <input
                        className="modal__input modal__input--attr-name"
                        value={attr.label || ""}
                        onChange={(e) =>
                          handleAttrChange(index, "label", e.target.value)
                        }
                        placeholder="Назва атрибута"
                      />

                      {/* Права половина (50%) — значення + кнопка видалення */}
                      <div className="modal__attr-edit-right">
                        <input
                          className="modal__input modal__input--attr-value"
                          value={attr.value || ""}
                          onChange={(e) =>
                            handleAttrChange(index, "value", e.target.value)
                          }
                          placeholder="Значення"
                        />
                        <button
                          type="button"
                          className="modal__btn-remove"
                          onClick={() => handleRemoveAttribute(index)}
                        >
                          ×
                        </button>
                      </div>
                    </>
                  </div>
                ))
              ) : (
                <div className="modal__grid modal__grid--triples">
                  {(form.attributes || []).map((attr, index) => {
                    const hasValue =
                      attr.value && String(attr.value).trim().length > 0;

                    return (
                      <div key={attr.id || index} className="modal__pair">
                        <div className="modal__label">{attr.label || "—"}</div>
                        <div
                          className={
                            hasValue
                              ? "modal__value"
                              : "modal__value modal__value--placeholder"
                          }
                        >
                          {hasValue ? attr.value : "Не встановлено"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ===== Блок операцій ===== */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Операції та продуктивність</span>
            </div>

            <div className="modal__section">
              {!form.type && (
                <p className="modal__hint">
                  Спочатку оберіть тип техніки, щоб задати можливі операції.
                </p>
              )}

              {/* ---- perCrop (комбайн) ---- */}
              {form.type && operationsMode === "perCrop" && (
                <>
                  {isEditing ? (
                    <>
                      <p className="modal__hint">
                        Для комбайна оберіть культури, які можна збирати, та
                        задайте добову продуктивність (га/день) для кожної.
                      </p>

                      <div className="modal__grid modal__grid--double">
                        {CROPS.map((crop) => {
                          const checked = isCropSelectedForCombine(crop.id);
                          const op = findOperationEntry("o_harv", crop.id);

                          return (
                            <div key={crop.id} className="modal__pair">
                              <label className="modal__label modal__label--checkbox">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={!isEditing}
                                  onChange={(e) =>
                                    handleCombineCropToggle(
                                      crop.id,
                                      e.target.checked
                                    )
                                  }
                                />
                                <span>Збирання врожаю: {crop.label}</span>
                              </label>

                              <input
                                className="modal__input modal__input--short"
                                type="number"
                                min="0"
                                step="0.1"
                                disabled={!isEditing || !checked}
                                value={
                                  op?.productivityHaPerDay === 0
                                    ? ""
                                    : op?.productivityHaPerDay ?? ""
                                }
                                placeholder="га/день"
                                onChange={(e) =>
                                  handleCombineProductivityChange(
                                    crop.id,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      {(() => {
                        const selectedCrops = CROPS.filter((crop) =>
                          isCropSelectedForCombine(crop.id)
                        );
                        if (selectedCrops.length === 0) {
                          return (
                            <p className="modal__hint">
                              Для цього комбайна операції збирання культур ще не
                              задані.
                            </p>
                          );
                        }

                        return (
                          <div className="modal__grid modal__grid--triples">
                            {selectedCrops.map((crop) => {
                              const op = findOperationEntry("o_harv", crop.id);
                              const val = formatProductivity(
                                op?.productivityHaPerDay
                              );

                              return (
                                <div key={crop.id} className="modal__pair">
                                  <div className="modal__label">
                                    Збирання врожаю: {crop.label}
                                  </div>
                                  <div
                                    className={
                                      val
                                        ? "modal__value modal__value--right"
                                        : "modal__value modal__value--right modal__value--placeholder"
                                    }
                                  >
                                    {val || "Не встановлено"}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </>
              )}

              {/* ---- single / manual ---- */}
              {form.type &&
                (operationsMode === "single" ||
                  operationsMode === "manual") && (
                  <>
                    {isEditing && operationsMode === "manual" && (
                      <p className="modal__hint">
                        Оберіть, які операції виконує ця машина, та задайте
                        продуктивність (га/день).
                      </p>
                    )}
                    {isEditing && operationsMode === "single" && (
                      <p className="modal__hint">
                        Для цього типу техніки операції фіксовані, просто
                        задайте продуктивність (га/день).
                      </p>
                    )}

                    {isEditing ? (
                      <div className="modal__grid modal__grid--double">
                        {availableOperations.map((op) => {
                          const isSelected =
                            operationsMode === "single"
                              ? true
                              : isOperationSelected(op.id);
                          const entry =
                            operationsMode === "single"
                              ? findOperationEntry(op.id, null) || {
                                  productivityHaPerDay: "",
                                }
                              : findOperationEntry(op.id, null);

                          return (
                            <div key={op.id} className="modal__pair">
                              {operationsMode === "manual" ? (
                                <label className="modal__label modal__label--checkbox">
                                  <input
                                    type="checkbox"
                                    disabled={!isEditing}
                                    checked={!!isSelected}
                                    onChange={(e) =>
                                      handleOperationCheckboxChange(
                                        op.id,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span>{op.label}</span>
                                </label>
                              ) : (
                                <div className="modal__label">{op.label}</div>
                              )}

                              <input
                                className="modal__input modal__input--short"
                                type="number"
                                min="0"
                                step="0.1"
                                disabled={!isEditing || !isSelected}
                                value={
                                  entry?.productivityHaPerDay === 0
                                    ? ""
                                    : entry?.productivityHaPerDay ?? ""
                                }
                                placeholder="га/день"
                                onChange={(e) =>
                                  handleOperationProductivityChange(
                                    op.id,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <>
                        {(() => {
                          let toShow = [];

                          if (operationsMode === "manual") {
                            toShow = availableOperations.filter((op) =>
                              isOperationSelected(op.id)
                            );
                            if (toShow.length === 0) {
                              return (
                                <p className="modal__hint">
                                  Для цієї машини ще не задано жодної операції.
                                </p>
                              );
                            }
                          } else {
                            toShow = availableOperations;
                          }

                          return (
                            <div className="modal__grid modal__grid--triples">
                              {toShow.map((op) => {
                                const entry = findOperationEntry(op.id, null);
                                const val = formatProductivity(
                                  entry?.productivityHaPerDay
                                );

                                return (
                                  <div key={op.id} className="modal__pair">
                                    <div className="modal__label">
                                      {op.label}
                                    </div>
                                    <div
                                      className={
                                        val
                                          ? "modal__value modal__value--right"
                                          : "modal__value modal__value--right modal__value--placeholder"
                                      }
                                    >
                                      {val || "Не встановлено"}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </>
                )}

              {form.type && operationsMode === "none" && (
                <p className="modal__hint">
                  Для цього типу техніки операції в моделі не задаються (вона
                  використовується як допоміжний ресурс).
                </p>
              )}
            </div>
          </div>

          {/* ===== Записник ===== */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Записник</span>
            </div>

            <div className="modal__section">
              <textarea
                className="modal__textarea"
                value={form.notes || ""}
                onChange={handleNotesChange}
                placeholder="Будь-які примітки щодо техніки..."
              />
            </div>
          </div>

          {/* ===== Кнопки (знизу) ===== */}
          <div className="modal__buttons">
            <button type="submit" disabled={!isEditing}>
              Зберегти
            </button>
            <button type="button" onClick={() => onDelete(form.id)}>
              Видалити техніку
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

export default MachineModal;
