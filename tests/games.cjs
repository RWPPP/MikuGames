const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function environment(){
 const elements=new Map(),storage=new Map();
 const ctx=new Proxy({}, {get:(_,name)=>name==='createLinearGradient'||name==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}});
 function el(id){if(!elements.has(id))elements.set(id,{id,value:'normal',hidden:false,disabled:false,open:false,textContent:'',innerHTML:'',style:{},children:[],classList:{add(){},remove(){},toggle(){}},getContext:()=>ctx,getBoundingClientRect:()=>({width:500,height:550,left:0,top:0}),addEventListener(){},setAttribute(){},querySelector:()=>el('nested'),append(){},replaceChildren(){},showModal(){this.open=true},close(){this.open=false},focus(){}});return elements.get(id);}
 const document={getElementById:el,querySelector:()=>el('option'),createElement:()=>el('new'+Math.random())};
 const sandbox={console,document,window:{addEventListener(){}},Image:class{addEventListener(){}},ResizeObserver:class{observe(){}},devicePixelRatio:1,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))},setTimeout:fn=>{sandbox.runTimer=fn;return 1},clearTimeout(){},requestAnimationFrame(){},performance:{now:()=>1000}};
 return {sandbox,el};
}
const env=environment();
let go=fs.readFileSync('web/go.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
go=go.replace(/\}\)\(\);\s*$/, 'globalThis.game={play,pass,reset,score,inspectMove,chooseComputerMove,finish,board,setMode,get current(){return current},get finished(){return finished}};})();');
env.sandbox.CharacterSprites={load:()=>new Promise(()=>{})};vm.runInNewContext(go,env.sandbox);const g=env.sandbox.game;
// Capture an isolated white stone; illegal suicide must leave the board intact.
g.setMode(false);g.board[1][1]=2;g.board[0][1]=g.board[1][0]=g.board[2][1]=1;
assert.equal(g.play(2,1),true);assert.equal(g.board[1][1],0);assert.equal(g.play(1,1),false);
g.reset();g.setMode(true);g.pass();const before=JSON.stringify(g.board);assert.equal(g.chooseComputerMove(),null);assert.equal(JSON.stringify(g.board),before);env.sandbox.runTimer();
assert.equal(g.finished,true);assert.equal(env.el('game-result').open,true);assert.equal(env.el('result-title').textContent,'Вы проиграли');
g.reset();assert.equal(env.el('game-result').open,false);assert.equal(g.finished,false);
g.finish(1,'Тест счёта');assert.equal(env.el('result-title').textContent,'Победа!');g.reset();
// Hard AI takes an available capture and simulations never mutate real position.
env.el('difficulty').value='hard';g.board[1][1]=1;g.board[0][1]=g.board[1][0]=g.board[2][1]=2;
const position=JSON.stringify(g.board),choice=g.chooseComputerMove();assert.equal(choice.x,2);assert.equal(choice.y,1);assert.equal(JSON.stringify(g.board),position);
// Test the actual fixed-step physics with real Matter, using bounded silhouettes.
const mergeEnv=environment(),Matter=require('../web/vendor/matter.min.js');
mergeEnv.sandbox.Matter=Matter;mergeEnv.sandbox.CharacterSprites={load:()=>new Promise(()=>{}),draw(){}};
let merge=fs.readFileSync('web/merge.js','utf8').replace(/\}\)\(\);\s*$/, 'globalThis.game={create,step,reset,unlock,engine,get pieces(){return pieces},get score(){return score},get ended(){return ended},setSprites(s){sprites=s;loading=false}};})();');
vm.runInNewContext(merge,mergeEnv.sandbox);const m=mergeEnv.sandbox.game;
m.setSprites(Array.from({length:9},()=>({hull:[{x:-.8,y:-1},{x:.7,y:-.9},{x:1,y:.5},{x:0,y:1},{x:-1,y:.6}]})));
m.create(0,220,50);m.create(0,225,100);for(let i=0;i<1200;i++)m.step();assert.ok(m.score>0);assert.equal(m.pieces.length,1);
for(let i=0;i<7;i++)m.create(i,100+i*45,80);for(let i=0;i<1800;i++)m.step();
for(const p of m.pieces){assert.ok(Number.isFinite(p.body.position.x));assert.ok(Math.abs(p.body.angle)<=.481);assert.ok(p.body.bounds.max.y<=527);}
m.reset();m.create(8,250,20);m.pieces[0].body.isStatic=true;for(let i=0;i<600;i++)m.step();assert.equal(m.ended,true);
for(let i=0;i<9;i++)m.unlock();assert.equal(mergeEnv.sandbox.localStorage.getItem('merge-stars-secret'),null);m.unlock();assert.equal(mergeEnv.sandbox.localStorage.getItem('merge-stars-secret'),'1');
console.log('PASS: Go capture, suicide, scored loss, modal/reset, hard AI, simulation isolation; merge, stable stack, rotation limit, overflow loss, 10-tap unlock.');
