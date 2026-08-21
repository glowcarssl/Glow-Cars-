/* GLOW CARS — buscador de vehículos. Se carga de forma independiente para no alterar las funciones existentes. */
(function(){
  function install(){
    const cars = document.getElementById('cars');
    if(!cars || window.__glowSearchInstalled) return;
    window.__glowSearchInstalled = true;
    const filters = document.querySelector('.filters');
    if(!filters) return;
    const box = document.createElement('div');
    box.style.cssText='display:flex;gap:8px;margin:0 0 14px;flex-wrap:wrap';
    box.innerHTML='<input id="glowVehicleSearch" type="search" placeholder="🔎 Buscar coche: BMW, X6M, Mercedes..." autocomplete="off" style="flex:1;min-width:220px;background:#090909;color:#fff;border:1px solid #333;border-radius:8px;padding:11px;font:inherit">';
    filters.parentNode.insertBefore(box,filters);
    const input=document.getElementById('glowVehicleSearch');
    const apply=()=>{
      const q=input.value.trim().toLocaleLowerCase('es');
      document.querySelectorAll('#cars .car').forEach(card=>{
        const text=(card.textContent||'').toLocaleLowerCase('es');
        card.style.display=(!q || text.includes(q))?'':'none';
      });
      const visible=[...document.querySelectorAll('#cars .car')].filter(x=>x.style.display!=='none').length;
      const status=document.getElementById('status');
      if(status && q) status.textContent=visible+' vehículo(s) coinciden con «'+input.value+'».';
    };
    input.addEventListener('input',apply);
    window.glowApplyVehicleSearch=apply;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install); else install();
  const oldLoad=window.load;
  if(typeof oldLoad==='function') window.load=function(){const r=oldLoad.apply(this,arguments);Promise.resolve(r).then(()=>setTimeout(install,0));return r};
})();
