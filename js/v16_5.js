(function(){
  const $=s=>document.querySelector(s);
  const P={navy:'#183153',turq:'#2EC4B6',turqSoft:'#9ADFD8',coral:'#FF6B6B',yellow:'#FFD166',cream:'#FFFDF7',ink:'#183153',muted:'#6B7A90',track:'#E8EFEE'};

  function addStyles(){
    if($('#v165Styles')) return;
    const s=document.createElement('style');
    s.id='v165Styles';
    s.textContent=`
      /* V16.5 – soften dashboard progress and let exercise artwork carry the colour */
      #home .level-track{background:${P.track}!important;border:1px solid #DDE7E5!important;height:8px!important;border-radius:999px!important;overflow:hidden!important}
      #home .level-track span{background:linear-gradient(90deg,#8FD7D0,#B8E5DF)!important;box-shadow:none!important}
      #home .level-row strong{color:#5F7C7A!important;font-weight:850!important}
      #home .panel-card{box-shadow:0 3px 0 rgba(24,49,83,.035)!important}
      #home .focus-card{background:linear-gradient(145deg,#214462,#1B3652)!important}
      #home .focus-card .eyebrow{color:${P.yellow}!important}

      /* Secondary progress indicators outside the home page */
      .bar{background:#EDF2F1!important;border-radius:999px!important;overflow:hidden!important}
      .bar span{background:linear-gradient(90deg,#8FD7D0,#B8E5DF)!important;box-shadow:none!important}

      /* Doodle / illustrated visual-search scenes */
      .shape-visual .doodle-scene{font-size:1rem!important;text-align:left!important;max-width:980px!important;margin:10px auto 18px!important}
      .doodle-scene svg{display:block;width:100%;height:auto;max-height:590px;border:2px solid ${P.navy};border-radius:22px;box-shadow:7px 7px 0 ${P.yellow};background:#fff}
      @media(max-width:900px){.doodle-scene svg{max-height:none}}

      /* Keep older icon grids, but visually demote them versus the new scenes */
      .shape-visual .search-board{max-width:820px!important}
      .shape-visual .comic-scene{max-width:860px!important;box-shadow:5px 5px 0 #F3DDA2!important}
      .v13-visual-items{max-width:760px!important;margin-left:auto!important;margin-right:auto!important}
      .v13-visual-items span{min-height:68px!important;font-size:1.85rem!important;background:#FFFDF7!important}

      /* Functional documents: compact cards */
      .shape-visual .lh-doc{max-width:610px!important;padding:16px!important;margin:10px auto 16px!important;box-shadow:0 8px 22px rgba(24,49,83,.07)!important}
      .shape-visual .lh-doc .doc-route{font-size:1rem!important}
      .shape-visual .lh-doc .trip-row,.shape-visual .lh-doc .doc-lines{font-size:.84rem!important}
      .shape-visual .lh-doc .doc-grid{gap:8px!important}

      /* Give visual exercises breathing room */
      #exerciseVisual:not(:empty){margin-top:6px!important;margin-bottom:12px!important}
      #exerciseOptions{margin-top:10px!important}
    `;
    document.head.appendChild(s);
  }

  function upgrade(){ addStyles(); }
  window.addEventListener('load',()=>{
    let n=0;
    const t=setInterval(()=>{
      n++;
      if($('#appShell')){upgrade();[400,1000,2200].forEach(ms=>setTimeout(upgrade,ms));clearInterval(t);}
      if(n>120) clearInterval(t);
    },100);
  });
})();
