/**
 * 현장 업무일지 Google Apps Script
 * 배포: 스크립트 편집기 → 배포 → 새 배포 → 웹 앱
 * 액세스: 모든 사용자(익명 포함)
 */

const SPREADSHEET_ID = ''; // ← 여기에 구글 스프레드시트 ID 입력 (URL의 /d/XXXX/edit 에서 XXXX 부분)
const SHEET_NAME = '업무일지';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    appendDiary(data);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: '업무일지 API 정상 작동 중' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function appendDiary(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  // 시트 없으면 생성 + 헤더 추가
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      '날짜', '작성자', '저장시각',
      '발전소', '업무분류', '업무내용',
      '영업자명', '영업소통내용',
      '자재명', '재고상태', '조치내용',
      '할일(완료)', '할일(진행중)',
      '특이사항/내일할일'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#08245c').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  const date   = data.date   || '';
  const person = data.person || '';
  const now    = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

  const plants    = data.plants    || [];
  const sales     = data.sales     || [];
  const materials = data.materials || [];
  const todos     = data.todos     || [];
  const remarks   = data.remarks   || '';

  const maxRows = Math.max(plants.length, sales.length, materials.length, 1);

  const doneTodos  = todos.filter(t => t.status === '완료').map(t => t.title).join('\n');
  const doingTodos = todos.filter(t => t.status === '진행중').map(t => t.title).join('\n');

  for (let i = 0; i < maxRows; i++) {
    const p = plants[i]    || {};
    const s = sales[i]     || {};
    const m = materials[i] || {};

    const row = [
      i === 0 ? date   : '',
      i === 0 ? person : '',
      i === 0 ? now    : '',
      p.plant   || '',
      p.type    || '',
      p.content || '',
      s.name    || '',
      s.content || '',
      m.name    || '',
      m.status  || '',
      m.action  || '',
      i === 0 ? doneTodos  : '',
      i === 0 ? doingTodos : '',
      i === 0 ? remarks    : '',
    ];
    sheet.appendRow(row);
  }

  // 날짜별 자동 색상 (홀짝 구분)
  const lastRow = sheet.getLastRow();
  const color = (lastRow % 2 === 0) ? '#f0f8ff' : '#ffffff';
  sheet.getRange(lastRow - maxRows + 1, 1, maxRows, 14).setBackground(color);
}
