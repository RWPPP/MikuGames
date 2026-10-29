const assert=require('node:assert/strict'),E=require('../web/trap-engine.js');
function random(seed){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
for(let cell=0;cell<E.ROWS*E.COLS;cell++)for(const next of E.neighbours(cell))assert.ok(E.neighbours(next).includes(cell),'Hex adjacency must be symmetric');
assert.equal(E.neighbours(E.id(4,5)).length,6);assert.equal(E.neighbours(E.id(0,0)).length,2);
for(const level of Object.keys(E.CONFIG))for(let seed=1;seed<=50;seed++){
 const state=E.create(level,random(seed));assert.equal(state.blocked.size,E.CONFIG[level].blocks);assert.ok(Number.isFinite(E.distances(state.blocked)[state.miku]));assert.ok(!state.blocked.has(state.miku));
 const old=state.miku,blocked=state.blocked.values().next().value;assert.equal(E.turn(state,blocked),null);assert.equal(E.turn(state,old),null);assert.equal(state.moves,0);
 const free=Array.from({length:99},(_,i)=>i).find(i=>i!==old&&!state.blocked.has(i));const result=E.turn(state,free,random(seed+1));assert.ok(result);assert.equal(state.moves,1);assert.ok(state.blocked.has(free));assert.ok(state.miku===old||E.neighbours(old).includes(state.miku));assert.ok(!state.blocked.has(state.miku));
}
// Close a six-cell ring. Miku cannot jump over the fence.
const trapped=E.create('normal');trapped.blocked=new Set(E.neighbours(trapped.miku));const gap=trapped.blocked.values().next().value;trapped.blocked.delete(gap);const win=E.turn(trapped,gap);assert.equal(win.status,'won');const moves=trapped.moves;assert.equal(E.turn(trapped,0),null);assert.equal(trapped.moves,moves);
// Leave exactly one path to an edge. Stepping onto the edge is a real loss.
const escape={difficulty:'hard',miku:E.id(1,5),moves:0,status:'playing',blocked:new Set(Array.from({length:99},(_,i)=>i))};escape.blocked.delete(escape.miku);escape.blocked.delete(E.id(0,5));escape.blocked.delete(E.id(8,8));assert.equal(E.turn(escape,E.id(8,8)).status,'lost');assert.ok(E.edge(escape.miku));
// The hard search evaluates possible fences without altering the real board.
const hard=E.create('hard',random(42)),before=[...hard.blocked].sort().join(',');const start=performance.now(),choice=E.bestMove(hard,random(5));assert.equal([...hard.blocked].sort().join(','),before);assert.ok(E.neighbours(hard.miku).includes(choice));assert.ok(performance.now()-start<1500);
// Medium always takes a shortest available route, regardless of RNG.
const medium=E.create('normal',random(123));const distances=E.distances(medium.blocked);assert.equal(distances[E.bestMove(medium,random(3))],Math.min(...E.neighbours(medium.miku).filter(n=>!medium.blocked.has(n)).map(n=>distances[n])));
console.log('PASS: hex adjacency, 150 open starts, three difficulties, legal moves, one-cell hops, trapping, edge escape, shortest path and hard-search isolation.');
