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
    if (task.completed) return "var(--secondary)";
    if (percentageUsed >= 100) return "var(--danger)";
    if (percentageUsed >= 70) return "#f59e0b";
    if (percentageUsed >= 50) return "#fbbf24";
    return "var(--primary)";
  };

  return (
    <div className="task-card" style={{ position: 'relative' }}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <button 
          className="btn-delete"
          onClick={() => onDelete(task.id)}
          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
          title="Delete task"
        >
          🗑️
        </button>
      </div>

      {task.description && (
        <p style={{ margin: '8px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {task.description}
        </p>
      )}

      <div className="task-meta">
        <div className="task-deadline">
          <span>📅</span>
          <span>{new Date(task.deadline).toLocaleString()}</span>
        </div>
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '4px', 
          backgroundColor: getProgressBarColor() + '20',
          color: getProgressBarColor(),
          fontSize: '0.8rem',
          fontWeight: '600'
        }}>
          {getStatusMessage()}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ margin: '12px 0' }}>
        <div style={{ 
          background: 'var(--border)', 
          borderRadius: 'var(--radius-md)', 
          height: '8px', 
          width: '100%',
          overflow: 'hidden'
        }}>
          <div style={{ 
            background: getProgressBarColor(), 
            width: `${Math.min(percentageUsed, 100)}%`, 
            height: '8px', 
            borderRadius: 'var(--radius-md)',
            transition: 'width var(--transition-base)',
            boxShadow: `0 0 8px ${getProgressBarColor()}40`
          }}></div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        marginBottom: '12px'
      }}>
        <span>⏱️ Time left: <strong>{timeLeft}</strong></span>
        <span>📊 {Math.round(percentageUsed)}% used</span>
      </div>

      <div style={{ marginTop: '12px' }}>
        <button 
          onClick={() => onUpdate(task.id, { completed: !task.completed })}
          className={task.completed ? 'btn-delete' : 'btn-edit'}
          style={{ width: '100%', padding: '8px 12px' }}
          title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed ? '↩️ Mark Incomplete' : '✅ Mark Complete'}
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
