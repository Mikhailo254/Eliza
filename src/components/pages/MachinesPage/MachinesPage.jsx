// src/components/pages/MachinesPage/MachinesPage.jsx
import { useState } from "react";

import MachineModal from "./MachineModal";
import MachineCard from "./MachineCard";

/** ==== Початкові дані (поки що мок, потім можна винести в окремий файл / БД) ==== */
const initialMachines = [
  {
    id: 1,
    name: "John Deere 8295R",
    type: "tractor",
    photo: "",
    attributes: [
      { id: "power", label: "Потужність, к.с.", type: "number", value: "295" },
      { id: "fuel", label: "Тип пального", type: "text", value: "Дизель" },
    ],
    operations: [
      { operationId: "o_pl", productivityHaPerDay: 20 },
      { operationId: "o_cult", productivityHaPerDay: 45 },
    ],
    notes: "",
  },
  {
    id: 2,
    name: "CLAAS Lexion 760",
    type: "combine",
    photo: "",
    attributes: [
      { id: "hopper", label: "Обʼєм бункера, м³", type: "number", value: "11" },
      { id: "fuel", label: "Тип пального", type: "text", value: "Дизель" },
    ],
    operations: [
      { operationId: "o_harv", cropId: "wheat", productivityHaPerDay: 18 },
      { operationId: "o_harv", cropId: "corn", productivityHaPerDay: 12 },
    ],
    notes: "Основний комбайн по пшениці та кукурудзі.",
  },
];

function MachinesPage() {
  const [machines, setMachines] = useState(initialMachines);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const handleAddMachine = () => {
    const newMachine = {
      id: Date.now(),
      name: "",
      type: "",
      photo: "",
      attributes: [],
      operations: [],
      notes: "",
    };
    setSelectedMachine(newMachine);
    setIsCreateMode(true);
    setIsModalOpen(true);
  };

  const handleEditMachine = (machine) => {
    setSelectedMachine(machine);
    setIsCreateMode(false);
    setIsModalOpen(true);
  };

  const handleDeleteMachine = (id) => {
    setMachines((prev) => prev.filter((m) => m.id !== id));
    setIsModalOpen(false);
  };

  const handleSaveMachine = (machineData) => {
    setMachines((prev) => {
      const exists = prev.some((m) => m.id === machineData.id);
      if (exists) {
        return prev.map((m) => (m.id === machineData.id ? machineData : m));
      }
      return [...prev, machineData];
    });
    setIsModalOpen(false);
  };

  return (
    <div className="machines-page">
      <h2 className="machines-page__title">Техніка господарства</h2>

      <div className="machines-page__grid">
        {machines.map((machine) => (
          <button
            key={machine.id}
            className="machine-card"
            type="button"
            onClick={() => handleEditMachine(machine)}
          >
            <MachineCard machine={machine} />
          </button>
        ))}

        <button
          type="button"
          className="machine-card machine-card--add"
          onClick={handleAddMachine}
        >
          +
        </button>
      </div>

      {isModalOpen && selectedMachine && (
        <MachineModal
          key={selectedMachine.id ?? "new"}
          machine={selectedMachine}
          onSave={handleSaveMachine}
          onDelete={handleDeleteMachine}
          onClose={() => setIsModalOpen(false)}
          initialEditing={isCreateMode}
        />
      )}
    </div>
  );
}

export default MachinesPage;
