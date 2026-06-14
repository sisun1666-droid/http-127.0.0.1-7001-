(function () {
  /* ═══════════════════════════════════════════════════
     현장 업무일지 — 할일관리 > 업무일지 탭에 섹션 주입
     ★ 구글 시트 URL을 아래에 입력하세요
  ═══════════════════════════════════════════════════ */

  var SHEET_URL = 'https://script.google.com/macros/s/AKfycbyQYqRTAjAo_0-7KBHRtVO9k8vDqgebVIFRZEUu2rbXB0st6JL4zYQRWPjif4otlmU/exec';
  var SESSION_KEY = 'worklog-form-v1';

  function today() { return new Date().toISOString().slice(0, 10); }
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function getCurrentUser() {
    try { var s = sessionStorage.getItem('solar-staff-session-v1'); if (s) return JSON.parse(s).name||''; } catch(e){}
    if (typeof loginName === 'function') { var n = loginName(); if (n) return n; }
    return '';
  }

  function getState() {
    try { return JSON.parse(localStorage.getItem('solar-admin-state-v1')||'null'); } catch(e){ return null; }
  }

  function saveAppState(st) {
    localStorage.setItem('solar-admin-state-v1', JSON.stringify(st));
  }

  function showToast(msg) {
    var el = document.getElementById('toast');
    if (el) { el.textContent = msg; el.classList.add('show'); setTimeout(function(){ el.classList.remove('show'); }, 3000); }
  }

  function saveForm() {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(collectForm())); } catch(e) {}
  }

  function loadSavedForm() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null'); } catch(e){ return null; }
  }

  /* ── 행 HTML ── */
  function plantRowHtml(plant, type, content) {
    var plants = ['대구 태양광','왜관 현장','경주 발전소','기타'];
    var types  = ['사업주 소통','시공팀 조율','현장 점검','영업','행정'];
    return '<div class="wl-row" style="display:grid;grid-template-columns:130px 110px 1fr 32px;gap:4px 6px;margin-bottom:5px;align-items:center">' +
      '<select class="field wl-plant-name" style="font-size:12px;padding:4px 6px">' +
      plants.map(function(v){ return '<option'+(v===(plant||'대구 태양광')?' selected':'')+'>'+esc(v)+'</option>'; }).join('') +
      '</select>' +
      '<select class="field wl-plant-type" style="font-size:12px;padding:4px 6px">' +
      types.map(function(v){ return '<option'+(v===(type||'사업주 소통')?' selected':'')+'>'+esc(v)+'</option>'; }).join('') +
      '</select>' +
      '<input class="field wl-plant-content" style="font-size:12px;padding:4px 6px" placeholder="내용 입력" value="'+esc(content||'')+'">' +
      '<button class="btn icon wl-del-row" style="font-size:14px;padding:2px 7px;color:#e44;background:none;border:1px solid #e44">×</button>' +
      '</div>';
  }

  function salesRowHtml(name, content) {
    return '<div class="wl-row" style="display:grid;grid-template-columns:130px 1fr 32px;gap:4px 6px;margin-bottom:5px;align-items:center">' +
      '<input class="field wl-sales-name" style="font-size:12px;padding:4px 6px" placeholder="영업자명" value="'+esc(name||'')+'">' +
      '<input class="field wl-sales-content" style="font-size:12px;padding:4px 6px" placeholder="소통 내용" value="'+esc(content||'')+'">' +
      '<button class="btn icon wl-del-row" style="font-size:14px;padding:2px 7px;color:#e44;background:none;border:1px solid #e44">×</button>' +
      '</div>';
  }

  function matRowHtml(name, status, action) {
    var statuses = ['재고 여유','재고 부족','확인 필요'];
    var icons    = {'재고 여유':'🟢','재고 부족':'🔴','확인 필요':'🟡'};
    return '<div class="wl-row" style="display:grid;grid-template-columns:120px 110px 1fr 32px;gap:4px 6px;margin-bottom:5px;align-items:center">' +
      '<input class="field wl-mat-name" style="font-size:12px;padding:4px 6px" placeholder="자재명" value="'+esc(name||'')+'">' +
      '<select class="field wl-mat-status" style="font-size:12px;padding:4px 6px">' +
      statuses.map(function(v){ return '<option'+(v===(status||'재고 여유')?' selected':'')+'>'+icons[v]+' '+esc(v)+'</option>'; }).join('') +
      '</select>' +
      '<input class="field wl-mat-action" style="font-size:12px;padding:4px 6px" placeholder="조치 내용" value="'+esc(action||'')+'">' +
      '<button class="btn icon wl-del-row" style="font-size:14px;padding:2px 7px;color:#e44;background:none;border:1px solid #e44">×</button>' +
      '</div>';
  }

  function sectionHead(icon, title, addId, addLabel) {
    return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
      '<div style="font-weight:700;font-size:13px;color:#08245c">'+icon+' '+title+'</div>' +
      '<button class="btn" id="'+addId+'" style="font-size:12px;padding:4px 10px">'+addLabel+'</button>' +
      '</div>';
  }

  function sheetConnected() { return SHEET_URL && SHEET_URL !== 'YOUR_APPS_SCRIPT_WEB_APP_URL'; }

  function buildSectionsHtml(saved, diaryDate) {
    var s = saved || {};
    var plants  = s.plants  || [{}];
    var sales   = s.sales   || [{}];
    var mats    = s.mats    || [{}];
    var remarks = s.remarks || '';
    var author  = getCurrentUser();

    var sheetBadge = sheetConnected()
      ? '<span style="background:#1a8c4e;color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;margin-left:8px">✅ 구글 시트 연동됨</span>'
      : '<span style="background:#e44;color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;margin-left:8px">⚠ 구글 시트 미연동</span>';

    var saveBtnLabel = '💾 오늘 일지 저장' + (sheetConnected() ? '' : '  (로컬)');

    return '<div id="wlFormWrap" style="margin-top:16px;border-top:2px solid #087d8f;padding-top:16px">' +

      '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #e0ecef">' +
        '<div style="font-size:15px;font-weight:700;color:#08245c">📅 일일 업무일지 (공무/현장 통합)' + sheetBadge + '</div>' +
        '<div style="display:flex;gap:8px;align-items:center;font-size:12px;color:#65737d">' +
          '<span>날짜: <strong>'+esc(diaryDate||today())+'</strong></span>' +
          '<span>작성자: <strong>'+esc(author||'—')+'</strong></span>' +
        '</div>' +
      '</div>' +

      '<div class="wl-section" style="background:#f7fbff;border:1px solid #c8dff0;border-radius:8px;padding:14px;margin-bottom:12px">' +
        sectionHead('🔘','발전소별 핵심 업무 (사업주/시공팀/영업 소통)','wlAddPlant','+ 업무 추가') +
        '<div style="display:grid;grid-template-columns:130px 110px 1fr 32px;gap:4px 6px;margin-bottom:6px;font-size:11px;color:#8aacbe;padding:0 2px"><span>발전소</span><span>업무 분류</span><span>내용</span><span></span></div>' +
        '<div id="wlPlantList">'+plants.map(function(p){ return plantRowHtml(p.plant,p.type,p.content); }).join('')+'</div>' +
      '</div>' +

      '<div class="wl-section" style="background:#f7fff8;border:1px solid #b8e6c0;border-radius:8px;padding:14px;margin-bottom:12px">' +
        sectionHead('🤝','영업자 소통','wlAddSales','+ 소통 추가') +
        '<div style="display:grid;grid-template-columns:130px 1fr 32px;gap:4px 6px;margin-bottom:6px;font-size:11px;color:#8aacbe;padding:0 2px"><span>영업자명</span><span>소통 내용</span><span></span></div>' +
        '<div id="wlSalesList">'+sales.map(function(r){ return salesRowHtml(r.name,r.content); }).join('')+'</div>' +
      '</div>' +

      '<div class="wl-section" style="background:#fffaf5;border:1px solid #f0d8b0;border-radius:8px;padding:14px;margin-bottom:12px">' +
        sectionHead('📦','현장 소모자재 관리 (재고 및 발주)','wlAddMat','+ 자재 추가') +
        '<div style="display:grid;grid-template-columns:120px 110px 1fr 32px;gap:4px 6px;margin-bottom:6px;font-size:11px;color:#8aacbe;padding:0 2px"><span>자재명</span><span>재고 상태</span><span>조치 내용</span><span></span></div>' +
        '<div id="wlMatList">'+mats.map(function(m){ return matRowHtml(m.name,m.status,m.action); }).join('')+'</div>' +
      '</div>' +

      '<div class="wl-section" style="background:#fafafa;border:1px solid #dde;border-radius:8px;padding:14px;margin-bottom:12px">' +
        '<div style="font-weight:700;font-size:13px;color:#08245c;margin-bottom:8px">📝 특이사항 및 내일 할 일</div>' +
        '<textarea id="wlRemarks" class="field" style="width:100%;box-sizing:border-box;min-height:120px;font-size:13px;line-height:1.7;resize:vertical;display:block" placeholder="- 내일 오전 10시 지자체 담당자 인허가 보완 서류 통화 필요&#10;- 줄 단위로 작성 → [➕ 내일 할일 자동 추가] 버튼으로 할일관리에 등록됩니다">'+esc(remarks)+'</textarea>' +
      '</div>' +

      '<div style="display:flex;gap:8px;flex-wrap:wrap;padding:4px 0 8px">' +
        '<button id="wlSaveAll" style="flex:1;min-width:150px;padding:11px 0;background:#08245c;color:#fff;font-weight:700;font-size:13px;border:none;border-radius:8px;cursor:pointer">'+saveBtnLabel+'</button>' +
        '<button id="wlKakao" style="flex:1;min-width:150px;padding:11px 0;background:#FEE500;color:#3C1E1E;font-weight:700;font-size:13px;border:none;border-radius:8px;cursor:pointer">💬 카톡 보고용 텍스트 복사</button>' +
        '<button id="wlAddTodoBtn" style="flex:1;min-width:150px;padding:11px 0;background:#087d8f;color:#fff;font-weight:700;font-size:13px;border:none;border-radius:8px;cursor:pointer">➕ 내일 할일 자동 추가</button>' +
      '</div>' +
      '<div id="wlMsg" style="font-size:12px;min-height:18px;padding:2px 4px"></div>' +
    '</div>';
  }

  function collectForm() {
    var plants = Array.from(document.querySelectorAll('#wlPlantList .wl-row')).map(function(r){
      var n = r.querySelector('.wl-plant-name');
      var t = r.querySelector('.wl-plant-type');
      var c = r.querySelector('.wl-plant-content');
      return { plant: n ? n.value : '', type: t ? t.value : '', content: c ? c.value.trim() : '' };
    }).filter(function(p){ return p.content; });

    var sales = Array.from(document.querySelectorAll('#wlSalesList .wl-row')).map(function(r){
      var n = r.querySelector('.wl-sales-name');
      var c = r.querySelector('.wl-sales-content');
      return { name: n ? n.value.trim() : '', content: c ? c.value.trim() : '' };
    }).filter(function(s){ return s.name || s.content; });

    var mats = Array.from(document.querySelectorAll('#wlMatList .wl-row')).map(function(r){
      var n = r.querySelector('.wl-mat-name');
      var s = r.querySelector('.wl-mat-status');
      var a = r.querySelector('.wl-mat-action');
      return { name: n ? n.value.trim() : '', status: s ? s.value : '재고 여유', action: a ? a.value.trim() : '' };
    }).filter(function(m){ return m.name; });

    var rEl = document.getElementById('wlRemarks');
    var remarks = rEl ? rEl.value.trim() : '';
    return { plants: plants, sales: sales, mats: mats, remarks: remarks };
  }

  /* ── 카톡 텍스트 ── */
  function buildKakao(diaryDate) {
    var st = getState(); if (!st) return '';
    var date = diaryDate || today();
    var person = getCurrentUser();
    var todos = (st.todos||[]).filter(function(t){ return t.due===date || t.start===date; });
    var form = collectForm();
    var sep = '────────────────────────────────';

    var text = '[현장 업무일지] ' + date + (person ? ' / '+person : '') + '\n' + sep + '\n\n';

    if (form.plants.length) {
      text += '🔘 발전소별 핵심 업무\n';
      form.plants.forEach(function(p){ text += '  · ' + p.plant + ' | ' + p.type + ' | ' + p.content + '\n'; });
      text += '\n';
    }

    var done  = todos.filter(function(t){ return t.status==='완료'; });
    var doing = todos.filter(function(t){ return t.status==='진행중'; });
    if (done.length || doing.length) {
      text += '☑ 할일 현황\n';
      done.forEach(function(t){ text += '  ✅ ' + t.title + '\n'; });
      doing.forEach(function(t){ text += '  🔄 ' + t.title + '\n'; });
      text += '\n';
    }

    if (form.sales.length) {
      text += '🤝 영업자 소통\n';
      form.sales.forEach(function(s){ text += '  · ' + s.name + ' — ' + s.content + '\n'; });
      text += '\n';
    }

    if (form.mats.length) {
      text += '📦 현장 소모자재\n';
      form.mats.forEach(function(m){ text += '  · ' + m.name + ' [' + m.status + '] ' + m.action + '\n'; });
      text += '\n';
    }

    if (form.remarks) {
      text += '📝 특이사항 및 내일 할 일\n';
      form.remarks.split('\n').forEach(function(l){ if (l.trim()) text += '  ' + l + '\n'; });
    }
    return text;
  }

  /* ── 구글 시트 저장 ── */
  function saveToSheet(diaryDate, onSuccess, onError) {
    var st = getState();
    var date = diaryDate || today();
    var person = getCurrentUser();
    var todos = (st && st.todos ? st.todos : []).filter(function(t){ return t.due===date || t.start===date; });
    var form = collectForm();

    var payload = {
      date: date,
      person: person,
      plants: form.plants,
      sales: form.sales,
      materials: form.mats,
      remarks: form.remarks,
      todos: todos.map(function(t){ return { title:t.title, status:t.status, priority:t.priority||'보통', owner:t.owner||'' }; })
    };

    fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(res){ return res.json(); })
      .then(function(json){
        if (!json.ok) throw new Error(json.error||'저장 실패');
        onSuccess(json);
      })
      .catch(function(err){ onError(err); });
  }

  /* ── 이벤트 바인딩 ── */
  function bindSectionEvents(diaryDate) {
    var wrap = document.getElementById('wlFormWrap');
    if (!wrap) return;

    wrap.addEventListener('input',  saveForm);
    wrap.addEventListener('change', saveForm);

    wrap.addEventListener('click', function(e) {
      if (e.target.classList.contains('wl-del-row')) {
        var row = e.target.closest('.wl-row');
        if (row) row.remove();
        saveForm();
      }
    });

    var addPlant = document.getElementById('wlAddPlant');
    if (addPlant) addPlant.addEventListener('click', function(){
      document.getElementById('wlPlantList').insertAdjacentHTML('beforeend', plantRowHtml());
    });

    var addSales = document.getElementById('wlAddSales');
    if (addSales) addSales.addEventListener('click', function(){
      document.getElementById('wlSalesList').insertAdjacentHTML('beforeend', salesRowHtml());
    });

    var addMat = document.getElementById('wlAddMat');
    if (addMat) addMat.addEventListener('click', function(){
      document.getElementById('wlMatList').insertAdjacentHTML('beforeend', matRowHtml());
    });

    /* 💾 저장 */
    var saveBtn = document.getElementById('wlSaveAll');
    if (saveBtn) saveBtn.addEventListener('click', function() {
      saveForm();
      var st = getState();
      if (st) {
        if (!st._fieldDiary) st._fieldDiary = {};
        st._fieldDiary[diaryDate||today()] = collectForm();
        saveAppState(st);
      }

      if (sheetConnected()) {
        setMsg('구글 시트에 저장 중...', '#087d8f');
        saveToSheet(diaryDate,
          function(){ setMsg('✅ 구글 시트 + 로컬에 저장됐습니다!', '#1a8c4e'); setTimeout(function(){ setMsg(''); }, 4000); },
          function(err){ setMsg('⚠ 로컬 저장 완료 (시트 저장 실패: ' + err.message + ')', '#b86d13'); setTimeout(function(){ setMsg(''); }, 4000); }
        );
      } else {
        setMsg('✅ 로컬에 저장됐습니다 (구글 시트 미연동)', '#2a7');
        setTimeout(function(){ setMsg(''); }, 4000);
      }
    });

    /* 💬 카톡 복사 */
    var kakaoBtn = document.getElementById('wlKakao');
    if (kakaoBtn) kakaoBtn.addEventListener('click', function() {
      navigator.clipboard.writeText(buildKakao(diaryDate))
        .then(function(){ setMsg('✅ 카톡용 텍스트가 복사됐어요!', '#2a7'); setTimeout(function(){ setMsg(''); }, 3000); })
        .catch(function(){ setMsg('복사 실패 — 클립보드 권한 확인', '#e44'); });
    });

    /* ➕ 내일 할일 추가 */
    var addTodoBtn = document.getElementById('wlAddTodoBtn');
    if (addTodoBtn) addTodoBtn.addEventListener('click', function() {
      var rEl = document.getElementById('wlRemarks');
      var remarks = rEl ? rEl.value.trim() : '';
      if (!remarks) { setMsg('특이사항/내일 할 일란에 내용을 입력해주세요.', '#e44'); return; }
      var lines = remarks.split('\n')
        .map(function(l){ return l.replace(/^[-·*\d.\s▶→]+/,'').trim(); })
        .filter(function(l){ return l.length > 2; });
      if (!lines.length) { setMsg('추가할 항목을 찾지 못했어요.', '#e44'); return; }
      var st = getState(); if (!st) return;
      var tmr = new Date(); tmr.setDate(tmr.getDate()+1);
      var tomorrowStr = tmr.toISOString().slice(0,10);
      var author = getCurrentUser();
      lines.forEach(function(line){
        st.todos.push({
          id: 'todo_wl_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
          title: line, owner: author, status: '할 일',
          priority: '보통', due: tomorrowStr, detail: ''
        });
      });
      saveAppState(st);
      if (typeof render === 'function') setTimeout(render, 100);
      setMsg('✅ ' + lines.length + '개 항목을 내일('+tomorrowStr+') 할일에 추가했어요!', '#2a7');
      setTimeout(function(){ setMsg(''); }, 4000);
    });
  }

  function setMsg(msg, color) {
    var el = document.getElementById('wlMsg');
    if (el) { el.textContent = msg; el.style.color = color||'#2a7'; }
  }

  /* ── 다이어리 패널에 섹션 주입 ── */
  function injectIntoPanel() {
    var syncBtn = document.getElementById('diarySyncBtn');
    if (!syncBtn) return;
    if (document.getElementById('wlFormWrap')) return;

    var dateLabel = document.querySelector('strong[style*="min-width:110px"]') ||
                    document.querySelector('.diary-date-label');
    var diaryDate = dateLabel ? dateLabel.textContent.trim() : today();

    var st = getState();
    var savedForDate = (st && st._fieldDiary && st._fieldDiary[diaryDate]) || null;
    var saved = savedForDate || loadSavedForm();

    var wrapDiv = document.createElement('div');
    wrapDiv.innerHTML = buildSectionsHtml(saved, diaryDate);
    var sectionsEl = wrapDiv.firstElementChild;

    var sheetViewerBtn = document.getElementById('sheetViewerBtn');
    var sheetViewerWrap = sheetViewerBtn ? sheetViewerBtn.closest('div[style*="margin-top:20px"]') : null;
    if (sheetViewerWrap && sheetViewerWrap.parentElement) {
      sheetViewerWrap.parentElement.insertBefore(sectionsEl, sheetViewerWrap.nextSibling);
    } else {
      var panel = document.getElementById('todoBoardPanel');
      if (panel) panel.appendChild(sectionsEl);
    }

    bindSectionEvents(diaryDate);
  }

  /* ── MutationObserver ── */
  var debounceTimer = null;
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
