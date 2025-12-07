// src/components/pages/WorkersPage/WorkersPage.jsx
import { useState } from "react";
import WorkerCard from "./WorkerCard";
import WorkerModal from "./WorkerModal";
import { EMPTY_WORKER, initialWorkers } from "./workerConfig";

function WorkersPage() {
  const [workers, setWorkers] = useState(initialWorkers);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const openModalWithWorker = (worker, { createMode = false } = {}) => {
    setSelectedWorker(worker);
    setIsCreateMode(createMode);
    setIsModalOpen(true);
  };

  const handleAddWorker = () => {
    const newWorker = {
      ...EMPTY_WORKER,
      id: Date.now(), // тимчасовий id, потім заміниш на id з БД
    };
    openModalWithWorker(newWorker, { createMode: true });
  };

  const handleEditWorker = (worker) => {
    openModalWithWorker(worker, { createMode: false });
  };

  const handleDeleteWorker = (id) => {
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    setIsModalOpen(false);
    setSelectedWorker(null);
    setIsCreateMode(false);
  };

  const handleSaveWorker = (workerData) => {
    setWorkers((prev) => {
      const exists = prev.some((w) => w.id === workerData.id);
      if (exists) {
        return prev.map((w) => (w.id === workerData.id ? workerData : w));
      }
      return [...prev, workerData];
    });
    setIsModalOpen(false);
    setSelectedWorker(null);
    setIsCreateMode(false);
  };

  return (
    <div className="workers-page">
      <h2 className="workers-page__title">Робітники господарства</h2>

      <div className="workers-page__grid">
        {workers.map((worker) => (
          <button
            key={worker.id}
            type="button"
            className="worker-card"
            onClick={() => handleEditWorker(worker)}
          >
            <WorkerCard worker={worker} />
          </button>
        ))}

        <button
          type="button"
          className="worker-card worker-card--add"
          onClick={handleAddWorker}
        >
          +
        </button>
      </div>

      {isModalOpen && selectedWorker && (
        <WorkerModal
          worker={selectedWorker}
          onSave={handleSaveWorker}
          onDelete={handleDeleteWorker}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedWorker(null);
            setIsCreateMode(false);
          }}
          initialEditing={isCreateMode}
        />
      )}
    </div>
  );
}

export default WorkersPage;
