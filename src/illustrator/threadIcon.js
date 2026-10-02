(function(T){
 T.createThreadIcon=function(parent,left,top,height,thread){
  var data=T.THREAD_ICON,scale=height/data.viewBox[3],group=parent.groupItems.add(),i,j,k,shape,container,item,point,p,rgb;
  group.name='Icono de hilo '+thread.code;
  function coordinate(x,y){return [left+(x-data.viewBox[0])*scale,top-(y-data.viewBox[1])*scale];}
  try{for(i=0;i<data.paths.length;i++){
   shape=data.paths[i];container=shape.contours.length>1?group.compoundPathItems.add():group;rgb=shape.role==='thread'?T.threadRGBColor(thread):new RGBColor();if(shape.role!=='thread'){rgb.red=shape.rgb[0];rgb.green=shape.rgb[1];rgb.blue=shape.rgb[2];}
   for(j=0;j<shape.contours.length;j++){
    item=container.pathItems.add();item.evenodd=false;item.stroked=false;item.filled=true;
    for(k=0;k<shape.contours[j].points.length;k++){p=shape.contours[j].points[k];point=item.pathPoints.add();point.anchor=coordinate(p[0],p[1]);point.leftDirection=coordinate(p[2],p[3]);point.rightDirection=coordinate(p[4],p[5]);point.pointType=PointType.CORNER;}
    item.closed=shape.contours[j].closed;item.fillColor=rgb;
   }
   (shape.contours.length>1?container:item).name=shape.role==='thread'?'Color del hilo':'Detalle original del icono';
  }return group;}catch(e){try{group.remove();}catch(ignore){}throw e;}
 };
}(ThreadMatch));
