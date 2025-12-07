// src/components/pages/WorkersPage/WorkerModal.jsx
import { useState } from "react";
import {
  EMPLOYMENT_TYPES,
  WORKER_ROLES,
  WORKER_OPERATION_SKILLS,
  WORKER_MACHINE_SKILLS,
  MAX_WORKER_ATTRIBUTES,
} from "./workerConfig";

function WorkerModal({
  worker,
  onSave,
  onDelete,
  onClose,
  initialEditing = false,
}) {
  const [form, setForm] = useState({
    ...worker,
    operationSkills: worker.operationSkills || [],
    machineSkills: worker.machineSkills || [],
    attributes: worker.attributes || [],
    notes: worker.notes || "",
    photo: worker.photo || null,
  });

  const [isEditing, setIsEditing] = useState(initialEditing);

  const handleBasicChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNumberChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  // Атрибути
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
      if (attrs.length >= MAX_WORKER_ATTRIBUTES) return prev;

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

  // Навички
  const toggleSkill = (fieldName, skillId) => {
    if (!isEditing) return;
    setForm((prev) => {
      const current = new Set(prev[fieldName] || []);
      if (current.has(skillId)) {
        current.delete(skillId);
      } else {
        current.add(skillId);
      }
      return { ...prev, [fieldName]: Array.from(current) };
    });
  };

  /// Записник
  const handleNotesChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, notes: value }));
  };

  // Фото
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        photo: reader.result, // dataURL
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form });
  };

  const handleBackdropClick = () => {
    onClose();
  };

  const formatHoursShort = (val) =>
    val == null || val === "" ? "" : `${val} год/день`;

  const attrsCount = (form.attributes || []).length;
  const isPermanent = form.employmentType === "permanent";

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        className="modal modal--workers"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="modal__top">
          <h3>Робітник</h3>

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
          className="modal__form modal__form--workers"
        >
          {/* === Загальні дані === */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Загальні дані</span>
            </div>

            <div className="modal__section modal__section--workers-main">
              <div className="modal__workers-main">
                {/* Ліва колонка: ім'я, тип, роль, статус */}
                <div className="modal__workers-main-left">
                  {/* Ім'я */}
                  <div className="modal__pair modal__pair--section--workers-main">
                    <div className="modal__label">Ім&apos;я / позначення</div>
                    {isEditing ? (
                      <input
                        className="modal__input"
                        name="name"
                        value={form.name || ""}
                        onChange={handleBasicChange}
                        placeholder="Наприклад, Іван Петрович"
                      />
                    ) : (
                      <div className="modal__value">
                        {form.name || "Без імені"}
                      </div>
                    )}
                  </div>

                  {/* Тип зайнятості */}
                  <div className="modal__pair modal__pair--section--workers-main">
                    <div className="modal__label">Тип зайнятості</div>
                    {isEditing ? (
                      <select
                        className="modal__input"
                        name="employmentType"
                        value={form.employmentType || ""}
                        onChange={handleBasicChange}
                      >
                        {EMPLOYMENT_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="modal__value">
                        {EMPLOYMENT_TYPES.find(
                          (t) => t.id === form.employmentType
                        )?.label || "Не задано"}
                      </div>
                    )}
                  </div>

                  {/* Роль — перенесено на місце синього прямокутника */}
                  <div className="modal__pair modal__pair--section--workers-main">
                    <div className="modal__label">Роль</div>
                    {isEditing ? (
                      <select
                        className="modal__input"
                        name="roleId"
                        value={form.roleId || ""}
                        onChange={handleBasicChange}
                      >
                        <option value="">— Оберіть роль —</option>
                        {WORKER_ROLES.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="modal__value">
                        {WORKER_ROLES.find((r) => r.id === form.roleId)
                          ?.label || "Не задано"}
                      </div>
                    )}
                  </div>

                  {/* Статус — також нижче (друга синя лінія) */}
                  <div className="modal__pair modal__pair--section--workers-main">
                    <div className="modal__label">Статус</div>
                    {isEditing ? (
                      <label className="modal__label modal__label--checkbox modal__label--checkbox--section--workers-main">
                        <input
                          className="modal__input"
                          type="checkbox"
                          name="isActive"
                          checked={!!form.isActive}
                          onChange={handleBasicChange}
                        />
                        <span>Активний у плануванні</span>
                      </label>
                    ) : (
                      <div className="modal__value">
                        {form.isActive ? "Активний" : "Неактивний"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Права колонка: Фото працівника (на місці старих Роль + Статус) */}
                <div className="modal__workers-photo">
                  <div className="modal__workers-photo-frame">
                    {form.photo ? (
                      <img
                        src={form.photo}
                        alt={form.name || "Фото працівника"}
                        className="modal__workers-photo-img"
                      />
                    ) : (
                      <div className="modal__workers-photo-placeholder">
                        Немає фото
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="modal__workers-photo-controls">
                      <label className="modal__btn-upload">
                        Обрати файл
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          hidden
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* === Робочий час (для моделі) === */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Робочий час (для моделі)</span>
            </div>

            <div className="modal__section">
              <div className="modal__grid modal__grid--double">
                {/* Годин на день */}
                <div className="modal__pair modal__pair--section--time-block">
                  <div className="modal__label">Тривалість дня</div>
                  {isEditing ? (
                    <input
                      className="modal__input modal__input--short"
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={form.hoursPerDay ?? ""}
                      onChange={(e) =>
                        handleNumberChange("hoursPerDay", e.target.value)
                      }
                    />
                  ) : (
                    <div className="modal__value modal__value--right">
                      {formatHoursShort(form.hoursPerDay) || "Не задано"}
                    </div>
                  )}
                </div>

                {/* Днів на тиждень */}
                <div className="modal__pair modal__pair--section--time-block">
                  <div className="modal__label">Робочих днів на тиждень</div>
                  {isEditing ? (
                    <input
                      className="modal__input modal__input--short"
                      type="number"
                      min="1"
                      max="7"
                      step="1"
                      value={form.daysPerWeek ?? ""}
                      onChange={(e) =>
                        handleNumberChange("daysPerWeek", e.target.value)
                      }
                    />
                  ) : (
                    <div className="modal__value modal__value--right">
                      {form.daysPerWeek
                        ? `${form.daysPerWeek} дн/тиж`
                        : "Не задано"}
                    </div>
                  )}
                </div>

                {/* Період доступності */}
                <div className="modal__pair modal__pair--section--time-block">
                  <div className="modal__label">Початок роботи в сезоні</div>
                  {isEditing ? (
                    <input
                      className="modal__input"
                      type="date"
                      name="seasonFrom"
                      value={form.seasonFrom || ""}
                      onChange={handleBasicChange}
                      disabled={isPermanent}
                    />
                  ) : (
                    <div className="modal__value">
                      {form.seasonFrom || "Увесь сезон"}
                    </div>
                  )}
                </div>

                <div className="modal__pair modal__pair--section--time-block">
                  <div className="modal__label">Кінець роботи в сезоні</div>
                  {isEditing ? (
                    <input
                      className="modal__input"
                      type="date"
                      name="seasonTo"
                      value={form.seasonTo || ""}
                      onChange={handleBasicChange}
                      disabled={isPermanent}
                    />
                  ) : (
                    <div className="modal__value">
                      {form.seasonTo || "Увесь сезон"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* === Навички === */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Навички та допуски</span>
              {isEditing && (
                <span className="modal__hint">
                  Впливають на аналітичні підказки, але не на розрахунок моделі
                  (у базовій версії).
                </span>
              )}
            </div>

            <div className="modal__section">
              {/* Операції */}
              <div className="modal__skills-block">
                <div className="modal__skills-title">Операції</div>
                <div className="modal__skills-grid">
                  {(isEditing
                    ? WORKER_OPERATION_SKILLS
                    : WORKER_OPERATION_SKILLS.filter((s) =>
                        form.operationSkills?.includes(s.id)
                      )
                  ).map((s) => {
                    const isChecked = form.operationSkills?.includes(s.id);

                    return (
                      <div key={s.id} className="modal__skill-chip">
                        <span
                          className={
                            "modal__skill-chip-text" +
                            ((isEditing && isChecked) || !isEditing
                              ? " modal__skill-chip-text--active"
                              : "")
                          }
                          onClick={
                            isEditing
                              ? () => toggleSkill("operationSkills", s.id)
                              : undefined
                          }
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Техніка */}
              <div className="modal__skills-block">
                <div className="modal__skills-title">Робота з технікою</div>
                <div className="modal__skills-grid">
                  {(isEditing
                    ? WORKER_MACHINE_SKILLS
                    : WORKER_MACHINE_SKILLS.filter((s) =>
                        form.machineSkills?.includes(s.id)
                      )
                  ).map((s) => {
                    const isChecked = form.machineSkills?.includes(s.id);

                    return (
                      <div key={s.id} className="modal__skill-chip">
                        <span
                          className={
                            "modal__skill-chip-text" +
                            ((isEditing && isChecked) || !isEditing
                              ? " modal__skill-chip-text--active"
                              : "")
                          }
                          onClick={
                            isEditing
                              ? () => toggleSkill("machineSkills", s.id)
                              : undefined
                          }
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* === Додаткові параметри === */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Додаткові параметри (до {MAX_WORKER_ATTRIBUTES})</span>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddAttribute}
                  disabled={attrsCount >= MAX_WORKER_ATTRIBUTES}
                >
                  Додати параметр
                </button>
              )}
            </div>

            <div className="modal__section">
              {(!form.attributes || form.attributes.length === 0) && (
                <p className="modal__hint">
                  Додаткові параметри не задані (телефон, адреса, примітки
                  тощо).
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
                    <div
                      key={attr.id || index}
                      className="modal__pair modal__pair--section--time-block"
                    >
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
                placeholder="Будь-які примітки щодо працівника (особливості, графік, обмеження...)"
              />
            </div>
          </div>

          {/* === Кнопки === */}
          <div className="modal__buttons">
            <button type="submit" disabled={!isEditing}>
              Зберегти
            </button>
            <button type="button" onClick={() => onDelete(form.id)}>
              Видалити робітника
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

export default WorkerModal;
