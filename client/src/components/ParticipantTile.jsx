import React, { useEffect, useRef } from 'react';

const ParticipantTile = ({ participant, currentRole, onKick, mirrorLocalVideo }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const activeVideoTrack = participant.screenTrack || participant.videoTrack;

  const pingMs = typeof participant.pingMs === 'number' ? participant.pingMs : null;
  const lossPercent = typeof participant.lossPercent === 'number' ? participant.lossPercent : null;

  const getSignalLevel = () => {
    if (pingMs === null) return 0;
    if (lossPercent !== null && lossPercent >= 8) return 1;
    if (pingMs > 250) return 1;
    if (pingMs > 160) return 2;
    if (pingMs > 90) return 3;
    return 4;
  };

  const signalLevel = getSignalLevel();

  useEffect(() => {
    if (activeVideoTrack && videoRef.current) {
      activeVideoTrack.attach(videoRef.current);
    }

    return () => {
      if (activeVideoTrack) {
        activeVideoTrack.detach();
      }
    };
  }, [activeVideoTrack]);

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
      <div className="tile-top">
        <div className="tile-name">
          {participant.name || 'Guest'} {participant.isLocal ? '(You)' : ''}
        </div>
        <div className="signal-badge" title="Network signal">
          <span className={`signal-bar ${signalLevel >= 1 ? 'active' : ''}`} />
          <span className={`signal-bar ${signalLevel >= 2 ? 'active' : ''}`} />
          <span className={`signal-bar ${signalLevel >= 3 ? 'active' : ''}`} />
          <span className={`signal-bar ${signalLevel >= 4 ? 'active' : ''}`} />
        </div>
      </div>
      {activeVideoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className={`video ${participant.isLocal && mirrorLocalVideo && !participant.isScreenSharing ? 'mirrored' : ''}`}
        />
      ) : (
        <div className="video placeholder">{participant.isScreenSharing ? 'Screen share off' : 'Camera off'}</div>
      )}
      <audio ref={audioRef} autoPlay muted={participant.isLocal} />

      <div className="tile-status-row">
        <span>{participant.audioMuted ? 'Mic off' : 'Mic on'}</span>
        <span>{participant.videoMuted ? 'Cam off' : 'Cam on'}</span>
        <span>{participant.isScreenSharing ? 'Sharing screen' : 'No screen'}</span>
      </div>

      <div className="tile-network">
        <span>IP: {participant.ip || 'unknown'}</span>
        <span>Ping: {pingMs !== null ? `${pingMs} ms` : '--'}</span>
        <span>
          Loss: {lossPercent !== null ? `${lossPercent}%` : '--'}
        </span>
        <span>
          Packets: {typeof participant.totalPackets === 'number' ? participant.totalPackets : '--'}
        </span>
        <span>
          Lost: {typeof participant.lostPackets === 'number' ? participant.lostPackets : '--'}
        </span>
      </div>

      {currentRole === 'teacher' && !participant.isLocal && participant.role !== 'teacher' && (
        <div className="tile-actions">
          <button className="button danger" onClick={() => onKick?.(participant.id)}>
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default ParticipantTile;
