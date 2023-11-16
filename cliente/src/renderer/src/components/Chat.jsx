import React from 'react'

import "./Chat.css";

export default function Chat({tipo, usuario, destinatario, mensagens, adicionarMensagem, fechar}) {
  const [mensagem, setMensagem] = React.useState("");
  let idMensagem = 0;

  function enviarMensagem(e) {
    e.preventDefault()

    if (mensagem.length === 0) return

    const data = {
      "tipo": tipo,
      "destinatario": destinatario,
      "nome": usuario,
      "mensagem": mensagem
    }

    window.api.send('enviarMensagem', data)
    adicionarMensagem(destinatario, data)
    setMensagem('');
  }

  return (
    <div className="chat-modal">
      <div className="header">
        <h3>Conversando com: {destinatario}</h3>
        <button
          className="voltar"
          onClick={fechar}
        >
          Voltar
        </button>
      </div>


      <div className="chat">
        <ul className="mensagem-container">
          {
            mensagens.map((mensagem) => {
              return (
                mensagem.nome !== usuario ?
                <li key={idMensagem++} className="mensagem mensagem-amigo">
                  {mensagem.mensagem}
                </li>
                  :
                <li key={idMensagem++} className="mensagem mensagem-eu">
                  {mensagem.mensagem}
                </li>
              )
            })
          }
          <div id="ancora"></div>
        </ul>
      </div>

      <form className="acoes" onSubmit={enviarMensagem}>
        <input
          type="text"
          placeholder={'Mensagem'}
          value={mensagem}
          onChange={(event) => setMensagem(event.target.value)}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  )
}
