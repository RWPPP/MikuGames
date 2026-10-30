const assert=require('node:assert/strict'),{Checkers:C,Backgammon:B,matchEffects}=require('../web/arcade-engines.js'),S=require('../web/sand-engine.js');
let c=C.create();assert.equal(c.board.filter(x=>x===1).length,12);assert.equal(C.moves(c).length,7);
c={board:Array(64).fill(0),turn:1,quiet:0};c.board[42]=1;c.board[35]=-1;c.board[21]=-1;let ms=C.moves(c);assert.ok(ms.every(m=>m.killed.length===2));assert.equal(C.apply(c,ms[0]).board.filter(v=>v<0).length,0);
c={board:Array(64).fill(0),turn:1,quiet:0};c.board[17]=1;c.board[10]=-1;c.board[12]=-1;ms=C.moves(c);assert.ok(ms.some(m=>m.killed.length===2&&m.board.some(v=>v===2)),'Promotion during a capture continues as flying king');
for(let round=0;round<3;round++){c=C.create();for(let n=0;n<120;n++){const moves=C.moves(c);if(!moves.length)break;const m=C.choose(c,'normal');assert.ok(m);assert.ok(m.path.every(i=>i>=0&&i<64));c=C.apply(c,m);}}
let b=B.create();for(const p of [1,-1])assert.equal(b.points.reduce((n,v)=>n+(v*p>0?Math.abs(v):0),0),15);
b.bar[1]=1;b.points[23]--;assert.ok(B.choices(b,[1,6]).every(m=>m.from===-1));
b={points:Array(24).fill(0),bar:{1:0,'-1':0},off:{1:14,'-1':14},turn:1};b.points[0]=1;b.points[23]=-1;assert.equal(B.choices(b,[2,6])[0].die,6);assert.equal(B.apply(b,B.choices(b,[2,6])[0]).off[1],15);
b=B.create();let ended=false;for(let n=0;n<1600;n++){const d1=1+Math.floor(Math.random()*6),d2=1+Math.floor(Math.random()*6),dice=d1===d2?[d1,d1,d1,d1]:[d1,d2],seq=B.choose(b,dice,'normal');for(const m of seq){assert.ok(B.single(b,m.die).some(x=>x.from===m.from&&x.to===m.to));b=B.apply(b,m);}for(const p of [1,-1])assert.equal(b.points.reduce((n,v)=>n+(v*p>0?Math.abs(v):0),0)+b.bar[p]+b.off[p],15);if(b.off[b.turn]===15){ended=true;break;}b.turn=-b.turn;}assert.ok(ended,'Computer can complete a full backgammon match');
const grid=()=>Array.from({length:8},(_,r)=>Array.from({length:8},(_,c)=>({type:(r*2+c)%6})));
let board=grid();for(let i=0;i<5;i++)board[3][i].type=9;let fx=matchEffects(board,()=>1);assert.equal(fx.lines.size,8);assert.ok([...fx.lines].every(k=>k.startsWith('3,')));
board=grid();for(let i=0;i<4;i++)board[i][2].type=9;fx=matchEffects(board,()=>1);assert.equal(fx.fours.size,4);assert.equal(fx.lines.size,0);
board=grid();for(const r of [6,7])for(const c of [6,7])board[r][c].type=9;fx=matchEffects(board,()=>0);assert.equal(fx.blasts.size,16);assert.ok(fx.blasts.has('7,7'));assert.ok(fx.blasts.has('4,4'));assert.equal(matchEffects(board,()=>1).blasts.size,0);
const s=S.create();S.spawn(s,{shape:0,color:1});while(S.move(s,0,1)){}assert.equal(s.grid.filter(Boolean).length,64);for(let i=0;i<100;i++)S.settle(s);assert.equal(s.grid.filter(Boolean).length,64);
const line=S.create();for(let x=0;x<60;x++)line.grid[99*60+x]=2;assert.equal(S.clear(line),60);assert.equal(line.score,60);const split=S.create();for(let x=0;x<60;x++)split.grid[99*60+x]=x<30?1:2;assert.equal(S.clear(split),0);
console.log('PASS: checkers capture chains/promotion, full backgammon game/bar/bearing/dice, 4/5/square combinations, sand conservation and color-spanning clears.');
