// src/components/pages/CropsPage/CropModal.jsx
import { useState } from "react";
import {
  MAX_CROP_ATTRIBUTES,
  CROP_TECHNOLOGIES,
  findTechnologyById,
  findOperationById,
  DEFAULT_OPERATION_WINDOWS,
} from "./cropConfig";

/** === Налаштування сезону для перерахунку "день від початку" ↔ дата === */
// умовно беремо рік сезону як фіксований (для диплома це не критично)
const SEASON_YEAR = 2025;
// 1 березня — день №1 у моделі
const SEASON_START = new Date(SEASON_YEAR, 2, 1); // місяці з 0, тому 2 = березень

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Перетворення номера дня (1,2,3...) у ISO-дату yyyy-mm-dd */
function dayIndexToDateString(dayIndex) {
  if (!dayIndex || Number.isNaN(dayIndex)) return "";

  const d = new Date(SEASON_START);
  // dayIndex = 1 → 1 березня; dayIndex = 2 → 2 березня і т.д.
  d.setDate(d.getDate() + (dayIndex - 1));

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Перетворення ISO-дати yyyy-mm-dd у номер дня від початку сезону (1,2,3...) */
function dateStringToDayIndex(value) {
  if (!value) return "";

  const [yyyy, mm, dd] = value.split("-");
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const diffMs = d.getTime() - SEASON_START.getTime();
  const diffDays = Math.round(diffMs / MS_PER_DAY);
  const dayIndex = diffDays + 1;

  if (dayIndex <= 0) return ""; // до початку сезону — вважаємо невалідним
  return dayIndex;
}

/** Короткий формат для перегляду: "dd.mm – dd.mm" або "Не задано" */
function formatDayRangeShort(fromDay, toDay) {
  if (!fromDay || !toDay) return "Не задано";

  const fromIso = dayIndexToDateString(fromDay);
  const toIso = dayIndexToDateString(toDay);

  if (!fromIso || !toIso) return "Не задано";

  const [, fromMM, fromDD] = fromIso.split("-");
  const [, toMM, toDD] = toIso.split("-");

  const fromStr = `${fromDD}.${fromMM}`;
  const toStr = `${toDD}.${toMM}`;
  return `${fromStr} – ${toStr}`;
}

const getTechnologyOpsLabel = (tech) => {
  if (!tech) return "";
  const names =
    tech.operations
      ?.map((opId) => findOperationById(opId)?.label)
      .filter(Boolean) || [];

  return names.join(" – ");
};

function CropModal({ crop, onSave, onClose }) {
  /** === ІНІЦІАЛІЗАЦІЯ ТЕХНОЛОГІЇ ТА ВІКОН ОПЕРАЦІЙ === */

  const initialTechnologyId = crop.technologyId || "";

  // Якщо в культурі вже є збережені вікна — використовуємо їх.
  // Якщо немає, але є технологія — генеруємо з DEFAULT_OPERATION_WINDOWS.
  const initialOperationWindows = (() => {
    if (crop.operationWindows && crop.operationWindows.length > 0) {
      return crop.operationWindows;
    }

    if (initialTechnologyId) {
      const tech = findTechnologyById(initialTechnologyId);
      if (!tech) return [];

      return (tech.operations || []).map((opId) => {
        const def = DEFAULT_OPERATION_WINDOWS[opId] || {};
        return {
          operationId: opId,
          fromDay: def.fromDay ?? "",
          toDay: def.toDay ?? "",
        };
      });
    }

    return [];
  })();

  const [form, setForm] = useState({
    ...crop,
    photo: crop.photo || null,
    modelParams: {
      vegetationDays: crop.modelParams?.vegetationDays ?? "",
      baseYield: crop.modelParams?.baseYield ?? "",
      pricePerTon: crop.modelParams?.pricePerTon ?? "",
      minRotationYears: crop.modelParams?.minRotationYears ?? "",
    },
    technologyId: initialTechnologyId,
    operationWindows: initialOperationWindows,
    attributes: crop.attributes || [],
    notes: crop.notes || "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const attrsCount = (form.attributes || []).length;
  const selectedTechnology = findTechnologyById(form.technologyId);

  /** === Зміна числових полів моделі (vegetationDays, baseYield, ...) === */
  const handleNumberChange = (path, value) => {
    setForm((prev) => {
      const num = value === "" ? "" : Number(value);
      const safe = Number.isNaN(num) ? "" : num;

      if (path.startsWith("modelParams.")) {
        const key = path.split(".")[1];
        return {
          ...prev,
          modelParams: {
            ...prev.modelParams,
            [key]: safe,
          },
        };
      }

      return prev;
    });
  };

  /** === Зміна технології === */
  const handleTechnologyChange = (e) => {
    const techId = e.target.value;
    const tech = findTechnologyById(techId);

    setForm((prev) => {
      const newWindows = tech
        ? (tech.operations || []).map((opId) => {
            // якщо вже були збережені вікна для цієї операції – зберігаємо їх
            const existing = prev.operationWindows?.find(
              (w) => w.operationId === opId
            );
            if (existing) return existing;

            // інакше беремо дефолтні
            const def = DEFAULT_OPERATION_WINDOWS[opId] || {};
            return {
              operationId: opId,
              fromDay: def.fromDay ?? "",
              toDay: def.toDay ?? "",
            };
          })
        : [];

      return {
        ...prev,
        technologyId: techId,
        operationWindows: newWindows,
      };
    });
  };

  /** === Зміна діапазону днів операції через календар === */
  const handleOperationWindowDateChange = (opId, field, dateString) => {
    setForm((prev) => {
      const list = [...(prev.operationWindows || [])];
      const idx = list.findIndex((w) => w.operationId === opId);
      const dayIndex = dateStringToDayIndex(dateString);
      const safe = dayIndex === "" ? "" : dayIndex;

      if (idx === -1) {
        list.push({
          operationId: opId,
          fromDay: field === "fromDay" ? safe : "",
          toDay: field === "toDay" ? safe : "",
        });
      } else {
        list[idx] = {
          ...list[idx],
          [field]: safe,
        };
      }

      return { ...prev, operationWindows: list };
    });
  };

  /** === Додаткові параметри (атрибути) === */

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
      if (attrs.length >= MAX_CROP_ATTRIBUTES) return prev;

      return {
        ...prev,
        attributes: [
          ...attrs,
          {
            id: `attr-${Date.now()}`,
            label: "Новий параметр",
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

  /** === Записник === */
  const handleNotesChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, notes: value }));
  };

  /** === Фото культури (тільки в режимі редагування) === */
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        photo: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  /** === Submit === */
  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...form,
      modelParams: {
        vegetationDays:
          form.modelParams.vegetationDays === ""
            ? null
            : form.modelParams.vegetationDays,
        baseYield:
          form.modelParams.baseYield === "" ? null : form.modelParams.baseYield,
        pricePerTon:
          form.modelParams.pricePerTon === ""
            ? null
            : form.modelParams.pricePerTon,
        minRotationYears:
          form.modelParams.minRotationYears === ""
            ? null
            : form.modelParams.minRotationYears,
      },
    });
  };

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        className="modal modal--crops"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Верхня панель: назва культури + кнопка редагування */}
        <div className="modal__top">
          <h3>
            Культура{" "}
            <span className="modal__title-accent">
              — {form.name || "Без назви"}
            </span>
          </h3>

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

        <form
          onSubmit={handleSubmit}
          className="modal__form modal__form--crops"
        >
          {/* === Параметри для моделі + (в режимі редагування) фото === */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Параметри для моделі</span>
            </div>

            <div className="modal__section modal__section--crop-main">
              {/* Ліва частина — числові параметри моделі */}
              <div className="modal__crop-main-left">
                <div className="modal__grid modal__grid--double">
                  {/* Тривалість вегетації */}
                  <div className="modal__pair">
                    <div className="modal__label">Тривалість вегетації</div>
                    {isEditing ? (
                      <input
                        className="modal__input modal__input--short"
                        type="number"
                        min="1"
                        step="1"
                        value={form.modelParams.vegetationDays ?? ""}
                        onChange={(e) =>
                          handleNumberChange(
                            "modelParams.vegetationDays",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="modal__value modal__value--right">
                        {form.modelParams.vegetationDays
                          ? `${form.modelParams.vegetationDays} днів`
                          : "Не задано"}
                      </div>
                    )}
                  </div>

                  {/* Базова урожайність */}
                  <div className="modal__pair">
                    <div className="modal__label">Базова урожайність</div>
                    {isEditing ? (
                      <input
                        className="modal__input modal__input--short"
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.modelParams.baseYield ?? ""}
                        onChange={(e) =>
                          handleNumberChange(
                            "modelParams.baseYield",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="modal__value modal__value--right">
                        {form.modelParams.baseYield
                          ? `${form.modelParams.baseYield} т/га`
                          : "Не задано"}
                      </div>
                    )}
                  </div>

                  {/* Ціна реалізації */}
                  <div className="modal__pair">
                    <div className="modal__label">Ціна реалізації</div>
                    {isEditing ? (
                      <input
                        className="modal__input modal__input--short"
                        type="number"
                        min="0"
                        step="100"
                        value={form.modelParams.pricePerTon ?? ""}
                        onChange={(e) =>
                          handleNumberChange(
                            "modelParams.pricePerTon",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="modal__value modal__value--right">
                        {form.modelParams.pricePerTon
                          ? `${form.modelParams.pricePerTon} грн/т`
                          : "Не задано"}
                      </div>
                    )}
                  </div>

                  {/* Мінімальний період повернення на поле */}
                  <div className="modal__pair">
                    <div className="modal__label">
                      Мінімальний період повернення на поле
                    </div>
                    {isEditing ? (
                      <input
                        className="modal__input modal__input--short"
                        type="number"
                        min="1"
                        step="1"
                        value={form.modelParams.minRotationYears ?? ""}
                        onChange={(e) =>
                          handleNumberChange(
                            "modelParams.minRotationYears",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="modal__value modal__value--right">
                        {form.modelParams.minRotationYears
                          ? `${form.modelParams.minRotationYears} років`
                          : "Не задано"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Права частина — фото (тільки в режимі редагування) */}
              {isEditing && (
                <div className="modal__crop-photo">
                  <div className="modal__crop-photo-frame">
                    {form.photo ? (
                      <img
                        src={form.photo}
                        alt={form.name || "Фото культури"}
                        className="modal__crop-photo-img"
                      />
                    ) : (
                      <div className="modal__crop-photo-placeholder">
                        Немає фото
                      </div>
                    )}
                  </div>

                  <div className="modal__crop-photo-controls">
                    <label className="modal__btn-upload">
                      Обрати файл
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handlePhotoChange}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* === Технологічна карта операцій === */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Технологічна карта операцій</span>
            </div>

            <div className="modal__section">
              {/* Вибір технології */}
              <div className="modal__pair">
                <div className="modal__label">Технологія</div>
                {isEditing ? (
                  <select
                    className="modal__input"
                    value={form.technologyId || ""}
                    onChange={handleTechnologyChange}
                  >
                    <option value="">— Оберіть технологію —</option>
                    {CROP_TECHNOLOGIES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {getTechnologyOpsLabel(t)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="modal__value">
                    {form.technologyId
                      ? getTechnologyOpsLabel(selectedTechnology)
                      : "Не вибрано"}
                  </div>
                )}
              </div>

              {/* Діапазони днів виконання для операцій з обраної технології */}
              {form.technologyId && (
                <div className="modal__grid modal__grid--double">
                  {(selectedTechnology?.operations || []).map((opId) => {
                    const op = findOperationById(opId);
                    const win =
                      form.operationWindows?.find(
                        (w) => w.operationId === opId
                      ) || {};

                    return (
                      <div key={opId} className="modal__pair">
                        <div className="modal__label">{op?.label}</div>
                        {isEditing ? (
                          <div className="modal__operation-window">
                            <input
                              className="modal__input modal__input--short"
                              type="date"
                              placeholder="від"
                              value={
                                win.fromDay
                                  ? dayIndexToDateString(win.fromDay)
                                  : ""
                              }
                              onChange={(e) =>
                                handleOperationWindowDateChange(
                                  opId,
                                  "fromDay",
                                  e.target.value
                                )
                              }
                            />
                            <span className="modal__operation-window-sep">
                              –
                            </span>
                            <input
                              className="modal__input modal__input--short"
                              type="date"
                              placeholder="до"
                              value={
                                win.toDay ? dayIndexToDateString(win.toDay) : ""
                              }
                              onChange={(e) =>
                                handleOperationWindowDateChange(
                                  opId,
                                  "toDay",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        ) : (
                          <div className="modal__value modal__value--right">
                            {formatDayRangeShort(
                              win.fromDay ?? null,
                              win.toDay ?? null
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!form.technologyId && (
                <p className="modal__hint">
                  Оберіть технологію, щоб задати діапазони дат виконання
                  операцій.
                </p>
              )}
            </div>
          </div>

          {/* === Додаткові параметри === */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Додаткові параметри (до {MAX_CROP_ATTRIBUTES})</span>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddAttribute}
                  disabled={attrsCount >= MAX_CROP_ATTRIBUTES}
                >
                  Додати параметр
                </button>
              )}
            </div>

            <div className="modal__section">
              {(!form.attributes || form.attributes.length === 0) && (
                <p className="modal__hint">
                  Додаткові параметри не задані (особливості сорту, стійкість,
                  примітки тощо).
                </p>
              )}

              {isEditing ? (
                (form.attributes || []).map((attr, index) => (
                  <div
                    key={attr.id || index}
                    className="modal__row modal__row--attr"
                  >
                    <input
                      className="modal__input modal__input--attr-name"
                      value={attr.label || ""}
                      placeholder="Назва параметра"
                      onChange={(e) =>
                        handleAttrChange(index, "label", e.target.value)
                      }
                    />
                    <div className="modal__attr-edit-right">
                      <input
                        className="modal__input modal__input--attr-value"
                        value={attr.value || ""}
                        placeholder="Значення"
                        onChange={(e) =>
                          handleAttrChange(index, "value", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="modal__btn-remove"
                        onClick={() => handleRemoveAttribute(index)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="modal__grid modal__grid--triples">
                  {(form.attributes || []).map((attr, index) => (
                    <div key={attr.id || index} className="modal__pair">
                      <div className="modal__label">{attr.label || "—"}</div>
                      <div className="modal__value modal__value--right">
                        {attr.value || "Не встановлено"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* === Записник === */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Записник</span>
            </div>

            <div className="modal__section">
              <textarea
                className="modal__textarea"
                value={form.notes || ""}
                onChange={handleNotesChange}
                placeholder="Будь-які примітки щодо культури (особливості, ризики, рекомендації...)"
              />
            </div>
          </div>

          {/* === Кнопки === */}
          <div className="modal__buttons">
            <button type="submit" disabled={!isEditing}>
              Зберегти
            </button>
            {/* Видалення культури свідомо відсутнє */}
            <button type="button" onClick={onClose}>
              Закрити
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CropModal;
