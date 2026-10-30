const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();function el(id){if(!elements.has(id))elements.set(id,{dataset:{},style:{},children:[],value:'',classList:{add(){},remove(){}},setAttribute(k,v){this[k]=v;},getContext:()=>({setTransform(){}}),getBoundingClientRect:()=>({width:500,height:550}),addEventListener(){},append(child){this.children.push(child);},replaceChildren(){this.children=[];},querySelector(){return el(id+'-img');}});return elements.get(id);}
let creation=0,resolveOld;const old=new Promise(resolve=>{resolveOld=resolve;});
const sprite={url:'blob:test',hull:[{x:-1,y:-1},{x:1,y:1}]};
const sandbox={console,Matter:require('../web/vendor/matter.min.js'),document:{getElementById:el,createElement:()=>el('button'+creation++),querySelector:()=>el('option')},window:{addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},devicePixelRatio:1,ResizeObserver:class{observe(){}},requestAnimationFrame(){},setTimeout(){},clearTimeout(){},CharacterSprites:{load:()=>old}};
const code=fs.readFileSync('web/merge.js','utf8').replace(/\}\)\(\);\s*$/,'globalThis.game={loadStyle,get loading(){return loading},get sprites(){return sprites}};})();');
vm.runInNewContext(code,sandbox);
(async()=>{
 assert.equal(el('arena').dataset.state,'loading');assert.equal(el('arena')['aria-busy'],'true');
 sandbox.CharacterSprites.load=()=>Promise.reject(new Error('network offline'));await sandbox.game.loadStyle();
 assert.equal(el('arena').dataset.state,'error');assert.equal(el('arena')['aria-busy'],'false');assert.match(el('load-status').textContent,/повторить/);
 sandbox.CharacterSprites.load=()=>Promise.resolve(sprite);el('restart').onclick();await new Promise(setImmediate);
 assert.equal(el('arena').dataset.state,'ready');assert.equal(sandbox.game.loading,false);assert.match(el('load-status').textContent,/бросить/);
 resolveOld({...sprite,url:'blob:stale'});await new Promise(setImmediate);
 assert.equal(sandbox.game.sprites[0].url,'blob:test','Stale style completion cannot overwrite the successful retry');
 console.log('PASS: visible loading/error states, retry from restart, successful recovery, stale load isolation.');
})().catch(e=>{console.error(e);process.exitCode=1;});
