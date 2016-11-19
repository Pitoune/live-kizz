/**
* Dependencies
*/

const Immutable = require('immutable');
const EventEmitter = require('events');

/**
* Game logic
*/
class Game extends EventEmitter {
  constructor() {
    super();
    this.started = false;
    this.question = null;
    this.players = Immutable.Map();
  }
  addPlayer(player) {
    this.players = this.players.set(player.id, player);
    this.emit('new_player', player);
    return this;
  }
  removePlayer(player) {
    this.players = this.players.delete(player.id);
    this.emit('leave_player', player);
    return this;
  }
  playerCount() {
    return this.players.count();
  }
  setQuestion(question) {
    this.question = question;
  }
  isCorrectAnswer(answer) {
    return this.question.answer === answer;
  }
  playerScores() {
    this.players.forEach(function (player) {
      player.getScore();
    });
  }
}

module.exports = Game;
