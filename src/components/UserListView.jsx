import React from 'react';
import { isWaterRole, isActiveLast20Mins } from '../mockData';

export default function UserListView({
  users,
  onOpenDetail,
  onSendLink,
  onResetPassword,
  onDelete,
  onQuickTestAlert
}) {
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Administrator': return 'role-badge-admin';
      case 'Operator':      return 'role-badge-operator';
      case 'Control':       return 'role-badge-control';
      case 'Monitor':       return 'role-badge-monitor';
      case 'Auditor':       return 'role-badge-auditor';
      default:              return 'role-badge-none';
    }
  };

  const renderChannelPill = (screen, text, email) => {
    return (
      <div className="ent-channel-pills">
        <span className={`channel-pill ${screen ? 'pill-active' : 'pill-inactive'}`} title={screen ? "Screen: Active" : "Screen: Off"}>
          <i className="fas fa-desktop"></i> Screen
        </span>
        <span className={`channel-pill ${text ? 'pill-active' : 'pill-inactive'}`} title={text ? "SMS: Active" : "SMS: Off"}>
          <i className="fas fa-sms"></i> SMS
        </span>
        <span className={`channel-pill ${email ? 'pill-active' : 'pill-inactive'}`} title={email ? "Email: Active" : "Email: Off"}>
          <i className="fas fa-envelope"></i> Email
        </span>
      </div>
    );
  };

  return (
    <div className="ent-table-wrapper">
      <table className="ent-users-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>Status</th>
            <th>Personnel / Name</th>
            <th>Organization</th>
            <th>Contact Details</th>
            <th>Role</th>
            <th>Smart Node Msgs</th>
            <th>EEMACS Msgs</th>
            <th>Alarm Msgs</th>
            <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const activeNow = isActiveLast20Mins(user.lastActivity);
            const roleClass = getRoleBadgeClass(user.selectedRole);

            return (
              <tr key={user.userId} className="ent-user-row">
                {/* Status Column */}
                <td className="ent-td-status" style={{ textAlign: 'center' }}>
                  <span
                    className={`ent-status-circle ${activeNow ? 'circle-online' : 'circle-offline'}`}
                    title={activeNow ? "Active within last 20 minutes" : "Offline / Standby"}
                  ></span>
                </td>

                {/* Name / Avatar */}
                <td className="ent-td-personnel">
                  <div className="ent-personnel-cell" onClick={() => onOpenDetail(user)}>
                    <img
                      src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="ent-table-avatar"
                    />
                    <div className="ent-personnel-meta">
                      <strong className="ent-row-fullname">{user.firstName} {user.lastName}</strong>
                      <span className="ent-row-uid">{user.userId.slice(0, 8)}</span>
                    </div>
                  </div>
                </td>

                {/* Organization */}
                <td className="ent-td-org">
                  <span className="ent-org-tag">{user.organization || 'Extreme SCADA'}</span>
                </td>

                {/* Contact (Phone & Email) */}
                <td className="ent-td-contact">
                  <div className="ent-contact-stack">
                    <a href={`tel:${user.phoneNumber}`} className="ent-contact-phone" onClick={(e) => e.stopPropagation()}>
                      <i className="fas fa-phone-alt"></i> {user.phoneNumber}
                    </a>
                    <a href={`mailto:${user.email}`} className="ent-contact-email" onClick={(e) => e.stopPropagation()}>
                      <i className="fas fa-envelope"></i> {user.email}
                    </a>
                  </div>
                </td>

                {/* Role */}
                <td className="ent-td-role">
                  <span className={`ent-role-badge ${roleClass}`}>
                    {user.selectedRole}
                  </span>
                </td>

                {/* Smart Node Messages */}
                <td className="ent-td-channels">
                  {renderChannelPill(user.nodeMessagesScreen, user.nodeMessagesText, user.nodeMessagesEmail)}
                </td>

                {/* EEMACS Messages */}
                <td className="ent-td-channels">
                  {renderChannelPill(user.eemacsMessagesScreen, user.eemacsMessagesText, user.eemacsMessagesEmail)}
                </td>

                {/* Alarm Messages */}
                <td className="ent-td-channels">
                  {renderChannelPill(user.alarmMessagesScreen, user.alarmMessagesText, user.alarmMessagesEmail)}
                </td>

                {/* Action Buttons */}
                <td className="ent-td-actions">
                  <div className="ent-action-btn-group">
                    <button
                      type="button"
                      className="ent-tbl-btn ent-tbl-btn--edit"
                      onClick={() => onOpenDetail(user)}
                      title="Edit User Configuration"
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>

                    <button
                      type="button"
                      className="ent-tbl-btn ent-tbl-btn--send"
                      onClick={() => onSendLink(user)}
                      title="Send Magic Login Link"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>

                    <button
                      type="button"
                      className="ent-tbl-btn ent-tbl-btn--reset"
                      onClick={() => onResetPassword(user)}
                      title="Reset Password"
                    >
                      <i className="fas fa-key"></i>
                    </button>

                    <button
                      type="button"
                      className="ent-tbl-btn ent-tbl-btn--delete"
                      onClick={() => onDelete(user.userId)}
                      title="Delete User"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
