import React from "react";
import "./Dashboard.css";

const Dashboard = ({ onSelectTool }) => {
  const tools = [
    {
      id: "timer",
      name: "Hourglass Timer",
      description: "Real-time countdown with animated hourglass",
      icon: "⏳",
      color: "gradient-purple",
    },
  ];

  const handleCardClick = (toolId) => {
    console.log("Card clicked:", toolId);
    if (onSelectTool) {
      onSelectTool(toolId);
    }
  };

  const handleCardKeyDown = (e, toolId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(toolId);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tiny Tools</h1>
        <p className="subtitle">A collection of small, powerful utilities</p>
      </div>

      <div className="tools-grid">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className={`tool-card ${tool.color}`}
            onClick={() => handleCardClick(tool.id)}
            onKeyDown={(e) => handleCardKeyDown(e, tool.id)}
            role="button"
            tabIndex={0}
          >
            <div className="tool-icon">{tool.icon}</div>
            <h2 className="tool-name">{tool.name}</h2>
            <p className="tool-description">{tool.description}</p>
            <div className="tool-action">
              <span className="action-text">Open</span>
              <span className="action-arrow">→</span>
            </div>
          </div>
        ))}
      </div>

      <div className="coming-soon">
        <p>More tools coming soon...</p>
      </div>
    </div>
  );
};

export default Dashboard;
