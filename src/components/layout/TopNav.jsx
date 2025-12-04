// src/components/layout/TopNav.jsx

function TopNav({ activeTab, onTabChange }) {
  const makeClass = (tab) =>
    tab === activeTab ? "top-nav__item top-nav__item--active" : "top-nav__item";

  return (
    <nav className="top-nav">
      <button
        className={makeClass("fields")}
        onClick={() => onTabChange("fields")}
      >
        Поля
      </button>
      <button
        className={makeClass("cultures")}
        onClick={() => onTabChange("cultures")}
      >
        Культури
      </button>
      <button
        className={makeClass("machines")}
        onClick={() => onTabChange("machines")}
      >
        Техніка
      </button>
      <button
        className={makeClass("workers")}
        onClick={() => onTabChange("workers")}
      >
        Робітники
      </button>
      <button
        className={makeClass("resources")}
        onClick={() => onTabChange("resources")}
      >
        Ресурси
      </button>
      <button
        className={makeClass("weather")}
        onClick={() => onTabChange("weather")}
      >
        Погодні сценарії
      </button>
      <button
        className={makeClass("calendar")}
        onClick={() => onTabChange("calendar")}
      >
        Календар
      </button>
      <button
        className={makeClass("profile")}
        onClick={() => onTabChange("profile")}
      >
        Особистий кабінет
      </button>
    </nav>
  );
}

export default TopNav;
