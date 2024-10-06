'use client';

// Importa hooks do React e ícones
import { useContext, useEffect, useState } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';
import { HomeContext } from './context/HomeContext';
import { musics } from './dados/music';

// Componente principal da aplicação
export default function Home() {
  // Obtém estados e funções do contexto de áudio
  const { playing, configPlayPause, playMusic, nextTrack, prevTrack, progress, seek, currentMusic, setVolume } = useContext(HomeContext);
  
  // Estado para armazenar os dados da música atual
  const [currentMusicData, setCurrentMusicData] = useState<{ title: string; image: string; author: string; description: string } | null>(null);
  // Estado para armazenar a duração da música
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  // Estado para armazenar o volume local
  const [volume, setLocalVolume] = useState(1); 
  // Estado para armazenar a categoria selecionada
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Estado para pan estéreo (-1 = esquerda, 1 = direita)
  const [stereoPan, setStereoPan] = useState(0); // Valor inicial de pan
  // Estado para referência ao áudio
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  // Estado para o AudioContext e o StereoPannerNode
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [panNode, setPanNode] = useState<StereoPannerNode | null>(null);

  // Efeito colateral para configurar a música atual e a duração do áudio
  useEffect(() => {
    if (currentMusic) {
      const musicData = musics.find(music => music.url === currentMusic);
      setCurrentMusicData(musicData || null);

      const newAudio = new Audio(currentMusic);
      setAudio(newAudio); // Armazena a referência do áudio

      const context = new AudioContext();
      const source = context.createMediaElementSource(newAudio);
      const panNode = context.createStereoPanner();

      // Conecta os nós
      source.connect(panNode);
      panNode.connect(context.destination);
      setAudioContext(context);
      setPanNode(panNode);
      
      panNode.pan.value = stereoPan; // Define o valor inicial de pan

      newAudio.onloadedmetadata = () => {
        setAudioDuration(newAudio.duration);
      };

      // Função para tocar a música
      const play = () => {
        context.resume().then(() => {
          newAudio.play();
        });
      };

      newAudio.addEventListener('play', play);
      
      // Adiciona um ouvinte para mudar para a próxima música ao final
      newAudio.addEventListener('ended', () => {
        nextTrack(); // Chama a função para tocar a próxima música
      });

      return () => {
        newAudio.pause();
        source.disconnect();
        panNode.disconnect();
        newAudio.removeEventListener('play', play);
        newAudio.removeEventListener('ended', () => {
          nextTrack();
        });
        context.close(); // Fecha o contexto de áudio
      };
    }
  }, [currentMusic, stereoPan]); // Reexecuta sempre que a música atual ou o pan mudar

  // Função para atualizar o volume ao mudar o slider de volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setLocalVolume(newVolume);
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume; // Atualiza o volume do áudio
    }
  };

  // Função para atualizar o pan ao mudar o slider de pan
  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPan = parseFloat(e.target.value);
    setStereoPan(newPan);
    if (panNode) {
      panNode.pan.value = newPan; // Atualiza o pan do áudio usando o StereoPannerNode
    }
  };

  // Categorias únicas
  const categories = Array.from(new Set(musics.map(music => music.category)));


  return (
    <main className="flex min-h-screen flex-col p-24">
      {/* Barra de menu superior - exibe as categorias de música */}
      <header className="w-full p-4 border-b border-gray-200 flex justify-center mb-4">
        <nav className="flex space-x-4">
          {categories.map((category) => (
            <button
              key={category}
              className="text-lg font-semibold hover:text-blue-500"
              onClick={() => setSelectedCategory(category)} // Atualiza a categoria selecionada ao clicar
            >
              {category}
            </button>
          ))}
        </nav>
      </header>

      {/* Conteúdo principal - exibe detalhes da música atual e controles */}
      <div className="flex flex-row flex-1">
        {/* Menu lateral - exibe as músicas da categoria selecionada */}
        <aside className="w-1/4 p-4 border-r border-gray-200 flex flex-col items-start">
          <h2 className="text-lg font-bold mb-4 text-center">Músicas em {selectedCategory}</h2>
          <ul className="w-full">
            {selectedCategory && musics
              .filter(music => music.category === selectedCategory) // Filtra músicas pela categoria selecionada
              .map((music) => (
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

          {/* Descrição da música selecionada */}
          {currentMusicData && (
            <div className="border-t border-gray-200 mt-4 pt-4">
              <h3 className="text-lg font-semibold">Descrição</h3>
              <p className="text-center">{currentMusicData.description}</p>
            </div>
          )}

          {/* Controle de pan estéreo e volume abaixo da descrição */}
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
                <span className="mt-2">{Math.round(volume * 100)}%</span> {/* Porcentagem do volume ao lado da barra */}
              </div>
            </div>
          )}
        </aside>

        {/* Controles de música e imagem */}
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

          {/* Barra de progresso e tempo da música */}
          {currentMusic && (
            <div className="w-3/4 mb-4 flex flex-col items-center">
              <input
                type="range"
                min="0"
                max={audioDuration || 100}
                step="0.1"
                value={progress}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between w-full mt-2 text-sm text-gray-500">
                <span>{Math.floor(progress / 60)}:{Math.floor(progress % 60).toString().padStart(2, '0')}</span>
                <span>{audioDuration ? `${Math.floor(audioDuration / 60)}:${Math.floor(audioDuration % 60).toString().padStart(2, '0')}` : '0:00'}</span>
              </div>
            </div>
          )}

          {/* Botões de controle da música */}
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
