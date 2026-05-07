const TaskCard = ({ task, onUpdate, onDelete, onEdit }) => {
  return (
    <div style={{ 
      backgroundColor: "white", 
      padding: "1rem", 
      borderRadius: "12px", 
      border: "1px solid #e5e7eb",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ margin: 0, fontSize: "1rem" }}>{task.title}</h3>
        <input type="checkbox" checked={task.completed} onChange={() => onUpdate(task)} />
      </div>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
        Deadline: {new Date(task.deadline).toLocaleDateString()}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
        <button onClick={() => onEdit(task)} style={{ flex: 1, fontSize: "0.8rem", padding: "6px" }}>Edit</button>
        <button onClick={() => onDelete(task.id)} style={{ flex: 1, fontSize: "0.8rem", padding: "6px", backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fee2e2" }}>Delete</button>
      </div>
    </div>
  );
};

export default TaskCard;
