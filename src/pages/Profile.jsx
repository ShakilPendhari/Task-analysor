import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { getTasks } from "../service/taskService";
import Stats from "../components/Stats";

const formatMemberDate = (dateString) => {
  if (!dateString) return "Recently joined";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recently joined";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [statsTasks, setStatsTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const { data } = await getTasks(1, 1000);
        setStatsTasks(data || []);
      } catch (err) {
        console.error("Error fetching tasks for stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTasks();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const email = user?.email || "User";
  const displayName = email.split("@")[0];

  return (
    <main className="profile-container animate-fade-in-up">
      <section className="profile-card">
        <div className="profile-hero">
          <div className="profile-avatar" aria-hidden="true">
            {email[0]?.toUpperCase() || "U"}
          </div>
          <div className="profile-details">
            <p className="profile-kicker">Account</p>
            <h1>{displayName}</h1>
            <p>{email}</p>
            <span>Member since {formatMemberDate(user?.created_at)}</span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-danger" onClick={handleLogout}>
            Logout from Account
          </button>
        </div>
      </section>

      <section className="profile-stats-section">
        <div className="section-heading">
          <p className="profile-kicker">Overview</p>
          <h2>Your Productivity Stats</h2>
        </div>
        {loading ? (
          <div className="loading-small">Calculating stats...</div>
        ) : (
          <Stats tasks={statsTasks} />
        )}
      </section>
    </main>
  );
};

export default Profile;
