const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let contexts=0,notes=0,click;const storage=new Map([['go-sound','0']]);
const parameter=()=>({value:null,setValueAtTime(value){this.value=value},exponentialRampToValueAtTime(value){this.value=value}});
class AudioContext{
 constructor(){contexts++;this.state='running';this.currentTime=0;this.destination={};}
 createGain(){return {gain:parameter(),connect(){},disconnect(){}};}
 createOscillator(){return {frequency:parameter(),connect(){},disconnect(){},start(){notes++},stop(){}};}
}
const sandbox={window:{AudioContext},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}};
vm.runInNewContext(fs.readFileSync('web/go-audio.js','utf8'),sandbox);
const attributes={},button={setAttribute(k,v){attributes[k]=v},addEventListener(_,fn){click=fn}};
const audio=new sandbox.window.GoAudio(button);
audio.play('place');assert.equal(notes,0);assert.equal(contexts,0);assert.equal(attributes['aria-pressed'],'false');
click();assert.equal(storage.get('go-sound'),'1');assert.equal(attributes['aria-pressed'],'true');assert.ok(notes>0);
const before=notes;for(const sound of ['place','capture','pass','invalid','win','loss'])audio.play(sound);
assert.ok(notes>before);assert.equal(contexts,1,'Reuse the same context for player and computer sounds');
click();const muted=notes;audio.play('capture');audio.play('win');assert.equal(notes,muted);assert.equal(audio.master.gain.value,0,'Mute also stops the output of already scheduled sounds');assert.equal(storage.get('go-sound'),'0');
console.log('PASS: Go audio, all game sounds, saved preference, context reuse, immediate mute.');
