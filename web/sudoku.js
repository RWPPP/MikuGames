(()=>{'use strict';
const $=id=>document.getElementById(id),E=PuzzleEngines,cells=[],keys=[],storage='miku-sudoku-v1';
let state,selected=0,pencil=false,paused=false,tool=null;const sound=k=>window.GameSound?.play(k);
function save(){try{localStorage.setItem(storage,JSON.stringify(state));}catch{}}
function restore(){try{const s=JSON.parse(localStorage.getItem(storage));if(!s||!['easy','normal','hard'].includes(s.difficulty)||!Array.isArray(s.solution)||s.solution.some(n=>!Number.isInteger(n)||n<1||n>9)||E.solutions(s.solution)!==1)return false;
 if(!['values','fixed','notes'].every(k=>Array.isArray(s[k])&&s[k].length===81)||s.values.some((n,i)=>!Number.isInteger(n)||n<0||n>9||s.fixed[i]&&n!==s.solution[i])||s.fixed.some(v=>typeof v!=='boolean')||s.notes.some(n=>!Number.isInteger(n)||n<0||n>511)||!Number.isFinite(s.seconds)||s.seconds<0||!Number.isInteger(s.hints)||s.hints<0||s.hints>3)return false;
 state=s;state.ended=s.values.every((n,i)=>n===s.solution[i]);state.mistakes=Number.isInteger(s.mistakes)&&s.mistakes>=0?s.mistakes:0;return true;
 }catch{return false;}}
function format(n){return `${Math.floor(n/60).toString().padStart(2,'0')}:${(n%60).toString().padStart(2,'0')}`;}
function render(){
 const value=tool>0?tool:state.values[selected];cells.forEach((cell,i)=>{const v=state.values[i];cell.replaceChildren();if(v)cell.textContent=v;else if(state.notes[i]){const grid=document.createElement('span');grid.className='notes';for(let n=1;n<=9;n++){const digit=document.createElement('span');digit.textContent=state.notes[i]&(1<<(n-1))?n:'';grid.append(digit);}cell.append(grid);}
 cell.className='sudoku-cell'+(state.fixed[i]?' fixed':'')+(i===selected?' selected':'')+(E.peers[selected].includes(i)?' peer':'')+(value&&v===value?' same':'')+(v&&v!==state.solution[i]?' wrong':'');
 cell.setAttribute('aria-label',`Строка ${Math.floor(i/9)+1}, столбец ${i%9+1}: ${v||'пусто'}${state.fixed[i]?', заданная цифра':''}`);cell.setAttribute('aria-pressed',String(i===selected));cell.tabIndex=i===selected?0:-1;});
 const filled=state.values.filter((n,i)=>n===state.solution[i]).length;
 $('progress').textContent=`${filled} / 81`;$('mistakes').textContent=state.mistakes;$('time').textContent=format(state.seconds);
 $('status').textContent=state.ended?'Судоку решено! Отличная работа.':paused?'Пауза. Нажми «Продолжить», чтобы вернуться.':tool===0?'Ластик выбран: нажми на клетку, чтобы стереть.':tool===null?'Сначала выбери цифру, затем нажми на клетку.':`${pencil?'Заметки':'Выбрана цифра'}: ${tool}. Нажми на клетку.`;
 $('pencil').setAttribute('aria-pressed',String(pencil));$('pencil').classList.toggle('active',pencil);$('pause').textContent=paused?'Продолжить':'Пауза';$('sudoku-board').classList.toggle('paused',paused);$('sudoku-board').setAttribute('aria-hidden',String(paused));
 $('hint').textContent=`Подсказка · ${3-state.hints}`;$('hint').disabled=paused||state.ended||state.hints>=3;
 const unavailable=paused||state.ended;for(let i=0;i<keys.length;i++){const key=keys[i];key.disabled=unavailable;key.classList.toggle('active',tool===i+1);key.setAttribute('aria-pressed',String(tool===i+1));}$('erase').disabled=unavailable;$('erase').classList.toggle('active',tool===0);$('erase').setAttribute('aria-pressed',String(tool===0));$('pencil').disabled=paused||state.ended;
}
function select(i,focus=false){if(paused)return;selected=i;render();if(focus)cells[i].focus();}
function choose(n){if(paused||state.ended)return;tool=n;render();}
function finish(){if(!state.values.every((n,i)=>n===state.solution[i]))return;state.ended=true;sound('win');$('result-text').textContent=`Судоку решено за ${format(state.seconds)}!`;$('result-detail').textContent=`Ошибок: ${state.mistakes} · Подсказок: ${state.hints}`;$('result').showModal();}
function enter(n){if(paused||state.ended||state.fixed[selected])return;
 if(pencil&&n){if(state.values[selected])return;state.notes[selected]^=1<<(n-1);sound('pass');}
 else{if(state.values[selected]===n&&!state.notes[selected])return;state.values[selected]=n;state.notes[selected]=0;if(n&&n!==state.solution[selected]){state.mistakes++;sound('invalid');}else{sound('place');if(n)for(const i of E.peers[selected])state.notes[i]&=~(1<<(n-1));}finish();}save();render();
}
function reset(){const difficulty=$('difficulty').value,{puzzle,solution}=E.sudoku(difficulty);state={difficulty,solution,values:puzzle.slice(),fixed:puzzle.map(Boolean),notes:Array(81).fill(0),seconds:0,mistakes:0,hints:0,ended:false};selected=puzzle.indexOf(0);paused=pencil=false;tool=null;if($('result').open)$('result').close();save();render();}
for(let i=0;i<81;i++){const cell=document.createElement('button');cell.type='button';cell.className='sudoku-cell';cell.style.borderRightWidth=i%9===2||i%9===5?'3px':'1px';cell.style.borderBottomWidth=Math.floor(i/9)===2||Math.floor(i/9)===5?'3px':'1px';cell.onclick=()=>{if(paused||state.ended)return;select(i);if(tool!==null)enter(tool);};$('sudoku-board').append(cell);cells.push(cell);}
for(let n=1;n<=9;n++){const key=document.createElement('button');key.type='button';key.textContent=n;key.setAttribute('aria-label','Выбрать цифру '+n);key.setAttribute('aria-pressed','false');key.onclick=()=>choose(n);$('number-pad').append(key);keys.push(key);}
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('select,input,dialog')||paused)return;
 if(/^[1-9]$/.test(e.key)){e.preventDefault();choose(Number(e.key));}else if(['Backspace','Delete','0'].includes(e.key)){e.preventDefault();choose(0);}else if(e.target.closest('#sudoku-board')){const row=Math.floor(selected/9),col=selected%9;const next={ArrowLeft:row*9+(col+8)%9,ArrowRight:row*9+(col+1)%9,ArrowUp:((row+8)%9)*9+col,ArrowDown:((row+1)%9)*9+col}[e.key];if(next!==undefined){e.preventDefault();select(next,true);}}
});
for(const id of ['restart','again'])$(id).onclick=reset;$('difficulty').onchange=reset;$('close-result').onclick=()=>$('result').close();$('erase').onclick=()=>choose(0);$('pencil').onclick=()=>{pencil=!pencil;render();};$('pause').onclick=()=>{paused=!paused;render();save();};
$('hint').onclick=()=>{if(paused||state.ended||state.hints>=3)return;let i=selected;if(state.fixed[i]||state.values[i]===state.solution[i])i=state.values.findIndex((v,j)=>v!==state.solution[j]);if(i<0)return;selected=i;state.hints++;state.values[i]=state.solution[i];state.notes[i]=0;state.fixed[i]=true;for(const j of E.peers[i])state.notes[j]&=~(1<<(state.values[i]-1));sound('capture');finish();save();render();};
if(restore()){$('difficulty').value=state.difficulty;selected=Math.max(0,state.values.indexOf(0));render();}else reset();
setInterval(()=>{if(!paused&&!state.ended&&!document.hidden){state.seconds++;$('time').textContent=format(state.seconds);if(state.seconds%5===0)save();}},1000);window.addEventListener('pagehide',save);
})();
