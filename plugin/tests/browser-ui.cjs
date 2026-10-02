const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('path'),fs=require('fs');const T=require('../../dist/threadmatch-core.js');
(async()=>{const browser=await chromium.launch({headless:true}),screens=path.resolve('ui-test-results');fs.mkdirSync(screens,{recursive:true});
for(const size of [{width:300,height:420},{width:340,height:480}]){
 const page=await browser.newPage({viewport:size}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const group=rgb=>({hex:T.rgbToHex(rgb),rgb,count:2,matches:T.findClosestMadeiraColors(rgb,5).map(r=>({code:r.code,name:r.name,hex:r.thread.hex,deltaE:r.deltaE,description:T.matchDescription(r.deltaE)}))});
 const data={ok:true,documentId:1,reference:'pdf',scope:'selection',context:{mode:'RGB',profile:'No expuesto'},token:1,groups:[group({r:22,g:87,b:171}),group({r:233,g:33,b:120})],skipped:0};
 await page.addInitScript(data=>{window.uiCalls=[];window.currentScan=data;window.__adobe_cep__={evalScript(script,callback){window.uiCalls.push(script);let result;if(script.includes('.scan(')){window.currentScan={...window.currentScan,reference:JSON.parse(script.slice(script.indexOf('(')+1).split(',')[0])};result=window.currentScan;}else if(script.includes('.watch(')){result=window.watchError?{ok:false,error:window.watchError}:window.nextScan||{ok:true,unchanged:true};if(window.nextScan)window.currentScan=window.nextScan;window.nextScan=null;}else if(script.includes('.health('))result={ok:true,recoverable:true};else if(script.includes('.batch('))result={ok:true,recoverable:true};else if(script.includes('.saveFile('))result={ok:true};else if(script.includes('.reduce('))result={ok:true,assignments:window.reducedAssignments};else result={ok:true,code:'5990',action:'label'};if(script.includes('.watch(')&&window.holdWatch){window.releaseWatch=()=>{window.holdWatch=false;window.releaseWatch=null;callback(JSON.stringify(result));};return;}setTimeout(()=>callback(JSON.stringify(result)),10);}};},data);
 await page.goto('file://'+path.resolve('plugin/com.threadmatch.illustrator/index.html'));await page.waitForSelector('.match');assert.equal(await page.locator('#matches .match').count(),5);
 async function noScroll(){assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth),'Panel overflows at '+JSON.stringify(size));}
 await noScroll();await page.screenshot({path:path.join(screens,'threads-'+size.width+'.png')});
 // Unchanged automatic reads leave controls, rows and focus untouched.
 await page.locator('#matches input').first().focus();
 await page.evaluate(()=>{window.pollMutations=[];window.pollObserver=new MutationObserver(records=>pollMutations.push(...records.map(r=>({type:r.type,attr:r.attributeName}))));pollObserver.observe(document.querySelector('main'),{subtree:true,attributes:true,childList:true});window.pollStart=uiCalls.filter(s=>s.includes('.watch(')).length;});
 await page.waitForFunction(()=>uiCalls.filter(s=>s.includes('.watch(')).length>=pollStart+2);
 await page.waitForTimeout(40);
 assert.deepEqual(await page.evaluate(()=>{pollObserver.disconnect();return pollMutations;}),[],'Unchanged watch must not mutate the visible panel');
 assert.equal(await page.locator('#matches input').first().evaluate(el=>document.activeElement===el),true);
 // A click during a slow background read is queued once, then executed.
 const queuedBefore=await page.evaluate(()=>{window.holdWatch=true;return uiCalls.filter(s=>/,'label'/.test(s.replace(/"/g,"'"))).length;});
 await page.waitForFunction(()=>!!window.releaseWatch);
 assert.equal(await page.locator('#label').isDisabled(),false);
 await page.click('#label');
 assert.equal(await page.evaluate(()=>uiCalls.filter(s=>/,'label'/.test(s.replace(/"/g,"'"))).length),queuedBefore);
 await page.evaluate(()=>releaseWatch());
 await page.waitForFunction(before=>uiCalls.filter(s=>/,'label'/.test(s.replace(/"/g,"'"))).length===before+1,queuedBefore);
 await page.waitForFunction(()=>!document.querySelector('#label').disabled);

 const before=await page.evaluate(()=>uiCalls.filter(s=>/,"label"(?:,|\))/.test(s)).length);await page.locator('#matches .match').nth(2).dblclick();await page.waitForFunction(before=>uiCalls.filter(s=>/,"label"(?:,|\))/.test(s)).length===before+1,before);assert.equal(await page.evaluate(()=>uiCalls.filter(s=>/,"label"(?:,|\))/.test(s)).length),before+1);
 await page.selectOption('#colors','1');assert.equal(await page.locator('#rgb').textContent(),'RGB 233 / 33 / 120');
 await page.click('#tab-label');await noScroll();await page.screenshot({path:path.join(screens,'label-'+size.width+'.png')});
 await page.selectOption('#label-template','spool');await noScroll();assert.equal(await page.locator('#preview-spool').isVisible(),true);
 assert.equal(await page.locator('#preview-spool path').count(),5);
 assert.equal(await page.locator('#preview-spool path').nth(2).evaluate(el=>getComputedStyle(el).fill),'rgb(173, 173, 173)');
 assert.equal(await page.locator('#preview-spool path').nth(1).evaluate(el=>getComputedStyle(el).fill),'rgb(0, 0, 0)');
 await page.click('#label-preview-create');await page.waitForFunction(()=>uiCalls.some(s=>s.includes('.act(')&&s.includes('"template":"spool"')));
 await page.screenshot({path:path.join(screens,'label-spool-'+size.width+'.png')});
 await page.reload();await page.waitForSelector('#matches .match');await page.click('#tab-label');assert.equal(await page.locator('#label-template').inputValue(),'spool');await noScroll();
 await page.selectOption('#label-template','classic');assert.equal(await page.locator('#preview-spool').isVisible(),false);await page.click('#tab-threads');
 await page.evaluate(()=>{window.nextScan={...currentScan,token:2,groups:[{...currentScan.groups[0],rgb:{r:1,g:2,b:3},hex:'#010203'}]};});await page.waitForFunction(()=>document.querySelector('#rgb').textContent==='RGB 1 / 2 / 3');
 await page.click('#tab-search');assert.equal(await page.locator('#catalog-results .match').count(),5);await noScroll();
 await page.click('#next-page');assert.ok((await page.locator('#search-count').textContent()).includes('2 / 32'));
 await page.fill('#search-query','#5800');assert.equal(await page.locator('#catalog-results .match').count(),1);
 await page.locator('#catalog-results .match').click();await page.click('#search-label');await page.waitForFunction(()=>uiCalls.some(s=>s.includes(',"5800","label"')));
 await page.fill('#search-query','BLACK');assert.ok(await page.locator('#catalog-results .match').count()>0);await noScroll();
 await page.fill('#search-query','no-such-thread');assert.equal(await page.locator('#catalog-results .match').count(),0);assert.ok((await page.locator('#catalog-results').textContent()).includes('No hay hilos'));
 await page.fill('#search-query','');await noScroll();await page.screenshot({path:path.join(screens,'search-'+size.width+'.png')});
 await page.fill('#search-query','5801');await page.locator('#catalog-results .match').click();
 assert.equal(await page.locator('#preview-code').textContent(),'#5801');
 assert.equal(await page.locator('#preview-chip').evaluate(el=>el.style.backgroundColor),'rgb(195, 194, 205)');
 await page.selectOption('#reference','montage');await page.waitForFunction(()=>uiCalls.some(s=>s.startsWith('ThreadMatchCEP.scan("montage",')));
 await page.waitForFunction(()=>!document.querySelector('#search-label').disabled);
 assert.equal(await page.locator('#catalog-results .chip').evaluate(el=>el.style.backgroundColor),'rgb(255, 255, 255)');
 assert.equal(await page.locator('#preview-chip').evaluate(el=>el.style.backgroundColor),'rgb(255, 255, 255)');assert.equal(await page.locator('#preview-spool').evaluate(el=>el.style.color),'rgb(255, 255, 255)');await noScroll();
 await page.screenshot({path:path.join(screens,'white-montage-'+size.width+'.png')});
 await page.click('#tab-label');await noScroll();await page.screenshot({path:path.join(screens,'white-label-'+size.width+'.png')});
 await page.selectOption('#reference','pdf');await page.waitForFunction(()=>!document.querySelector('#label-preview-create').disabled);
 assert.equal(await page.locator('#preview-chip').evaluate(el=>el.style.backgroundColor),'rgb(195, 194, 205)');await noScroll();
 await page.click('#tab-favorites');assert.ok((await page.locator('#favorite-results').textContent()).includes('Aún no tienes favoritos'));await noScroll();
 await page.click('#tab-search');await page.fill('#search-query','5801');
 const labelsBeforeStar=await page.evaluate(()=>uiCalls.filter(s=>/,"label"(?:,|\))/.test(s)).length);
 await page.locator('#catalog-results .favorite-star').click();assert.equal(await page.locator('#catalog-results .favorite-star').getAttribute('aria-pressed'),'true');
 assert.equal(await page.evaluate(()=>uiCalls.filter(s=>/,"label"(?:,|\))/.test(s)).length),labelsBeforeStar);
 await page.click('#tab-favorites');assert.equal(await page.locator('#favorite-results .match').count(),1);await noScroll();
 await page.reload();await page.waitForSelector('#matches .match');await page.click('#tab-favorites');assert.equal(await page.locator('#favorite-results .match').count(),1);
 await page.locator('#favorite-results .match').dblclick();await page.waitForFunction(()=>uiCalls.some(s=>s.includes(',"5801","label"')));
 await page.selectOption('#reference','montage');await page.waitForFunction(()=>!document.querySelector('#favorite-label').disabled);
 assert.equal(await page.locator('#favorite-results .chip').evaluate(el=>el.style.backgroundColor),'rgb(255, 255, 255)');
 await page.click('#favorite-apply');await page.waitForFunction(()=>uiCalls.some(s=>s.includes(',"5801","apply"')));
 await page.click('#tab-search');await page.fill('#search-query','');
 for(let i=0;i<5;i++)await page.locator('#catalog-results .favorite-star').nth(i).click();
 await page.click('#tab-favorites');assert.equal(await page.locator('#favorite-results .match').count(),5);assert.equal(await page.locator('#favorite-total').textContent(),'6 hilos');await noScroll();
 await page.screenshot({path:path.join(screens,'favorites-'+size.width+'.png')});
 await page.click('#favorite-next');assert.equal(await page.locator('#favorite-results .match').count(),1);
 await page.locator('#favorite-results .favorite-star').click();assert.equal(await page.locator('#favorite-page').textContent(),'1 / 1');assert.equal(await page.locator('#favorite-results .match').count(),5);
 const beforeStarDouble=await page.evaluate(()=>uiCalls.filter(s=>/,"label"(?:,|\))/.test(s)).length);
 await page.click('#tab-search');await page.fill('#search-query','5801');await page.locator('#catalog-results .favorite-star').dblclick();
 assert.equal(await page.evaluate(()=>uiCalls.filter(s=>/,"label"(?:,|\))/.test(s)).length),beforeStarDouble);
 await page.click('#tab-favorites');await noScroll();

 await page.click('#tab-threads');await page.selectOption('#view','design');await noScroll();
 assert.equal(await page.locator('#design-results .assignment').count(),2);assert.equal(await page.locator('#batch-apply').isDisabled(),true);
 await page.waitForFunction(()=>!document.querySelector('#scan').disabled);await page.locator('#design-results .assignment').first().click();assert.equal(await page.locator('#search-panel').isVisible(),true);
 await page.fill('#search-query','5800');await page.locator('#catalog-results .match').click();await page.click('#tab-threads');
 assert.ok((await page.locator('#design-results').textContent()).includes('5800'));await page.click('#review-all');assert.equal(await page.locator('#batch-apply').isDisabled(),false);
 await page.screenshot({path:path.join(screens,'design-'+size.width+'.png')});
 await page.click('#settings');await page.selectOption('#settings-page','palettes');await page.fill('#palette-name','Test palette');await page.click('#save-palette');assert.equal(await page.locator('#palette-list option').count(),1);await noScroll();
 await page.click('#load-palette');await page.click('#tab-threads');assert.equal(await page.locator('#batch-legend').isDisabled(),true);await page.click('#review-all');await page.click('#batch-both');await page.waitForFunction(()=>uiCalls.some(s=>s.includes('.batch(')&&s.includes('"both"')));
 await page.click('#settings');for(const option of ['scope','palettes','availability','files','updates','diagnostics']){await page.selectOption('#settings-page',option);await noScroll();await page.screenshot({path:path.join(screens,'settings-'+option+'-'+size.width+'.png')});}
 await page.click('#health');await page.waitForFunction(()=>uiCalls.some(s=>s.includes('.health(')));await page.waitForFunction(()=>!document.querySelector('#scan').disabled);
 await page.click('#export-diagnostics');await page.waitForFunction(()=>uiCalls.some(s=>s.includes('.saveFile(')));

 await page.click('#tab-threads');
 // Repeated empty-selection responses render the empty state only once.
 await page.evaluate(()=>{window.watchError='Selecciona uno o varios objetos con relleno sólido.';});
 await page.waitForFunction(()=>document.querySelector('#colors').textContent==='Selecciona un objeto');
 await page.waitForFunction(()=>!document.querySelector('#export-diagnostics').disabled);
 await page.evaluate(()=>{window.pollMutations=[];pollObserver.observe(document.querySelector('main'),{subtree:true,attributes:true,childList:true});window.pollStart=uiCalls.filter(s=>s.includes('.watch(')).length;});
 await page.waitForFunction(()=>uiCalls.filter(s=>s.includes('.watch(')).length>=pollStart+2);
 await page.waitForTimeout(40);
 assert.deepEqual(await page.evaluate(()=>{pollObserver.disconnect();return pollMutations;}),[],'Repeated empty selection must not rebuild or flash the panel');
 assert.equal(errors.length,0);await page.close();
}
await browser.close();console.log('Browser UI checks passed: no scroll, double click, color change, automatic selection, PDF/montage whites, persistent favorites, pagination, star isolation, silent background polling and queued actions.');})().catch(e=>{console.error(e);process.exit(1);});
