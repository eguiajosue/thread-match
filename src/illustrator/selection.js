(function(T){
 T.illustratorColorToRGB=function(c){
  var values;
  if(c.typename==='SpotColor'&&c.spot.colorType===ColorModel.PROCESS){var base=T.illustratorColorToRGB(c.spot.color),t=c.tint/100;return {r:255+(base.r-255)*t,g:255+(base.g-255)*t,b:255+(base.b-255)*t};}
  if(c.typename==='RGBColor')return {r:c.red,g:c.green,b:c.blue};
  if(c.typename==='CMYKColor')values=app.convertSampleColor(ImageColorSpace.CMYK,[c.cyan,c.magenta,c.yellow,c.black],ImageColorSpace.RGB,ColorConvertPurpose.defaultpurpose);
  else if(c.typename==='GrayColor')return {r:c.gray*2.55,g:c.gray*2.55,b:c.gray*2.55};
  else throw Error('Relleno no soportado.');
  return {r:values[0],g:values[1],b:values[2]};
 };
 T.documentContext=function(doc){var mode='No expuesto',profile='No expuesto';try{if(typeof DocumentColorSpace!=='undefined')mode=doc.documentColorSpace===DocumentColorSpace.CMYK?'CMYK':doc.documentColorSpace===DocumentColorSpace.RGB?'RGB':mode;else if(doc.documentColorSpace)mode=String(doc.documentColorSpace);}catch(ignore){}try{if(typeof doc.colorProfileName==='string'&&doc.colorProfileName)profile=doc.colorProfileName;}catch(ignore2){}return {mode:mode,profile:profile};};
 T.isOwnOutput=function(item){try{return /^ThreadMatch\.(label|legend|backup)\.v1\|/.test(item.note||'');}catch(ignore){return false;}};
 T.scopeRoots=function(doc,scope){scope=scope||'selection';if(scope!=='selection'&&scope!=='artboard'&&scope!=='document')throw Error('Alcance inválido.');var input=scope==='selection'?doc.selection:doc.pageItems,roots=[],i,j,parent,duplicate;if(!input||!input.length)throw Error(scope==='selection'?'Selecciona uno o varios objetos con relleno sólido.':'No hay objetos en el alcance elegido.');for(i=0;i<input.length;i++){duplicate=false;parent=input[i].parent;while(parent&&parent.typename!=='Document'&&parent.typename!=='Layer'){for(j=0;j<input.length;j++)if(input[j]===parent){duplicate=true;break;}if(duplicate)break;parent=parent.parent;}if(!duplicate)roots.push(input[i]);}return roots;};
 T.targetFingerprint=function(target){var item=target.frame||target.item,parts=[],bounds;try{bounds=item.geometricBounds;}catch(ignore){}parts.push(bounds?String(bounds):'');if(target.kind==='compound'){for(var n=0;n<target.item.pathItems.length;n++)parts.push(T.rgbToHex(T.illustratorColorToRGB(target.item.pathItems[n].fillColor)));}return parts.join('|');};
 T.collectScope=function(doc,scope){
  var start=new Date().getTime(),roots=T.scopeRoots(doc,scope),groups=[],lookup={},skipped=0,visited=0,reasons={},seen={},fallback=[],board=null,objects=0;
  if(scope==='artboard')board=doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect;
  function omit(reason){skipped++;reasons[reason]=(reasons[reason]||0)+1;}
  function add(target,color){if(!color||(!(/^(RGBColor|CMYKColor|GrayColor)$/).test(color.typename)&&!(color.typename==='SpotColor'&&color.spot.colorType===ColorModel.PROCESS))){omit('Relleno no soportado');return;}var rgb=T.illustratorColorToRGB(color),key=T.rgbToHex(rgb),bucket=lookup[key];if(!bucket){bucket={rgb:rgb,hex:key,targets:[],label:key};lookup[key]=bucket;groups.push(bucket);}target.fingerprint=T.targetFingerprint(target);bucket.targets.push(target);}
  function wasSeen(item){var id;try{id=item.uuid;}catch(ignore){}if(id){if(seen[id])return true;seen[id]=true;}else{for(var i=0;i<fallback.length;i++)if(fallback[i]===item)return true;fallback.push(item);}return false;}
  function outside(item){if(!board)return false;var b;try{b=item.geometricBounds;}catch(ignore){}return !b||b[2]<=board[0]||b[0]>=board[2]||b[1]<=board[3]||b[3]>=board[1];}
  function blocked(item){var parent=item;while(parent&&parent.typename!=='Document'){if(parent.locked||parent.hidden||parent.visible===false||parent.editable===false)return true;parent=parent.parent;}return false;}
  function walk(item){if(wasSeen(item))return;visited++;if(blocked(item)){omit('Bloqueado u oculto');return;}if(T.isOwnOutput(item)){omit('Salida ThreadMatch');return;}var i;if(item.typename==='GroupItem'){for(i=0;i<item.pageItems.length;i++)walk(item.pageItems[i]);return;}if(outside(item)){omit('Fuera de mesa');return;}objects++;
   if(item.typename==='CompoundPathItem'){if(item.pathItems.length&&item.pathItems[0].filled){for(i=0;i<item.pathItems.length;i++)wasSeen(item.pathItems[i]);add({kind:'compound',item:item},item.pathItems[0].fillColor);}else omit('Sin relleno');}
   else if(item.typename==='PathItem'){if(item.filled&&!item.clipping)add({kind:'path',item:item},item.fillColor);else omit('Sin relleno o máscara');}
   else if(item.typename==='TextFrame'){for(i=0;i<item.textRange.characters.length;i++)add({kind:'text',item:item.textRange.characters[i],frame:item},item.textRange.characters[i].characterAttributes.fillColor);}
   else omit('Objeto no soportado');
  }
  for(var i=0;i<roots.length;i++)walk(roots[i]);
  if(!groups.length)throw Error('No se encontró un color sólido compatible en el alcance elegido.');
  return {groups:groups,skipped:skipped,reasons:reasons,visited:visited,objects:objects,roots:roots,scope:scope||'selection',readMs:new Date().getTime()-start};
 };
 T.collectSelection=function(doc){return T.collectScope(doc,'selection');};
 T.getTargetFill=function(target){return target.kind==='text'?target.item.characterAttributes.fillColor:target.kind==='compound'?target.item.pathItems[0].fillColor:target.item.fillColor;};
 T.setTargetFill=function(target,color){if(target.kind==='text')target.item.characterAttributes.fillColor=color;else if(target.kind==='compound'){for(var i=0;i<target.item.pathItems.length;i++)target.item.pathItems[i].fillColor=color;}else target.item.fillColor=color;};
 T.captureFill=function(target){if(target.kind!=='compound')return T.getTargetFill(target);var parts=[];for(var i=0;i<target.item.pathItems.length;i++)parts.push(target.item.pathItems[i].fillColor);return parts;};
 T.restoreFill=function(target,original){if(target.kind==='compound'){if(target.item.pathItems.length!==original.length)throw Error('Cambió el trazado compuesto.');for(var i=0;i<original.length;i++)target.item.pathItems[i].fillColor=original[i];}else T.setTargetFill(target,original);};
 T.artworkBounds=function(doc,buckets){var result=null,i,j,b,target;for(i=0;i<buckets.length;i++)for(j=0;j<buckets[i].targets.length;j++){target=buckets[i].targets[j];try{b=(target.frame||target.item).geometricBounds;}catch(ignore){}if(b){if(!result)result=[b[0],b[1],b[2],b[3]];else{result[0]=Math.min(result[0],b[0]);result[1]=Math.max(result[1],b[1]);result[2]=Math.max(result[2],b[2]);result[3]=Math.min(result[3],b[3]);}}}if(!result)result=doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect;return result;};
}(ThreadMatch));
