const WebSocket = require('ws');
const jwt = require('jwt-then');
const enviarNotificacion = require('./utils/notification');

function onSocketPreError(e) {
    console.log(e);
}

function onSocketPostError(e) {
    console.log(e);
}

// Función para verificar y decodificar el token
async function authenticate(token) {
  try {
    // Verificar el token utilizando la clave secreta
    const decodedToken = await jwt.verify(token,process.env.SECRET);

    // Si el token es válido, puedes acceder a los datos decodificados
    const userId = decodedToken.userId;
    // Aquí puedes realizar cualquier otra verificación adicional que necesites

    return true; // Token válido
  } catch (error) {
    // El token no es válido o ha expirado
    return false;
  }
}


function configure(s) {
    const wss = new WebSocket.Server({ noServer: true });

    s.on('upgrade', (req, socket, head) => {
        socket.on('error', onSocketPreError);

        const url = new URL(req.url, `ws://${req.headers.host}`);
        const at = url.searchParams.get('at');

        if (!authenticate(at)) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        wss.handleUpgrade(req, socket, head, (ws) => {
            socket.removeListener('error', onSocketPreError);
            wss.emit('connection', ws, req);
        });
    });

    let esp32Socket = null;
    const webClients = new Set();

    wss.on('connection', (ws, req) => {

    const url = new URL(req.url, `ws://${req.headers.host}`);
    const path = url.pathname;

        if (path === '/esp32') {
            // Cliente ESP32
            esp32Socket = ws;
            
            console.log('New ESP32 connection with token:');
            
            ws.on('message', (mensaje) => {

              const data = JSON.parse(mensaje);
              
              const humidity = data.sensors.humidity;
              const level = data.sensors.distance;

              if (humidity < 50 || humidity > 70 ||level < 30) {
              
              let valorFallo = humidity.toString() + " y " + level.toString();  
              enviarNotificacion("humedad y nivel tienen", valorFallo );
              } else if(humidity < 50 || humidity > 70 ){
                enviarNotificacion("humidity tiene", humidity);
              }else if(level < 30) {
                enviarNotificacion("level tiene", level);
              }
              
              //final verificacion humedad y nivel 
           

              console.log('Mensaje recibido de la ESP32:', data);
              const mensajeJSON = JSON.stringify(data)
              //enviar el mensaje a cada uno de los clientes conectados
              webClients.forEach(client => {
                client.send(mensajeJSON);
              });
              
            });
          
              ws.on('close', () => {
                console.log('Connection closed');
              });
        }
        else {
            // Cliente web
            console.log('New web client connection');
            webClients.add(ws);
            // Resto del código específico para el cliente web
            ws.on('message', (mensaje) => {
              try {
                
                const data = JSON.parse(mensaje);
                console.log(data);
                esp32Socket.send(mensaje);

                } catch (error) {
                  // Error al analizar el mensaje como JSON
                  const errorResponse = {
                    error: 'No se pudo analizar el mensaje como JSON'
                  };
                  ws.send(JSON.stringify(errorResponse));
                }
                });
          
              ws.on('close', () => {
                console.log('Connection closed');
                webClients.delete(ws);
              });
        }
    });
   
}

module.exports = configure;
