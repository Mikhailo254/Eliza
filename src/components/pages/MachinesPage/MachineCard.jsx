// src/components/pages/MachinesPage/MachineCard.jsx
import { findMachineType } from "./machineConfig";

function MachineCard({ machine }) {
  const typeLabel = findMachineType(machine.type)?.label || "Тип не заданий";
  const mainAttrs = (machine.attributes || []).slice(0, 3);
  const operationsCount = machine.operations?.length || 0;

  return (
    <>
      <div className="machine-card__image">
        {machine.photo ? (
          <img src={machine.photo} alt={machine.name || "Техніка"} />
        ) : (
          <div className="machine-card__image-placeholder">Без фото</div>
        )}
      </div>

      <div className="machine-card__content">
        <div className="machine-card__header">
          <strong>{machine.name || "Без назви"}</strong>
          <span className="machine-card__type">{typeLabel}</span>
        </div>

        <div className="machine-card__body">
          {mainAttrs.map((attr) => (
            <div key={attr.id} className="machine-card__attr">
              <span className="machine-card__attr-label">{attr.label}:</span>
              <span className="machine-card__attr-value">
                {attr.value || "—"}
              </span>
            </div>
          ))}

          {operationsCount > 0 && (
            <div className="machine-card__operations">
              Операцій: {operationsCount}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MachineCard;
