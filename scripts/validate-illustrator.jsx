#target illustrator
/* Run manually via File > Scripts > Other Script. Creates temporary documents only. */
(function(){
 var root=File($.fileName).parent.parent,host=new File(root.fsName+'/plugin/com.threadmatch.illustrator/jsx/host.jsx');
 if(!host.exists){host=File.openDialog('Selecciona host.jsx de ThreadMatch');if(!host)return;}
 $.evalFile(host);
 var result=['version,illustrator,os,mode,objects,iteration,read_ms,rank_ms,total_ms,colors,apply_recover'],counts=[100,1000,10000],modes=[DocumentColorSpace.RGB,DocumentColorSpace.CMYK],doc=null,previous=null;
 try{if(app.documents.length)previous=app.activeDocument;
 for(var m=0;m<modes.length;m++)for(var n=0;n<counts.length;n++){
  doc=app.documents.add(modes[m],1000,1000);var selection=[],i,p,c,before=[];
  for(i=0;i<counts[n];i++){p=doc.pathItems.rectangle(990-Math.floor(i/100)*8,10+(i%100)*8,6,6);p.stroked=false;p.filled=true;c=new RGBColor();c.red=(i%8)*31;c.green=(i%8)*23;c.blue=240-(i%8)*25;p.fillColor=c;selection.push(p);before.push(p.fillColor);}
  doc.selection=selection;
  for(i=0;i<10;i++){var scan=eval('('+ThreadMatchCEP.scan('pdf')+')'),recovered='not_run';if(!scan.ok)throw Error(scan.error);
   if(counts[n]===100&&i===0){var assignments=[];for(var g=0;g<scan.groups.length;g++)assignments.push({hex:scan.groups[g].hex,code:scan.groups[g].matches[0].code,reviewed:true,exclude:false,locked:false});var applied=eval('('+ThreadMatchCEP.batch(scan.token,assignments,'apply',{},'native-'+m+'-'+new Date().getTime())+')');if(!applied.ok)throw Error(applied.error);var restore=eval('('+ThreadMatchCEP.recover()+')');if(!restore.ok)throw Error(restore.error);for(var a=0;a<selection.length;a++)if(selection[a].fillColor.typename!==before[a].typename)throw Error('No se restaur\u00f3 el tipo de relleno original.');recovered='pass_type_check';}
   var metrics=scan.metrics||{};result.push(['0.7.0',app.version,$.os,m===0?'RGB':'CMYK',counts[n],i,metrics.readMs||'',metrics.rankMs||'',metrics.totalMs||'',scan.groups.length,recovered].join(','));
  }
  doc.close(SaveOptions.DONOTSAVECHANGES);doc=null;
 }
 var file=File.saveDialog('Guardar resultados de validaci\u00f3n ThreadMatch \u00b7 CSV');if(file){file.encoding='UTF-8';if(!file.open('w'))throw Error('No se pudo guardar el informe.');file.write(result.join('\n'));file.close();}alert('Banco de lectura completado. La matriz manual de grupos, texto, leyendas, cierres y fallos sigue pendiente.');
 }catch(e){alert('Validaci\u00f3n detenida: '+e.message);}finally{if(doc)try{doc.close(SaveOptions.DONOTSAVECHANGES);}catch(ignore){}if(previous)try{previous.activate();}catch(ignore2){}}
}());
