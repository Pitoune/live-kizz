/**
* Dependencies
*/

const EventEmitter = require('events');

/**
* Player logic
*/
class Player extends EventEmitter {
  constructor(socket) {
    super();
    this.id = socket.id;
    this.socket = socket;
    this.game = null;
    this.score = 0;
  }
  submitAnswer(answer) {
    if (this.game.isCorrectAnswer(answer)) {
      this.score ++;
    }
  }
  getScore() {
      this.socket.emit('score', this.score);
  }
  join(game) {
    this.game = game.addPlayer(this);
  }
  leave() {
    this.game.removePlayer(this);
  }
}

module.exports = Player;
