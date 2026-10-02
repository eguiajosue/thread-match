(function(T){
 T.deltaE2000=function(p,q){
 var pi=Math.PI, rad=pi/180; function sq(x){return x*x;}function cos(x){return Math.cos(x*rad);}function sin(x){return Math.sin(x*rad);}function hp(a,b){var h=Math.atan2(b,a)/rad;return h<0?h+360:h;}
 var c1=Math.sqrt(sq(p.a)+sq(p.b)),c2=Math.sqrt(sq(q.a)+sq(q.b)),cm=(c1+c2)/2,c7=Math.pow(cm,7),g=.5*(1-Math.sqrt(c7/(c7+Math.pow(25,7))));
 var a1=(1+g)*p.a,a2=(1+g)*q.a,cp1=Math.sqrt(sq(a1)+sq(p.b)),cp2=Math.sqrt(sq(a2)+sq(q.b)),h1=cp1===0?0:hp(a1,p.b),h2=cp2===0?0:hp(a2,q.b);
 var dl=q.l-p.l,dc=cp2-cp1,dh=h2-h1;
 if(cp1*cp2===0)dh=0;else if(dh>180)dh-=360;else if(dh< -180)dh+=360;
 var dH=2*Math.sqrt(cp1*cp2)*sin(dh/2),lm=(p.l+q.l)/2,cp=(cp1+cp2)/2,hm;
 if(cp1*cp2===0)hm=h1+h2;else if(Math.abs(h1-h2)<=180)hm=(h1+h2)/2;else hm=(h1+h2+(h1+h2<360?360:-360))/2;
 var tt=1-.17*cos(hm-30)+.24*cos(2*hm)+.32*cos(3*hm+6)-.20*cos(4*hm-63),sl=1+.015*sq(lm-50)/Math.sqrt(20+sq(lm-50)),sc=1+.045*cp,sh=1+.015*cp*tt;
 var rc=2*Math.sqrt(Math.pow(cp,7)/(Math.pow(cp,7)+Math.pow(25,7))),rt=-rc*sin(60*Math.exp(-sq((hm-275)/25))),vL=dl/sl,vC=dc/sc,vH=dH/sh;
 return Math.sqrt(Math.max(0,sq(vL)+sq(vC)+sq(vH)+rt*vC*vH));
 };
}(ThreadMatch));
