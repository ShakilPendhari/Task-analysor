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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>📊 Task Tracker</h1>
        <div className="dashboard-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px', borderRight: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }} title="Logged in as">
              👤 {user?.email || 'User'}
            </span>
          </div>
          <button 
            className="btn-logout" 
            onClick={logout}
            title="Sign out from your account"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <Stats tasks={tasks} />

        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {/* Search & Filter Bar */}
          <div className="search-filter-bar">
            <input 
              type="text" 
              placeholder="🔍 Search tasks..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ flex: 1, minWidth: '150px' }}
            />
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ minWidth: '120px' }}
            >
              <option value="newest">📅 Newest First</option>
              <option value="oldest">📅 Oldest First</option>
              <option value="deadline">⏰ By Deadline</option>
            </select>
            <button 
              className="btn-secondary"
              onClick={() => setViewMode(viewMode === "list" ? "card" : "list")}
              style={{ padding: '10px 14px', fontSize: '0.9rem', minWidth: '100px' }}
              title={`Switch to ${viewMode === 'list' ? 'card' : 'list'} view`}
            >
              {viewMode === "list" ? "🎴 Card" : "📋 List"}
            </button>
            <button 
              className="btn-primary"
              onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              style={{ padding: '10px 16px' }}
            >
              ➕ New
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="tab-container">
            {['all', 'pending', 'completed'].map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              >
                {tab === 'all' && '📋 All Tasks'}
                {tab === 'pending' && '⏳ Pending'}
                {tab === 'completed' && '✅ Completed'}
              </button>
            ))}
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p style={{ marginLeft: '12px' }}>Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks found</h3>
              <p>Create a new task to get started!</p>
            </div>
          ) : viewMode === "list" ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: 'var(--bg-alt)', borderBottom: '2px solid var(--border)' }}>
                  <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Task</th>
                    <th style={{ padding: '12px 16px', display: 'none' }} className="hide-on-mobile">Created</th>
                    <th style={{ padding: '12px 16px' }}>Deadline</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, idx) => (
                    <tr 
                      key={task.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: idx % 2 === 0 ? 'white' : 'var(--bg-alt)',
                        transition: 'all var(--transition-base)'
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <input 
                          type="checkbox" 
                          checked={task.completed} 
                          onChange={() => toggleTaskStatus(task)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--secondary)' }}
                          title="Mark as complete"
                        />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-light)' : 'var(--text-main)' }}>
                          {task.title}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', display: 'none' }} className="hide-on-mobile">
                        {new Date(task.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {new Date(task.deadline).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button 
                          className="btn-edit"
                          onClick={() => openEditModal(task)}
                          style={{ padding: '6px 10px', fontSize: '0.8rem', marginRight: '6px' }}
                          title="Edit task"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteTask(task.id)}
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          title="Delete task"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }} className="tasks-grid">
              {tasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onUpdate={toggleTaskStatus} 
                  onDelete={handleDeleteTask} 
                  onEdit={openEditModal} 
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {tasks.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '20px', borderTop: '1px solid var(--border)' }}>
              <button 
                className="btn-secondary"
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)}
                style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                ← Previous
              </button>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                Page {currentPage} of {Math.ceil(totalTasks / tasksPerPage)}
              </span>
              <button 
                className="btn-secondary"
                disabled={currentPage >= Math.ceil(totalTasks / tasksPerPage)} 
                onClick={() => setCurrentPage(p => p + 1)}
                style={{ opacity: currentPage >= Math.ceil(totalTasks / tasksPerPage) ? 0.5 : 1 }}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            padding: '16px', 
            backgroundColor: 'var(--danger-light)', 
            border: '1px solid var(--danger)', 
            borderRadius: 'var(--radius-lg)',
            color: 'var(--danger)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>⚠️ {error}</span>
            <button 
              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem' }}
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateOrUpdate} 
        task={editingTask} 
      />
    </div>
  );
};

export default Dashboard;
