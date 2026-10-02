const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');
const names=['color/convert.js','color/deltaE2000.js','matching/matcher.js','color/references.js','color/measured.js','design/palette.js','illustrator/selection.js','illustrator/swatches.js','illustrator/transaction.js','illustrator/labels.js'];
const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
const manifestPath=path.join(root,'plugin/com.threadmatch.illustrator/CSXS/manifest.xml');
const manifest=fs.readFileSync(manifestPath,'utf8').replace(/ExtensionBundleVersion="[^"]+"/,'ExtensionBundleVersion="'+version+'"').replace(/(<Extension Id="com.threadmatch.illustrator.panel" Version=")[^"]+/,'$1'+version);
fs.writeFileSync(manifestPath,manifest);
const source=names.map(n=>fs.readFileSync(path.join(root,'src',n),'utf8')).join('\n');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/madeira-polystitch.json'),'utf8'));
const host='/* ThreadMatch CEP '+version+' */\nvar ThreadMatchCEP=(function(){\n'+source+'\nThreadMatch.catalog='+JSON.stringify(catalog)+';\n'+fs.readFileSync(path.join(root,'plugin/bridge.jsx'),'utf8')+'\n}());\n';
fs.writeFileSync(path.join(root,'plugin/com.threadmatch.illustrator/jsx/host.jsx'),host.replace(/[^\x00-\x7f]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0')));
console.log('Built CEP host: '+catalog.colors.length+' colors');

const T=require('../dist/threadmatch-core.js'),panelCatalog={};
for(const mode of ['pdf','montage'])panelCatalog[mode]=T.catalogForReference(catalog,mode).colors.map(c=>({code:c.code,name:c.name,hex:c.hex}));
fs.writeFileSync(path.join(root,'plugin/com.threadmatch.illustrator/js/catalog.js'),'window.ThreadMatchCatalog='+JSON.stringify(panelCatalog)+';\n');

fs.copyFileSync(path.join(root,'dist/threadmatch-core.js'),path.join(root,'plugin/com.threadmatch.illustrator/js/engine.js'));
fs.writeFileSync(path.join(root,'plugin/com.threadmatch.illustrator/js/version.js'),'window.ThreadMatchVersion='+JSON.stringify({version,channel:JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).releaseChannel||'stable',nativeValidated:false})+';\n');

const crypto=require('crypto');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const checks=walk(path.join(root,'plugin/com.threadmatch.illustrator')).sort().map(p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')+'  '+path.relative(path.join(root,'plugin'),p).split(path.sep).join('/'));
fs.writeFileSync(path.join(root,'plugin/INTEGRITY.sha256'),checks.join('\n')+'\n');
