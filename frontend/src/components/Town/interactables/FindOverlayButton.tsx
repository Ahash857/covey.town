import React from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image, { StaticImageData } from 'next/image';
import findPng from '../../../../public/assets/buttons/find.png';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import {
  Button,
  Box,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  VStack,
} from '@chakra-ui/react';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

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
              <Button>Basement Dining Table 1</Button>
              <Button>TicTacToe 1</Button>
              <Button>TicTacToe 2</Button>
              <Button>Connect Four 1</Button>
              <Button>Connect Four 2</Button>
              <Button>Foyer Table 1</Button>
              <Button>Foyer Table 2</Button>
              <Button>Foyer Table 3</Button>
              <Button>Foyer Table 4</Button>
              <Button>Foyer Table 5</Button>
              <Button>Foyer Table 6</Button>
              <Button>Foyer Table 7</Button>
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
