(function(root){
 'use strict';
 var key='threadmatch.favorites.v1';
 function create(storage,knownCodes){
  var codes=[],allowed={},persisted=true;
  knownCodes.forEach(function(code){allowed[code]=true;});
  function reload(){
   var raw;
   try{raw=storage.getItem(key);}catch(e){persisted=false;return;}
   try{var parsed=raw?JSON.parse(raw):[],seen={};if(!Array.isArray(parsed))return;codes=parsed.filter(function(code){if(typeof code!=='string'||!allowed[code]||seen[code])return false;seen[code]=true;return true;});}catch(e){/* Keep usable session data when persisted JSON is invalid. */}
  }
  reload();
  return {
   list:function(){return codes.slice();},
   has:function(code){return codes.indexOf(code)!==-1;},
   reload:reload,
   toggle:function(code){
    if(!allowed[code])throw Error('Código de hilo desconocido.');
    var index=codes.indexOf(code);if(index===-1)codes.unshift(code);else codes.splice(index,1);
    try{storage.setItem(key,JSON.stringify(codes));persisted=true;}catch(e){persisted=false;}
    return {added:index===-1,persisted:persisted};
   }
  };
 }
 var api={key:key,create:create};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ThreadMatchFavorites=api;
}(this));
