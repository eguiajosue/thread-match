// Build-time converter for the commands in the supplied THREAD.svg.
// Coordinates and cubic handles remain exact; no polygon approximation.
function contours(data){
 const tokens=data.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g)||[];
 const arity={M:2,L:2,H:1,V:1,C:6,S:4},result=[];let i=0,command=null,previous=null,x=0,y=0,control=null,path=null;
 const knot=(a,b)=>[a,b,a,b,a,b];
 function finish(closed){if(!path)return;path.closed=closed;if(closed&&path.points.length>1){const a=path.points[0],b=path.points.at(-1);if(Math.abs(a[0]-b[0])<1e-8&&Math.abs(a[1]-b[1])<1e-8){a[2]=b[2];a[3]=b[3];path.points.pop();}}result.push(path);path=null;}
 while(i<tokens.length){
  if(/^[a-zA-Z]$/.test(tokens[i]))command=tokens[i++];if(!command)throw Error('SVG command missing');const op=command.toUpperCase(),relative=command!==op;
  if(op==='Z'){if(!path)throw Error('Close without path');x=path.points[0][0];y=path.points[0][1];finish(true);control=null;previous='Z';command=null;continue;}
  if(!arity[op])throw Error('Unsupported SVG command: '+command);const a=[];for(let n=0;n<arity[op];n++){if(i>=tokens.length||/^[a-zA-Z]$/.test(tokens[i]))throw Error('Incomplete SVG command');a.push(Number(tokens[i++]));}
  const ox=x,oy=y;function xy(j){return [a[j]+(relative?ox:0),a[j+1]+(relative?oy:0)];}
  if(op==='M'){finish(false);[x,y]=xy(0);path={closed:false,points:[knot(x,y)]};command=relative?'l':'L';control=null;}
  else{if(!path)throw Error('SVG path missing move');if(op==='L'){[x,y]=xy(0);control=null;}else if(op==='H'){x=a[0]+(relative?ox:0);control=null;}else if(op==='V'){y=a[0]+(relative?oy:0);control=null;}else{
   const c1=op==='C'?xy(0):previous==='C'||previous==='S'?[2*ox-control[0],2*oy-control[1]]:[ox,oy],c2=xy(op==='C'?2:0),end=xy(op==='C'?4:2);path.points.at(-1)[4]=c1[0];path.points.at(-1)[5]=c1[1];[x,y]=end;control=c2;const p=knot(x,y);p[2]=c2[0];p[3]=c2[1];path.points.push(p);previous=op;continue;
  }path.points.push(knot(x,y));}
  previous=op;
 }
 finish(false);return result;
}
module.exports={contours};
