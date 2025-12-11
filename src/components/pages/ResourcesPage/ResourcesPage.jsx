// src/components/pages/ResourcesPage/ResourcesPage.jsx
import { useMemo, useState } from "react";
import {
  INITIAL_OPERATION_COSTS,
  MATERIAL_SECTIONS,
  INITIAL_PARTNERS,
} from "./resourcesConfig";

const MAX_MATERIAL_ITEMS_PER_SECTION = 15;

function ResourcesPage() {
  const [isEditing, setIsEditing] = useState(false);

  // Економіка польових операцій
  const [operationCosts, setOperationCosts] = useState(INITIAL_OPERATION_COSTS);

  // Сортування за культурою / операцією
  const [opSort, setOpSort] = useState({ column: null, direction: "asc" });

  // Матеріальні ресурси
  const [materialSections, setMaterialSections] = useState(MATERIAL_SECTIONS);

  // Партнери / підрядники
  const [partners, setPartners] = useState(INITIAL_PARTNERS);

  // Записник по ресурсах
  const [resourcesNotes, setResourcesNotes] = useState("");
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  /* ===== ХЕЛПЕРИ ДЛЯ СОРТУВАННЯ ОПЕРАЦІЙ ===== */

  const handleSortClick = (column) => {
    setOpSort((prev) => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { column, direction: "asc" };
    });
  };

  const sortedOperationCosts = useMemo(() => {
    const arr = [...operationCosts];
    const { column, direction } = opSort;

    if (!column) return arr;

    const factor = direction === "asc" ? 1 : -1;

    return arr.sort((a, b) => {
      let aVal;
      let bVal;

      if (column === "crop") {
        aVal = a.cropName || "";
        bVal = b.cropName || "";
        return aVal.localeCompare(bVal, "uk") * factor;
      }

      if (column === "operation") {
        aVal = a.operationName || "";
        bVal = b.operationName || "";
        return aVal.localeCompare(bVal, "uk") * factor;
      }

      return 0;
    });
  }, [operationCosts, opSort]);

  const renderSortIcon = (column) => {
    if (opSort.column !== column) {
      return <span className="resources-table__sort-icon">↕</span>;
    }
    return (
      <span className="resources-table__sort-icon resources-table__sort-icon--active">
        {opSort.direction === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  /* ===== ЗМІНИ ДАНИХ (ЕКОНОМІКА ОПЕРАЦІЙ) ===== */

  const handleOperationCostChange = (id, field, rawValue) => {
    if (!isEditing) return;

    setOperationCosts((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const value =
          rawValue === ""
            ? ""
            : Number.isNaN(Number(rawValue))
            ? row[field]
            : Number(rawValue);

        return { ...row, [field]: value };
      })
    );
  };

  /* ===== МАТЕРІАЛЬНІ РЕСУРСИ ===== */

  const handleMaterialCellChange = (sectionId, itemId, field, value) => {
    if (!isEditing) return;

    setMaterialSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        const items = section.items.map((item) => {
          if (item.id !== itemId) return item;

          if (field === "price" || field === "availability") {
            const num =
              value === ""
                ? ""
                : Number.isNaN(Number(value))
                ? item[field]
                : Number(value);
            return { ...item, [field]: num };
          }

          return { ...item, [field]: value };
        });

        return { ...section, items };
      })
    );
  };

  const handleAddMaterialItem = (sectionId) => {
    if (!isEditing) return;

    setMaterialSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        if (section.items.length >= MAX_MATERIAL_ITEMS_PER_SECTION) {
          return section; // не додаємо понад 15
        }

        const newItem = {
          id: `${sectionId}-${Date.now()}`,
          name: "Нова позиція",
          availability: "", // НОВЕ ПОЛЕ
          unit: "",
          price: "",
          note: "",
        };

        return { ...section, items: [...section.items, newItem] };
      })
    );
  };

  const handleRemoveMaterialItem = (sectionId, itemId) => {
    if (!isEditing) return;

    setMaterialSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          items: section.items.filter((item) => item.id !== itemId),
        };
      })
    );
  };

  /* ===== ПАРТНЕРИ / ПІДРЯДНИКИ ===== */

  const handlePartnerChange = (id, field, value) => {
    if (!isEditing) return;

    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleAddPartner = () => {
    if (!isEditing) return;

    setPartners((prev) => [
      ...prev,
      {
        id: `partner-${Date.now()}`,
        name: "Новий партнер",
        role: "",
        contact: "",
        note: "",
      },
    ]);
  };

  const handleRemovePartner = (id) => {
    if (!isEditing) return;
    setPartners((prev) => prev.filter((p) => p.id !== id));
  };

  /* ===== РЕНДЕР ===== */

  return (
    <div className="resources-page">
      <div className="resources-page__top">
        <h2 className="resources-page__title">Ресурси господарства</h2>

        <button
          type="button"
          className="resources-page__edit-toggle"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? "Закінчити редагування" : "Редагувати"}
        </button>
      </div>

      {/* === 1. Економіка польових операцій (для моделі) === */}
      <section className="resources-section">
        <div className="resources-section__header">
          <h3 className="resources-section__title">
            Економіка польових операцій (для моделі)
          </h3>
        </div>

        <div className="resources-section__body">
          <div className="resources-table-wrapper">
            <table className="resources-table resources-table--operations">
              <thead>
                <tr>
                  <th
                    className="resources-table__th resources-table__th--sortable"
                    onClick={() => handleSortClick("crop")}
                  >
                    <div className="resources-table__th-sort-inner">
                      <span>Культура</span>
                      {renderSortIcon("crop")}
                    </div>
                  </th>
                  <th
                    className="resources-table__th resources-table__th--sortable"
                    onClick={() => handleSortClick("operation")}
                  >
                    <div className="resources-table__th-sort-inner">
                      <span>Операція</span>
                      {renderSortIcon("operation")}
                    </div>
                  </th>
                  <th className="resources-table__th">
                    Власна техніка, грн/га
                  </th>
                  <th className="resources-table__th">Підрядник, грн/га</th>
                </tr>
              </thead>
              <tbody>
                {sortedOperationCosts.map((row) => (
                  <tr key={row.id}>
                    <td className="resources-table__cell">{row.cropName}</td>
                    <td className="resources-table__cell">
                      {row.operationName}
                    </td>
                    <td className="resources-table__cell resources-table__cell--numeric">
                      {isEditing ? (
                        <input
                          type="number"
                          className="resources-table__input"
                          min="0"
                          step="10"
                          value={row.costOwn ?? ""}
                          onChange={(e) =>
                            handleOperationCostChange(
                              row.id,
                              "costOwn",
                              e.target.value
                            )
                          }
                        />
                      ) : row.costOwn != null && row.costOwn !== "" ? (
                        `${row.costOwn} `
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="resources-table__cell resources-table__cell--numeric">
                      {isEditing ? (
                        <input
                          type="number"
                          className="resources-table__input"
                          min="0"
                          step="10"
                          value={row.costHire ?? ""}
                          onChange={(e) =>
                            handleOperationCostChange(
                              row.id,
                              "costHire",
                              e.target.value
                            )
                          }
                        />
                      ) : row.costHire != null && row.costHire !== "" ? (
                        `${row.costHire} `
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="resources-table__hint">
              Значення приблизні. Для реальних розрахунків користувач може
              скоригувати їх під свою економіку.
            </p>
          </div>
        </div>
      </section>

      {/* === 2. Матеріальні ресурси === */}
      <section className="resources-section">
        <div className="resources-section__header">
          <h3 className="resources-section__title">Матеріальні ресурси</h3>
        </div>

        <div className="resources-section__body resources-materials">
          {materialSections.map((section) => {
            const isLimitReached =
              section.items.length >= MAX_MATERIAL_ITEMS_PER_SECTION;

            return (
              <div key={section.id} className="resources-materials__block">
                {/* Ліва колонка з назвою блоку (200px + бордер) */}
                <div className="resources-materials__label-column">
                  <div className="resources-materials__label-main">
                    {section.label}
                  </div>

                  {isEditing && (
                    <button
                      type="button"
                      className={`resources-materials__add-btn${
                        isLimitReached
                          ? " resources-materials__add-btn--disabled"
                          : ""
                      }`}
                      onClick={() => handleAddMaterialItem(section.id)}
                      disabled={isLimitReached}
                    >
                      {isLimitReached
                        ? "Досягнуто ліміт (15)"
                        : "Додати позицію"}
                    </button>
                  )}
                </div>

                {/* Права колонка – таблиця */}
                <div className="resources-materials__table-column">
                  <table className="resources-table resources-table--materials">
                    <colgroup>
                      <col className="resources-col-name" />
                      <col className="resources-col-availability" />
                      <col className="resources-col-unit" />
                      <col className="resources-col-price" />
                      <col className="resources-col-note" />
                      {isEditing && <col className="resources-col-actions" />}
                    </colgroup>

                    <thead>
                      <tr>
                        <th className="resources-table__th">Назва</th>
                        <th className="resources-table__th">Наявність</th>
                        <th className="resources-table__th">Одиниця</th>
                        <th className="resources-table__th">
                          Ціна за од., грн
                        </th>
                        <th className="resources-table__th">Примітки</th>
                        {isEditing && <th className="resources-table__th" />}
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item) => (
                        <tr key={item.id}>
                          {/* Назва */}
                          <td className="resources-table__cell">
                            {isEditing ? (
                              <input
                                className="resources-table__input"
                                value={item.name}
                                onChange={(e) =>
                                  handleMaterialCellChange(
                                    section.id,
                                    item.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            ) : (
                              item.name || "—"
                            )}
                          </td>

                          {/* Наявність */}
                          <td className="resources-table__cell resources-table__cell--short">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                step="1"
                                className="resources-table__input"
                                value={item.availability ?? ""}
                                onChange={(e) =>
                                  handleMaterialCellChange(
                                    section.id,
                                    item.id,
                                    "availability",
                                    e.target.value
                                  )
                                }
                              />
                            ) : item.availability != null &&
                              item.availability !== "" ? (
                              item.availability
                            ) : (
                              "—"
                            )}
                          </td>

                          {/* Одиниця */}
                          <td className="resources-table__cell resources-table__cell--short">
                            {isEditing ? (
                              <input
                                className="resources-table__input"
                                value={item.unit}
                                onChange={(e) =>
                                  handleMaterialCellChange(
                                    section.id,
                                    item.id,
                                    "unit",
                                    e.target.value
                                  )
                                }
                              />
                            ) : (
                              item.unit || "—"
                            )}
                          </td>

                          {/* Ціна */}
                          <td className="resources-table__cell resources-table__cell--numeric">
                            {isEditing ? (
                              <input
                                type="number"
                                className="resources-table__input"
                                min="0"
                                step="1"
                                value={item.price ?? ""}
                                onChange={(e) =>
                                  handleMaterialCellChange(
                                    section.id,
                                    item.id,
                                    "price",
                                    e.target.value
                                  )
                                }
                              />
                            ) : item.price != null && item.price !== "" ? (
                              item.price
                            ) : (
                              "—"
                            )}
                          </td>

                          {/* Примітки */}
                          <td className="resources-table__cell">
                            {isEditing ? (
                              <input
                                className="resources-table__input"
                                value={item.note || ""}
                                onChange={(e) =>
                                  handleMaterialCellChange(
                                    section.id,
                                    item.id,
                                    "note",
                                    e.target.value
                                  )
                                }
                              />
                            ) : (
                              item.note || "—"
                            )}
                          </td>

                          {isEditing && (
                            <td className="resources-table__cell resources-table__cell--actions">
                              <button
                                type="button"
                                className="resources-table__btn-remove"
                                onClick={() =>
                                  handleRemoveMaterialItem(section.id, item.id)
                                }
                              >
                                ×
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}

                      {!section.items.length && (
                        <tr>
                          <td
                            className="resources-table__cell resources-table__cell--empty"
                            colSpan={isEditing ? 6 : 5}
                          >
                            Позиції не задані.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* === 3. Партнери / підрядники (короткий довідник) === */}
      <section className="resources-section">
        <div className="resources-section__header">
          <h3 className="resources-section__title">
            Партнери, постачальники та підрядники
          </h3>

          {isEditing && (
            <button
              type="button"
              className="resources-section__btn-main"
              onClick={handleAddPartner}
            >
              Додати партнера
            </button>
          )}
        </div>

        <div className="resources-section__body">
          <table className="resources-table resources-table--partners">
            <thead>
              <tr>
                <th className="resources-table__th">Назва</th>
                <th className="resources-table__th">Роль / тип</th>
                <th className="resources-table__th">Контакт</th>
                <th className="resources-table__th">Примітки</th>
                {isEditing && (
                  <th className="resources-table__th resources-table__th--actions">
                    Дії
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id}>
                  <td className="resources-table__cell">
                    {isEditing ? (
                      <input
                        className="resources-table__input"
                        value={p.name}
                        onChange={(e) =>
                          handlePartnerChange(p.id, "name", e.target.value)
                        }
                      />
                    ) : (
                      p.name || "—"
                    )}
                  </td>
                  <td className="resources-table__cell">
                    {isEditing ? (
                      <input
                        className="resources-table__input"
                        value={p.role}
                        onChange={(e) =>
                          handlePartnerChange(p.id, "role", e.target.value)
                        }
                      />
                    ) : (
                      p.role || "—"
                    )}
                  </td>
                  <td className="resources-table__cell">
                    {isEditing ? (
                      <input
                        className="resources-table__input"
                        value={p.contact}
                        onChange={(e) =>
                          handlePartnerChange(p.id, "contact", e.target.value)
                        }
                      />
                    ) : (
                      p.contact || "—"
                    )}
                  </td>
                  <td className="resources-table__cell">
                    {isEditing ? (
                      <input
                        className="resources-table__input"
                        value={p.note || ""}
                        onChange={(e) =>
                          handlePartnerChange(p.id, "note", e.target.value)
                        }
                      />
                    ) : (
                      p.note || "—"
                    )}
                  </td>
                  {isEditing && (
                    <td className="resources-table__cell resources-table__cell--actions">
                      <button
                        type="button"
                        className="resources-table__btn-remove"
                        onClick={() => handleRemovePartner(p.id)}
                      >
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {!partners.length && (
                <tr>
                  <td
                    className="resources-table__cell resources-table__cell--empty"
                    colSpan={isEditing ? 5 : 4}
                  >
                    Партнери не задані.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* === 4. Загальний записник по ресурсах === */}
      <section className="resources-section resources-section--notebook">
        <div className="resources-section__header">
          <h3 className="resources-section__title">Записник</h3>

          <button
            type="button"
            className="resources-section__btn-main"
            onClick={() => setIsNotesOpen((prev) => !prev)}
          >
            {isNotesOpen ? "Закрити" : "Відкрити"}
          </button>
        </div>

        {isNotesOpen && (
          <div className="resources-section__body">
            <textarea
              className="resources-notebook"
              value={resourcesNotes}
              onChange={(e) => isEditing && setResourcesNotes(e.target.value)}
              readOnly={!isEditing}
              placeholder="Будь-які примітки щодо ресурсів: закупівля, логістика, ризики, домовленості з постачальниками..."
            />
          </div>
        )}
      </section>
    </div>
  );
}

export default ResourcesPage;
