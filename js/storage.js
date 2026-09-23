(function(){
  const INDEX='learninglab_profiles_v4', CURRENT='learninglab_current_profile_v4';
  const Store={
    list(){try{return JSON.parse(localStorage.getItem(INDEX)||'[]')}catch{return[]}},
    saveList(v){localStorage.setItem(INDEX,JSON.stringify(v))},
    currentId(){return localStorage.getItem(CURRENT)||''}, setCurrent(id){localStorage.setItem(CURRENT,id)},
    key(id){return `learninglab_progress_v4_${id}`},
    loadProgress(id){try{return JSON.parse(localStorage.getItem(this.key(id))||'null')}catch{return null}},
    saveProgress(id,data){localStorage.setItem(this.key(id),JSON.stringify(data))},
    resetProgress(id){localStorage.removeItem(this.key(id))},
    create(name,ageBand){const list=this.list();const id=`p_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;const p={id,name:name.trim()||'Usuario',ageBand,createdAt:new Date().toISOString()};list.push(p);this.saveList(list);this.setCurrent(id);return p},
    remove(id){this.saveList(this.list().filter(p=>p.id!==id));localStorage.removeItem(this.key(id));if(this.currentId()===id)this.setCurrent('')}
  };
  window.ProfileStore=Store;
})();
