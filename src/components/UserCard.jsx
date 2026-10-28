import React from 'react';
import { isWaterRole, isActiveLast20Mins } from '../mockData';

export default function UserCard({ user, onOpenDetail, onQuickTestAlert }) {
  const isWater = isWaterRole(user.selectedRole);
  const activeNow = isActiveLast20Mins(user.lastActivity);

  // Active notification summary
  const activeChannels = [];
  if (user.nodeMessagesText || user.eemacsMessagesText || user.alarmMessagesText) activeChannels.push('SMS');
  if (user.nodeMessagesEmail || user.eemacsMessagesEmail || user.alarmMessagesEmail) activeChannels.push('Email');
  if (user.nodeMessagesScreen || user.eemacsMessagesScreen || user.alarmMessagesScreen) activeChannels.push('Screen');

  return (
    <div
      className="enterprise-operator-card"
      onClick={() => onOpenDetail(user)}
      role="button"
      tabIndex={0}
      title="Click to view complete user telemetry & routing"
    >
      {/* Top Metadata Row: ID, Duty Status & Telemetry SLA */}
      <div className="ent-card-top-row">
        <span className="ent-operator-code">{user.userId.slice(0, 8)}...</span>
        
        <div className="ent-status-cluster">
          {activeNow ? (
            <span className="ent-badge-duty duty-online">
              <span className="duty-dot">●</span>
              <span>ACTIVE (20m)</span>
            </span>
          ) : (
            <span className="ent-badge-duty duty-standby">
              <span className="duty-dot">○</span>
              <span>STANDBY</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Identity Row: Avatar, Name, Organization & Role */}
      <div className="ent-identity-block">
        <div className="ent-avatar-wrap">
          <img
            src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"}
            alt={`${user.firstName} ${user.lastName}`}
            className="ent-avatar-img"
          />
        </div>

        <div className="ent-identity-info">
          <h3 className="ent-operator-name">
            {user.firstName} {user.lastName}
          </h3>
          <p className="ent-position-title">{user.organization}</p>
          
          <div className="ent-pills-row">
            <span className="ent-role-pill">
              {user.selectedRole}
            </span>

            <span className={`ent-dept-pill ${isWater ? 'dept-water' : 'dept-tech'}`}>
              {isWater ? 'Water Operations' : 'Tech & Leadership'}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="ent-specs-box">
        <div className="ent-spec-item">
          <span className="spec-label">Mobile</span>
          <span className="spec-value">{user.phoneNumber || 'None'}</span>
        </div>
        <div className="ent-spec-item">
          <span className="spec-label">Email</span>
          <span className="spec-value" title={user.email}>{user.email}</span>
        </div>
      </div>

      {/* Real-Time Notification Routing Matrix Bar */}
      <div className="ent-channels-bar">
        <span className="channels-label">Alert Relays:</span>
        <div className="channels-indicators">
          <span className={`relay-pill ${user.alarmMessagesText || user.nodeMessagesText ? 'active' : 'inactive'}`}>
            SMS
          </span>
          <span className={`relay-pill ${user.alarmMessagesEmail || user.nodeMessagesEmail ? 'active' : 'inactive'}`}>
            Email
          </span>
          <span className={`relay-pill ${user.alarmMessagesScreen || user.nodeMessagesScreen ? 'active' : 'inactive'}`}>
            Screen
          </span>
        </div>
      </div>

      {/* Interactive Footer Toolbar */}
      <div className="ent-footer-toolbar">
        <span className="ent-contact-phone">
          📞 {user.phoneNumber}
        </span>

        <button
          type="button"
          className="ent-quick-test-btn"
          onClick={(e) => {
            e.stopPropagation();
            onQuickTestAlert(user);
          }}
          title="Send instant test alert to this user"
        >
          ⚡ Ping
        </button>

        <span className="ent-manage-link">
          Manage →
        </span>
      </div>
    </div>
  );
}
