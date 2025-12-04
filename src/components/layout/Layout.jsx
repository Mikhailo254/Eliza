import { useState } from "react";
import Header from "./Header";
import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import MainArea from "./MainArea";
import Footer from "./Footer";

function Layout() {
  const [activeTab, setActiveTab] = useState("fields");

  return (
    <div className="app">
      <Header />

      <div className="app__body">
        <Sidebar />

        <div className="app__main">
          <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
          <MainArea activeTab={activeTab} />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Layout;
