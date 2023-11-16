const { ipcMain } = require('electron')
let amqp = require('amqplib/callback_api');

ipcMain.on('criar', (event, data) => {
  let qtt = 0

  amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
      console.log("Erro ao conectar com broker");

    } else {
      console.log("Conectado");

      connection.createChannel(function(error1, channel) {
        if (error1) {
          throw error1;
        }

        let qtt = 0

        if(data.tipo === "fila") { // Cria fila
          channel.assertQueue(data.nome, {durable: false}, function (arr, ok) {
            console.log(ok);
            qtt = ok["messageCount"]
          });
        } else { // Cria tópico
          channel.assertExchange(data.nome, 'fanout', { // Fanout é o broadcast no RabbitMQ
            durable: false
          });
        }

      });
    }

  })

  event.returnValue = qtt
});

ipcMain.on('remover', (event, data) => {

  amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
      console.log("Erro ao conectar com broker");
    }

    connection.on( 'error', function(err) {
      //do something
      console.log('An error occurred' + err);
    });

    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }

      if(data.tipo === "fila") {
        channel.deleteQueue(data.nome)

      } else {
        channel.deleteExchange(data.nome)
      }
    });
  });


  event.returnValue = 'fila deletada!'
});
