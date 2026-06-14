(function () {
  const SHEET_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';

  /* ── 오늘 할일 불러오기 (할일관리 연계) ── */
  function getTodayTodos() {
    try {
      const saved = localStorage.getItem('solar-admin-state-v1');
      if (!saved) return [];
      const st = JSON.parse(saved);
      const today = new Date().toISOString().slice(0, 10);
      return (st.todos || []).filter(function(t) {
        return (t.due === today || t.start === today) &&
               (t.status === '진행중' || t.status === '할 일');
      });
    } catch(e) { return []; }
  }

  /* ── 담당자 가져오기 ── */
  function getCurrentUser() {
    try {
      const sess = sessionStorage.getItem('solar-staff-session-v1');
      if (sess) { const u = JSON.parse(sess); return u.name || ''; }
    } catch(e) {}
    if (typeof currentUser !== 'undefined' && currentUser) return currentUser;
    return '';
  }

  /* ── 행 생성 함수 ── */
  function plantRow(plant, type, content) {
    plant = plant || ''; type = type || ''; content = content || '';
    const d = document.createElement('div');
    d.style.cssText = 'display:grid;grid-template-columns:140px 120px 1fr 36px;gap:4px 8px;margin-bottom:6px;align-items:center';
    d.innerHTML =
      '<select class="field wl-plant-name" style="font-size:13px">' +
      ['대구 태양광','왜관 현장','경주 발전소','기타'].map(function(v){ return '<option'+(v===plant?' selected':'')+'>'+v+'</option>'; }).join('') +
      '</select>' +
      '<select class="field wl-plant-type" style="font-size:13px">' +
      ['사업주 소통','시공팀 조율','현장 점검','영업','행정'].map(function(v){ return '<option'+(v===type?' selected':'')+'>'+v+'</option>'; }).join('') +
      '</select>' +
      '<input class="field wl-plant-content" style="font-size:13px" placeholder="내용" value="'+content.replace(/"/g,'&quot;')+'">' +
      '<button class="btn icon wl-del" style="font-size:16px;padding:4px 8px">×</button>';
    return d;
  }

  function salesRow(name, content) {
    name = name || ''; content = content || '';
    const d = document.createElement('div');
    d.style.cssText = 'display:grid;grid-template-columns:160px 1fr 36px;gap:4px 8px;margin-bottom:6px;align-items:center';
    d.innerHTML =
      '<input class="field wl-sales-name" style="font-size:13px" placeholder="영업자명" value="'+name.replace(/"/g,'&quot;')+'">' +
      '<input class="field wl-sales-content" style="font-size:13px" placeholder="소통 내용" value="'+content.replace(/"/g,'&quot;')+'">' +
      '<button class="btn icon wl-del" style="font-size:16px;padding:4px 8px">×</button>';
    return d;
  }

  function matRow(name, status, action) {
    name = name || ''; status = status || '재고 여유'; action = action || '';
    const d = document.createElement('div');
    d.style.cssText = 'display:grid;grid-template-columns:150px 110px 1fr 36px;gap:4px 8px;margin-bottom:6px;align-items:center';
    d.innerHTML =
      '<input class="field wl-mat-name" style="font-size:13px" placeholder="자재명" value="'+name.replace(/"/g,'&quot;')+'">' +
      '<select class="field wl-mat-status" style="font-size:13px">' +
      ['재고 여유','재고 부족','확인 필요'].map(function(v){ return '<option'+(v===status?' selected':'')+'>'+v+'</option>'; }).join('') +
      '</select>' +
      '<input class="field wl-mat-action" style="font-size:13px" placeholder="조치내용" value="'+action.replace(/"/g,'&quot;')+'">' +
      '<button class="btn icon wl-del" style="font-size:16px;padding:4px 8px">×</button>';
    return d;
  }

  /* ── 모달 HTML 동적 생성 ── */
  function injectModal() {
    if (document.getElementById('worklogModal')) return;
    const div = document.createElement('div');
    div.innerHTML = '<div class="overlay" id="worklogModal">' +
      '<div class="modal" style="max-width:720px;width:95vw;max-height:90vh;overflow-y:auto">' +
        '<div class="modal-head">' +
          '<h2>현장 업무일지</h2>' +
          '<button class="btn icon" id="wlCloseBtn">×</button>' +
        '</div>' +
        '<div style="background:#e8f5e9;border-left:3px solid #2e7d32;padding:8px 12px;border-radius:0 6px 6px 0;font-size:12px;color:#1b5e20;margin-bottom:12px;">' +
          '💡 오늘 <strong>진행중/할 일</strong> 항목이 발전소 업무에 자동으로 불러와졌어요. 수정 후 저장하세요.' +
        '</div>' +
        '<div class="form-grid">' +
          '<div class="form-row"><label>날짜</label><input class="field" type="date" id="wlDate"></div>' +
          '<div class="form-row"><label>작성자</label><input class="field" id="wlAuthor" placeholder="이름"></div>' +
        '</div>' +
        '<div style="margin-top:14px">' +
          '<div class="panel-title"><h2 style="font-size:14px">■ 발전소별 핵심 업무</h2><button class="btn" id="wlAddPlant">+ 추가</button></div>' +
          '<div style="display:grid;grid-template-columns:140px 120px 1fr 36px;gap:4px 8px;margin-bottom:4px;font-size:12px;color:#888"><span>발전소</span><span>업무분류</span><span>내용</span><span></span></div>' +
          '<div id="wlPlantList"></div>' +
        '</div>' +
        '<div style="margin-top:14px">' +
          '<div class="panel-title"><h2 style="font-size:14px">■ 프리랜서 영업자 소통</h2><button class="btn" id="wlAddSales">+ 추가</button></div>' +
          '<div style="display:grid;grid-template-columns:160px 1fr 36px;gap:4px 8px;margin-bottom:4px;font-size:12px;color:#888"><span>영업자명</span><span>소통 내용</span><span></span></div>' +
          '<div id="wlSalesList"></div>' +
        '</div>' +
        '<div style="margin-top:14px">' +
          '<div class="panel-title"><h2 style="font-size:14px">■ 현장 소모자재</h2><button class="btn" id="wlAddMat">+ 추가</button></div>' +
          '<div style="display:grid;grid-template-columns:150px 110px 1fr 36px;gap:4px 8px;margin-bottom:4px;font-size:12px;color:#888"><span>자재명</span><span>재고상태</span><span>조치내용</span><span></span></div>' +
          '<div id="wlMatList"></div>' +
        '</div>' +
        '<div style="margin-top:14px">' +
          '<label style="font-size:13px;font-weight:500">■ 특이사항 및 내일 할 일</label>' +
          '<textarea class="field" id="wlRemarks" style="margin-top:6px;min-height:70px" placeholder="내일 할 일, 특이사항 등 (줄 바꿈으로 여러 항목 입력 시 할일관리에 자동 추가 가능)"></textarea>' +
        '</div>' +
        '<div class="toolbar" style="margin-top:16px;flex-wrap:wrap;gap:8px">' +
          '<button class="btn primary" id="wlSaveSheet">구글 시트에 저장</button>' +
          '<button class="btn" id="wlCopyKakao">카톡 복사</button>' +
          '<button class="btn" id="wlAddTodos" style="background:#087d8f;color:#fff">내일 할일 → 할일관리 추가</button>' +
        '</div>' +
        '<div id="wlStatus" style="font-size:12px;color:#888;margin-top:8px;min-height:18px"></div>' +
      '</div>' +
    '</div>';
    document.body.appendChild(div.firstElementChild);
    bindModalEvents();
  }

  /* ── 모달 열기 ── */
  function openModal() {
    injectModal();
    const modal = document.getElementById('worklogModal');
    document.getElementById('wlDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('wlAuthor').value = getCurrentUser();

    // 발전소별 업무: 오늘 할일에서 자동 로드
    const pl = document.getElementById('wlPlantList');
    pl.innerHTML = '';
    const todayTodos = getTodayTodos();
    if (todayTodos.length > 0) {
      todayTodos.forEach(function(t) {
        const typeMap = {
          '현장 점검': '현장 점검',
          '영업': '영업',
          '행정': '행정',
          '시공': '시공팀 조율'
        };
        let mapped = '행정';
        for (const key in typeMap) {
          if ((t.title + (t.detail || '') + (t.type || '')).includes(key)) { mapped = typeMap[key]; break; }
        }
        pl.appendChild(plantRow('기타', mapped, t.title + (t.detail ? ' — ' + t.detail : '')));
      });
    } else {
      pl.appendChild(plantRow());
    }

    document.getElementById('wlSalesList').innerHTML = '';
    document.getElementById('wlSalesList').appendChild(salesRow());
    document.getElementById('wlMatList').innerHTML = '';
    document.getElementById('wlMatList').appendChild(matRow());
    document.getElementById('wlRemarks').value = '';
    document.getElementById('wlStatus').textContent = '';
    modal.classList.add('open');
  }

  /* ── 이벤트 바인딩 ── */
  function bindModalEvents() {
    document.getElementById('wlCloseBtn').addEventListener('click', function() {
      document.getElementById('worklogModal').classList.remove('open');
    });
    document.getElementById('worklogModal').addEventListener('click', function(e) {
      if (e.target === document.getElementById('worklogModal'))
        document.getElementById('worklogModal').classList.remove('open');
      if (e.target.classList.contains('wl-del'))
        e.target.parentElement.remove();
    });
    document.getElementById('wlAddPlant').addEventListener('click', function() {
      document.getElementById('wlPlantList').appendChild(plantRow());
    });
    document.getElementById('wlAddSales').addEventListener('click', function() {
      document.getElementById('wlSalesList').appendChild(salesRow());
    });
    document.getElementById('wlAddMat').addEventListener('click', function() {
      document.getElementById('wlMatList').appendChild(matRow());
    });
    document.getElementById('wlSaveSheet').addEventListener('click', function() {
      const data = collectData();
      if (!data.date || !data.author) { setStatus('날짜와 작성자를 입력해주세요.', false); return; }
      if (SHEET_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL') { setStatus('구글 시트 URL을 worklog.js에 설정해주세요.', false); return; }
      setStatus('저장 중...');
      fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function() { setStatus('✔ 구글 시트에 저장되었습니다!'); })
        .catch(function(err) { setStatus('저장 실패: ' + err.message, false); });
    });
    document.getElementById('wlCopyKakao').addEventListener('click', function() {
      navigator.clipboard.writeText(buildKakaoText(collectData()))
        .then(function() { setStatus('✔ 카톡 텍스트가 복사되었습니다!'); })
        .catch(function() { setStatus('복사 실패', false); });
    });
    document.getElementById('wlAddTodos').addEventListener('click', function() {
      const remarks = document.getElementById('wlRemarks').value.trim();
      if (!remarks) { setStatus('내일 할 일 항목을 먼저 입력해주세요.', false); return; }
      const lines = remarks.split('\n').map(function(l){ return l.replace(/^[·\-\*\d\.\s]+/, '').trim(); }).filter(Boolean);
      if (!lines.length) { setStatus('항목을 찾을 수 없어요.', false); return; }
      try {
        const saved = localStorage.getItem('solar-admin-state-v1');
        if (!saved) { setStatus('할일관리 데이터를 찾을 수 없어요.', false); return; }
        const st = JSON.parse(saved);
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);
        const author = document.getElementById('wlAuthor').value || '';
        lines.forEach(function(line) {
          st.todos.push({
            id: 'todo_wl_' + Date.now() + '_' + Math.random().toString(36).slice(2),
            title: line,
            owner: author,
            status: '할 일',
            priority: '보통',
            due: tomorrowStr,
            detail: '[업무일지에서 자동 생성]'
          });
        });
        localStorage.setItem('solar-admin-state-v1', JSON.stringify(st));
        setStatus('✔ ' + lines.length + '개 항목이 할일관리에 추가되었습니다!');
        // 할일관리 뷰 갱신 (앱이 열려있으면)
        if (typeof render === 'function') setTimeout(render, 100);
      } catch(err) {
        setStatus('추가 실패: ' + err.message, false);
      }
    });
  }

  function collectData() {
    return {
      date: document.getElementById('wlDate').value,
      author: document.getElementById('wlAuthor').value,
      plants: Array.from(document.querySelectorAll('#wlPlantList > div')).map(function(r) {
        return { plant: r.querySelector('.wl-plant-name').value, type: r.querySelector('.wl-plant-type').value, content: r.querySelector('.wl-plant-content').value.trim() };
      }).filter(function(p){ return p.content; }),
      sales: Array.from(document.querySelectorAll('#wlSalesList > div')).map(function(r) {
        return { name: r.querySelector('.wl-sales-name').value.trim(), content: r.querySelector('.wl-sales-content').value.trim() };
      }).filter(function(s){ return s.name || s.content; }),
      materials: Array.from(document.querySelectorAll('#wlMatList > div')).map(function(r) {
        return { name: r.querySelector('.wl-mat-name').value.trim(), status: r.querySelector('.wl-mat-status').value, action: r.querySelector('.wl-mat-action').value.trim() };
      }).filter(function(m){ return m.name; }),
      remarks: document.getElementById('wlRemarks').value.trim()
    };
  }

  function buildKakaoText(d) {
    let t = '[현장 업무일지] ' + d.date + ' / ' + d.author + '\n\n';
    if (d.plants.length) { t += '■ 발전소별 핵심 업무\n'; d.plants.forEach(function(p){ t += '· ' + p.plant + ' | ' + p.type + ' | ' + p.content + '\n'; }); }
    if (d.sales.length) { t += '\n■ 프리랜서 영업자 소통\n'; d.sales.forEach(function(s){ t += '· ' + s.name + ' — ' + s.content + '\n'; }); }
    if (d.materials.length) { t += '\n■ 현장 소모자재\n'; d.materials.forEach(function(m){ t += '· ' + m.name + ' [' + m.status + '] — ' + m.action + '\n'; }); }
    if (d.remarks) t += '\n■ 특이사항 및 내일 할 일\n' + d.remarks + '\n';
    return t;
  }

  function setStatus(msg, ok) {
    const el = document.getElementById('wlStatus');
    if (el) { el.textContent = msg; el.style.color = (ok === false) ? '#e44' : '#2a7'; }
  }

  /* ── 업무일지 탭 내 "📋 현장일지" 버튼 삽입 ── */
  function injectDiaryBtn() {
    // diary 탭이 활성화된 toolbar 찾기
    const toolbars = document.querySelectorAll('.todo-toolbar');
    toolbars.forEach(function(toolbar) {
      if (toolbar.querySelector('[data-worklog-diary-btn]')) return;
      // diary 뷰 버튼이 있는 toolbar인지 확인
      if (!toolbar.querySelector('[data-todo-view="diary"]') && !toolbar.closest('#todoBoardPanel')) return;
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.setAttribute('data-worklog-diary-btn', '1');
      btn.style.cssText = 'background:#087d8f;color:#fff;font-weight:700;';
      btn.textContent = '📋 현장일지';
      btn.addEventListener('click', openModal);
      toolbar.appendChild(btn);
    });
  }

  /* ── DOM 변화 감지 ── */
  function watchForDiary() {
    injectDiaryBtn();
    const observer = new MutationObserver(function() {
      injectDiaryBtn();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchForDiary);
  } else {
    watchForDiary();
  }
})();
