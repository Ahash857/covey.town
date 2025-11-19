import React from 'react';
import Phaser from 'phaser';
import { useEffect } from 'react';
import useTownController from '../../hooks/useTownController';
import SocialSidebar from '../SocialSidebar/SocialSidebar';
import NewConversationModal from './interactables/NewCoversationModal';
import TownGameScene from './TownGameScene';
import GameAreaWrapper from './interactables/GamesArea';
import useChatContext from '../VideoCall/VideoFrontend/hooks/useChatContext/useChatContext';
import ChatWindow from '../VideoCall/VideoFrontend/components/ChatWindow/ChatWindow';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import FindOverlayButton from './interactables/FindOverlayButton';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chatWindowContainer: {
      'pointerEvents': 'auto',
      'background': '#FFFFFF',
      'zIndex': 1000,
      'display': 'flex',
      'flexDirection': 'column',
      'borderLeft': '1px solid #E4E7E9',
      [theme.breakpoints.down('sm')]: {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 100,
      },
      'position': 'fixed',
      'bottom': 0,
      'left': 0,
      'top': 0,
      'max-width': '250px',
    },
    hide: {
      display: 'none',
    },
    emoteBubble: {
      position: 'fixed',
      top: '10%',
      transform: 'translateY(-50%)',
      zIndex: 900,
      cursor: 'pointer',
      pointerEvents: 'auto',
      right: '270px',
      transition: 'transform 0.15s ease, opacity 0.15s ease',
      '&:hover': {
        transform: 'translateY(-50%) scale(0.95)',
      },
      [theme.breakpoints.down('sm')]: {
        right: '70px',
      },
    },
    emoteImage: {
      width: 100,
      height: 100,
    },
  }),
);

export default function TownMap(): JSX.Element {
  const coveyTownController = useTownController();
  const { isChatWindowOpen } = useChatContext();
  const classes = useStyles();

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      backgroundColor: '#000000',
      parent: 'map-container',
      render: { pixelArt: true, powerPreference: 'high-performance' },
      scale: {
        expandParent: false,
        mode: Phaser.Scale.ScaleModes.WIDTH_CONTROLS_HEIGHT,
        autoRound: true,
      },
      width: 800,
      height: 600,
      fps: { target: 30 },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }, // Top down game, so no gravity
        },
      },
    };

    const game = new Phaser.Game(config);
    const newGameScene = new TownGameScene(coveyTownController);
    game.scene.add('coveyBoard', newGameScene, true);
    const pauseListener = newGameScene.pause.bind(newGameScene);
    const unPauseListener = newGameScene.resume.bind(newGameScene);
    coveyTownController.addListener('pause', pauseListener);
    coveyTownController.addListener('unPause', unPauseListener);
    return () => {
      coveyTownController.removeListener('pause', pauseListener);
      coveyTownController.removeListener('unPause', unPauseListener);
      game.destroy(true);
    };
  }, [coveyTownController]);
  const [isCoolingDown, setIsCoolingDown] = React.useState(false);
  const handleEmoteClick = () => {
    if (isCoolingDown) return;

    coveyTownController.toggleEmoteMenu();

    setIsCoolingDown(true);
    setTimeout(() => setIsCoolingDown(false), 5000);
  };
  return (
    <div id='app-container'>
      <NewConversationModal />
      <GameAreaWrapper />
      <aside className={clsx(classes.chatWindowContainer, { [classes.hide]: !isChatWindowOpen })}>
        <ChatWindow />
      </aside>

      <div id='map-container' />
     <div
      className={classes.emoteBubble}
      onClick={handleEmoteClick}
      style={{ opacity: isCoolingDown ? 0.5 : 1, pointerEvents: isCoolingDown ? 'none' : 'auto' }}
    >
        <img
          src='/assets/emotes/emote-bubble.png' 
          alt='Open emote menu'
          className={classes.emoteImage}
        />
      </div>
      <div id='social-container'>
        <SocialSidebar />
      </div>
      <div id='petFindButton'>
        <FindOverlayButton />
      </div>
    </div>
  );
}
