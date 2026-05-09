const TaskCard = ({ task, onUpdate, onDelete, onEdit }) => {
  const getPriorityClass = (priority) => {
    if (!priority) return 'priority-low';
    const lowerPriority = priority.toLowerCase();
    if (lowerPriority === 'high') return 'priority-high';
    if (lowerPriority === 'medium') return 'priority-medium';
    return 'priority-low';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'No deadline';
    }
  };

  const isOverdue = new Date(task.deadline) < new Date() && !task.completed;

  return (
    <div className={`task-card ${task.completed ? 'completed' : ''}`}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <input 
          type="checkbox" 
          className="task-checkbox"
          checked={task.completed} 
          onChange={() => onUpdate(task)} 
          title="Mark as complete"
        />
      </div>
      
      <div className="task-meta">
        <div className="task-deadline" title="Deadline">
          <span>📅</span>
          <span style={{ color: isOverdue ? '#ef4444' : 'inherit' }}>
            {formatDate(task.deadline)}
          </span>
        </div>
        {task.priority && (
          <span className={`task-priority ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>
        )}
      </div>

      {task.description && (
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {task.description}
        </p>
      )}
      
      <div className="task-actions">
        <button 
          className="btn-edit"
          onClick={() => onEdit(task)}
          title="Edit this task"
        >
          ✏️ Edit
        </button>
        <button 
          className="btn-delete"
          onClick={() => onDelete(task.id)}
          title="Delete this task"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
