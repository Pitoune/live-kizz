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
var TaskTimer = require('tasktimer');

app.use(express.static('public'));
app.engine('.html', ejs.renderFile);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'html');

const questions = [
  {
    query : 'Foo ?',
    choices : [
      {
        text : 'bar'
      },
      {
        text : 'baz'
      }
    ],
    answer: 'bar',
     time: 2,
  },
  {
    query : 'Foo2 ?',
    choices : [
      {
        text : 'bar'
      },
      {
        text : 'baz'
      }
    ],
    answer: 'baz',
    time: 2,
  },
  {
    query : 'Foo3 ?',
    choices : [
      {
        text : 'bar'
      },
      {
        text : 'baz'
      }
    ],
    answer: 'baz',
    time: 2,
  }
];

/**
* Routes
*/
app.get('/', function (req, res) {
  res.render('player');
});

app.get('/admin', function (req, res) {
  res.render('admin');
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

  socket.on('get_questions', function () { socket.emit('questions', questions) });

  socket.on('start', function () {
    var idx = 0;
    var question = questions[idx];
    var time = question.time;
    var timer = new TaskTimer(1000);

    var nextQuestion = function () {
      question = questions[idx];
      time = question.time;
      game.setQuestion(question);
      socket.broadcast.emit('question', question);
      socket.emit('question', idx);
      idx++;
    };

    nextQuestion();

    timer.on('tick', function () {
      if (time >= 0) {
        socket.broadcast.emit('remaining_time', time);
        socket.emit('remaining_time', time);
      }

      if (time === 0) {
        socket.broadcast.emit('answer', question.answer);

        setTimeout(function() {
          if (idx === questions.length) {
            timer.stop();
            game.playerScores();
          } else {
            nextQuestion();
          }
        }, 3000);
      }
      time--;
    });
    timer.start();
  });

  socket.on('receive_answer', function (answer) {
    player.submitAnswer(answer);
  });
});

server.listen(3000);
