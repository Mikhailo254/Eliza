// src/components/pages/WorkersPage/WorkerCard.jsx
import { EMPLOYMENT_TYPES, WORKER_ROLES } from "./workerConfig";

function WorkerCard({ worker }) {
  const roleLabel =
    WORKER_ROLES.find((r) => r.id === worker.roleId)?.label || "Роль не задана";
  const employmentLabel =
    EMPLOYMENT_TYPES.find((t) => t.id === worker.employmentType)?.label ||
    "Тип не заданий";

  const hours = worker.hoursPerDay ?? null;
  const days = worker.daysPerWeek ?? null;

  return (
    <>
      <div className="worker-card__header">
        <strong>{worker.name || "Без імені"}</strong>
        <span
          className={
            "worker-card__status " +
            (worker.isActive
              ? "worker-card__status--active"
              : "worker-card__status--inactive")
          }
        >
          {worker.isActive ? "Активний" : "Неактивний"}
        </span>
      </div>

      <div className="worker-card__body">
        <div className="worker-card__info">
          <div className="worker-card__row">
            <span className="worker-card__label">Роль:</span>
            <span className="worker-card__value">{roleLabel}</span>
          </div>
          <div className="worker-card__row">
            <span className="worker-card__label">Тип:</span>
            <span className="worker-card__value">{employmentLabel}</span>
          </div>
          <div className="worker-card__row">
            <span className="worker-card__label">Робочий час:</span>
            <span className="worker-card__value">
              {hours ? `${hours} год/день` : "—"}{" "}
              {days ? `· ${days} дн/тиж` : ""}
            </span>
          </div>
        </div>

        <div className="worker-card__photo-block">
          <div className="worker-card__photo-label">Фото:</div>
          <div className="worker-card__photo-frame">
            {worker.photo ? (
              <img
                src={worker.photo}
                alt={worker.name || "Фото працівника"}
                className="worker-card__photo-img"
              />
            ) : (
              <span className="worker-card__photo-placeholder">—</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default WorkerCard;
