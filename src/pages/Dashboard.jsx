import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext.jsx";
import { getTasks, createTask, updateTask, deleteTask } from "../service/taskService.js";
import Stats from "../components/Stats.jsx";
import TaskModal from "../components/modals/TaskModal.jsx";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, Filter, Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, pending, completed
  const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest, deadline

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateOrUpdate = async (taskData) => {
    console.log("Dashboard: Submitting task data...", taskData);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        console.log("Dashboard: Creating task with user ID", user.id);
        await createTask({ ...taskData, user_id: user.id, completed: false });
      }
      fetchTasks();
      setEditingTask(null);
    } catch (err) {
      console.error("Dashboard: Error caught in handleCreateOrUpdate", err);
      alert("Error saving task: " + err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      try {
        await deleteTask(id);
        fetchTasks();
      } catch (err) {
        alert("Error deleting task: " + err.message);
      }
    }
  };

  const toggleTaskStatus = async (task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
      fetchTasks();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Filtering Logic
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "pending" && !task.completed) || 
        (activeTab === "completed" && task.completed);

      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (sortOrder === "deadline") return new Date(a.deadline) - new Date(b.deadline);
      return 0;
    });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", fontFamily: "Inter, sans-serif" }}>
      {/* Navbar Container */}
      <nav style={{ backgroundColor: "white", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: "1.25rem", color: "var(--primary)" }}>Task Analyser</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.8rem" }}>{user.email}</span>
            <button onClick={logout} style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 20px" }}>
        <Stats tasks={tasks} />

        <div style={{ marginTop: "2rem", backgroundColor: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Tasks</h2>
            <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} style={{ padding: "8px 16px" }}>+ New</button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "500px", borderCollapse: "separate", borderSpacing: "0 8px" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                  <th>Status</th>
                  <th>Task</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id} style={{ backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                    <td style={{ padding: "10px" }}><input type="checkbox" checked={task.completed} onChange={() => toggleTaskStatus(task)} /></td>
                    <td style={{ padding: "10px" }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{task.title}</div>
                    </td>
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      <button onClick={() => openEditModal(task)} style={{ fontSize: "0.8rem" }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSubmit={handleCreateOrUpdate}
        task={editingTask}
      />
    </div>
  );
};

export default Dashboard;
