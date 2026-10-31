const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const fixtures=new Map(),timers=new Map();let decodes=0,yields=0,clock=0,nextTimer=0,finishEncoding;
function pixels(w,h,fill){const data=new Uint8ClampedArray(w*h*4);fill(data,w,h);return {w,h,data};}
fixtures.set('normal',pixels(512,512,(d,w)=>{for(let y=10;y<=430;y++)for(let x=20;x<=380;x++)d[(y*w+x)*4+3]=255;d[3]=255;d[(10*w+19)*4+3]=16;}));
// More than 140,000 disconnected islands used to overflow Math.max(...groups).
fixtures.set('fragmented',pixels(768,768,(d,w,h)=>{for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2)d[(y*w+x)*4+3]=255;}));
fixtures.set('slow-encoding',pixels(16,16,d=>d.fill(255)));
fixtures.set('parallel',pixels(20,20,d=>d.fill(255)));
fixtures.set('transparent',pixels(4,4,()=>{}));
const sandbox={window:{},console,Uint8ClampedArray,Uint32Array,performance:{now:()=>++clock},
 setTimeout(fn,ms){if(ms===0){yields++;return setImmediate(fn);}const id=++nextTimer;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);},
 URL:{createObjectURL:()=> 'blob:test-'+nextTimer},
 Image:class{set src(src){decodes++;this.srcName=src;if(src==='timeout')return;queueMicrotask(()=>{const f=fixtures.get(src);if(!f){this.onerror?.();return;}this.naturalWidth=f.w;this.naturalHeight=f.h;this.data=f.data;this.onload?.();});}},
 document:{createElement(){const canvas={width:0,height:0};let image;
  const ctx={drawImage(img){image=img;canvas.srcName=img.srcName;},getImageData(){if(image.srcName==='broken')throw new Error('pixel read failed');return {data:new Uint8ClampedArray(image.data)};},putImageData(p){canvas.cleaned=p.data;}};
  canvas.getContext=()=>ctx;canvas.toBlob=fn=>{if(canvas.srcName==='slow-encoding')finishEncoding=()=>fn({});else queueMicrotask(()=>fn({}));};return canvas;
 }}
};
vm.runInNewContext(fs.readFileSync('web/sprites.js','utf8'),sandbox);const sprites=sandbox.window.CharacterSprites;
(async()=>{
 const a=sprites.load('normal'),b=sprites.load('normal');assert.equal(a,b,'Duplicate Miku tiers must share the same in-flight work');
 let inputRan=false;setImmediate(()=>{inputRan=true;});const normal=await a;
 assert.ok(inputRan&&yields>0,'Image preparation must yield to input');assert.equal(decodes,1);
 assert.equal(normal.canvas.width,512);assert.equal(normal.canvas.height,512);assert.equal(normal.left,20);assert.equal(normal.top,10);assert.equal(normal.width,361);assert.equal(normal.height,421);
 assert.equal(normal.canvas.cleaned[3],0,'Remove isolated crop debris');assert.equal(normal.canvas.cleaned[(10*512+19)*4+3],16,'Preserve antialiasing');assert.ok(normal.hull.length>=4);assert.ok(normal.url.startsWith('blob:'));
 sandbox.window.MergePreviews={remote:'normal'};assert.equal(await sprites.preview('remote'),normal,'Embedded preview must bypass the network URL');
 await sprites.load('normal');assert.equal(decodes,1,'Reopening a style uses cached sprites');
 const fragmented=await sprites.load('fragmented');assert.equal(fragmented.width,767);assert.ok(fragmented.hull.length>=4);
 await assert.rejects(sprites.load('transparent'),/видимого/);
 fixtures.set('broken',{...fixtures.get('normal')});await assert.rejects(sprites.load('broken'),/pixel read failed/);
 fixtures.delete('broken');await assert.rejects(sprites.load('broken'),/загрузить/,'Failed processing must release queue and allow retry');
 await assert.rejects(sprites.load('missing'),/загрузить/);fixtures.set('missing',fixtures.get('normal'));await sprites.load('missing');
 const delayed=sprites.load('slow-encoding');await sprites.load('parallel');assert.equal(typeof finishEncoding,'function','A waiting encoder must not block preparation of other sprites');finishEncoding();await delayed;
 const timed=sprites.load('timeout');const [timerId,timeout]=timers.entries().next().value;timers.delete(timerId);timeout();await assert.rejects(timed,/истекло/);
 assert.equal(timers.size,0);
 console.log('PASS: responsive full-resolution sprite preparation, shared decode/cache, crop cleanup, 147456 islands, rejected processing/network/timeout, retry after failure.');
})().catch(e=>{console.error(e);process.exitCode=1;});
