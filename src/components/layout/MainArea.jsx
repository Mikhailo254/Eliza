// src/components/layout/MainArea.jsx
import FieldsPage from "./pages/FieldsPage/FieldsPage";
import MachinesPage from "./pages/MachinesPage/MachinesPage";

function Placeholder({ text }) {
  return <div>{text}</div>;
}

const TAB_COMPONENTS = {
  fields: <FieldsPage />,

  cultures: <Placeholder text='Тут буде підсистема "Культури".' />,
  machines: <MachinesPage />,
  workers: <Placeholder text='Тут буде підсистема "Робітники".' />,
  resources: <Placeholder text='Тут буде підсистема "Ресурси".' />,
  weather: <Placeholder text='Тут буде модуль "Погодні сценарії".' />,
  calendar: <Placeholder text="Тут буде календар робіт." />,
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
