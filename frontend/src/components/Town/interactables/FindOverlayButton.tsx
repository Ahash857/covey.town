import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image, { StaticImageData } from 'next/image';
import findPng from '../../../../public/assets/buttons/find.png';
import {
  Button,
  Box,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
} from '@chakra-ui/react';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
const DESTINATIONS: Record<string, { x: number; y: number }> = {
  'Basement Dining Table 1': { x: 3005, y: 1111 },
  'TicTacToe 1': { x: 3337, y: 1257 },
  'TicTacToe 2': { x: 3553, y: 1056 },
  'Connect Four 1': { x: 3005, y: 810 },
  'Connect Four 2': { x: 3009, y: 968 },
  'Foyer Table 1': { x: 273, y: 1102 },
  'Foyer Table 2': { x: 480, y: 1102 },
  'Foyer Table 3': { x: 700, y: 1102 },
  'Foyer Table 4': { x: 938, y: 1102 },
  'Foyer Table 5': { x: 1174, y: 1102 },
  'Foyer Table 6': { x: 1431, y: 1102 },
  'Foyer Table 7': { x: 1664, y: 1102 },
};

export default function FindOverlayWithPanel({
  btnSize = 128,
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

  const closeModal = () => {
    setOpen(false);
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  //new code: send event to game scene
  const handleDestinationClick = (label: string) => {
    const coords = DESTINATIONS[label];
    if (coords) {
      const event = new CustomEvent('pet-guide-to', { detail: coords });
      window.dispatchEvent(event);
      closeModal();
    }
  };

  if (!mounted) return null; // render only on the client
  return createPortal(
    <>
      {/* Fixed HUD button */}
      <button className="bubble-container bubble-find" onClick={() => setOpen(true)}>
        <Image
          src={findPng}
          alt='Find'
          width={btnSize}
          height={btnSize}
          sizes={`${btnSize}px`}
          style={{ imageRendering: 'pixelated', display: 'block' }}
        />
      </button>

      {/* Fixed Modal Panel */}
      <Modal isOpen={open} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader> Find Destination </ModalHeader>
          <Box maxH='300px' overflowY='auto'>
            <VStack align='stretch' spacing={2}>
              {/*new code: loop through destinations to make buttons*/}
              {Object.keys(DESTINATIONS).map(label => (
                <Button key={label} onClick={() => handleDestinationClick(label)}>
                  {label}
                </Button>
              ))}
            </VStack>
          </Box>
          <ModalCloseButton />
          <ModalFooter>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>,
    document.body,
  );
}
