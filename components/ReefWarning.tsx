import React from 'react';
import { ReefWarning as ReefWarningType } from '../types';

interface ReefWarningProps {
  warning: ReefWarningType;
}

const ReefWarning: React.FC<ReefWarningProps> = ({ warning }) => {
  return (
    <div
      className="absolute rounded-md reef-warning"
      style={{
        left: warning.pos.x,
        top: warning.pos.y,
        width: warning.size,
        height: warning.size,
        zIndex: 5,
      }}
    />
  );
};

export default ReefWarning;