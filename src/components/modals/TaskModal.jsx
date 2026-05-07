import { useState, useEffect } from "react";

const TaskModal = ({ isOpen, onClose, onSubmit, task = null }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      // Format deadline for datetime-local input
      if (task.deadline) {
        const d = new Date(task.deadline);
        const formattedDate = d.toISOString().slice(0, 16);
        setDeadline(formattedDate);
      }
    } else {
      setTitle("");
      setDescription("");
      setDeadline("");
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description, deadline });
    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "500px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
      }}>
        <h2 style={{ marginTop: 0 }}>{task ? "Update Task" : "Create New Task"}</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontWeight: "bold" }}>Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="Enter task title"
              style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontWeight: "bold" }}>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter task description"
              style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc", minHeight: "80px" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontWeight: "bold" }}>Deadline</label>
            <input 
              type="datetime-local" 
              value={deadline} 
              onChange={(e) => setDeadline(e.target.value)} 
              required 
              style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: "10px 20px", border: "1px solid #ccc", borderRadius: "4px", background: "white", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{ padding: "10px 20px", borderRadius: "4px", background: "#007bff", color: "white", border: "none", cursor: "pointer" }}
            >
              {task ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
