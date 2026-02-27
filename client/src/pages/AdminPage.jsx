import React from 'react';
import { RefreshCw, ArrowLeft, Users, Radio, LayoutGrid } from 'lucide-react';

const AdminPage = ({ rooms, onRefresh, onBack }) => {
  return (
    <div className="page">
      <div className="card wide admin-card">

        {/* Header */}
        <div className="admin-header">
          <div className="admin-header__left">
            <div className="admin-logo">
              <LayoutGrid size={20} />
            </div>
            <div>
              <h2 className="admin-title">Admin Panel</h2>
              <p className="muted">Active rooms and participant counts</p>
            </div>
          </div>
          <div className="admin-header__actions">
            <button className="button secondary" onClick={onBack}>
              <ArrowLeft size={15} />
              Back
            </button>
            <button className="button" onClick={onRefresh}>
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="admin-stats">
          <div className="admin-stat">
            <span className="admin-stat__value">{rooms.length}</span>
            <span className="admin-stat__label">Active Rooms</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat__value">
              {rooms.reduce((acc, r) => acc + (r.studentCount || 0), 0)}
            </span>
            <span className="admin-stat__label">Total Students</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat__value">
              {rooms.filter((r) => r.state === 'live').length}
            </span>
            <span className="admin-stat__label">Live Now</span>
          </div>
        </div>

        {/* Room list */}
        <div className="admin-list">
          {rooms.length === 0 ? (
            <div className="admin-empty">
              <LayoutGrid size={36} strokeWidth={1.5} />
              <p>No active rooms found.</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div key={room.id} className="admin-item">
                <div className="admin-item__left">
                  <div className="admin-room-icon">
                    <Radio size={16} />
                  </div>
                  <div>
                    <span className="admin-room-id">{room.id}</span>
                    <div className="muted admin-room-teacher">
                      {room.teacherName}
                    </div>
                  </div>
                </div>
                <div className="admin-meta">
                  <span className={`pill admin-state-pill${room.state === 'live' ? ' pill--live' : ''}`}>
                    {room.state === 'live' && <span className="live-dot" />}
                    {room.state}
                  </span>
                  <span className="pill">
                    <Users size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    {room.studentCount} students
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminPage;
