(function(){
  const $=s=>document.querySelector(s);
  const G={dark:'#173C2A',deep:'#12311F',mid:'#2F7D4A',soft:'#88B77A',pale:'#DDEBDD',track:'#EEF3EC',cream:'#FFFDF8',ink:'#173024',muted:'#65766D',gold:'#D9B85A',coral:'#D97869'};
  function addStyles(){
    if($('#v166Styles')) return;
    const s=document.createElement('style'); s.id='v166Styles';
    s.textContent=`
      :root{--nav:${G.dark};--nav2:${G.deep};--accent:${G.mid};--accent-dark:${G.dark};--accent-soft:${G.pale};--ink:${G.ink};--muted:${G.muted};--card:${G.cream};--grass:${G.mid};--grass2:${G.soft};}
      body{background:linear-gradient(180deg,#FBFCF8 0%,#F4F7F1 100%)!important;color:${G.ink}!important}
      .sidebar{background:linear-gradient(180deg,${G.dark},${G.deep})!important;border-right-color:#0B2115!important}
      .brand-badge{background:${G.mid}!important;box-shadow:inset 0 -7px 0 ${G.gold},4px 4px 0 rgba(0,0,0,.13)!important}
      .nav-item{color:#EDF5EE!important}.nav-item:hover,.nav-item.active{background:rgba(136,183,122,.22)!important;box-shadow:inset 4px 0 0 ${G.gold}!important;color:#fff!important}
      .score-chip{background:rgba(136,183,122,.16)!important;border-color:rgba(136,183,122,.34)!important}
      .profile-panel,.v16-locale-panel{background:rgba(255,255,255,.055)!important;border-color:rgba(255,255,255,.14)!important}
      .v16-locale-panel label{color:#D8E8DB!important}.v16-locale-note{color:#B8CEBD!important}.v16-locale-panel select{background:#F7F3E8!important;color:${G.dark}!important}
      #home .hero{background:linear-gradient(135deg,#FFFDF8 0%,#F1F6EE 72%,#FBF4E7 100%)!important;border-color:#DBE6D8!important}
      #home .hero:before{background:linear-gradient(90deg,${G.mid},${G.soft},${G.gold})!important}
      #home .focus-card{background:linear-gradient(145deg,${G.dark},#224C35)!important;border-color:#28533B!important}
      #home .focus-card .eyebrow{color:#F0D982!important}
      .primary-btn,.billing-btn{background:${G.mid}!important;border-color:${G.mid}!important;color:#fff!important;box-shadow:0 3px 0 #1F6338!important}
      .primary-btn:hover,.billing-btn:hover{background:#3C8B58!important;border-color:#3C8B58!important}
      .secondary-btn{background:#F8F3DF!important;border-color:#E6D6A1!important;color:${G.dark}!important}
      .pill,.language-topic{background:#EAF3E7!important;color:${G.dark}!important;border-color:#D3E4CF!important}
      .eyebrow,.scenario-label{color:${G.mid}!important}.v16-toast{background:${G.dark}!important;border-left:5px solid ${G.gold}!important}
      .topbar .mini-btn{color:${G.dark}!important;background:#F5F8F3!important;border-color:#D8E4D5!important}.topbar .billing-btn{background:${G.mid}!important;color:#fff!important}
      .scenario-card{background:#F7FAF5!important;border-left-color:${G.mid}!important}
      .exercise-card .prompt{color:${G.dark}!important}
      .option-btn:hover{border-color:#9DBA94!important;background:#F7FAF5!important}.option-btn.correct,.multi-option.correct{border-color:#5C9B68!important;background:#E8F4E6!important;color:${G.dark}!important}

      /* Progress bars are intentionally quiet in V16.6 */
      #home .level-track,.bar{background:${G.track}!important;border:1px solid #E1E8DE!important;border-radius:999px!important;overflow:hidden!important}
      #home .level-track{height:8px!important}.bar{height:8px!important}
      #home .level-track span,.bar span{background:linear-gradient(90deg,#95BC8B,#B7D0AF)!important;box-shadow:none!important}
      #home .level-row strong{color:#6A8168!important;font-weight:800!important}

      /* Functional documents */
      .shape-visual .lh-doc{max-width:650px!important;margin:10px auto 18px!important;padding:18px!important;border:1px solid #DCE6D9!important;border-radius:14px!important;background:#fff!important;box-shadow:0 8px 20px rgba(23,60,42,.07)!important;font-size:1rem!important;text-align:left!important}
      .catalog-grid,.product-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
      .catalog-grid>div,.product-grid>div{border:1px solid #DDE6DA;border-radius:10px;padding:12px;background:#FFFDF8;display:flex;flex-direction:column;gap:5px;min-height:84px}
      .catalog-grid>div.offer,.product-grid>div.offer{background:#F3F8EA;border-color:#BFD1A8}
      .catalog-grid b,.product-grid b{font-size:.95rem;color:${G.dark}}.catalog-grid span,.product-grid span{font-weight:800}.product-grid small{color:${G.muted}}
      .receipt-row{display:flex;justify-content:space-between;gap:16px;padding:8px 0;border-bottom:1px dashed #D8E0D6}.receipt-row.discount{color:#A75245}.doc-total{display:flex;justify-content:space-between;gap:20px;padding:11px 0 0;font-size:1.06rem}.doc-note{margin-top:12px;padding:10px 12px;border-radius:8px;background:#F4F7F1;color:${G.muted}}
      .shape-visual .lh-doc .trip-row,.shape-visual .lh-doc .doc-lines{font-size:.88rem!important}

      /* Illustrated scenes: larger than documents but not full-screen */
      .cognitive-photo[src*="assets/v16_6/"]{display:block!important;width:min(100%,980px)!important;height:auto!important;max-height:620px!important;object-fit:contain!important;margin:12px auto 18px!important;border:2px solid ${G.dark}!important;border-radius:18px!important;box-shadow:7px 7px 0 rgba(217,184,90,.65)!important;background:#fff!important}

      /* Keep object icon boards unchanged except for neutral frame */
      .search-board{border-color:#D8E3D5!important}.search-cell{background:#FFFDF8!important;border-color:#D7E1D4!important}
      .comic-scene{box-shadow:4px 4px 0 rgba(217,184,90,.35)!important}

      @media(max-width:900px){.catalog-grid,.product-grid{grid-template-columns:1fr}.cognitive-photo[src*="assets/v16_6/"]{max-height:none!important}}
    `;
    document.head.appendChild(s);
    const meta=document.querySelector('meta[name="theme-color"]'); if(meta) meta.setAttribute('content',G.dark);
  }
  window.addEventListener('load',()=>{let n=0;const t=setInterval(()=>{n++;if($('#appShell')){addStyles();[350,900,1800].forEach(ms=>setTimeout(addStyles,ms));clearInterval(t)}if(n>120)clearInterval(t)},100)});
})();
