'use client';

import { useContext, useEffect, useState } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeMute, FaVolumeDown, FaVolumeUp } from 'react-icons/fa';
import { HomeContext } from './context/HomeContext';
import { musics } from './dados/music';

export default function Home() {
  const { playing, configPlayPause, playMusic, nextTrack, prevTrack, progress, seek, currentMusic, setVolume } = useContext(HomeContext);
  const [currentMusicData, setCurrentMusicData] = useState<{ title: string; image: string; author: string; description: string } | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [volume, setLocalVolume] = useState(1); // Controle de volume local

  useEffect(() => {
    if (currentMusic) {
      const musicData = musics.find(music => music.url === currentMusic);
      setCurrentMusicData(musicData || null);

      const audio = new Audio(currentMusic);
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration);
      };
    }
  }, [currentMusic]);

  // Atualiza o volume no contexto e localmente
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setLocalVolume(newVolume);
    setVolume(newVolume); // Atualiza o volume no contexto de áudio
  };

  // Escolhe o ícone de volume com base no nível atual
  const renderVolumeIcon = () => {
    if (volume === 0) return <FaVolumeMute className="text-[30px]" />;
    if (volume > 0 && volume <= 0.5) return <FaVolumeDown className="text-[30px]" />;
    return <FaVolumeUp className="text-[30px]" />;
  };

  return (
    <main className="flex min-h-screen flex-row p-24">
      {/* Menu lateral - músicas no lado esquerdo */}
      <aside className="w-1/4 p-4 border-r border-gray-200 flex flex-col items-center">
        <hr className="border-gray-300 w-full mb-4" />
        <h2 className="text-lg font-bold mb-4 text-center">Músicas Disponíveis</h2>
        <hr className="border-gray-300 w-full mb-4" />
        <ul className="w-full">
          {musics.map((music) => (
            <li
              key={music.id}
              className="mb-6 border-b border-gray-300 pb-4 cursor-pointer flex flex-col items-center"
              onClick={() => playMusic(music.url)}
            >
              <img src={music.image} alt={music.title} className="w-40 h-40 object-cover mb-2" />
              <h3 className="text-xl font-semibold mb-1">{music.title}</h3>
              <p className="text-sm text-gray-500 mb-1">Artist: {music.author}</p>
              <p className="text-center">{music.description}</p>
            </li>
          ))}
        </ul>
      </aside>

      {/* Conteúdo principal - ao lado direito */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center mb-6">
          {/* Coluna com imagem e título da música */}
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-2 text-center">
              {currentMusicData ? currentMusicData.title : 'Clique em cima de uma música para que comece a tocar'}
            </h1>
            {currentMusicData && (
              <img
                src={currentMusicData.image}
                alt={currentMusicData.title}
                className="w-80 h-80 object-cover mb-2"
              />
            )}
          </div>

          {/* Controle de Volume horizontal */}
          <div className="w-full flex justify-center items-center mb-4">
            {renderVolumeIcon()}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider w-40 h-2 bg-gray-200 rounded-lg cursor-pointer" // Reduzido o tamanho do controle de volume
            />
          </div>

          {/* Barra de progresso e tempo */}
          {currentMusic && (
            <div className="w-full flex flex-col items-center">
              <input
                type="range"
                min="0"
                max={audioDuration || 100}
                step="0.1"
                value={progress}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="w-full h-4 bg-gray-200 rounded-lg cursor-pointer" // Aumentado a barra de progresso
              />
              <div className="flex justify-between w-full mt-2 text-sm text-gray-500">
                <span>{Math.floor(progress / 60)}:{Math.floor(progress % 60).toString().padStart(2, '0')}</span>
                <span>{audioDuration ? `${Math.floor(audioDuration / 60)}:${Math.floor(audioDuration % 60).toString().padStart(2, '0')}` : '0:00'}</span>
              </div>
            </div>
          )}
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
