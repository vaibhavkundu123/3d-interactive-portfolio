import React, { useState, useRef, useEffect } from 'react';

export const VirtualJoystick = ({ onMove }) => {
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const maxRadius = 45;

  const handleTouchStart = (e) => {
    setActive(true);
    updatePosition(e.touches[0]);
  };

  const handleTouchMove = (e) => {
    if (!active) return;
    updatePosition(e.touches[0]);
  };

  const handleTouchEnd = () => {
    setActive(false);
    setPos({ x: 0, y: 0 });
    onMove(0, 0);
  };

  const updatePosition = (touch) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const dist = Math.hypot(dx, dy);

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const x = Math.cos(angle) * clampedDist;
    const y = Math.sin(angle) * clampedDist;

    setPos({ x, y });
    onMove(x / maxRadius, y / maxRadius);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed',
        bottom: 85,
        left: 20,
        width: 110,
        height: 110,
        borderRadius: '50%',
        background: 'rgba(15, 23, 42, 0.65)',
        border: '2px solid rgba(0, 245, 255, 0.4)',
        boxShadow: '0 0 20px rgba(0, 245, 255, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        zIndex: 90,
        pointerEvents: 'auto'
      }}
    >
      {/* Knob */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #00f5ff 0%, #0284c7 100%)',
          boxShadow: '0 0 15px #00f5ff',
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: active ? 'none' : 'transform 0.15s ease-out'
        }}
      />
    </div>
  );
};
