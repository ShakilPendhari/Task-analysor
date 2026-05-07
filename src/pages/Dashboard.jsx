import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext.jsx";
import { getTasks, createTask, updateTask, deleteTask } from "../service/taskService.js";
import Stats from "../components/Stats.jsx";
import TaskModal from "../components/modals/TaskModal.jsx";
import TaskCard from "../components/TaskCard.jsx";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, Filter, Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, pending, completed
  const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest, deadline

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const tasksPerPage = 5;

  // View State
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? "card" : "list"); // list, card

  const fetchTasks = async (page = currentPage) => {
    try {
      setLoading(true);
      const sortBy = sortOrder === "deadline" ? "deadline" : "created_at";
      const order = sortOrder === "oldest" ? "asc" : "desc";
      const { data, count } = await getTasks(page, tasksPerPage, debouncedSearch, sortBy, order, activeTab);
      setTasks(data);
      setTotalTasks(count);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(currentPage);
  }, [currentPage, debouncedSearch, sortOrder, activeTab]);

  const handleCreateOrUpdate = async (taskData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await createTask({ ...taskData, user_id: user.id, completed: false });
      }
      fetchTasks();
      setEditingTask(null);
    } catch (err) {
      alert("Error saving task: " + err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", fontFamily: "Inter, sans-serif" }}>
      <nav style={{ backgroundColor: "white", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: "1.25rem", color: "var(--primary)" }}>Task Analyser</h1>
          <button onClick={logout} style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 20px" }}>
        <Stats tasks={tasks} />

        <div style={{ marginTop: "2rem", backgroundColor: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {["all", "pending", "completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: activeTab === tab ? "none" : "1px solid #d1d5db",
                    backgroundColor: activeTab === tab ? "var(--primary)" : "white",
                    color: activeTab === tab ? "white" : "black",
                    textTransform: "capitalize"
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
              />
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="deadline">Deadline</option>
              </select>
              <button onClick={() => setViewMode(viewMode === "list" ? "card" : "list")} style={{ padding: "6px 12px" }}>
                {viewMode === "list" ? "Card View" : "List View"}
              </button>
              <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} style={{ padding: "8px 16px" }}>+ New</button>
            </div>
          </div>

          {viewMode === "list" ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    <th>Status</th><th>Task</th><th>Created At</th><th>Deadline</th><th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} style={{ backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                      <td><input type="checkbox" checked={task.completed} onChange={() => toggleTaskStatus(task)} /></td>
                      <td>{task.title}</td>
                      <td>{new Date(task.created_at).toLocaleDateString()}</td>
                      <td>{new Date(task.deadline).toLocaleDateString()}</td>
                      <td style={{ textAlign: "right" }}>
                        <button onClick={() => openEditModal(task)}>Edit</button>
                        <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onUpdate={toggleTaskStatus} onDelete={handleDeleteTask} onEdit={openEditModal} />
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem" }}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
            <span>Page {currentPage}</span>
            <button disabled={currentPage >= Math.ceil(totalTasks / tasksPerPage)} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </div>
      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateOrUpdate} task={editingTask} />
    </div>
  );
};

export default Dashboard;
