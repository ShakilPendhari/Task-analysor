import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTasks } from "../service/taskService.js";
import Stats from "../components/Stats.jsx";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const { data } = await getTasks(1, 1000);
        setTasks(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const upcomingTasks = tasks
    .filter((task) => !task.completed)
    .slice()
    .sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0))
    .slice(0, 3);

  return (
    <main className="dashboard-container">
      <div className="dashboard-content">
        <section className="dashboard-hero">
          <div>
            <p className="profile-kicker">Dashboard</p>
            <h1>Your productivity overview</h1>
            <p>Track progress at a glance, then jump into the dedicated tasks page when it is time to manage the list.</p>
          </div>
          <Link to="/tasks" className="btn-primary dashboard-hero-action">
            Open Tasks
          </Link>
        </section>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading overview...</p>
          </div>
        ) : (
          <>
            <Stats tasks={tasks} />

            <section className="overview-panel">
              <div className="task-panel-header">
                <div>
                  <p className="profile-kicker">Next Up</p>
                  <h2>Upcoming Tasks</h2>
                </div>
                <Link to="/tasks" className="nav-link">View all</Link>
              </div>

              {upcomingTasks.length === 0 ? (
                <div className="empty-state">
                  <h3>No pending tasks</h3>
                  <p>You are all caught up.</p>
                </div>
              ) : (
                <div className="overview-task-list">
                  {upcomingTasks.map((task) => (
                    <Link to={`/task/${task.id}`} className="overview-task-row" key={task.id}>
                      <span>{task.title}</span>
                      <strong>{task.priority || "Low"}</strong>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss error">
              x
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
