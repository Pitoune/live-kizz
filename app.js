// app.js

var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'),
    fs = require('fs');

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');


// Connection to MySQL
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'live_kizz'
});


// Load main page question.html
app.get('/', function (req, res) {
    res.render('question');
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
    var address = socket.handshake.address;

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
        var sqlAnswer  = {username: address, question_id: answer.question, choice_id: answer.choice};
        
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
                socket.broadcast.emit('message', choices);
            }
            else {
                console.log('Error while performing Query.');
            }
        });
    });
});

server.listen(9080);