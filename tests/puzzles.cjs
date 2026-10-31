const assert=require('node:assert/strict'),E=require('../web/puzzle-engines.js');
assert.equal(E.result(['X','X','X',null,null,null,null,null,null]).winner,'X');assert.equal(E.result(['X','O','X','X','O','O','O','X','X']).winner,'draw');
assert.equal(E.choose(['O','O',null,'X','X',null,null,null,null],'O','hard',()=>0),2);
assert.equal(E.choose(['X','X',null,null,'O',null,null,null,null],'O','hard',()=>0),2);
let paths=0;function play(board,turn,human){const end=E.result(board);if(end){assert.notEqual(end.winner,human,'Hard AI must never lose');paths++;return;}if(turn===human){board.forEach((v,i)=>{if(!v){const next=board.slice();next[i]=turn;play(next,turn==='X'?'O':'X',human);}});}else{const next=board.slice();const i=E.choose(board,turn,'hard',()=>0);assert.equal(next[i],null);next[i]=turn;play(next,human,human);}}
play(Array(9).fill(null),'X','X');play(Array(9).fill(null),'X','O');
let seed=13;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
for(const difficulty of ['easy','normal','hard'])for(let i=0;i<8;i++){const {puzzle,solution}=E.sudoku(difficulty,random);assert.equal(E.solutions(puzzle),1);assert.equal(E.solutions(solution),1);assert.ok(puzzle.some(n=>!n));assert.ok(puzzle.every((n,j)=>!n||n===solution[j]));assert.ok(puzzle.filter(Boolean).length>=({easy:42,normal:34,hard:28}[difficulty]));}
assert.equal(E.solutions(Array(81).fill(1)),0);assert.equal(E.solutions(Array(81).fill(0)),2);assert.equal(E.peers[40].length,20);
console.log(`PASS: all ${paths} human continuations against hard AI, win/block/draw, 24 uniquely solvable Sudoku puzzles, invalid grids and peers.`);
