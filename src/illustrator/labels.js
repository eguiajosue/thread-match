(function(T){
 T.LABEL_STYLE={width:180,padding:12,swatchHeight:54,nameSize:22,codeSize:20,gap:8,artworkGap:18};
 T.createThreadLabel=function(doc,bucket,thread){
  var target=bucket.targets[0],b;try{b=(target.frame||target.item).geometricBounds;}catch(ignore0){}
  if(!b&&target.kind==='text'){try{b=target.item.parent.geometricBounds;}catch(ignore){}}
  if(!b)b=doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect;
  var cfg=T.LABEL_STYLE,left=b[0],top=b[3]-cfg.artworkGap,inner=cfg.width-2*cfg.padding;
  var height=cfg.padding*2+cfg.swatchHeight+cfg.gap*2+cfg.nameSize*1.25+cfg.codeSize*1.25+20;
  // Reserve a free position beside earlier ThreadMatch cards.
  var candidates=doc.groupItems,attempt=0,overlap=true;
  while(overlap&&attempt<160){overlap=false;for(var n=0;candidates&&n<candidates.length;n++){var old=candidates[n];if(!old.name||old.name.indexOf('ThreadMatch ')!==0)continue;var ob=old.geometricBounds;if(ob&&left<ob[2]+8&&left+cfg.width>ob[0]-8&&top>ob[3]-8&&top-height<ob[1]+8){left=ob[2]+12;overlap=true;break;}}attempt++;}
  var group;
  function color(r,g,b){var c=new RGBColor();c.red=r;c.green=g;c.blue=b;return c;}
  function rectangle(y,x,w,h,fill){var p=group.pathItems.rectangle(y,x,w,h);p.stroked=false;p.filled=true;p.fillColor=fill;return p;}
  function font(bold){try{return app.textFonts.getByName(bold?'Arial-BoldMT':'ArialMT');}catch(ignoreFont){return null;}}
  function text(contents,y,size,bold){
   var f=group.textFrames.add();f.contents=contents;var attrs=f.textRange.characterAttributes;attrs.size=size;attrs.fillColor=color(0,0,0);var face=font(bold);if(face)attrs.textFont=face;
   // Fit long catalog names to the swatch width without changing their wording.
   var bounds=f.geometricBounds,width=bounds?bounds[2]-bounds[0]:0;if(width>inner)attrs.size=size*inner/width;
   f.position=[left+cfg.padding,y];return f;
  }
  try{
   group=doc.groupItems.add();group.name='ThreadMatch '+thread.code+' · '+thread.name+(thread.referenceMode==='montage'?' · montaje':'');
   rectangle(top,left,cfg.width,height,color(255,255,255));
   var swatch=rectangle(top-cfg.padding,left+cfg.padding,inner,cfg.swatchHeight,T.threadRGBColor(thread));swatch.name='Muestra '+thread.code;
   var nameY=top-cfg.padding-cfg.swatchHeight-cfg.gap;
   text(thread.name.charAt(0).toUpperCase()+thread.name.slice(1),nameY,cfg.nameSize,true).name='Nombre del hilo';
   var codeY=nameY-cfg.nameSize*1.25-cfg.gap;
   text('#'+thread.code,codeY,cfg.codeSize,false).name='Código del hilo';
   var caption=text('MADEIRA POLYSTITCH · 40',codeY-cfg.codeSize*1.25-10,7,false);caption.textRange.characterAttributes.fillColor=color(100,100,100);caption.name='Colección';
   return group;
  }catch(e){if(group){try{group.remove();}catch(ignore2){}}throw Error('No se pudo crear la etiqueta. Revisa que la capa activa esté desbloqueada.');}
 };
}(ThreadMatch));
