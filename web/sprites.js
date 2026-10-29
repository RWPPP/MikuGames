/* Render original PNGs at native resolution. Ignore isolated crop debris and
 * derive a convex collision outline from each visible character. */
window.CharacterSprites = {
  load(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const w = canvas.width = image.naturalWidth, h = canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d', {willReadFrequently:true});
        ctx.drawImage(image, 0, 0);
        const pixels = ctx.getImageData(0,0,w,h), data = pixels.data;
        const seen = new Uint8Array(w*h), groups = [];
        for(let i=0;i<w*h;i++) {
          if(seen[i] || data[i*4+3]<32) continue;
          const queue=[i]; seen[i]=1;
          for(let k=0;k<queue.length;k++) {
            const p=queue[k], x=p%w, y=(p/w)|0;
            for(const n of [x>0?p-1:-1,x<w-1?p+1:-1,y>0?p-w:-1,y<h-1?p+w:-1]) {
              if(n>=0&&!seen[n]&&data[n*4+3]>=32){seen[n]=1;queue.push(n);}
            }
          }
          groups.push(queue);
        }
        const largest=Math.max(1,...groups.map(g=>g.length)), keep=new Uint8Array(w*h);
        for(const g of groups) if(g.length>=largest*.05) for(const i of g)keep[i]=1;
        // Keep antialiasing adjacent to the retained silhouette at full resolution.
        let left=w,top=h,right=0,bottom=0; const points=[];
        for(let y=0;y<h;y++)for(let x=0;x<w;x++) {
          const i=y*w+x;
          let retained=keep[i];
          if(!retained&&data[i*4+3])for(let dy=-2;dy<=2&&!retained;dy++)for(let dx=-2;dx<=2;dx++) {
            if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h&&keep[(y+dy)*w+x+dx]){retained=1;break;}
          }
          if(!retained){data[i*4+3]=0;continue;}
          if(data[i*4+3]>=32){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
            if(x%4===0&&y%4===0)points.push({x,y});}
        }
        ctx.putImageData(pixels,0,0);
        const width=right-left+1,height=bottom-top+1,scale=2/Math.max(width,height);
        const cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
        points.sort((a,b)=>a.x-b.x||a.y-b.y);
        const lower=[],upper=[];
        for(const p of points){while(lower.length>=2&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
        for(const p of points.slice().reverse()){while(upper.length>=2&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
        const hull=lower.slice(0,-1).concat(upper.slice(0,-1)).map(p=>({x:(p.x-left-width/2)*scale,y:(p.y-top-height/2)*scale}));
        const preview=document.createElement('canvas');preview.width=preview.height=Math.max(width,height)+8;
        preview.getContext('2d').drawImage(canvas,left,top,width,height,(preview.width-width)/2,(preview.height-height)/2,width,height);
        resolve({canvas,left,top,width,height,hull,scale,url:preview.toDataURL('image/png')});
      };
      image.onerror=()=>reject(new Error('Не удалось загрузить '+src));image.src=src;
    });
  },
  draw(ctx,sprite,x,y,r,angle=0,offset={x:0,y:0}) {
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);const s=sprite.scale*r;
    ctx.drawImage(sprite.canvas,sprite.left,sprite.top,sprite.width,sprite.height,
      -sprite.width*s/2-offset.x,-sprite.height*s/2-offset.y,sprite.width*s,sprite.height*s);ctx.restore();
  }
};

