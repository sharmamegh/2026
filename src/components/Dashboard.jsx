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
      compact: true,
      selectable: true,
    },
    {
      id: "coming-soon",
      name: "More Tools",
      description: "New utilities are on the way. Stay tuned!",
      icon: "✨",
      color: "gradient-purple",
      compact: true,
      selectable: false,
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
            className={`tool-card ${tool.color} ${
              tool.compact ? "compact-card" : ""
            } ${!tool.selectable ? "disabled-card" : ""}`}
            onClick={() => tool.selectable && handleCardClick(tool.id)}
            onKeyDown={(e) => tool.selectable && handleCardKeyDown(e, tool.id)}
            role={tool.selectable ? "button" : "presentation"}
            tabIndex={tool.selectable ? 0 : -1}
          >
            <div className="tool-icon">{tool.icon}</div>
            <h2 className="tool-name">{tool.name}</h2>
            <p className="tool-description">{tool.description}</p>
            <div className="tool-action">
              <span className="action-text">
                {tool.selectable ? "Open" : "Coming Soon"}
              </span>
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
