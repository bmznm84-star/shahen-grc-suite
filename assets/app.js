
const $ = sel => document.querySelector(sel);
const fmt = n => (n===null||n===undefined)?'—':Intl.NumberFormat(document.documentElement.lang==='ar'?'ar':'en', {maximumFractionDigits:1}).format(n);

let DATA, currentYear;

function applyYear(y){
  currentYear = y;
  const o = DATA.metrics;
  const wf = o.workforce?.[y] ?? null;
  const sz = o.saudization?.[y] ?? null;
  const mk = o.marketSizeSAR?.[y] ?? null;
  const ship = o.shipments_m?.[y] ?? null;
  const trucks = o.truckTraffic_m?.[y] ?? null;
  const acc = o.severeAccidents?.[y] ?? null;
  const east = o.eastShare?.[y] ?? null;

  $('#kpiWorkforce').textContent = wf? fmt(wf): '—';
  $('#kpiSaudization').textContent = sz!=null ? (Math.round(sz*1000)/10)+'%':'—';
  $('#kpiMarket').textContent = mk? (fmt(mk/1e9)+' B SAR'):'—';

  $('#shipments').textContent = ship? fmt(ship): '—';
  $('#trucks').textContent = trucks? fmt(trucks): '—';
  $('#accidents').textContent = acc? fmt(acc): '—';
  $('#eastShare').textContent = east!=null ? (Math.round(east*1000)/10)+'%':'—';

  $('#shipmentsNote').textContent = DATA.notes?.shipments?.[y] || '';

  if(window._chart){
    window._chart.data.labels = DATA.years;
    window._chart.data.datasets[0].data = DATA.years.map(yy => o.shipments_m?.[yy] ?? null);
    window._chart.data.datasets[1].data = DATA.years.map(yy => o.truckTraffic_m?.[yy] ?? null);
    window._chart.update();
  }
  $('#source').innerHTML = `المصدر: ${DATA.sources.join('، ')}`;
  $('#grcStages').innerHTML = DATA.grcStages.map(s=>`• ${s}`).join('<br/>');
}

function initChart(){
  const ctx = document.getElementById('trend');
  window._chart = new Chart(ctx, {
    type:'line',
    data:{
      labels: DATA.years,
      datasets:[
        {label:'الشحنات (مليون)', data: DATA.years.map(y=>DATA.metrics.shipments_m?.[y] ?? null)},
        {label:'حركة الشاحنات (مليون)', data: DATA.years.map(y=>DATA.metrics.truckTraffic_m?.[y] ?? null)}
      ]
    },
    options:{
      responsive:true,
      plugins:{legend:{labels:{color:'#e8f1ff'}}},
      scales:{
        x:{ticks:{color:'#9fb6d4'}, grid:{color:'#1f3b60'}},
        y:{ticks:{color:'#9fb6d4'}, grid:{color:'#1f3b60'}}
      }
    }
  });
}

function populateYearSelect(){
  const sel = $('#yearSelect');
  sel.innerHTML = DATA.years.map(y=>`<option value="${y}">${y}</option>`).join('');
  sel.value = DATA.years.at(-1);
  sel.addEventListener('change', e=>applyYear(e.target.value));
}

function toggleLang(){
  const html = document.documentElement;
  const ar = html.lang==='ar';
  html.lang = ar?'en':'ar';
  html.dir = ar?'ltr':'rtl';
  $('#langBtn').textContent = ar?'عربي':'EN';
  applyYear(currentYear);
}

fetch('./data/overview.json').then(r=>r.json()).then(d=>{
  DATA = d;
  populateYearSelect();
  initChart();
  applyYear(DATA.years.at(-1));
});

$('#langBtn').addEventListener('click', toggleLang);
