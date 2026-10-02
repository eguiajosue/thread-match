(function(T){
 T.measuredCatalog=function(catalog,data){
  if(!data||data.schemaVersion!==1||data.whitePoint!=='D65'||data.observer!=='2deg'||!data.source||data.source.calibrated!==true||!data.source.instrument||!data.source.method||!data.source.date||!data.source.author)throw Error('La referencia Lab requiere D65, observador 2deg y procedencia de medición completa.');
  var required=['instrument','method','date','author'];for(var f=0;f<required.length;f++)if(typeof data.source[required[f]]!=='string'||!data.source[required[f]].length||data.source[required[f]].length>300)throw Error('Procedencia de medición inválida.');if(!/^\d{4}-\d{2}-\d{2}$/.test(data.source.date))throw Error('Fecha de medición inválida.');
  if(!(data.colors instanceof Array)||data.colors.length!==catalog.colors.length)throw Error('La referencia medida debe contener los 160 códigos del catálogo.');var lookup={},colors=[],i,j,c,m,k;
  for(i=0;i<data.colors.length;i++){m=data.colors[i];if(!m||typeof m.code!=='string'||lookup[m.code]||!m.lab||typeof m.lab.l!=='number'||!isFinite(m.lab.l)||m.lab.l<0||m.lab.l>100||typeof m.lab.a!=='number'||!isFinite(m.lab.a)||Math.abs(m.lab.a)>160||typeof m.lab.b!=='number'||!isFinite(m.lab.b)||Math.abs(m.lab.b)>160)throw Error('Código duplicado o Lab inválido.');T.validateRGB(m.rgb);lookup[m.code]=m;}
  for(i=0;i<catalog.colors.length;i++){c=catalog.colors[i];m=lookup[c.code];if(!m)throw Error('Falta el hilo '+c.code);k={};for(j in c)if(c.hasOwnProperty(j))k[j]=c[j];k.rgb={r:m.rgb.r,g:m.rgb.g,b:m.rgb.b};k.hex=T.rgbToHex(k.rgb);k.lab={l:m.lab.l,a:m.lab.a,b:m.lab.b};k.source=data.source;k.referenceMode='measured';colors.push(k);}
  return {schemaVersion:1,colorSpace:'sRGB',colors:colors,whitePoint:'D65',source:data.source};
 };
}(ThreadMatch));
