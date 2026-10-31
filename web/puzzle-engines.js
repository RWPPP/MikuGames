(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PuzzleEngines=api;})(typeof window==='object'?window:globalThis,()=>{
'use strict';
const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function result(board){for(const line of lines)if(board[line[0]]&&line.every(i=>board[i]===board[line[0]]))return {winner:board[line[0]],line};return board.every(Boolean)?{winner:'draw',line:[]}:null;}
function choose(board,player,difficulty='hard',random=Math.random){
 const moves=board.map((v,i)=>v?-1:i).filter(i=>i>=0);if(result(board)||!moves.length)return null;
 if(difficulty==='easy'||difficulty==='normal'&&random()<.3)return moves[Math.floor(random()*moves.length)];
 const other=player==='X'?'O':'X';
 function score(b,turn,depth){const end=result(b);if(end)return end.winner==='draw'?0:end.winner===player?10-depth:depth-10;
  const scores=b.map((v,i)=>{if(v)return null;const next=b.slice();next[i]=turn;return score(next,turn===player?other:player,depth+1);}).filter(v=>v!==null);
  return turn===player?Math.max(...scores):Math.min(...scores);
 }
 let best=-Infinity,candidates=[];for(const move of moves){const b=board.slice();b[move]=player;const value=score(b,other,1);if(value>best){best=value;candidates=[move];}else if(value===best)candidates.push(move);}
 return candidates[Math.floor(random()*candidates.length)];
}
const peers=Array.from({length:81},(_,i)=>Array.from({length:81},(_,j)=>j).filter(j=>i!==j&&(Math.floor(i/9)===Math.floor(j/9)||i%9===j%9||Math.floor(i/27)===Math.floor(j/27)&&Math.floor(i%9/3)===Math.floor(j%9/3))));
function candidates(board,i){return [1,2,3,4,5,6,7,8,9].filter(n=>!peers[i].some(j=>board[j]===n));}
function solutions(input,limit=2){const board=input.slice();if(board.length!==81||board.some((v,i)=>!Number.isInteger(v)||v<0||v>9||v&&peers[i].some(j=>board[j]===v)))return 0;
 function search(){let chosen=-1,options;for(let i=0;i<81;i++)if(!board[i]){const nums=candidates(board,i);if(!nums.length)return 0;if(!options||nums.length<options.length){chosen=i;options=nums;if(nums.length===1)break;}}
  if(chosen<0)return 1;let count=0;for(const n of options){board[chosen]=n;count+=search();board[chosen]=0;if(count>=limit)return limit;}return count;
 }return search();
}
function shuffled(values,random){const a=values.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function sudoku(difficulty='normal',random=Math.random){
 const groups=()=>shuffled([0,1,2],random).flatMap(g=>shuffled([0,1,2],random).map(v=>g*3+v));
 const rows=groups(),cols=groups(),digits=shuffled([1,2,3,4,5,6,7,8,9],random);
 const solution=rows.flatMap(r=>cols.map(c=>digits[(r*3+Math.floor(r/3)+c)%9])),puzzle=solution.slice(),target={easy:42,normal:34,hard:28}[difficulty]||34;
 let clues=81;for(const i of shuffled(Array.from({length:81},(_,i)=>i),random)){if(clues<=target)break;const value=puzzle[i];puzzle[i]=0;if(solutions(puzzle)!==1)puzzle[i]=value;else clues--;}
 return {puzzle,solution};
}
return {result,choose,peers,candidates,solutions,sudoku};
});
