ThreadMatch.stage='Inicio';
ThreadMatch.reportError=function(error){
 var message='ThreadMatch '+ThreadMatch.VERSION+'\n\n'+(error.message||'No se pudo completar la operación.');
 message+='\n\nEtapa: '+ThreadMatch.stage;
 if(error.number!==undefined)message+='\nCódigo: '+error.number;
 if(error.line!==undefined)message+='\nLínea: '+error.line;
 alert(message);
};
try {
 if(!app.documents.length)throw Error('Abre un documento de Illustrator antes de ejecutar ThreadMatch.');
 var doc=app.activeDocument;
 ThreadMatch.stage='Cargar catálogo';
 var matcher=ThreadMatch.createMatcher(ThreadMatch.catalog);
 ThreadMatch.stage='Leer selección';
 var analysis=ThreadMatch.collectSelection(doc);
 var choice=ThreadMatch.showMatcherDialog(analysis,matcher);
 if(choice){
  if(choice.action==='apply'){ThreadMatch.stage='Aplicar hilo';ThreadMatch.applyThread(doc,choice.bucket,choice.thread);}
  else {ThreadMatch.stage='Crear etiqueta';ThreadMatch.createThreadLabel(doc,choice.bucket,choice.thread);}
  ThreadMatch.stage='Actualizar documento';app.redraw();
 }
} catch(error){ThreadMatch.reportError(error);}
