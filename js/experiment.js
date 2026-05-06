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

  // ==========================================
  // Stroop Task Demo (with anti-spam, scoring, leaderboard)
  // ==========================================
  var STROOP_MIN_RT = 200; // ms — responses faster than this are "spam"
  var STROOP_TOTAL = 15;   // number of trials

  function openStroopDemo() {
    ensureModal();
    injectScopedStyle();
    var modal = document.getElementById('exp-demo-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    var isMobile = window.innerWidth <= 768 || navigator.userAgent.match(/Android|iPhone|iPad|iPod/i);
    var mobileWarning = isMobile ? '<div style="margin-top:12px;color:#ef4444;font-weight:700;">⚠️ 키보드가 필요한 실험이므로 모바일/태블릿 기기에서는 참여할 수 없습니다. (PC 전용)</div>' : '';
    var btnDisabled = isMobile ? 'disabled style="cursor:not-allowed;background:#94a3b8;border:none;width:100%;"' : 'style="cursor:pointer;background:#ef4444;border:none;width:100%;"';

    var controls = document.getElementById('exp-demo-controls');
    controls.innerHTML =
      '<div style="background:var(--color-bg-secondary,#f8fafc);padding:16px;border-radius:8px;border-left:4px solid #ef4444;margin-bottom:16px;font-size:0.9rem;line-height:1.6;color:var(--color-text);">' +
        '<strong>📋 스트룹 과제 안내</strong><br>' +
        '글자의 <b>의미는 무시</b>하고 <b>색상</b>에 맞는 키를 누르세요.<br>' +
        '🔴 빨간 글자 → <kbd style="padding:2px 6px;background:#334155;border-radius:4px;color:#fff;">R</kbd> &nbsp; ' +
        '🟢 초록 글자 → <kbd style="padding:2px 6px;background:#334155;border-radius:4px;color:#fff;">G</kbd> &nbsp; ' +
        '🔵 파란 글자 → <kbd style="padding:2px 6px;background:#334155;border-radius:4px;color:#fff;">B</kbd><br>' +
        '⚠️ 200ms 미만의 반응은 무효 처리됩니다 (키 연타 방지).' +
        mobileWarning +
      '</div>' +
      '<div id="start-leaderboard" style="text-align:left;background:var(--color-bg-secondary);padding:16px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:16px;">' +
        '<h4 style="margin:0 0 8px;font-size:0.95rem;">🏆 실시간 Top 10 랭킹 로딩 중...</h4>' +
      '</div>' +
      '<button class="btn btn--primary" id="btn-start-stroop" ' + btnDisabled + '>' +
        '▶ 스트룹 과제 시작 (' + STROOP_TOTAL + '회)' +
      '</button>';

    if (!isMobile) {
      document.getElementById('btn-start-stroop').addEventListener('click', startStroopTask);
    }
    
    document.getElementById('exp-demo-display').innerHTML =
      '<div style="text-align:center;color:var(--color-text-secondary);font-size:0.95rem;">안내사항을 읽고 시작 버튼을 누르세요</div>';

    // Fetch and show global leaderboard on start
    fetchGlobalLeaderboard().then(function(lb) {
      var lbContainer = document.getElementById('start-leaderboard');
      if (lbContainer) {
        lbContainer.innerHTML = '<h4 style="margin:0 0 8px;font-size:0.95rem;">🌍 실시간 명예의 전당</h4>' + buildLeaderboardHTML(lb);
      }
    });
  }

  function startStroopTask() {
    trialData = [];
    var display = document.getElementById('exp-demo-display');
    var controls = document.getElementById('exp-demo-controls');
    display.innerHTML = '';

    var jsPsych = initJsPsych({
      display_element: 'exp-demo-display',
      on_finish: function () { renderStroopResults(controls, display); },
    });

    var colors = ['red', 'green', 'blue'];
    var hexMap = { red: '#ef4444', green: '#10b981', blue: '#3b82f6' };
    var words = ['빨강', '초록', '파랑'];
    var keyMap = ['r', 'g', 'b'];

    var trials = [];
    for (var i = 0; i < STROOP_TOTAL; i++) {
      var isCongruent = Math.random() > 0.5;
      var colorIdx = Math.floor(Math.random() * 3);
      var wordIdx = isCongruent ? colorIdx : (colorIdx + 1 + Math.floor(Math.random() * 2)) % 3;
      trials.push({ word: words[wordIdx], color: colors[colorIdx], correct_key: keyMap[colorIdx], congruent: isCongruent });
    }

    var timeline = [];
    for (var ti = 0; ti < trials.length; ti++) {
      (function(t, idx) {
        // fixation
        timeline.push({
          type: jsPsychHtmlKeyboardResponse,
          stimulus: '<div style="font-size:4rem;color:#64748b;font-weight:300;">+</div>',
          choices: 'NO_KEYS',
          trial_duration: 500
        });
        // stimulus
        var stim = '<div style="font-size:5rem;font-weight:900;color:' + hexMap[t.color] + ';">' + t.word + '</div>';
        timeline.push({
          type: jsPsychHtmlKeyboardResponse,
          stimulus: stim,
          choices: ['r', 'g', 'b'],
          data: { task: 'stroop', congruent: t.congruent, correct_key: t.correct_key },
          on_finish: function(data) {
            // Fix: compare directly instead of jsPsych.pluginAPI.compareKeys to prevent crash on wrong answer
            var isCorrect = (data.response === data.correct_key);
            var isTooFast = data.rt < STROOP_MIN_RT;
            trialData.push({
              trial: idx + 1,
              rt: Math.round(data.rt),
              correct: isCorrect && !isTooFast,
              tooFast: isTooFast,
              congruent: t.congruent
            });
          }
        });
      })(trials[ti], ti);
    }

    jsPsych.run(timeline);
  }

  /**
   * Stroop Score Formula:
   *   score = accuracyScore(40) + speedScore(40) + consistencyScore(20)
   *
   * accuracyScore = (correctTrials / totalTrials) * 40
   * speedScore    = max(0, 40 * (1 - avgRT/2000))         // 2000ms baseline
   * consistencyScore = max(0, 20 * (1 - stdDev(RTs)/500)) // low variance = good
   *
   * Penalties: tooFast trials count as incorrect
   */
  function calcStroopScore(data) {
    var total = data.length;
    var validCorrect = data.filter(function(d) { return d.correct; });
    var accuracy = validCorrect.length / total;

    var rts = validCorrect.map(function(d) { return d.rt; });
    var avgRT = rts.length > 0 ? mean(rts) : 2000;
    var sd = rts.length > 1 ? stdDev(rts) : 500;

    var accuracyScore = accuracy * 40;
    var speedScore = Math.max(0, 40 * (1 - avgRT / 2000));
    var consistencyScore = Math.max(0, 20 * (1 - sd / 500));

    return Math.round(accuracyScore + speedScore + consistencyScore);
  }

  // ===== Global Leaderboard (JSONBlob) =====
  var JSONBLOB_URL = 'https://jsonblob.com/api/jsonBlob/019dfc03-c4e6-7935-8483-8ef1300a169a';

  function fetchGlobalLeaderboard() {
    return fetch(JSONBLOB_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
      .then(function(res) { 
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json(); 
      })
      .then(function(globalLb) {
        // Merge with local to preserve old records if any
        var localLb = getLocalLeaderboard();
        var merged = globalLb.concat(localLb);
        
        // Remove duplicates by name and score
        var unique = [];
        var seen = {};
        for (var i = 0; i < merged.length; i++) {
          var key = merged[i].name + '_' + merged[i].score;
          if (!seen[key]) {
            seen[key] = true;
            unique.push(merged[i]);
          }
        }
        unique.sort(function(a, b) { return b.score - a.score; });
        if (unique.length > 10) unique = unique.slice(0, 10);
        return unique;
      })
      .catch(function(e) { 
        console.warn('Global LB fetch failed:', e);
        return getLocalLeaderboard(); 
      });
  }

  function getLocalLeaderboard() {
    try { return JSON.parse(localStorage.getItem('cnlab_stroop_leaderboard')) || []; }
    catch(e) { return []; }
  }

  function saveToLeaderboard(name, score, accuracy) {
    return fetchGlobalLeaderboard().then(function(lb) {
      lb.push({ name: name, score: score, accuracy: accuracy, date: new Date().toLocaleDateString('ko-KR') });
      lb.sort(function(a, b) { return b.score - a.score; });
      if (lb.length > 10) lb = lb.slice(0, 10);
      
      localStorage.setItem('cnlab_stroop_leaderboard', JSON.stringify(lb));
      
      return fetch(JSONBLOB_URL, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(lb)
      }).then(function(res) { 
        return lb; 
      }).catch(function(e) { 
        console.warn('Global LB save failed:', e);
        return lb; 
      });
    });
  }

  function buildLeaderboardHTML(lb) {
    if (lb.length === 0) return '<p style="color:var(--color-text-secondary);font-size:0.85rem;">아직 기록이 없습니다.</p>';
    var html = '<table style="width:100%;border-collapse:collapse;font-size:0.85rem;margin-top:8px;">';
    html += '<tr style="border-bottom:1px solid var(--color-border);">' +
      '<th style="padding:6px 4px;text-align:center;width:30px;">🏅</th>' +
      '<th style="padding:6px 4px;text-align:left;">이름</th>' +
      '<th style="padding:6px 4px;text-align:center;">점수</th>' +
      '<th style="padding:6px 4px;text-align:center;">정확도</th>' +
      '<th style="padding:6px 4px;text-align:right;">날짜</th></tr>';
    for (var i = 0; i < lb.length; i++) {
      var medal = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : (i + 1)));
      html += '<tr style="border-bottom:1px solid var(--color-border,#333);">' +
        '<td style="padding:6px 4px;text-align:center;">' + medal + '</td>' +
        '<td style="padding:6px 4px;">' + lb[i].name + '</td>' +
        '<td style="padding:6px 4px;text-align:center;font-weight:700;">' + lb[i].score + '</td>' +
        '<td style="padding:6px 4px;text-align:center;">' + lb[i].accuracy + '%</td>' +
        '<td style="padding:6px 4px;text-align:right;color:var(--color-text-tertiary,#999);font-size:0.8rem;">' + lb[i].date + '</td></tr>';
    }
    html += '</table>';
    return html;
  }

  function renderStroopResults(controls, display) {
    var validTrials = trialData.filter(function(d) { return !d.tooFast; });
    var spamCount = trialData.filter(function(d) { return d.tooFast; }).length;
    var correctTrials = trialData.filter(function(d) { return d.correct; });
    var accuracy = trialData.length > 0 ? Math.round((correctTrials.length / trialData.length) * 100) : 0;

    var congRTs = trialData.filter(function(d) { return d.correct && d.congruent; }).map(function(d) { return d.rt; });
    var incongRTs = trialData.filter(function(d) { return d.correct && !d.congruent; }).map(function(d) { return d.rt; });
    var avgCong = congRTs.length ? Math.round(mean(congRTs)) : 0;
    var avgIncong = incongRTs.length ? Math.round(mean(incongRTs)) : 0;
    var stroopEffect = avgIncong - avgCong;
    var score = calcStroopScore(trialData);

    var feedback;
    if (score >= 90) {
      feedback = '🔥 <b>신의 경지!</b> 엄청난 인지 제어 능력입니다. 상위 1% 수준의 놀라운 집중력!';
    } else if (score >= 80) {
      feedback = '🚀 <b>매우 우수함!</b> 상위 10% 안에 드는 뛰어난 억제 조절 능력을 가졌습니다.';
    } else if (score >= 60) {
      feedback = '👍 <b>평균 이상!</b> 준수한 반응 속도와 정확도를 보여주었습니다.';
    } else if (score >= 40) {
      feedback = '🤔 <b>일반적인 수준!</b> 스트룹 간섭 효과에 정직하게 반응하셨군요. 다시 도전해보세요!';
    } else {
      feedback = '😅 <b>앗, 아쉽습니다.</b> 글자의 의미에 조금 휘둘렸을 수 있어요. 집중해서 재도전!';
    }

    var spamWarn = spamCount > 0 ? '<p style="color:#ef4444;font-size:0.8rem;">⚠️ ' + spamCount + '개 시행이 너무 빨라 무효 처리됨 (200ms 미만)</p>' : '';

    var scoreBg = score >= 80 ? '#dcfce7' : (score >= 60 ? '#fef08a' : '#fee2e2');

    display.innerHTML = '<div style="text-align:center;padding:20px;">결과 분석 중...</div>';

    fetchGlobalLeaderboard().then(function(lb) {
      display.innerHTML = '';
      controls.innerHTML =
      '<div style="padding:8px 0;text-align:center;">' +
        '<h3 style="font-size:1.5rem;font-weight:700;margin-bottom:4px;">🎯 스트룹 과제 결과</h3>' +
        spamWarn +
        '<div style="background:' + scoreBg + ';padding:20px;border-radius:12px;margin:16px 0;">' +
          '<div style="font-size:0.85rem;color:#4a5568;font-weight:600;">종합 점수</div>' +
          '<div style="font-size:3rem;font-weight:900;color:#1a202c;">' + score + '<span style="font-size:1rem;"> / 100</span></div>' +
          '<p style="margin:8px 0 0;font-size:0.85rem;color:#4a5568;">' + feedback + '</p>' +
        '</div>' +
        '<div style="display:flex;justify-content:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">' +
          '<div style="background:var(--color-bg-secondary);padding:12px;border-radius:10px;border:1px solid var(--color-border);min-width:90px;">' +
            '<div style="font-size:0.75rem;color:var(--color-text-secondary);">정확도</div>' +
            '<div style="font-size:1.3rem;font-weight:700;">' + accuracy + '%</div>' +
          '</div>' +
          '<div style="background:var(--color-bg-secondary);padding:12px;border-radius:10px;border:1px solid var(--color-border);min-width:90px;">' +
            '<div style="font-size:0.75rem;color:var(--color-text-secondary);">일치 RT</div>' +
            '<div style="font-size:1.3rem;font-weight:700;">' + avgCong + 'ms</div>' +
          '</div>' +
          '<div style="background:var(--color-bg-secondary);padding:12px;border-radius:10px;border:1px solid var(--color-border);min-width:90px;">' +
            '<div style="font-size:0.75rem;color:var(--color-text-secondary);">불일치 RT</div>' +
            '<div style="font-size:1.3rem;font-weight:700;">' + avgIncong + 'ms</div>' +
          '</div>' +
          '<div style="background:var(--color-bg-secondary);padding:12px;border-radius:10px;border:1px solid var(--color-border);min-width:90px;">' +
            '<div style="font-size:0.75rem;color:var(--color-text-secondary);">간섭 효과</div>' +
            '<div style="font-size:1.3rem;font-weight:700;">' + Math.round(stroopEffect) + 'ms</div>' +
          '</div>' +
        '</div>' +
        '<div style="margin-bottom:16px;">' +
          '<input id="stroop-name" type="text" placeholder="닉네임을 입력하세요" maxlength="10" style="width:100%;padding:10px 12px;border:1px solid var(--color-border);border-radius:8px;background:var(--color-bg-secondary);color:var(--color-text);font-size:0.9rem;box-sizing:border-box;margin-bottom:8px;" />' +
          '<button class="btn btn--primary" id="btn-save-stroop" style="width:100%;background:#8b5cf6;border:none;cursor:pointer;">🏆 랭킹 등록</button>' +
        '</div>' +
        '<div id="stroop-leaderboard" style="text-align:left;background:var(--color-bg-secondary);padding:16px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:16px;">' +
          '<h4 style="margin:0 0 8px;font-size:0.95rem;">🌍 실시간 명예의 전당</h4>' +
          buildLeaderboardHTML(lb) +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
          '<button class="btn btn--primary" onclick="window.__cnlab_openStroopDemo()" style="flex:1;">다시 하기</button>' +
          '<button class="btn btn--outline" onclick="window.__cnlab_closeExpDemo()" style="flex:1;">닫기</button>' +
        '</div>' +
        '</div>' +
      '</div>';

      document.getElementById('btn-save-stroop').addEventListener('click', function() {
        var nameInput = document.getElementById('stroop-name');
        var name = (nameInput.value || '').trim();
        if (!name) { nameInput.style.borderColor = '#ef4444'; nameInput.focus(); return; }
        
        document.getElementById('btn-save-stroop').disabled = true;
        document.getElementById('btn-save-stroop').textContent = '⏳ 서버에 저장 중...';

        saveToLeaderboard(name, score, accuracy).then(function(newLb) {
          document.getElementById('stroop-leaderboard').innerHTML =
            '<h4 style="margin:0 0 8px;font-size:0.95rem;">🌍 실시간 명예의 전당</h4>' + buildLeaderboardHTML(newLb);
          document.getElementById('btn-save-stroop').textContent = '✅ 등록 완료!';
        });
      });
    });
  }

  // ===== Global API =====
  window.__cnlab_openExpDemo = openExpDemo;
  window.__cnlab_closeExpDemo = closeExpDemo;
  window.__cnlab_downloadDemoCSV = downloadCSV;
  window.__cnlab_openStroopDemo = openStroopDemo;

})();
