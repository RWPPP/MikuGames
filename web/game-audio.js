/* Shared controls for the newer rooms. Unlock only in a user gesture. */
(()=>{const button=document.getElementById('room-sound');if(!button)return;
const audio=new GoAudio(button,'miku-room-sound'),last=new Map();let activated=false;const unlock=()=>{activated=true;audio.unlock();};
window.GameSound={unlock,play(kind,color){if(!activated)return;const now=performance.now();if(now-(last.get(kind)??-Infinity)<(kind==='sand'?130:45))return;last.set(kind,now);audio.play(kind,color);}};
document.addEventListener('pointerdown',unlock,{capture:true});
document.addEventListener('keydown',unlock,{capture:true});
})();
