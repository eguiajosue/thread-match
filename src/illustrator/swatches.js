(function(T){
 T.threadRGBColor=function(thread){var c=new RGBColor();c.red=thread.rgb.r;c.green=thread.rgb.g;c.blue=thread.rgb.b;return c;};
 T.getThreadSwatch=function(doc,thread){
  var name=thread.code+' · '+thread.name+(thread.referenceMode==='montage'?' · montaje':''),i,s,spot;
  for(i=0;i<doc.swatches.length;i++){
   s=doc.swatches[i];
   // Keep PDF and adjusted white swatches separate; never recolor the old one.
   if((thread.referenceMode==='montage')!==(/ · montaje$/.test(s.name)))continue;
   if(s.name===name||new RegExp('^'+thread.code+'(?:\\s|[·-]|$)').test(s.name)){
    // Never overwrite an unrelated ordinary swatch silently.
    if(s.color.typename!=='SpotColor'||s.color.spot.colorType!==ColorModel.PROCESS)throw Error('Ya existe una muestra con ese código que no es global de proceso. Renómbrala para evitar un conflicto.');
    if(s.color.tint!==100||T.deltaE2000(T.rgbToLab(T.illustratorColorToRGB(s.color.spot.color)),T.rgbToLab(thread.rgb))>0.5)throw Error('La muestra existente tiene otro color. Renómbrala o corrígela antes de aplicar.');
    return {color:s.color,created:false,spot:s.color.spot};
   }
  }
  spot=doc.spots.add();
  try {spot.name=name;spot.colorType=ColorModel.PROCESS;spot.color=T.threadRGBColor(thread);var color=new SpotColor();color.spot=spot;color.tint=100;return {color:color,created:true,spot:spot};}
  catch(e){try{spot.remove();}catch(ignore){}throw e;}
 };
 T.applyThread=function(doc,bucket,thread){
  var original=[],i,j,swatch;for(i=0;i<bucket.targets.length;i++){
   if(bucket.targets[i].kind==='compound'){var parts=[];for(j=0;j<bucket.targets[i].item.pathItems.length;j++)parts.push(bucket.targets[i].item.pathItems[j].fillColor);original.push(parts);}
   else original.push(T.getTargetFill(bucket.targets[i]));
  }
  swatch=T.getThreadSwatch(doc,thread);
  try{for(i=0;i<bucket.targets.length;i++)T.setTargetFill(bucket.targets[i],swatch.color);}
  catch(e){for(j=0;j<bucket.targets.length;j++){try{if(bucket.targets[j].kind==='compound'){for(var k=0;k<original[j].length;k++)bucket.targets[j].item.pathItems[k].fillColor=original[j][k];}else T.setTargetFill(bucket.targets[j],original[j]);}catch(ignore){}}if(swatch.created){try{swatch.spot.remove();}catch(ignore2){}}throw Error('No se pudo aplicar el hilo. Se intentó restaurar los rellenos anteriores.');}
 };
}(ThreadMatch));
