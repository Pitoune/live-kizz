// app.js
var express = require('express');
var app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'),
    fs = require('fs')
    clients = [];

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));

// Connection to MySQL
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'live_kizz'
});


// Load main page player.html
app.get('/', function (req, res) {
    res.render('player');
});

// Load admin page admin.html
app.get('/admin', function (req, res) {
    connection.query('SELECT * from questions', function(err, questions, fields) {

        if (!err) {
            res.render('admin', {
                questions: questions
            });
        }
        else {
            console.log('Error while performing Query.');
        }
    });
});


io.sockets.on('connection', function (socket) {
    clients[socket.id] = socket;

    // Connection to MySQL
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'live_kizz'
    });

    // Save answer in the database
    socket.on('save_answer', function(answer) {
        var sqlAnswer  = {username: socket.id, question_id: answer.question, choice_id: answer.choice};
        
        var query = connection.query('INSERT INTO answers SET ?', sqlAnswer, function(err, result) {
            if (err)
                console.log('Error while performing Query.');

        });
        console.log(query.sql);
    });

    // Send question to the players
    socket.on('send_question', function(question) {        
        connection.query('SELECT * from questions q JOIN choices c ON c.question_id = q.id WHERE q.id = ?', [question], function(err, choices, fields) {

            if (!err) {
                console.log(choices);
                socket.broadcast.emit('question', choices);
            }
            else {
                console.log('Error while performing Query.');
            }
        });
    });

    // Send answer to the players
    socket.on('send_answer', function(question) {   
        connection.query('SELECT * from choices c JOIN questions q ON q.answer_id = c.id WHERE q.id = ?', [question], function(err, choices, fields) {

            if (!err) {
                console.log(choices);
                socket.broadcast.emit('answer', choices);
            }
            else {
                console.log('Error while performing Query.');
            }
        });
    });

    // Send score to the players
    socket.on('send_score', function() {   
        connection.query(
            'SELECT username, SUM( IF( a.choice_id = q.answer_id, 1, 0 ) ) as score '
            + 'FROM  answers a '
            + 'JOIN questions q ON a.question_id = q.id '
            + 'GROUP BY username', 
            [],
            function(err, scores, fields) {
                if (!err) {
                    console.log(scores);
                    for ( var i = 0, l = scores.length; i < l; i++ ) {
                        if (scores[i]['username'] in clients ) {
                            clients[scores[i]['username']].emit('score', scores[i]['score']);
                        }
                    }
                }
                else {
                    console.log('Error while performing Query.');
                }
            }
        );
    });
});

server.listen(9080);