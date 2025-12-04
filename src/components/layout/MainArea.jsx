// src/components/layout/MainArea.jsx
import FieldsPage from "./MainArea/FieldsPage/FieldsPage";

function MainArea({ activeTab }) {
  return (
    <main className="main-area">
      {activeTab === "fields" && <FieldsPage />}

      {activeTab === "cultures" && <div>Тут буде підсистема "Культури".</div>}

      {activeTab === "machines" && <div>Тут буде підсистема "Техніка".</div>}

      {activeTab === "workers" && <div>Тут буде підсистема "Робітники".</div>}

      {activeTab === "resources" && <div>Тут буде підсистема "Ресурси".</div>}

      {activeTab === "weather" && (
        <div>Тут буде модуль "Погодні сценарії".</div>
      )}

      {activeTab === "calendar" && <div>Тут буде календар робіт.</div>}

      {activeTab === "profile" && <div>Тут буде "Особистий кабінет".</div>}
    </main>
  );
}

export default MainArea;
