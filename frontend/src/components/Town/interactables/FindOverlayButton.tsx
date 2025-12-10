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
