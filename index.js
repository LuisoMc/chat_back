// Server creation and configuration
const http = require('http');
const app = require('./src/app');
const ChatMessage = require('./src/models/chat-message.model')

// Config .env
require('dotenv').config();

//config db
require('./src/config/db');

// Server creation
const server = http.createServer(app);


const PORT = process.env.PORT || 3000;
server.listen(PORT);

// Listeners
server.on('listening', () => {
    console.log(`Server listening on port ${PORT}`);
});

server.on('error', (error) => {
    console.log(error);
});

//config web socket server
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});

io.on('connection', async (socket) => {
   const arr = await ChatMessage.find().sort({ createdAt: -1 }).limit(5);
    // recuperar los 5 ultimos mensajes de la base de datos
    socket.emit('chat_init', {
        message: 'conexion realizada con exito',
        socketId: socket.id,
        chatMessages: arr

        
    });

    //enviar un mensaje desde el servidor a todos los clientes conectados, menos al que se conecta, informando de la nueva conexion
    socket.broadcast.emit('chat_message_server', {
        username:'INFO',
        message: 'Nuevo usuario conectado'
    });
    
    // emitir el numero de clientes conectados al servidor

    /* io.emit('chat_message_server', {
        username: 'INFO',
        message: `Numero de clientes conectados: ${io.engine.clientsCount}`
    }); */

    io.emit('clients_online', io.engine.clientsCount);

    socket.on('chat_message_client', async (data) => {
        await ChatMessage.create(data);
        io.emit('chat_message_server', data);

    })

    socket.on('disconnect', () => {
        io.emit('chat_message_server', {
            username: 'INFO',
            message: 'Se ha desconectado un usuario'
        });
        io.emit('clients_online', io.engine.clientsCount);
    })
});