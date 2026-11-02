(()=>{'use strict';
const $=id=>document.getElementById(id),levels={easy:[9,9,10],normal:[12,12,24],hard:[16,16,50],hell:[24,24,200]},sound=k=>window.GameSound?.play(k);
const winKey='miku-mines-hard-wins-v1';
let hardWins=0;try{const saved=Number(localStorage.getItem(winKey));if(Number.isFinite(saved)&&saved>0)hardWins=Math.min(3,Math.floor(saved));}catch{}
let game,seconds=0,flagMode=false,buttons=[],focus=0,roundDifficulty='easy',winCounted=false;
function gate(){const unlocked=hardWins>=3,option=$('hell-option');option.hidden=!unlocked;option.disabled=!unlocked;$('hell-progress').textContent=unlocked?'🔥 Уровень «Ад» открыт: 24 × 24, 200 Тето.':'Уровень «Ад»: победи на сложном 3 раза · '+hardWins+' / 3';}
function recordWin(){if(game.status!=='won'||winCounted)return false;winCounted=true;if(roundDifficulty!=='hard')return false;const wasLocked=hardWins<3;hardWins=Math.min(3,hardWins+1);try{localStorage.setItem(winKey,String(hardWins));}catch{}gate();return wasLocked&&hardWins===3;}

function picture(who){const img=document.createElement('img');img.src=`merge-sprites/chibi/${who}.png`;img.alt=who==='miku'?'Мику':'Тето';img.draggable=false;return img;}
function render(){const over=['won','lost'].includes(game.status);$('remaining').textContent=game.mines-game.flags;$('progress').textContent=`${game.revealed} / ${game.cells.length-game.mines}`;
 $('status').textContent=game.status==='won'?'Победа! Все Тето найдены.':game.status==='lost'?'Попалась Тето! Начнём заново?':game.status==='ready'?'Первый ход безопасен. Выбери любую клетку.':flagMode?'Режим Мику: отмечай подозрительные клетки.':'Открывай клетки. Цифра показывает, сколько Тето рядом.';
 for(const [id,active] of [['reveal-mode',!flagMode],['flag-mode',flagMode]]){$(id).setAttribute('aria-pressed',String(active));$(id).classList.toggle('active',active);}
 buttons.forEach((button,i)=>{const c=game.cells[i];button.replaceChildren();button.className='mine-cell'+(c.open?' open':'')+(c.flag?' flagged':'')+(i===game.exploded?' exploded':'');
  let label='закрыто';if(over&&c.mine&&game.status==='lost'){button.append(picture('teto'));label='Тето';}else if(c.flag){button.append(picture('miku'));label='флажок Мику';if(over&&!c.mine){button.classList.add('wrong-flag');label+=' — ошибочный';}}else if(c.open){if(c.count){button.textContent=c.count;button.dataset.count=c.count;}label=c.count?`${c.count} Тето рядом`:'пусто';}
  button.setAttribute('aria-label',`Строка ${Math.floor(i/game.cols)+1}, столбец ${i%game.cols+1}: ${label}`);button.setAttribute('aria-disabled',String(over));button.tabIndex=i===focus?0:-1;
 });
}
function action(i,flag=flagMode){if(['won','lost'].includes(game.status))return;focus=i;const changed=flag?game.toggle(i):game.open(i);if(!changed)return;const unlocked=recordWin();render();
 if(game.status==='won'||game.status==='lost'){sound(game.status==='won'?'win':'loss');$('result-text').textContent=$('status').textContent;$('result-detail').textContent=`Время: ${seconds} с · Открыто: ${game.revealed} клеток${unlocked?' · Открыт уровень «Ад»!':''}`;$('result').showModal();}else sound(flag?'pass':'place');
}
function reset(){let selected=$('difficulty').value;if(!levels[selected])selected='easy';if(selected==='hell'&&hardWins<3)selected='hard';$('difficulty').value=selected;roundDifficulty=selected;winCounted=false;gate();const config=levels[selected];game=new MinesGame(...config);seconds=0;flagMode=false;focus=0;$('time').textContent='00:00';if($('result').open)$('result').close();buttons=[];$('mine-board').replaceChildren();$('mine-board').style.setProperty('--cols',game.cols);$('mine-board').style.setProperty('--min-board',game.cols===9?'0px':game.cols*33+7+'px');
 for(let i=0;i<game.cells.length;i++){const cell=document.createElement('button');cell.type='button';cell.className='mine-cell';cell.onclick=()=>action(i);cell.oncontextmenu=e=>{e.preventDefault();action(i,true);};
  cell.onkeydown=e=>{if(e.key.toLowerCase()==='f'||e.key==='Enter'&&e.shiftKey){e.preventDefault();action(i,true);return;}const row=Math.floor(i/game.cols),col=i%game.cols,next={ArrowLeft:row*game.cols+(col+game.cols-1)%game.cols,ArrowRight:row*game.cols+(col+1)%game.cols,ArrowUp:((row+game.rows-1)%game.rows)*game.cols+col,ArrowDown:((row+1)%game.rows)*game.cols+col}[e.key];if(next!==undefined){e.preventDefault();buttons[focus].tabIndex=-1;focus=next;buttons[focus].tabIndex=0;buttons[focus].focus();}};
  $('mine-board').append(cell);buttons.push(cell);
 }render();
}
$('reveal-mode').onclick=()=>{flagMode=false;render();};$('flag-mode').onclick=()=>{flagMode=true;render();};$('difficulty').onchange=reset;$('restart').onclick=$('again').onclick=reset;$('close-result').onclick=()=>$('result').close();
setInterval(()=>{if(game.status==='playing'&&!document.hidden){seconds++;$('time').textContent=`${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;}},1000);reset();
})();
