import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image, { StaticImageData } from 'next/image';
import findPng from '../../../../public/assets/buttons/find.png';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
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

//new code: list of destinations with real coordinates
const DESTINATIONS: Record<string, { x: number; y: number }> = {
  'Basement Dining Table 1': { x: 3005, y: 1111 },
  'TicTacToe 1': { x: 3259, y: 1216 },
  'TicTacToe 2': { x: 3468, y: 1126 },
  'Connect Four 1': { x: 3357, y: 1245 },
  'Connect Four 2': { x: 3115, y: 986 },
  'Foyer Table 1': { x: 800, y: 200 },
  'Foyer Table 2': { x: 850, y: 200 },
  'Foyer Table 3': { x: 900, y: 200 },
  'Foyer Table 4': { x: 950, y: 200 },
  'Foyer Table 5': { x: 1000, y: 200 },
  'Foyer Table 6': { x: 1050, y: 200 },
  'Foyer Table 7': { x: 1100, y: 200 },
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    findButton: {
      'position': 'fixed',
      'zIndex': 900,
      'width': 128,
      'height': 128,
      'transform': 'translateY(-50%)',
      'border': 'none',
      'pointerEvents': 'auto',
      'cursor': 'pointer',
      'right': '270px',
      'top': '18%',
      'transition': 'transform 0.15s ease, opacity 0.15s ease',
      '&:hover': {
        transform: 'translateY(-50%) scale(0.95)',
      },
      [theme.breakpoints.down('sm')]: {
        right: '70px',
      },
    },
  }),
);

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
  const classes = useStyles();

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
      <button className={classes.findButton} onClick={() => setOpen(true)}>
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