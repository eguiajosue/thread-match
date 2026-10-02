const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');
const names=['color/convert.js','color/deltaE2000.js','matching/matcher.js','illustrator/selection.js','illustrator/swatches.js','illustrator/labels.js'];
const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
const manifestPath=path.join(root,'plugin/com.threadmatch.illustrator/CSXS/manifest.xml');
const manifest=fs.readFileSync(manifestPath,'utf8').replace(/ExtensionBundleVersion="[^"]+"/,'ExtensionBundleVersion="'+version+'"').replace(/(<Extension Id="com.threadmatch.illustrator.panel" Version=")[^"]+/,'$1'+version);
fs.writeFileSync(manifestPath,manifest);
const source=names.map(n=>fs.readFileSync(path.join(root,'src',n),'utf8')).join('\n');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/madeira-polystitch.json'),'utf8'));
const host='/* ThreadMatch CEP '+version+' */\nvar ThreadMatchCEP=(function(){\n'+source+'\nThreadMatch.catalog='+JSON.stringify(catalog)+';\n'+fs.readFileSync(path.join(root,'plugin/bridge.jsx'),'utf8')+'\n}());\n';
fs.writeFileSync(path.join(root,'plugin/com.threadmatch.illustrator/jsx/host.jsx'),host.replace(/[^\x00-\x7f]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0')));
console.log('Built CEP host: '+catalog.colors.length+' colors');

fs.writeFileSync(path.join(root,'plugin/com.threadmatch.illustrator/js/catalog.js'),'window.ThreadMatchCatalog='+JSON.stringify(catalog.colors.map(c=>({code:c.code,name:c.name,hex:c.hex})))+';\n');
