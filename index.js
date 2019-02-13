require('dotenv').config();
const io = require('socket.io-client');
const publicKey = process.env.PUBLIC_KEY;
let n = process.env.N;
let connectionsCounter = 0;
let messagesCounter = 0;
let operationsCounter = 0;

if (n === undefined || n < 1 || n > 100) {
  n = 10;
}

if (publicKey) {
  for (let i = 1; i <= n; i++) {
    const id = generateRandomString(32);
    const msg = generateRandomString(10);
    const socket = io.connect('http://socket.tidio.co');

    socket.on('connect', () => {
      if (socket.connected) {
        connectionsCounter++;
        console.log(
          `Connection ${connectionsCounter}/${n} - Socked id: ${socket.id}`
        );
      }
    });

    socket.emit(
      'visitorRegister',
      {
        id: id,
        project_public_key: publicKey
      },
      data => {
        if (data) {
          console.log(`Visitor id: ${id} registered`);
        }
        socket.emit(
          'visitorNewMessage',
          {
            message: msg,
            projectPublicKey: publicKey,
            visitorId: id
          },
          answer => {
            if (answer) {
              messagesCounter++;
              console.log(`Random message was send by user with id: ${id}`);
              operationFinished();
            }
          }
        );
      }
    );
  }
} else {
  console.log('Project Public Key is missing!');
}

function operationFinished() {
  operationsCounter++;
  if (operationsCounter >= n) {
    console.log(
      `The application made ${connectionsCounter} connections and sent ${messagesCounter} messages`
    );
  }
}

function generateRandomString(number) {
  return [...Array(number)].map(() => Math.random().toString(36)[3]).join('');
}
