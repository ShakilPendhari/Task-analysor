import { useEffect, useState } from "react";

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [percentageUsed, setPercentageUsed] = useState(0);

  const [notified, setNotified] = useState({ p50: false, p70: false, p100: false });

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = (message) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Task Analyser", { body: message });
    }
  };

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(task.created_at).getTime();
      const end = new Date(task.deadline).getTime();
      const now = new Date().getTime();

      const total = end - start;
      const elapsed = now - start;
      const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);

      setPercentageUsed(progress);

      // Notification logic
      if (!task.completed) {
        if (progress >= 100 && !notified.p100) {
          sendNotification(`Deadline reached for: ${task.title}`);
          setNotified(prev => ({ ...prev, p100: true }));
        } else if (progress >= 70 && !notified.p70) {
          sendNotification(`Only 30% time remaining for: ${task.title}`);
          setNotified(prev => ({ ...prev, p70: true }));
        } else if (progress >= 50 && !notified.p50) {
          sendNotification(`50% of your allocated time is consumed for: ${task.title}`);
          setNotified(prev => ({ ...prev, p50: true }));
        }
      }

      const remaining = end - now;
      if (remaining <= 0) {
        setTimeLeft("Time's up!");
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [task.created_at, task.deadline]);

  const getStatusMessage = () => {
    if (task.completed) return "Completed";
    if (percentageUsed >= 100) return "Time's up!";
    if (percentageUsed >= 70) return `${Math.round(100 - percentageUsed)}% remaining`;
    if (percentageUsed >= 50) return `50% used`;
    return `${Math.round(percentageUsed)}% used`;
  };

  const getProgressBarColor = () => {
    if (task.completed) return "#4caf50";
    if (percentageUsed >= 100) return "#f44336";
    if (percentageUsed >= 70) return "#ff9800";
    if (percentageUsed >= 50) return "#ffeb3b";
    return "#2196f3";
  };

  return (
    <div className="task-item" style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0", borderRadius: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>{task.title}</h3>
        <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "none", color: "red", cursor: "pointer" }}>Delete</button>
      </div>
      <p>{task.description}</p>
      <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleString()}</p>
      <div style={{ margin: "10px 0" }}>
        <div style={{ background: "#eee", borderRadius: "4px", height: "10px", width: "100%" }}>
          <div style={{ 
            background: getProgressBarColor(), 
            width: `${percentageUsed}%`, 
            height: "10px", 
            borderRadius: "4px",
            transition: "width 0.5s ease-in-out"
          }}></div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9em" }}>
        <span>{getStatusMessage()}</span>
        <span>{timeLeft}</span>
      </div>
      <div style={{ marginTop: "10px" }}>
        <button 
          onClick={() => onUpdate(task.id, { completed: !task.completed })}
          style={{ 
            padding: "5px 10px", 
            backgroundColor: task.completed ? "#ccc" : "#4caf50", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {task.completed ? "Mark Incomplete" : "Mark Complete"}
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
