// src/components/pages/CropsPage/CropsPage.jsx
import { useState } from "react";
import CropCard from "./CropCard";
import CropModal from "./CropModal";
import { CROPS } from "./cropConfig";

function CropsPage() {
  // 5 фіксованих культур, користувач не додає/не видаляє
  const [crops, setCrops] = useState(CROPS);
  const [selectedCropId, setSelectedCropId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (crop) => {
    setSelectedCropId(crop.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCropId(null);
    setIsModalOpen(false);
  };

  const handleSaveCrop = (updatedCrop) => {
    setCrops((prev) =>
      prev.map((c) => (c.id === updatedCrop.id ? updatedCrop : c))
    );
    handleCloseModal();
  };

  const selectedCrop = crops.find((c) => c.id === selectedCropId) || null;

  return (
    <div className="crops-page">
      <h2 className="crops-page__title">Культури господарства</h2>

      <div className="crops-page__grid">
        {crops.map((crop) => (
          <button
            key={crop.id}
            type="button"
            className="crop-card"
            onClick={() => handleOpenModal(crop)}
          >
            <CropCard crop={crop} />
          </button>
        ))}
      </div>

      {isModalOpen && selectedCrop && (
        <CropModal
          crop={selectedCrop}
          onSave={handleSaveCrop}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default CropsPage;
