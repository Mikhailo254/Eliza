// src/components/pages/CalendarPage/CalendarEventModal.jsx

import { useState } from "react";
import { EVENT_STATUSES, EVENT_TYPES } from "./calendarConfig";

function CalendarEventModal({
  event,
  refs,
  onSave,
  onDelete,
  onClose,
  initialEditing = false,
}) {
  const { fields, crops, operations, machines, workers } = refs;

  const [form, setForm] = useState(() => ({
    ...event,
    workerIds: event.workerIds || [],
    notes: event.notes || "",
    weatherConstraint: event.weatherConstraint || "",
  }));

  const [isEditing, setIsEditing] = useState(initialEditing);

  // ======================
  // Handlers
  // ======================
  const handleBasic = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleNumber = (name, value) => {
    setForm((p) => ({
      ...p,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  const toggleWorker = (workerId) => {
    if (!isEditing) return;

    setForm((p) => {
      const set = new Set((p.workerIds || []).map(Number));
      const id = Number(workerId);

      if (set.has(id)) set.delete(id);
      else set.add(id);

      return { ...p, workerIds: Array.from(set) };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal--calendar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================
            Header
        ====================== */}
        <div className="modal__top">
          <h3>Подія календаря</h3>

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
          className="modal__form modal__form--calendar"
          onSubmit={handleSubmit}
        >
          {/* ======================
              Основні дані
          ====================== */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Основні дані</span>
            </div>

            <div className="modal__section">
              <div className="modal__grid modal__grid--double">
                <div className="modal__pair">
                  <div className="modal__label">Дата</div>
                  {isEditing ? (
                    <input
                      className="modal__input"
                      type="date"
                      name="date"
                      value={form.date || ""}
                      onChange={handleBasic}
                    />
                  ) : (
                    <div className="modal__value">{form.date || "—"}</div>
                  )}
                </div>

                <div className="modal__pair">
                  <div className="modal__label">Тип</div>
                  {isEditing ? (
                    <select
                      className="modal__input"
                      name="type"
                      value={form.type || ""}
                      onChange={handleBasic}
                    >
                      {EVENT_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="modal__value">
                      {EVENT_TYPES.find((t) => t.id === form.type)?.label ||
                        "—"}
                    </div>
                  )}
                </div>

                <div className="modal__pair">
                  <div className="modal__label">Початок</div>
                  {isEditing ? (
                    <input
                      className="modal__input"
                      type="time"
                      name="startTime"
                      value={form.startTime || ""}
                      onChange={handleBasic}
                    />
                  ) : (
                    <div className="modal__value">{form.startTime || "—"}</div>
                  )}
                </div>

                <div className="modal__pair">
                  <div className="modal__label">Кінець</div>
                  {isEditing ? (
                    <input
                      className="modal__input"
                      type="time"
                      name="endTime"
                      value={form.endTime || ""}
                      onChange={handleBasic}
                    />
                  ) : (
                    <div className="modal__value">{form.endTime || "—"}</div>
                  )}
                </div>

                <div className="modal__pair">
                  <div className="modal__label">Тривалість (год)</div>
                  {isEditing ? (
                    <input
                      className="modal__input modal__input--short"
                      type="number"
                      min="0"
                      step="0.25"
                      value={form.durationHours ?? ""}
                      onChange={(e) =>
                        handleNumber("durationHours", e.target.value)
                      }
                    />
                  ) : (
                    <div className="modal__value modal__value--right">
                      {form.durationHours !== "" && form.durationHours != null
                        ? `${form.durationHours}`
                        : "—"}
                    </div>
                  )}
                </div>

                <div className="modal__pair">
                  <div className="modal__label">Статус</div>
                  {isEditing ? (
                    <select
                      className="modal__input"
                      name="status"
                      value={form.status || ""}
                      onChange={handleBasic}
                    >
                      {EVENT_STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="modal__value">
                      {EVENT_STATUSES.find((s) => s.id === form.status)?.label}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ======================
              Привʼязки та ресурси
          ====================== */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Прив’язки та ресурси</span>
            </div>

            <div className="modal__section">
              <div className="modal__grid modal__grid--double">
                <div className="modal__pair">
                  <div className="modal__label">Поле</div>
                  {isEditing ? (
                    <select
                      className="modal__input"
                      name="fieldId"
                      value={form.fieldId || ""}
                      onChange={handleBasic}
                    >
                      <option value="">— обери поле —</option>
                      {fields.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="modal__value">
                      {fields.find((f) => f.id === form.fieldId)?.name || "—"}
                    </div>
                  )}
                </div>

                <div className="modal__pair">
                  <div className="modal__label">Культура</div>
                  {isEditing ? (
                    <select
                      className="modal__input"
                      name="cropId"
                      value={form.cropId || ""}
                      onChange={handleBasic}
                    >
                      <option value="">— обери культуру —</option>
                      {crops.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="modal__value">
                      {crops.find((c) => c.id === form.cropId)?.name || "—"}
                    </div>
                  )}
                </div>

                <div className="modal__pair">
                  <div className="modal__label">Операція</div>
                  {isEditing ? (
                    <select
                      className="modal__input"
                      name="operationId"
                      value={form.operationId || ""}
                      onChange={handleBasic}
                    >
                      <option value="">— обери операцію —</option>
                      {operations.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="modal__value">
                      {operations.find((o) => o.id === form.operationId)?.name}
                    </div>
                  )}
                </div>

                <div className="modal__pair">
                  <div className="modal__label">Техніка</div>
                  {isEditing ? (
                    <select
                      className="modal__input"
                      name="machineId"
                      value={form.machineId || ""}
                      onChange={handleBasic}
                    >
                      <option value="">— обери техніку —</option>
                      {machines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="modal__value">
                      {machines.find((m) => m.id === form.machineId)?.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Працівники */}
              <div className="modal__workers-pick">
                <div className="modal__workers-pick-title">Працівники</div>

                <div className="modal__skills-grid">
                  {(isEditing
                    ? workers
                    : workers.filter((w) =>
                        (form.workerIds || []).includes(Number(w.id))
                      )
                  ).map((w) => {
                    const isOn = (form.workerIds || []).includes(Number(w.id));

                    return (
                      <div key={w.id} className="modal__skill-chip">
                        <span
                          className={
                            "modal__skill-chip-text" +
                            ((isEditing && isOn) || !isEditing
                              ? " modal__skill-chip-text--active"
                              : "")
                          }
                          onClick={
                            isEditing ? () => toggleWorker(w.id) : undefined
                          }
                        >
                          {w.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ======================
              Погодні обмеження
          ====================== */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Погодні вікна / обмеження</span>
              {isEditing && (
                <span className="modal__hint">
                  Для ЦЗР: ранок / вечір / ніч, вітер, опади
                </span>
              )}
            </div>

            <div className="modal__section">
              {isEditing ? (
                <input
                  className="modal__input"
                  name="weatherConstraint"
                  value={form.weatherConstraint || ""}
                  onChange={handleBasic}
                  placeholder='Напр.: "Вечір/ніч, без вітру"'
                />
              ) : (
                <div className="modal__value">
                  {form.weatherConstraint || "—"}
                </div>
              )}
            </div>
          </div>

          {/* ======================
              Нотатки
          ====================== */}
          <div className="modal__section-wrapper">
            <div className="modal__section-header">
              <span>Нотатки</span>
            </div>

            <div className="modal__section">
              <textarea
                className="modal__textarea"
                value={form.notes || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Коментарі, уточнення, ризики, підготовка..."
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* ======================
              Кнопки
          ====================== */}
          <div className="modal__buttons">
            <button type="submit" disabled={!isEditing}>
              Зберегти
            </button>

            <button type="button" onClick={() => onDelete(form.id)}>
              Видалити подію
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

export default CalendarEventModal;
