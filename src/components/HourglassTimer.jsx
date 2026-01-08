import React, { useState, useEffect } from "react";
import "./HourglassTimer.css";

const HourglassTimer = ({ onBackToDashboard }) => {
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFlipped, setHasFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [particles, setParticles] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            // Trigger celebration particles
            const newParticles = Array.from({ length: 20 }, (_, i) => ({
              id: Date.now() + i,
              x: 100 + (Math.random() - 0.5) * 60,
              y: 160 + (Math.random() - 0.5) * 40,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
            }));
            setParticles(newParticles);
            setTimeout(() => setIsComplete(false), 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Particle animation effect
  useEffect(() => {
    if (particles.length > 0) {
      const timeout = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timeout);
    }
  }, [particles]);

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
    setIsComplete(false);
    setParticles([]);
  };

  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value, 10);
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setIsRunning(false);
    setHasFlipped(false);
    setIsFlipping(false);
    setIsComplete(false);
    setParticles([]);
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
  const isLow = hasDuration && hasFlipped && timeLeft / duration <= 0.1;

  // Dynamic stream width based on sand remaining
  const streamWidth = hasFlipped ? 2 + topFrac * 2.5 : 3;
  const streamFlowRate = hasFlipped ? 0.8 + topFrac * 0.5 : 1;
  const streamParticleCount = hasFlipped
    ? Math.max(10, Math.floor(12 + topFrac * 12))
    : 12;

  // Ambient particles for sand surface
  const generateAmbientParticles = (count, yBase, xRange) => {
    return Array.from({ length: count }, (_, i) => ({
      x: 75 + (i / count) * 50 + Math.sin(i * 2) * 5,
      y: yBase + Math.cos(i * 3) * 2,
      r: 0.5 + (i % 3) * 0.2,
    }));
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
              className={`hourglass ${isFlipping ? "flip-anim" : ""} ${
                isComplete ? "celebrate" : ""
              }`}
              viewBox="0 0 200 320"
              width="200"
              height="320"
              aria-label="Hourglass countdown animation"
            >
              <defs>
                <clipPath id="topBulb">
                  {/* Precise top bulb shape matching glass outline */}
                  <path d="M88,160 L62,115 C62,105 62,80 62,65 C62,58 64,55 66,55 L134,55 C136,55 138,58 138,65 C138,80 138,105 138,115 L112,160 Z" />
                </clipPath>
                <clipPath id="topBulbInset">
                  {/* Inset top bulb with slight waist taper */}
                  <path d="M88,160 L68,118 C70,98 78,80 92,66 L108,66 C122,80 130,98 132,118 L112,160 Z" />
                </clipPath>
                <clipPath id="bottomBulb">
                  {/* Precise bottom bulb shape matching glass outline */}
                  <path d="M88,160 L62,205 C62,215 62,240 62,255 C62,265 62,275 62,278 L62,278 C62,279 63,280 65,280 L135,280 C137,280 138,279 138,278 C138,275 138,265 138,255 C138,240 138,215 138,205 L112,160 Z" />
                </clipPath>
                <clipPath id="bottomBulbInset">
                  {/* Inset bottom bulb with slight waist taper */}
                  <path d="M88,160 L68,202 C70,230 76,258 80,272 L120,272 C124,258 130,230 132,202 L112,160 Z" />
                </clipPath>
                <clipPath id="sandStream">
                  {/* Narrow stream clip path */}
                  <rect x="97" y="160" width="6" height="50" />
                </clipPath>
                <linearGradient id="sandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f6d365" />
                  <stop offset="50%" stopColor="#fda085" />
                  <stop offset="100%" stopColor="#ff9a56" />
                </linearGradient>
                <linearGradient
                  id="sandGradientBottom"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#ff9a56" />
                  <stop offset="50%" stopColor="#fda085" />
                  <stop offset="100%" stopColor="#f6d365" />
                </linearGradient>
                <radialGradient id="glassGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
                <radialGradient id="glassReflection" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
                <filter
                  id="innerShadow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                  <feOffset dx="0" dy="2" result="offsetblur" />
                  <feFlood floodColor="rgba(0,0,0,0.3)" />
                  <feComposite in2="offsetblur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient
                  id="glassEdge"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="20%" stopColor="rgba(255,255,255,0.4)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.6)" />
                  <stop offset="80%" stopColor="rgba(255,255,255,0.4)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <radialGradient id="caustics" cx="65%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="rgba(246,211,101,0.3)" />
                  <stop offset="50%" stopColor="rgba(253,160,133,0.15)" />
                  <stop offset="100%" stopColor="rgba(255,154,86,0)" />
                </radialGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Drop shadow for depth */}
              <ellipse
                cx="100"
                cy="290"
                rx="50"
                ry="8"
                fill="rgba(0,0,0,0.15)"
              />

              {/* Glass outline moved below to overlay sand edges */}
              {/* Glass edge lighting effect */}
              <path
                d="M60,40 H140 C150,40 156,46 156,56 V64 C156,90 140,110 122,130 C110,143 100,152 100,160 C100,168 110,177 122,190 C140,210 156,230 156,256 V264 C156,274 150,280 140,280 H60 C50,280 44,274 44,264 V256 C44,230 60,210 78,190 C90,177 100,168 100,160 C100,152 90,143 78,130 C60,110 44,90 44,64 V56 C44,46 50,40 60,40 Z"
                fill="none"
                stroke="url(#glassEdge)"
                strokeWidth="1.5"
                opacity="0.5"
              />

              {/* Glass highlights for realism */}
              <ellipse cx="75" cy="80" rx="8" ry="20" fill="url(#glassGlow)" />
              {/* Glass outline with enhanced styling - placed after sand to ensure stroke overlays edges */}
              <path
                d="M60,40 H140 C150,40 156,46 156,56 V64 C156,90 140,110 122,130 C110,143 100,152 100,160 C100,168 110,177 122,190 C140,210 156,230 156,256 V264 C156,274 150,280 140,280 H60 C50,280 44,274 44,264 V256 C44,230 60,210 78,190 C90,177 100,168 100,160 C100,152 90,143 78,130 C60,110 44,90 44,64 V56 C44,46 50,40 60,40 Z"
                fill="url(#glassReflection)"
                stroke="#312e81"
                strokeWidth="4"
                opacity="0.7"
              />
              {/* Glass edge lighting overlay */}
              <path
                d="M60,40 H140 C150,40 156,46 156,56 V64 C156,90 140,110 122,130 C110,143 100,152 100,160 C100,168 110,177 122,190 C140,210 156,230 156,256 V264 C156,274 150,280 140,280 H60 C50,280 44,274 44,264 V256 C44,230 60,210 78,190 C90,177 100,168 100,160 C100,152 90,143 78,130 C60,110 44,90 44,64 V56 C44,46 50,40 60,40 Z"
                fill="none"
                stroke="url(#glassEdge)"
                strokeWidth="1.5"
                opacity="0.5"
              />
              <ellipse
                cx="125"
                cy="90"
                rx="5"
                ry="12"
                fill="url(#glassGlow)"
                opacity="0.7"
              />
              <ellipse
                cx="70"
                cy="240"
                rx="6"
                ry="15"
                fill="url(#glassGlow)"
                opacity="0.8"
              />

              {/* Caustic light patterns through glass - animated */}
              {hasFlipped && topHeight > 20 && (
                <ellipse
                  cx="85"
                  cy={160 - topHeight / 2}
                  rx="25"
                  ry="15"
                  fill="url(#caustics)"
                  className="caustic-shimmer"
                />
              )}
              {hasFlipped && bottomHeight > 30 && (
                <ellipse
                  cx="115"
                  cy={280 - bottomHeight / 2}
                  rx="20"
                  ry="18"
                  fill="url(#caustics)"
                  className="caustic-shimmer"
                  style={{ animationDelay: "0.5s" }}
                />
              )}

              {/* Sand - top bulb with texture */}
              {/* Sand - top bulb with curved surface */}
              <g clipPath="url(#topBulbInset)">
                {hasFlipped && topHeight > 0 && (
                  <>
                    {/* Main sand body with curved top surface */}
                    <path
                      d={`
                        M 62 160
                        L 62 ${160 - topHeight}
                        Q 100 ${160 - topHeight + 5} 138 ${160 - topHeight}
                        L 138 160
                        L 112 160
                        L 88 160
                        Z
                      `}
                      fill="url(#sandGradient)"
                      filter="url(#innerShadow)"
                    />
                    {/* Sand texture lines */}
                    {topHeight > 10 &&
                      Array.from({
                        length: Math.min(3, Math.floor(topHeight / 20)),
                      }).map((_, i) => (
                        <line
                          key={`top-${i}`}
                          x1="68"
                          y1={160 - topHeight + 10 + i * 15}
                          x2="132"
                          y2={160 - topHeight + 10 + i * 15}
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="0.5"
                        />
                      ))}
                    {/* Ambient sand particles on surface */}
                    {topHeight > 5 &&
                      generateAmbientParticles(6, 160 - topHeight + 3, 50).map(
                        (p, i) => (
                          <circle
                            key={`ambient-top-${i}`}
                            cx={p.x}
                            cy={p.y}
                            r={p.r}
                            fill="#f6d365"
                            opacity="0.4"
                          />
                        )
                      )}
                  </>
                )}
              </g>

              {/* Sand - bottom bulb with texture */}
              {/* Sand - bottom bulb with conical accumulation */}
              <g clipPath="url(#bottomBulbInset)">
                {hasFlipped && bottomHeight > 0 && (
                  <>
                    {/* Main sand body with conical top */}
                    <path
                      d={`
                        M 62 280
                        L 62 ${280 - bottomHeight + 5}
                        Q 100 ${280 - bottomHeight - 5} 138 ${
                        280 - bottomHeight + 5
                      }
                        L 138 280
                        L 112 270
                        Q 100 275 88 270
                        Z
                      `}
                      fill="url(#sandGradientBottom)"
                      filter="url(#innerShadow)"
                    />
                    {/* Sand cone peak effect */}
                    {bottomHeight > 15 && (
                      <path
                        d={`
                          M 95 ${280 - bottomHeight}
                          Q 100 ${280 - bottomHeight - 8} 105 ${
                          280 - bottomHeight
                        }
                          Q 100 ${280 - bottomHeight + 2} 95 ${
                          280 - bottomHeight
                        }
                          Z
                        `}
                        fill="#ff9a56"
                        opacity="0.6"
                      />
                    )}
                    {/* Sand texture lines */}
                    {bottomHeight > 20 &&
                      Array.from({
                        length: Math.min(4, Math.floor(bottomHeight / 25)),
                      }).map((_, i) => (
                        <line
                          key={`bottom-${i}`}
                          x1="68"
                          y1={280 - bottomHeight + 15 + i * 18}
                          x2="132"
                          y2={280 - bottomHeight + 15 + i * 18}
                          stroke="rgba(0,0,0,0.06)"
                          strokeWidth="0.5"
                        />
                      ))}
                    {/* Ambient sand particles on surface */}
                    {bottomHeight > 10 &&
                      generateAmbientParticles(
                        8,
                        280 - bottomHeight + 2,
                        60
                      ).map((p, i) => (
                        <circle
                          key={`ambient-bottom-${i}`}
                          cx={p.x}
                          cy={p.y}
                          r={p.r}
                          fill="#ff9a56"
                          opacity="0.3"
                        />
                      ))}
                  </>
                )}
              </g>

              {/* Enhanced falling sand stream with particles */}
              {running && (
                <>
                  {/* Subtle guide line for stream, very low opacity */}
                  <g clipPath="url(#sandStream)">
                    <line
                      x1="100"
                      y1="160"
                      x2="100"
                      y2="210"
                      stroke="url(#sandGradient)"
                      strokeWidth={Math.max(0.6, streamWidth * 0.3)}
                      opacity="0.25"
                    />
                    {/* Fine-grained free-fall particles */}
                    {Array.from({ length: streamParticleCount }).map((_, i) => {
                      const dx = Math.sin(i * 1.73) * 1.2; // per-particle drift
                      const r = 0.4 + ((i * 37) % 6) * 0.12; // small size variation
                      const dur =
                        (0.9 + ((i * 29) % 10) * 0.1) / streamFlowRate; // 0.9s–1.9s
                      const delay = ((i * 17) % 8) * 0.1; // 0–0.7s
                      return (
                        <circle
                          key={`stream-${i}`}
                          className="sand-particle"
                          cx={100}
                          cy={160}
                          r={r}
                          fill="#f6d365"
                          opacity="0.9"
                          style={{
                            "--dx": dx + "px",
                            "--dur": dur + "s",
                            animationDelay: `${delay}s`,
                          }}
                        />
                      );
                    })}
                  </g>
                </>
              )}

              {/* Celebration particles */}
              {particles.map((p) => (
                <circle
                  key={p.id}
                  className="celebration-particle"
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill="#fda085"
                  style={{
                    animation: `particle-float 2s ease-out forwards`,
                    "--vx": p.vx,
                    "--vy": p.vy,
                  }}
                  filter="url(#glow)"
                />
              ))}

              {/* Enhanced waist ring with shimmer */}
              <circle cx="100" cy="160" r="3" fill="#f6d365" />
              <circle cx="100" cy="160" r="2" fill="#fff" opacity="0.5" />
              {isLow && (
                <circle
                  className="waist-alert"
                  cx="100"
                  cy="160"
                  r="10"
                  fill="none"
                  stroke="#f6d365"
                  strokeWidth="1.5"
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
