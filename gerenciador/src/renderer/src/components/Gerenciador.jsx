import { useState } from 'react'
import "./Gerenciador.css";

export default function Gerenciador() {
  const QUEUE_URL = "http://localhost:15672/api/queues"
  const TOPIC_URL = "http://localhost:15672/api/exchanges"
  const AUTH = {auth: {'username': 'guest', 'password': 'guest'}}

  const [filas, setFilas] = useState([]);
  const [topicos, setTopicos] = useState([]);

  function criar() {
    const data = {"tipo": tipo, "nome": nome}
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
    const data = {"tipo": tipo, "nome": nome}
    window.api.send('remover', data)

    if (tipo === 'fila') {
      setFilas((filas) => filas.filter((fila) => fila.nome !== data.nome))
    } else {
      setTopicos((topicos) => topicos.filter((topico) => topico.nome !== data.nome))
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
            <button style={{backgroundColor: '#66E762'}} onClick={criar}>Criar</button>
            <button style={{backgroundColor: '#d3163f'}} onClick={() => setMostrarModal(false)}>Cancelar</button>
          </div>
        </div>
      }

      <div className="secao">
        <h3>Filas</h3>
        <ul className="corpo-secao">
          { filas.length > 0 ?
            filas.map((fila) =>
              <li className="linha">
                {fila.nome} <button onClick={() => remover('fila', fila.nome)}>Apagar fila</button>
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
              <li className="linha">{topico.nome} <button onClick={() => remover('topico', topico.nome)}>Apagar tópico</button></li>
            ) : <span>Você não tem tópicos.</span>
          }
        </ul>
      </div>
    </div>
  )
}
