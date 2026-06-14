(function () {
  /* ── 구글 시트 Apps Script URL ── */
  const SHEET_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';

  const today = () => new Date().toISOString().slice(0, 10);

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

  function openModal() {
    document.getElementById('wlDate').value = today();
    const author = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : '';
    document.getElementById('wlAuthor').value = author;
    const pl = document.getElementById('wlPlantList');
    const sl = document.getElementById('wlSalesList');
    const ml = document.getElementById('wlMatList');
    pl.innerHTML = ''; sl.innerHTML = ''; ml.innerHTML = '';
    pl.appendChild(plantRow());
    sl.appendChild(salesRow());
    ml.appendChild(matRow());
    document.getElementById('wlRemarks').value = '';
    document.getElementById('wlStatus').textContent = '';
    document.getElementById('worklogModal').classList.add('open');
  }

  function collectData() {
    const date = document.getElementById('wlDate').value;
    const author = document.getElementById('wlAuthor').value;
    const plants = Array.from(document.querySelectorAll('#wlPlantList > div')).map(r => ({
      plant: r.querySelector('.wl-plant-name').value,
      type: r.querySelector('.wl-plant-type').value,
      content: r.querySelector('.wl-plant-content').value.trim()
    })).filter(p => p.content);
    const sales = Array.from(document.querySelectorAll('#wlSalesList > div')).map(r => ({
      name: r.querySelector('.wl-sales-name').value.trim(),
      content: r.querySelector('.wl-sales-content').value.trim()
    })).filter(s => s.name || s.content);
    const materials = Array.from(document.querySelectorAll('#wlMatList > div')).map(r => ({
      name: r.querySelector('.wl-mat-name').value.trim(),
      status: r.querySelector('.wl-mat-status').value,
      action: r.querySelector('.wl-mat-action').value.trim()
    })).filter(m => m.name);
    const remarks = document.getElementById('wlRemarks').value.trim();
    return { date, author, plants, sales, materials, remarks };
  }

  function buildKakaoText(d) {
    let t = '[일일 업무일지] ' + d.date + ' / ' + d.author + '\n\n';
    if (d.plants.length) {
      t += '■ 발전소별 핵심 업무\n';
      d.plants.forEach(p => { t += '· ' + p.plant + ' | ' + p.type + ' | ' + p.content + '\n'; });
    }
    if (d.sales.length) {
      t += '\n■ 프리랜서 영업자 소통\n';
      d.sales.forEach(s => { t += '· ' + s.name + ' — ' + s.content + '\n'; });
    }
    if (d.materials.length) {
      t += '\n■ 현장 소모자재\n';
      d.materials.forEach(m => { t += '· ' + m.name + ' [' + m.status + '] — ' + m.action + '\n'; });
    }
    if (d.remarks) t += '\n■ 특이사항 및 내일 할 일\n' + d.remarks + '\n';
    return t;
  }

  function setStatus(msg, ok) {
    const el = document.getElementById('wlStatus');
    el.textContent = msg;
    el.style.color = (ok === false) ? '#e44' : '#2a7';
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('worklogBtn').addEventListener('click', openModal);

    document.getElementById('worklogModal').addEventListener('click', function (e) {
      if (e.target.dataset.close === 'worklogModal') {
        document.getElementById('worklogModal').classList.remove('open');
      }
      if (e.target.classList.contains('wl-del')) {
        e.target.parentElement.remove();
      }
    });

    document.getElementById('wlAddPlant').addEventListener('click', function () {
      document.getElementById('wlPlantList').appendChild(plantRow());
    });
    document.getElementById('wlAddSales').addEventListener('click', function () {
      document.getElementById('wlSalesList').appendChild(salesRow());
    });
    document.getElementById('wlAddMat').addEventListener('click', function () {
      document.getElementById('wlMatList').appendChild(matRow());
    });

    document.getElementById('wlSaveSheet').addEventListener('click', function () {
      const data = collectData();
      if (!data.date || !data.author) { setStatus('날짜와 작성자를 입력해주세요.', false); return; }
      if (SHEET_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL') { setStatus('구글 시트 URL을 worklog.js에 설정해주세요.', false); return; }
      setStatus('저장 중...');
      fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function () {
        setStatus('✔ 구글 시트에 저장되었습니다!');
      }).catch(function (err) {
        setStatus('저장 실패: ' + err.message, false);
      });
    });

    document.getElementById('wlCopyKakao').addEventListener('click', function () {
      const data = collectData();
      navigator.clipboard.writeText(buildKakaoText(data))
        .then(function () { setStatus('✔ 카톡 텍스트가 복사되었습니다!'); })
        .catch(function () { setStatus('복사 실패 — 브라우저 권한을 확인해주세요.', false); });
    });
  });
})();
