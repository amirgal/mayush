import type { FC } from 'react';

const LineGuide: FC = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, rgba(0,0,0,0.05) 24px)',
      backgroundPosition: '0 1px'
    }}
  />
);

export default LineGuide;
