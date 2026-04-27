/**
 * CNLab Website — Experiment Module (jsPsych v8 기반)
 * Simple RT & Choice RT 반응시간 측정 실험
 * jsPsych의 검증된 타이밍 정확도 사용
 *
 * 필요한 CDN (index.html <head>에 추가):
 *   <script src="https://unpkg.com/jspsych@8.0.0/jspsych.js"></script>
 *   <link rel="stylesheet" href="https://unpkg.com/jspsych@8.0.0/css/jspsych.css">
 *   <script src="https://unpkg.com/@jspsych/plugin-html-keyboard-response@2.0.0/dist/index.browser.min.js"></script>
 */

(function () {
  'use strict';

  // ===== Configuration =====
  const CONFIG = {
    gasUrl: 'https://script.google.com/macros/s/AKfycbw9YRLxQyGhxfUOWZMyaf-YTgMSDv_83lU1F8ANUfOBMBQGt0ljBO65DwiXRjq9Korz/exec',
    simple: {
      totalTrials: 10,
      fixationMin: 1000,
      fixationMax: 3000,
    },
    choice: {
      totalTrials: 20,
      fixationMin: 1000,
      fixationMax: 3000,
    },
  };

  // ===== Utility =====
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function mean(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  function stdDev(arr) {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    return Math.sqrt(arr.reduce((s, v) => s + Math.pow(v - m, 2), 0) / (arr.length - 1));
  }

  // ===== Google Sheets 전송 =====
  function sendToSheets(task, subjectInfo, trials) {
    if (!CONFIG.gasUrl || !CONFIG.gasUrl.includes('script.google.com')) return;
    fetch(CONFIG.gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        task: task,
        sex: subjectInfo.sex,
        age: subjectInfo.age,
        trials: trials,
      }),
    }).catch(e => console.error('Google Sheets 전송 오류:', e));
  }

  // ===== 결과 화면 공통 렌더링 =====
  function renderResults(container, display, taskLabel, trialData, subjectInfo, taskType) {
    const rts = trialData.filter(d => d.correct).map(d => d.rt);
    const avgRT = mean(rts);
    const sdRT = stdDev(rts);
    const minRT = rts.length > 0 ? Math.min(...rts) : 0;
    const maxRT = rts.length > 0 ? Math.max(...rts) : 0;
    const accuracy = taskType === 'choice'
      ? ((trialData.filter(d => d.correct).length / trialData.length) * 100).toFixed(0)
      : null;

    display.innerHTML = '';

    container.innerHTML = `
      <div class="experiment__results">
        <div class="experiment__results-header">
          <h3>📊 실험 결과 — ${taskLabel}</h3>
          <p style="color: var(--color-text-secondary);">총 ${trialData.length}회 시행 완료</p>
        </div>

        <div class="experiment__results-stats">
          <div class="experiment__stat-card">
            <div class="experiment__stat-card-value">${Math.round(avgRT)}</div>
            <div class="experiment__stat-card-unit">ms</div>
            <div class="experiment__stat-card-label">평균 RT${taskType === 'choice' ? ' (정답만)' : ''}</div>
          </div>
          <div class="experiment__stat-card">
            <div class="experiment__stat-card-value">${Math.round(sdRT)}</div>
            <div class="experiment__stat-card-unit">ms</div>
            <div class="experiment__stat-card-label">표준편차</div>
          </div>
          <div class="experiment__stat-card">
            <div class="experiment__stat-card-value">${Math.round(minRT)}</div>
            <div class="experiment__stat-card-unit">ms</div>
            <div class="experiment__stat-card-label">최소 RT</div>
          </div>
          ${taskType === 'choice' ? `
          <div class="experiment__stat-card">
            <div class="experiment__stat-card-value">${accuracy}</div>
            <div class="experiment__stat-card-unit">%</div>
            <div class="experiment__stat-card-label">정확도</div>
          </div>` : `
          <div class="experiment__stat-card">
            <div class="experiment__stat-card-value">${Math.round(maxRT)}</div>
            <div class="experiment__stat-card-unit">ms</div>
            <div class="experiment__stat-card-label">최대 RT</div>
          </div>`}
        </div>

        <div class="experiment__trial-list">
          <div class="experiment__trial-row experiment__trial-row--header">
            <span>시행</span>
            ${taskType === 'choice' ? '<span>자극</span>' : '<span>자극</span>'}
            <span>반응시간</span>
            <span>정확</span>
          </div>
          ${trialData.map(d => `
            <div class="experiment__trial-row">
              <span>${d.trial}</span>
              <span>${taskType === 'choice' ? (d.stimulus === '빨강' ? '🔴' : '🔵') : '🟢'}</span>
              <span class="experiment__trial-rt">${d.rt.toFixed(1)} ms</span>
              <span class="${d.correct ? 'experiment__trial-correct' : 'experiment__trial-incorrect'}">
                ${d.correct ? '✓' : '✗'}
              </span>
            </div>
          `).join('')}
        </div>

        <div class="experiment__btn-group" style="margin-top: 24px;">
          <button class="btn btn--primary" onclick="window.__cnlab_downloadCSV('${taskType}')">
            <span class="btn__icon">📥</span> CSV 다운로드
          </button>
          <button class="btn btn--outline" onclick="window.__cnlab_reset('${taskType}')">
            다시 하기
          </button>
        </div>
      </div>
    `;
  }

  // ===== jsPsych 공통 초기화 함수 =====
  function initJsPsychInPanel(displayEl) {
    // jsPsych가 특정 div 안에서만 작동하도록 설정
    return initJsPsych({
      display_element: displayEl,
      on_close: function () {},
      // jsPsych 기본 CSS가 전체 페이지를 덮지 않도록
      override_safe_mode: false,
    });
  }

  // ===== Simple RT 실험 =====
  const simpleDisplay = document.getElementById('simple-rt-display');
  const simpleControls = document.getElementById('simple-rt-controls');
  let simpleTrialData = [];

  function startSimpleRT() {
    const sex = document.getElementById('simple-subj-sex').value;
    const age = document.getElementById('simple-subj-age').value;
    if (!sex || !age) {
      alert('실험을 시작하기 전에 성별과 만 나이를 모두 입력해주세요.');
      return;
    }
    const subjectInfo = { sex, age };
    simpleTrialData = [];

    // jsPsych 인스턴스를 display 영역 안에 생성
    const jsPsych = initJsPsychInPanel('simple-rt-display');

    // 타임라인 구성
    const timeline = [];
    const totalTrials = CONFIG.simple.totalTrials;

    for (let i = 0; i < totalTrials; i++) {
      // 고정점(+) 화면
      timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div style="font-size: 4rem; color: #64748b; font-weight: 300;">+</div>',
        choices: 'NO_KEYS',
        trial_duration: () => randomInt(CONFIG.simple.fixationMin, CONFIG.simple.fixationMax),
        data: { task: 'fixation' },
      });

      // 자극(초록 원) 화면
      timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div style="width:100px;height:100px;border-radius:50%;background:#10B981;margin:auto;box-shadow:0 0 30px rgba(16,185,129,0.5);"></div>',
        choices: [' '],
        trial_duration: 2000, // 2초 안에 반응 없으면 다음으로
        data: { task: 'simple-rt', trial_index: i + 1 },
        on_finish: function (data) {
          const rt = data.response === null ? null : Math.round(data.rt * 100) / 100;
          const correct = data.response !== null;
          simpleTrialData.push({
            trial: i + 1,
            rt: rt ?? 0,
            correct: correct,
          });

          // 진행 바 업데이트
          const progress = document.getElementById('simple-rt-progress');
          const bar = document.getElementById('simple-rt-progress-bar');
          if (progress && bar) {
            progress.style.display = 'block';
            bar.style.width = `${((i + 1) / totalTrials) * 100}%`;
          }
        },
      });

      // 피드백 화면 (800ms)
      timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function () {
          const last = simpleTrialData[simpleTrialData.length - 1];
          if (!last || !last.correct) {
            return '<p style="color:#EF4444;font-size:1.5rem;">시간 초과 ✗</p>';
          }
          return `<p style="color:#10B981;font-size:1.5rem;font-family:monospace;">${Math.round(last.rt)} ms</p>`;
        },
        choices: 'NO_KEYS',
        trial_duration: 800,
        data: { task: 'feedback' },
      });
    }

    // 실험 완료 후
    jsPsych.run(timeline).then(() => {
      // Google Sheets 전송
      sendToSheets('SimpleRT', subjectInfo, simpleTrialData);
      // 결과 화면 표시
      renderResults(simpleControls, simpleDisplay, '단순 반응시간', simpleTrialData, subjectInfo, 'simple');
    });
  }

  // ===== Choice RT 실험 =====
  const choiceDisplay = document.getElementById('choice-rt-display');
  const choiceControls = document.getElementById('choice-rt-controls');
  let choiceTrialData = [];

  function startChoiceRT() {
    const sex = document.getElementById('choice-subj-sex').value;
    const age = document.getElementById('choice-subj-age').value;
    if (!sex || !age) {
      alert('실험을 시작하기 전에 성별과 만 나이를 모두 입력해주세요.');
      return;
    }
    const subjectInfo = { sex, age };
    choiceTrialData = [];

    const stimuli = [
      { color: '#EF4444', label: '빨강', key: 'f' },
      { color: '#3B82F6', label: '파랑', key: 'j' },
    ];

    const jsPsych = initJsPsychInPanel('choice-rt-display');
    const timeline = [];
    const totalTrials = CONFIG.choice.totalTrials;

    for (let i = 0; i < totalTrials; i++) {
      const stim = stimuli[Math.random() < 0.5 ? 0 : 1];

      // 고정점(+)
      timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div style="font-size: 4rem; color: #64748b; font-weight: 300;">+</div>',
        choices: 'NO_KEYS',
        trial_duration: () => randomInt(CONFIG.choice.fixationMin, CONFIG.choice.fixationMax),
        data: { task: 'fixation' },
      });

      // 자극(색 원)
      const currentStim = stim;
      timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<div style="width:100px;height:100px;border-radius:50%;background:${currentStim.color};margin:auto;box-shadow:0 0 30px ${currentStim.color}80;"></div>`,
        choices: ['f', 'j'],
        trial_duration: 2000,
        data: { task: 'choice-rt', trial_index: i + 1, stimulus: currentStim.label, correct_key: currentStim.key },
        on_finish: function (data) {
          const rt = data.response === null ? null : Math.round(data.rt * 100) / 100;
          const correct = data.response === currentStim.key;
          choiceTrialData.push({
            trial: i + 1,
            stimulus: currentStim.label,
            response: data.response ?? 'none',
            rt: rt ?? 0,
            correct: correct,
          });

          const progress = document.getElementById('choice-rt-progress');
          const bar = document.getElementById('choice-rt-progress-bar');
          if (progress && bar) {
            progress.style.display = 'block';
            bar.style.width = `${((i + 1) / totalTrials) * 100}%`;
          }
        },
      });

      // 피드백
      timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function () {
          const last = choiceTrialData[choiceTrialData.length - 1];
          if (!last) return '';
          if (last.response === 'none') return '<p style="color:#EF4444;font-size:1.5rem;">시간 초과 ✗</p>';
          if (last.correct) return `<p style="color:#10B981;font-size:1.5rem;font-family:monospace;">${Math.round(last.rt)} ms ✓</p>`;
          return '<p style="color:#EF4444;font-size:1.5rem;">오답 ✗</p>';
        },
        choices: 'NO_KEYS',
        trial_duration: 800,
        data: { task: 'feedback' },
      });
    }

    jsPsych.run(timeline).then(() => {
      sendToSheets('ChoiceRT', subjectInfo, choiceTrialData);
      renderResults(choiceControls, choiceDisplay, '선택 반응시간', choiceTrialData, subjectInfo, 'choice');
    });
  }

  // ===== 다시 하기 =====
  function resetSimple() {
    simpleTrialData = [];
    simpleDisplay.innerHTML = `
      <div style="text-align:center;color:var(--color-text);">
        <h3>🟢 단순 반응시간 과제</h3>
        <p>준비가 되면 아래 시작 버튼을 누르세요.</p>
      </div>`;
    simpleControls.innerHTML = buildParticipantForm('simple', startSimpleRT);
    document.getElementById('btn-start-simple').addEventListener('click', startSimpleRT);
  }

  function resetChoice() {
    choiceTrialData = [];
    choiceDisplay.innerHTML = `
      <div style="text-align:center;color:var(--color-text);">
        <h3>🔴🔵 선택 반응시간 과제</h3>
        <p>준비가 되면 아래 시작 버튼을 누르세요.</p>
      </div>`;
    choiceControls.innerHTML = buildParticipantForm('choice', startChoiceRT);
    document.getElementById('btn-start-choice').addEventListener('click', startChoiceRT);
  }

  function reset(type) {
    if (type === 'simple') resetSimple();
    else resetChoice();
  }

  // ===== 참여자 정보 폼 HTML 생성 =====
  function buildParticipantForm(type, onStart) {
    const isSimple = type === 'simple';
    return `
      <div style="background:var(--color-bg-tertiary);padding:16px;border-radius:8px;margin-bottom:16px;display:flex;gap:16px;align-items:center;border:1px solid var(--color-border);flex-wrap:wrap;">
        <label style="font-weight:600;color:var(--color-text);font-size:0.9rem;">성별:</label>
        <select id="${type}-subj-sex" style="padding:6px 12px;border-radius:4px;border:1px solid var(--color-border);font-family:inherit;font-size:0.9rem;background:var(--color-bg-primary);color:var(--color-text);">
          <option value="">선택</option>
          <option value="남성">남성</option>
          <option value="여성">여성</option>
          <option value="기타">기타</option>
        </select>
        <label style="font-weight:600;color:var(--color-text);font-size:0.9rem;">만 나이:</label>
        <input type="number" id="${type}-subj-age" placeholder="예: 25" min="1" max="100"
          style="padding:6px 12px;width:80px;border-radius:4px;border:1px solid var(--color-border);font-family:inherit;font-size:0.9rem;background:var(--color-bg-primary);color:var(--color-text);">
      </div>
      <div style="background:var(--color-bg-secondary);padding:15px;border-radius:8px;border-left:4px solid ${isSimple ? '#10b981' : '#3b82f6'};margin-bottom:15px;font-size:0.9rem;line-height:1.6;color:var(--color-text);">
        <strong>📋 실험 방법:</strong><br>
        1. 시작 버튼을 누르면 화면 중앙에 <strong>+</strong> 기호가 나타납니다.<br>
        ${isSimple
          ? `2. 잠시 후 <strong style="color:#10B981;">초록색 원</strong>이 나타나면 최대한 빨리 <strong>스페이스바</strong>를 누르세요.<br>
             3. 총 <strong>${CONFIG.simple.totalTrials}회</strong> 시행을 완료한 후 결과가 표시됩니다.`
          : `2. <strong style="color:#EF4444;">빨간색 원</strong> → <strong>F</strong>키 / <strong style="color:#3B82F6;">파란색 원</strong> → <strong>J</strong>키<br>
             3. 총 <strong>${CONFIG.choice.totalTrials}회</strong> 시행을 완료한 후 결과가 표시됩니다.`
        }
      </div>
      <div class="experiment__progress" id="${type}-rt-progress" style="display:none;">
        <div class="experiment__progress-bar" id="${type}-rt-progress-bar" style="width:0%;"></div>
      </div>
      <div class="experiment__btn-group">
        <button class="btn btn--primary" id="btn-start-${type}">
          <span class="btn__icon">▶</span> 실험 시작
        </button>
      </div>
    `;
  }

  // ===== CSV 다운로드 =====
  function downloadCSV(type) {
    const data = type === 'simple' ? simpleTrialData : choiceTrialData;
    const filename = `CNLab_${type === 'simple' ? 'SimpleRT' : 'ChoiceRT'}_${new Date().toISOString().slice(0, 10)}.csv`;
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(',')),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ===== 이벤트 연결 =====
  const btnStartSimple = document.getElementById('btn-start-simple');
  const btnStartChoice = document.getElementById('btn-start-choice');
  if (btnStartSimple) btnStartSimple.addEventListener('click', startSimpleRT);
  if (btnStartChoice) btnStartChoice.addEventListener('click', startChoiceRT);

  // ===== 전역 노출 =====
  window.__cnlab_downloadCSV = downloadCSV;
  window.__cnlab_reset = reset;
  window.__cnlab_resetSimple = () => reset('simple');
  window.__cnlab_resetChoice = () => reset('choice');

})();
