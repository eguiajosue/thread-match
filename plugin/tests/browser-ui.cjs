const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('path'),fs=require('fs');const T=require('../../dist/threadmatch-core.js');
(async()=>{const browser=await chromium.launch({headless:true}),screens=path.resolve('ui-test-results');fs.mkdirSync(screens,{recursive:true});
for(const size of [{width:300,height:420},{width:340,height:480}]){
 const page=await browser.newPage({viewport:size}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const group=rgb=>({hex:T.rgbToHex(rgb),rgb,count:2,matches:T.findClosestMadeiraColors(rgb,5).map(r=>({code:r.code,name:r.name,hex:r.thread.hex,deltaE:r.deltaE,description:T.matchDescription(r.deltaE)}))});
 const data={ok:true,token:1,groups:[group({r:22,g:87,b:171}),group({r:233,g:33,b:120})],skipped:0};
 await page.addInitScript(data=>{window.uiCalls=[];window.currentScan=data;window.__adobe_cep__={evalScript(script,callback){window.uiCalls.push(script);let result;if(script.includes('.scan('))result=window.currentScan;else if(script.includes('.watch(')){result=window.nextScan||{ok:true,unchanged:true};window.nextScan=null;}else result={ok:true,code:'5990',action:'label'};setTimeout(()=>callback(JSON.stringify(result)),10);}};},data);
 await page.goto('file://'+path.resolve('plugin/com.threadmatch.illustrator/index.html'));await page.waitForSelector('.match');assert.equal(await page.locator('#matches .match').count(),5);
 async function noScroll(){assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth),'Panel overflows at '+JSON.stringify(size));}
 await noScroll();await page.screenshot({path:path.join(screens,'threads-'+size.width+'.png')});
 const before=await page.evaluate(()=>uiCalls.filter(s=>s.includes(',"label")')).length);await page.locator('#matches .match').nth(2).dblclick();await page.waitForFunction(before=>uiCalls.filter(s=>s.includes(',"label")')).length===before+1,before);assert.equal(await page.evaluate(()=>uiCalls.filter(s=>s.includes(',"label")')).length),before+1);
 await page.selectOption('#colors','1');assert.equal(await page.locator('#rgb').textContent(),'RGB 233 / 33 / 120');
 await page.click('#tab-label');await noScroll();await page.screenshot({path:path.join(screens,'label-'+size.width+'.png')});await page.click('#tab-threads');
 await page.evaluate(()=>{window.nextScan={...currentScan,token:2,groups:[{...currentScan.groups[0],rgb:{r:1,g:2,b:3},hex:'#010203'}]};});await page.waitForFunction(()=>document.querySelector('#rgb').textContent==='RGB 1 / 2 / 3');
 await page.click('#tab-search');assert.equal(await page.locator('#catalog-results .match').count(),5);await noScroll();
 await page.click('#next-page');assert.ok((await page.locator('#search-count').textContent()).includes('2 / 32'));
 await page.fill('#search-query','#5800');assert.equal(await page.locator('#catalog-results .match').count(),1);
 await page.locator('#catalog-results .match').click();await page.click('#search-label');await page.waitForFunction(()=>uiCalls.some(s=>s.includes(',"5800","label")')));
 await page.fill('#search-query','BLACK');assert.ok(await page.locator('#catalog-results .match').count()>0);await noScroll();
 await page.fill('#search-query','no-such-thread');assert.equal(await page.locator('#catalog-results .match').count(),0);assert.ok((await page.locator('#catalog-results').textContent()).includes('No hay hilos'));
 await page.fill('#search-query','');await noScroll();await page.screenshot({path:path.join(screens,'search-'+size.width+'.png')});
 assert.equal(errors.length,0);await page.close();
}
await browser.close();console.log('Browser UI checks passed: no scroll, double click, color change, automatic selection.');})().catch(e=>{console.error(e);process.exit(1);});
