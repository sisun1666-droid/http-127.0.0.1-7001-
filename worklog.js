(function () {
  /* ── 할일관리 업무일지 탭에 카톡복사 + 내일할일추가 기능 주입 ── */

  function getTodayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function getTomorrowStr() {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  function getCurrentUser() {
    try {
      const sess = sessionStorage.getItem('solar-staff-session-v1');
      if (sess) { const u = JSON.parse(sess); return u.name || ''; }
    } catch(e) {}
    return '';
  }

  function getState() {
    try { return JSON.parse(localStorage.getItem('solar-admin-state-v1') || 'null'); } catch(e) { return null; }
  }

  function saveState(st) {
    localStorage.setItem('solar-admin-state-v1', JSON.stringify(st));
  }

  /* ── 카톡 텍스트 생성 ── */
  function buildKakaoText() {
    const st = getState();
    if (!st) return '';
    const today = getTodayStr();

    // 다이어리 탭에서 현재 선택된 담당자 이름 파악
    const activeChip = document.querySelector('[data-diary-person].active, .todo-chip[data-diary-person].active');
    const person = (activeChip && activeChip.dataset.diaryPerson !== '전체') ? activeChip.dataset.diaryPerson : getCurrentUser();

    const todos = (st.todos || []).filter(function(t) {
      const matchDate = (t.due === today || t.start === today);
      const matchPerson = !person || taskPeopleText(t, st).includes(person);
      return matchDate && matchPerson;
    });

    const memo = (st._diaryMemo && st._diaryMemo[today] && st._diaryMemo[today][person]) || '';

    let text = '[업무일지] ' + today + (person ? ' / ' + person : '') + '\n\n';

    if (todos.length) {
      const groups = {};
      todos.forEach(function(t) {
        const status = statusLabel(t.status);
        if (!groups[status]) groups[status] = [];
        groups[status].push(t);
      });
      ['완료','진행중','예정','취소'].forEach(function(s) {
        if (groups[s] && groups[s].length) {
          text += '■ ' + s + '\n';
          groups[s].forEach(function(t) {
            text += '· ' + t.title;
            if (t.result) text += ' → ' + t.result;
            text += '\n';
          });
          text += '\n';
        }
      });
    } else {
      text += '(오늘 업무 없음)\n\n';
    }

    if (memo) text += '■ 메모\n' + memo + '\n';
    return text;
  }

  function statusLabel(s) {
    if (s === '완료') return '완료';
    if (s === '진행중') return '진행중';
    if (s === '할 일') return '예정';
    if (s === '취소') return '취소';
    return s || '예정';
  }

  function taskPeopleText(t, st) {
    return t.owner || (st.people && st.people[0] && st.people[0].name) || '';
  }

  /* ── 내일 할일 파싱 후 할일관리 추가 ── */
  function addTomorrowTodos() {
    const memoEl = document.getElementById('diaryMemoInput');
    if (!memoEl || !memoEl.value.trim()) {
      showToast('메모란에 내일 할 일을 입력한 뒤 눌러주세요.');
      return;
    }
    const lines = memoEl.value.split('\n')
      .map(function(l) { return l.replace(/^[·\-\*\d\.\s▶→]+/, '').trim(); })
      .filter(function(l) { return l.length > 2; });

    if (!lines.length) { showToast('추가할 항목을 찾지 못했어요.'); return; }

    const st = getState();
    if (!st) { showToast('데이터 로드 실패'); return; }

    const tomorrow = getTomorrowStr();
    const author = getCurrentUser();
    lines.forEach(function(line) {
      st.todos.push({
        id: 'todo_wl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        title: line,
        owner: author,
        status: '할 일',
        priority: '보통',
        due: tomorrow,
        detail: ''
      });
    });
    saveState(st);
    showToast('✔ ' + lines.length + '개 항목을 내일 (' + tomorrow + ') 할일에 추가했어요!');
    if (typeof render === 'function') setTimeout(render, 150);
  }

  function showToast(msg) {
    const el = document.getElementById('toast');
    if (el) {
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(function() { el.classList.remove('show'); }, 3000);
    } else {
      alert(msg);
    }
  }

  /* ── 버튼을 업무일지 툴바에 삽입 ── */
  function injectDiaryButtons() {
    const toolbars = document.querySelectorAll('.todo-toolbar');
    toolbars.forEach(function(toolbar) {
      // 업무일지 탭이 있는 toolbar인지 확인 (diary 뷰 버튼 존재)
      if (!toolbar.querySelector('[data-todo-view="diary"]') && !toolbar.querySelector('#diarySyncBtn')) return;
      if (toolbar.querySelector('[data-wl-kakao-btn]')) return;

      // 카톡 복사 버튼
      const kakaoBtn = document.createElement('button');
      kakaoBtn.className = 'btn';
      kakaoBtn.setAttribute('data-wl-kakao-btn', '1');
      kakaoBtn.style.cssText = 'background:#FEE500;color:#3C1E1E;font-weight:700;';
      kakaoBtn.textContent = '카톡 복사';
      kakaoBtn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        const text = buildKakaoText();
        if (!text) { showToast('복사할 내용이 없어요.'); return; }
        navigator.clipboard.writeText(text)
          .then(function() { showToast('✔ 카톡용 업무일지가 복사됐어요!'); })
          .catch(function() { showToast('복사 실패 — 클립보드 권한을 확인해주세요.'); });
      });

      // 내일 할일 추가 버튼
      const addBtn = document.createElement('button');
      addBtn.className = 'btn';
      addBtn.setAttribute('data-wl-addtodo-btn', '1');
      addBtn.style.cssText = 'background:#087d8f;color:#fff;font-weight:700;';
      addBtn.textContent = '메모 → 내일 할일';
      addBtn.title = '아래 메모란에 입력한 내용을 내일 할일로 자동 등록합니다';
      addBtn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        addTomorrowTodos();
      });

      toolbar.appendChild(kakaoBtn);
      toolbar.appendChild(addBtn);
    });
  }

  /* ── DOM 변화 감지 ── */
  function watch() {
    injectDiaryButtons();
    const observer = new MutationObserver(function() {
      injectDiaryButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watch);
  } else {
    watch();
  }
})();
