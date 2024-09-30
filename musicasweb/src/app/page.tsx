'use client';

import { useContext, useEffect, useState } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeMute, FaVolumeDown, FaVolumeUp } from 'react-icons/fa'; 
import { HomeContext } from './context/HomeContext'; 
import { musics } from './dados/music';

export default function Home() {
  // Extrai funções e variáveis do contexto HomeContext
  const { playing, configPlayPause, playMusic, nextTrack, prevTrack, progress, seek, currentMusic, setVolume } = useContext(HomeContext);
  
  // Estados locais
  const [currentMusicData, setCurrentMusicData] = useState<{ title: string; image: string; author: string; description: string } | null>(null); // Guarda dados da música atual.
  const [audioDuration, setAudioDuration] = useState<number | null>(null); // Guarda a duração da música atual.
  const [volume, setLocalVolume] = useState(1); // Guarda o valor do volume.
  const [balance, setBalance] = useState(0); // Guarda o valor de balanceamento estéreo.
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Guarda a categoria selecionada.

  // Estados relacionados ao áudio
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null); // Armazena o elemento de áudio.
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null); // Contexto de áudio para manipulação avançada.
  const [pannerNode, setPannerNode] = useState<StereoPannerNode | null>(null); // Nó que controla o balanceamento estéreo.

  // Efeito para inicializar e limpar o áudio quando a música atual muda.
  useEffect(() => {
    if (currentMusic) {
      // Busca os dados da música atual nos dados de músicas.
      const musicData = musics.find(music => music.url === currentMusic);
      setCurrentMusicData(musicData || null);

      // Cria um novo elemento de áudio e configura o contexto de áudio e o nó estéreo.
      const newAudio = new Audio(currentMusic);
      const newAudioContext = new AudioContext();
      const newPannerNode = newAudioContext.createStereoPanner();

      const source = newAudioContext.createMediaElementSource(newAudio); // Conecta o elemento de áudio ao contexto de áudio.
      source.connect(newPannerNode).connect(newAudioContext.destination); // Conecta o nó estéreo ao destino (alto-falantes).

      setAudio(newAudio); // Armazena o novo elemento de áudio no estado.
      setAudioContext(newAudioContext); // Armazena o contexto de áudio no estado.
      setPannerNode(newPannerNode); // Armazena o nó estéreo no estado.

      // Atualiza a duração do áudio quando seus metadados forem carregados.
      newAudio.onloadedmetadata = () => {
        setAudioDuration(newAudio.duration);
      };

      // Limpa o áudio e o contexto quando o componente for desmontado ou a música mudar.
      return () => {
        newAudio.pause();
        newAudioContext.close();
      };
    }
  }, [currentMusic]); // O efeito é executado sempre que a música atual mudar.

  // Efeito para ajustar o balanceamento estéreo sempre que o valor de balance mudar.
  useEffect(() => {
    if (pannerNode) {
      pannerNode.pan.value = balance; // Atualiza o valor do pan estéreo.
    }
  }, [balance, pannerNode]); // O efeito é executado sempre que balance ou pannerNode mudar.

  // Função para lidar com a mudança de volume.
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value); // Converte o valor do volume para número.
    setLocalVolume(newVolume); // Atualiza o volume local.
    setVolume(newVolume); // Atualiza o volume global (via contexto).
    if (audio) {
      audio.volume = newVolume; // Ajusta o volume do elemento de áudio.
    }
  };

  // Função para ajustar o balanceamento estéreo (esquerda ou direita).
  const adjustBalance = (direction: 'left' | 'right') => {
    setBalance(prev => {
      // Ajusta o balanceamento com base na direção (entre -1 e 1).
      const newBalance = direction === 'left' ? Math.max(-1, prev - 0.1) : Math.min(1, prev + 0.1);
      return newBalance;
    });
  };

  // Função para renderizar o ícone de volume correto (mudo, baixo ou alto).
  const renderVolumeIcon = () => {
    if (volume === 0) return <FaVolumeMute className="text-[30px]" />;
    if (volume > 0 && volume <= 0.5) return <FaVolumeDown className="text-[30px]" />;
    return <FaVolumeUp className="text-[30px]" />;
  };

  // Funções para ajustar o pan estéreo para a esquerda ou direita.
  const handleLeftPan = () => {
    adjustBalance('left');
  };

  const handleRightPan = () => {
    adjustBalance('right');
  };

  // Gera uma lista única de categorias a partir das músicas.
  const categories = Array.from(new Set(musics.map(music => music.category)));

  return (
    <main className="flex min-h-screen flex-row p-24">
      <header className="absolute top-0 left-0 w-full p-6 bg-purple-600 text-white text-center text-4xl font-bold">
        Euphonic
      </header>

      {/* Barra lateral de categorias */}
      <aside className="w-1/6 p-4 border-r border-gray-200 flex flex-col items-center mt-16">
        <hr className="border-gray-300 w-full mb-4" />
        <h2 className="text-lg font-bold mb-4 text-center">Categorias</h2>
        <hr className="border-gray-300 w-full mb-4" />
        <ul className="w-full">
          {categories.map((category, index) => (
            <li
              key={`category-${index}`} 
              className={`mb-4 pb-2 cursor-pointer text-center ${selectedCategory === category ? 'font-bold text-blue-500' : ''}`}
              onClick={() => setSelectedCategory(category)} // Atualiza a categoria selecionada.
            >
              {category}
              <div className="h-px bg-gray-300 w-full my-2"></div> 
            </li>
          ))}
        </ul>
      </aside>

      {/* Barra lateral de músicas */}
      <aside className="w-1/4 p-4 border-l border-gray-200 flex flex-col items-center mt-16">
        <hr className="border-gray-300 w-full mb-4" />
        <h2 className="text-lg font-bold mb-4 text-center">Músicas</h2>
        <hr className="border-gray-300 w-full mb-4" />
        <ul className="w-full">
          {selectedCategory === null ? (
            <p className="text-center">Selecione uma categoria para ver as músicas</p>
          ) : (
            musics
              .filter(music => music.category === selectedCategory) // Filtra músicas pela categoria selecionada.
              .map((music, index) => (
                <li
                  key={`music-${music.id}`}
                  className="mb-6 pb-4 cursor-pointer flex flex-col items-center"
                  onClick={() => playMusic(music.url)} // Inicia a reprodução da música selecionada.
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

      {/* Controle de reprodução e ajustes de áudio */}
      <div className="flex-1 flex flex-col items-center justify-center mt-16">
        <div className="flex flex-col items-center mb-6">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-2 text-center">
              {currentMusicData ? currentMusicData.title : 'Clique em cima de uma música para que comece a tocar'} {/* Exibe o título da música atual. */}
            </h1>
            {currentMusicData && (
              <img src={currentMusicData.image} alt={currentMusicData.title} className="w-80 h-80 object-cover mb-2" /> /* Exibe a imagem da música atual. */
            )}
          </div>

          {/* Controle de volume */}
          <div className="w-full flex justify-center items-center mt-4">
            <button className="mr-4">
              {renderVolumeIcon()} {/* Exibe o ícone correspondente ao volume. */}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange} // Atualiza o volume quando o usuário interage com o controle.
              className="w-64"
            />
          </div>

          {/* Barra de progresso */}
          <div className="w-full mt-4 flex justify-center">
            <input
              type="range"
              min="0"
              max={audioDuration || 0}
              value={progress}
              onChange={(e) => seek(parseFloat(e.target.value))} // Atualiza o progresso da música.
              className="w-full"
            />
          </div>

          {/* Controles de navegação e pan estéreo */}
          <div className="flex items-center mt-4">
            <button onClick={prevTrack} className="mr-4">
              <FaStepBackward size={30} /> {/* Botão de música anterior. */}
            </button>
            <button onClick={configPlayPause}>
              {playing ? <FaPause size={30} /> : <FaPlay size={30} />} {/* Alterna entre play e pause. */}
            </button>
            <button onClick={nextTrack} className="ml-4">
              <FaStepForward size={30} /> {/* Botão de próxima música. */}
            </button>
          </div>

          {/* Controles de pan estéreo */}
          <div className="flex items-center mt-4">
            <button onClick={handleLeftPan} className="mr-4">Esquerda</button>
            <button onClick={handleRightPan} className="ml-4">Direita</button>
          </div>
        </div>
      </div>
    </main>
  );
}