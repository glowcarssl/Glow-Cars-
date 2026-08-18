/* GLOW CARS · Tasación · Fuentes públicas
   No automatiza scraping ni usa credenciales. Genera búsquedas directas en páginas públicas.
*/
(function(){
  const $ = id => document.getElementById(id);
  const esc = s => String(s||'').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const q = () => {
    const marca=$('marca')?.value.trim()||'', modelo=$('modelo')?.value.trim()||'', motor=$('motor')?.value.trim()||'';
    const ano=$('ano')?.value||'', km=$('km')?.value||'';
    return {marca,modelo,motor,ano,km,text:[marca,modelo,motor].filter(Boolean).join(' ') ,year:ano, km};
  };
  const makeLinks = d => {
    const text=encodeURIComponent([d.marca,d.modelo,d.motor].filter(Boolean).join(' '));
    const year=encodeURIComponent(d.ano||'');
    const km=encodeURIComponent(d.km||'');
    return [
      {name:'Coches.net',url:`https://www.coches.net/segunda-mano/?q=${text}`},
      {name:'Coches.com',url:`https://www.coches.com/coches-segunda-mano/?q=${text}`},
      {name:'AutoScout24',url:`https://www.autoscout24.es/lst/?q=${text}`},
      {name:'Milanuncios',url:`https://www.milanuncios.com/coches-de-segunda-mano/?q=${text}`},
      {name:'Google · búsqueda amplia',url:`https://www.google.com/search?q=${text}+coches+segunda+mano+${year}+${km}+km`}
    ];
  };
  function showSources(){
    const d=q(), box=document.querySelector('#results .panel:nth-last-of-type(2)');
    const panel=document.querySelectorAll('#results .panel');
    const sourcePanel=[...panel].find(x=>x.querySelector('h3')?.textContent.includes('Fuentes'));
    if(!sourcePanel)return;
    sourcePanel.innerHTML=`<h3>🌐 Fuentes públicas conectadas</h3>
      <p class="hint">Estas búsquedas se generan con los datos que has introducido. Son páginas públicas; no se usan credenciales ni se realiza scraping oculto.</p>
      <div class="grid3" id="publicSourceGrid"></div>
      <p class="hint" style="margin-top:12px"><b>Cómo funciona:</b> abre cada fuente, revisa los comparables y utiliza los anuncios que correspondan. La web no inventa precios ni presenta una cifra como real si no ha podido obtener datos.</p>`;
    const grid=$('publicSourceGrid');
    makeLinks(d).forEach(s=>{const el=document.createElement('div');el.className='source';el.innerHTML=`<b>${esc(s.name)}</b><span class="hint">Búsqueda: ${esc(d.text)} · ${esc(d.ano)} · ${esc(d.km)} km</span><div class="actions"><a class="btn gold" target="_blank" rel="noopener" href="${s.url}">Abrir búsqueda</a></div>`;grid.appendChild(el);});
  }
  function publicAnalyze(e){
    e.preventDefault();
    const d={marca:$('marca').value.trim(),modelo:$('modelo').value.trim(),motor:$('motor').value.trim(),ano:+$('ano').value,km:+$('km').value,comb:$('comb').value,cambio:$('cambio').value,carro:$('carro').value,obs:$('obs').value.trim()};
    if(!d.marca||!d.modelo||!d.ano||!d.km)return;
    /* Mantiene la pantalla de valoración existente, pero nunca convierte una fórmula de prueba en precio real. */
    if(typeof window.current!=='undefined') window.current={...d,value:0};
    $('results').classList.remove('hidden');
    $('market').textContent='Pendiente de comparables';
    $('range').textContent='Abre las fuentes públicas y comprueba los anuncios comparables.';
    $('confidence').textContent='SIN DATOS · valoración no calculada';
    $('confidence').className='badge yellow';
    $('count').textContent='0'; $('median').textContent='—'; $('quick').textContent='—'; $('optim').textContent='—';
    $('confidenceText').textContent='Para evitar una tasación falsa, GLOW CARS solo calculará el valor de mercado cuando existan precios comparables reales importados/recogidos con una fuente permitida.';
    $('comparables').innerHTML='<tr><td colspan="6" style="color:#777">No hay comparables importados todavía.</td></tr>';
    showSources();
    $('decisionValue').textContent='—';
    $('decisionHint').textContent='Primero necesitamos comparables reales.';
    window.scrollTo({top:$('results').offsetTop-10,behavior:'smooth'});
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const f=$('form'); if(f) f.onsubmit=publicAnalyze;
  });
})();