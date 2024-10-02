'use client';

import { createContext, ReactNode, useEffect, useState } from 'react';

type HomeContextData = {
  playing: boolean;
  currentMusic: string | null;
  progress: number; // Em segundos
  configPlayPause: () => void;
  playMusic: (url: string) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (value: number) => void; // Função para ajuste de volume
  setBalance: (value: number) => void; // Função para ajuste de balanceamento estéreo
};

export const HomeContext = createContext({} as HomeContextData);

type ProviderProps = {
  children: ReactNode;
};

const HomeContextProvider = ({ children }: ProviderProps) => {
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1); // Volume (1 = 100%)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [pannerNode, setPannerNode] = useState<StereoPannerNode | null>(null);
  const [balance, setBalance] = useState(0); // Balanceamento estéreo (-1 = esquerda, 1 = direita)

  useEffect(() => {
    if (currentMusic) {
      const newAudio = new Audio(currentMusic);
      newAudio.volume = volume; // Ajusta o volume inicial
      const newAudioContext = new AudioContext();
      const newPannerNode = newAudioContext.createStereoPanner();

      // Conectar o áudio ao panner
      const source = newAudioContext.createMediaElementSource(newAudio);
      source.connect(newPannerNode).connect(newAudioContext.destination);

      // Armazenar o contexto e o panner
      setAudioContext(newAudioContext);
      setPannerNode(newPannerNode);
      setAudio(newAudio);
      newAudio.play();
      setPlaying(true);

      newAudio.ontimeupdate = () => {
        setProgress(newAudio.currentTime);
      };

      newAudio.onended = () => {
        setPlaying(false);
        setProgress(0);
      };

      return () => {
        newAudio.pause();
        newAudioContext.close(); // Fechar o contexto de áudio
      };
    }
  }, [currentMusic]);

  useEffect(() => {
    if (pannerNode) {
      pannerNode.pan.value = balance; // Atualiza o balanceamento estéreo
    }
  }, [balance, pannerNode]);

  const configPlayPause = () => {
    if (playing) {
      pause();
    } else {
      play();
    }
    setPlaying(!playing);
  };

  const play = () => {
    if (audio) {
      audio.play();
    }
  };

  const pause = () => {
    if (audio) {
      audio.pause();
    }
  };

  const playMusic = (url: string) => {
    if (audio) {
      audio.pause();
    }
    setCurrentMusic(url);
  };

  const seek = (time: number) => {
    if (audio) {
      audio.currentTime = time;
      setProgress(time);
    }
  };

  const setVolumeHandler = (value: number) => {
    if (audio) {
      audio.volume = value; // Ajusta o volume do áudio
    }
    setVolume(value); // Ajusta o estado do volume
  };

  const setBalanceHandler = (value: number) => {
    if (pannerNode) {
      pannerNode.pan.value = value; // Define o valor do panner
    }
    setBalance(value); // Ajusta o estado do balanceamento
  };

  const tracks = [
    '/audios/amor-e-fe.mp3',
    '/audios/leaozinho.mp3',
    '/audios/Pais-e-filhos.mp3',
    '/audios/Liberdade.mp3',
    '/audios/Wake_Me_Up.mp3',
    '/audios/WeWillRockYou.mp3',
    '/audios/LikeRollingStone.mp3',
    '/audios/FlyMeToTheMoon.mp3',
    '/audios/WHATWONDERFULWORLD.mp3',
    '/audios/SosLoucosSabem.mp3',
    '/audios/212.mp3',
    '/audios/leilao.mp3',
    '/audios/APrimavera.mp3',
    '/audios/5sinfonia.mp3',
    '/audios/IsThisLove.mp3',
    '/audios/Billionaire.mp3',
    '/audios/AguasdeMarço.mp3',
    '/audios/oiBalde.mp3',
    '/audios/MalFeito.mp3'
  ];

  const nextTrack = () => {
    if (currentMusic) {
      const currentIndex = tracks.indexOf(currentMusic);
      const nextIndex = (currentIndex + 1) % tracks.length;
      setCurrentMusic(tracks[nextIndex]);
    }
  };

  const prevTrack = () => {
    if (currentMusic) {
      const currentIndex = tracks.indexOf(currentMusic);
      const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
      setCurrentMusic(tracks[prevIndex]);
    }
  };

  return (
    <HomeContext.Provider
      value={{
        playing,
        currentMusic,
        progress,
        configPlayPause,
        playMusic,
        nextTrack,
        prevTrack,
        seek,
        setVolume: setVolumeHandler, // Função de ajuste de volume no contexto
        setBalance: setBalanceHandler, // Função de ajuste de balanceamento estéreo no contexto
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export default HomeContextProvider;