// src/components/pages/CropsPage/CropCard.jsx
import { findTechnologyById } from "./cropConfig";

function CropCard({ crop }) {
  const { name, photo, modelParams, technologyId } = crop || {};
  const veg = modelParams?.vegetationDays ?? null;
  const yieldT = modelParams?.baseYield ?? null;

  const technologyLabel = technologyId
    ? findTechnologyById(technologyId)?.label
    : null;

  return (
    <>
      <div className="crop-card__image">
        {photo ? (
          <img src={photo} alt={name || "Культура"} />
        ) : (
          <div className="crop-card__image-placeholder">Фото відсутнє</div>
        )}
      </div>

      <div className="crop-card__content">
        <div className="crop-card__header">
          <strong>{name || "Культура"}</strong>
        </div>

        <div className="crop-card__body">
          <div className="crop-card__row">
            <span className="crop-card__label">Тривалість вегетації:</span>
            <span className="crop-card__value">
              {veg ? `${veg} днів` : "—"}
            </span>
          </div>
          <div className="crop-card__row">
            <span className="crop-card__label">Базова урожайність:</span>
            <span className="crop-card__value">
              {yieldT ? `${yieldT} т/га` : "—"}
            </span>
          </div>

          {technologyLabel && (
            <div className="crop-card__row">
              <span className="crop-card__label">Технологія:</span>
              <span className="crop-card__value">{technologyLabel}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CropCard;
