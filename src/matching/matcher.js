(function(T){
 T.MATCH_THRESHOLDS={excellent:2,good:5,acceptable:10};
 T.matchDescription=function(d){return d<=T.MATCH_THRESHOLDS.excellent?'Muy cercano':d<=T.MATCH_THRESHOLDS.good?'Cercano':d<=T.MATCH_THRESHOLDS.acceptable?'Alternativa':'Diferencia alta';};
 T.createMatcher=function(catalog){
  if(!catalog||catalog.schemaVersion!==1||catalog.colorSpace!=='sRGB'||catalog.whitePoint!=='D65'||!catalog.colors||!catalog.colors.length)throw Error('Catálogo ausente o incompatible.');
  var colors=catalog.colors,i,c,seen={};
  for(i=0;i<colors.length;i++){c=colors[i];if(!/^\d{4}$/.test(c.code)||!c.name||seen[c.code])throw Error('Catálogo con datos inválidos o códigos duplicados.');seen[c.code]=true;T.validateRGB(c.rgb);if(!c.lab)c.lab=T.rgbToLab(c.rgb);if(!isFinite(c.lab.l)||!isFinite(c.lab.a)||!isFinite(c.lab.b))throw Error('LAB inválido.');}
  return function(input,limit){var lab=T.rgbToLab(input),results=[],j;limit=limit===undefined?5:limit;if(typeof limit!=='number'||!isFinite(limit)||limit<1||Math.floor(limit)!==limit)throw Error('Límite inválido.');for(j=0;j<colors.length;j++){results.push({thread:colors[j],code:colors[j].code,name:colors[j].name,deltaE:T.deltaE2000(lab,colors[j].lab)});}results.sort(function(a,b){return a.deltaE-b.deltaE||(a.code<b.code?-1:a.code>b.code?1:0);});return results.slice(0,limit);};
 };
}(ThreadMatch));
