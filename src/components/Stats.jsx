const Stats = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="stats-container" style={{ padding: "20px", border: "1px solid #eee", borderRadius: "8px", backgroundColor: "#f9f9f9", marginBottom: "20px" }}>
      <h2>Task Analysis</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
        <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "1.2em", color: "#666" }}>Total Planned</div>
          <div style={{ fontSize: "2em", fontWeight: "bold" }}>{totalTasks}</div>
        </div>
        <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "1.2em", color: "#4caf50" }}>Completed</div>
          <div style={{ fontSize: "2em", fontWeight: "bold" }}>{completedTasks}</div>
        </div>
        <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "1.2em", color: "#f44336" }}>Pending</div>
          <div style={{ fontSize: "2em", fontWeight: "bold" }}>{pendingTasks}</div>
        </div>
        <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "1.2em", color: "#2196f3" }}>Completion Rate</div>
          <div style={{ fontSize: "2em", fontWeight: "bold" }}>{Math.round(completionRate)}%</div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
