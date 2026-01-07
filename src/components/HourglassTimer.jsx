import React, { useState, useEffect } from "react";
import "./HourglassTimer.css";

const HourglassTimer = ({ onBackToDashboard }) => {
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFlipped, setHasFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

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
    setIsFlipped(false);
  };

  const handleStart = () => {
    if (timeLeft > 0) {
      if (!hasFlipped) {
        setIsFlipping(true);
        setHasFlipped(true);
        setTimeout(() => setIsFlipping(false), 650);
      }
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    setHasFlipped(false);
    setIsFlipping(false);
  };

  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value, 10);
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setIsRunning(false);
    setHasFlipped(false);
    setIsFlipping(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (timeLeft / duration) * 100 : 0;

  const topMax = 110; // height from waist (160) up to ~50
  const bottomMax = 120; // height from bottom (~280) up to waist (160)
  const running = isRunning && timeLeft > 0;
  const hasDuration = duration > 0;
  const topFrac = hasFlipped && hasDuration ? timeLeft / duration : 0;
  const bottomFrac = hasFlipped && hasDuration ? 1 - topFrac : 1;
  const topHeight = Math.max(0, Math.min(topMax, topFrac * topMax));
  const bottomHeight = Math.max(0, Math.min(bottomMax, bottomFrac * bottomMax));

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
              className={`hourglass ${isFlipping ? "flip-anim" : ""}`}
              viewBox="0 0 200 320"
              width="200"
              height="320"
              aria-label="Hourglass countdown animation"
            >
              <defs>
                <clipPath id="topBulb">
                  <polygon points="88,160 62,115 62,55 138,55 138,115 112,160" />
                </clipPath>
                <clipPath id="bottomBulb">
                  <polygon points="88,160 62,205 62,280 138,280 138,205 112,160" />
                </clipPath>
                <linearGradient id="sandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f6d365" />
                  <stop offset="100%" stopColor="#fda085" />
                </linearGradient>
                <radialGradient id="glassGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              </defs>

              {/* Glass outline */}
              <path
                d="M60,40 H140 C150,40 156,46 156,56 V64 C156,90 140,110 122,130 C110,143 100,152 100,160 C100,168 110,177 122,190 C140,210 156,230 156,256 V264 C156,274 150,280 140,280 H60 C50,280 44,274 44,264 V256 C44,230 60,210 78,190 C90,177 100,168 100,160 C100,152 90,143 78,130 C60,110 44,90 44,64 V56 C44,46 50,40 60,40 Z"
                fill="none"
                stroke="#312e81"
                strokeWidth="4"
              />

              {/* Glass subtle highlight */}
              <ellipse cx="80" cy="90" rx="6" ry="14" fill="url(#glassGlow)" />

              {/* Sand - top bulb (anchored at waist upward) */}
              <g clipPath="url(#topBulb)">
                <rect
                  x="62"
                  y={160 - topHeight}
                  width="76"
                  height={topHeight}
                  fill="url(#sandGradient)"
                />
              </g>

              {/* Sand - bottom bulb (anchored at bottom upward) */}
              <g clipPath="url(#bottomBulb)">
                <rect
                  x="62"
                  y={280 - bottomHeight}
                  width="76"
                  height={bottomHeight}
                  fill="url(#sandGradient)"
                />
              </g>

              {/* Falling sand stream */}
              {running && (
                <polygon
                  className="sand-stream"
                  points="98,160 102,160 100,208"
                  fill="url(#sandGradient)"
                />
              )}

              {/* Waist ring */}
              <circle cx="100" cy="160" r="3" fill="#f6d365" />
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
