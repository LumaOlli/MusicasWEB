'use client';

import { useContext, useEffect, useState } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeMute, FaVolumeDown, FaVolumeUp } from 'react-icons/fa';
import { HomeContext } from './context/HomeContext';
import { musics } from './dados/music';

export default function Home() {
  const { playing, configPlayPause, playMusic, nextTrack, prevTrack, progress, seek, currentMusic, setVolume } = useContext(HomeContext);
  const [currentMusicData, setCurrentMusicData] = useState<{ title: string; image: string; author: string; description: string } | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [volume, setLocalVolume] = useState(1);
  const [balance, setBalance] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [pannerNode, setPannerNode] = useState<StereoPannerNode | null>(null);

  useEffect(() => {
    if (currentMusic) {
      const musicData = musics.find(music => music.url === currentMusic);
      setCurrentMusicData(musicData || null);

      const newAudio = new Audio(currentMusic);
      const newAudioContext = new AudioContext();
      const newPannerNode = newAudioContext.createStereoPanner();

      const source = newAudioContext.createMediaElementSource(newAudio);
      source.connect(newPannerNode).connect(newAudioContext.destination);

      setAudio(newAudio);
      setAudioContext(newAudioContext);
      setPannerNode(newPannerNode);

      newAudio.onloadedmetadata = () => {
        setAudioDuration(newAudio.duration);
      };

      return () => {
        newAudio.pause();
        newAudioContext.close();
      };
    }
  }, [currentMusic]);

  useEffect(() => {
    if (pannerNode) {
      pannerNode.pan.value = balance;
    }
  }, [balance, pannerNode]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setLocalVolume(newVolume);
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const adjustBalance = (direction: 'left' | 'right') => {
    setBalance(prev => {
      const newBalance = direction === 'left' ? Math.max(-1, prev - 0.1) : Math.min(1, prev + 0.1);
      return newBalance;
    });
  };

  const renderVolumeIcon = () => {
    if (volume === 0) return <FaVolumeMute className="text-[30px]" />;
    if (volume > 0 && volume <= 0.5) return <FaVolumeDown className="text-[30px]" />;
    return <FaVolumeUp className="text-[30px]" />;
  };

  const handleLeftPan = () => {
    adjustBalance('left');
  };

  const handleRightPan = () => {
    adjustBalance('right');
  };

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

      <div className="flex-1 flex flex-col items-center justify-center mt-16">
        <div className="flex flex-col items-center mb-6">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-2 text-center">
              {currentMusicData ? currentMusicData.title : 'Clique em cima de uma música para que comece a tocar'}
            </h1>
            {currentMusicData && (
              <img src={currentMusicData.image} alt={currentMusicData.title} className="w-80 h-80 object-cover mb-2" />
            )}
          </div>

          <div className="w-full flex justify-center items-center mb-4">
            {renderVolumeIcon()}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider w-40 h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          {currentMusic && (
            <div className="w-full flex flex-col items-center">
              <input
                type="range"
                min="0"
                max={audioDuration || 100}
                step="0.1"
                value={progress}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="w-full h-4 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between w-full mt-2 text-sm text-gray-500">
                <span>{Math.floor(progress / 60)}:{Math.floor(progress % 60).toString().padStart(2, '0')}</span>
                <span>{audioDuration ? `${Math.floor(audioDuration / 60)}:${Math.floor(audioDuration % 60).toString().padStart(2, '0')}` : '0:00'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Botões de pan abaixo da faixa roxa */}
        <div className="flex justify-center items-center mb-4">
          <button 
            onClick={handleLeftPan} 
            className="mr-2 p-2 border border-white bg-transparent rounded hover:bg-white hover:text-black transition"
          >
            Esquerda
          </button>
          <button 
            onClick={handleRightPan} 
            className="ml-2 p-2 border border-white bg-transparent rounded hover:bg-white hover:text-black transition"
          >
            Direita
          </button>
        </div>

        <div className="flex items-center mt-4">
          <button onClick={prevTrack} className="mr-4">
            <FaStepBackward className="text-[30px]" />
          </button>
          <button onClick={configPlayPause} className="mr-4">
            {playing ? (
              <FaPause className="text-[50px] text-[tomato]" />
            ) : (
              <FaPlay className="text-[50px]" />
            )}
          </button>
          <button onClick={nextTrack} className="mr-4">
            <FaStepForward className="text-[30px]" />
          </button>
        </div>
      </div>
    </main>
  );
}