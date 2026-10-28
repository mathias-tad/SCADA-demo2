import React, { useState } from 'react';
import { initialScadaUsers, ORIGINAL_ROLES, isActiveLast20Mins, isWaterRole } from './mockData';
import ScadaTopBar from './components/ScadaTopBar';
import ScadaDashboard from './components/ScadaDashboard';
import UserCard from './components/UserCard';
import UserModal from './components/UserModal';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('users'); // 'dashboard' | 'users'
  const [users, setUsers] = useState(initialScadaUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setIsNew(false);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setIsNew(true);
    setIsModalOpen(true);
  };

  const handleSave = (userData) => {
    if (isNew) {
      setUsers([userData, ...users]);
      triggerToast(`SUCCESS: Enlisted user ${userData.firstName} ${userData.lastName}.`);
    } else {
      setUsers(users.map(u => u.userId === userData.userId ? userData : u));
      triggerToast(`SUCCESS: Updated profile for ${userData.firstName} ${userData.lastName}.`);
    }
  };

  const handleDelete = (userId) => {
    const target = users.find(u => u.userId === userId);
    setUsers(users.filter(u => u.userId !== userId));
    triggerToast(`REMOVED: User ${target?.firstName || ''} ${target?.lastName || ''} deleted from SCADA.`);
  };

  const handleSendLink = (user) => {
    triggerToast(`LINK DISPATCHED: Magic authentication link transmitted to ${user.email}.`);
  };

  const handleResetPassword = (user) => {
    triggerToast(`PASSWORD RESET: Password reset token dispatched to ${user.email}.`);
  };

  const handleQuickTestAlert = (user) => {
    triggerToast(`TEST PING: Transmitted test alert ping to ${user.firstName} ${user.lastName} via SMS (${user.phoneNumber}) & Email!`);
  };

  // Filter logic — role select + free-text search only
  const filteredUsers = users.filter(u => {
    const query = search.toLowerCase();
    const queryMatch =
      `${u.firstName} ${u.lastName} ${u.organization} ${u.email} ${u.phoneNumber} ${u.selectedRole}`
        .toLowerCase()
        .includes(query);

    if (!queryMatch) return false;
    if (roleFilter !== 'all' && u.selectedRole !== roleFilter) return false;

    return true;
  });

  const onDutyCount = users.filter(u => isActiveLast20Mins(u.lastActivity)).length;
  const waterCount = users.filter(u => isWaterRole(u.selectedRole)).length;
  const techCount = users.filter(u => !isWaterRole(u.selectedRole)).length;



  return (
    <div className="enterprise-app-root">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="enterprise-toast-banner">
          <i className="fas fa-check-circle toast-icon-check"></i>
          <span>{toast}</span>
        </div>
      )}

      {/* Original SCADA Navigation Topbar */}
      <ScadaTopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser="Pete"
      />

      {/* Main View Router */}
      {activeTab === 'dashboard' ? (
        <main className="ent-main-content">
          <ScadaDashboard />
        </main>
      ) : (
        <>
          {/* Executive Stats Ribbon */}
          <section className="ent-stats-ribbon">
            <div className="ent-stats-container">
              <div className="stat-metric-card">
                <span className="metric-label">Total SCADA Users</span>
                <div className="metric-val-row">
                  <span className="metric-value">{users.length}</span>
                  <span className="metric-tag">Registered Accounts</span>
                </div>
              </div>

              <div className="stat-metric-card">
                <span className="metric-label">Active (Last 20 Mins)</span>
                <div className="metric-val-row">
                  <span className="metric-value metric-green">{onDutyCount}</span>
                  <span className="metric-tag">{Math.round((onDutyCount / users.length) * 100)}% Online</span>
                </div>
              </div>

              <div className="stat-metric-card">
                <span className="metric-label">Water Operations</span>
                <div className="metric-val-row">
                  <span className="metric-value metric-cyan">{waterCount}</span>
                  <span className="metric-tag">Operator & Control</span>
                </div>
              </div>

              <div className="stat-metric-card">
                <span className="metric-label">Tech & Governance</span>
                <div className="metric-val-row">
                  <span className="metric-value metric-indigo">{techCount}</span>
                  <span className="metric-tag">Admin, Audit & Monitor</span>
                </div>
              </div>
            </div>
          </section>

          {/* Search & Filtering Control Bar */}
          <section className="ent-controls-bar">
            <div className="ent-controls-container">
              {/* Search Box */}
              <div className="ent-search-field">
                <i className="fas fa-search search-symbol"></i>
                <input
                  type="text"
                  placeholder="Filter by user name, organization, phone, role..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="clear-btn" onClick={() => setSearch('')}>✕</button>
                )}
              </div>

              {/* Role Filter */}
              <div className="ent-role-dropdown-wrap">
                <label>Role:</label>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="ent-role-select"
                >
                  <option value="all">All Roles</option>
                  {ORIGINAL_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Add User Action */}
              <button className="ent-add-personnel-btn" onClick={handleAddNew}>
                <i className="fas fa-user-plus"></i>
                <span>Add User</span>
              </button>
            </div>
          </section>

          {/* Main Content Area */}
          <main className="ent-main-content">
            {/* Active Users in the last 20 minutes highlight */}
            <div className="active-users-banner" style={{ marginBottom: '20px' }}>
              <div className="active-banner-left">
                <span className="live-ping-dot"></span>
                <strong>Users Active in the last 20 Minutes:</strong>
                <div className="active-names-list">
                  {users.filter(u => isActiveLast20Mins(u.lastActivity)).map(u => (
                    <span key={u.userId} className="active-user-badge">
                      {u.firstName} {u.lastName}
                    </span>
                  ))}
                </div>
              </div>
              <span className="active-count-tag">{onDutyCount} Online Now</span>
            </div>

            {/* Responsive 4-Column Grid */}
            <div className="ent-operators-grid">
              {filteredUsers.map(user => (
                <UserCard
                  key={user.userId}
                  user={user}
                  onOpenDetail={handleOpenDetail}
                  onQuickTestAlert={handleQuickTestAlert}
                />
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="ent-empty-roster">
                <p>No user records match your query.</p>
                <button
                  className="reset-roster-btn"
                  onClick={() => {
                    setSearch('');
                    setRoleFilter('all');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </main>
        </>
      )}

      {/* Interactive Detail & Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSave={handleSave}
        onDelete={handleDelete}
        onSendLink={handleSendLink}
        onResetPassword={handleResetPassword}
        isNew={isNew}
      />
    </div>
  );
}
