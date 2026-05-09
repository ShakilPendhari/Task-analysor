import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { getTasks, createTask, updateTask, deleteTask } from "../service/taskService.js";
import TaskModal from "../components/modals/TaskModal.jsx";
import ConfirmModal from "../components/modals/ConfirmModal.jsx";
import TaskCard from "../components/TaskCard.jsx";

const TASKS_PER_PAGE = 10;

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

const getPriorityClass = (priority) => {
  if (!priority) return "priority-low";
  return `priority-${priority.toLowerCase()}`;
};

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? "card" : "list");
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchTasks = useCallback(async (page = currentPage) => {
    try {
      setLoading(true);
      const sortBy = sortOrder === "deadline" ? "deadline" : "created_at";
      const order = sortOrder === "oldest" ? "asc" : "desc";
      const { data, count } = await getTasks(
        page,
        TASKS_PER_PAGE,
        debouncedSearch,
        sortBy,
        order,
        activeTab,
      );
      setTasks(data || []);
      setTotalTasks(count || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, debouncedSearch, sortOrder]);

  useEffect(() => {
    fetchTasks(currentPage);
  }, [currentPage, fetchTasks]);

  const totalPages = Math.max(1, Math.ceil(totalTasks / TASKS_PER_PAGE));

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

  const requestDeleteTask = (taskOrId) => {
    const selectedTask = typeof taskOrId === "object"
      ? taskOrId
      : tasks.find((task) => task.id === taskOrId);

    setTaskToDelete(selectedTask || { id: taskOrId, title: "this task" });
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      alert("Error deleting task: " + err.message);
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
    <main className="page-shell tasks-page animate-fade-in-up">
      <section className="task-panel">
        <div className="task-panel-header">
          <div>
            <p className="profile-kicker">Tasks</p>
            <h1>Task Management</h1>
          </div>
          <span className="task-count">{totalTasks} total</span>
        </div>

        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="deadline">By Deadline</option>
          </select>
          <button
            className="btn-secondary"
            onClick={() => setViewMode(viewMode === "list" ? "card" : "list")}
            title={`Switch to ${viewMode === "list" ? "card" : "list"} view`}
          >
            {viewMode === "list" ? "Card View" : "List View"}
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
          >
            New Task
          </button>
        </div>

        <div className="tab-container">
          {["all", "pending", "completed"].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab === "all" && "All Tasks"}
              {tab === "pending" && "Pending"}
              {tab === "completed" && "Completed"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p>Create a new task to get started.</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="task-list-shell">
            <table className="task-list-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Task</th>
                  <th className="hide-on-mobile">Priority</th>
                  <th className="hide-on-mobile">Created</th>
                  <th>Deadline</th>
                  <th className="task-actions-heading">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className={task.completed ? "is-completed" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskStatus(task)}
                        title="Mark as complete"
                      />
                    </td>
                    <td>
                      <Link to={`/task/${task.id}`} className="task-list-title">
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="task-list-description">{task.description}</p>
                      )}
                    </td>
                    <td className="hide-on-mobile">
                      <span className={`task-priority ${getPriorityClass(task.priority)}`}>
                        {task.priority || "Low"}
                      </span>
                    </td>
                    <td className="hide-on-mobile">{formatDate(task.created_at)}</td>
                    <td>{formatDate(task.deadline)}</td>
                    <td>
                      <div className="task-row-actions">
                        <button
                          className="btn-edit"
                          onClick={() => openEditModal(task)}
                          title="Edit task"
                        >
                          Edit
                        </button>
                          <button
                            className="btn-delete"
                            onClick={() => requestDeleteTask(task)}
                            title="Delete task"
                          >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={toggleTaskStatus}
                onDelete={requestDeleteTask}
                onEdit={openEditModal}
              />
            ))}
          </div>
        )}

        {tasks.length > 0 && (
          <div className="pagination-bar">
            <button
              className="btn-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss error">
            x
          </button>
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        task={editingTask}
      />
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete task?"
        message={`This will permanently delete "${taskToDelete?.title || "this task"}". This action cannot be undone.`}
        confirmLabel="Delete Task"
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
      />
    </main>
  );
};

export default Tasks;
