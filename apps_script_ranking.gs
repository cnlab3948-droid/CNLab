/**
 * CNLab 스트룹 과제 랭킹 관리 Apps Script
 * 
 * [설치 방법]
 * 1. 구글 스프레드시트에서 "rankings"라는 이름의 시트(탭)를 새로 만드세요.
 * 2. rankings 시트의 1행에 다음 헤더를 입력하세요:
 *    A1: name  |  B1: score  |  C1: accuracy  |  D1: date
 * 3. 확장 프로그램 → Apps Script 에서 아래 코드를 붙여넣으세요.
 * 4. "배포" → "새 배포" → 유형: "웹 앱" → 액세스: "모든 사용자" → 배포
 * 5. 생성된 URL을 experiment.js 의 RANKING_GAS_URL 값에 붙여넣으세요.
 * 
 * [중요] 이 스크립트는 기존 doGet과 별도의 새 배포로 사용해야 합니다.
 * 기존 CMS용 Apps Script와 충돌하지 않도록 별도의 스크립트 파일로 만드세요.
 */

// ===== GET: 랭킹 조회 =====
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('rankings');
    
    if (!sheet) {
      return jsonResponse({ result: 'success', leaderboard: [] });
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return jsonResponse({ result: 'success', leaderboard: [] });
    }
    
    var leaderboard = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim() !== '') {
        leaderboard.push({
          name: data[i][0].toString(),
          score: Number(data[i][1]) || 0,
          accuracy: Number(data[i][2]) || 0,
          date: data[i][3] ? data[i][3].toString() : ''
        });
      }
    }
    
    // 점수 높은 순 정렬, Top 10
    leaderboard.sort(function(a, b) { return b.score - a.score; });
    if (leaderboard.length > 10) leaderboard = leaderboard.slice(0, 10);
    
    return jsonResponse({ result: 'success', leaderboard: leaderboard });
    
  } catch (err) {
    return jsonResponse({ result: 'error', error: err.toString(), leaderboard: [] });
  }
}

// ===== POST: 랭킹 등록 =====
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var name = (body.name || '').toString().trim();
    var score = Number(body.score) || 0;
    var accuracy = Number(body.accuracy) || 0;
    var date = (body.date || new Date().toLocaleDateString('ko-KR')).toString();
    
    if (!name) {
      return jsonResponse({ result: 'error', error: 'name is required' });
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('rankings');
    
    // rankings 시트가 없으면 자동 생성
    if (!sheet) {
      sheet = ss.insertSheet('rankings');
      sheet.getRange(1, 1, 1, 4).setValues([['name', 'score', 'accuracy', 'date']]);
    }
    
    // 새 행 추가
    sheet.appendRow([name, score, accuracy, date]);
    
    // Top 10만 유지 (정리)
    var data = sheet.getDataRange().getValues();
    if (data.length > 11) { // 헤더 1행 + 데이터 10행 초과 시
      var rows = [];
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] && data[i][0].toString().trim() !== '') {
          rows.push(data[i]);
        }
      }
      rows.sort(function(a, b) { return Number(b[1]) - Number(a[1]); });
      
      // 상위 10개만 유지
      var keep = rows.slice(0, 10);
      
      // 시트 초기화 후 재작성
      sheet.clearContents();
      sheet.getRange(1, 1, 1, 4).setValues([['name', 'score', 'accuracy', 'date']]);
      if (keep.length > 0) {
        sheet.getRange(2, 1, keep.length, 4).setValues(keep);
      }
    }
    
    // 현재 Top 10 반환
    var finalData = sheet.getDataRange().getValues();
    var leaderboard = [];
    for (var j = 1; j < finalData.length; j++) {
      if (finalData[j][0] && finalData[j][0].toString().trim() !== '') {
        leaderboard.push({
          name: finalData[j][0].toString(),
          score: Number(finalData[j][1]) || 0,
          accuracy: Number(finalData[j][2]) || 0,
          date: finalData[j][3] ? finalData[j][3].toString() : ''
        });
      }
    }
    leaderboard.sort(function(a, b) { return b.score - a.score; });
    
    return jsonResponse({ result: 'success', leaderboard: leaderboard });
    
  } catch (err) {
    return jsonResponse({ result: 'error', error: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
