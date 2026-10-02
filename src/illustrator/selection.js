(function(T){
 T.illustratorColorToRGB=function(c){
  var values;
  if(c.typename==='SpotColor'&&c.spot.colorType===ColorModel.PROCESS){
   var base=T.illustratorColorToRGB(c.spot.color),t=c.tint/100;return {r:255+(base.r-255)*t,g:255+(base.g-255)*t,b:255+(base.b-255)*t};
  }
  if(c.typename==='RGBColor')return {r:c.red,g:c.green,b:c.blue};
  if(c.typename==='CMYKColor')values=app.convertSampleColor(ImageColorSpace.CMYK,[c.cyan,c.magenta,c.yellow,c.black],ImageColorSpace.RGB,ColorConvertPurpose.defaultpurpose);
  else if(c.typename==='GrayColor')return {r:c.gray*2.55,g:c.gray*2.55,b:c.gray*2.55};
  else throw Error('Relleno no soportado.');
  return {r:values[0],g:values[1],b:values[2]};
 };
 T.collectSelection=function(doc){
  var selection=doc.selection,groups=[],lookup={},skipped=0,visited=0;
  if(!selection||!selection.length)throw Error('Selecciona uno o varios objetos con relleno sólido.');
  function add(target,color){
   if(!color||(!(/^(RGBColor|CMYKColor|GrayColor)$/).test(color.typename)&&!(color.typename==='SpotColor'&&color.spot.colorType===ColorModel.PROCESS))){skipped++;return;}
   var rgb=T.illustratorColorToRGB(color),key=T.rgbToHex(rgb),bucket=lookup[key];
   if(!bucket){bucket={rgb:rgb,hex:key,targets:[],label:key};lookup[key]=bucket;groups.push(bucket);}
   bucket.targets.push(target);
  }
  function walk(item){
   var i;visited++;
   if(item.locked||item.hidden||item.editable===false){skipped++;return;}
   if(item.typename==='GroupItem'){for(i=0;i<item.pageItems.length;i++)walk(item.pageItems[i]);}
   else if(item.typename==='CompoundPathItem'){if(item.pathItems.length&&item.pathItems[0].filled)add({kind:'compound',item:item},item.pathItems[0].fillColor);else skipped++;}
   else if(item.typename==='PathItem'){if(item.filled&&!item.clipping)add({kind:'path',item:item},item.fillColor);else skipped++;}
   else if(item.typename==='TextFrame'){for(i=0;i<item.textRange.characters.length;i++)add({kind:'text',item:item.textRange.characters[i],frame:item},item.textRange.characters[i].characterAttributes.fillColor);}
   else skipped++;
  }
  for(var i=0;i<selection.length;i++)walk(selection[i]);
  if(!groups.length)throw Error('No se encontró un color sólido compatible. Selecciona trazados o textos completos con relleno RGB, CMYK o gris.');
  return {groups:groups,skipped:skipped,visited:visited};
 };
 T.getTargetFill=function(target){return target.kind==='text'?target.item.characterAttributes.fillColor:target.kind==='compound'?target.item.pathItems[0].fillColor:target.item.fillColor;};
 T.setTargetFill=function(target,color){var i;if(target.kind==='text')target.item.characterAttributes.fillColor=color;else if(target.kind==='compound'){for(i=0;i<target.item.pathItems.length;i++)target.item.pathItems[i].fillColor=color;}else target.item.fillColor=color;};
}(ThreadMatch));
