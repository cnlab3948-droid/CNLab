/**
 * CNLab Website — Experiment Module
 * Simple RT & Choice RT 반응시간 측정 실험
 * performance.now() 기반 밀리초 정밀도 측정
 */

(function () {
  'use strict';

  // ===== Configuration =====
  const CONFIG = {
    gasUrl: 'https://script.google.com/macros/s/AKfycbw9YRLxQyGhxfUOWZMyaf-YTgMSDv_83lU1F8ANUfOBMBQGt0ljBO65DwiXRjq9Korz/exec', // Google Apps Script URL
    simple: {
      totalTrials: 10,
      fixationMin: 1000,   // ms
      fixationMax: 3000,   // ms
      stimulusColor: '#10B981',
      responseKey: ' ',    // spacebar
    },
    choice: {
      totalTrials: 20,
      fixationMin: 1000,
      fixationMax: 3000,
      colors: [
        { color: '#EF4444', className: 'experiment__stimulus--red', key: 'f', label: '빨강' },
        { color: '#3B82F6', className: 'experiment__stimulus--blue', key: 'j', label: '파랑' },
      ],
    },
  };

  // ===== State =====
  let simpleState = { running: false, trialNum: 0, data: [], stimulusOnset: 0, phase: 'idle', timeoutId: null };
  let choiceState = { running: false, trialNum: 0, data: [], stimulusOnset: 0, phase: 'idle', currentStimulus: null, timeoutId: null };

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

  // ===== Simple RT =====
  const simpleDisplay = document.getElementById('simple-rt-display');
  const simpleCanvas = document.getElementById('simple-rt-canvas');
  const simpleControls = document.getElementById('simple-rt-controls');
  const simpleProgress = document.getElementById('simple-rt-progress');
  const simpleProgressBar = document.getElementById('simple-rt-progress-bar');
  const btnStartSimple = document.getElementById('btn-start-simple');

  function startSimpleRT() {
    const sex = document.getElementById('simple-subj-sex').value;
    const age = document.getElementById('simple-subj-age').value;
    
    if(!sex || !age) {
      alert("실험을 시작하기 전에 성별과 만 나이를 모두 입력해주세요.");
      return;
    }

    simpleState = { running: true, trialNum: 0, data: [], stimulusOnset: 0, phase: 'idle', timeoutId: null, subjectInfo: {sex, age} };
    btnStartSimple.disabled = true;
    btnStartSimple.textContent = '실험 진행 중...';
    simpleProgress.style.display = 'block';
    simpleProgressBar.style.width = '0%';
    simpleCanvas.focus();
    runSimpleTrial();
  }

  function runSimpleTrial() {
    if (simpleState.trialNum >= CONFIG.simple.totalTrials) {
      showSimpleResults();
      return;
    }

    simpleState.phase = 'fixation';
    simpleDisplay.innerHTML = '<span class="experiment__fixation">+</span>';

    const fixationDuration = randomInt(CONFIG.simple.fixationMin, CONFIG.simple.fixationMax);

    simpleState.timeoutId = setTimeout(() => {
      // Show stimulus
      simpleState.phase = 'stimulus';
      simpleDisplay.innerHTML = '<div class="experiment__stimulus experiment__stimulus--green"></div>';
      simpleState.stimulusOnset = performance.now();
    }, fixationDuration);
  }

  function handleSimpleResponse() {
    if (!simpleState.running || simpleState.phase !== 'stimulus') return;

    const rt = performance.now() - simpleState.stimulusOnset;

    simpleState.data.push({
      trial: simpleState.trialNum + 1,
      rt: Math.round(rt * 100) / 100,
      correct: true,
    });

    simpleState.trialNum++;
    simpleProgressBar.style.width = `${(simpleState.trialNum / CONFIG.simple.totalTrials) * 100}%`;

    // Brief feedback
    simpleDisplay.innerHTML = `<p style="color: #10B981; font-size: 1.5rem; font-family: var(--font-mono);">${Math.round(rt)} ms</p>`;

    setTimeout(() => {
      runSimpleTrial();
    }, 800);
  }

  function showSimpleResults() {
    simpleState.running = false;
    simpleState.phase = 'results';

    const rts = simpleState.data.map((d) => d.rt);
    const avgRT = mean(rts);
    const sdRT = stdDev(rts);
    const minRT = Math.min(...rts);
    const maxRT = Math.max(...rts);

    // Google Sheets 연동 전송
    if (CONFIG.gasUrl && CONFIG.gasUrl.includes('script.google.com')) {
      fetch(CONFIG.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          task: 'SimpleRT',
          sex: simpleState.subjectInfo.sex,
          age: simpleState.subjectInfo.age,
          avgRT: Math.round(avgRT),
          accuracy: '-',
          rts: rts.map(r => r.toFixed(1)).join(', ')
        })
      }).catch(e => console.error("Google Sheets 전송 중 에러 발생:", e));
    }

    // Show results in canvas
    simpleDisplay.innerHTML = '';

    // Build results in controls area
    simpleControls.innerHTML = `
      <div class="experiment__results">
        <div class="experiment__results-header">
          <h3>📊 실험 결과 — 단순 반응시간</h3>
          <p style="color: var(--color-text-secondary);">총 ${CONFIG.simple.totalTrials}회 시행 완료</p>
        </div>
        
        <div class="experiment__results-stats">
          <div class="experiment__stat-card">
            <div class="experiment__stat-card-value">${Math.round(avgRT)}</div>
            <div class="experiment__stat-card-unit">ms</div>
            <div class="experiment__stat-card-label">평균 RT</div>
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
          <div class="experiment__stat-card">
            <div class="experiment__stat-card-value">${Math.round(maxRT)}</div>
            <div class="experiment__stat-card-unit">ms</div>
            <div class="experiment__stat-card-label">최대 RT</div>
          </div>
        </div>

        <div class="experiment__trial-list">
          <div class="experiment__trial-row experiment__trial-row--header">
            <span>시행</span>
            <span>자극</span>
            <span>반응시간</span>
            <span>정확</span>
          </div>
          ${simpleState.data
            .map(
              (d) => `
            <div class="experiment__trial-row">
              <span>${d.trial}</span>
              <span>🟢</span>
              <span class="experiment__trial-rt">${d.rt.toFixed(1)} ms</span>
              <span class="experiment__trial-correct">✓</span>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="experiment__btn-group" style="margin-top: 24px;">
          <button class="btn btn--primary" onclick="window.__cnlab_downloadCSV('simple')">
            <span class="btn__icon">📥</span>
            CSV 다운로드
          </button>
          <button class="btn btn--outline" onclick="window.__cnlab_resetSimple()">
            다시 하기
          </button>
        </div>
      </div>
    `;
  }

  function resetSimple() {
    simpleState = { running: false, trialNum: 0, data: [], stimulusOnset: 0, phase: 'idle', timeoutId: null };
    if (simpleState.timeoutId) clearTimeout(simpleState.timeoutId);

    simpleDisplay.innerHTML = `
      <div class="experiment__info">
        <h3>🟢 단순 반응시간 과제</h3>
        <p style="color: var(--color-text-secondary);">Simple Reaction Time Task</p>
      </div>
    `;

    simpleControls.innerHTML = `
      <div class="experiment__participant-info" style="background: var(--color-bg-tertiary); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; gap: 16px; align-items: center; border: 1px solid var(--color-border); flex-wrap: wrap;">
        <label style="font-weight: 600; color: var(--color-text); font-size: 0.9rem;">성별:</label>
        <select id="simple-subj-sex" style="padding: 6px 12px; border-radius: 4px; border: 1px solid var(--color-border); font-family: inherit; font-size: 0.9rem;">
          <option value="">선택</option>
          <option value="남성">남성</option>
          <option value="여성">여성</option>
          <option value="기타">기타</option>
        </select>
        <label style="font-weight: 600; color: var(--color-text); font-size: 0.9rem;">만 나이:</label>
        <input type="number" id="simple-subj-age" placeholder="예: 25" min="1" max="100" style="padding: 6px 12px; width: 80px; border-radius: 4px; border: 1px solid var(--color-border); font-family: inherit; font-size: 0.9rem;">
      </div>
      <div class="experiment__instructions">
        <strong>📋 실험 방법:</strong><br>
        1. 시작 버튼을 누르면 화면 중앙에 <strong>+</strong> 기호가 나타납니다.<br>
        2. 잠시 후 <strong style="color: #10B981;">초록색 원</strong>이 나타나면 최대한 빨리 <strong>스페이스바</strong>를 누르세요.<br>
        3. 총 <strong>10회</strong> 시행을 완료한 후 결과가 표시됩니다.
      </div>
      <div class="experiment__progress" id="simple-rt-progress" style="display: none;">
        <div class="experiment__progress-bar" id="simple-rt-progress-bar" style="width: 0%;"></div>
      </div>
      <div class="experiment__btn-group">
        <button class="btn btn--primary" id="btn-start-simple">
          <span class="btn__icon">▶</span>
          실험 시작
        </button>
      </div>
    `;

    // Re-attach event
    document.getElementById('btn-start-simple').addEventListener('click', startSimpleRT);
  }

  // ===== Choice RT =====
  const choiceDisplay = document.getElementById('choice-rt-display');
  const choiceCanvas = document.getElementById('choice-rt-canvas');
  const choiceControls = document.getElementById('choice-rt-controls');
  const choiceProgress = document.getElementById('choice-rt-progress');
  const choiceProgressBar = document.getElementById('choice-rt-progress-bar');
  const btnStartChoice = document.getElementById('btn-start-choice');

  function startChoiceRT() {
    const sex = document.getElementById('choice-subj-sex').value;
    const age = document.getElementById('choice-subj-age').value;
    
    if(!sex || !age) {
      alert("실험을 시작하기 전에 성별과 만 나이를 모두 입력해주세요.");
      return;
    }

    choiceState = { running: true, trialNum: 0, data: [], stimulusOnset: 0, phase: 'idle', currentStimulus: null, timeoutId: null, subjectInfo: {sex, age} };
    btnStartChoice.disabled = true;
    btnStartChoice.textContent = '실험 진행 중...';
    choiceProgress.style.display = 'block';
    choiceProgressBar.style.width = '0%';
    choiceCanvas.focus();
    runChoiceTrial();
  }

  function runChoiceTrial() {
    if (choiceState.trialNum >= CONFIG.choice.totalTrials) {
      showChoiceResults();
      return;
    }

    choiceState.phase = 'fixation';
    choiceDisplay.innerHTML = '<span class="experiment__fixation">+</span>';

    // Randomly select stimulus
    const stimIndex = Math.random() < 0.5 ? 0 : 1;
    choiceState.currentStimulus = CONFIG.choice.colors[stimIndex];

    const fixationDuration = randomInt(CONFIG.choice.fixationMin, CONFIG.choice.fixationMax);

    choiceState.timeoutId = setTimeout(() => {
      choiceState.phase = 'stimulus';
      choiceDisplay.innerHTML = `<div class="experiment__stimulus ${choiceState.currentStimulus.className}"></div>`;
      choiceState.stimulusOnset = performance.now();
    }, fixationDuration);
  }

  function handleChoiceResponse(key) {
    if (!choiceState.running || choiceState.phase !== 'stimulus') return;

    const rt = performance.now() - choiceState.stimulusOnset;
    const correct = key === choiceState.currentStimulus.key;

    choiceState.data.push({
      trial: choiceState.trialNum + 1,
      stimulus: choiceState.currentStimulus.label,
      stimulusColor: choiceState.currentStimulus.className.includes('red') ? '🔴' : '🔵',
      expectedKey: choiceState.currentStimulus.key.toUpperCase(),
      responseKey: key.toUpperCase(),
      rt: Math.round(rt * 100) / 100,
      correct: correct,
    });

    choiceState.trialNum++;
    choiceProgressBar.style.width = `${(choiceState.trialNum / CONFIG.choice.totalTrials) * 100}%`;

    // Brief feedback
    if (correct) {
      choiceDisplay.innerHTML = `<p style="color: #10B981; font-size: 1.5rem; font-family: var(--font-mono);">${Math.round(rt)} ms ✓</p>`;
    } else {
      choiceDisplay.innerHTML = `<p style="color: #EF4444; font-size: 1.5rem;">오답 ✗</p>`;
    }

    setTimeout(() => {
      runChoiceTrial();
    }, 800);
  }

  function showChoiceResults() {
    choiceState.running = false;
    choiceState.phase = 'results';

    const correctTrials = choiceState.data.filter((d) => d.correct);
    const correctRTs = correctTrials.map((d) => d.rt);
    const avgRT = mean(correctRTs);
    const sdRT = stdDev(correctRTs);
    const accuracy = (correctTrials.length / choiceState.data.length) * 100;
    const minRT = correctRTs.length > 0 ? Math.min(...correctRTs) : 0;
    const maxRT = correctRTs.length > 0 ? Math.max(...correctRTs) : 0;

    // Google Sheets 연동 전송
    if (CONFIG.gasUrl && CONFIG.gasUrl.includes('script.google.com')) {
      fetch(CONFIG.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          task: 'ChoiceRT',
          sex: choiceState.subjectInfo.sex,
          age: choiceState.subjectInfo.age,
          avgRT: Math.round(avgRT),
          accuracy: accuracy.toFixed(0) + '%',
          rts: choiceState.data.map(d => d.rt.toFixed(1) + (d.correct ? '' : '(X)')).join(', ')
        })
      }).catch(e => console.error("Google Sheets 전송 중 에러 발생:", e));
    }

    choiceDisplay.innerHTML = '';

    choiceControls.innerHTML = `
      <div class="experiment__results">
        <div class="experiment__results-header">
          <h3>📊 실험 결과 — 선택 반응시간</h3>
          <p style="color: var(--color-text-secondary);">총 ${CONFIG.choice.totalTrials}회 시행 완료</p>
        </div>
        
        <div class="experiment__results-stats">
          <div class="experiment__stat-card">
            <div class="experiment__stat-card-value">${Math.round(avgRT)}</div>
            <div class="experiment__stat-card-unit">ms</div>
            <div class="experiment__stat-card-label">평균 RT (정답만)</div>
          </div>
          <div class="experiment__stat-card">
            <div class="experiment__stat-card-value">${Math.round(sdRT)}</div>
            <div class="experiment__stat-card-unit">ms</div>
            <div class="experiment__stat-card-label">표준편차</div>
          </div>
          <div class="experiment__stat-card">
            <div class="experiment__stat-card-value">${accuracy.toFixed(0)}</div>
            <div class="experiment__stat-card-unit">%</div>
            <div class="experiment__stat-card-label">정확도</div>
          </div>
          <div class="experiment__stat-card">
            <div class="experiment__stat-card-value">${correctTrials.length}/${choiceState.data.length}</div>
            <div class="experiment__stat-card-unit"></div>
            <div class="experiment__stat-card-label">정답/전체</div>
          </div>
        </div>

        <div class="experiment__trial-list">
          <div class="experiment__trial-row experiment__trial-row--header">
            <span>시행</span>
            <span>자극</span>
            <span>반응시간</span>
            <span>정확</span>
          </div>
          ${choiceState.data
            .map(
              (d) => `
            <div class="experiment__trial-row">
              <span>${d.trial}</span>
              <span>${d.stimulusColor} → ${d.responseKey}</span>
              <span class="experiment__trial-rt">${d.rt.toFixed(1)} ms</span>
              <span class="${d.correct ? 'experiment__trial-correct' : 'experiment__trial-incorrect'}">
                ${d.correct ? '✓' : '✗'}
              </span>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="experiment__btn-group" style="margin-top: 24px;">
          <button class="btn btn--primary" onclick="window.__cnlab_downloadCSV('choice')">
            <span class="btn__icon">📥</span>
            CSV 다운로드
          </button>
          <button class="btn btn--outline" onclick="window.__cnlab_resetChoice()">
            다시 하기
          </button>
        </div>
      </div>
    `;
  }

  function resetChoice() {
    choiceState = { running: false, trialNum: 0, data: [], stimulusOnset: 0, phase: 'idle', currentStimulus: null, timeoutId: null };
    if (choiceState.timeoutId) clearTimeout(choiceState.timeoutId);

    choiceDisplay.innerHTML = `
      <div class="experiment__info">
        <h3>🔴🔵 선택 반응시간 과제</h3>
        <p style="color: var(--color-text-secondary);">Choice Reaction Time Task</p>
      </div>
    `;

    choiceControls.innerHTML = `
      <div class="experiment__participant-info" style="background: var(--color-bg-tertiary); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; gap: 16px; align-items: center; border: 1px solid var(--color-border); flex-wrap: wrap;">
        <label style="font-weight: 600; color: var(--color-text); font-size: 0.9rem;">성별:</label>
        <select id="choice-subj-sex" style="padding: 6px 12px; border-radius: 4px; border: 1px solid var(--color-border); font-family: inherit; font-size: 0.9rem;">
          <option value="">선택</option>
          <option value="남성">남성</option>
          <option value="여성">여성</option>
          <option value="기타">기타</option>
        </select>
        <label style="font-weight: 600; color: var(--color-text); font-size: 0.9rem;">만 나이:</label>
        <input type="number" id="choice-subj-age" placeholder="예: 25" min="1" max="100" style="padding: 6px 12px; width: 80px; border-radius: 4px; border: 1px solid var(--color-border); font-family: inherit; font-size: 0.9rem;">
      </div>
      <div class="experiment__instructions">
        <strong>📋 실험 방법:</strong><br>
        1. 시작 버튼을 누르면 화면 중앙에 <strong>+</strong> 기호가 나타납니다.<br>
        2. <strong style="color: #EF4444;">빨간색 원</strong>이 나타나면 → <strong>F</strong> 키를 누르세요.<br>
        3. <strong style="color: #3B82F6;">파란색 원</strong>이 나타나면 → <strong>J</strong> 키를 누르세요.<br>
        4. 총 <strong>20회</strong> 시행을 완료한 후 결과가 표시됩니다.
      </div>
      <div class="experiment__progress" id="choice-rt-progress" style="display: none;">
        <div class="experiment__progress-bar" id="choice-rt-progress-bar" style="width: 0%;"></div>
      </div>
      <div class="experiment__btn-group">
        <button class="btn btn--primary" id="btn-start-choice">
          <span class="btn__icon">▶</span>
          실험 시작
        </button>
      </div>
    `;

    document.getElementById('btn-start-choice').addEventListener('click', startChoiceRT);
  }

  // ===== CSV Download =====
  function downloadCSV(type) {
    let data, filename;

    if (type === 'simple') {
      data = simpleState.data;
      filename = `CNLab_SimpleRT_${new Date().toISOString().slice(0, 10)}.csv`;
    } else {
      data = choiceState.data;
      filename = `CNLab_ChoiceRT_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ===== Keyboard Event Handler =====
  document.addEventListener('keydown', (e) => {
    // Prevent default for experiment keys
    if (simpleState.running || choiceState.running) {
      if (e.key === ' ' || e.key === 'f' || e.key === 'j') {
        e.preventDefault();
      }
    }

    // Simple RT response (spacebar)
    if (simpleState.running && e.key === ' ') {
      handleSimpleResponse();
    }

    // Choice RT response (f or j)
    if (choiceState.running && (e.key === 'f' || e.key === 'j')) {
      handleChoiceResponse(e.key);
    }
  });

  // ===== Event Listeners =====
  btnStartSimple.addEventListener('click', startSimpleRT);
  btnStartChoice.addEventListener('click', startChoiceRT);

  // ===== Expose to global for HTML onclick =====
  window.__cnlab_downloadCSV = downloadCSV;
  window.__cnlab_resetSimple = resetSimple;
  window.__cnlab_resetChoice = resetChoice;
})();
