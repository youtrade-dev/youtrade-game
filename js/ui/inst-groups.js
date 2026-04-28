// instrument groups (favorites + custom + filter modal)
// Original: index.html script_07.js

var LS_KEY='yt.instGroups.v1';
  function loadState(){
    try{ var s=JSON.parse(localStorage.getItem(LS_KEY)||'null'); if(s && Array.isArray(s.groups) && typeof s.active!=='undefined') return s; }catch(e){}
    return {active:'all', groups:[]};
  }
  function saveState(s){ try{ localStorage.setItem(LS_KEY, JSON.stringify(s)); }catch(e){} }
  var state = loadState();
  function getFavs(){ try{ return JSON.parse(localStorage.getItem('yt_favs')||'[]'); }catch(e){ return []; } }
  
  function renderBar(){
    var bar = document.getElementById('inst-groups-bar');
    if(!bar) return;
    bar.innerHTML = '';
    var mk = function(label, id, extraCls, clickHandler, closeHandler){
      var p = document.createElement('div');
      p.className = 'ig-pill' + (extraCls||'') + (state.active===id ? ' active' : '');
      p.textContent = label;
      p.onclick = clickHandler;
      if(closeHandler){
        var x = document.createElement('span');
        x.className='ig-close'; x.textContent='×';
        x.onclick = function(e){ e.stopPropagation(); closeHandler(); };
        p.appendChild(x);
      }
      bar.appendChild(p);
    };
    mk('Все','all','', function(){ setActive('all'); });
    mk('★ Избранное','favs',' ig-pill-star', function(){ setActive('favs'); });
    state.groups.forEach(function(g){
      mk(g.name, 'g:'+g.id, '', function(){ setActive('g:'+g.id); }, function(){
        if(confirm('Удалить группу "'+g.name+'"?')){
          state.groups = state.groups.filter(function(x){ return x.id!==g.id; });
          if(state.active==='g:'+g.id) state.active='all';
          saveState(state); renderBar(); applyFilter();
        }
      });
    });
    var add = document.createElement('div');
    add.className = 'ig-pill ig-pill-add';
    add.textContent = '+ группа';
    add.onclick = openCreateModal;
    bar.appendChild(add);
  }
  
  function setActive(id){
    exitEditMode();
    state.active = id;
    saveState(state);
    renderBar(); applyFilter();
  }
  
  function applyFilter(){
    var allRows = Array.from(document.querySelectorAll('.inst-row'));
    var groups = Array.from(document.querySelectorAll('.inst-list-group'));
    allRows.forEach(function(r){ r.classList.remove('ig-hidden','ig-selectable','ig-member'); });
    groups.forEach(function(g){ g.classList.remove('ig-hidden'); });
    var oldBar = document.getElementById('ig-edit-bar'); if(oldBar) oldBar.remove();
    if(state.active==='all'){ return; }
    var allow = null;
    if(state.active==='favs'){ allow = getFavs(); }
    else if(state.active.indexOf('g:')===0){
      var id = state.active.slice(2);
      var g = state.groups.find(function(x){ return x.id===id; });
      allow = g ? g.members.slice() : [];
    }
    if(!allow) return;
    allRows.forEach(function(r){
      var oc = r.getAttribute('onclick')||'';
      var m = oc.match(/selAsset2\('([^']+)'/);
      var key = m ? m[1] : null;
      if(!key || allow.indexOf(key)<0) r.classList.add('ig-hidden');
    });
    groups.forEach(function(g){
      var visible = g.querySelectorAll('.inst-row:not(.ig-hidden)').length;
      if(!visible) g.classList.add('ig-hidden');
    });
  }
  
  function openCreateModal(){
    var modal = buildModal('Новая группа', '', function(name){
      name = (name||'').trim();
      if(!name) return;
      var id = 'g'+Date.now().toString(36);
      state.groups.push({id:id, name:name, members:[]});
      state.active = 'g:'+id;
      saveState(state);
      renderBar(); applyFilter();
      enterEditMode();
    });
    document.body.appendChild(modal);
  }
  function buildModal(title, initialValue, onOk){
    var bd = document.createElement('div');
    bd.className = 'ig-modal-backdrop';
    bd.innerHTML = '<div class="ig-modal"><h3>'+title+'</h3>'+
      '<input type="text" id="ig-modal-input" placeholder="Например, Мой топ" value="'+(initialValue||'').replace(/"/g,'&quot;')+'" maxlength="24">'+
      '<div class="ig-modal-actions">'+
        '<button class="ig-btn-cancel" id="ig-modal-cancel">Отмена</button>'+
        '<button class="ig-btn-ok" id="ig-modal-ok">Создать</button>'+
      '</div></div>';
    bd.onclick = function(e){ if(e.target===bd) bd.remove(); };
    setTimeout(function(){ var i=bd.querySelector('#ig-modal-input'); if(i){ i.focus(); i.select(); } }, 10);
    bd.querySelector('#ig-modal-cancel').onclick = function(){ bd.remove(); };
    bd.querySelector('#ig-modal-ok').onclick = function(){
      var v = bd.querySelector('#ig-modal-input').value;
      onOk(v);
      bd.remove();
    };
    bd.querySelector('#ig-modal-input').addEventListener('keydown', function(e){
      if(e.key==='Enter'){ bd.querySelector('#ig-modal-ok').click(); }
      if(e.key==='Escape'){ bd.remove(); }
    });
    return bd;
  }
  
  var editingGroupId = null;
  function enterEditMode(){
    if(state.active.indexOf('g:')!==0) return;
    editingGroupId = state.active.slice(2);
    var g = state.groups.find(function(x){ return x.id===editingGroupId; });
    if(!g) return;
    var allRows = Array.from(document.querySelectorAll('.inst-row'));
    var groups = Array.from(document.querySelectorAll('.inst-list-group'));
    allRows.forEach(function(r){ r.classList.remove('ig-hidden'); });
    groups.forEach(function(gg){ gg.classList.remove('ig-hidden'); });
    allRows.forEach(function(r){
      r.classList.add('ig-selectable');
      var oc = r.getAttribute('onclick')||'';
      var m = oc.match(/selAsset2\('([^']+)'/);
      var key = m ? m[1] : null;
      if(key && g.members.indexOf(key)>=0) r.classList.add('ig-member');
      if(oc){ r.dataset.igOrigOnclick = oc; r.removeAttribute('onclick'); }
      r.onclick = function(e){
        e.preventDefault(); e.stopPropagation();
        if(!key) return;
        var gr = state.groups.find(function(x){ return x.id===editingGroupId; });
        if(!gr) return;
        var idx = gr.members.indexOf(key);
        if(idx>=0){ gr.members.splice(idx,1); r.classList.remove('ig-member'); }
        else { gr.members.push(key); r.classList.add('ig-member'); }
        saveState(state);
      };
    });
    var bar = document.createElement('div');
    bar.id = 'ig-edit-bar';
    bar.className = 'ig-edit-bar';
    bar.innerHTML = '<div><div class="ig-edit-title">Редактирование: '+escapeHtml(g.name)+'</div><div class="ig-edit-hint">Нажимайте на инструменты, чтобы добавить или убрать</div></div>'+
      '<button class="ig-edit-done" id="ig-edit-done">Готово</button>';
    var list = document.querySelector('.inst-list');
    if(list) list.insertBefore(bar, list.children[1]||null);
    document.getElementById('ig-edit-done').onclick = function(){ exitEditMode(); applyFilter(); };
  }
  function exitEditMode(){
    if(editingGroupId===null) return;
    editingGroupId = null;
    var allRows = Array.from(document.querySelectorAll('.inst-row'));
    allRows.forEach(function(r){
      r.classList.remove('ig-selectable','ig-member');
      r.onclick = null;
      if(r.dataset.igOrigOnclick){ r.setAttribute('onclick', r.dataset.igOrigOnclick); delete r.dataset.igOrigOnclick; }
    });
    var b = document.getElementById('ig-edit-bar'); if(b) b.remove();
  }
  
  function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  
  var origToggle = window.toggleFav;
  if(typeof origToggle==='function'){
    window.toggleFav = function(key, starId, ev){
      var r = origToggle.apply(this, arguments);
      if(state.active==='favs'){ applyFilter(); }
      return r;
    };
  }
  
  function init(){
    if(!document.getElementById('inst-groups-bar')){
      setTimeout(init, 300); return;
    }
    renderBar();
    applyFilter();
    document.getElementById('inst-groups-bar').addEventListener('dblclick', function(e){
      var pill = e.target.closest('.ig-pill'); if(!pill) return;
      var txt = pill.textContent.replace(/×$/,'').trim();
      var g = state.groups.find(function(x){ return x.name===txt; });
      if(!g) return;
      var modal = buildModal('Переименовать', g.name, function(newName){
        newName = (newName||'').trim(); if(!newName) return;
        g.name = newName; saveState(state); renderBar();
      });
      modal.querySelector('#ig-modal-ok').textContent='Сохранить';
      document.body.appendChild(modal);
    });
  }
  /* boot moved to setup() */
export function setup() {
  if (typeof init === 'function') init();
}
