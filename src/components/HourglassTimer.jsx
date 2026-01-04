import React, { useState, useEffect } from "react";
import "./HourglassTimer.css";

const HourglassTimer = ({ onBackToDashboard }) => {
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [savedTimers, setSavedTimers] = useState([]);
  const [customName, setCustomName] = useState("");
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "";
  const API_URL = `${API_BASE_URL}/api/timers`;

  useEffect(() => {
    fetchTimers();
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const fetchTimers = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setSavedTimers(data);
      setError(null);
    } catch (error) {
      setError("Unable to load timers. Please try again.");
      setSavedTimers([]);
    }
  };

  const saveTimer = async () => {
    if (!customName.trim()) {
      setError("Please enter a timer name");
      return;
    }
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: customName, duration }),
      });
      if (response.ok) {
        setCustomName("");
        setError(null);
        fetchTimers();
      } else {
        const errorMessage = `Failed to save timer: ${response.status} ${response.statusText}`;
        console.error(errorMessage);
        setError("Failed to save timer. Please try again.");
      }
    } catch (error) {
      console.error("Error saving timer:", error);
      setError("Failed to save timer. Please try again.");
    }
  };

  const deleteTimer = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) {
        setError(null);
        fetchTimers();
      } else {
        setError("Failed to delete timer. Please try again.");
      }
    } catch (error) {
      setError("Failed to delete timer. Please try again.");
    }
  };

  const loadTimer = (timerDuration) => {
    setDuration(timerDuration);
    setTimeLeft(timerDuration);
    setIsRunning(false);
  };

  const handleStart = () => {
    if (timeLeft > 0) setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value);
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setIsRunning(false);
  };

  const progressPercent = duration > 0 ? (timeLeft / duration) * 100 : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="timer-container">
      <button className="back-button" onClick={onBackToDashboard}>
        ← Back to Dashboard
      </button>
      {error && (
        <div className="error-message">
          {error}
          <button
            className="error-close"
            onClick={() => setError(null)}
            aria-label="Close error message"
          >
            ✕
          </button>
        </div>
      )}
      <h1>⏳ Hourglass Timer</h1>

      <div className="timer-controls">
        <div className="preset-buttons">
          <button onClick={() => loadTimer(60)}>1 min</button>
          <button onClick={() => loadTimer(300)}>5 min</button>
          <button onClick={() => loadTimer(600)}>10 min</button>
          <button onClick={() => loadTimer(1800)}>30 min</button>
        </div>

        <div className="custom-duration">
          <label htmlFor="duration">Custom Duration (seconds): </label>
          <input
            id="duration"
            type="number"
            min="1"
            value={duration}
            onChange={handleDurationChange}
            disabled={isRunning}
          />
        </div>
      </div>

      <div className="hourglass-wrapper">
        <div className="hourglass">
          <div className="top-bulb"></div>
          <div className="sand-container">
            <div
              className="sand-falling"
              style={{ height: `${100 - progressPercent}%` }}
            ></div>
            <div
              className="sand-bottom"
              style={{ height: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="bottom-bulb"></div>
        </div>

        <div className="time-display">{formatTime(timeLeft)}</div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="btn-start"
          onClick={handleStart}
          disabled={isRunning || timeLeft === 0}
        >
          Start
        </button>
        <button
          className="btn-pause"
          onClick={handlePause}
          disabled={!isRunning}
        >
          Pause
        </button>
        <button className="btn-reset" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="save-timer-section">
        <h3>Save This Duration</h3>
        <div className="save-controls">
          <input
            type="text"
            placeholder="Timer name (e.g., 'Workout Break')"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
          <button onClick={saveTimer}>Save Timer</button>
        </div>
      </div>

      {savedTimers.length > 0 && (
        <div className="saved-timers">
          <h3>Saved Timers</h3>
          <div className="timers-grid">
            {savedTimers.map((timer) => (
              <div key={timer.id} className="timer-card">
                <h4>{timer.name}</h4>
                <p>{timer.duration}s</p>
                <button onClick={() => loadTimer(timer.duration)}>Load</button>
                <button
                  className="btn-delete"
                  onClick={() => deleteTimer(timer.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HourglassTimer;
