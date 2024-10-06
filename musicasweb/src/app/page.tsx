'use client';

// Importa hooks do React e ícones
import { useContext, useEffect, useState } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';
import { HomeContext } from './context/HomeContext';
import { musics } from './dados/music';

// Componente principal da aplicação
export default function Home() {
  const { playing, configPlayPause, playMusic, nextTrack, prevTrack, progress, seek, currentMusic, setVolume } = useContext(HomeContext);

  const [currentMusicData, setCurrentMusicData] = useState<{ title: string; image: string; author: string; description: string } | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [volume, setLocalVolume] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [stereoPan, setStereoPan] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [panNode, setPanNode] = useState<StereoPannerNode | null>(null);

  useEffect(() => {
    if (currentMusic) {
      const musicData = musics.find(music => music.url === currentMusic);
      setCurrentMusicData(musicData || null);

      const newAudio = new Audio(currentMusic);
      setAudio(newAudio);

      const context = new AudioContext();
      const source = context.createMediaElementSource(newAudio);
      const panNode = context.createStereoPanner();

      source.connect(panNode);
      panNode.connect(context.destination);
      setAudioContext(context);
      setPanNode(panNode);

      panNode.pan.value = stereoPan;

      newAudio.onloadedmetadata = () => {
        setAudioDuration(newAudio.duration);
      };

      const play = () => {
        context.resume().then(() => {
          newAudio.play();
        });
      };

      newAudio.addEventListener('play', play);

      newAudio.addEventListener('ended', () => {
        nextTrack();
      });

      return () => {
        newAudio.pause();
        source.disconnect();
        panNode.disconnect();
        newAudio.removeEventListener('play', play);
        newAudio.removeEventListener('ended', () => {
          nextTrack();
        });
        context.close();
      };
    }
  }, [currentMusic, stereoPan]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setLocalVolume(newVolume);
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPan = parseFloat(e.target.value);
    setStereoPan(newPan);
    if (panNode) {
      panNode.pan.value = newPan;
    }
  };

  const categories = Array.from(new Set(musics.map(music => music.category)));

  return (
    <main className="flex min-h-screen flex-col p-24">
      {/* Faixa azul acima das categorias */}
      <div className="bg-blue-500 w-full p-4 text-center mb-4">
        <h1 className="text-3xl font-extrabold text-black">Bem-vindo(a) ao TuneBox</h1> {/* Texto em preto */}
        <p className="text-lg mt-2 text-black">O seu site favorito de músicas.</p> {/* Texto em preto */}
      </div>

      {/* Barra de menu superior - exibe as categorias de música */}
      <header className="w-full p-4 border-b border-gray-200 flex justify-center mb-4">
        <nav className="flex space-x-4">
          {categories.map((category) => (
            <button
              key={category}
              className="text-lg font-semibold hover:text-blue-500"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </nav>
      </header>

      {/* Conteúdo principal - exibe detalhes da música atual e controles */}
      <div className="flex flex-row flex-1">
        <aside className="w-1/4 p-4 border-r border-gray-200 flex flex-col items-start">
          <h2 className="text-lg font-bold mb-4 text-center">Músicas em {selectedCategory}</h2>
          <ul className="w-full">
            {selectedCategory &&
              musics
                .filter(music => music.category === selectedCategory)
                .map(music => (
                  <li
                    key={music.id}
                    className="mb-4 cursor-pointer flex justify-between w-full"
                    onClick={() => playMusic(music.url)}
                  >
                    <span className="text-xl font-semibold">{music.title}</span>
                    <span className="text-sm text-gray-500">{music.author}</span>
                  </li>
                ))}
          </ul>

          {currentMusicData && (
            <div className="border-t border-gray-200 mt-4 pt-4">
              <h3 className="text-lg font-semibold">Descrição</h3>
              <p className="text-center">{currentMusicData.description}</p>
            </div>
          )}

          {currentMusicData && (
            <div className="border-t border-gray-200 mt-4 pt-4 w-full flex flex-col items-center">
              <div className="flex flex-col items-center mb-2">
                <label className="text-lg">Pan Estéreo</label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={stereoPan}
                  onChange={handlePanChange}
                  className="w-40 h-2 mt-2 bg-gray-200 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex flex-col items-center mb-2">
                <label className="text-lg">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-40 h-2 mt-2 bg-gray-200 rounded-lg cursor-pointer"
                />
                <span className="mt-2">{Math.round(volume * 100)}%</span>
              </div>
            </div>
          )}
        </aside>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-2xl font-bold mb-4 text-center">
              {currentMusicData ? currentMusicData.title : 'Clique em cima de uma música para que comece a tocar'}
            </h1>
            {currentMusicData && (
              <img
                src={currentMusicData.image}
                alt={currentMusicData.title}
                className="w-80 h-80 object-cover mb-4"
              />
            )}
          </div>

          {currentMusic && (
            <div className="w-3/4 mb-4 flex flex-col items-center">
              <input
                type="range"
                min="0"
                max={audioDuration || 100}
                step="0.1"
                value={progress}
                onChange={e => seek(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between w-full mt-2 text-sm text-gray-500">
                <span>{Math.floor(progress / 60)}:{Math.floor(progress % 60).toString().padStart(2, '0')}</span>
                <span>{audioDuration ? `${Math.floor(audioDuration / 60)}:${Math.floor(audioDuration % 60).toString().padStart(2, '0')}` : '0:00'}</span>
              </div>
            </div>
          )}

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
      </div>
    </main>
  );
}
