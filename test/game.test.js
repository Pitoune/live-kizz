/**
* Dependencies
*/
const test = require('ava');
const Game = require('../lib/game.js');
const Player = require('../lib/player.js');

/**
* Tests
*/
test('add and remove a player', t => {
  const g1 = new Game();
  const p1 = new Player('1');
  p1.join(g1);
  t.is(g1.playerCount(), 1);
  p1.leave();
  t.is(g1.playerCount(), 0);
});

test('answer a question and score a point', t => {
  const g2 = new Game();
  const p2 = new Player('foo');
  g2.setQuestion({
    query: 'Foo ?',
    choices: ['bar', 'baz'],
    answer: 'bar',
  });
  p2.join(g2);
  p2.submitAnswer('baz');
  t.is(p2.score, 0);
  p2.submitAnswer('bar');
  t.is(p2.score, 1);
});
