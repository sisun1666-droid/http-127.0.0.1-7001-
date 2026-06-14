(function () {
  /* ═══════════════════════════════════════════════════
     현장 업무일지 — 할일관리 > 업무일지 탭에 섹션 주입
     • 발전소별 핵심 업무
     • 프리랜서 영업자 소통
     • 현장 소모자재
     • 특이사항 및 내일 할 일
  ═══════════════════════════════════════════════════ */

  const SESSION_KEY = 'worklog-form-v1';

  /* ── 유틸 ── */
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

  function toast(msg) {
    const el = document.getElementById('toast');
    if (el) { el.textContent = msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'), 3000); }
  }

  /* ── 세션 저장/복원 (탭 재렌더링 시 입력 유지) ── */
  function saveForm() {
    try {
      const form = collectForm();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(form));
    } catch(e) {}
  }

  function loadSavedForm() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null'); } catch(e){ return null; }
  }

  /* ── 행 생성 ── */
  function plantRowHtml(plant, type, content) {
    const plants = ['대구 태양광','왜관 현장','경주 발전소','기타'];
    const types  = ['사업주 소통','시공팀 조율','현장 점검','영업','행정'];
    return `<div class="wl-row" style="display:grid;grid-template-columns:130px 110px 1fr 32px;gap:4px 6px;margin-bottom:5px;align-items:center">
      <select class="field wl-plant-name" style="font-size:12px;padding:4px 6px">
        ${plants.map(v=>`<option${v===(plant||'대구 태양광')?' selected':''}>${esc(v)}</option>`).join('')}
      </select>
      <select class="field wl-plant-type" style="font-size:12px;padding:4px 6px">
        ${types.map(v=>`<option${v===(type||'사업주 소통')?' selected':''}>${esc(v)}</option>`).join('')}
      </select>
      <input class="field wl-plant-content" style="font-size:12px;padding:4px 6px" placeholder="내용 입력" value="${esc(content||'')}">
      <button class="btn icon wl-del-row" style="font-size:14px;padding:2px 7px;color:#e44;background:none;border:1px solid #e44">×</button>
    </div>`;
  }

  function salesRowHtml(name, content) {
    return `<div class="wl-row" style="display:grid;grid-template-columns:130px 1fr 32px;gap:4px 6px;margin-bottom:5px;align-items:center">
      <input class="field wl-sales-name" style="font-size:12px;padding:4px 6px" placeholder="영업자명" value="${esc(name||'')}">
      <input class="field wl-sales-content" style="font-size:12px;padding:4px 6px" placeholder="소통 내용" value="${esc(content||'')}">
      <button class="btn icon wl-del-row" style="font-size:14px;padding:2px 7px;color:#e44;background:none;border:1px solid #e44">×</button>
    </div>`;
  }

  function matRowHtml(name, status, action) {
    const statuses = ['재고 여유','재고 부족','확인 필요'];
    const icons    = {'재고 여유':'🟢','재고 부족':'🔴','확인 필요':'🟡'};
    return `<div class="wl-row" style="display:grid;grid-template-columns:120px 110px 1fr 32px;gap:4px 6px;margin-bottom:5px;align-items:center">
      <input class="field wl-mat-name" style="font-size:12px;padding:4px 6px" placeholder="자재명" value="${esc(name||'')}">
      <select class="field wl-mat-status" style="font-size:12px;padding:4px 6px">
        ${statuses.map(v=>`<option${v===(status||'재고 여유')?' selected':''}>${icons[v]} ${esc(v)}</option>`).join('')}
      </select>
      <input class="field wl-mat-action" style="font-size:12px;padding:4px 6px" placeholder="조치 내용" value="${esc(action||'')}">
      <button class="btn icon wl-del-row" style="font-size:14px;padding:2px 7px;color:#e44;background:none;border:1px solid #e44">×</button>
    </div>`;
  }

  /* ── 섹션 헤더 HTML ── */
  function sectionHead(icon, title, addId, addLabel) {
    return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <div style="font-weight:700;font-size:13px;color:#08245c">${icon} ${title}</div>
      <button class="btn" id="${addId}" style="font-size:12px;padding:4px 10px">${addLabel}</button>
    </div>`;
  }

  /* ── 메인 섹션 HTML 생성 ── */
  function buildSectionsHtml(saved) {
    const s = saved || {};
    const plants   = s.plants   || [{}];
    const sales    = s.sales    || [{}];
    const mats     = s.mats     || [{}];
    const remarks  = s.remarks  || '';

    return `<div id="wlFormWrap" style="margin-top:16px;border-top:2px solid #087d8f;padding-top:16px">

      <!-- ① 발전소별 핵심 업무 -->
      <div class="wl-section" style="background:#f7fbff;border:1px solid #c8dff0;border-radius:8px;padding:14px;margin-bottom:12px">
        ${sectionHead('🔘','발전소별 핵심 업무 (사업주/시공팀/영업 소통)','wlAddPlant','+ 업무 추가')}
        <div style="display:grid;grid-template-columns:130px 110px 1fr 32px;gap:4px 6px;margin-bottom:6px;font-size:11px;color:#8aacbe;padding:0 2px">
          <span>발전소</span><span>업무 분류</span><span>내용</span><span></span>
        </div>
        <div id="wlPlantList">
          ${plants.map(p=>plantRowHtml(p.plant,p.type,p.content)).join('')}
        </div>
      </div>

      <!-- ② 프리랜서 영업자 소통 -->
      <div class="wl-section" style="background:#f7fff8;border:1px solid #b8e6c0;border-radius:8px;padding:14px;margin-bottom:12px">
        ${sectionHead('🤝','프리랜서 영업자 소통','wlAddSales','+ 영업 소통 추가')}
        <div style="display:grid;grid-template-columns:130px 1fr 32px;gap:4px 6px;margin-bottom:6px;font-size:11px;color:#8aacbe;padding:0 2px">
          <span>영업자명</span><span>소통 내용</span><span></span>
        </div>
        <div id="wlSalesList">
          ${sales.map(r=>salesRowHtml(r.name,r.content)).join('')}
        </div>
      </div>

      <!-- ③ 현장 소모자재 -->
      <div class="wl-section" style="background:#fffaf5;border:1px solid #f0d8b0;border-radius:8px;padding:14px;margin-bottom:12px">
        ${sectionHead('📦','현장 소모자재 관리 (재고 및 발주)','wlAddMat','+ 자재 항목 추가')}
        <div style="display:grid;grid-template-columns:120px 110px 1fr 32px;gap:4px 6px;margin-bottom:6px;font-size:11px;color:#8aacbe;padding:0 2px">
          <span>자재명</span><span>재고 상태</span><span>조치 내용</span><span></span>
        </div>
        <div id="wlMatList">
          ${mats.map(m=>matRowHtml(m.name,m.status,m.action)).join('')}
        </div>
      </div>

      <!-- ④ 특이사항 및 내일 할 일 -->
      <div class="wl-section" style="background:#fafafa;border:1px solid #dde;border-radius:8px;padding:14px;margin-bottom:12px">
        <div style="font-weight:700;font-size:13px;color:#08245c;margin-bottom:8px">📝 특이사항 및 내일 할 일</div>
        <textarea id="wlRemarks" class="field" style="min-height:80px;font-size:13px;line-height:1.6" placeholder="- 내일 오전 10시 지자체 담당자 인허가 보완 서류 통화 필요&#10;- 한 줄씩 작성하면 [내일 할일 추가] 버튼으로 할일관리에 자동 등록됩니다">${esc(remarks)}</textarea>
      </div>

      <!-- ⑤ 하단 버튼 -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;padding:4px 0 8px">
        <button id="wlSaveAll" style="flex:1;min-width:140px;padding:10px 0;background:#08245c;color:#fff;font-weight:700;font-size:13px;border:none;border-radius:8px;cursor:pointer">💾 오늘 일지 저장</button>
        <button id="wlKakao" style="flex:1;min-width:140px;padding:10px 0;background:#FEE500;color:#3C1E1E;font-weight:700;font-size:13px;border:none;border-radius:8px;cursor:pointer">💬 카톡 보고용 텍스트 복사</button>
        <button id="wlAddTodoBtn" style="flex:1;min-width:140px;padding:10px 0;background:#087d8f;color:#fff;font-weight:700;font-size:13px;border:none;border-radius:8px;cursor:pointer">➕ 내일 할일 자동 추가</button>
      </div>
      <div id="wlMsg" style="font-size:12px;color:#2a7;min-height:16px;padding:2px 4px"></div>
    </div>`;
  }

  /* ── 폼 데이터 수집 ── */
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
      status: r.querySelector('.wl-mat-status')?.value||'재고 여유',
      action: r.querySelector('.wl-mat-action')?.value.trim()||''
    })).filter(m=>m.name);

    const remarks = document.getElementById('wlRemarks')?.value.trim()||'';
    return { plants, sales, mats, remarks };
  }

  /* ── 카톡 텍스트 생성 ── */
  function buildKakao(diaryDate) {
    const st = getState(); if (!st) return '';
    const date = diaryDate || today();
    const person = getCurrentUser();

    // 할일관리 오늘 할일
    const todos = (st.todos||[]).filter(t=>(t.due===date||t.start===date));
    const form = collectForm();

    let text = `[현장 업무일지] ${date}${person?' / '+person:''}\n`;
    text += '─'.repeat(34) + '\n\n';

    // 발전소별
    if (form.plants.length) {
      text += '🔘 발전소별 핵심 업무\n';
      form.plants.forEach(p=>{ text += `  · ${p.plant} | ${p.type} | ${p.content}\n`; });
      text += '\n';
    }

    // 할일관리 연계 (완료/진행중)
    const done = todos.filter(t=>t.status==='완료');
    const doing = todos.filter(t=>t.status==='진행중');
    if (done.length||doing.length) {
      text += '☑ 할일관리 연계\n';
      done.forEach(t=>{ text += `  · [완료] ${t.title}\n`; });
      doing.forEach(t=>{ text += `  · [진행] ${t.title}\n`; });
      text += '\n';
    }

    // 영업자 소통
    if (form.sales.length) {
      text += '🤝 프리랜서 영업자 소통\n';
      form.sales.forEach(s=>{ text += `  · ${s.name} — ${s.content}\n`; });
      text += '\n';
    }

    // 소모자재
    if (form.mats.length) {
      text += '📦 현장 소모자재\n';
      form.mats.forEach(m=>{ text += `  · ${m.name} [${m.status}] ${m.action}\n`; });
      text += '\n';
    }

    // 특이사항
    if (form.remarks) {
      text += '📝 특이사항 및 내일 할 일\n';
      form.remarks.split('\n').forEach(l=>{ if(l.trim()) text += `  ${l}\n`; });
    }

    return text;
  }

  /* ── 이벤트 바인딩 ── */
  function bindSectionEvents(diaryDate) {
    const wrap = document.getElementById('wlFormWrap');
    if (!wrap) return;

    // 입력 변화 시 세션 저장
    wrap.addEventListener('input', saveForm);
    wrap.addEventListener('change', saveForm);

    // 행 삭제
    wrap.addEventListener('click', function(e) {
      if (e.target.classList.contains('wl-del-row')) {
        e.target.closest('.wl-row').remove();
        saveForm();
      }
    });

    // 행 추가
    document.getElementById('wlAddPlant')?.addEventListener('click', function() {
      document.getElementById('wlPlantList').insertAdjacentHTML('beforeend', plantRowHtml());
    });
    document.getElementById('wlAddSales')?.addEventListener('click', function() {
      document.getElementById('wlSalesList').insertAdjacentHTML('beforeend', salesRowHtml());
    });
    document.getElementById('wlAddMat')?.addEventListener('click', function() {
      document.getElementById('wlMatList').insertAdjacentHTML('beforeend', matRowHtml());
    });

    // 저장
    document.getElementById('wlSaveAll')?.addEventListener('click', function() {
      saveForm();
      const st = getState();
      if (st) {
        if (!st._fieldDiary) st._fieldDiary = {};
        st._fieldDiary[diaryDate || today()] = collectForm();
        saveAppState(st);
      }
      setMsg('✔ 현장 일지가 저장됐습니다!', '#2a7');
      setTimeout(()=>setMsg(''), 3000);
    });

    // 카톡 복사
    document.getElementById('wlKakao')?.addEventListener('click', function() {
      const text = buildKakao(diaryDate);
      navigator.clipboard.writeText(text)
        .then(()=>{ setMsg('✔ 카톡용 텍스트가 복사됐어요!', '#2a7'); setTimeout(()=>setMsg(''), 3000); })
        .catch(()=>setMsg('복사 실패 — 클립보드 권한 확인', '#e44'));
    });

    // 내일 할일 추가
    document.getElementById('wlAddTodoBtn')?.addEventListener('click', function() {
      const remarks = document.getElementById('wlRemarks')?.value.trim()||'';
      if (!remarks) { setMsg('특이사항/내일 할 일란에 내용을 입력해주세요.', '#e44'); return; }
      const lines = remarks.split('\n')
        .map(l=>l.replace(/^[\-·\*\d\.\s▶→]+/,'').trim())
        .filter(l=>l.length > 2);
      if (!lines.length) { setMsg('추가할 항목을 찾지 못했어요.', '#e44'); return; }
      const st = getState(); if (!st) return;
      const tmr = new Date(); tmr.setDate(tmr.getDate()+1);
      const tomorrowStr = tmr.toISOString().slice(0,10);
      const author = getCurrentUser();
      lines.forEach(function(line) {
        st.todos.push({
          id: 'todo_wl_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
          title: line, owner: author, status: '할 일',
          priority: '보통', due: tomorrowStr, detail: ''
        });
      });
      saveAppState(st);
      if (typeof render === 'function') setTimeout(render, 100);
      setMsg(`✔ ${lines.length}개 항목을 내일(${tomorrowStr}) 할일에 추가했어요!`, '#2a7');
      setTimeout(()=>setMsg(''), 4000);
    });
  }

  function setMsg(msg, color) {
    const el = document.getElementById('wlMsg');
    if (el) { el.textContent = msg; el.style.color = color||'#2a7'; }
  }

  /* ── 다이어리 패널에 섹션 주입 ── */
  let lastInjectedAt = '';

  function injectIntoPanel() {
    // 구버전 다이어리 패널 감지: diarySyncBtn 또는 diaryExportBtn 존재
    const syncBtn = document.getElementById('diarySyncBtn');
    if (!syncBtn) return;

    // 이미 주입됐으면 스킵
    if (document.getElementById('wlFormWrap')) return;

    // 다이어리 날짜 파악
    const dateLabel = document.querySelector('.diary-date-label, strong[style*="min-width:110px"]');
    const diaryDate = dateLabel ? dateLabel.textContent.trim() : today();

    // 저장된 폼 데이터 (날짜별 저장 우선, 없으면 세션 데이터)
    const st = getState();
    const savedForDate = st?._fieldDiary?.[diaryDate] || null;
    const saved = savedForDate || loadSavedForm();

    // 패널에서 삽입할 위치: 구글 시트 바로가기 버튼 영역 바로 뒤
    const sheetViewerWrap = document.getElementById('sheetViewerBtn')?.closest('div[style*="margin-top:20px"]');
    const insertTarget = sheetViewerWrap || syncBtn.closest('.todo-toolbar')?.nextElementSibling;

    const wrapDiv = document.createElement('div');
    wrapDiv.innerHTML = buildSectionsHtml(saved);
    const sectionsEl = wrapDiv.firstElementChild;

    if (sheetViewerWrap && sheetViewerWrap.parentElement) {
      sheetViewerWrap.parentElement.insertBefore(sectionsEl, sheetViewerWrap.nextSibling);
    } else {
      // fallback: body 맨 뒤 패널에 append
      const panel = document.getElementById('todoBoardPanel');
      if (panel) panel.appendChild(sectionsEl);
    }

    bindSectionEvents(diaryDate);
    lastInjectedAt = diaryDate;
  }

  /* ── 업무일지 탭 toolbar에 카톡복사 + 내일할일 버튼 추가 (board/list 모드용) ── */
  function injectToolbarButtons() {
    const toolbars = document.querySelectorAll('.todo-toolbar');
    toolbars.forEach(function(toolbar) {
      if (toolbar.querySelector('[data-wl-tb-btn]')) return;
      if (!toolbar.querySelector('[data-todo-view="diary"]') && !toolbar.querySelector('#diarySyncBtn')) return;
      // diary 모드(panel 주입)에서는 패널 내 버튼으로 충분하므로 toolbar 버튼은 생략
    });
  }

  /* ── MutationObserver로 다이어리 패널 변화 감지 ── */
  let observerTimer = null;
  function watch() {
    injectIntoPanel();
    const observer = new MutationObserver(function() {
      clearTimeout(observerTimer);
      observerTimer = setTimeout(function() {
        injectIntoPanel();
        injectToolbarButtons();
      }, 80);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watch);
  } else {
    watch();
  }
})();
