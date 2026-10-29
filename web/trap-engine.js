/* Odd-row hex grid. Rules are separate from animation and browser state. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.TrapMiku=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const COLS=11,ROWS=9,CONFIG={easy:{blocks:24,mistake:.35},normal:{blocks:15,mistake:0},hard:{blocks:8,mistake:0}};
  const id=(r,c)=>r*COLS+c,position=i=>({r:Math.floor(i/COLS),c:i%COLS});
  function neighbours(i){const {r,c}=position(i),shift=r%2?1:-1;return [[r,c-1],[r,c+1],[r-1,c],[r-1,c+shift],[r+1,c],[r+1,c+shift]].filter(([y,x])=>y>=0&&y<ROWS&&x>=0&&x<COLS).map(([y,x])=>id(y,x));}
  function edge(i){const {r,c}=position(i);return r===0||r===ROWS-1||c===0||c===COLS-1;}
  function distances(blocked){const d=Array(ROWS*COLS).fill(Infinity),queue=[];for(let i=0;i<d.length;i++)if(edge(i)&&!blocked.has(i)){d[i]=0;queue.push(i);}for(let k=0;k<queue.length;k++)for(const n of neighbours(queue[k]))if(!blocked.has(n)&&d[n]===Infinity){d[n]=d[queue[k]]+1;queue.push(n);}return d;}
  function bestMove(state,random=Math.random){const options=neighbours(state.miku).filter(n=>!state.blocked.has(n));if(!options.length)return null;const d=distances(state.blocked),reachable=options.filter(n=>Number.isFinite(d[n]));if(!reachable.length)return null;
    if(state.difficulty==='easy'&&random()<CONFIG.easy.mistake)return reachable[Math.min(reachable.length-1,Math.floor(random()*reachable.length))];
    let rated=reachable.map(n=>({n,d:d[n],worst:d[n],routes:neighbours(n).filter(x=>!state.blocked.has(x)&&d[x]<d[n]).length}));
    if(state.difficulty==='hard')for(const candidate of rated){if(edge(candidate.n)){candidate.worst=-1;continue;}let worst=0;for(let cell=0;cell<ROWS*COLS;cell++){if(cell===candidate.n||state.blocked.has(cell))continue;state.blocked.add(cell);const distance=distances(state.blocked)[candidate.n];state.blocked.delete(cell);worst=Math.max(worst,distance);}candidate.worst=worst;}
    rated.sort((a,b)=>(state.difficulty==='hard'?a.worst-b.worst:0)||a.d-b.d||b.routes-a.routes);
    const first=rated[0],ties=rated.filter(x=>x.d===first.d&&(state.difficulty!=='hard'||x.worst===first.worst)&&x.routes===first.routes);return ties[Math.min(ties.length-1,Math.floor(random()*ties.length))].n;
  }
  function create(difficulty='normal',random=Math.random){if(!CONFIG[difficulty])difficulty='normal';const miku=id(4,5);let blocked;
    for(let attempt=0;attempt<100;attempt++){const candidates=Array.from({length:ROWS*COLS},(_,i)=>i).filter(i=>i!==miku&&!neighbours(miku).includes(i));for(let i=candidates.length-1;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}blocked=new Set(candidates.slice(0,CONFIG[difficulty].blocks));if(Number.isFinite(distances(blocked)[miku]))break;}
    // Even an unusual RNG cannot create a round that is already won.
    if(!Number.isFinite(distances(blocked)[miku]))for(let r=0;r<=4;r++)blocked.delete(id(r,5));
    return {difficulty,blocked,miku,moves:0,status:'playing'};
  }
  function turn(state,cell,random=Math.random){if(state.status!=='playing'||!Number.isInteger(cell)||cell<0||cell>=ROWS*COLS||cell===state.miku||state.blocked.has(cell))return null;
    state.blocked.add(cell);state.moves++;const from=state.miku;
    if(!Number.isFinite(distances(state.blocked)[from])){state.status='won';return {from,to:from,status:state.status};}
    const next=bestMove(state,random);if(next===null){state.status='won';return {from,to:from,status:state.status};}
    state.miku=next;if(edge(next))state.status='lost';return {from,to:next,status:state.status};
  }
  return {COLS,ROWS,CONFIG,id,position,neighbours,edge,distances,bestMove,create,turn};
});
