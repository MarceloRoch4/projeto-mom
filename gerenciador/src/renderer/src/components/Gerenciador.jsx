import {useEffect, useState} from 'react'
import "./Gerenciador.css";

export default function Gerenciador() {
  let idLinha = 0;
  const QUEUE_URL = "http://localhost:15672/api/queues"
  const TOPIC_URL = "http://localhost:15672/api/exchanges"
  const FETCH_INIT = {
    method: 'get',
    headers: {
      "Content-Type": "text/plain",
      'Authorization': 'Basic ' + btoa('guest:guest'),
    }
  }

  const topicosPadroesRabbitMQ = [
    "",
    "amq.direct",
    "amq.fanout",
    "amq.headers",
    "amq.match",
    "amq.rabbitmq.trace",
    "amq.topic"
  ]

  useEffect(() => {
    (() => buscarFilasETopicos())()
  }, []);

  const [filas, setFilas] = useState([]);
  const [topicos, setTopicos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  async function buscarFilasETopicos() {
    setCarregando(true);

    setTimeout(async () => {
      const filas = await fetch(QUEUE_URL, FETCH_INIT).then(res => res.json());
      const topicos = await fetch(TOPIC_URL, FETCH_INIT).then(res => res.json()).then(
        topicos => topicos.filter(topico => !topicosPadroesRabbitMQ.includes(topico.name)) // Desconsidera topicos padroes do RabbitMQ
      );

      console.log(filas)

      setFilas(filas);
      setTopicos(topicos);
      setCarregando(false);
    }, 500);
  }

  function criar() {
    const data = {"tipo": tipo, "name": nome}
    window.api.send('criar', data)
    setMostrarModal(false);

    if (tipo === 'fila') {
      setFilas((filas) => [...filas, data])
    } else {
      setTopicos((filas) => [...filas, data])
    }
  }

  function criarNovo(tipo) {
    setTipo(tipo);
    setMostrarModal(true);
  }

  function remover(tipo, nome) {
    const data = {"tipo": tipo, "name": nome}
    window.api.send('remover', data)

    if (tipo === 'fila') {
      setFilas((filas) => filas.filter((fila) => fila.name !== data.name))
    } else {
      setTopicos((topicos) => topicos.filter((topico) => topico.name !== data.name))
    }
  }

  const [tipo, setTipo] = useState("fila");
  const [nome, setNome] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <div className="outter">
      <div className="menu">
        <button
          onClick={() => criarNovo("fila")}
        >
          Criar fila
        </button>
        <button
          onClick={() => criarNovo("topico")}
        >
          Criar tópico
        </button>
        <button
          onClick={buscarFilasETopicos}
        >
          Atualizar filas e tópicos
        </button>
      </div>

      {
        mostrarModal &&
        <div className="modal">
          <input
            type="text"
            placeholder={`Nome ${tipo === 'fila' ? 'da' : 'do'} ${tipo}`}
            onChange={(event) => setNome(event.target.value)}
          />
          <div className="acoes-modal">
            <button style={{backgroundColor: '#61c75d'}} onClick={criar}>Criar</button>
            <button style={{backgroundColor: '#e1e1e1'}} onClick={() => setMostrarModal(false)}>Cancelar</button>
          </div>
        </div>
      }

      {carregando && <h3>ATUALIZANDO FILAS E TOPICOS...</h3>}

      <div className="secao">
        <h3>Filas</h3>
        <ul className="corpo-secao">
          { filas.length > 0 ?
            filas.map((fila) =>
              <li key={idLinha++} className="linha">
                {fila.name}
                <div className="linha-info">
                  {fila.messages !== undefined && <span>{fila.messages} {fila.messages === 1 ? 'mensagem' : 'mensagens'}</span>}
                  <button onClick={() => remover('fila', fila.name)}>Apagar fila</button>
                </div>
              </li>
            ) : <span>Você não tem filas.</span>
          }
        </ul>
      </div>

      <div className="secao">
        <h3>Tópicos</h3>
        <ul className="corpo-secao">
          { topicos.length > 0 ?
            topicos.map((topico) =>
              <li key={idLinha++} className="linha">{topico.name} <button onClick={() => remover('topico', topico.name)}>Apagar tópico</button></li>
            ) : <span>Você não tem tópicos.</span>
          }
        </ul>
      </div>
    </div>
  )
}
