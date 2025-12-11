// src/components/pages/ResourcesPage/ResourcesEconomicsSection.jsx
import {
  RESOURCE_CROP_OPTIONS,
  RESOURCE_OPERATION_OPTIONS,
  CROP_LABEL_BY_ID,
  OPERATION_LABEL_BY_ID,
} from "./resourcesConfig";
import { useMemo, useState } from "react";

function ResourcesEconomicsSection({ operationCosts, setOperationCosts }) {
  const [selectedCropId, setSelectedCropId] = useState("");
  const [selectedOperationId, setSelectedOperationId] = useState("");

  const filteredRows = useMemo(() => {
    return operationCosts.filter((row) => {
      if (selectedCropId && row.cropId !== selectedCropId) return false;
      if (selectedOperationId && row.operationId !== selectedOperationId)
        return false;
      return true;
    });
  }, [operationCosts, selectedCropId, selectedOperationId]);

  const handleCostChange = (rowId, field, value) => {
    setOperationCosts((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;

        const num = value === "" ? "" : Number(value);
        const safe = Number.isNaN(num) ? "" : num;

        return {
          ...row,
          [field]: safe,
        };
      })
    );
  };

  return (
    <section className="resources-section resources-economics">
      <div className="modal__section-wrapper">
        <div className="modal__section-header resources-economics__header">
          <span>Економіка операцій (для моделі)</span>
          <span className="modal__hint resources-economics__hint">
            Значення використовуються в розділі 2.5 для розрахунку витрат плану
            (собівартість власних операцій та ставки підрядників, грн/га).
          </span>
        </div>

        <div className="modal__section resources-economics__section">
          {/* Фільтри */}
          <div className="resources-economics__filters">
            <div className="resources-economics__filter">
              <label>
                <span className="resources-economics__filter-label">
                  Культура
                </span>
                <select
                  value={selectedCropId}
                  onChange={(e) => setSelectedCropId(e.target.value)}
                  className="resources-economics__filter-select"
                >
                  <option value="">Усі культури</option>
                  {RESOURCE_CROP_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="resources-economics__filter">
              <label>
                <span className="resources-economics__filter-label">
                  Операція
                </span>
                <select
                  value={selectedOperationId}
                  onChange={(e) => setSelectedOperationId(e.target.value)}
                  className="resources-economics__filter-select"
                >
                  <option value="">Усі операції</option>
                  {RESOURCE_OPERATION_OPTIONS.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Таблиця витрат */}
          <div className="resources-economics__table">
            <div className="resources-economics__row resources-economics__row--header">
              <div className="resources-economics__cell resources-economics__cell--crop">
                Культура
              </div>
              <div className="resources-economics__cell resources-economics__cell--operation">
                Операція
              </div>
              <div className="resources-economics__cell resources-economics__cell--number">
                Власні ресурси, грн/га
              </div>
              <div className="resources-economics__cell resources-economics__cell--number">
                Підрядник, грн/га
              </div>
            </div>

            {filteredRows.length === 0 && (
              <div className="resources-economics__empty">
                Для вибраних фільтрів немає рядків.
              </div>
            )}

            {filteredRows.map((row) => (
              <div
                key={row.id}
                className="resources-economics__row resources-economics__row--body"
              >
                <div className="resources-economics__cell resources-economics__cell--crop">
                  {CROP_LABEL_BY_ID[row.cropId] || row.cropId}
                </div>
                <div className="resources-economics__cell resources-economics__cell--operation">
                  {OPERATION_LABEL_BY_ID[row.operationId] || row.operationId}
                </div>
                <div className="resources-economics__cell resources-economics__cell--number">
                  <input
                    type="number"
                    min="0"
                    step="10"
                    className="resources-economics__input"
                    value={row.costOwn ?? ""}
                    onChange={(e) =>
                      handleCostChange(row.id, "costOwn", e.target.value)
                    }
                    placeholder="грн/га"
                  />
                </div>
                <div className="resources-economics__cell resources-economics__cell--number">
                  <input
                    type="number"
                    min="0"
                    step="10"
                    className="resources-economics__input"
                    value={row.costHire ?? ""}
                    onChange={(e) =>
                      handleCostChange(row.id, "costHire", e.target.value)
                    }
                    placeholder="грн/га"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResourcesEconomicsSection;
