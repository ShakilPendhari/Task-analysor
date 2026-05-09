import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";
import { updateTask, deleteTask } from "../service/taskService";
import ConfirmModal from "../components/modals/ConfirmModal";

const formatDate = (dateString) => {
  if (!dateString) return "No deadline";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "No deadline";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTimeLocal = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
};

const getPriorityClass = (priority) => `priority-${String(priority || "Low").toLowerCase()}`;

const TaskPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching task:", error);
        navigate("/");
      } else {
        setTask(data);
        setEditedTask({
          ...data,
          deadline: formatDateTimeLocal(data.deadline),
        });
      }
      setLoading(false);
    };

    fetchTask();
  }, [id, navigate]);

  const handleUpdate = async () => {
    if (!editedTask.title?.trim()) {
      alert("Please enter a task title");
      return;
    }

    try {
      const updates = {
        title: editedTask.title.trim(),
        description: editedTask.description || "",
        deadline: editedTask.deadline || null,
        priority: editedTask.priority || "Medium",
        completed: Boolean(editedTask.completed),
      };
      const updatedTask = await updateTask(id, updates);
      setTask(updatedTask);
      setEditedTask({
        ...updatedTask,
        deadline: formatDateTimeLocal(updatedTask.deadline),
      });
      setIsEditing(false);
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(id);
      navigate("/tasks");
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  if (loading) return <div className="loading">Loading task...</div>;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="task-page-wrapper">
      <div className="task-page-header">
        <div>
          <p className="profile-kicker">Task Details</p>
          <h1>{isEditing ? "Edit Task" : "Task Overview"}</h1>
        </div>
        <button className="btn-secondary" onClick={() => navigate("/tasks")}>
          Back to Tasks
        </button>
      </div>

      <div className="task-container animate-fade-in-up">
        {isEditing ? (
          <div className="task-editor">
            <h2>Edit Task</h2>
            <div className="form-group">
              <label htmlFor="task-title">Title</label>
              <input
                id="task-title"
                type="text"
                value={editedTask.title || ""}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="task-description">Description</label>
              <textarea
                id="task-description"
                value={editedTask.description || ""}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              />
            </div>
            <div className="task-edit-grid">
              <div className="form-group">
                <label htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  value={editedTask.priority || "Medium"}
                  onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-deadline">Deadline</label>
                <input
                  id="task-deadline"
                  type="datetime-local"
                  value={editedTask.deadline || ""}
                  onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
                />
              </div>
            </div>
            <label className="task-completed-toggle">
              <input
                type="checkbox"
                checked={Boolean(editedTask.completed)}
                onChange={(e) => setEditedTask({ ...editedTask, completed: e.target.checked })}
              />
              Mark as completed
            </label>
            <div className="task-actions">
              <button className="btn-primary" onClick={handleUpdate}>
                Save Changes
              </button>
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="task-viewer">
            <div className="task-detail-main">
              <p className="profile-kicker">Title</p>
              <h2>{task.title}</h2>
              <p className="task-description">{task.description || "No description provided."}</p>
            </div>
            <aside className="task-detail-sidebar">
              <div className="task-detail-meta-card">
                <span>Status</span>
                <strong className={`status-badge ${task.completed ? "completed" : "pending"}`}>
                  {task.completed ? "Completed" : "In Progress"}
                </strong>
              </div>
              <div className="task-detail-meta-card">
                <span>Priority</span>
                <strong className={`task-priority ${getPriorityClass(task.priority)}`}>
                  {task.priority || "Low"}
                </strong>
              </div>
              <div className="task-detail-meta-card">
                <span>Deadline</span>
                <strong>{formatDate(task.deadline)}</strong>
              </div>
              <div className="task-actions">
                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                  Edit Task
                </button>
                <button className="btn-danger-outline" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Task
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete task?"
        message={`This will permanently delete "${task.title}". This action cannot be undone.`}
        confirmLabel="Delete Task"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default TaskPage;
