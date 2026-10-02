const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),ctx={};vm.createContext(ctx);
for(const f of ['color/convert.js','color/deltaE2000.js','matching/matcher.js'])vm.runInContext(fs.readFileSync(path.join(root,'src',f),'utf8'),ctx);
const T=ctx.ThreadMatch,catalog=JSON.parse(fs.readFileSync(path.join(root,'data/madeira-polystitch.json'))),match=T.createMatcher(catalog);
function close(a,b,e=1e-4){assert.ok(Math.abs(a-b)<=e,`${a} != ${b}`);}
test('RGB → XYZ D65 known primary and white',()=>{const r=T.rgbToXYZ({r:255,g:0,b:0}),w=T.rgbToXYZ({r:255,g:255,b:255});close(r.x,.4124564);close(r.y,.2126729);close(r.z,.0193339);close(w.x,.95047);close(w.y,1);close(w.z,1.08883);});
test('XYZ → Lab D65 reference white',()=>{const l=T.xyzToLab({x:.95047,y:1,z:1.08883});close(l.l,100);close(l.a,0);close(l.b,0);});
test('RGB → Lab red, black, gamma branch',()=>{const r=T.rgbToLab({r:255,g:0,b:0});close(r.l,53.2408);close(r.a,80.0925);close(r.b,67.2032);close(T.rgbToLab({r:0,g:0,b:0}).l,0);close(T.rgbToXYZ({r:10,g:10,b:10}).y,(10/255)/12.92);});
const pairs=fs.readFileSync(path.join(__dirname,'ciede2000-sharma.txt'),'utf8').trim().split(/\r?\n/).map(l=>l.trim().split(/\s+/).map(Number));
assert.equal(pairs.length,34);
for(const [i,v] of pairs.entries())test('Sharma CIEDE2000 reference pair '+(i+1),()=>{const a={l:v[0],a:v[1],b:v[2]},b={l:v[3],a:v[4],b:v[5]};close(T.deltaE2000(a,b),v[6],.00005);close(T.deltaE2000(b,a),v[6],.00005);});
test('All 160 catalog colors match themselves and results are sorted',()=>{assert.equal(catalog.colors.length,160);for(const c of catalog.colors){const result=match(c.rgb,160);assert.ok(result.some(x=>x.code===c.code&&x.deltaE<1e-10));assert.ok(result[0].deltaE<1e-10);for(let i=1;i<result.length;i++)assert.ok(result[i].deltaE>=result[i-1].deltaE);assert.equal(T.rgbToHex(c.rgb),c.hex);}});
test('Top 5, independent matcher and validation',()=>{assert.equal(match({r:22,g:87,b:171}).length,5);for(const rgb of [{r:-1,g:0,b:0},{r:0,g:NaN,b:0},{r:256,g:0,b:0}])assert.throws(()=>match(rgb));for(const n of [0,-1,1.5,NaN,'5'])assert.throws(()=>match({r:0,g:0,b:0},n));assert.throws(()=>T.createMatcher(null));assert.throws(()=>T.createMatcher({...catalog,whitePoint:'D50'}));const dup=JSON.parse(JSON.stringify(catalog));dup.colors.push(dup.colors[0]);assert.throws(()=>T.createMatcher(dup));});
