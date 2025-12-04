// src/components/layout/TopNav.jsx
import { TABS } from "./tabsConfig";

function TopNav({ activeTab, onTabChange }) {
  return (
    <nav className="top-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={
            "top-nav__item" +
            (tab.id === activeTab ? " top-nav__item--active" : "")
          }
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export default TopNav;
