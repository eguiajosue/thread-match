const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),T=require('../dist/threadmatch-core.js');
test('PDF audit matches all 160 catalog entries and preserves the original source',()=>{
 const audit=JSON.parse(fs.readFileSync(path.join(root,'data/color-audit.json'),'utf8'));
 assert.equal(audit.sourceSHA256,T.catalog.source.sha256);assert.equal(audit.exactReproductions,160);
 const entries=new Map(audit.colors.map(c=>[c.code,c]));assert.equal(entries.size,160);
 for(const c of T.catalog.colors){const a=entries.get(c.code);assert.equal(a.name,c.name);assert.deepEqual(a.catalogRGB,c.rgb);assert.deepEqual(a.sampleRGB,c.rgb);assert.equal(a.hex,c.hex);assert.ok(a.rendererDeltaE00<2);}
});
test('Montage adjusts exactly three whites without changing PDF data or other colors',()=>{
 const before=JSON.stringify(T.catalog),adjusted=T.catalogForReference(T.catalog,'montage');
 const changed=adjusted.colors.filter((c,i)=>c.hex!==T.catalog.colors[i].hex);
 assert.deepEqual(changed.map(c=>c.code),['5801','5802','5803']);
 assert.equal(changed.find(c=>c.code==='5801').hex,'#FFFFFF');
 for(const c of changed){assert.ok(Math.min(c.rgb.r,c.rgb.g,c.rgb.b)>230);assert.equal(c.referenceMode,'montage');assert.equal(c.hex,T.rgbToHex(c.rgb));assert.deepEqual(c.lab,T.rgbToLab(c.rgb));}
 assert.equal(JSON.stringify(T.catalog),before);assert.equal(T.catalogForReference(T.catalog,'pdf'),T.catalog);
 assert.throws(()=>T.catalogForReference(T.catalog,'invalid'));assert.throws(()=>T.normalizeWhiteRGB({r:255,g:255,b:255},{r:0,g:0,b:0}));
 const match=T.createMatcher(adjusted);for(const c of changed)assert.ok(match(c.rgb,160).some(r=>r.code===c.code&&r.deltaE<1e-10));
});
test('Generated panel catalog agrees with host color references for every thread',()=>{
 const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'plugin/com.threadmatch.illustrator/js/catalog.js'),'utf8'),ctx);
 for(const reference of ['pdf','montage']){const host=T.catalogForReference(T.catalog,reference).colors,panel=ctx.window.ThreadMatchCatalog[reference];assert.equal(panel.length,160);for(let i=0;i<160;i++){assert.equal(panel[i].code,host[i].code);assert.equal(panel[i].name,host[i].name);assert.equal(panel[i].hex,host[i].hex);}}
});
