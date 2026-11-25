import assert from 'node:assert/strict';

import test from 'node:test';
import { boards, makeBoard, covers, minimumBeacons, solve } from './app.mjs';

test('a beacon covers its own hex and the six nearest open neighbors', () => {
  const { tiles } = makeBoard(2, []);
  const neighbors = tiles.filter(tile => covers({ q: 0, r: 0 }, tile));
  assert.equal(neighbors.length, 7);
  assert.ok(neighbors.every(tile => Math.max(Math.abs(tile.q), Math.abs(tile.r), Math.abs(tile.q + tile.r)) <= 1));
});

test('the cleared center leaves a ring that requires two beacons', () => {
  const board = makeBoard(1, ['0,0']);
  assert.equal(board.tiles.filter(tile => !tile.blocked).length, 6);
  assert.equal(minimumBeacons(board).length, 2);
  assert.equal(solve(board, [], 1), null);
});

test('all levels have a unique legal minimum budget and a full cover', () => {
  for (const preset of boards) {
    const board = makeBoard(preset.radius, preset.rocks);
    const solution = minimumBeacons(board);
    assert.equal(new Set(solution).size, solution.length);
    assert.ok(solution.every(key => board.tiles.find(tile => tile.key === key && !tile.blocked)));
    const selected = solution.map(key => board.tiles.find(tile => tile.key === key));
    assert.ok(board.tiles.every(tile => tile.blocked || selected.some(beacon => covers(beacon, tile))));
    assert.equal(solve(board, [], solution.length - 1), null);
    assert.deepEqual(solve(board, solution, solution.length), solution);
  }
});

test('a rock is excluded from the solution and cannot count as a beacon', () => {
  const board = makeBoard(1, ['0,0']);
  assert.equal(solve(board, ['0,0'], 2), null);
  assert.equal(solve(board, ['1,0', '1,0'], 2), null);
});
