import React, { useEffect, useRef } from 'react';

const ParticipantTile = ({ participant }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (participant.videoTrack && videoRef.current) {
      participant.videoTrack.attach(videoRef.current);
    }

    return () => {
      if (participant.videoTrack) {
        participant.videoTrack.detach();
      }
    };
  }, [participant.videoTrack]);

  useEffect(() => {
    if (participant.audioTrack && !participant.isLocal) {
      participant.audioTrack.attach(audioRef.current);
    } else if (participant.audioTrack && participant.isLocal) {
      participant.audioTrack.detach();
    }

    return () => {
      if (participant.audioTrack) {
        participant.audioTrack.detach();
      }
    };
  }, [participant.audioTrack, participant.isLocal]);

  return (
    <div className="tile">
      {participant.videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className="video"
        />
      ) : (
        <div className="video placeholder">Camera off</div>
      )}
      <audio ref={audioRef} autoPlay muted={participant.isLocal} />
      <div className="tile-name">
        {participant.name || 'Guest'} {participant.isLocal ? '(You)' : ''}
      </div>
      <div className="tile-status">
        <span>{participant.audioMuted ? 'Mic off' : 'Mic on'}</span>
        <span>{participant.videoMuted ? 'Cam off' : 'Cam on'}</span>
        <span>
          Ping: {typeof participant.pingMs === 'number' ? `${participant.pingMs} ms` : '--'}
        </span>
      </div>
    </div>
  );
};

export default ParticipantTile;
