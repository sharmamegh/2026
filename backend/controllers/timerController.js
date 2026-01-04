// In-memory storage for timers
let timers = [];
let nextId = 1;

// Get all timers
export const getTimers = (req, res) => {
  try {
    // Sort by createdAt descending
    const sortedTimers = [...timers].sort((a, b) => b.createdAt - a.createdAt);
    res.json(sortedTimers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single timer
export const getTimer = (req, res) => {
  try {
    const timer = timers.find((t) => t.id === req.params.id);
    if (!timer) return res.status(404).json({ message: "Timer not found" });
    res.json(timer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create timer
export const createTimer = (req, res) => {
  const { name, duration } = req.body;

  if (!duration || duration < 1) {
    return res
      .status(400)
      .json({ message: "Duration must be at least 1 second" });
  }

  const timer = {
    id: String(nextId++),
    name: name || "Unnamed Timer",
    duration,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  try {
    timers.push(timer);
    res.status(201).json(timer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update timer
export const updateTimer = (req, res) => {
  try {
    const timer = timers.find((t) => t.id === req.params.id);
    if (!timer) return res.status(404).json({ message: "Timer not found" });

    if (req.body.name) timer.name = req.body.name;
    if (req.body.duration) timer.duration = req.body.duration;
    timer.updatedAt = Date.now();

    res.json(timer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete timer
export const deleteTimer = (req, res) => {
  try {
    const index = timers.findIndex((t) => t.id === req.params.id);
    if (index === -1)
      return res.status(404).json({ message: "Timer not found" });

    timers.splice(index, 1);
    res.json({ message: "Timer deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
