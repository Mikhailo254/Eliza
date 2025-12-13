// src/components/pages/WeatherScenariosPage/WeatherScenariosPage.jsx
import { useMemo, useState } from "react";
import { initialScenarios, CROPS } from "./weatherScenarioConfig";

function WeatherScenariosPage() {
  const [scenarios, setScenarios] = useState(initialScenarios);
  const [selectedId, setSelectedId] = useState(initialScenarios[0]?.id ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialScenarios[0] || null);

  // Попередження щодо суми ймовірностей
  const [probabilityWarning, setProbabilityWarning] = useState("");

  // Режим ширини макета: compact | default | wide
  const [layoutMode, setLayoutMode] = useState("default");

  // Сума ймовірностей (для підказки у списку)
  const totalProbability = useMemo(
    () => scenarios.reduce((sum, s) => sum + (Number(s.probability) || 0), 0),
    [scenarios]
  );

  /* ===== ДОПОМІЖНІ ФУНКЦІЇ ===== */

  const formatProbPercent = (p) => {
    const num = Number(p) || 0;
    return `${(num * 100).toFixed(0)}%`;
  };

  const updateDraft = (patch) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const reloadDraftFromScenarios = (id) => {
    const scenario = scenarios.find((s) => s.id === id) || null;
    setDraft(scenario ? JSON.parse(JSON.stringify(scenario)) : null);
  };

  /* ===== РОБОТА ЗІ СЦЕНАРІЯМИ ===== */

  const handleSelectScenario = (id) => {
    setSelectedId(id);
    setIsEditing(false);
    reloadDraftFromScenarios(id);
    setProbabilityWarning("");
  };

  const handleSaveScenario = () => {
    if (!draft) return;

    const normalizedDraft = {
      ...draft,
      probability:
        draft.probability === "" ? 0 : Number(draft.probability) || 0,
      cropImpacts:
        draft.cropImpacts?.map((ci) => {
          if (ci.yieldFactor === "") {
            return { ...ci, yieldFactor: "" };
          }
          const raw = Number(ci.yieldFactor);
          if (Number.isNaN(raw)) {
            return ci;
          }
          const clamped = Math.max(0, Math.min(2, raw));
          return { ...ci, yieldFactor: clamped };
        }) || [],
    };

    const newScenarios = scenarios.map((s) =>
      s.id === normalizedDraft.id ? normalizedDraft : s
    );

    // Якщо цей сценарій став базовим – інші перестають бути базовими
    if (normalizedDraft.isBaseline) {
      for (const s of newScenarios) {
        if (s.id !== normalizedDraft.id && s.isBaseline) {
          s.isBaseline = false;
        }
      }
    }

    const sum = newScenarios.reduce(
      (acc, s) => acc + (Number(s.probability) || 0),
      0
    );

    if (Math.abs(sum - 1) > 0.01) {
      setProbabilityWarning(
        `Увага: сума ймовірностей усіх сценаріїв дорівнює ${sum.toFixed(2)} (${(
          sum * 100
        ).toFixed(0)}%). Бажано, щоб вона була близькою до 1.00 (100%).`
      );
    } else {
      setProbabilityWarning("");
    }

    setScenarios(newScenarios);
    setDraft(JSON.parse(JSON.stringify(normalizedDraft)));
    setIsEditing(false);
  };

  const handleNormalizeProbabilities = () => {
    const total = scenarios.reduce(
      (sum, s) => sum + (Number(s.probability) || 0),
      0
    );
    if (total <= 0) return;

    const normalizedList = scenarios.map((s) => {
      const p = Number(s.probability) || 0;
      return {
        ...s,
        probability: p / total,
      };
    });

    setScenarios(normalizedList);

    if (draft?.id != null) {
      const updatedDraft = normalizedList.find((s) => s.id === draft.id);
      if (updatedDraft) {
        setDraft(JSON.parse(JSON.stringify(updatedDraft)));
      }
    }

    setProbabilityWarning("");
  };

  /* ===== ОБРОБНИКИ ПОЛІВ ЧЕРНЕТКИ ===== */

  const handleBasicFieldChange = (field, value) => {
    if (!draft) return;

    if (field === "probability") {
      updateDraft({
        [field]: value === "" ? "" : Number(value),
      });
      return;
    }

    if (field === "isBaseline") {
      updateDraft({ isBaseline: !!value });
      return;
    }

    updateDraft({ [field]: value });
  };

  const handleMeteoFieldChange = (field, rawValue) => {
    if (!draft) return;

    setDraft((prev) => ({
      ...prev,
      meteo: {
        ...prev.meteo,
        [field]: rawValue === "" ? "" : Number(rawValue),
      },
    }));
  };

  const handleOperationImpactChange = (field, rawValue) => {
    if (!draft) return;

    setDraft((prev) => ({
      ...prev,
      operationImpact: {
        ...prev.operationImpact,
        [field]: rawValue === "" ? "" : Number(rawValue),
      },
    }));
  };

  const handleCropImpactChange = (cropId, field, rawValue) => {
    if (!draft) return;

    setDraft((prev) => {
      const list = prev.cropImpacts || [];
      const updated = list.map((ci) => {
        if (ci.cropId !== cropId) return ci;

        if (field === "yieldFactor") {
          if (rawValue === "") {
            return { ...ci, yieldFactor: "" };
          }
          const val = Number(rawValue);
          if (Number.isNaN(val)) {
            return ci;
          }
          const clamped = Math.max(0, Math.min(2, val));
          return { ...ci, yieldFactor: clamped };
        }

        return { ...ci, [field]: rawValue };
      });

      return { ...prev, cropImpacts: updated };
    });
  };

  /* ===== РОБОТА З РЕЖИМАМИ ЛЕЙАУТУ ===== */

  const handleSetLayoutMode = (mode) => {
    setLayoutMode(mode);
  };

  const handleStartEditing = () => {
    if (!selectedId) return;
    reloadDraftFromScenarios(selectedId);
    setIsEditing(true);
    setProbabilityWarning("");
  };

  const handleCancelEditing = () => {
    if (selectedId != null) {
      reloadDraftFromScenarios(selectedId);
    }
    setIsEditing(false);
    setProbabilityWarning("");
  };

  /* ===== РЕНДЕР ===== */

  const layoutClassName =
    "weather-page__layout weather-page__layout--" + layoutMode;

  return (
    <div className="weather-page">
      <div className="weather-page__top">
        <h2 className="weather-page__title">Погодні сценарії</h2>

        <div className="weather-page__layout-controls">
          <button
            type="button"
            className={
              "weather-page__btn-layout" +
              (layoutMode === "compact"
                ? " weather-page__btn-layout--active"
                : "")
            }
            onClick={() => handleSetLayoutMode("compact")}
            title="Звузити список сценаріїв"
          >
            ◀
          </button>
          <button
            type="button"
            className={
              "weather-page__btn-layout" +
              (layoutMode === "default"
                ? " weather-page__btn-layout--active"
                : "")
            }
            onClick={() => handleSetLayoutMode("default")}
            title="Стандартна ширина"
          >
            ◑
          </button>
          <button
            type="button"
            className={
              "weather-page__btn-layout" +
              (layoutMode === "wide" ? " weather-page__btn-layout--active" : "")
            }
            onClick={() => handleSetLayoutMode("wide")}
            title="Розширити список сценаріїв"
          >
            ▶
          </button>
        </div>
      </div>

      <div className={layoutClassName}>
        {/* ========== Ліва частина: список сценаріїв ========== */}
        <section className="weather-page__list-section">
          <div className="weather-page__list-header">
            <h3 className="weather-page__list-title">Список сценаріїв</h3>

            <div className="weather-page__prob-row">
              <div className="weather-page__prob-summary">
                Сума ймовірностей:{" "}
                <span
                  className={
                    "weather-page__prob-value" +
                    (Math.abs(totalProbability - 1) < 0.01
                      ? " weather-page__prob-value--ok"
                      : " weather-page__prob-value--warn")
                  }
                >
                  {totalProbability.toFixed(2)} (
                  {(totalProbability * 100).toFixed(0)}%)
                </span>
              </div>

              <button
                type="button"
                className="weather-page__btn-normalize"
                onClick={handleNormalizeProbabilities}
              >
                Нормувати
              </button>
            </div>
          </div>

          <div className="weather-page__list-body">
            <table className="weather-table">
              <thead>
                <tr>
                  <th>Назва</th>
                  <th>Ймовірність</th>
                  <th>Базовий</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => {
                  const isSelected = s.id === selectedId;
                  return (
                    <tr
                      key={s.id}
                      className={
                        "weather-table__row" +
                        (isSelected ? " weather-table__row--selected" : "")
                      }
                      onClick={() => handleSelectScenario(s.id)}
                    >
                      <td>{s.name || "Без назви"}</td>
                      <td className="weather-table__cell-prob">
                        {formatProbPercent(s.probability)}
                      </td>
                      <td className="weather-table__cell-baseline">
                        {s.isBaseline ? "✓" : ""}
                      </td>
                    </tr>
                  );
                })}

                {scenarios.length === 0 && (
                  <tr>
                    <td colSpan={3} className="weather-table__cell-empty">
                      Сценарії не задані.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========== Права частина: деталі вибраного сценарію ========== */}
        <section className="weather-page__details-section">
          {!draft ? (
            <div className="weather-details__placeholder">
              Оберіть сценарій зліва.
            </div>
          ) : (
            <div className="weather-details">
              <div className="weather-details__top">
                <div>
                  <div className="weather-details__name">
                    {draft.name || "Без назви"}
                  </div>
                  {/* П.3 – прибрали підпис «Тип року» під назвою */}
                </div>

                <div className="weather-details__top-actions">
                  {!isEditing ? (
                    <button
                      type="button"
                      className="weather-details__edit-toggle"
                      onClick={handleStartEditing}
                    >
                      Редагувати
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="weather-details__edit-toggle"
                        onClick={handleCancelEditing}
                      >
                        Відмінити
                      </button>

                      <button
                        type="button"
                        className="weather-details__save"
                        onClick={handleSaveScenario}
                      >
                        Зберегти
                      </button>
                    </>
                  )}
                </div>
              </div>

              {probabilityWarning && (
                <div className="weather-details__prob-warning">
                  {probabilityWarning}
                </div>
              )}

              {/* === 1. Загальні дані === */}
              <div className="weather-details__section">
                <h4 className="weather-details__section-title">
                  Загальні дані
                </h4>

                <div className="weather-details__grid weather-details__grid--two">
                  {/* П.4 – рядок «Назва» прибрано */}

                  {/* Ймовірність */}
                  <div className="weather-details__row">
                    <div className="modal__label">Ймовірність</div>
                    {isEditing ? (
                      <div className="weather-details__prob-input">
                        <input
                          className="modal__input"
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          value={draft.probability ?? ""}
                          onChange={(e) =>
                            handleBasicFieldChange(
                              "probability",
                              e.target.value
                            )
                          }
                        />
                        <span className="weather-details__prob-suffix">
                          ({formatProbPercent(draft.probability)})
                        </span>
                      </div>
                    ) : (
                      <div className="modal__value">
                        {formatProbPercent(draft.probability)}
                      </div>
                    )}
                  </div>

                  {/* Базовий */}
                  <div className="weather-details__row">
                    <div className="modal__label">Базовий сценарій</div>
                    {isEditing ? (
                      <label className="modal__label modal__label--checkbox">
                        <input
                          type="checkbox"
                          checked={!!draft.isBaseline}
                          onChange={(e) =>
                            handleBasicFieldChange(
                              "isBaseline",
                              e.target.checked
                            )
                          }
                        />
                        <span>Використовувати як референтний</span>
                      </label>
                    ) : (
                      <div className="modal__value">
                        {draft.isBaseline ? "Так" : "Ні"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* === 2. Опис погоди === */}
              <div className="weather-details__section">
                <h4 className="weather-details__section-title">Опис погоди</h4>

                <div className="weather-details__row weather-details__row--full">
                  <div className="modal__label">Короткий опис</div>
                  {isEditing ? (
                    <input
                      className="modal__input"
                      value={draft.descriptionShort || ""}
                      onChange={(e) =>
                        handleBasicFieldChange(
                          "descriptionShort",
                          e.target.value
                        )
                      }
                      placeholder="1–2 речення про сценарій"
                    />
                  ) : (
                    <div className="modal__value">
                      {draft.descriptionShort || "Не задано"}
                    </div>
                  )}
                </div>

                <div className="weather-details__row weather-details__row--full">
                  <div className="modal__label">Детальний опис</div>
                  {isEditing ? (
                    <textarea
                      className="modal__textarea"
                      value={draft.description || ""}
                      onChange={(e) =>
                        handleBasicFieldChange("description", e.target.value)
                      }
                      placeholder="Будь-які деталі щодо характеру погоди, ризиків, років-аналогів..."
                    />
                  ) : (
                    <div className="modal__value weather-details__text">
                      {draft.description || "Не задано"}
                    </div>
                  )}
                </div>
              </div>

              {/* === 3. Агреговані метеопараметри === */}
              <div className="weather-details__section">
                <h4 className="weather-details__section-title">
                  Агреговані метеопараметри (для розуміння)
                </h4>

                <p className="weather-details__hint">
                  Ці показники описують сценарний хід погоди: опади, середні
                  температури та орієнтовний фонд придатних робочих днів і
                  «вікон» для обприскування.
                </p>

                <div className="weather-details__grid weather-details__grid--three">
                  {/* Опади */}
                  <div className="weather-details__row">
                    <div className="modal__label">Опади весна, мм</div>
                    {isEditing ? (
                      <input
                        className="modal__input"
                        type="number"
                        min="0"
                        step="1"
                        value={draft.meteo?.precip_spring ?? ""}
                        onChange={(e) =>
                          handleMeteoFieldChange(
                            "precip_spring",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="modal__value">
                        {draft.meteo?.precip_spring ?? "Не задано"}
                      </div>
                    )}
                  </div>

                  <div className="weather-details__row">
                    <div className="modal__label">Опади літо, мм</div>
                    {isEditing ? (
                      <input
                        className="modal__input"
                        type="number"
                        min="0"
                        step="1"
                        value={draft.meteo?.precip_summer ?? ""}
                        onChange={(e) =>
                          handleMeteoFieldChange(
                            "precip_summer",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="modal__value">
                        {draft.meteo?.precip_summer ?? "Не задано"}
                      </div>
                    )}
                  </div>

                  <div className="weather-details__row">
                    <div className="modal__label">Опади осінь, мм</div>
                    {isEditing ? (
                      <input
                        className="modal__input"
                        type="number"
                        min="0"
                        step="1"
                        value={draft.meteo?.precip_autumn ?? ""}
                        onChange={(e) =>
                          handleMeteoFieldChange(
                            "precip_autumn",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="modal__value">
                        {draft.meteo?.precip_autumn ?? "Не задано"}
                      </div>
                    )}
                  </div>

                  {/* Температури */}
                  <div className="weather-details__row">
                    <div className="modal__label">Середня T весна, °C</div>
                    {isEditing ? (
                      <input
                        className="modal__input"
                        type="number"
                        step="0.1"
                        value={draft.meteo?.temp_spring ?? ""}
                        onChange={(e) =>
                          handleMeteoFieldChange("temp_spring", e.target.value)
                        }
                      />
                    ) : (
                      <div className="modal__value">
                        {draft.meteo?.temp_spring ?? "Не задано"}
                      </div>
                    )}
                  </div>

                  <div className="weather-details__row">
                    <div className="modal__label">Середня T літо, °C</div>
                    {isEditing ? (
                      <input
                        className="modal__input"
                        type="number"
                        step="0.1"
                        value={draft.meteo?.temp_summer ?? ""}
                        onChange={(e) =>
                          handleMeteoFieldChange("temp_summer", e.target.value)
                        }
                      />
                    ) : (
                      <div className="modal__value">
                        {draft.meteo?.temp_summer ?? "Не задано"}
                      </div>
                    )}
                  </div>

                  {/* Робочі дні */}
                  <div className="weather-details__row">
                    <div className="modal__label">Робочі дні весна</div>
                    {isEditing ? (
                      <input
                        className="modal__input"
                        type="number"
                        min="0"
                        step="1"
                        value={draft.meteo?.workDays_spring ?? ""}
                        onChange={(e) =>
                          handleMeteoFieldChange(
                            "workDays_spring",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="modal__value">
                        {draft.meteo?.workDays_spring ?? "Не задано"}
                      </div>
                    )}
                  </div>

                  <div className="weather-details__row">
                    <div className="modal__label">Робочі дні літо</div>
                    {isEditing ? (
                      <input
                        className="modal__input"
                        type="number"
                        min="0"
                        step="1"
                        value={draft.meteo?.workDays_summer ?? ""}
                        onChange={(e) =>
                          handleMeteoFieldChange(
                            "workDays_summer",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="modal__value">
                        {draft.meteo?.workDays_summer ?? "Не задано"}
                      </div>
                    )}
                  </div>

                  <div className="weather-details__row">
                    <div className="modal__label">
                      Вікна для обприскування, днів
                    </div>
                    {isEditing ? (
                      <input
                        className="modal__input"
                        type="number"
                        min="0"
                        step="1"
                        value={draft.meteo?.sprayWindows_summer ?? ""}
                        onChange={(e) =>
                          handleMeteoFieldChange(
                            "sprayWindows_summer",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="modal__value">
                        {draft.meteo?.sprayWindows_summer ?? "Не задано"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* === 4. Вплив на культури (γ_c,s) === */}
              <div className="weather-details__section">
                <h4 className="weather-details__section-title">
                  Вплив на культури (коефіцієнт до врожайності γ<sub>c,s</sub>)
                </h4>

                <p className="weather-details__hint">
                  γ = 1.00 — нормальний рік; γ &lt; 1 — зниження врожайності
                  (посуха, надмірна вологість тощо); γ &gt; 1 — кращі за середні
                  умови. Значення обмежуються діапазоном [0; 2]. Початкові
                  значення заповнені автоматично для кожної культури відповідно
                  до сценарію.
                </p>

                <div className="weather-details__table-wrapper">
                  <table className="weather-table weather-table--crops">
                    <thead>
                      <tr>
                        <th>Культура</th>
                        <th>Коефіцієнт γ</th>
                        <th>Примітки</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CROPS.map((crop) => {
                        const impact = draft.cropImpacts?.find(
                          (ci) => ci.cropId === crop.id
                        ) || {
                          cropId: crop.id,
                          yieldFactor: "",
                          note: "",
                        };

                        return (
                          <tr key={crop.id}>
                            <td>{crop.label}</td>
                            <td className="weather-table__cell-numeric">
                              {isEditing ? (
                                <input
                                  className="weather-table__input"
                                  type="number"
                                  step="0.05"
                                  min="0"
                                  max="2"
                                  value={impact.yieldFactor ?? ""}
                                  onChange={(e) =>
                                    handleCropImpactChange(
                                      crop.id,
                                      "yieldFactor",
                                      e.target.value
                                    )
                                  }
                                  placeholder="1.00"
                                />
                              ) : (
                                impact.yieldFactor ?? "Не задано"
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input
                                  className="weather-table__input"
                                  value={impact.note || ""}
                                  onChange={(e) =>
                                    handleCropImpactChange(
                                      crop.id,
                                      "note",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Короткий коментар"
                                />
                              ) : (
                                impact.note || "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* === 5. Вплив на можливість виконання операцій === */}
              <div className="weather-details__section">
                <h4 className="weather-details__section-title">
                  Вплив на можливість виконання операцій
                </h4>

                <p className="weather-details__hint">
                  Коефіцієнти 0.7–1.3: менше 1 — складніше виконувати операції
                  (менше придатних днів), більше 1 — простіше. Початкові
                  значення заповнені автоматично відповідно до сценарію.
                </p>

                <div className="weather-details__grid weather-details__grid--two">
                  <div className="weather-details__row">
                    <div className="modal__label">Підготовка ґрунту</div>
                    {isEditing ? (
                      <input
                        className="modal__input modal__input--short"
                        type="number"
                        step="0.05"
                        min="0.3"
                        max="2"
                        value={draft.operationImpact?.soilPrepFactor ?? ""}
                        onChange={(e) =>
                          handleOperationImpactChange(
                            "soilPrepFactor",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="modal__value modal__value--right">
                        {draft.operationImpact?.soilPrepFactor ?? "1.0"}
                      </div>
                    )}
                  </div>

                  <div className="weather-details__row">
                    <div className="modal__label">Сівба</div>
                    {isEditing ? (
                      <input
                        className="modal__input modal__input--short"
                        type="number"
                        step="0.05"
                        min="0.3"
                        max="2"
                        value={draft.operationImpact?.sowingFactor ?? ""}
                        onChange={(e) =>
                          handleOperationImpactChange(
                            "sowingFactor",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="modal__value modal__value--right">
                        {draft.operationImpact?.sowingFactor ?? "1.0"}
                      </div>
                    )}
                  </div>

                  <div className="weather-details__row">
                    <div className="modal__label">Обприскування</div>
                    {isEditing ? (
                      <input
                        className="modal__input modal__input--short"
                        type="number"
                        step="0.05"
                        min="0.3"
                        max="2"
                        value={draft.operationImpact?.sprayingFactor ?? ""}
                        onChange={(e) =>
                          handleOperationImpactChange(
                            "sprayingFactor",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="modal__value modal__value--right">
                        {draft.operationImpact?.sprayingFactor ?? "1.0"}
                      </div>
                    )}
                  </div>

                  <div className="weather-details__row">
                    <div className="modal__label">Збирання врожаю</div>
                    {isEditing ? (
                      <input
                        className="modal__input modal__input--short"
                        type="number"
                        step="0.05"
                        min="0.3"
                        max="2"
                        value={draft.operationImpact?.harvestFactor ?? ""}
                        onChange={(e) =>
                          handleOperationImpactChange(
                            "harvestFactor",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="modal__value modal__value--right">
                        {draft.operationImpact?.harvestFactor ?? "1.0"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* === 6. Записник === */}
              <div className="weather-details__section">
                <h4 className="weather-details__section-title">Записник</h4>

                {isEditing ? (
                  <textarea
                    className="modal__textarea"
                    value={draft.notes || ""}
                    onChange={(e) =>
                      handleBasicFieldChange("notes", e.target.value)
                    }
                    placeholder="Будь-які примітки щодо сценарію: джерела даних, коментарі щодо ризиків, років-аналогів..."
                  />
                ) : (
                  <div className="modal__value weather-details__text">
                    {draft.notes || "—"}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default WeatherScenariosPage;
