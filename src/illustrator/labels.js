(function(T){
 T.LABEL_STYLE={width:180,padding:12,swatchHeight:54,nameSize:22,codeSize:20,gap:8,artworkGap:18};
 T.labelOptions=function(options){options=options||{};var c={},k;for(k in T.LABEL_STYLE)c[k]=T.LABEL_STYLE[k];function number(name,min,max){var v=options[name];if(v===undefined)return null;if(typeof v!=='number'||!isFinite(v)||v<min||v>max)throw Error('Medida inválida: '+name);return v;}var width=number('widthMm',35,140),gap=number('gapMm',1,30),size=number('fontPt',8,36),columns=number('columns',1,4);if(width!==null)c.width=width*72/25.4;if(gap!==null)c.artworkGap=gap*72/25.4;if(size!==null){c.nameSize=size;c.codeSize=size*.9;}c.columns=columns===null?2:Math.floor(columns);c.template=options.template||'classic';if(c.template!=='classic'&&c.template!=='spool')throw Error('Tipo de etiqueta inválido.');c.placement=options.placement||'below';if(c.placement!=='below'&&c.placement!=='artboard')throw Error('Posición de etiqueta inválida.');return c;};
 T.outputIsolated=function(doc){
  function isolated(item){var steps=0;while(item&&item.typename!=='Document'&&steps++<100){try{if(item.isIsolated)return true;item=item.parent;}catch(ignore){break;}}return false;}
  try{if(isolated(doc.activeLayer)||doc.activeLayer&&doc.activeLayer.name==='Isolation Mode')return true;}catch(ignoreLayer){}
  var selection=doc.selection;for(var i=0;selection&&i<selection.length;i++)if(isolated(selection[i]))return true;return false;
 };
 T.productionLayer=function(doc){
  if(!doc.layers||!doc.layers.add)return null;var layer=null,exits=0;
  function leaveIsolation(){
   var message='Sal del modo de aislamiento con Esc y vuelve a crear la etiqueta o leyenda.';
   if(exits++>=32||typeof app.executeMenuCommand!=='function')throw Error(message);
   var selected=[],input=doc.selection,i;for(i=0;input&&i<input.length;i++)selected.push(input[i]);
   var failed=false;try{app.executeMenuCommand('exitFocus');}catch(e){failed=true;}
   try{var current=doc.selection,changed=!current||current.length!==selected.length;if(!changed)for(i=0;i<selected.length;i++)if(current[i]!==selected[i]){changed=true;break;}if(changed)doc.selection=selected;}catch(restoreError){failed=true;}
   if(failed)throw Error(message);
  }
  while(T.outputIsolated(doc))leaveIsolation();
  // Some hosts expose the synthetic layer only through this native error.
  while(true){
   try{layer=null;try{layer=doc.layers.getByName('ThreadMatch · Producción');}catch(ignore){}if(layer&&(layer.locked||layer.visible===false))throw Error('Desbloquea y muestra la capa ThreadMatch · Producción.');if(!layer){layer=doc.layers.add();layer.name='ThreadMatch · Producción';}return layer;}
   catch(e){if(!/synthetic layer|Isolation Mode/i.test(e.message||''))throw e;leaveIsolation();while(T.outputIsolated(doc))leaveIsolation();}
  }
 };
 T.outputGroup=function(doc){var layer=T.productionLayer(doc);return layer&&layer.groupItems?layer.groupItems.add():doc.groupItems.add();};
 T.createThreadLabel=function(doc,bucket,thread,options){
  var b=T.artworkBounds?T.artworkBounds(doc,bucket.allBuckets||[bucket]):bucket.targets[0].item.geometricBounds,cfg=T.labelOptions(options),left=b[0],top=b[3]-cfg.artworkGap,inner=cfg.width-2*cfg.padding;
  if(cfg.placement==='artboard'){var board=doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect;left=board[0]+cfg.padding;top=board[1]-cfg.padding;}
  var height=cfg.template==='spool'?Math.max(cfg.width*.7,cfg.nameSize*2.5+cfg.gap):cfg.padding*2+cfg.swatchHeight+cfg.gap*2+cfg.nameSize*1.25+cfg.codeSize*1.25+20,candidates=doc.groupItems,attempt=0,overlap=true;
  while(overlap&&attempt<160){overlap=false;for(var n=0;candidates&&n<candidates.length;n++){var old=candidates[n];if(old.hidden||!old.name||old.name.indexOf('ThreadMatch ')!==0)continue;var ob=old.geometricBounds;if(ob&&left<ob[2]+8&&left+cfg.width>ob[0]-8&&top>ob[3]-8&&top-height<ob[1]+8){left=ob[2]+12;overlap=true;break;}}attempt++;}if(overlap)throw Error('No se encontró espacio libre para la etiqueta.');
  var group;function color(r,g,b){var c=new RGBColor();c.red=r;c.green=g;c.blue=b;return c;}
  function rectangle(y,x,w,h,fill){var p=group.pathItems.rectangle(y,x,w,h);p.stroked=false;p.filled=true;p.fillColor=fill;return p;}
  function text(contents,y,size,bold){var f=group.textFrames.add();f.contents=contents;var attrs=f.textRange.characterAttributes;attrs.size=size;attrs.fillColor=color(0,0,0);try{attrs.textFont=app.textFonts.getByName(bold?'Arial-BoldMT':'ArialMT');}catch(ignoreFont){}var bounds=f.geometricBounds,width=bounds?bounds[2]-bounds[0]:0;if(width>inner)attrs.size=size*inner/width;f.position=[left+cfg.padding,y];return f;}
  try{group=T.outputGroup(doc);group.name='ThreadMatch '+thread.code+' · '+thread.name+(thread.referenceMode==='montage'?' · montaje':'');group.note='ThreadMatch.label.v1|'+thread.code;
   if(cfg.template==='spool'){
    var iconWidth=height*T.THREAD_ICON.viewBox[2]/T.THREAD_ICON.viewBox[3];
    T.createThreadIcon(group,left,top,height,thread);
    var textLeft=left+iconWidth+cfg.padding;
    inner=cfg.width-iconWidth-cfg.padding;
    var nameY=top-height/2+(cfg.nameSize*1.25+cfg.codeSize*1.25+cfg.gap)/2,codeY=nameY-cfg.nameSize*1.25-cfg.gap;
    var title=text(thread.name.charAt(0).toUpperCase()+thread.name.slice(1),nameY,cfg.nameSize,true);title.position=[textLeft,nameY];title.name='Nombre del hilo';
    var code=text('#'+thread.code,codeY,cfg.codeSize,false);code.position=[textLeft,codeY];code.name='Código del hilo';
    return group;
   }
   rectangle(top,left,cfg.width,height,color(255,255,255));var swatch=rectangle(top-cfg.padding,left+cfg.padding,inner,cfg.swatchHeight,T.threadRGBColor(thread));swatch.name='Muestra '+thread.code;swatch.stroked=true;swatch.strokeWidth=.5;swatch.strokeColor=color(150,150,150);var nameY=top-cfg.padding-cfg.swatchHeight-cfg.gap;text(thread.name.charAt(0).toUpperCase()+thread.name.slice(1),nameY,cfg.nameSize,true).name='Nombre del hilo';var codeY=nameY-cfg.nameSize*1.25-cfg.gap;text('#'+thread.code,codeY,cfg.codeSize,false).name='Código del hilo';var caption=text('MADEIRA POLYSTITCH · 40 · '+((options&&options.reference||thread.referenceMode)==='montage'?'Montaje':(options&&options.reference||thread.referenceMode)==='measured'?'Datos medidos':'Carta PDF'),codeY-cfg.codeSize*1.25-10,7,false);caption.textRange.characterAttributes.fillColor=color(100,100,100);caption.name='Colección y referencia';return group;}catch(e){if(group){try{group.remove();}catch(ignore){}}throw Error('No se pudo crear la etiqueta: '+e.message);}
 };
 T.createLegend=function(doc,buckets,threads,options,id,reference){
  options=options||{};var cfg=T.labelOptions(options),bounds=T.artworkBounds(doc,buckets),left=bounds[0],top=bounds[3]-cfg.artworkGap,columns=Math.min(cfg.columns,threads.length),rowHeight=45,width=cfg.width*columns+cfg.gap*(columns-1),height=54+Math.ceil(threads.length/columns)*rowHeight,group;
  if(cfg.placement==='artboard'){var board=doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect;left=board[0]+cfg.padding;top=board[1]-cfg.padding;}
  var existing=doc.groupItems||[],collision=true,attempt=0;while(collision&&attempt<160){collision=false;for(var n=0;n<existing.length;n++){var old=existing[n],ob=old.geometricBounds;if(old.hidden||!T.isOwnOutput(old)||!ob)continue;if(left<ob[2]+8&&left+width>ob[0]-8&&top>ob[3]-8&&top-height<ob[1]+8){left=ob[2]+cfg.artworkGap;collision=true;break;}}attempt++;}if(collision)throw Error('No se encontró espacio libre para la leyenda.');
  function rgb(r,g,b){var c=new RGBColor();c.red=r;c.green=g;c.blue=b;return c;}
  function text(s,x,y,size,bold,maxWidth){var f=group.textFrames.add();f.contents=s;f.position=[x,y];var a=f.textRange.characterAttributes;a.size=size;a.fillColor=rgb(20,20,20);try{a.textFont=app.textFonts.getByName(bold?'Arial-BoldMT':'ArialMT');}catch(ignore){}var b=f.geometricBounds,w=b?b[2]-b[0]:0;if(maxWidth&&w>maxWidth)a.size=size*maxWidth/w;return f;}
  try{group=T.outputGroup(doc);group.name='ThreadMatch leyenda · '+(options.title||'Diseño');group.note='ThreadMatch.legend.v1|'+id;var bg=group.pathItems.rectangle(top,left,width,height);bg.stroked=false;bg.filled=true;bg.fillColor=rgb(255,255,255);text(options.title||'Paleta de bordado',left+12,top-12,14,true,width-24);text('MADEIRA POLYSTITCH · 40 · '+(reference==='montage'?'Montaje (ajuste visual)':reference==='measured'?'Datos medidos':'Carta PDF'),left+12,top-31,8,false,width-24);for(var i=0;i<threads.length;i++){var col=i%columns,row=Math.floor(i/columns),x=left+col*(cfg.width+cfg.gap)+12,y=top-50-row*rowHeight,thread=threads[i],swatch=group.pathItems.rectangle(y,x,28,26);swatch.filled=true;swatch.fillColor=T.threadRGBColor(thread);swatch.stroked=true;swatch.strokeWidth=.5;swatch.strokeColor=rgb(150,150,150);text('#'+thread.code,x+36,y-1,Math.min(cfg.nameSize,14),true,cfg.width-60);text(thread.name,x+36,y-18,Math.min(cfg.nameSize*.65,10),false,cfg.width-60);}return group;}catch(e){if(group){try{group.remove();}catch(ignore2){}}throw Error('No se pudo crear la leyenda: '+e.message);}
 };
}(ThreadMatch));
