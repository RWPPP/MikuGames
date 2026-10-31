/* Clean native-resolution PNGs in short batches, keeping input responsive. */
(()=>{'use strict';
const cache=new Map();
let processing=Promise.resolve();
// Message tasks keep progressing in background tabs, where timers are throttled.
const jobs=[],channel=typeof MessageChannel==='function'?new MessageChannel():null;
if(channel)channel.port1.onmessage=()=>jobs.shift()?.();
const pause=()=>new Promise(resolve=>{if(channel){jobs.push(resolve);channel.port2.postMessage(null);}else setTimeout(resolve,0);});
function decode(src){
  return new Promise((resolve,reject)=>{
    const image=new Image();
    const timer=setTimeout(()=>{image.onload=image.onerror=null;image.src='';reject(new Error('Время загрузки картинки истекло'));},15000);
    image.onload=()=>{clearTimeout(timer);resolve(image);};
    image.onerror=()=>{clearTimeout(timer);reject(new Error('Не удалось загрузить '+src));};
    image.src=src;
  });
}
async function prepare(image){
  const canvas=document.createElement('canvas');
  const w=canvas.width=image.naturalWidth,h=canvas.height=image.naturalHeight,total=w*h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(image,0,0);
  const pixels=ctx.getImageData(0,0,w,h),data=pixels.data;
  // Reuse a typed queue instead of retaining an array for every component.
  const labels=new Uint32Array(total),queue=new Uint32Array(total),counts=[0];
  let largest=0,deadline=performance.now()+6;
  for(let i=0;i<total;i++){
    if((i&4095)===0&&performance.now()>=deadline){await pause();deadline=performance.now()+6;}
    if(labels[i]||data[i*4+3]<32)continue;
    const group=counts.length;let tail=1;queue[0]=i;labels[i]=group;
    for(let head=0;head<tail;head++){
      if((head&4095)===0&&performance.now()>=deadline){await pause();deadline=performance.now()+6;}
      const p=queue[head],x=p%w,y=(p/w)|0;
      for(let side=0;side<4;side++){
        const n=side===0?(x>0?p-1:-1):side===1?(x<w-1?p+1:-1):side===2?(y>0?p-w:-1):(y<h-1?p+w:-1);
        if(n>=0&&!labels[n]&&data[n*4+3]>=32){labels[n]=group;queue[tail++]=n;}
      }
    }
    counts.push(tail);largest=Math.max(largest,tail);
  }
  if(!largest)throw new Error('В картинке нет видимого персонажа');
  const retained=label=>label!==0&&counts[label]>=largest*.05;
  let left=w,top=h,right=0,bottom=0;
  const points=[];
  for(let y=0;y<h;y++){
    if(performance.now()>=deadline){await pause();deadline=performance.now()+6;}
    let rowLeft=w,rowRight=-1;
    for(let x=0;x<w;x++){
      const i=y*w+x;
      if(!data[i*4+3])continue;
      let keep=retained(labels[i]);
      if(!keep)for(let dy=-2;dy<=2&&!keep;dy++)for(let dx=-2;dx<=2;dx++){
        if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h&&retained(labels[(y+dy)*w+x+dx])){keep=true;break;}
      }
      if(!keep){data[i*4+3]=0;continue;}
      if(data[i*4+3]>=32){rowLeft=Math.min(rowLeft,x);rowRight=Math.max(rowRight,x);}
    }
    // Only row extremes can belong to the convex hull; skip interior pixels.
    if(rowRight>=0){left=Math.min(left,rowLeft);right=Math.max(right,rowRight);top=Math.min(top,y);bottom=y;points.push({x:rowLeft,y},{x:rowRight,y});}
  }
  ctx.putImageData(pixels,0,0);
  const width=right-left+1,height=bottom-top+1,scale=2/Math.max(width,height);
  const cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  points.sort((a,b)=>a.x-b.x||a.y-b.y);
  const lower=[],upper=[];
  for(const p of points){while(lower.length>=2&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
  for(let i=points.length-1;i>=0;i--){const p=points[i];while(upper.length>=2&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
  const hull=lower.slice(0,-1).concat(upper.slice(0,-1)).map(p=>({x:(p.x-left-width/2)*scale,y:(p.y-top-height/2)*scale}));
  const preview=document.createElement('canvas');preview.width=preview.height=Math.max(width,height)+8;
  preview.getContext('2d').drawImage(canvas,left,top,width,height,(preview.width-width)/2,(preview.height-height)/2,width,height);
  return {canvas,left,top,width,height,hull,scale,preview};
}
window.CharacterSprites={
  preview(src){
    const embedded=window.MergePreviews?.[src];
    return this.load(embedded||src);
  },
  load(src){
    if(cache.has(src))return cache.get(src);
    const pending=decode(src).then(image=>{
      const task=processing.then(()=>prepare(image));
      processing=task.catch(()=>{});
      // Release the CPU queue before encoding: background-tab encoders may wait.
      return task.then(async sprite=>{
        const blob=await new Promise(resolve=>sprite.preview.toBlob(resolve,'image/png'));
        if(!blob)throw new Error('Не удалось подготовить картинку');
        const {preview,...result}=sprite;
        return {...result,url:URL.createObjectURL(blob)};
      });
    }).catch(error=>{cache.delete(src);throw error;});
    cache.set(src,pending);return pending;
  },
  draw(ctx,sprite,x,y,r,angle=0,offset={x:0,y:0}){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);const s=sprite.scale*r;
    ctx.drawImage(sprite.canvas,sprite.left,sprite.top,sprite.width,sprite.height,
      -sprite.width*s/2-offset.x,-sprite.height*s/2-offset.y,sprite.width*s,sprite.height*s);ctx.restore();
  }
};
})();
