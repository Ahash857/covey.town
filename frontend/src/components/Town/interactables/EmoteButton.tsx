import React, { useEffect, useState } from 'react';
import {
  Button,
  Box,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  ModalBody,
  VStack,
} from '@chakra-ui/react';
import Image from 'next/image';
import useTownController from '../../../hooks/useTownController';

const EMOTE_COOLDOWN_MS = 5000;

const EMOTES = [
  { id: 'Calling-spritesheet', label: 'Calling', iconSrc: '/assets/emotes/Calling-static.png' },
  {
    id: 'CheckMark-spritesheet',
    label: 'Check Mark',
    iconSrc: '/assets/emotes/CheckMark-static.png',
  },
  {
    id: 'LaughingFace-spritesheet',
    label: 'Laughing',
    iconSrc: '/assets/emotes/LaughingFace-static.png',
  },
  { id: 'LightBulb-spritesheet', label: 'Idea', iconSrc: '/assets/emotes/LightBulb-static.png' },
  {
    id: 'MindBlown-spritesheet',
    label: 'Mind Blown',
    iconSrc: '/assets/emotes/MindBlown-static.png',
  },
  {
    id: 'PartyPopper-spritesheet',
    label: 'Party',
    iconSrc: '/assets/emotes/PartyPopper-static.png',
  },
  {
    id: 'ThinkingFace-spritesheet',
    label: 'Thinking',
    iconSrc: '/assets/emotes/ThinkingFace-static.png',
  },
  { id: 'ThumbsUp-spritesheet', label: 'Thumbs Up', iconSrc: '/assets/emotes/ThumbsUp-static.png' },
];

export default function EmoteButton(): JSX.Element {
  const coveyTownController = useTownController();

  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const onEmote = (data: { playerID: string; emoteID: string }) => {
      if (data.playerID !== coveyTownController.userID) return;

      setIsCoolingDown(true);
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        setIsCoolingDown(false);
        timeout = undefined;
      }, EMOTE_COOLDOWN_MS);
    };

    coveyTownController.addListener('emote', onEmote);
    return () => {
      coveyTownController.removeListener('emote', onEmote);
      if (timeout) clearTimeout(timeout);
    };
  }, [coveyTownController]);

  useEffect(() => {
    const onToggle = () => {
      if (!isCoolingDown) {
        setIsOpen(prev => !prev);
      }
    };

    coveyTownController.addListener('toggleEmoteMenu', onToggle);
    return () => {
      coveyTownController.removeListener('toggleEmoteMenu', onToggle);
    };
  }, [coveyTownController, isCoolingDown]);

  const handleSelectEmote = (emoteID: string) => {
    if (isCoolingDown) return;
    coveyTownController.emitEmote(emoteID);
    closeModal();
  };

  return (
    <>
      <button
        className='bubble-container bubble-emote'
        onClick={() => {
          if (!isCoolingDown) setIsOpen(true);
        }}
        style={{
          opacity: isCoolingDown ? 0.5 : 1,
          pointerEvents: isCoolingDown ? 'none' : 'auto',
          padding: 0,
          border: 'none',
          background: 'transparent',
          outline: 'none',
        }}>
        <Image
          src='/assets/emotes/emote-bubble.png'
          alt='Open emote menu'
          width={100}
          height={100}
          style={{ display: 'block' }}
        />
      </button>

      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent maxW='450px' minH='360px'>
          <ModalHeader>Select an Emote</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              display='grid'
              gridTemplateColumns='repeat(4, 1fr)'
              rowGap={16}
              columnGap={4}
              justifyItems='center'
              pt={6}
              pb={6}>
              {EMOTES.map(emote => (
                <Button
                  key={emote.id}
                  onClick={() => handleSelectEmote(emote.id)}
                  variant='ghost'
                  p={0}
                  isDisabled={isCoolingDown}>
                  <Box
                    w='100px'
                    h='100px'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    bg='gray.100'
                    border='2px solid'
                    borderColor='gray.300'
                    borderRadius='md'
                    _hover={{
                      bg: 'gray.200',
                      borderColor: 'gray.400',
                    }}>
                    <Image
                      src={emote.iconSrc}
                      alt={emote.id}
                      width={72}
                      height={72}
                      style={{ objectFit: 'contain', display: 'block' }}
                    />
                  </Box>
                </Button>
              ))}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
