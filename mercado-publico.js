/* GLOW CARS · Tasación · Búsqueda pública + importación de comparables
   No usa credenciales ni realiza scraping oculto. Genera búsquedas públicas y permite
   importar los datos visibles para calcular una valoración reproducible.
*/
(function(){
  const $ = id => document.getElementById(id);
  const esc = s => String(s||'').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const euro = n => Number(n||0).toLocaleString('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0});
  const q = () => ({
    marca:$('marca')?.value.trim()||'', modelo:$('modelo')?.value.trim()||'', motor:$('motor')?.value.trim()||'',
    ano:+($('ano')?.value||0), km:+($('km')?.value||0), comb:$('comb')?.value||'', cambio:$('cambio')?.value||'', carro:$('carro')?.value||''
  });
  const makeLinks = d => {
    const text=encodeURIComponent([d.marca,d.modelo,d.motor].filter(Boolean).join(' '));
    const extra=encodeURIComponent(`${d.ano} ${d.km} km ${d.comb} ${d.cambio}`);
    return [
      {name:'Coches.net',url:`https://www.coches.net/segunda-mano/?q=${text}`},
      {name:'Coches.com',url:`https://www.coches.com/coches-segunda-mano/?q=${text}`},
      {name:'AutoScout24',url:`https://www.autoscout24.es/lst/?q=${text}`},
      {name:'Milanuncios',url:`https://www.milanuncios.com/coches-de-segunda-mano/?q=${text}`},
      {name:'Google · búsqueda amplia',url:`https://www.google.com/search?q=${text}+coches+segunda+mano+${extra}`}
    ];
  };
  function similarity(r,d){
    let s=0;
    if((r.marca||'').toLowerCase()===d.marca.toLowerCase())s+=20;
    if((r.modelo||'').toLowerCase().includes(d.modelo.toLowerCase())||d.modelo.toLowerCase().includes((r.modelo||'').toLowerCase()))s+=25;
    if(d.motor && r.motor && r.motor.toLowerCase().includes(d.motor.toLowerCase()))s+=20;
    const yd=Math.abs((+r.ano||0)-d.ano); if(yd===0)s+=10; else if(yd===1)s+=7; else if(yd===2)s+=4;
    const kd=Math.abs((+r.km||0)-d.km); const kp=Math.max(0,1-kd/100000); s+=Math.round(15*kp);
    if(d.comb && r.comb && r.comb.toLowerCase()===d.comb.toLowerCase())s+=5;
    if(d.cambio && r.cambio && r.cambio.toLowerCase()===d.cambio.toLowerCase())s+=5;
    return Math.min(100,s);
  }
  function parseRows(text,d){
    return text.split(/\n/).map(x=>x.trim()).filter(Boolean).map(line=>{
      let p=line.split(/\t|;|\|/).map(x=>x.trim());
      if(p.length<4) p=line.split(/\s{2,}/).map(x=>x.trim());
      const price=Number((p[3]||p[2]||'').replace(/[^0-9,.-]/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.'));
      const year=Number((p[1]||'').replace(/\D/g,''));
      const km=Number((p[2]||'').replace(/\D/g,''));
      if(!price||!year||!km)return null;
      return {vehiculo:p[0]||`${d.marca} ${d.modelo}`,ano:year,km,precio:price,motor:d.motor,comb:d.comb,cambio:d.cambio,fuente:'Importado',similitud:0};
    }).filter(Boolean).map(r=>({...r,similitud:similarity(r,d)}));
  }
  function median(a){const b=[...a].sort((x,y)=>x-y);if(!b.length)return 0;const m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2;}
  function calculate(rows,d){
    const valid=rows.filter(r=>r.similitud>=55 && r.precio>500 && r.precio<200000);
    if(!valid.length){$('market').textContent='Sin comparables válidos';$('range').textContent='Necesitamos anuncios comparables reales.';return;}
    const prices=valid.map(r=>r.precio), med=median(prices), sorted=[...prices].sort((a,b)=>a-b);
    const p=q=>sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*q))];
    const lo=p(.1),hi=p(.9), weighted=valid.reduce((a,r)=>a+r.precio*Math.max(1,r.similitud/100),0)/valid.reduce((a,r)=>a+Math.max(1,r.similitud/100),0);
    const value=Math.round(weighted/100)*100;
    window.current={...(window.current||{}),...d,value};
    $('market').textContent=euro(value);$('range').textContent=`Rango P10–P90: ${euro(lo)} – ${euro(hi)}`;
    $('confidence').textContent=valid.length>=10?'ALTA':valid.length>=5?'MEDIA':'BAJA';$('confidence').className='badge '+(valid.length>=10?'green':valid.length>=5?'yellow':'red');
    $('count').textContent=valid.length;$('median').textContent=euro(med);$('quick').textContent=euro(p(.25));$('optim').textContent=euro(p(.75));
    $('confidenceText').textContent=`Valor ponderado por similitud sobre ${valid.length} comparables. Los anuncios se muestran para que puedas comprobar la valoración.`;
    $('comparables').innerHTML=valid.sort((a,b)=>b.similitud-a.similitud).slice(0,30).map(r=>`<tr><td>${esc(r.vehiculo)}</td><td>${r.ano}</td><td>${Number(r.km).toLocaleString('es-ES')}</td><td>${euro(r.precio)}</td><td>${r.similitud}%</td><td>${esc(r.fuente)}</td></tr>`).join('');
    if(typeof window.calcDecision==='function')window.calcDecision();
  }
  function showSources(d){
    const panels=[...document.querySelectorAll('#results .panel')]; const sourcePanel=panels.find(x=>x.querySelector('h3')?.textContent.includes('Fuentes')); if(!sourcePanel)return;
    sourcePanel.innerHTML=`<h3>🌐 Fuentes públicas</h3><p class="hint">Abre las búsquedas públicas, revisa los anuncios comparables y usa “Importar comparables” para que GLOW CARS calcule la tasación. No se usan credenciales ni scraping oculto.</p><div class="grid3" id="publicSourceGrid"></div><div class="panel" style="margin-top:14px;padding:14px;background:#090909"><h4>📥 Importar comparables</h4><p class="hint">Pega líneas en formato: <b>vehículo ; año ; km ; precio</b>. Puedes pegar varias líneas a la vez.</p><textarea id="importRows" placeholder="Mercedes E 220 d ; 2021 ; 82000 ; 29500\nMercedes E 220 d ; 2021 ; 91000 ; 28900"></textarea><div class="actions"><button class="btn gold" type="button" id="importBtn">Calcular con estos comparables</button></div></div>`;
    const grid=$('publicSourceGrid'); makeLinks(d).forEach(s=>{const el=document.createElement('div');el.className='source';el.innerHTML=`<b>${esc(s.name)}</b><span class="hint">${esc(d.marca+' '+d.modelo)} · ${d.ano} · ${Number(d.km).toLocaleString('es-ES')} km</span><div class="actions"><a class="btn gold" target="_blank" rel="noopener" href="${s.url}">Abrir búsqueda</a></div>`;grid.appendChild(el);});
    $('importBtn').onclick=()=>calculate(parseRows($('importRows').value,d),d);
  }
  function publicAnalyze(e){e.preventDefault();const d=q();if(!d.marca||!d.modelo||!d.ano||!d.km)return;$('results').classList.remove('hidden');$('market').textContent='Buscando comparables…';$('range').textContent='Revisa las fuentes públicas que aparecen abajo.';$('confidence').textContent='PENDIENTE';$('confidence').className='badge yellow';$('count').textContent='0';$('median').textContent='—';$('quick').textContent='—';$('optim').textContent='—';$('comparables').innerHTML='<tr><td colspan="6" style="color:#777">Aún no se han importado comparables.</td></tr>';showSources(d);$('decisionValue').textContent='—';$('decisionHint').textContent='Calcula la puja/oferta después de obtener comparables reales.';window.scrollTo({top:$('results').offsetTop-10,behavior:'smooth'});}
  document.addEventListener('DOMContentLoaded',()=>{const f=$('form');if(f)f.onsubmit=publicAnalyze;});
})();
