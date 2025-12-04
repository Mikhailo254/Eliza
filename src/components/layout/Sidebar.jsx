function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__list">
        <h2>Список фільтрів</h2>
        <ul>
          <li>Фільтр 1</li>
          <li>Фільтр 2</li>
          <li>Фільтр 3</li>
        </ul>
      </div>

      <div className="sidebar__bottom">
        <p>
          Порожня зона (за потреби в процесі розробки можна буде придумати чим
          її задіяти)
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
