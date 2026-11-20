(function(root){
  'use strict';

  function mount(container,{getProfile,api}){
    const catalog=root.WorksheetCatalog,locales=root.LocaleContent.labels;
    const get=id=>container.querySelector('#'+id);
    const [age,level,locale,versions,solutions,orientation]=['hAge','hLevel','hLocale','hVersions','hSolutions','hOrientation'].map(get);
    const [display,order,status,generate,favorite,name]=['hFamilies','hOrder','hStatus','hGenerate','hFavorite','hFavoriteName'].map(get);
    const quick=document.getElementById('quickWorksheet');
    const selector=document.getElementById('worksheetMode');
    const [quickMode,advancedMode]=[...selector.querySelectorAll('button')];
    const entries=(select,values)=>select.replaceChildren(...Object.entries(values).map(([value,label])=>new Option(label,value)));
    entries(age,catalog.ages);
    entries(locale,locales);
    const quantities=new Map(),invalidCounts=new Set();
    let families=[],favorites=[],editing=null,owner=null,currentProfile=null,request=0,loading=true,generating=false,favoriteBusy=false,maxPerSheet=20;
    let customOrder=[];

    function element(tag,text,attributes={}){
      const node=document.createElement(tag);
      if(text)node.textContent=text;
      for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));
      return node;
    }
    const settings=()=>({age:age.value,level:Number(level.value),locale:locale.value});
    const selected=()=>customOrder.filter(id=>quantities.get(id)>0);
    function configuration(){
      return {...settings(),versions:Number(versions.value),solutions:solutions.checked,families:selected().map(id=>({id,count:quantities.get(id)}))};
    }
    function limits(){
      const max=Number(versions.value);
      const meta=new Map(families.map(f=>[f.id,f]));
      return selected().flatMap(id=>{
        const required=quantities.get(id)*max,available=meta.get(id)?.available||0;
        return required>available?[`${meta.get(id)?.label||catalog.familyLabel(id)}: disponibles ${available} de ${required} actividades distintas`]:[];
      });
    }
    function syncSummary(){
      const ids=selected(),total=ids.reduce((sum,id)=>sum+quantities.get(id),0);
      get('hTotal').textContent=`${total} ${total===1?'actividad':'actividades'} por ficha · ${ids.length} ${ids.length===1?'tipología':'tipologías'} · ${versions.value} ${versions.value==='1'?'versión':'versiones'}`;
      const shortages=limits();
      get('hShortages').textContent=loading?'':shortages.join(' · ');
      const invalid=!total||total>maxPerSheet||shortages.length||invalidCounts.size;
      if(invalidCounts.size)get('hShortages').textContent='Corrige las cantidades que no son números enteros a partir de cero.';
      if(total>maxPerSheet)get('hShortages').textContent=`Máximo ${maxPerSheet} actividades por ficha.`;
      generate.disabled=loading||generating||Boolean(invalid);
      get('hSave').disabled=loading||favoriteBusy||Boolean(invalid);
      get('hUpdate').disabled=loading||favoriteBusy||!editing||Boolean(invalid);
      for(const id of ['hDelete','hDuplicate','hLoad'])get(id).disabled=favoriteBusy||!favorite.value;
    }
    function drawOrder(){
      const available=new Map(families.map(f=>[f.id,f]));
      const ids=selected();
      order.replaceChildren(...ids.map((id,index)=>{
        const meta=available.get(id),label=meta?.label||catalog.familyLabel(id);
        const item=element('li');
        item.append(element('span',`${label} · ${quantities.get(id)}`));
        const moves=element('div',null,{class:'worksheet-order-controls'});
        for(const [step,word] of [[-1,'Subir'],[1,'Bajar']]){
          const button=element('button',word,{type:'button',class:'mini-btn','aria-label':word+' '+label});
          button.disabled=index+step<0||index+step>=ids.length;
          button.onclick=()=>{
            [ids[index],ids[index+step]]=[ids[index+step],ids[index]];
            customOrder=ids;
            drawOrder();
            order.children[index+step]?.querySelectorAll('button')[step<0?0:1]?.focus();
          };
          moves.append(button);
        }
        item.append(moves);
        return item;
      }));
      syncSummary();
    }
    function drawFamilies(){
      const groups=new Map();
      for(const meta of families){
        if(!meta.available||orientation.value&&meta.orientation.primary!==orientation.value)continue;
        if(!groups.has(meta.domain))groups.set(meta.domain,[]);
        groups.get(meta.domain).push(meta);
      }
      display.replaceChildren(...[...groups].map(([domain,group])=>{
        const panel=element('details',null,{class:'worksheet-family-group'});
        panel.open=group.some(meta=>quantities.get(meta.id)>0);
        panel.append(element('summary',`${catalog.areas[domain]} · ${group.length} tipologías`));
        for(const meta of group){
          const row=element('label',null,{class:'worksheet-family-row'});
          const copy=element('span');
          copy.append(element('strong',meta.label),element('small',`${meta.available} distintas · ${meta.orientation.primary==='curricular'?'Aprendizaje curricular':'Entrenamiento cognitivo'}`));
          if(meta.administration)copy.append(element('small',meta.administration));
          const input=element('input',null,{type:'number',min:0,max:Math.min(meta.available,maxPerSheet),step:1,'aria-label':`Cantidad de ${meta.label} · ${catalog.areas[domain]}`});
          input.dataset.family=meta.id;
          input.value=quantities.get(meta.id)||0;
          if(invalidCounts.has(meta.id))input.setCustomValidity('Introduce una cantidad entera a partir de cero.');
          input.oninput=()=>{
            const count=Number(input.value);
            if(!Number.isInteger(count)||count<0){
              invalidCounts.add(meta.id);
              input.setCustomValidity('Introduce una cantidad entera a partir de cero.');
              syncSummary();
              return;
            }
            invalidCounts.delete(meta.id);
            input.setCustomValidity('');
            quantities.set(meta.id,count);
            if(count&&!customOrder.includes(meta.id))customOrder.push(meta.id);
            drawOrder();
          };
          row.append(copy,input);
          panel.append(row);
        }
        return panel;
      }));
      const excluded=families.filter(meta=>!meta.available);
      const exclusions=get('hExclusions');
      exclusions.replaceChildren(...excluded.map(meta=>element('li',`${catalog.areas[meta.domain]} · ${meta.label} · ${meta.status==='interactive'?'Solo en pantalla':meta.status==='pending'?'Pendiente de revisión':'Sin actividades válidas en esta variante'}`)));
      drawOrder();
    }
    const message=text=>{status.textContent=text;};
    async function loadCatalog(){
      const profile=getProfile(),token=++request,account=api.user?.id;
      loading=true;families=[];syncSummary();
      message('Consultando las tipologías disponibles…');
      display.replaceChildren();
      if(!profile||!account){message('Selecciona un perfil para consultar el banco.');return;}
      try{
        const result=await api.requestContent({kind:'worksheet_catalog',client_revision:16,profile_id:profile.id,catalogue:settings()});
        if(token!==request||account!==api.user?.id||profile!==getProfile())return;
        if(result.error||!Array.isArray(result.families))throw Error(result.error||'No se recibió el catálogo de fichas.');
        families=result.families;maxPerSheet=result.maxPerSheet;loading=false;
        drawFamilies();message('Elige un área y asigna una cantidad a las tipologías que necesitas.');
      }catch(error){if(token===request){message(error.message);syncSummary();}}
    }
    function drawFavorites(id){
      favorite.replaceChildren(new Option('Selecciona una configuración',''),...favorites.map(item=>new Option(item.name,item.id)));
      favorite.value=favorites.some(item=>item.id===id)?id:'';
      syncSummary();
    }
    async function fetchFavorites(){
      const account=api.user?.id;
      if(!account)return;
      try{
        const rows=await api.listWorksheetFavorites();
        if(account!==api.user?.id||account!==owner)return;
        favorites=rows||[];drawFavorites(editing);
        get('hFavoriteStatus').textContent='';
      }catch(error){if(account===api.user?.id)get('hFavoriteStatus').textContent=error.message;}
    }
    function activeFavorite(){return favorites.find(item=>item.id===favorite.value);}
    function applyFavorite(item){
      catalog.configuration(item.configuration,locales);
      const config=item.configuration;
      age.value=config.age;level.value=config.level;locale.value=config.locale;
      versions.value=config.versions;solutions.checked=config.solutions;
      quantities.clear();invalidCounts.clear();customOrder=config.families.map(({id,count})=>{quantities.set(id,count);return id;});
      editing=item.id;favorite.value=item.id;name.value=item.name;
      drawOrder();return loadCatalog();
    }
    async function favoriteOperation(operation){
      if(favoriteBusy)return;
      const account=api.user?.id;
      favoriteBusy=true;syncSummary();
      try{await operation();if(account===owner)await fetchFavorites();}
      catch(error){if(account===owner)get('hFavoriteStatus').textContent=error.message;}
      finally{favoriteBusy=false;syncSummary();}
    }
    favorite.onchange=syncSummary;
    get('hLoad').onclick=()=>favoriteOperation(()=>applyFavorite(activeFavorite()));
    const save=id=>favoriteOperation(async()=>{
      const saved=await api.saveWorksheetFavorite(id,name.value,configuration());
      editing=saved.id;name.value=saved.name;
    });
    get('hSave').onclick=()=>save(null);
    get('hUpdate').onclick=()=>save(editing);
    get('hDuplicate').onclick=()=>favoriteOperation(async()=>{
      const source=activeFavorite();
      const label=(name.value.trim()&&name.value.trim()!==source.name)?name.value.trim():source.name.slice(0,72)+' (copia)';
      const saved=await api.saveWorksheetFavorite(null,label,source.configuration);
      await applyFavorite(saved);
    });
    get('hDelete').onclick=()=>{
      const source=activeFavorite();
      if(!source||!root.confirm('¿Eliminar la configuración «'+source.name+'»?'))return;
      favoriteOperation(async()=>{
        await api.removeWorksheetFavorite(source.id);
        if(editing===source.id){editing=null;name.value='';}
      });
    };

    function activate(){
      const profile=getProfile(),account=api.user?.id;
      if(!profile)return;
      if(owner!==account){
        owner=account;favorites=[];editing=null;name.value='';drawFavorites();
        quantities.clear();invalidCounts.clear();customOrder=[];
      }
      if(currentProfile!==profile){
        currentProfile=profile;
        if(!editing){
          age.value=root.AgeStages.route(profile);
          locale.value=api.effectiveLocale(profile);
        }
      }
      fetchFavorites();
      loadCatalog();
    }
    function show(advanced){
      quick.hidden=advanced;container.hidden=!advanced;
      quickMode.setAttribute('aria-pressed',String(!advanced));
      advancedMode.setAttribute('aria-pressed',String(advanced));
      if(advanced)activate();
    }
    quickMode.onclick=()=>show(false);
    advancedMode.onclick=()=>show(true);
    for(const select of [age,level,locale])select.onchange=loadCatalog;
    orientation.onchange=drawFamilies;
    versions.onchange=drawOrder;
    get('hClear').onclick=()=>{quantities.clear();invalidCounts.clear();customOrder=[];drawFamilies();};
    get('hGroup').onclick=()=>{
      const ranks=new Map(families.map((meta,index)=>[meta.id,index]));
      customOrder=selected().sort((a,b)=>(ranks.get(a)??999)-(ranks.get(b)??999));
      drawOrder();
    };
    generate.onclick=async()=>{
      const profile=getProfile(),account=api.user?.id,config=configuration();
      const unchanged=()=>profile===getProfile()&&account===api.user?.id&&JSON.stringify(config)===JSON.stringify(configuration());
      generating=true;syncSummary();message('Comprobando la composición antes de generar los documentos…');
      try{
        catalog.configuration(config,locales);
        const response=await api.requestContent({kind:'worksheet',client_revision:16,profile_id:profile.id,worksheet_plan:config,
          ...(profile._sessionOnly?{session_only:true}:{})});
        if(response.error)throw Error(response.error);
        if(!unchanged())throw Error('El perfil o la composición ha cambiado. Genera la ficha de nuevo.');
        const sheetProfile={name:'Ficha a la carta',age_band:config.age,progress:{ageRoute:config.age},contentLocale:config.locale};
        const verified=catalog.verify(response.versions,config,(item,domain)=>
          root.ActivityModel.preparePrintable(item,sheetProfile,config.locale,domain).item);
        await root.WorksheetGenerator.generate(verified,sheetProfile,undefined,{professional:true,solutions:config.solutions,catalogue:true,
          canDownload:unchanged});
        message(config.versions===1?'Ficha generada con las cantidades solicitadas.':'Versiones generadas con las cantidades solicitadas.');
      }catch(error){message(api.contentErrorMessage?.(error)||error.message);}
      finally{generating=false;syncSummary();}
    };
    return {refresh(){if(!container.hidden)activate();}};
  }

  root.WorksheetBuilder={mount};
})(window);
