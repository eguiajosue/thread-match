(function(T){
 // A display adjustment, not physical calibration. Divide linear-light RGB
 // by the photographed anchor white, then encode back to sRGB.
 T.normalizeWhiteRGB=function(rgb,anchor){
  T.validateRGB(rgb);T.validateRGB(anchor);
  function linear(v){v/=255;return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4);}
  function channel(v,w){var denominator=linear(w);if(denominator<=0)throw Error('Referencia blanca inválida.');var x=Math.min(1,linear(v)/denominator);return Math.round(255*(x<=0.0031308?12.92*x:1.055*Math.pow(x,1/2.4)-0.055));}
  return {r:channel(rgb.r,anchor.r),g:channel(rgb.g,anchor.g),b:channel(rgb.b,anchor.b)};
 };
 T.catalogForReference=function(catalog,reference){
  reference=reference||'pdf';if(reference!=='pdf'&&reference!=='montage')throw Error('Referencia de color inválida.');
  var policy=catalog.references&&catalog.references.montage,anchor=null,i,j,colors=[],original,c;
  if(reference==='montage'&&!policy)throw Error('El catálogo no incluye la referencia de montaje.');
  for(i=0;i<catalog.colors.length;i++)if(policy&&catalog.colors[i].code===policy.anchorCode)anchor=catalog.colors[i].rgb;
  if(reference==='montage'&&!anchor)throw Error('Falta la referencia blanca del catálogo.');
  for(i=0;i<catalog.colors.length;i++){
   original=catalog.colors[i];c={};for(j in original)if(original.hasOwnProperty(j))c[j]=original[j];
   if(reference==='montage')for(j=0;j<policy.adjustedCodes.length;j++)if(c.code===policy.adjustedCodes[j]){
    c.rgb=T.normalizeWhiteRGB(original.rgb,anchor);c.hex=T.rgbToHex(c.rgb);c.lab=T.rgbToLab(c.rgb);c.referenceMode='montage';break;
   }
   // Explicit user value applies to both digital references; keep PDF audit intact.
   if(c.code==='5801'){c.rgb={r:249,g:249,b:249};c.hex='#F9F9F9';c.lab=T.rgbToLab(c.rgb);c.colorOverride=c.hex;}
   colors.push(c);
  }
  var result={};for(j in catalog)if(catalog.hasOwnProperty(j))result[j]=catalog[j];result.colors=colors;return result;
 };
}(ThreadMatch));
