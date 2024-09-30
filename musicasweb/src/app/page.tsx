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
  const { playing, configPlayPause, playMusic, nextTrack, prevTrack, progress, seek, currentMusic, setVolume } = useContext(HomeContext);
  
  // Declara variáveis de estado
  const [currentMusicData, setCurrentMusicData] = useState<MusicData | null>(null); // Dados da música atual
  const [audioDuration, setAudioDuration] = useState<number | null>(null); // Duração do áudio
  const [volume, setLocalVolume] = useState(1); // Volume atual
  const [balance, setBalance] = useState(0); // Balanceamento (-1 para esquerda, 0 para centro, 1 para direita)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Categoria selecionada
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null); // Elemento de áudio
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null); // Contexto de áudio
  const [pannerNode, setPannerNode] = useState<StereoPannerNode | null>(null); // Nó de pan estéreo
  const [isLeftSelected, setIsLeftSelected] = useState(false); // Estado para verificar se o lado esquerdo está selecionado
  const [isRightSelected, setIsRightSelected] = useState(false); // Estado para verificar se o lado direito está selecionado

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

  // Função para ajustar o balanceamento para a esquerda
  const adjustBalanceLeft = () => {
    if (isLeftSelected) {
      setBalance(0); // Desabilita o balanceamento
      setIsLeftSelected(false);
    } else {
      setBalance(-1); // Ajusta o balanceamento para a esquerda
      setIsLeftSelected(true); // Marca o lado esquerdo como selecionado
      setIsRightSelected(false); // Desmarca o lado direito
    }
  };

  // Função para ajustar o balanceamento para a direita
  const adjustBalanceRight = () => {
    if (isRightSelected) {
      setBalance(0); // Desabilita o balanceamento
      setIsRightSelected(false);
    } else {
      setBalance(1); // Ajusta o balanceamento para a direita
      setIsRightSelected(true); // Marca o lado direito como selecionado
      setIsLeftSelected(false); // Desmarca o lado esquerdo
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
      <div className="flex-1 flex flex-col items-center justify-center mt-16">
        <div className="flex flex-col items-center mb-6">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-2 text-center">
              {currentMusicData ? currentMusicData.title : 'Clique em cima de uma música para que comece a tocar'}
            </h1>
            {currentMusicData && (
              <img src={currentMusicData.image} alt={currentMusicData.title} className="w-80 h-80 object-cover mb-2" /> // Exibe a imagem da música atual
            )}
          </div>

          {/* Controle de volume */}
          <div className="w-full flex justify-center items-center mt-4">
            <button className="mr-4">
              {renderVolumeIcon()}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume} // Slider de volume
              onChange={handleVolumeChange} // Atualiza o volume ao mover o slider
              className="w-64"
            />
          </div>

          {/* Controle de progresso da música */}
          <div className="w-full mt-4 flex justify-center">
            <input
              type="range"
              min="0"
              max={audioDuration || 0} // Slider de progresso da música
              value={progress} // Valor atual do progresso
              onChange={(e) => seek(parseFloat(e.target.value))} // Atualiza o progresso ao mover o slider
              className="w-full"
            />
          </div>

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

          {/* Controles de balanceamento */}
          <div className="flex items-center mt-4">
            <button
              onClick={adjustBalanceLeft} // Ajusta o balanceamento para a esquerda
              className={`mr-2 px-4 py-2 rounded ${isLeftSelected ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} // Estilo do botão para esquerda
            >
              Esquerda
            </button>
            <button
              onClick={adjustBalanceRight} // Ajusta o balanceamento para a direita
              className={`ml-2 px-4 py-2 rounded ${isRightSelected ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} // Estilo do botão para direita
            >
              Direita
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
