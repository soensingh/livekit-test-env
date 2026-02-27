import React from 'react';
import { Video, GraduationCap, ShieldCheck } from 'lucide-react';

const HomePage = ({ name, setName, onSelectRole }) => {
  return (
    <div className="page">
      <div className="card home-card">

        <div className="home-hero">
          <div className="home-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M21 7l-7 5-7-5V5l7 5 7-5v2z" fill="#00BCD4" />
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" stroke="#00BCD4" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <h1 className="home-title">Live Classroom</h1>
          <p className="home-subtitle">
            Real-time learning, together. Enter your name and pick a role to get started.
          </p>
        </div>

        <div className="home-input-wrap">
          <input
            className="input home-input"
            placeholder="Your display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="home-roles">
          <button
            className="role-card"
            onClick={() => onSelectRole('teacher')}
            disabled={!name.trim()}
          >
            <div className="role-icon role-icon--teacher">
              <Video size={22} />
            </div>
            <span className="role-label">Teacher</span>
            <span className="role-desc">Start &amp; host a room</span>
          </button>

          <button
            className="role-card"
            onClick={() => onSelectRole('student')}
            disabled={!name.trim()}
          >
            <div className="role-icon role-icon--student">
              <GraduationCap size={22} />
            </div>
            <span className="role-label">Student</span>
            <span className="role-desc">Join an existing room</span>
          </button>

          <button
            className="role-card role-card--secondary"
            onClick={() => onSelectRole('admin')}
          >
            <div className="role-icon role-icon--admin">
              <ShieldCheck size={22} />
            </div>
            <span className="role-label">Admin</span>
            <span className="role-desc">View all active rooms</span>
          </button>
        </div>

        {!name.trim() && (
          <p className="home-hint">Enter a display name to enable Teacher &amp; Student</p>
        )}

      </div>
    </div>
  );
};

export default HomePage;
