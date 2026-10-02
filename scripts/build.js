const fs=require('fs'),path=require('path'),vm=require('vm');const root=path.resolve(__dirname,'..');
require('./build-thread-icon');
const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
const files=['color/convert.js','color/deltaE2000.js','matching/matcher.js','color/references.js','color/measured.js','design/palette.js','illustrator/selection.js','illustrator/swatches.js','illustrator/transaction.js','illustrator/threadIconData.js','illustrator/threadIcon.js','illustrator/labels.js','ui/matcherDialog.js'];
const core=files.slice(0,6).map(f=>fs.readFileSync(path.join(root,'src',f),'utf8')).join('\n');
const context={};vm.createContext(context);vm.runInContext(core,context);
const cat=JSON.parse(fs.readFileSync(path.join(root,'data/madeira-polystitch.json'),'utf8'));
cat.colors.forEach(c=>{if(!c.lab||!c.source||!c.source.calibrated)c.lab=context.ThreadMatch.rgbToLab(c.rgb);});context.ThreadMatch.createMatcher(cat);
fs.writeFileSync(path.join(root,'data/madeira-polystitch.json'),JSON.stringify(cat,null,2)+'\n');
const body=files.map(f=>'\n// '+f+'\n'+fs.readFileSync(path.join(root,'src',f),'utf8')).join('\n');
const jsx='#target illustrator\n/* ThreadMatch '+version+' - bundled ES3; no external runtime required */\n(function(){\n'+body+'\nThreadMatch.catalog='+JSON.stringify(cat)+';\nThreadMatch.VERSION='+JSON.stringify(version)+';\n'+fs.readFileSync(path.join(root,'src/main.jsx'),'utf8')+'\n}());\n';
// Illustrator may read JSX as a legacy Windows encoding. ASCII escapes preserve UI text.
fs.writeFileSync(path.join(root,'dist/ThreadMatch.jsx'),jsx.replace(/[^\x00-\x7F]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0')));
console.log('Built dist/ThreadMatch.jsx: '+cat.colors.length+' colors');

fs.writeFileSync(path.join(root,'dist/threadmatch-core.js'),core+'\nThreadMatch.catalog='+JSON.stringify(cat)+';\nThreadMatch.findClosestMadeiraColors=ThreadMatch.createMatcher(ThreadMatch.catalog);\nif(typeof module!==\"undefined\" && module.exports)module.exports=ThreadMatch;\n');
