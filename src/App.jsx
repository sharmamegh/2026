import React, { useState } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";
import HourglassTimer from "./components/HourglassTimer";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleSelectTool = (toolId) => {
    setCurrentPage(toolId);
  };

  const handleBackToDashboard = () => {
    setCurrentPage("dashboard");
  };

  return (
    <div className="app">
      {currentPage === "dashboard" && (
        <Dashboard onSelectTool={handleSelectTool} />
      )}
      {currentPage === "timer" && (
        <HourglassTimer onBackToDashboard={handleBackToDashboard} />
      )}
    </div>
  );
}

export default App;
