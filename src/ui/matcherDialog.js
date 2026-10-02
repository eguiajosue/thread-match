(function(T){
 T.showMatcherDialog=function(analysis,match){
  T.stage='Crear interfaz';
  var w=new Window('dialog','ThreadMatch · Madeira Polystitch 40'),choice=null,i,results=[],active;
  w.orientation='column';w.alignChildren='fill';w.spacing=10;w.margins=16;
  w.add('statictext',undefined,'COLORES DE LA SELECCIÓN · '+analysis.groups.length);
  var select=w.add('dropdownlist');
  for(i=0;i<analysis.groups.length;i++)select.add('item',analysis.groups[i].hex+' · '+analysis.groups[i].targets.length+' rellenos');
  var input=w.add('group'),chip=input.add('panel'),info=input.add('statictext',undefined,'',{multiline:true});chip.preferredSize=[54,48];info.preferredSize=[380,48];
  function paint(control,rgb){control.onDraw=function(){var g=this.graphics;g.rectPath(0,0,this.size[0],this.size[1]);g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR,[rgb.r/255,rgb.g/255,rgb.b/255,1]));};}
  var panel=w.add('panel',undefined,'Coincidencias sugeridas · ΔE00'),rows=[],radios=[];
  panel.orientation='column';panel.alignChildren='fill';panel.margins=12;
  for(i=0;i<5;i++){
   var row=panel.add('group'),radio=row.add('radiobutton',undefined,''),sample=row.add('panel'),label=row.add('statictext',undefined,'',{multiline:true});sample.preferredSize=[34,34];label.preferredSize=[360,34];rows.push({sample:sample,label:label});radios.push(radio);
   radio.onClick=(function(index){return function(){for(var j=0;j<radios.length;j++)radios[j].value=j===index;};})(i);
  }
  var warning=w.add('statictext',undefined,'Referencia digital sin calibración física. Verifica con la carta de hilo.',{multiline:true});warning.preferredSize=[440,36];
  if(analysis.skipped)w.add('statictext',undefined,analysis.skipped+' elementos o rellenos omitidos (sin relleno o no compatibles).');
  var buttons=w.add('group'),apply=buttons.add('button',undefined,'Aplicar hilo'),labelButton=buttons.add('button',undefined,'Crear etiqueta');buttons.add('button',undefined,'Cerrar',{name:'cancel'});
  function update(){T.stage='Actualizar coincidencias';active=analysis.groups[select.selection.index];results=match(active.rgb,5);paint(chip,active.rgb);var lab=T.rgbToLab(active.rgb);info.text=active.hex+'   RGB '+Math.round(active.rgb.r)+' / '+Math.round(active.rgb.g)+' / '+Math.round(active.rgb.b)+'\nLAB '+lab.l.toFixed(1)+' / '+lab.a.toFixed(1)+' / '+lab.b.toFixed(1);for(var j=0;j<rows.length;j++){rows[j].label.visible=rows[j].sample.visible=radios[j].visible=!!results[j];if(!results[j])continue;rows[j].label.text=results[j].code+' · '+results[j].name+'\nΔE00 '+results[j].deltaE.toFixed(2)+' · '+T.matchDescription(results[j].deltaE);paint(rows[j].sample,results[j].thread.rgb);radios[j].value=j===0;}w.layout.layout(true);if(w.visible)w.update();}
  function pick(action){for(var j=0;j<radios.length;j++)if(radios[j].value){choice={action:action,bucket:active,thread:results[j].thread};w.close(1);return;}}
  apply.onClick=function(){pick('apply');};labelButton.onClick=function(){pick('label');};select.selection=0;update();select.onChange=function(){try{update();}catch(e){T.reportError(e);}};T.stage='Mostrar interfaz';w.show();return choice;
 };
}(ThreadMatch));
