/**
 * CNLab Website — Experiment Demo Module (jsPsych v8 기반)
 * 단순 반응시간 과제 체험 (모달 팝업)
 *
 * "실험하기" 버튼 → 모달 열림 → 참여자 정보 입력 → 실험 시작
 * 사이트 레이아웃에 영향 없이 독립 모달 안에서 실험 진행
 */

(function () {
  'use strict';

  // ===== Configuration =====
  const CONFIG = {
    gasUrl: 'https://script.google.com/macros/s/AKfycbzS3bTGLFxdBolpiFB1vGhCVm9iwWDk3MmpzHqzLUQTcAkNeoUwK-_MxC2myurC2K_k/exec',
    simple: {
      totalTrials: 10,
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

  // ===== Create Modal HTML (once) =====
  function ensureModal() {
    if (document.getElementById('exp-demo-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'exp-demo-modal';
    modal.className = 'experiment-modal';
    modal.innerHTML = `
      <div class="experiment-modal__overlay" onclick="window.__cnlab_closeExpDemo()"></div>
      <div class="experiment-modal__content">
        <button onclick="window.__cnlab_closeExpDemo()" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--color-text-secondary);z-index:10;">✕</button>
        <div id="exp-demo-header" style="margin-bottom: 16px;">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--color-text); margin-bottom: 4px;">
            <span class="lang-ko">🧪 반응시간 실험 체험</span>
            <span class="lang-en">🧪 Reaction Time Demo</span>
          </h3>
          <p style="font-size: 0.9rem; color: var(--color-text-secondary);">Simple Reaction Time Task</p>
        </div>
        <div id="exp-demo-controls"></div>
        <div id="exp-demo-display" style="min-height: 280px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: var(--color-bg-secondary); margin-top: 16px; position: relative;">
          <div style="text-align: center; color: var(--color-text-secondary); font-size: 0.95rem;">
            <span class="lang-ko">위에서 정보를 입력하고 시작 버튼을 누르세요</span>
            <span class="lang-en">Enter info above and press Start</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // ===== Scoped jsPsych CSS =====
  function injectScopedStyle() {
    if (document.getElementById('jspsych-scoped-style')) return;
    const style = document.createElement('style');
    style.id = 'jspsych-scoped-style';
    style.textContent = `
      #exp-demo-display .jspsych-display-element,
      #exp-demo-display.jspsych-display-element {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
        height: 100% !important;
        min-height: 280px !important;
        background: transparent !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      #exp-demo-display .jspsych-content-wrapper {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
        height: 100% !important;
      }
      #exp-demo-display .jspsych-content {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        max-width: 100% !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ===== Open / Close Modal =====
  function openExpDemo() {
    ensureModal();
    injectScopedStyle();
    const modal = document.getElementById('exp-demo-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Build participant form
    const controls = document.getElementById('exp-demo-controls');
    controls.innerHTML = buildParticipantForm();
    document.getElementById('btn-start-demo').addEventListener('click', startSimpleRT);
    // Reset display
    document.getElementById('exp-demo-display').innerHTML = `
      <div style="text-align: center; color: var(--color-text-secondary); font-size: 0.95rem;">
        <span class="lang-ko">위에서 정보를 입력하고 시작 버튼을 누르세요</span>
        <span class="lang-en">Enter info above and press Start</span>
      </div>`;
  }

  function closeExpDemo() {
    const modal = document.getElementById('exp-demo-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      // Clear jsPsych display to stop any running experiment
      const display = document.getElementById('exp-demo-display');
      if (display) display.innerHTML = '';
    }
  }

  // ===== Participant Form =====
  function buildParticipantForm() {
    return `
      <div style="background: var(--color-bg-tertiary, #f1f5f9); padding: 16px; border-radius: 8px; margin-bottom: 12px; display: flex; gap: 16px; align-items: center; border: 1px solid var(--color-border); flex-wrap: wrap;">
        <label style="font-weight: 600; color: var(--color-text); font-size: 0.9rem;">
          <span class="lang-ko">성별:</span><span class="lang-en">Sex:</span>
        </label>
        <select id="demo-subj-sex" style="padding: 6px 12px; border-radius: 6px; border: 1px solid var(--color-border); font-family: inherit; font-size: 0.9rem; background: var(--color-bg-primary, #fff);">
          <option value="">선택</option>
          <option value="Male">남성 (Male)</option>
          <option value="Female">여성 (Female)</option>
          <option value="Other">기타 (Other)</option>
        </select>
        <label style="font-weight: 600; color: var(--color-text); font-size: 0.9rem;">
          <span class="lang-ko">만 나이:</span><span class="lang-en">Age:</span>
        </label>
        <input type="number" id="demo-subj-age" placeholder="Ex: 25" min="1" max="100" style="padding: 6px 12px; width: 80px; border-radius: 6px; border: 1px solid var(--color-border); font-family: inherit; font-size: 0.9rem; background: var(--color-bg-primary, #fff);">
      </div>
      <div style="background: var(--color-bg-secondary, #f8fafc); padding: 16px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 16px; font-size: 0.9rem; line-height: 1.6; color: var(--color-text);">
        <strong><span class="lang-ko">📋 실험 방법:</span><span class="lang-en">📋 Instructions:</span></strong><br>
        <span class="lang-ko">1. 시작 버튼을 누르면 화면 중앙에 <strong>+</strong> 기호가 나타납니다.</span><span class="lang-en">1. Press Start, and a <strong>+</strong> appears.</span><br>
        <span class="lang-ko">2. 잠시 후 <strong style="color:#10B981;">초록색 원</strong>이 나타나면 최대한 빨리 <strong>스페이스바</strong>를 누르세요.</span><span class="lang-en">2. When a <strong style="color:#10B981;">green circle</strong> appears, press <strong>Spacebar</strong> ASAP.</span><br>
        <span class="lang-ko">3. 총 <strong>${CONFIG.simple.totalTrials}회</strong> 시행을 완료한 후 결과가 표시됩니다.</span><span class="lang-en">3. Results are shown after completing <strong>${CONFIG.simple.totalTrials} trials</strong>.</span>
      </div>
      <div id="demo-progress" style="display: none; height: 6px; background: var(--color-border); border-radius: 3px; margin-bottom: 12px; overflow: hidden;">
        <div id="demo-progress-bar" style="width: 0%; height: 100%; background: #10b981; border-radius: 3px; transition: width 0.3s ease;"></div>
      </div>
      <button class="btn btn--primary" id="btn-start-demo" style="cursor: pointer;">
        <span class="btn__icon">▶</span>
        <span class="lang-ko">실험 시작</span><span class="lang-en">Start</span>
      </button>
    `;
  }

  // ===== Run Simple RT Experiment =====
  let trialData = [];

  function startSimpleRT() {
    const sex = document.getElementById('demo-subj-sex').value;
    const age = document.getElementById('demo-subj-age').value;
    if (!sex || !age) {
      alert('실험을 시작하기 전에 성별과 만 나이를 모두 입력해주세요.');
      return;
    }
    const subjectInfo = { sex, age };
    trialData = [];

    const display = document.getElementById('exp-demo-display');
    const controls = document.getElementById('exp-demo-controls');

    // Clear instruction text before jsPsych takes over
    display.innerHTML = '';

    const jsPsych = initJsPsych({
      display_element: 'exp-demo-display',
      on_finish: function () {
        sendToSheets(subjectInfo);
        renderResults(controls, display, subjectInfo);
      },
    });

    const timeline = [];
    const totalTrials = CONFIG.simple.totalTrials;

    for (let i = 0; i < totalTrials; i++) {
      // Fixation
      timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div style="font-size: 4rem; color: #64748b; font-weight: 300;">+</div>',
        choices: 'NO_KEYS',
        trial_duration: () => randomInt(CONFIG.simple.fixationMin, CONFIG.simple.fixationMax),
        data: { task: 'fixation' },
      });
      // Stimulus
      timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div style="width:100px;height:100px;border-radius:50%;background:#10B981;margin:auto;box-shadow:0 0 30px rgba(16,185,129,0.5);"></div>',
        choices: [' '],
        trial_duration: 2000,
        data: { task: 'simple-rt', trial_index: i + 1 },
        on_finish: function (data) {
          const rt = data.response === null ? null : Math.round(data.rt * 100) / 100;
          const correct = data.response !== null;
          trialData.push({ trial: i + 1, rt: rt ?? 0, correct });
          updateProgress(i + 1, totalTrials);
        },
      });
      // Feedback
      timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function () {
          const last = trialData[trialData.length - 1];
          if (!last || !last.correct) return '<p style="color:#EF4444;font-size:1.5rem;">시간 초과 ✗</p>';
          return `<p style="color:#10B981;font-size:1.5rem;font-family:monospace;">${Math.round(last.rt)} ms</p>`;
        },
        choices: 'NO_KEYS',
        trial_duration: 800,
        data: { task: 'feedback' },
      });
    }

    jsPsych.run(timeline);
  }

  // ===== Progress =====
  function updateProgress(current, total) {
    const progress = document.getElementById('demo-progress');
    const bar = document.getElementById('demo-progress-bar');
    if (progress && bar) {
      progress.style.display = 'block';
      bar.style.width = `${(current / total) * 100}%`;
    }
  }

  // ===== Results =====
  function renderResults(controls, display, subjectInfo) {
    const rts = trialData.filter(d => d.correct).map(d => d.rt);
    const avgRT = mean(rts);
    const sdRT = stdDev(rts);
    const minRT = rts.length > 0 ? Math.min(...rts) : 0;
    const maxRT = rts.length > 0 ? Math.max(...rts) : 0;

    display.innerHTML = '';
    controls.innerHTML = `
      <div style="padding: 8px 0;">
        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 4px;">📊 실험 결과</h3>
        <p style="color: var(--color-text-secondary); font-size: 0.9rem; margin-bottom: 16px;">총 ${trialData.length}회 시행 완료</p>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="text-align: center; padding: 16px 8px; background: var(--color-bg-secondary); border-radius: 10px; border: 1px solid var(--color-border);">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary);">${Math.round(avgRT)}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">ms</div>
            <div style="font-size: 0.8rem; font-weight: 600; margin-top: 4px;">평균 RT</div>
          </div>
          <div style="text-align: center; padding: 16px 8px; background: var(--color-bg-secondary); border-radius: 10px; border: 1px solid var(--color-border);">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary);">${Math.round(sdRT)}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">ms</div>
            <div style="font-size: 0.8rem; font-weight: 600; margin-top: 4px;">표준편차</div>
          </div>
          <div style="text-align: center; padding: 16px 8px; background: var(--color-bg-secondary); border-radius: 10px; border: 1px solid var(--color-border);">
            <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">${Math.round(minRT)}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">ms</div>
            <div style="font-size: 0.8rem; font-weight: 600; margin-top: 4px;">최소 RT</div>
          </div>
          <div style="text-align: center; padding: 16px 8px; background: var(--color-bg-secondary); border-radius: 10px; border: 1px solid var(--color-border);">
            <div style="font-size: 1.5rem; font-weight: 700; color: #f59e0b;">${Math.round(maxRT)}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">ms</div>
            <div style="font-size: 0.8rem; font-weight: 600; margin-top: 4px;">최대 RT</div>
          </div>
        </div>

        <details style="margin-bottom: 16px;">
          <summary style="cursor: pointer; font-weight: 600; font-size: 0.9rem; color: var(--color-text);">시행별 결과 보기</summary>
          <div style="margin-top: 8px; max-height: 200px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: 8px;">
            <div style="display: grid; grid-template-columns: 50px 50px 1fr 50px; padding: 8px 12px; font-weight: 600; font-size: 0.8rem; border-bottom: 1px solid var(--color-border); background: var(--color-bg-secondary);">
              <span>시행</span><span>자극</span><span>반응시간</span><span>정확</span>
            </div>
            ${trialData.map(d => `
              <div style="display: grid; grid-template-columns: 50px 50px 1fr 50px; padding: 6px 12px; font-size: 0.85rem; border-bottom: 1px solid var(--color-border);">
                <span>${d.trial}</span><span>🟢</span><span>${d.rt.toFixed(1)} ms</span><span>${d.correct ? '✓' : '✗'}</span>
              </div>
            `).join('')}
          </div>
        </details>

        <div style="display: flex; gap: 12px;">
          <button class="btn btn--primary" onclick="window.__cnlab_downloadDemoCSV()" style="cursor: pointer;">
            📥 CSV 다운로드
          </button>
          <button class="btn btn--outline" onclick="window.__cnlab_openExpDemo()" style="cursor: pointer;">
            다시 하기
          </button>
        </div>
      </div>
    `;
  }

  // ===== Google Sheets =====
  function sendToSheets(subjectInfo) {
    if (!CONFIG.gasUrl || !CONFIG.gasUrl.includes('script.google.com')) return;
    fetch(CONFIG.gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        task: 'SimpleRT',
        sex: subjectInfo.sex,
        age: subjectInfo.age,
        trials: trialData,
      }),
    }).catch(e => console.error('Google Sheets 전송 오류:', e));
  }

  // ===== CSV Download =====
  function downloadCSV() {
    if (!trialData || trialData.length === 0) return;
    const filename = `CNLab_SimpleRT_${new Date().toISOString().slice(0, 10)}.csv`;
    const headers = Object.keys(trialData[0]);
    const csvContent = [
      headers.join(','),
      ...trialData.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(',')),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ===== Global API =====
  window.__cnlab_openExpDemo = openExpDemo;
  window.__cnlab_closeExpDemo = closeExpDemo;
  window.__cnlab_downloadDemoCSV = downloadCSV;

})();
