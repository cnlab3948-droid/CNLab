// =====================================================
// CNLab 홈페이지 - Google Apps Script 백엔드
// =====================================================
// [배포 방법]
// 1. 구글 시트 열기 → 확장 프로그램 → Apps Script
// 2. 이 코드 전체 붙여넣기 후 저장 (Ctrl+S)
// 3. 배포 → 새 배포 → 유형: 웹 앱
// 4. 실행 계정: 나 / 액세스 권한: 모든 사용자(익명 포함)
// 5. 배포 후 발급된 URL을 각 HTML 파일의 APPS_SCRIPT_URL 에 붙여넣기
//
// [연결된 시트 목록]
// ┌──────────┬──────────────────────────────────────────┐
// │ 시트 이름 │ 헤더 (1행)                               │
// ├──────────┼──────────────────────────────────────────┤
// │ 공지사항  │ id, category_ko, title_ko, ...           │
// │ 소식      │ category, title, date, description       │
// │ 갤러리    │ image_url, caption                       │
// └──────────┴──────────────────────────────────────────┘
//
// [사용 예시]
//   공지사항 : APPS_SCRIPT_URL?sheet=공지사항
//   소식      : APPS_SCRIPT_URL?sheet=소식
//   갤러리    : APPS_SCRIPT_URL?sheet=갤러리
// =====================================================

function doGet(e) {
  const sheetName = e.parameter.sheet || '공지사항';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: '시트를 찾을 수 없습니다: ' + sheetName }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0]; // 1행 = 헤더
  const rows = data.slice(1); // 2행부터 실제 데이터

  const result = rows
    .filter(row => row.some(cell => cell !== '')) // 빈 행 제외
    .map(row => {
      const obj = {};
      headers.forEach((key, i) => {
        obj[String(key).trim()] = String(row[i] ?? '').trim();
      });
      return obj;
    });

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
