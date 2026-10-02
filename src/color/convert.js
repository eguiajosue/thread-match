/* ES3-compatible. XYZ normalized 0..1, Lab D65 2-degree observer. */
var ThreadMatch = typeof ThreadMatch !== 'undefined' ? ThreadMatch : {};
(function(T){
 T.validateRGB=function(c){var keys=['r','g','b'],i,v; if(!c)throw Error('Color RGB ausente.'); for(i=0;i<3;i++){v=c[keys[i]]; if(typeof v!=='number'||!isFinite(v)||v<0||v>255)throw Error('RGB fuera de rango.');}return c;};
 T.rgbToXYZ=function(c){T.validateRGB(c);function lin(v){v/=255;return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4);}var r=lin(c.r),g=lin(c.g),b=lin(c.b);return {x:r*.4124564+g*.3575761+b*.1804375,y:r*.2126729+g*.7151522+b*.072175,z:r*.0193339+g*.119192+b*.9503041};};
 T.xyzToLab=function(c){function f(v){return v>216/24389?Math.pow(v,1/3):(24389/27*v+16)/116;}var x=f(c.x/.95047),y=f(c.y),z=f(c.z/1.08883);return {l:116*y-16,a:500*(x-y),b:200*(y-z)};};
 T.rgbToLab=function(c){return T.xyzToLab(T.rgbToXYZ(c));};
 T.rgbToHex=function(c){T.validateRGB(c);function h(v){var s=Math.round(v).toString(16).toUpperCase();return s.length<2?'0'+s:s;}return '#'+h(c.r)+h(c.g)+h(c.b);};
}(ThreadMatch));
