const Stats = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const StatCard = ({ label, value, icon, color }) => (
    <div className="stat-card">
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={{ color }}>
        {typeof value === 'string' ? value : value}
      </p>
    </div>
  );

  return (
    <div className="stats-container">
      <StatCard 
        icon="📋" 
        label="Total Planned" 
        value={totalTasks}
        color="var(--primary)"
      />
      <StatCard 
        icon="✅" 
        label="Completed" 
        value={completedTasks}
        color="var(--secondary)"
      />
      <StatCard 
        icon="⏳" 
        label="Pending" 
        value={pendingTasks}
        color="#f59e0b"
      />
      <StatCard 
        icon="📊" 
        label="Completion Rate" 
        value={`${Math.round(completionRate)}%`}
        color="var(--primary)"
      />
    </div>
  );
};

export default Stats;
