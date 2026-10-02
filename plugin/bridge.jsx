var snapshot=null,sequence=0;
var matcher=ThreadMatch.createMatcher(ThreadMatch.catalog);
function stringify(value){
 if(value===null)return 'null';
 if(typeof value==='string')return '"'+value.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/[\x00-\x1f\u2028\u2029]/g,function(c){return '\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4);})+'"';
 if(typeof value==='number')return isFinite(value)?String(value):'null';
 if(typeof value==='boolean')return value?'true':'false';
 var parts=[],i,key;if(value instanceof Array){for(i=0;i<value.length;i++)parts.push(stringify(value[i]));return '['+parts.join(',')+']';}
 for(key in value)if(value.hasOwnProperty(key))parts.push(stringify(key)+':'+stringify(value[key]));return '{'+parts.join(',')+'}';
}
function failure(e){return stringify({ok:false,error:e.message||'No se pudo completar la operación.'});}
function selectionIdentity(doc){var result=[],s=doc.selection;for(var i=0;i<s.length;i++)result.push(s[i]);return result;}
function validateSnapshot(token){
 if(!snapshot||token!==snapshot.token)throw Error('Actualiza el análisis antes de continuar.');
 if(!app.documents.length||app.activeDocument!==snapshot.doc)throw Error('Cambió el documento. Espera a la sincronización o pulsa Actualizar.');
 var selection=app.activeDocument.selection;if(!selection||selection.length!==snapshot.selection.length)throw Error('Cambió la selección. Espera a la sincronización o pulsa Actualizar.');
 for(var i=0;i<selection.length;i++)if(selection[i]!==snapshot.selection[i])throw Error('Cambió la selección. Espera a la sincronización o pulsa Actualizar.');
}
function sameSelection(doc){var selection=doc.selection;if(!snapshot||snapshot.doc!==doc||selection.length!==snapshot.selection.length)return false;for(var i=0;i<selection.length;i++)if(selection[i]!==snapshot.selection[i])return false;return true;}
function sameAnalysis(analysis){if(!snapshot||analysis.groups.length!==snapshot.analysis.groups.length||analysis.skipped!==snapshot.analysis.skipped)return false;for(var i=0;i<analysis.groups.length;i++){var a=analysis.groups[i],b=snapshot.analysis.groups[i];if(a.hex!==b.hex||a.targets.length!==b.targets.length)return false;for(var j=0;j<a.targets.length;j++)if(a.targets[j].item!==b.targets[j].item)return false;}return true;}
function readSelection(onlyChanged){try{
 if(!app.documents.length){snapshot=null;throw Error('Abre un documento de Illustrator.');}
 var doc=app.activeDocument,analysis=ThreadMatch.collectSelection(doc),groups=[],i,j,ranked,matches;
 if(onlyChanged&&sameSelection(doc)&&sameAnalysis(analysis))return stringify({ok:true,unchanged:true});
 for(i=0;i<analysis.groups.length;i++){ranked=matcher(analysis.groups[i].rgb,5);matches=[];for(j=0;j<ranked.length;j++)matches.push({code:ranked[j].code,name:ranked[j].name,hex:ranked[j].thread.hex,deltaE:ranked[j].deltaE,description:ThreadMatch.matchDescription(ranked[j].deltaE)});groups.push({hex:analysis.groups[i].hex,rgb:analysis.groups[i].rgb,count:analysis.groups[i].targets.length,matches:matches});}
 snapshot={doc:doc,analysis:analysis,selection:selectionIdentity(doc),token:++sequence};return stringify({ok:true,token:sequence,groups:groups,skipped:analysis.skipped});
}catch(e){snapshot=null;return failure(e);}}
return {
 scan:function(){return readSelection(false);},
 watch:function(){return readSelection(true);},
 act:function(token,index,code,action){try{
  validateSnapshot(token);if(action!=='apply'&&action!=='label')throw Error('Acción inválida.');
  if(typeof index!=='number'||index<0||Math.floor(index)!==index||index>=snapshot.analysis.groups.length)throw Error('Color inválido.');
  var bucket=snapshot.analysis.groups[index],thread=null,i;
  for(i=0;i<ThreadMatch.catalog.colors.length;i++)if(ThreadMatch.catalog.colors[i].code===code){thread=ThreadMatch.catalog.colors[i];break;}
  if(!thread)throw Error('Código de hilo desconocido.');
  for(i=0;i<bucket.targets.length;i++){if(ThreadMatch.rgbToHex(ThreadMatch.illustratorColorToRGB(ThreadMatch.getTargetFill(bucket.targets[i])))!==bucket.hex)throw Error('Cambió un relleno del diseño. Espera a la sincronización o pulsa Actualizar.');}
  if(action==='apply'){ThreadMatch.applyThread(snapshot.doc,bucket,thread);snapshot=null;}
  else ThreadMatch.createThreadLabel(snapshot.doc,bucket,thread);
  app.redraw();return stringify({ok:true,code:code,action:action});
 }catch(e){return failure(e);}}
};
