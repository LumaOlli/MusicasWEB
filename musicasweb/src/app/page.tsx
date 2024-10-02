'use client';

import { useContext, useEffect, useState } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeMute, FaVolumeDown, FaVolumeUp } from 'react-icons/fa'; 
import { HomeContext } from './context/HomeContext';
import { musics } from './dados/music';

// Define uma interface para os dados da música
interface MusicData {
  id: number; 
  author: string;
  title: string;
  category: string;
  description: string;
  image: string;
  url: string;
}

// Componente principal da aplicação
export default function Home() {
  const { playing, configPlayPause, playMusic, nextTrack, prevTrack, progress, setVolume, currentMusic } = useContext(HomeContext);

  // Estados do componente
  const [currentMusicData, setCurrentMusicData] = useState<MusicData | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [volume, setLocalVolume] = useState(1);
  const [balance, setBalance] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [pannerNode, setPannerNode] = useState<StereoPannerNode | null>(null);

  // Efeito para configurar a música e contexto de áudio
  useEffect(() => {
    if (currentMusic) {
      const musicData = musics.find(music => music.url === currentMusic);
      setCurrentMusicData(musicData || null);

      const newAudio = new Audio(currentMusic);
      const newAudioContext = new AudioContext();
      const newPannerNode = newAudioContext.createStereoPanner();

      const source = newAudioContext.createMediaElementSource(newAudio);
      source.connect(newPannerNode).connect(newAudioContext.destination);

      newAudio.onloadedmetadata = () => {
        setAudioDuration(newAudio.duration);
      };
        newAudio.ontimeupdate = () => {
          if (audioDuration) {
            progress(newAudio.currentTime);  // Use currentTime directly
          }
        };

      setAudio(newAudio);
      setAudioContext(newAudioContext);
      setPannerNode(newPannerNode);

      return () => {
        newAudio.pause();
        newAudioContext.close();
      };
    }
  }, [currentMusic]);

  // Efeito para ajustar o pan estéreo
  useEffect(() => {
    if (pannerNode) {
      pannerNode.pan.value = balance;
    }
  }, [balance, pannerNode]);

  // Função para mudar o volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setLocalVolume(newVolume);
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  // Função para ajustar o progresso
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audio) {
      audio.currentTime = newTime;
    }
  };

  // Função para renderizar o ícone de volume
  const renderVolumeIcon = () => {
    if (volume === 0) return <FaVolumeMute className="text-[30px]" />;
    if (volume > 0 && volume <= 0.5) return <FaVolumeDown className="text-[30px]" />;
    return <FaVolumeUp className="text-[30px]" />;
  };

  // Categorias únicas
  const categories = Array.from(new Set(musics.map(music => music.category)));

  return (
    <main className="flex min-h-screen flex-row p-24">
      <header className="absolute top-0 left-0 w-full p-6 bg-purple-600 text-white text-center text-4xl font-bold">
        Euphonic
      </header>

      <aside className="w-1/6 p-4 border-r border-gray-200 flex flex-col items-center mt-16">
        <hr className="border-gray-300 w-full mb-4" />
        <h2 className="text-lg font-bold mb-4 text-center">Categorias</h2>
        <hr className="border-gray-300 w-full mb-4" />
        <ul className="w-full">
          {categories.map((category, index) => (
            <li
              key={`category-${index}`}
              className={`mb-4 pb-2 cursor-pointer text-center ${selectedCategory === category ? 'font-bold text-blue-500' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
              <div className="h-px bg-gray-300 w-full my-2"></div>
            </li>
          ))}
        </ul>
      </aside>

      <aside className="w-1/4 p-4 border-l border-gray-200 flex flex-col items-center mt-16">
        <hr className="border-gray-300 w-full mb-4" />
        <h2 className="text-lg font-bold mb-4 text-center">Músicas</h2>
        <hr className="border-gray-300 w-full mb-4" />
        <ul className="w-full">
          {selectedCategory === null ? (
            <p className="text-center">Selecione uma categoria para ver as músicas</p>
          ) : (
            musics
              .filter(music => music.category === selectedCategory)
              .map((music, index) => (
                <li
                  key={`music-${music.id}`}
                  className="mb-6 pb-4 cursor-pointer flex flex-col items-center"
                  onClick={() => playMusic(music.url)}
                >
                  <h3 className="text-xl font-semibold mb-1">{music.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">Artista: {music.author}</p>
                  {index < musics.filter(m => m.category === selectedCategory).length - 1 && (
                    <hr className="border-gray-300 w-full mb-4" />
                  )}
                </li>
              ))
          )}
        </ul>
      </aside>

      <div className="flex-1 flex flex-col items-center justify-center mt-16 relative">
        <div className="absolute top-4 left-4 w-32">
          <label className="text-center mb-1">Áudio Estéreo</label>
          <div className="flex justify-between text-xs">
            <span>E</span>
            <span>D</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 h-1 w-1 rounded-full" />
          </div>
        </div>

        <div className="absolute top-4 right-4 w-48">
          <div className="flex items-center justify-between mb-2">
            {renderVolumeIcon()}
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full"
          />
        </div>

        {currentMusicData && (
          <img src={currentMusicData.image} alt={currentMusicData.title} className="w-48 h-48 mb-4 rounded-md" />
        )}
        <h1 className="text-2xl font-semibold text-center mb-1">
          {currentMusicData ? currentMusicData.title : 'Selecione uma música'}
        </h1>
        <h2 className="text-lg text-gray-600 mb-2 text-center">
          {currentMusicData ? currentMusicData.author : ''}
        </h2>

        <input
          type="range"
          min="0"
          max={audioDuration || 0}
          step="0.01"
          value={progress}
          onChange={handleProgressChange}
          className="w-full mt-4"
        />

        <div className="flex items-center mt-4">
          <button onClick={prevTrack} className="mr-4">
            <FaStepBackward size={30} />
          </button>
          <button onClick={configPlayPause}>
            {playing ? <FaPause size={30} /> : <FaPlay size={30} />}
          </button>
          <button onClick={nextTrack} className="ml-4">
            <FaStepForward size={30} />
          </button>
        </div>
      </div>
    </main>
  );
}