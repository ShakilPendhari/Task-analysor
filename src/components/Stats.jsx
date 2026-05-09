const Stats = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const StatCard = ({ label, value, tone, marker }) => (
    <div className="stat-card">
      <div className={`stat-icon stat-icon-${tone}`} aria-hidden="true">
        {marker}
      </div>
      <p className="stat-label">{label}</p>
      <p className={`stat-value stat-value-${tone}`}>{value}</p>
    </div>
  );

  return (
    <div className="stats-container">
      <StatCard marker="T" label="Total Planned" value={totalTasks} tone="primary" />
      <StatCard marker="C" label="Completed" value={completedTasks} tone="success" />
      <StatCard marker="P" label="Pending" value={pendingTasks} tone="warning" />
      <StatCard marker="%" label="Completion Rate" value={`${completionRate}%`} tone="primary" />
    </div>
  );
};

export default Stats;
