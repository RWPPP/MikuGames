(()=>{'use strict';
const footer=document.createElement('footer');footer.className='site-footer';footer.innerHTML='<div class="site-extras"><a href="quiz.html">✦ Кто ты из вокалоидов?</a><button type="button" id="open-music">♫ Музыка вокалоидов</button><a href="music.html" target="miku-music">Открыть плеер во вкладке</a></div><p>Спасибо Алине и Даше за идеи и поддержку</p>';document.body.append(footer);
document.getElementById('open-music').onclick=()=>{const player=window.open('music.html','miku-music','popup,width=460,height=650');if(player)player.focus();};
const egg=document.createElement('div');egg.className='kaito-egg';egg.textContent='ЛОХ';egg.setAttribute('aria-hidden','true');document.body.append(egg);
window.KaitoEgg={show(){egg.classList.add('show');},hide(){egg.classList.remove('show');}};
function kaito(el){return el?.closest?.('[data-character="kaito"],img[src*="/kaito."],img[alt*="Кайто"]');}
document.addEventListener('pointerover',e=>{if(kaito(e.target))window.KaitoEgg.show();});document.addEventListener('pointerout',e=>{if(kaito(e.target)&&!kaito(e.relatedTarget))window.KaitoEgg.hide();});document.addEventListener('focusin',e=>{if(kaito(e.target))window.KaitoEgg.show();});document.addEventListener('focusout',e=>{if(kaito(e.target))window.KaitoEgg.hide();});window.addEventListener('blur',()=>window.KaitoEgg.hide());
})();
