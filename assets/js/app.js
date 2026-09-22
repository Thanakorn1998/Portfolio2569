(function(){
"use strict";
var D=window.SITE_DATA;
var IM=window.SITE_IMGS;
var DIM=D.dims, TOPICS=D.topics, N=D.slideCount;
var app=document.getElementById('app');
var ICON={
  chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  prev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  next:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  full:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'
};

function h(tag,attrs,kids){
  var m=/^([a-z0-9]+)((?:\.[\w-]+)*)$/i.exec(tag)||[0,tag,''];
  var el=document.createElement(m[1]);
  if(m[2]) el.className=m[2].slice(1).split('.').join(' ');
  if(attrs) for(var k in attrs){
    var v=attrs[k]; if(v==null||v===false) continue;
    if(k==='html') el.innerHTML=v;
    else if(k==='text') el.textContent=v;
    else if(k.slice(0,2)==='on') el.addEventListener(k.slice(2),v);
    else el.setAttribute(k,v===true?'':v);
  }
  (kids||[]).forEach(function(c){ if(c==null) return; el.appendChild(typeof c==='string'?document.createTextNode(c):c); });
  return el;
}
function img(key,alt,extra){ var a={src:IM[key],alt:alt||'',decoding:'async'}; var d=DIM[key]; if(d){a.width=d[0];a.height=d[1];} if(extra) for(var k in extra)a[k]=extra[k]; return h('img',a); }
function topicById(id){ return TOPICS.filter(function(t){return t.id===id;})[0]; }
function topicHref(t){ return '#/t/'+t.id; }

/* ---------- nav ---------- */
function buildNav(){
  var nav=document.getElementById('nav'); nav.innerHTML='';
  nav.appendChild(h('a',{href:'#/','data-r':'home',text:'หน้าแรก'}));
  D.parts.forEach(function(p){
    var dd=h('div.dd',{'data-part':p.id});
    var btn=h('button',{type:'button','aria-expanded':'false','aria-haspopup':'true',html:'<span></span>'+ICON.chev});
    btn.firstChild.textContent=p.short;
    var menu=h('div.menu');
    TOPICS.filter(function(t){return t.part===p.id;}).forEach(function(t){
      var a=h('a',{href:topicHref(t),'data-t':t.id},[h('i',{text:t.no}),h('span',{text:t.title})]);
      menu.appendChild(a);
    });
    dd.appendChild(btn); dd.appendChild(menu); nav.appendChild(dd);
    btn.addEventListener('click',function(e){ e.stopPropagation(); var open=!dd.classList.contains('open'); closeMenus(); if(open){dd.classList.add('open');btn.setAttribute('aria-expanded','true');} });
  });
  nav.appendChild(h('a',{href:'#/slides','data-r':'slides',text:'สไลด์ต้นฉบับ'}));
  var dr=document.getElementById('drawer'); dr.innerHTML='';
  dr.appendChild(h('a',{href:'#/','data-r':'home'},[h('span',{text:'หน้าแรก'})]));
  D.parts.forEach(function(p){
    dr.appendChild(h('h4',{text:p.full}));
    TOPICS.filter(function(t){return t.part===p.id;}).forEach(function(t){
      dr.appendChild(h('a',{href:topicHref(t),'data-t':t.id},[h('i',{text:t.no}),h('span',{text:t.title})]));
    });
  });
  dr.appendChild(h('h4',{text:'เอกสารฉบับเต็ม'}));
  dr.appendChild(h('a',{href:'#/slides','data-r':'slides'},[h('span',{text:'สไลด์ต้นฉบับ ทั้ง '+N+' หน้า'})]));
}
function closeMenus(){ document.querySelectorAll('.dd.open').forEach(function(d){d.classList.remove('open');d.firstChild.setAttribute('aria-expanded','false');}); }
document.addEventListener('click',closeMenus);
document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeMenus(); });
var burger=document.getElementById('burger'), drawer=document.getElementById('drawer');
burger.addEventListener('click',function(){ var on=drawer.classList.toggle('on'); burger.setAttribute('aria-expanded',on?'true':'false'); document.body.style.overflow=on?'hidden':''; });
function closeDrawer(){ drawer.classList.remove('on'); burger.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
function markNav(route,tid){
  document.querySelectorAll('[data-r],[data-t]').forEach(function(a){ a.removeAttribute('aria-current'); });
  document.querySelectorAll('.dd').forEach(function(d){d.classList.remove('here');});
  if(route==='home'||route==='slides') document.querySelectorAll('[data-r="'+route+'"]').forEach(function(a){a.setAttribute('aria-current','page');});
  if(tid){
    document.querySelectorAll('[data-t="'+tid+'"]').forEach(function(a){a.setAttribute('aria-current','page');});
    var t=topicById(tid); var dd=document.querySelector('.dd[data-part="'+t.part+'"]'); if(dd) dd.classList.add('here');
  }
}

/* ---------- lightbox ---------- */
var lb=document.getElementById('lb'), lbimg=document.getElementById('lbimg'), lbcap=document.getElementById('lbcap');
var LB={list:[],i:0,ret:null};
function lbShow(){ var it=LB.list[LB.i]; lbimg.src=IM[it.key]; lbimg.alt=it.alt||''; lbcap.textContent=(it.cap?it.cap+' · ':'')+'ภาพที่ '+(LB.i+1)+' จาก '+LB.list.length;
  document.getElementById('lbprev').style.visibility=LB.list.length>1?'visible':'hidden';
  document.getElementById('lbnext').style.visibility=LB.list.length>1?'visible':'hidden'; }
function lbOpen(list,i){ LB.list=list; LB.i=i; LB.ret=document.activeElement; lbShow(); lb.classList.add('on'); document.body.style.overflow='hidden'; document.getElementById('lbclose').focus(); }
function lbClose(){ lb.classList.remove('on'); document.body.style.overflow=drawer.classList.contains('on')?'hidden':''; if(LB.ret&&LB.ret.focus) LB.ret.focus(); }
function lbStep(d){ LB.i=(LB.i+d+LB.list.length)%LB.list.length; lbShow(); }
document.getElementById('lbclose').addEventListener('click',lbClose);
document.getElementById('lbprev').addEventListener('click',function(){lbStep(-1);});
document.getElementById('lbnext').addEventListener('click',function(){lbStep(1);});
lb.addEventListener('click',function(e){ if(e.target===lb||e.target.classList.contains('lb-body')) lbClose(); });
document.addEventListener('keydown',function(e){
  if(!lb.classList.contains('on')) return;
  if(e.key==='Escape') lbClose(); else if(e.key==='ArrowLeft') lbStep(-1); else if(e.key==='ArrowRight') lbStep(1);
  else if(e.key==='Tab'){ var f=lb.querySelectorAll('button'); var vis=[].filter.call(f,function(b){return b.style.visibility!=='hidden';}); var first=vis[0],last=vis[vis.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();} else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();} }
});
function gallery(items,label){
  // items: [{key,cap}]
  var list=items.map(function(it,i){return {key:it.key,cap:it.cap,alt:it.cap||('หลักฐานประกอบ '+label+' ภาพที่ '+(i+1))};});
  var g=h('div.gal');
  list.forEach(function(it,i){
    var d=DIM[it.key]||[4,3];
    var btn=h('button.shot-btn',{type:'button','aria-label':'ขยายภาพ: '+it.alt,style:'aspect-ratio:'+d[0]+'/'+d[1],onclick:function(){lbOpen(list,i);}});
    var fig=h('figure',{style:'margin:0;width:100%;height:100%'});
    fig.appendChild(img(it.key,it.alt,{style:'width:100%;height:100%'}));
    if(it.cap) fig.appendChild(h('figcaption',{text:it.cap}));
    btn.appendChild(fig); g.appendChild(btn);
  });
  return g;
}

/* ---------- pages ---------- */
function setTitle(s){ document.title=(s?s+' – ':'')+'แฟ้มผลงาน ธนากร กดมงคล'; }
function slideRange(t){ return t.slides[0]===t.slides[1]?('สไลด์ '+t.slides[0]):('สไลด์ '+t.slides[0]+'–'+t.slides[1]); }

function renderHome(){
  setTitle('');
  var el=h('div');
  // hero
  var stage=h('div.stage');
  stage.appendChild(h('div.hexring'));
  stage.appendChild(h('div.hexbg'));
  var person=h('div.person'); person.appendChild(img('portrait','ภาพถ่ายนายธนากร กดมงคล',{fetchpriority:'high'})); stage.appendChild(person);
  var ma=h('div.mini.a'); ma.appendChild(img('b59e235cda_0','')); stage.appendChild(ma);
  var mb=h('div.mini.b'); mb.appendChild(img('a6e0f121a8_0','')); stage.appendChild(mb);
  var left=h('div',null,[
    h('h1',{text:'การนำเสนอประเมินผลการปฏิบัติงาน พนักงานราชการ'}),
    h('p.period',{text:'1 เมษายน 2569 – 30 กันยายน 2569'}),
    h('div.who',null,[h('b',{text:'นายธนากร กดมงคล'}),h('span',{text:'ตำแหน่ง พนักงานราชการ'})]),
    h('div.cta',null,[
      h('a.btn.btn-solid',{href:topicHref(TOPICS[0])},[document.createTextNode('ดูผลงาน'),h('span',{html:ICON.arrow,style:'display:inline-flex'})]),
      h('a.btn.btn-line',{href:'#/slides',text:'เปิดสไลด์ต้นฉบับ'})
    ])
  ]);
  var hero=h('section.hero.intro-load',null,[h('div.wrap',null,[left,stage])]);
  el.appendChild(hero);

  // overview
  var sec=h('section.sec');
  var w=h('div.wrap');
  w.appendChild(h('h2',{text:'ภาพรวมแฟ้มผลงาน'}));
  w.appendChild(h('p.lede',{text:'รวบรวมผลงานและหลักฐานประกอบการประเมินผลการปฏิบัติงานในรอบ 6 เดือน แบ่งเป็นการประเมินผลสัมฤทธิ์ของงาน และการประเมินพฤติกรรมการปฏิบัติงาน'}));
  var chips=h('div.chips'); D.duties.forEach(function(c){chips.appendChild(h('span.chip',{text:c}));}); w.appendChild(chips);
  D.parts.forEach(function(p){
    var part=h('div.part',null,[h('h3',{text:p.full}),h('p',{text:p.desc})]);
    var tiles=h('div.tiles');
    TOPICS.filter(function(t){return t.part===p.id;}).forEach(function(t){
      var cover=h('div.cover'); cover.appendChild(img(t.cover,''));
      tiles.appendChild(h('a.tile',{href:topicHref(t)},[cover,h('div.txt',null,[
        h('span.no',{text:'หัวข้อ '+t.no}),h('span.tt',{text:t.title}),
        h('span.mt',{text:t.items.length+' หัวข้อย่อย · '+slideRange(t)})])]));
    });
    part.appendChild(tiles); w.appendChild(part);
  });
  sec.appendChild(w); el.appendChild(sec);

  // photo honeycomb
  var s2=h('section.sec.tint'); var w2=h('div.wrap');
  w2.appendChild(h('h2',{text:'ภาพจากการปฏิบัติงาน'}));
  w2.appendChild(h('p.lede',{text:'งานจิตอาสา การเตรียมสถานที่ การดูแลอุปกรณ์ และการทำงานร่วมกับเพื่อนร่วมงาน'}));
  var list=D.honey.map(function(k){return {key:k.key,cap:k.cap,alt:k.cap||'ภาพการปฏิบัติงาน'};});
  var honey=h('div.honey'); var rows=[list.slice(0,4),list.slice(4)];
  var idx=0;
  rows.forEach(function(r){ var row=h('div.row'); r.forEach(function(it){ var i=idx++; var b=h('button.hx',{type:'button','aria-label':'ขยายภาพ: '+it.alt,onclick:function(){lbOpen(list,i);}}); b.appendChild(img(it.key,it.alt)); row.appendChild(b); }); honey.appendChild(row); });
  w2.appendChild(honey); s2.appendChild(w2); el.appendChild(s2);

  // slides CTA
  var s3=h('section.sec'); var w3=h('div.wrap');
  var shot=h('div.shot'); shot.appendChild(img('s'+D.ctaSlide,'ตัวอย่างสไลด์ต้นฉบับ'));
  w3.appendChild(h('div.slidecta',null,[
    h('div',null,[h('h2',{text:'อ่านสไลด์ต้นฉบับครบทุกหน้า'}),
      h('p.lede',{text:'ไฟล์นำเสนอต้นฉบับมี '+N+' สไลด์ เปิดดูทีละหน้า เลื่อนด้วยลูกศรบนแป้นพิมพ์ หรือเลือกจากภาพย่อได้ทันที'}),
      h('a.btn',{href:'#/slides'},[document.createTextNode('เปิดสไลด์ต้นฉบับ'),h('span',{html:ICON.arrow,style:'display:inline-flex'})])]),
    shot]));
  s3.appendChild(w3); el.appendChild(s3);
  return el;
}

function doBlock(list){
  var d=h('div.do');
  list.forEach(function(x){
    if(typeof x==='string') d.appendChild(h('p',{text:x}));
    else if(x.ul){ var ul=h('ul'); x.ul.forEach(function(li){ul.appendChild(h('li',{text:li}));}); d.appendChild(ul); }
    else if(x.ol){ var ol=h('ol'); x.ol.forEach(function(li){ol.appendChild(h('li',{text:li}));}); d.appendChild(ol); }
  });
  return d;
}
function slideLinks(arr){
  if(!arr||!arr.length) return null;
  var f=h('div.from',null,[h('span',{text:'อ้างอิงสไลด์ต้นฉบับ:'})]);
  arr.forEach(function(n){ f.appendChild(h('a',{href:'#/slides/'+n,text:'หน้า '+n})); });
  return f;
}

function renderTopic(id){
  var ti=TOPICS.indexOf(topicById(id)); var t=TOPICS[ti]; var part=D.parts.filter(function(p){return p.id===t.part;})[0];
  setTitle(t.title);
  var el=h('div');
  el.appendChild(h('section.banner',null,[h('div.wrap',null,[
    h('nav.crumbs',{'aria-label':'เส้นทาง'},[h('a',{href:'#/',text:'หน้าแรก'}),h('span',{text:'/'}),h('span',{text:part.full})]),
    h('h1',{text:t.no+'. '+t.title}),
    h('p',{text:t.items.length+' หัวข้อย่อย · '+slideRange(t)})
  ])]));
  if(t.items.length>1){
    var pills=h('div.pills');
    t.items.forEach(function(it){ pills.appendChild(h('button.pill',{type:'button',onclick:function(){ var e=document.getElementById('i-'+it.id.replace('.','-')); if(e) e.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'}); }},[h('b',{text:it.id}),document.createTextNode(it.short||it.title)])); });
    el.appendChild(h('div.pillbar',null,[h('div.wrap',null,[pills])]));
  }
  var w=h('div.wrap');
  t.items.forEach(function(it){
    var body=h('div');
    body.appendChild(h('h3',{text:it.title}));
    if(it.do&&it.do.length) body.appendChild(doBlock(it.do));
    (it.groups||[]).forEach(function(g){
      var gr=h('div.group');
      if(g.h) gr.appendChild(h('h4',{text:g.h}));
      if(g.do&&g.do.length) gr.appendChild(doBlock(g.do));
      if(g.images&&g.images.length) gr.appendChild(gallery(g.images,it.id));
      var sl=slideLinks(g.slides); if(sl) gr.appendChild(sl);
      body.appendChild(gr);
    });
    if(it.images&&it.images.length) body.appendChild(gallery(it.images,it.id));
    var sl=slideLinks(it.slides); if(sl) body.appendChild(sl);
    w.appendChild(h('article.item',{id:'i-'+it.id.replace('.','-')},[h('div.badge',{text:it.id,'aria-hidden':'true'}),body]));
  });
  var pg=h('div.pager');
  if(ti>0){ var p=TOPICS[ti-1]; pg.appendChild(h('a.prev',{href:topicHref(p)},[h('small',{text:'หัวข้อก่อนหน้า'}),h('b',{text:p.no+'. '+p.title})])); }
  if(ti<TOPICS.length-1){ var n=TOPICS[ti+1]; pg.appendChild(h('a.next',{href:topicHref(n)},[h('small',{text:'หัวข้อถัดไป'}),h('b',{text:n.no+'. '+n.title})])); }
  else pg.appendChild(h('a.next',{href:'#/slides'},[h('small',{text:'ดูต่อ'}),h('b',{text:'สไลด์ต้นฉบับทั้งหมด'})]));
  w.appendChild(pg);
  el.appendChild(w);
  return el;
}

function renderSlides(n0){
  setTitle('สไลด์ต้นฉบับ');
  var cur=Math.min(Math.max(parseInt(n0,10)||1,1),N);
  var el=h('div');
  el.appendChild(h('section.banner.compact',null,[h('div.wrap',null,[
    h('nav.crumbs',{'aria-label':'เส้นทาง'},[h('a',{href:'#/',text:'หน้าแรก'}),h('span',{text:'/'}),h('span',{text:'สไลด์ต้นฉบับ'})]),
    h('h1',{text:'สไลด์ต้นฉบับ'}),
    h('p',{text:'ไฟล์นำเสนอทั้ง '+N+' หน้า เลื่อนด้วยปุ่มลูกศรบนแป้นพิมพ์หรือปัดนิ้วได้'})
  ])]));
  var thumbs=h('div.thumbs',{role:'list','aria-label':'ภาพย่อสไลด์'});
  var tbtn=[];
  for(var i=1;i<=N;i++){ (function(i){
    var b=h('button.th',{type:'button',role:'listitem','aria-label':'สไลด์ที่ '+i,onclick:function(){go(i);}},[img('t'+i,''),h('span',{text:String(i)})]);
    tbtn[i]=b; thumbs.appendChild(b); })(i); }
  var frame=h('div.frame'); var big=h('img',{alt:'',decoding:'async'}); frame.appendChild(big);
  var prev=h('button.ibtn',{type:'button','aria-label':'สไลด์ก่อนหน้า',html:ICON.prev,onclick:function(){go(cur-1);}});
  var next=h('button.ibtn',{type:'button','aria-label':'สไลด์ถัดไป',html:ICON.next,onclick:function(){go(cur+1);}});
  var count=h('span.count',{'aria-live':'polite'});
  var rng=h('input.rng',{type:'range',min:'1',max:String(N),value:String(cur),'aria-label':'เลือกหน้าสไลด์'});
  rng.addEventListener('input',function(){go(parseInt(rng.value,10));});
  var fs=h('button.ibtn',{type:'button','aria-label':'เต็มจอ',html:ICON.full,onclick:function(){ if(document.fullscreenElement) document.exitFullscreen(); else if(frame.requestFullscreen) frame.requestFullscreen(); }});
  var where=h('p.where');
  var main=h('div.main-view',null,[frame,h('div.tools',null,[prev,count,next,rng,fs]),where]);
  el.appendChild(h('div.wrap',null,[h('div.viewer',null,[thumbs,main])]));

  function go(n){
    n=Math.min(Math.max(n,1),N); cur=n;
    big.src=IM['s'+n]; big.alt='สไลด์ที่ '+n+' จาก '+N;
    count.textContent=n+' / '+N; rng.value=String(n);
    prev.disabled=n===1; next.disabled=n===N;
    tbtn.forEach(function(b,i){ if(b){ if(i===n) b.setAttribute('aria-current','true'); else b.removeAttribute('aria-current'); } });
    var b=tbtn[n]; if(b&&b.scrollIntoView){ var box=thumbs; var row=window.innerWidth<=980;
      if(row) box.scrollTo({left:b.offsetLeft-box.clientWidth/2+b.clientWidth/2}); else box.scrollTo({top:b.offsetTop-box.clientHeight/2+b.clientHeight/2}); }
    var tid=D.slideTopic[n];
    where.innerHTML='';
    if(tid==='cover'){ where.appendChild(document.createTextNode('หน้าปก')); }
    else { var t=topicById(tid); where.appendChild(document.createTextNode('อยู่ในหัวข้อ ')); where.appendChild(h('b',{text:t.no+'. '+t.title})); where.appendChild(document.createTextNode(' · ')); where.appendChild(h('a',{href:topicHref(t),text:'ดูหน้าหัวข้อนี้'})); }
    history.replaceState(null,'','#/slides/'+n);
  }
  // keyboard + swipe (removed on route change)
  function key(e){ if(lb.classList.contains('on')) return; var tg=e.target&&e.target.tagName; if(tg==='INPUT') return;
    if(e.key==='ArrowRight'||e.key==='ArrowDown'&&false) go(cur+1); else if(e.key==='ArrowLeft') go(cur-1); }
  document.addEventListener('keydown',key); cleanup.push(function(){document.removeEventListener('keydown',key);});
  var sx=null; frame.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;},{passive:true});
  frame.addEventListener('touchend',function(e){ if(sx==null) return; var dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>50) go(cur+(dx<0?1:-1)); sx=null; },{passive:true});
  frame.addEventListener('click',function(){ lbOpen([{key:'s'+cur,alt:'สไลด์ที่ '+cur,cap:'สไลด์ที่ '+cur}],0); });
  frame.style.cursor='zoom-in';
  el.__init=function(){ go(cur); };
  return el;
}

/* ---------- router ---------- */
var cleanup=[];
function route(){
  cleanup.forEach(function(f){f();}); cleanup=[];
  closeMenus(); closeDrawer();
  var hash=location.hash.replace(/^#\/?/,''); var parts=hash.split('/');
  var view,r='home',tid=null;
  if(parts[0]==='t'&&topicById(parts[1])){ tid=parts[1]; r='topic'; view=renderTopic(tid); }
  else if(parts[0]==='slides'){ r='slides'; view=renderSlides(parts[1]); }
  else view=renderHome();
  app.innerHTML=''; app.appendChild(view);
  if(view.__init) view.__init();
  markNav(r,tid);
  if(!(r==='slides'&&parts[1]&&false)) window.scrollTo(0,0);
}
buildNav();
window.addEventListener('hashchange',route);
route();

/* ---------- theme ---------- */
document.getElementById('themebtn').addEventListener('click',function(){
  var root=document.documentElement; var cur=root.getAttribute('data-theme');
  var sysDark=matchMedia('(prefers-color-scheme:dark)').matches;
  var isDark=cur?cur==='dark':sysDark;
  root.setAttribute('data-theme',isDark?'light':'dark');
});
})();
