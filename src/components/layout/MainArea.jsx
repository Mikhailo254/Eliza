// src/components/layout/MainArea.jsx
import FieldsPage from "../pages/FieldsPage/FieldsPage";
import MachinesPage from "../pages/MachinesPage/MachinesPage";
import WorkersPage from "../pages/WorkersPage/WorkersPage";
import CropsPage from "../pages/CropsPage/CropsPage";
import ResourcesPage from "../pages/ResourcesPage/ResourcesPage";
import WeatherScenariosPage from "../pages/WeatherScenariosPage/WeatherScenariosPage";
import CalendarPage from "../pages/CalendarPage/CalendarPage";

function Placeholder({ text }) {
  return <div>{text}</div>;
}

const TAB_COMPONENTS = {
  fields: <FieldsPage />,

  cultures: <CropsPage />,
  machines: <MachinesPage />,
  workers: <WorkersPage />,
  resources: <ResourcesPage />,
  weather: <WeatherScenariosPage />,
  calendar: <CalendarPage />,
  profile: <Placeholder text='Тут буде "Особистий кабінет".' />,
};

function MainArea({ activeTab }) {
  return (
    <main className="main-area">
      {TAB_COMPONENTS[activeTab] || <div>Невідома вкладка: {activeTab}</div>}
    </main>
  );
}

export default MainArea;
