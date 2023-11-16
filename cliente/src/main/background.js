const { ipcMain } = require('electron')
let amqp = require('amqplib/callback_api');

console.log("Inicializando cliente...")

ipcMain.on('enviarMensagem', (event, dados) => {
  amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }

      let dadosParaEnviar = Buffer.from(JSON.stringify(dados))

      if (dados.tipo === "fila") {
        channel.assertQueue(dados.destinatario, {
          durable: false
        });

        channel.sendToQueue(dados.destinatario, dadosParaEnviar);

      } else {
        channel.assertExchange(dados.destinatario, 'fanout', {
          durable: false
        });
        channel.publish(dados.destinatario, '', dadosParaEnviar);
      }
    });

    setTimeout(function() {
      connection.close();
    }, 500);

  })
})

ipcMain.on('consumirMensagens', (event, fila) => {
  const window = require('electron-main-window').getMainWindow();

  console.log('aqui')
  amqp.connect('amqp://localhost', function(error0, connection) {

    if (error0) {
      throw error0;
    }

    connection.createChannel(function(error1, channel) {

      if (error1) {
        throw error1;
      }

      channel.assertQueue(fila, {
        durable: false
      });

      channel.consume(fila, function(msg) {
        let data = JSON.parse(msg.content.toString())
        console.log("Mensagem recebida: ", data);
        window.webContents.send('atualizarMensagens', data)

      }, {
        noAck: true
      });

    });
  });
  event.returnValue = "fila criada"
})

ipcMain.on('consumirTopico', (event, data) => {
  amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }

      channel.assertExchange(data.topico, 'fanout', {
        durable: false
      });

      channel.assertQueue(data.usuario, {
        durable: false,
      })
      console.log(' [*] Waiting for logs. To exit press CTRL+C');

      channel.bindQueue(data.usuario, data.topico, ''); // Toda mensagem no topico vai ser jogada na fila do usuario
    });
  });

  event.returnValue = "fila criada"
})
