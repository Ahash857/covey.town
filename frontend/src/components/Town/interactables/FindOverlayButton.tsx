import React from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import findPng from '../../../../public/assets/buttons/find.png';
const handleClick = () => {
  // Implement the find action here.
};

export default function FindOverlayButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // render only on the client

  const findBtn = (
    <button
      aria-label='Find'
      onClick={handleClick}
      style={{
        position: 'fixed',
        right: 250,
        top: 16,
        width: 100,
        height: 40,
        zIndex: 2147483647,
        padding: 0,
        borderRadius: 12,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
      }}>
      <Image
        src={findPng}
        alt=''
        width={100}
        height={40}
        priority
        sizes='56px'
        style={{ imageRendering: 'pixelated', display: 'block' }}
      />
    </button>
  );

  // Used a portal to avoid any stacking
  return createPortal(findBtn, document.body);
}
