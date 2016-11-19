/**
* Dependencies
*/
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const ejs = require('ejs');

/**
* Privates
*/
const app = express();
const server = http.createServer(app);
const io = socketIO.listen(server);

app.use(express.static('public'));
app.engine('.html', ejs.renderFile);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'html');

const questions = [
  {
    query: 'Foo ?',
    choices: ['bar', 'baz'],
    answer: 'bar',
  },
  {
    query: 'Foo ?',
    choices: ['bar', 'baz'],
    answer: 'bar',
  },
];

/**
* Routes
*/
app.get('/', function (req, res) {
  res.render('player');
});

app.get('/admin', function (req, res) {
  res.render('admin', { questions: questions });
});

/**
* App
*/
const Game = require('./lib/game.js');
const Player = require('./lib/player.js');

const game = new Game();
game.on('new_player', function (player) { console.log('New player', player.id) });
game.on('leave_player', function (player) { console.log('Player left', player.id) });

io.sockets.on('connection', function (socket) {
  const player = new Player(socket);
  player.join(game);

  socket.on('disconnect', function () { player.leave() });

  socket.on('send_question', function (idx) {
    const question = questions[idx];
    game.setQuestion(question);
    socket.broadcast.emit('question', question);
  });

  socket.on('receive_answer', function (answer) {
    player.submitAnswer(answer);
  });

  socket.on('send_answer', function (idx) {
      socket.broadcast.emit('answer', questions[idx].answer);
  });

  socket.on('send_score', function () { game.playerScores() });
});

server.listen(9080);
