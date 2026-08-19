(function(){
const U='https://hqsiglpdnylsfbideglc.supabase.co';
const K='sb_publishable_elNqKmc2_3zpeDxrlFKMFw_RdDz4nXz';
const E=U+'/functions/v1/tasacion-market-search-v2';
const g=id=>document.getElementById(id);
const txt=(id,v)=>{const e=g(id);if(e)e.textContent=v};
const euro=n=>Number(n||0).toLocaleString('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0});
function render(d,v){
  const val=d.valuation;
  const list=(d.comparables||[]).filter(x=>x.price&&x.year&&x.km);
  if(!val||!list.length){
    g('market').textContent='Sin datos';
    g('confidence').textContent='SIN COMPARABLES';
    g('confidence').className='badge yellow';
    g('count').textContent=String(d.rawComparableCount||0);
    g('comparables').innerHTML='<tr><td colspan="6">No se han encontrado suficientes comparables válidos. Se han consultado varias fuentes públicas.</td></tr>';
    txt('searchStatus','Consulta terminada, pero no hay suficientes datos comparables para calcular una valoración fiable.');
    txt('autoStatus','No se ha inventado ningún precio.');
    return;
  }
  current={...v,value:val.marketValue,low:val.range.low,high:val.range.high,median:val.median};
  comparables=list.map(x=>({name:x.title||'Vehículo',title:x.title||'Vehículo',snippet:'',url:x.url||'#',source:x.source||'Web',year:+x.year,km:+x.km,price:+x.price,similarity:+(x.similarity||0)}));
  g('results').classList.remove('hidden');
  g('market').textContent=euro(val.marketValue);
  g('range').textContent=`Rango observado: ${euro(val.range.low)} – ${euro(val.range.high)}`;
  g('confidence').textContent=`${val.confidence} · ${val.comparableCount} comparables`;
  g('confidence').className=val.confidence==='ALTA'?'badge green':val.confidence==='MEDIA'?'badge yellow':'badge yellow';
  g('count').textContent=String(val.comparableCount);
  g('median').textContent=euro(val.median);
  g('quick').textContent=euro(val.quickSale);
  g('optim').textContent=euro(val.optimizedSale);
  txt('confidenceText',`Valor ponderado por similitud. Datos brutos encontrados: ${d.rawComparableCount||list.length}. Fuentes consultadas: ${(d.sources||[]).map(s=>s.name+(s.found?` (${s.found})`:'')).join(', ')}.`);
  g('comparables').innerHTML=list.map(c=>`<tr><td>${c.title||'Vehículo'}</td><td>${c.year}</td><td>${Number(c.km).toLocaleString('es-ES')} km</td><td>${euro(c.price)}</td><td>${c.similarity?c.similarity+'%':'—'}</td><td>${c.source||'Web'}</td></tr>`).join('');
  const auction=d.auction?.maximumBid||0, client=d.clientPurchase?.suggestedOffer||0;
  if(mode==='auction'){g('decisionValue').textContent=euro(auction);g('decisionHint').textContent='Valor de mercado menos transporte, preparación, colchón y margen deseado.';}
  else {g('decisionValue').textContent=euro(client);g('decisionHint').textContent='Valor de mercado menos preparación, garantía, otros costes y margen deseado.';}
  txt('searchStatus',`Tasación completada: ${val.comparableCount} comparables válidos.`);
  txt('autoStatus','Análisis multicapa completado sin inventar datos.');
}
async function run(e){
  if(e)e.preventDefault();
  const v={marca:g('marca').value.trim(),modelo:g('modelo').value.trim(),motor:g('motor').value.trim(),ano:+g('ano').value,km:+g('km').value,comb:g('comb').value,cambio:g('cambio').value,carro:g('carro').value,obs:g('obs').value.trim(),transport:+g('transport')?.value||500,preparation:+g('prep')?.value||600,warranty:+g('warranty')?.value||500,margin:+g('margin')?.value||3000,clientPreparation:+g('cprep')?.value||700,clientWarranty:+g('cwarranty')?.value||700,clientOther:+g('cother')?.value||300,clientMargin:+g('cmargin')?.value||3000};
  if(!v.marca||!v.modelo||!v.ano||!v.km){txt('searchStatus','Completa marca, modelo, año y kilómetros.');txt('autoStatus','Faltan datos obligatorios.');return;}
  current=v;comparables=[];g('results').classList.remove('hidden');g('market').textContent='Buscando…';g('confidence').textContent='ANALIZANDO';g('confidence').className='badge yellow';g('count').textContent='0';g('median').textContent='—';g('quick').textContent='—';g('optim').textContent='—';txt('searchStatus','Consultando fuentes públicas y comparando vehículos…');txt('autoStatus','Analizando mercado profesional y público…');g('comparables').innerHTML='<tr><td colspan="6">Consultando fuentes…</td></tr>';
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);
  try{
    const r=await fetch(E,{method:'POST',headers:{'Content-Type':'application/json','apikey':K,'Authorization':'Bearer '+K},body:JSON.stringify(v),signal:controller.signal});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||('HTTP '+r.status));
    render(d,v);
    if(d.valuation)window.scrollTo({top:g('results').offsetTop-10,behavior:'smooth'});
  }catch(err){
    const msg=err.name==='AbortError'?'Tiempo de espera agotado (25 s).':'No se pudo completar la tasación: '+err.message;
    txt('searchStatus',msg);txt('autoStatus','No se ha generado ninguna valoración inventada.');g('market').textContent='ERROR';g('confidence').textContent='ERROR';g('confidence').className='badge red';g('comparables').innerHTML='<tr><td colspan="6">'+msg+'</td></tr>';
  }finally{clearTimeout(timer);}
}
const f=g('form');if(f)f.onsubmit=run;
})();