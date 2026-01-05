import React, { useState, useEffect } from "react";
import "./HourglassTimer.css";

const HourglassTimer = ({ onBackToDashboard }) => {
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

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

  const progressPercent = duration > 0 ? (timeLeft / duration) * 100 : 0;
  const topSandFillRatio =
    duration > 0 ? Math.max(0, Math.min(1, timeLeft / duration)) : 0;
  const bottomFillRatio = 1 - topSandFillRatio;

  const topClipY = 6; // matches top bulb path start
  const topClipHeight = 150; // spans to y=156
  const bottomClipY = 204; // matches bottom bulb path start
  const bottomClipHeight = 150; // spans to y=354

  const topHeight = topClipHeight * topSandFillRatio;
  const topY = topClipY + (topClipHeight - topHeight);
  const bottomHeight = bottomClipHeight * bottomFillRatio;
  const bottomY = bottomClipY + (bottomClipHeight - bottomHeight);

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
            <svg
              className="hourglass-icon"
              viewBox="0 0 220 360"
              role="img"
              aria-label="Hourglass countdown animation"
            >
              <defs>
                <linearGradient
                  id="sand-gradient-top"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#f7d7a8" />
                  <stop offset="100%" stopColor="#d8a35f" />
                </linearGradient>
                <linearGradient
                  id="sand-gradient-bottom"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#d8a35f" />
                  <stop offset="100%" stopColor="#b37530" />
                </linearGradient>
                <clipPath id="glass-body">
                  <path d="M62 12 L158 12 C174 12 186 26 178 40 L136 160 C132 170 132 178 136 188 L178 308 C186 322 174 336 158 336 L62 336 C46 336 34 322 42 308 L84 188 C88 178 88 170 84 160 L42 40 C34 26 46 12 62 12 Z" />
                </clipPath>
                <clipPath id="glass-top">
                  <path d="M62 12 L158 12 C174 12 186 26 178 40 L136 160 C132 170 88 170 84 160 L42 40 C34 26 46 12 62 12 Z" />
                </clipPath>
                <clipPath id="glass-bottom">
                  <path d="M62 336 L158 336 C174 336 186 322 178 308 L136 188 C132 178 88 178 84 188 L42 308 C34 322 46 336 62 336 Z" />
                </clipPath>
              </defs>

              <path
                className="glass-outline"
                d="M62 12 L158 12 C174 12 186 26 178 40 L136 160 C132 170 132 178 136 188 L178 308 C186 322 174 336 158 336 L62 336 C46 336 34 322 42 308 L84 188 C88 178 88 170 84 160 L42 40 C34 26 46 12 62 12 Z"
              />

              <rect
                className="sand-top"
                x="-4"
                y={topY}
                width="228"
                height={topHeight}
                clipPath="url(#glass-top)"
              />

              <rect
                className="sand-bottom"
                x="0"
                y={bottomY}
                width="220"
                height={bottomHeight}
                clipPath="url(#glass-bottom)"
              />

              {isRunning && timeLeft > 0 && (
                <rect
                  className="sand-stream"
                  x="106"
                  y="150"
                  width="8"
                  height="36"
                  clipPath="url(#glass-top)"
                />
              )}
            </svg>

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
