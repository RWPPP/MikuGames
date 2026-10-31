(()=>{'use strict';
const $=id=>document.getElementById(id),E=PuzzleEngines,cells=[],totals={X:0,O:0,draw:0};
let board,turn,ended,timer,round=0;const name=p=>p==='X'?'Мику':'Тето',sound=k=>window.GameSound?.play(k);
function isAI(){return $('mode').value==='computer'&&turn!==$('side').value;}
function draw(){const end=E.result(board);cells.forEach((cell,i)=>{cell.textContent=board[i]==='X'?'×':board[i]==='O'?'○':'';cell.dataset.mark=board[i]||'';cell.classList.toggle('win',!!end?.line.includes(i));cell.disabled=ended||!!board[i]||isAI();cell.setAttribute('aria-label',`Строка ${Math.floor(i/3)+1}, столбец ${i%3+1}: ${board[i]?name(board[i]):'пусто'}`);});
 $('status').textContent=ended?(end.winner==='draw'?'Ничья — сыграем ещё?':`Победила ${name(end.winner)}!`):`${name(turn)} · ${turn==='X'?'крестики':'нолики'}${isAI()?' · компьютер думает…':''}`;
 $('score-x').textContent=totals.X;$('score-o').textContent=totals.O;$('score-draw').textContent=totals.draw;
 $('difficulty').disabled=$('mode').value==='two';$('side').disabled=$('mode').value==='two';
}
function move(i){if(ended||board[i])return;board[i]=turn;sound('place');const end=E.result(board);if(end){ended=true;totals[end.winner]++;draw();sound(end.winner==='draw'?'pass':$('mode').value==='computer'&&end.winner!==$('side').value?'loss':'win');$('result-text').textContent=$('status').textContent;$('result').showModal();return;}
 turn=turn==='X'?'O':'X';draw();computer();
}
function computer(){if(!isAI()||ended)return;const id=round;timer=setTimeout(()=>{if(id!==round||ended||!isAI())return;const i=E.choose(board,turn,$('difficulty').value);if(i!==null)move(i);},350);}
function reset(){clearTimeout(timer);round++;board=Array(9).fill(null);turn='X';ended=false;if($('result').open)$('result').close();draw();computer();}
for(let i=0;i<9;i++){const cell=document.createElement('button');cell.type='button';cell.className='ttt-cell';cell.onclick=()=>{if(!isAI())move(i);};cell.onkeydown=e=>{const delta={ArrowRight:1,ArrowLeft:-1,ArrowDown:3,ArrowUp:-3}[e.key];if(delta){e.preventDefault();const target=cells[(i+delta+9)%9];if(!target.disabled)target.focus();}};$('ttt-board').append(cell);cells.push(cell);}
for(const id of ['mode','side','difficulty'])$(id).onchange=reset;$('restart').onclick=$('again').onclick=reset;$('close-result').onclick=()=>$('result').close();reset();
})();
