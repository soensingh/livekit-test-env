import React from 'react';

const HomePage = ({ name, setName, onSelectRole }) => {
  return (
    <div className="page">
      <div className="card">
        <h1>Minimal Classroom</h1>
        <p className="muted">Pick a role and enter a display name.</p>
        <input
          className="input"
          placeholder="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="row">
          <button className="button" onClick={() => onSelectRole('teacher')}>
            Teacher
          </button>
          <button className="button" onClick={() => onSelectRole('student')}>
            Student
          </button>
          <button className="button secondary" onClick={() => onSelectRole('admin')}>
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
