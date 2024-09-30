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
  // Desestrutura dados do contexto
  const { playing, configPlayPause, playMusic, nextTrack, prevTrack, progress, setVolume, currentMusic } = useContext(HomeContext);
  
  // Declara variáveis de estado
  const [currentMusicData, setCurrentMusicData] = useState<MusicData | null>(null); // Dados da música atual
  const [audioDuration, setAudioDuration] = useState<number | null>(null); // Duração do áudio
  const [volume, setLocalVolume] = useState(1); // Volume atual
  const [balance, setBalance] = useState(0); // Balanceamento (-1 para esquerda, 0 para centro, 1 para direita)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Categoria selecionada
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null); // Elemento de áudio
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null); // Contexto de áudio
  const [pannerNode, setPannerNode] = useState<StereoPannerNode | null>(null); // Nó de pan estéreo

  // Efeito para configurar a música atual e o contexto de áudio
  useEffect(() => {
    if (currentMusic) {
      // Encontra os dados da música atual
      const musicData = musics.find(music => music.url === currentMusic);
      setCurrentMusicData(musicData || null); // Atualiza os dados da música atual

      // Cria um novo elemento de áudio
      const newAudio = new Audio(currentMusic);
      const newAudioContext = new AudioContext(); // Cria um novo contexto de áudio
      const newPannerNode = newAudioContext.createStereoPanner(); // Cria um nó de pan estéreo

      // Conecta o nó de pan ao destino do contexto de áudio
      const source = newAudioContext.createMediaElementSource(newAudio);
      source.connect(newPannerNode).connect(newAudioContext.destination);

      // Atualiza a duração do áudio quando os metadados são carregados
      newAudio.onloadedmetadata = () => {
        setAudioDuration(newAudio.duration);
      };

      // Atualiza a barra de progresso enquanto a música está tocando
      newAudio.ontimeupdate = () => {
        if (audioDuration) {
          progress(newAudio.currentTime); // Atualiza o progresso atual
        }
      };

      // Armazena os novos elementos de áudio e contexto
      setAudio(newAudio);
      setAudioContext(newAudioContext);
      setPannerNode(newPannerNode);

      // Limpeza ao desmontar o componente
      return () => {
        newAudio.pause(); // Pausa o áudio
        newAudioContext.close(); // Fecha o contexto de áudio
      };
    }
  }, [currentMusic]);

  // Efeito para ajustar o balanceamento
  useEffect(() => {
    if (pannerNode) {
      pannerNode.pan.value = balance; // Ajusta o valor do pan estéreo.
    }
  }, [balance, pannerNode]);

  // Função para lidar com a mudança de volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value); // Obtém o novo volume do slider
    setLocalVolume(newVolume); // Atualiza o volume local
    setVolume(newVolume); // Atualiza o volume no contexto
    if (audio) {
      audio.volume = newVolume; // Ajusta o volume do elemento de áudio
    }
  };

  // Função para lidar com a mudança da barra de progresso
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value); // Obtém o novo tempo da barra de progresso
    if (audio) {
      audio.currentTime = newTime; // Atualiza o tempo atual do áudio
    }
  };

  // Função para renderizar o ícone de volume com base no nível de volume
  const renderVolumeIcon = () => {
    if (volume === 0) return <FaVolumeMute className="text-[30px]" />;
    if (volume > 0 && volume <= 0.5) return <FaVolumeDown className="text-[30px]" />;
    return <FaVolumeUp className="text-[30px]" />;
  };

  // Obtém as categorias únicas das músicas
  const categories = Array.from(new Set(musics.map(music => music.category)));

  // Renderiza o componente principal
  return (
    <main className="flex min-h-screen flex-row p-24">
      {/* Cabeçalho da aplicação */}
      <header className="absolute top-0 left-0 w-full p-6 bg-purple-600 text-white text-center text-4xl font-bold">
        Euphonic
      </header>

      {/* Lateral esquerda: Categorias */}
      <aside className="w-1/6 p-4 border-r border-gray-200 flex flex-col items-center mt-16">
        <hr className="border-gray-300 w-full mb-4" />
        <h2 className="text-lg font-bold mb-4 text-center">Categorias</h2>
        <hr className="border-gray-300 w-full mb-4" />
        <ul className="w-full">
          {categories.map((category, index) => (
            <li
              key={`category-${index}`} 
              className={`mb-4 pb-2 cursor-pointer text-center ${selectedCategory === category ? 'font-bold text-blue-500' : ''}`}
              onClick={() => setSelectedCategory(category)} // Define a categoria selecionada ao clicar
            >
              {category}
              <div className="h-px bg-gray-300 w-full my-2"></div> 
            </li>
          ))}
        </ul>
      </aside>

      {/* Lateral direita: Músicas */}
      <aside className="w-1/4 p-4 border-l border-gray-200 flex flex-col items-center mt-16">
        <hr className="border-gray-300 w-full mb-4" />
        <h2 className="text-lg font-bold mb-4 text-center">Músicas</h2>
        <hr className="border-gray-300 w-full mb-4" />
        <ul className="w-full">
          {selectedCategory === null ? (
            <p className="text-center">Selecione uma categoria para ver as músicas</p>
          ) : (
            musics
              .filter(music => music.category === selectedCategory) // Filtra as músicas pela categoria selecionada
              .map((music, index) => (
                <li
                  key={`music-${music.id}`}
                  className="mb-6 pb-4 cursor-pointer flex flex-col items-center"
                  onClick={() => playMusic(music.url)} // Reproduz a música ao clicar
                >
                  <h3 className="text-xl font-semibold mb-1">{music.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">Artista: {music.author}</p>
                  {index < musics.filter(m => m.category === selectedCategory).length - 1 && (
                    <hr className="border-gray-300 w-full mb-4" /> // Adiciona linha entre músicas
                  )}
                </li>
              ))
          )}
        </ul>
      </aside>

      {/* Área central: Controle de áudio */}
      <div className="flex-1 flex flex-col items-center justify-center mt-16 relative">
        {/* Barra de balanceamento */}
        <div className="absolute top-4 left-4 w-32">
          <label className="text-center mb-1">Áudio Estéreo</label>
          <div className="flex justify-between text-xs">
            <span>E</span> {/* Label para esquerda */}
            <span>D</span> {/* Label para direita */}
          </div>
          <div className="relative">
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(parseFloat(e.target.value))} // Atualiza o balanceamento ao mover o slider
              className="w-full"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 h-1 w-1 rounded-full" /> {/* Indicador de centro */}
          </div>
        </div>

        {/* Barra de volume */}
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
            onChange={handleVolumeChange} // Atualiza o volume ao mover o slider
            className="w-full"
          />
        </div>

        {/* Exibição da imagem da música */}
        {currentMusicData && (
          <img src={currentMusicData.image} alt={currentMusicData.title} className="w-48 h-48 mb-4 rounded-md" />
        )}
        <h1 className="text-2xl font-semibold text-center mb-1">
          {currentMusicData ? currentMusicData.title : 'Selecione uma música'}
        </h1>
        <h2 className="text-lg text-gray-600 mb-2 text-center">
          {currentMusicData ? currentMusicData.author : ''}
        </h2>

        {/* Barra de progresso */}
        <input
          type="range"
          min="0"
          max={audioDuration || 0}
          step="0.01"
          value={progress} // Valor da barra de progresso
          onChange={handleProgressChange} // Atualiza o tempo ao mover o slider
          className="w-full mt-4"
        />

        {/* Controles de reprodução */}
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
