/**
 * CNLab — Brain Playground Module
 * 1. 3D Brain Explorer (NiiVue)
 * 2. Brain Persona Test (Quiz)
 */
(function () {
  'use strict';

  // ==========================================
  // 1 & 3: 3D Brain Explorer (NiiVue)
  // ==========================================
  var brainInitialized = false;

  function ensureBrainModal() {
    if (document.getElementById('brain-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'brain-modal';
    modal.className = 'experiment-modal';
    modal.innerHTML =
      '<div class="experiment-modal__overlay" onclick="window.__cnlab_closeBrainExplorer()"></div>' +
      '<div class="experiment-modal__content" style="max-width: 800px; width: 90%; padding: 0; overflow: hidden; background: #111;">' +
        '<button onclick="window.__cnlab_closeBrainExplorer()" style="position:absolute;top:12px;right:16px;background:rgba(0,0,0,0.5);border:none;font-size:1.5rem;cursor:pointer;color:#fff;z-index:10;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">✕</button>' +
        '<div style="height: 60vh; position: relative;">' +
          '<canvas id="gl" style="width: 100%; height: 100%; display: block;"></canvas>' +
          '<div id="brain-quiz-ui" style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 16px; border-radius: 12px; font-size: 1rem; pointer-events: none; text-align: center; border: 1px solid rgba(255,255,255,0.2);">' +
            '⏳ 뇌 모델을 불러오는 중입니다...' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
  }

  async function initBrainExplorer() {
    if (brainInitialized) return;
    const canvas = document.getElementById('gl');
    if (!canvas) return;

    if (!window.niivue) {
      console.warn('NiiVue library not found on window object.');
      const ui = document.getElementById('brain-quiz-ui');
      if (ui) ui.innerHTML = '⚠️ 3D 뇌 모델을 불러올 수 없습니다. (라이브러리 로드 실패)';
      return;
    }
    var Niivue = window.niivue.Niivue;

    const brainRegions = {
      0: { name: '배경', desc: '뇌 밖의 영역입니다. 뇌 위를 클릭해보세요!' },
      1: { name: '전두엽 (Frontal Lobe)', desc: '🧐 계획, 판단, 의사결정을 담당하는 당신 두뇌의 CEO!' },
      2: { name: '측두엽 (Temporal Lobe)', desc: '👂 소리를 듣고 언어를 이해하며 기억을 떠올리는 영역!' },
      3: { name: '두정엽 (Parietal Lobe)', desc: '✋ 촉각, 온도, 공간 감각을 처리하는 내비게이터!' },
      4: { name: '후두엽 (Occipital Lobe)', desc: '👀 눈으로 본 것을 이미지로 해석하는 시각 처리 센터!' },
      5: { name: '해마 (Hippocampus)', desc: '💾 어제 점심 메뉴를 기억하게 해주는 기억의 저장소!' },
      6: { name: '편도체 (Amygdala)', desc: '🔥 공포, 분노, 기쁨을 감지하는 감정 경보 시스템!' },
      7: { name: '소뇌 (Cerebellum)', desc: '🤸 균형 잡기, 운동 협응을 정밀하게 조절하는 운동 전문가!' },
    };

    const nv = new Niivue({
      dragAndDropEnabled: false,
      backColor: [0.08, 0.08, 0.12, 1],
      show3Dcrosshair: false,
      onLocationChange: handleLocationChange,
    });

    nv.attachTo('gl');

    const meshList = [
      {
        url: 'models/BrainMesh_ICBM152.lh.mz3',
        rgba255: [220, 220, 225, 255], // Light gray bone/brain color
      }
    ];

    try {
      await nv.loadMeshes(meshList);
      // Removed slice type and clip plane because meshes are pure 3D
      nv.setClipPlane([0, 0, 0]); // no clipping
      brainInitialized = true;
      const ui = document.getElementById('brain-quiz-ui');
      if (ui) ui.innerHTML = '✅ 뇌 모델 로드 완료! 마우스로 돌려보고 <b>표면을 클릭</b>해보세요.';
    } catch (e) {
      console.error('NiiVue load error:', e);
      const ui = document.getElementById('brain-quiz-ui');
      if (ui) ui.innerHTML = '⚠️ 뇌 모델을 불러오는 중 오류가 발생했습니다.';
    }

    function handleLocationChange(data) {
      const ui = document.getElementById('brain-quiz-ui');
      if (!ui || !data.mm) return;

      const [x, y, z] = data.mm;

      // If clicked far outside, show default
      if (x === 0 && y === 0 && z === 0) {
        ui.innerHTML = '마우스로 뇌를 돌려보고, <b>관심 있는 겉면 부위를 클릭</b>하세요!';
        return;
      }

      // Coordinate-based heuristic for brain lobes (MNI space)
      let regionKey = 0; // background
      if (y > 20) {
        regionKey = 1; // Frontal
      } else if (y < -50 && z > -10) {
        regionKey = 4; // Occipital
      } else if (y < -40 && z <= -10) {
        regionKey = 7; // Cerebellum
      } else if (y > -50 && y <= 20 && z > 30) {
        regionKey = 3; // Parietal
      } else if (y > -50 && y <= 20 && z <= 30 && Math.abs(x) > 30) {
        regionKey = 2; // Temporal
      } else if (Math.abs(x) <= 30 && z < 10 && y > -30 && y < 10) {
        // Inner parts (rough estimate)
        regionKey = (y < -10) ? 5 : 6; // Hippocampus or Amygdala
      } else {
        regionKey = 3; // Default to Parietal for mid-top
      }

      const region = brainRegions[regionKey];
      ui.innerHTML = '<b style="font-size:1.2em;color:#38bdf8;">' + region.name + '</b><br><span style="color:#e2e8f0;margin-top:4px;display:inline-block;">' + region.desc + '</span><br><span style="font-size:0.7em;color:#94a3b8;">(좌표: ' + Math.round(x) + ', ' + Math.round(y) + ', ' + Math.round(z) + ')</span>';
    }
  }

  window.__cnlab_openBrainExplorer = function() {
    ensureBrainModal();
    var modal = document.getElementById('brain-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    initBrainExplorer();
  };

  window.__cnlab_closeBrainExplorer = function() {
    var modal = document.getElementById('brain-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // ==========================================
  // 4: Brain Persona Test
  // ==========================================
  function ensurePersonaModal() {
    if (document.getElementById('persona-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'persona-modal';
    modal.className = 'experiment-modal';
    modal.innerHTML =
      '<div class="experiment-modal__overlay" onclick="window.__cnlab_closePersonaTest()"></div>' +
      '<div class="experiment-modal__content" style="max-width: 500px;">' +
        '<button onclick="window.__cnlab_closePersonaTest()" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--color-text-secondary);z-index:10;">✕</button>' +
        '<div id="persona-content"></div>' +
      '</div>';
    document.body.appendChild(modal);
  }

  var questions = [
    { q: "주말에 시간이 남을 때 당신은?", a: "철저하게 계획을 세워 움직인다", b: "끌리는 대로 즉흥적으로 행동한다", aScore: "PFC", bScore: "AMY" },
    { q: "친구가 슬퍼할 때 당신의 반응은?", a: "해결책을 찾아준다 (이성적)", b: "같이 공감하며 슬퍼한다 (감성적)", aScore: "PFC", bScore: "AMY" },
    { q: "새로운 정보를 배울 때 당신은?", a: "기록하고 반복해서 외운다", b: "그림이나 이미지로 연상한다", aScore: "HIPPO", bScore: "OCC" },
    { q: "위기 상황이 닥치면?", a: "침착하게 원인을 분석한다", b: "일단 본능적으로 피하고 본다", aScore: "PFC", bScore: "AMY" },
    { q: "과거의 추억을 떠올릴 때?", a: "그때의 감정과 분위기가 떠오른다", b: "구체적인 사실과 데이터가 떠오른다", aScore: "AMY", bScore: "HIPPO" }
  ];

  var currentQ = 0;
  var scores = { PFC: 0, AMY: 0, HIPPO: 0, OCC: 0 };

  function startPersonaQuiz() {
    currentQ = 0;
    scores = { PFC: 0, AMY: 0, HIPPO: 0, OCC: 0 };
    renderQuestion();
  }

  function renderQuestion() {
    var content = document.getElementById('persona-content');
    if (currentQ >= questions.length) {
      showResult();
      return;
    }
    var q = questions[currentQ];
    content.innerHTML =
      '<div style="text-align: center; margin-bottom: 20px;">' +
        '<span style="display:inline-block; background: var(--color-primary-light); color: var(--color-primary); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; margin-bottom: 12px;">Q' + (currentQ + 1) + ' / 5</span>' +
        '<h3 style="font-size: 1.2rem; font-weight: 700; line-height: 1.5;">' + q.q + '</h3>' +
      '</div>' +
      '<div style="display: flex; flex-direction: column; gap: 12px;">' +
        '<button class="persona-btn" data-score="' + q.aScore + '">' + q.a + '</button>' +
        '<button class="persona-btn" data-score="' + q.bScore + '">' + q.b + '</button>' +
      '</div>';

    var btns = document.querySelectorAll('.persona-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].style.cssText = "padding: 16px; border: 1px solid var(--color-border); background: var(--color-bg-secondary); border-radius: 12px; cursor: pointer; transition: all 0.2s; font-size: 0.95rem; text-align: left; color: var(--color-text);";
      btns[i].addEventListener('mouseover', function() { this.style.borderColor = "var(--color-primary)"; });
      btns[i].addEventListener('mouseout', function() { this.style.borderColor = "var(--color-border)"; });
      btns[i].addEventListener('click', function() {
        scores[this.dataset.score]++;
        currentQ++;
        renderQuestion();
      });
    }
  }

  function showResult() {
    var content = document.getElementById('persona-content');
    var maxRegion = 'PFC';
    var maxScore = -1;
    var entries = Object.entries(scores);
    for (var i = 0; i < entries.length; i++) {
      if (entries[i][1] > maxScore) { maxScore = entries[i][1]; maxRegion = entries[i][0]; }
    }

    var results = {
      PFC: { name: "전전두피질 (Prefrontal Cortex)", emoji: "🧐", desc: "이성적이고 계획적인 당신! 팀의 든든한 리더이자 문제 해결사입니다. 논리적인 판단을 즐깁니다." },
      AMY: { name: "편도체 (Amygdala)", emoji: "🔥", desc: "감수성이 풍부하고 직관적인 당신! 주변 분위기를 잘 파악하며 공감 능력이 뛰어납니다." },
      HIPPO: { name: "해마 (Hippocampus)", emoji: "💾", desc: "꼼꼼하고 기록을 좋아하는 당신! 스폰지 같은 학습 능력을 가졌습니다. 과거의 경험을 소중히 여깁니다." },
      OCC: { name: "후두엽 (Occipital Lobe)", emoji: "👀", desc: "시각적 감각이 뛰어난 당신! 예술적이고 창의적인 면모가 돋보입니다. 관찰력이 대단하군요!" }
    };

    var res = results[maxRegion];

    content.innerHTML =
      '<div style="text-align: center;">' +
        '<div style="font-size: 4rem; margin-bottom: 10px;">' + res.emoji + '</div>' +
        '<h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;">' + res.name + '</h2>' +
        '<p style="color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 24px; padding: 0 10px;">' + res.desc + '</p>' +
        '<div style="background: var(--color-bg-tertiary, #1e293b); padding: 16px; border-radius: 8px; margin-bottom: 20px;">' +
          '<p style="font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">이 뇌 영역이 궁금하다면?</p>' +
          '<a href="#research" class="btn btn--outline" style="width: 100%; display: inline-block; text-align: center; text-decoration: none;" onclick="window.__cnlab_closePersonaTest()">관련 연구 보러가기</a>' +
        '</div>' +
        '<button class="btn btn--primary" onclick="window.__cnlab_closePersonaTest()" style="width: 100%;">닫기</button>' +
      '</div>';
  }

  window.__cnlab_openPersonaTest = function() {
    ensurePersonaModal();
    var modal = document.getElementById('persona-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    var content = document.getElementById('persona-content');
    content.innerHTML =
      '<h3 style="font-size: 1.5rem; font-weight: 700; text-align: center; margin-bottom: 20px;">🧩 나와 닮은 뇌 영역은?</h3>' +
      '<p style="text-align: center; color: var(--color-text-secondary); margin-bottom: 30px;">간단한 5가지 질문으로 당신의 뇌 성격을 알아보세요!</p>' +
      '<button class="btn btn--primary" id="btn-start-persona" style="width: 100%;">테스트 시작하기</button>';
    document.getElementById('btn-start-persona').addEventListener('click', startPersonaQuiz);
  };

  window.__cnlab_closePersonaTest = function() {
    var modal = document.getElementById('persona-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

})();
