/* Small synthesized sounds: no downloads, a single reusable audio context. */
window.GoAudio=class {
  constructor(button){this.button=button;this.enabled=localStorage.getItem('go-sound')!=='0';this.context=null;this.master=null;this.sync();button.addEventListener('click',()=>{this.enabled=!this.enabled;localStorage.setItem('go-sound',this.enabled?'1':'0');this.sync();if(this.enabled){this.unlock();this.play('place');}});}
  sync(){if(this.master)this.master.gain.setValueAtTime(this.enabled?1:0,this.context.currentTime);this.button.setAttribute('aria-pressed',String(this.enabled));this.button.setAttribute('aria-label',this.enabled?'Выключить звук':'Включить звук');this.button.title=this.enabled?'Звук включён':'Звук выключен';this.button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/>'+(this.enabled?'<path d="M15 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12"/>':'<path d="m16 9 5 6m0-6-5 6"/>')+'</svg>';}
  unlock(){if(!this.enabled)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!this.context){this.context=new Audio();this.master=this.context.createGain();this.master.connect(this.context.destination);}if(this.context.state==='suspended')this.context.resume().catch(()=>{});}catch{}}
  play(kind,color=1){if(!this.enabled)return;this.unlock();const a=this.context;if(!a)return;if(a.state==='suspended'){a.resume().then(()=>{if(a.state==='running')this.play(kind,color);}).catch(()=>{});return;}if(a.state!=='running')return;const now=a.currentTime;
    const note=(frequency,start,duration,volume=.07,type='sine')=>{const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(frequency,now+start);g.gain.setValueAtTime(.0001,now+start);g.gain.exponentialRampToValueAtTime(volume,now+start+.005);g.gain.exponentialRampToValueAtTime(.0001,now+start+duration);o.connect(g);g.connect(this.master);o.start(now+start);o.stop(now+start+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};};
    if(kind==='place'){note(color===1?670:800,0,.085,.065,'triangle');note(190,0,.045,.035);}
    else if(kind==='capture'){[600,800,1050].forEach((f,i)=>note(f,i*.045,.14,.055));}
    else if(kind==='invalid'){note(160,0,.12,.035,'triangle');}
    else if(kind==='pass'){note(440,0,.12,.04);note(330,.1,.14,.04);}
    else if(kind==='win'){[523,659,784,1047].forEach((f,i)=>note(f,i*.1,.25));}
    else if(kind==='loss'){[440,370,294,220].forEach((f,i)=>note(f,i*.13,.28,.055));}
  }
};
