(function () {
  /* ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧??     ?꾩옣 ?낅Т?쇱? ???좎씪愿由?> ?낅Т?쇱? ??뿉 ?뱀뀡 二쇱엯
     ??援ш? ?쒗듃 URL???꾨옒???낅젰?섏꽭??  ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧??*/

  const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyQYqRTAjAo_0-7KBHRtVO9k8vDqgebVIFRZEUu2rbXB0st6JL4zYQRWPjif4otlmU/exec';

  const SESSION_KEY = 'worklog-form-v1';

  function today() { return new Date().toISOString().slice(0, 10); }
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function getCurrentUser() {
    try { const s = sessionStorage.getItem('solar-staff-session-v1'); if (s) return JSON.parse(s).name||''; } catch(e){}
    if (typeof loginName === 'function') { const n = loginName(); if (n) return n; }
    return '';
  }

  function getState() {
    try { return JSON.parse(localStorage.getItem('solar-admin-state-v1')||'null'); } catch(e){ return null; }
  }

  function saveAppState(st) {
    localStorage.setItem('solar-admin-state-v1', JSON.stringify(st));
  }

  function showToast(msg) {
    const el = document.getElementById('toast');
    if (el) { el.textContent = msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'), 3000); }
  }

  function saveForm() {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(collectForm())); } catch(e) {}
  }

  function loadSavedForm() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null'); } catch(e){ return null; }
  }

  /* ?? ??HTML ?? */
  function plantRowHtml(plant, type, content) {
    const plants = ['?援??쒖뼇愿?,'?쒓? ?꾩옣','寃쎌＜ 諛쒖쟾??,'湲고?'];
    const types  = ['?ъ뾽二??뚰넻','?쒓났? 議곗쑉','?꾩옣 ?먭?','?곸뾽','?됱젙'];
    return `<div class="wl-row" style="display:grid;grid-template-columns:130px 110px 1fr 32px;gap:4px 6px;margin-bottom:5px;align-items:center">
      <select class="field wl-plant-name" style="font-size:12px;padding:4px 6px">
        ${plants.map(v=>`<option${v===(plant||'?援??쒖뼇愿?)?' selected':''}>${esc(v)}</option>`).join('')}
      </select>
      <select class="field wl-plant-type" style="font-size:12px;padding:4px 6px">
        ${types.map(v=>`<option${v===(type||'?ъ뾽二??뚰넻')?' selected':''}>${esc(v)}</option>`).join('')}
      </select>
      <input class="field wl-plant-content" style="font-size:12px;padding:4px 6px" placeholder="?댁슜 ?낅젰" value="${esc(content||'')}">
      <button class="btn icon wl-del-row" style="font-size:14px;padding:2px 7px;color:#e44;background:none;border:1px solid #e44">횞</button>
    </div>`;
  }

  function salesRowHtml(name, content) {
    return `<div class="wl-row" style="display:grid;grid-template-columns:130px 1fr 32px;gap:4px 6px;margin-bottom:5px;align-items:center">
      <input class="field wl-sales-name" style="font-size:12px;padding:4px 6px" placeholder="?곸뾽?먮챸" value="${esc(name||'')}">
      <input class="field wl-sales-content" style="font-size:12px;padding:4px 6px" placeholder="?뚰넻 ?댁슜" value="${esc(content||'')}">
      <button class="btn icon wl-del-row" style="font-size:14px;padding:2px 7px;color:#e44;background:none;border:1px solid #e44">횞</button>
    </div>`;
  }

  function matRowHtml(name, status, action) {
    const statuses = ['?ш퀬 ?ъ쑀','?ш퀬 遺議?,'?뺤씤 ?꾩슂'];
    const icons    = {'?ш퀬 ?ъ쑀':'?윟','?ш퀬 遺議?:'?뵶','?뺤씤 ?꾩슂':'?윞'};
    return `<div class="wl-row" style="display:grid;grid-template-columns:120px 110px 1fr 32px;gap:4px 6px;margin-bottom:5px;align-items:center">
      <input class="field wl-mat-name" style="font-size:12px;padding:4px 6px" placeholder="?먯옱紐? value="${esc(name||'')}">
      <select class="field wl-mat-status" style="font-size:12px;padding:4px 6px">
        ${statuses.map(v=>`<option${v===(status||'?ш퀬 ?ъ쑀')?' selected':''}>${icons[v]} ${esc(v)}</option>`).join('')}
      </select>
      <input class="field wl-mat-action" style="font-size:12px;padding:4px 6px" placeholder="議곗튂 ?댁슜" value="${esc(action||'')}">
      <button class="btn icon wl-del-row" style="font-size:14px;padding:2px 7px;color:#e44;background:none;border:1px solid #e44">횞</button>
    </div>`;
  }

  function sectionHead(icon, title, addId, addLabel) {
    return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <div style="font-weight:700;font-size:13px;color:#08245c">${icon} ${title}</div>
      <button class="btn" id="${addId}" style="font-size:12px;padding:4px 10px">${addLabel}</button>
    </div>`;
  }

  /* ?? 援ш? ?쒗듃 ?곕룞 ?곹깭 ?쒖떆 ?? */
  function sheetConnected() { return SHEET_URL && SHEET_URL !== 'YOUR_APPS_SCRIPT_WEB_APP_URL'; }

  function buildSectionsHtml(saved, diaryDate) {
    const s = saved || {};
    const plants   = s.plants   || [{}];
    const sales    = s.sales    || [{}];
    const mats     = s.mats     || [{}];
    const remarks  = s.remarks  || '';
    const author   = getCurrentUser();

    const sheetBadge = sheetConnected()
      ? `<span style="background:#1a8c4e;color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;margin-left:8px">??援ш? ?쒗듃 ?곕룞??/span>`
      : `<span style="background:#e44;color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;margin-left:8px" title="worklog.js??SHEET_URL???ㅼ젙?댁＜?몄슂">??援ш? ?쒗듃 誘몄뿰??/span>`;

    return `<div id="wlFormWrap" style="margin-top:16px;border-top:2px solid #087d8f;padding-top:16px">

      <!-- ?ㅻ뜑 -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #e0ecef">
        <div style="font-size:15px;font-weight:700;color:#08245c">
          ?뱟 ?쇱씪 ?낅Т?쇱? (怨듬Т/?꾩옣 ?듯빀)
          ${sheetBadge}
        </div>
        <div style="display:flex;gap:8px;align-items:center;font-size:12px;color:#65737d">
          <span>?좎쭨: <strong>${esc(diaryDate||today())}</strong></span>
          <span>?묒꽦?? <strong>${esc(author||'??)}</strong></span>
        </div>
      </div>

      <!-- ??諛쒖쟾?뚮퀎 ?듭떖 ?낅Т -->
      <div class="wl-section" style="background:#f7fbff;border:1px solid #c8dff0;border-radius:8px;padding:14px;margin-bottom:12px">
        ${sectionHead('?뵖','諛쒖쟾?뚮퀎 ?듭떖 ?낅Т (?ъ뾽二??쒓났?/?곸뾽 ?뚰넻)','wlAddPlant','+ ?낅Т 異붽?')}
        <div style="display:grid;grid-template-columns:130px 110px 1fr 32px;gap:4px 6px;margin-bottom:6px;font-size:11px;color:#8aacbe;padding:0 2px">
          <span>諛쒖쟾??/span><span>?낅Т 遺꾨쪟</span><span>?댁슜</span><span></span>
        </div>
        <div id="wlPlantList">${plants.map(p=>plantRowHtml(p.plant,p.type,p.content)).join('')}</div>
      </div>

      <!-- ???곸뾽???뚰넻 -->
      <div class="wl-section" style="background:#f7fff8;border:1px solid #b8e6c0;border-radius:8px;padding:14px;margin-bottom:12px">
        ${sectionHead('?쩃','?곸뾽???뚰넻','wlAddSales','+ ?뚰넻 異붽?')}
        <div style="display:grid;grid-template-columns:130px 1fr 32px;gap:4px 6px;margin-bottom:6px;font-size:11px;color:#8aacbe;padding:0 2px">
          <span>?곸뾽?먮챸</span><span>?뚰넻 ?댁슜</span><span></span>
        </div>
        <div id="wlSalesList">${sales.map(r=>salesRowHtml(r.name,r.content)).join('')}</div>
      </div>

      <!-- ???꾩옣 ?뚮え?먯옱 -->
      <div class="wl-section" style="background:#fffaf5;border:1px solid #f0d8b0;border-radius:8px;padding:14px;margin-bottom:12px">
        ${sectionHead('?벀','?꾩옣 ?뚮え?먯옱 愿由?(?ш퀬 諛?諛쒖＜)','wlAddMat','+ ?먯옱 異붽?')}
        <div style="display:grid;grid-template-columns:120px 110px 1fr 32px;gap:4px 6px;margin-bottom:6px;font-size:11px;color:#8aacbe;padding:0 2px">
          <span>?먯옱紐?/span><span>?ш퀬 ?곹깭</span><span>議곗튂 ?댁슜</span><span></span>
        </div>
        <div id="wlMatList">${mats.map(m=>matRowHtml(m.name,m.status,m.action)).join('')}</div>
      </div>

      <!-- ???뱀씠?ы빆 諛??댁씪 ????-->
      <div class="wl-section" style="background:#fafafa;border:1px solid #dde;border-radius:8px;padding:14px;margin-bottom:12px">
        <div style="font-weight:700;font-size:13px;color:#08245c;margin-bottom:8px">?뱷 ?뱀씠?ы빆 諛??댁씪 ????/div>
        <textarea id="wlRemarks" class="field"
          style="width:100%;box-sizing:border-box;min-height:120px;font-size:13px;line-height:1.7;resize:vertical;display:block"
          placeholder="- ?댁씪 ?ㅼ쟾 10??吏?먯껜 ?대떦???명뿀媛 蹂댁셿 ?쒕쪟 ?듯솕 ?꾩슂&#10;- 以??⑥쐞濡??묒꽦 ??[???댁씪 ?좎씪 ?먮룞 異붽?] 踰꾪듉?쇰줈 ?좎씪愿由ъ뿉 ?깅줉?⑸땲??>${esc(remarks)}</textarea>
      </div>

      <!-- ??踰꾪듉 -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;padding:4px 0 8px">
        <button id="wlSaveAll" style="flex:1;min-width:150px;padding:11px 0;background:#08245c;color:#fff;font-weight:700;font-size:13px;border:none;border-radius:8px;cursor:pointer">?뮶 ?ㅻ뒛 ?쇱? ???{sheetConnected()?'':'  (濡쒖뺄)'}</button>
        <button id="wlKakao" style="flex:1;min-width:150px;padding:11px 0;background:#FEE500;color:#3C1E1E;font-weight:700;font-size:13px;border:none;border-radius:8px;cursor:pointer">?뮠 移댄넚 蹂닿퀬???띿뒪??蹂듭궗</button>
        <button id="wlAddTodoBtn" style="flex:1;min-width:150px;padding:11px 0;background:#087d8f;color:#fff;font-weight:700;font-size:13px;border:none;border-radius:8px;cursor:pointer">???댁씪 ?좎씪 ?먮룞 異붽?</button>
      </div>
      <div id="wlMsg" style="font-size:12px;min-height:18px;padding:2px 4px"></div>
    </div>`;
  }

  function collectForm() {
    const plants = Array.from(document.querySelectorAll('#wlPlantList .wl-row')).map(r=>({
      plant:   r.querySelector('.wl-plant-name')?.value||'',
      type:    r.querySelector('.wl-plant-type')?.value||'',
      content: r.querySelector('.wl-plant-content')?.value.trim()||''
    })).filter(p=>p.content);

    const sales = Array.from(document.querySelectorAll('#wlSalesList .wl-row')).map(r=>({
      name:    r.querySelector('.wl-sales-name')?.value.trim()||'',
      content: r.querySelector('.wl-sales-content')?.value.trim()||''
    })).filter(s=>s.name||s.content);

    const mats = Array.from(document.querySelectorAll('#wlMatList .wl-row')).map(r=>({
      name:   r.querySelector('.wl-mat-name')?.value.trim()||'',
      status: r.querySelector('.wl-mat-status')?.value||'?ш퀬 ?ъ쑀',
      action: r.querySelector('.wl-mat-action')?.value.trim()||''
    })).filter(m=>m.name);

    const remarks = document.getElementById('wlRemarks')?.value.trim()||'';
    return { plants, sales, mats, remarks };
  }

  /* ?? 移댄넚 ?띿뒪???? */
  function buildKakao(diaryDate) {
    const st = getState(); if (!st) return '';
    const date = diaryDate || today();
    const person = getCurrentUser();
    const todos = (st.todos||[]).filter(t=>(t.due===date||t.start===date));
    const form = collectForm();

    let text = `[?꾩옣 ?낅Т?쇱?] ${date}${person?' / '+person:''}\n${'?'.repeat(32)}\n\n`;

    if (form.plants.length) {
      text += '?뵖 諛쒖쟾?뚮퀎 ?듭떖 ?낅Т\n';
      form.plants.forEach(p=>{ text += `  쨌 ${p.plant} | ${p.type} | ${p.content}\n`; });
      text += '\n';
    }

    const done  = todos.filter(t=>t.status==='?꾨즺');
    const doing = todos.filter(t=>t.status==='吏꾪뻾以?);
    if (done.length||doing.length) {
      text += '???좎씪 ?꾪솴\n';
      done.forEach(t=>{ text += `  ??${t.title}\n`; });
      doing.forEach(t=>{ text += `  ?봽 ${t.title}\n`; });
      text += '\n';
    }

    if (form.sales.length) {
      text += '?쩃 ?곸뾽???뚰넻\n';
      form.sales.forEach(s=>{ text += `  쨌 ${s.name} ??${s.content}\n`; });
      text += '\n';
    }

    if (form.mats.length) {
      text += '?벀 ?꾩옣 ?뚮え?먯옱\n';
      form.mats.forEach(m=>{ text += `  쨌 ${m.name} [${m.status}] ${m.action}\n`; });
      text += '\n';
    }

    if (form.remarks) {
      text += '?뱷 ?뱀씠?ы빆 諛??댁씪 ????n';
      form.remarks.split('\n').forEach(l=>{ if(l.trim()) text += `  ${l}\n`; });
    }
    return text;
  }

  /* ?? 援ш? ?쒗듃 ????? */
  async function saveToSheet(diaryDate) {
    const st = getState();
    const date = diaryDate || today();
    const person = getCurrentUser();
    const todos = (st?.todos||[]).filter(t=>(t.due===date||t.start===date));
    const form = collectForm();

    const payload = {
      date, person,
      plants:    form.plants,
      sales:     form.sales,
      materials: form.mats,
      remarks:   form.remarks,
      todos: todos.map(t=>({ title:t.title, status:t.status, priority:t.priority||'蹂댄넻', owner:t.owner||'' }))
    };

    const res = await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error||'????ㅽ뙣');
    return json;
  }

  /* ?? ?대깽??諛붿씤???? */
  function bindSectionEvents(diaryDate) {
    const wrap = document.getElementById('wlFormWrap');
    if (!wrap) return;

    wrap.addEventListener('input',  saveForm);
    wrap.addEventListener('change', saveForm);

    wrap.addEventListener('click', function(e) {
      if (e.target.classList.contains('wl-del-row')) {
        e.target.closest('.wl-row').remove();
        saveForm();
      }
    });

    document.getElementById('wlAddPlant')?.addEventListener('click', ()=>{
      document.getElementById('wlPlantList').insertAdjacentHTML('beforeend', plantRowHtml());
    });
    document.getElementById('wlAddSales')?.addEventListener('click', ()=>{
      document.getElementById('wlSalesList').insertAdjacentHTML('beforeend', salesRowHtml());
    });
    document.getElementById('wlAddMat')?.addEventListener('click', ()=>{
      document.getElementById('wlMatList').insertAdjacentHTML('beforeend', matRowHtml());
    });

    /* ?뮶 ???*/
    document.getElementById('wlSaveAll')?.addEventListener('click', async function() {
      saveForm();
      const st = getState();
      if (st) {
        if (!st._fieldDiary) st._fieldDiary = {};
        st._fieldDiary[diaryDate||today()] = collectForm();
        saveAppState(st);
      }

      if (sheetConnected()) {
        setMsg('援ш? ?쒗듃?????以?..', '#087d8f');
        try {
          await saveToSheet(diaryDate);
          setMsg('??援ш? ?쒗듃 + 濡쒖뺄????λ릱?듬땲??', '#1a8c4e');
        } catch(err) {
          setMsg('??濡쒖뺄 ????꾨즺 (?쒗듃 ????ㅽ뙣: ' + err.message + ')', '#b86d13');
        }
      } else {
        setMsg('??濡쒖뺄????λ릱?듬땲??(援ш? ?쒗듃 誘몄뿰??', '#2a7');
      }
      setTimeout(()=>setMsg(''), 4000);
    });

    /* ?뮠 移댄넚 蹂듭궗 */
    document.getElementById('wlKakao')?.addEventListener('click', function() {
      navigator.clipboard.writeText(buildKakao(diaryDate))
        .then(()=>{ setMsg('??移댄넚???띿뒪?멸? 蹂듭궗?먯뼱??', '#2a7'); setTimeout(()=>setMsg(''), 3000); })
        .catch(()=>setMsg('蹂듭궗 ?ㅽ뙣 ???대┰蹂대뱶 沅뚰븳 ?뺤씤', '#e44'));
    });

    /* ???댁씪 ?좎씪 異붽? */
    document.getElementById('wlAddTodoBtn')?.addEventListener('click', function() {
      const remarks = document.getElementById('wlRemarks')?.value.trim()||'';
      if (!remarks) { setMsg('?뱀씠?ы빆/?댁씪 ???쇰????댁슜???낅젰?댁＜?몄슂.', '#e44'); return; }
      const lines = remarks.split('\n')
        .map(l=>l.replace(/^[\-쨌\*\d\.\s?뜯넂]+/,'').trim())
        .filter(l=>l.length > 2);
      if (!lines.length) { setMsg('異붽?????ぉ??李얠? 紐삵뻽?댁슂.', '#e44'); return; }
      const st = getState(); if (!st) return;
      const tmr = new Date(); tmr.setDate(tmr.getDate()+1);
      const tomorrowStr = tmr.toISOString().slice(0,10);
      const author = getCurrentUser();
      lines.forEach(line=>{
        st.todos.push({
          id: 'todo_wl_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
          title: line, owner: author, status: '????,
          priority: '蹂댄넻', due: tomorrowStr, detail: ''
        });
      });
      saveAppState(st);
      if (typeof render === 'function') setTimeout(render, 100);
      setMsg(`??${lines.length}媛???ぉ???댁씪(${tomorrowStr}) ?좎씪??異붽??덉뼱??`, '#2a7');
      setTimeout(()=>setMsg(''), 4000);
    });
  }

  function setMsg(msg, color) {
    const el = document.getElementById('wlMsg');
    if (el) { el.textContent = msg; el.style.color = color||'#2a7'; }
  }

  /* ?? ?ㅼ씠?대━ ?⑤꼸???뱀뀡 二쇱엯 ?? */
  function injectIntoPanel() {
    const syncBtn = document.getElementById('diarySyncBtn');
    if (!syncBtn) return;
    if (document.getElementById('wlFormWrap')) return;

    const dateLabel = document.querySelector('strong[style*="min-width:110px"]') ||
                      document.querySelector('.diary-date-label');
    const diaryDate = dateLabel ? dateLabel.textContent.trim() : today();

    const st = getState();
    const savedForDate = st?._fieldDiary?.[diaryDate] || null;
    const saved = savedForDate || loadSavedForm();

    const wrapDiv = document.createElement('div');
    wrapDiv.innerHTML = buildSectionsHtml(saved, diaryDate);
    const sectionsEl = wrapDiv.firstElementChild;

    const sheetViewerWrap = document.getElementById('sheetViewerBtn')?.closest('div[style*="margin-top:20px"]');
    if (sheetViewerWrap?.parentElement) {
      sheetViewerWrap.parentElement.insertBefore(sectionsEl, sheetViewerWrap.nextSibling);
    } else {
      const panel = document.getElementById('todoBoardPanel');
      if (panel) panel.appendChild(sectionsEl);
    }

    bindSectionEvents(diaryDate);
  }

  /* ?? MutationObserver ?? */
  let debounceTimer = null;
  function watch() {
    injectIntoPanel();
    new MutationObserver(function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(injectIntoPanel, 80);
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watch);
  } else {
    watch();
  }
})();
