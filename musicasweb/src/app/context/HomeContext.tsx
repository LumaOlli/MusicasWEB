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
  setVolume: (value: number) => void; // Nova função para ajuste de volume
};

export const HomeContext = createContext({} as HomeContextData);

type ProviderProps = {
  children: ReactNode;
};

const HomeContextProvider = ({ children }: ProviderProps) => {
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); // Progress in seconds
  const [volume, setVolume] = useState(1); // Valor de volume (1 = 100%)

  useEffect(() => {
    if (currentMusic) {
      const newAudio = new Audio(currentMusic);
      newAudio.volume = volume; // Ajusta o volume inicial
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
      };
    }
  }, [currentMusic]); // volume agora é monitorado também

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
      audio.volume = value;
    }
    setVolume(value); // Ajusta o estado do volume
  };

  const tracks = [
    '/audios/amor-e-fe.mp3',
    '/audios/leaozinho.mp3',
    '/audios/Pais-e-filhos.mp3'
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
        setVolume: setVolumeHandler // Adicionando a função de ajuste de volume ao contexto
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export default HomeContextProvider;