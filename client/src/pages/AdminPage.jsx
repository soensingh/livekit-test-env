import React from 'react';

const AdminPage = ({ rooms, onRefresh, onBack }) => {
  return (
    <div className="page">
      <div className="card wide">
        <div className="row space">
          <div>
            <h2>Admin Panel</h2>
            <p className="muted">Active rooms and participant counts.</p>
          </div>
          <div className="row">
            <button className="button secondary" onClick={onBack}>
              Back
            </button>
            <button className="button" onClick={onRefresh}>
              Refresh
            </button>
          </div>
        </div>

        <div className="admin-list">
          {rooms.length === 0 ? (
            <p className="muted">No rooms found.</p>
          ) : (
            rooms.map((room) => (
              <div key={room.id} className="admin-item">
                <div>
                  <strong>{room.id}</strong>
                  <div className="muted">Teacher: {room.teacherName}</div>
                </div>
                <div className="admin-meta">
                  <span className="pill">{room.state}</span>
                  <span className="pill">Students: {room.studentCount}</span>
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
