import {useEffect, useState} from 'react'
import "./Cliente.css";
import Chat from "./Chat";

export default function Cliente() {
  const QUEUE_URL = "http://localhost:15672/api/queues"
  const TOPIC_URL = "http://localhost:15672/api/exchanges"
  const FETCH_INIT = {
    method: 'get',
    headers: {
      "Content-Type": "text/plain",
      'Authorization': 'Basic ' + btoa('guest:guest'),
    }
  }

  const [usuario, setUsuario] = useState("");
  const [adicionarNome, setAdicionarNome] = useState("");
  const [adicionarTipo, setAdicionarTipo] = useState("fila");
  const [mostrarModal, setMostrarModal] = useState(true);
  const [mostrarCaixa, setMostrarCaixa] = useState(false);
  const [conversandoCom, setConversandoCom] = useState('');
  const [tipoChat, setTipoChat] = useState('')
  const [mostrarChat, setMostrarChat] = useState(false);
  const [conversas, setConversas] = useState({})
  const [mensagemDeErro, setMensagemDeErro] = useState('')

  const [amigos, setAmigos] = useState(new Set());
  const [topicos, setTopicos] = useState(new Set());

  useEffect(() => {
    window.api.receive("atualizarMensagens", (mensagem) => {
      console.log(mensagem)
      if (!Object.keys(conversas).includes(mensagem.nome) && mensagem.tipo === 'fila') {
        setAmigos(amigos => new Set([...amigos, mensagem.nome]))
      }

      if (mensagem.tipo === 'fila') {
        novaMensagem(mensagem.nome, mensagem);
      } else {
        novaMensagem(mensagem.destinatario, mensagem);
      }

    })
  }, [])

  function novaConversa(destinatario) {
    setConversas((prevConversas) => ({...prevConversas, [destinatario]: []}));
  }

  function novaMensagem(destinatario, mensagem) {
    setConversas(prevConversas => {
      const mensagens = Array.isArray(prevConversas[destinatario]) ? prevConversas[destinatario] : [];
      return {...prevConversas, [destinatario]: [...mensagens, mensagem]};
    });
  }

  function abrirChat(nome, tipo) {
    setConversandoCom(nome);
    setTipoChat(tipo);
    setMostrarChat(true);
  }

  function criarUsuario() {
    if (usuario.length === 0) return

    window.api.send("consumirMensagens", usuario);
    setMostrarModal(false);
  }

  async function checarSeTopicoExiste(nomeTopico) {
    const topicos = await fetch(TOPIC_URL, FETCH_INIT).then(res => res.json())
    debugger
    return topicos.map(topico => topico.name).includes(nomeTopico);
  }

  async function adicionar() {
    if (adicionarNome.length === 0) return
    if (topicos.has(adicionarNome) || amigos.has(adicionarNome)) return

    if (adicionarTipo === 'topico' && !await checarSeTopicoExiste(adicionarNome)) {
      setMensagemDeErro("Tópico não existe!");
      return
    }

    if (adicionarTipo === 'topico') {
      const data = {"usuario": usuario, "topico": adicionarNome}
      window.api.send("consumirTopico", data)
      setTopicos(topicos => new Set([...topicos, adicionarNome]))
    } else {
      setAmigos(amigos => new Set([...amigos, adicionarNome]))
    }
    novaConversa(adicionarNome);
    fecharCaixa();
  }

  function abrirCaixa(tipo) {
    setAdicionarTipo(tipo);
    setMostrarCaixa(true);
  }

  function fecharCaixa() {
    setMensagemDeErro('');
    setMostrarCaixa(false);
  }

  return (
    <div className="outter">
      <h2>Usuário: {usuario}</h2>

      <div className="menu">
        <button
          onClick={() => abrirCaixa('fila')}
        >
          Adicionar amigo
        </button>
        <button
          onClick={() => abrirCaixa('topico')}
        >
          Adicionar tópico
        </button>
      </div>

      {
        mostrarCaixa &&
        <div className="caixa">
          <input
            type="text"
            placeholder={`Nome do ${adicionarTipo === 'fila' ? 'amigo' : 'tópico'}`}
            onChange={(event) => setAdicionarNome(event.target.value)}
          />
          <h4 style={{color: '#b93939'}} className="mensagem-erro">{mensagemDeErro}</h4>
          <div className="acoes-modal">
            <button style={{backgroundColor: '#61c75d'}} onClick={adicionar}>Adicionar {adicionarTipo === 'fila' ? 'amigo' : 'tópico'}</button>
            <button style={{backgroundColor: '#e1e1e1'}} onClick={fecharCaixa}>Cancelar</button>
          </div>
        </div>
      }

      <div className="secao">
        <h3>Amigos</h3>
        <ul className="corpo-secao">
          { amigos.size > 0 ?
            Array.from(amigos).map((amigo) =>
              <li key={amigo} className="linha" onClick={() => abrirChat(amigo, 'fila')}>
                {amigo}
              </li>
            ) : <span>Você não tem conversas.</span>
          }
        </ul>
      </div>

      <div className="secao">
        <h3>Tópicos</h3>
        <ul className="corpo-secao">
          { topicos.size > 0 ?
            Array.from(topicos).map((topico) =>
              <li key={topico} className="linha" onClick={() => abrirChat(topico, 'topico')}>
                {topico}
              </li>
            ) : <span>Você não assinou nenhum tópico.</span>
          }
        </ul>
      </div>

      {mostrarModal &&
        <div className="modal">
          <span>Insira seu nome de usuário:</span>
          <input
            type="text"
            placeholder={'Nome de usuario'}
            onChange={(event) => setUsuario(event.target.value)}
          />
          <button onClick={criarUsuario}>Confirmar</button>
        </div>
      }

      {mostrarChat &&
        <Chat
          destinatario={conversandoCom}
          tipo={tipoChat}
          usuario={usuario}
          mensagens={conversas[conversandoCom]}
          adicionarMensagem={novaMensagem}
          fechar={() => setMostrarChat(false)}
        />
      }
    </div>
  )
}
