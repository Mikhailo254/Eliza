function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__list">
        <h2>Список полів</h2>
        <ul>
          <li>Поле 1</li>
          <li>Поле 2</li>
          <li>Поле 3</li>
        </ul>
      </div>

      <div className="sidebar__bottom">
        <p>Тут буде додаткова інформація / фільтри.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
