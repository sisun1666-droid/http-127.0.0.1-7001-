(function () {
  const SHEET_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';

  /* ── localStorage nav에 업무일지 항목 주입 (app.js가 읽기 전에 실행) ── */
  try {
    var saved = localStorage.getItem('solar-admin-state-v1');
    if (saved) {
      var st = JSON.parse(saved);
      if (st.nav && !st.nav.some(function(n){ return n.label === '업무일지'; })) {
        st.nav.push({ icon: '✎', label: '업무일지' });
        localStorage.setItem('solar-admin-state-v1', JSON.stringify(st));
      }
    }
  } catch(e) {}

  /* ── 모달 HTML 동적 생성 (index.html 건드리지 않음) ── */
  function injectModal() {
    if (document.getElementById('worklogModal')) return;
    const div = document.createElement('div');
    div.innerHTML = `
<div class="overlay" id="worklogModal">
  <div class="modal" style="max-width:720px;width:95vw;max-height:90vh;overflow-y:auto">
    <div class="modal-head">
      <h2>일일 업무일지</h2>
      <button class="btn icon" id="wlCloseBtn">×</button>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>날짜</label><input class="field" type="date" id="wlDate"></div>
      <div class="form-row"><label>작성자</label><input class="field" id="wlAuthor" placeholder="이름"></div>
    </div>
    <div style="margin-top:14px">
      <div class="panel-title"><h2 style="font-size:14px">■ 발전소별 핵심 업무</h2><button class="btn" id="wlAddPlant">+ 추가</button></div>
      <div style="display:grid;grid-template-columns:140px 120px 1fr 36px;gap:4px 8px;margin-bottom:4px;font-size:12px;color:#888"><span>발전소</span><span>업무분류</span><span>내용</span><span></span></div>
      <div id="wlPlantList"></div>
    </div>
    <div style="margin-top:14px">
      <div class="panel-title"><h2 style="font-size:14px">■ 프리랜서 영업자 소통</h2><button class="btn" id="wlAddSales">+ 추가</button></div>
      <div style="display:grid;grid-template-columns:160px 1fr 36px;gap:4px 8px;margin-bottom:4px;font-size:12px;color:#888"><span>영업자명</span><span>소통 내용</span><span></span></div>
      <div id="wlSalesList"></div>
    </div>
    <div style="margin-top:14px">
      <div class="panel-title"><h2 style="font-size:14px">■ 현장 소모자재</h2><button class="btn" id="wlAddMat">+ 추가</button></div>
      <div style="display:grid;grid-template-columns:150px 110px 1fr 36px;gap:4px 8px;margin-bottom:4px;font-size:12px;color:#888"><span>자재명</span><span>재고상태</span><span>조치내용</span><span></span></div>
      <div id="wlMatList"></div>
    </div>
    <div style="margin-top:14px">
      <label style="font-size:13px;font-weight:500">■ 특이사항 및 내일 할 일</label>
      <textarea class="field" id="wlRemarks" style="margin-top:6px;min-height:70px" placeholder="내일 할 일, 특이사항 등"></textarea>
    </div>
    <div class="toolbar" style="margin-top:16px">
      <button class="btn primary" id="wlSaveSheet">구글 시트에 저장</button>
      <button class="btn" id="wlCopyKakao">카톡 복사</button>
    </div>
    <div id="wlStatus" style="font-size:12px;color:#888;margin-top:8px;min-height:18px"></div>
  </div>
</div>`;
    document.body.appendChild(div.firstElementChild);
    bindModalEvents();
  }

  /* ── 네비게이션에 업무일지 버튼 주입 ── */
  function injectNavBtn() {
    const nav = document.getElementById('nav');
    if (!nav || nav.querySelector('[data-worklog-nav]')) return;
    const btn = document.createElement('button');
    btn.className = 'nav-btn';
    btn.setAttribute('data-worklog-nav', '1');
    btn.innerHTML = '<span>✎</span><span>업무일지</span>';
    btn.addEventListener('click', openModal);
    nav.appendChild(btn);
  }

  /* ── 네비게이션 변화 감지 (app.js가 nav를 동적으로 렌더링하므로) ── */
  function watchNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    injectNavBtn();
    const observer = new MutationObserver(function() { injectNavBtn(); });
    observer.observe(nav, { childList: true });
  }

  /* ── 행 생성 함수 ── */
  function plantRow(plant, type, content) {
    plant = plant || ''; type = type || ''; content = content || '';
    const d = document.createElement('div');
    d.style.cssText = 'display:grid;grid-template-columns:140px 120px 1fr 36px;gap:4px 8px;margin-bottom:6px;align-items:center';
    d.innerHTML =
      '<select class="field wl-plant-name" style="font-size:13px">' +
      ['대구 태양광','왜관 현장','경주 발전소','기타'].map(v=>`<option${v===plant?' selected':''}>${v}</option>`).join('') +
      '</select>' +
      '<select class="field wl-plant-type" style="font-size:13px">' +
      ['사업주 소통','시공팀 조율','현장 점검','영업','행정'].map(v=>`<option${v===type?' selected':''}>${v}</option>`).join('') +
      '</select>' +
      `<input class="field wl-plant-content" style="font-size:13px" placeholder="내용" value="${content}">` +
      '<button class="btn icon wl-del" style="font-size:16px;padding:4px 8px">×</button>';
    return d;
  }

  function salesRow(name, content) {
    name = name || ''; content = content || '';
    const d = document.createElement('div');
    d.style.cssText = 'display:grid;grid-template-columns:160px 1fr 36px;gap:4px 8px;margin-bottom:6px;align-items:center';
    d.innerHTML =
      `<input class="field wl-sales-name" style="font-size:13px" placeholder="영업자명" value="${name}">` +
      `<input class="field wl-sales-content" style="font-size:13px" placeholder="소통 내용" value="${content}">` +
      '<button class="btn icon wl-del" style="font-size:16px;padding:4px 8px">×</button>';
    return d;
  }

  function matRow(name, status, action) {
    name = name || ''; status = status || '재고 여유'; action = action || '';
    const d = document.createElement('div');
    d.style.cssText = 'display:grid;grid-template-columns:150px 110px 1fr 36px;gap:4px 8px;margin-bottom:6px;align-items:center';
    d.innerHTML =
      `<input class="field wl-mat-name" style="font-size:13px" placeholder="자재명" value="${name}">` +
      '<select class="field wl-mat-status" style="font-size:13px">' +
      ['재고 여유','재고 부족','확인 필요'].map(v=>`<option${v===status?' selected':''}>${v}</option>`).join('') +
      '</select>' +
      `<input class="field wl-mat-action" style="font-size:13px" placeholder="조치내용" value="${action}">` +
      '<button class="btn icon wl-del" style="font-size:16px;padding:4px 8px">×</button>';
    return d;
  }

  /* ── 모달 열기 ── */
  function openModal() {
    injectModal();
    const modal = document.getElementById('worklogModal');
    document.getElementById('wlDate').value = new Date().toISOString().slice(0, 10);
    const author = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : '';
    document.getElementById('wlAuthor').value = author;
    document.getElementById('wlPlantList').innerHTML = '';
    document.getElementById('wlSalesList').innerHTML = '';
    document.getElementById('wlMatList').innerHTML = '';
    document.getElementById('wlPlantList').appendChild(plantRow());
    document.getElementById('wlSalesList').appendChild(salesRow());
    document.getElementById('wlMatList').appendChild(matRow());
    document.getElementById('wlRemarks').value = '';
    document.getElementById('wlStatus').textContent = '';
    modal.classList.add('open');
  }

  /* ── 모달 이벤트 바인딩 ── */
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
  }

  function collectData() {
    return {
      date: document.getElementById('wlDate').value,
      author: document.getElementById('wlAuthor').value,
      plants: Array.from(document.querySelectorAll('#wlPlantList > div')).map(r => ({
        plant: r.querySelector('.wl-plant-name').value,
        type: r.querySelector('.wl-plant-type').value,
        content: r.querySelector('.wl-plant-content').value.trim()
      })).filter(p => p.content),
      sales: Array.from(document.querySelectorAll('#wlSalesList > div')).map(r => ({
        name: r.querySelector('.wl-sales-name').value.trim(),
        content: r.querySelector('.wl-sales-content').value.trim()
      })).filter(s => s.name || s.content),
      materials: Array.from(document.querySelectorAll('#wlMatList > div')).map(r => ({
        name: r.querySelector('.wl-mat-name').value.trim(),
        status: r.querySelector('.wl-mat-status').value,
        action: r.querySelector('.wl-mat-action').value.trim()
      })).filter(m => m.name),
      remarks: document.getElementById('wlRemarks').value.trim()
    };
  }

  function buildKakaoText(d) {
    let t = '[일일 업무일지] ' + d.date + ' / ' + d.author + '\n\n';
    if (d.plants.length) { t += '■ 발전소별 핵심 업무\n'; d.plants.forEach(p => { t += '· ' + p.plant + ' | ' + p.type + ' | ' + p.content + '\n'; }); }
    if (d.sales.length) { t += '\n■ 프리랜서 영업자 소통\n'; d.sales.forEach(s => { t += '· ' + s.name + ' — ' + s.content + '\n'; }); }
    if (d.materials.length) { t += '\n■ 현장 소모자재\n'; d.materials.forEach(m => { t += '· ' + m.name + ' [' + m.status + '] — ' + m.action + '\n'; }); }
    if (d.remarks) t += '\n■ 특이사항 및 내일 할 일\n' + d.remarks + '\n';
    return t;
  }

  function setStatus(msg, ok) {
    const el = document.getElementById('wlStatus');
    if (el) { el.textContent = msg; el.style.color = (ok === false) ? '#e44' : '#2a7'; }
  }

  /* ── 초기화 ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchNav);
  } else {
    watchNav();
  }
})();
