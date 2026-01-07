import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHourglass } from "@fortawesome/free-regular-svg-icons";
import "./HourglassTimer.css";

const HourglassTimer = ({ onBackToDashboard }) => {
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

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
    const newDuration = parseInt(e.target.value, 10);
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setIsRunning(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (timeLeft / duration) * 100 : 0;

  return (
    <div className="timer-container">
      <button className="back-button" onClick={onBackToDashboard}>
        ← Back to Dashboard
      </button>
      <h1>⏳ Hourglass Timer</h1>

      <div className="timer-layout">
        <div className="timer-left">
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
        </div>

        <div className="timer-right">
          <div className="hourglass-wrapper">
            <FontAwesomeIcon
              icon={faHourglass}
              className={`hourglass-icon ${
                isRunning ? "hourglass-running" : ""
              }`}
              aria-label="Hourglass countdown animation"
            />

            <div className="time-display">{formatTime(timeLeft)}</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HourglassTimer;
