import React from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image, { StaticImageData } from 'next/image';
import findPng from '../../../../public/assets/buttons/find.png';
import panelPng from '../../../../public/assets/buttons/findbackgroundPanel.png';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export default function FindOverlayWithPanel({
  btnSize = 128,
  panelMaxWidth = 700, // max width the panel can scale to
  panelPadding = 0, // optional inner padding around the image
  panelSrc = panelPng, // allow override, default to local import
}: {
  corner?: Corner;
  offset?: number;
  btnSize?: number;
  panelMaxWidth?: number;
  panelPadding?: number;
  panelSrc?: StaticImageData | string;
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!mounted) return null; // render only on the client
  return createPortal(
    <>
      {/* Fixed HUD button */}
      <button
        aria-label='Open Find Panel'
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          zIndex: 2147483647,
          width: btnSize,
          height: btnSize,
          border: 'none',
          padding: 0,
          background: 'transparent',
          cursor: 'pointer',
          right: 270,
          top: 100,
        }}>
        <Image
          src={findPng}
          alt='Find'
          width={btnSize}
          height={btnSize}
          priority
          sizes={`${btnSize}px`}
          style={{ imageRendering: 'pixelated', display: 'block' }}
        />
      </button>

      {/* Centered modal panel */}
      {open && (
        <div
          role='dialog'
          aria-modal='true'
          onClick={() => setOpen(false)} // click backdrop closes
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2147483646,
            background: 'rgba(0,0,0,0.5)', // dim backdrop
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {/* Stop propagation so clicks on the panel don't close it */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'min(90vw, ' + panelMaxWidth + 'px)',
              // Keep original aspect ratio if we have a StaticImageData import
              // Fallback to a safe ratio if a string path was provided
              aspectRatio:
                typeof panelSrc === 'object'
                  ? `${(panelSrc as StaticImageData).width}/${(panelSrc as StaticImageData).height}`
                  : '16/9',
              padding: panelPadding,
            }}>
            <Image
              src={panelSrc}
              alt='Find panel'
              priority
              sizes={`(max-width: ${panelMaxWidth}px) 90vw, ${panelMaxWidth}px`}
              style={{
                imageRendering: 'pixelated',
                objectFit: 'contain', // show whole panel art centered
                display: 'block',
              }}
            />
            {/* Optional close X in the corner */}
            <button
              aria-label='Close'
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '4px 8px',
                cursor: 'pointer',
              }}>
              ✕
            </button>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
