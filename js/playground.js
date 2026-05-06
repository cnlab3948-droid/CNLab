import { Niivue } from 'https://niivue.github.io/niivue/features/niivue.js';

(function () {
  'use strict';

  // ==========================================
  // 1 & 3: 3D Brain Explorer (NiiVue)
  // ==========================================
  async function initBrainExplorer() {
    const canvas = document.getElementById('gl');
    if (!canvas) return;

    const nv = new Niivue({
      dragAndDropEnabled: false,
      backColor: [0.1, 0.1, 0.1, 1], // dark background
      show3Dcrosshair: true,
      onLocationChange: handleLocationChange
    });

    nv.attachTo('gl');

    // MNI 152 standard brain and AAL atlas
    const volumeList = [
      {
        url: 'https://niivue.github.io/niivue/images/mni152.nii.gz', // Main brain
        colorMap: 'gray',
        opacity: 1,
        visible: true,
      },
      {
        url: 'https://niivue.github.io/niivue/images/aal.nii.gz', // Atlas for regions
        colorMap: 'render_surf',
        opacity: 0.5,
        visible: true,
      }
    ];

    try {
      await nv.loadVolumes(volumeList);
      nv.setSliceType(nv.sliceTypeRender); // 3D view
      nv.setClipPlane([-0.1, 270, 0]); // slight clip to show inside
    } catch (e) {
      console.error('NiiVue load error:', e);
      document.getElementById('brain-quiz-ui').innerHTML = '뇌 모델을 불러오는 중 오류가 발생했습니다.';
    }

    // A mapping of some AAL indices to fun descriptions
    const brainRegions = {
      // Just a few examples; AAL has 116 regions
      'Frontal': '전두엽(Frontal Lobe): 당신의 계획과 성격을 담당하는 CEO입니다!',
      'Hippocampus': '해마(Hippocampus): 어제 점심 메뉴를 기억하게 해주는 기억의 저장소입니다.',
      'Amygdala': '편도체(Amygdala): 공포와 감정을 처리하는 감정 경보기입니다. "앗 호랑이다!"',
      'Occipital': '후두엽(Occipital Lobe): 눈으로 본 것을 이해하게 해주는 시각 처리 센터입니다.',
      'Temporal': '측두엽(Temporal Lobe): 소리를 듣고 언어를 이해하는 청각 및 언어 중추입니다.'
    };

    function handleLocationChange(data) {
      const ui = document.getElementById('brain-quiz-ui');
      if (!ui || !data.values || data.values.length < 2) return;
      
      const atlasValue = data.values[1].value;
      let text = "이 부위를 클릭했습니다!";
      
      // Simple mockup logic for regions (AAL indices are complex, so we map roughly by string parsing if possible, or just show a generic fun fact)
      // Since we don't have the full AAL mapping JSON loaded, we'll use a random fun fact for demonstration based on the atlas value modulo.
      if (atlasValue > 0) {
         const keys = Object.keys(brainRegions);
         const regionKey = keys[atlasValue % keys.length];
         text = `✨ <b>${brainRegions[regionKey]}</b>`;
      }

      ui.innerHTML = text;
    }
  }

  // ==========================================
  // 4: Brain Persona Test
  // ==========================================
  function ensurePersonaModal() {
    if (document.getElementById('persona-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'persona-modal';
    modal.className = 'experiment-modal';
    modal.innerHTML = `
      <div class="experiment-modal__overlay" onclick="window.__cnlab_closePersonaTest()"></div>
      <div class="experiment-modal__content" style="max-width: 500px;">
        <button onclick="window.__cnlab_closePersonaTest()" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--color-text-secondary);z-index:10;">✕</button>
        <div id="persona-content">
          <h3 style="font-size: 1.5rem; font-weight: 700; text-align: center; margin-bottom: 20px;">🧩 나와 닮은 뇌 영역은?</h3>
          <p style="text-align: center; color: var(--color-text-secondary); margin-bottom: 30px;">간단한 5가지 질문으로 당신의 뇌 성격을 알아보세요!</p>
          <button class="btn btn--primary" id="btn-start-persona" style="width: 100%;">테스트 시작하기</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('btn-start-persona').addEventListener('click', startPersonaQuiz);
  }

  const questions = [
    { q: "주말에 시간이 남을 때 당신은?", a: "철저하게 계획을 세워 움직인다", b: "끌리는 대로 즉흥적으로 행동한다", aScore: "PFC", bScore: "AMY" },
    { q: "친구가 슬퍼할 때 당신의 반응은?", a: "해결책을 찾아준다 (이성적)", b: "같이 공감하며 슬퍼한다 (감성적)", aScore: "PFC", bScore: "AMY" },
    { q: "새로운 정보를 배울 때 당신은?", a: "기록하고 반복해서 외운다", b: "그림이나 이미지로 연상한다", aScore: "HIPPO", bScore: "OCC" },
    { q: "위기 상황이 닥치면?", a: "침착하게 원인을 분석한다", b: "일단 본능적으로 피하고 본다", aScore: "PFC", bScore: "AMY" },
    { q: "과거의 추억을 떠올릴 때?", a: "그때의 감정과 분위기가 떠오른다", b: "구체적인 사실과 데이터가 떠오른다", aScore: "AMY", bScore: "HIPPO" }
  ];

  let currentQ = 0;
  let scores = { PFC: 0, AMY: 0, HIPPO: 0, OCC: 0 };

  function startPersonaQuiz() {
    currentQ = 0;
    scores = { PFC: 0, AMY: 0, HIPPO: 0, OCC: 0 };
    renderQuestion();
  }

  function renderQuestion() {
    const content = document.getElementById('persona-content');
    if (currentQ >= questions.length) {
      showResult();
      return;
    }
    const q = questions[currentQ];
    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="display:inline-block; background: var(--color-primary-light); color: var(--color-primary); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; margin-bottom: 12px;">Q${currentQ + 1} / 5</span>
        <h3 style="font-size: 1.2rem; font-weight: 700; line-height: 1.5;">${q.q}</h3>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button class="persona-btn" data-score="${q.aScore}">${q.a}</button>
        <button class="persona-btn" data-score="${q.bScore}">${q.b}</button>
      </div>
    `;

    document.querySelectorAll('.persona-btn').forEach(btn => {
      btn.style.cssText = "padding: 16px; border: 1px solid var(--color-border); background: var(--color-bg-secondary); border-radius: 12px; cursor: pointer; transition: all 0.2s; font-size: 0.95rem; text-align: left;";
      btn.addEventListener('mouseover', () => btn.style.borderColor = "var(--color-primary)");
      btn.addEventListener('mouseout', () => btn.style.borderColor = "var(--color-border)");
      btn.addEventListener('click', function() {
        scores[this.dataset.score]++;
        currentQ++;
        renderQuestion();
      });
    });
  }

  function showResult() {
    const content = document.getElementById('persona-content');
    // Find max score
    let maxRegion = 'PFC';
    let maxScore = -1;
    for (const [r, s] of Object.entries(scores)) {
      if (s > maxScore) { maxScore = s; maxRegion = r; }
    }

    const results = {
      PFC: { name: "전전두피질 (Prefrontal Cortex)", emoji: "🧐", desc: "이성적이고 계획적인 당신! 팀의 든든한 리더이자 문제 해결사입니다. 논리적인 판단을 즐깁니다.", link: "#research" },
      AMY: { name: "편도체 (Amygdala)", emoji: "🔥", desc: "감수성이 풍부하고 직관적인 당신! 주변 분위기를 잘 파악하며 공감 능력이 뛰어납니다.", link: "#research" },
      HIPPO: { name: "해마 (Hippocampus)", emoji: "💾", desc: "꼼꼼하고 기록을 좋아하는 당신! 스폰지 같은 학습 능력을 가졌습니다. 과거의 경험을 소중히 여깁니다.", link: "#research" },
      OCC: { name: "후두엽 (Occipital Lobe)", emoji: "👀", desc: "시각적 감각이 뛰어난 당신! 예술적이고 창의적인 면모가 돋보입니다. 관찰력이 대단하군요!", link: "#research" }
    };

    const res = results[maxRegion];

    content.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 10px;">${res.emoji}</div>
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;">${res.name}</h2>
        <p style="color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 24px; padding: 0 10px;">${res.desc}</p>
        
        <div style="background: var(--color-bg-tertiary); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">이 뇌 영역이 궁금하다면?</p>
          <a href="${res.link}" class="btn btn--outline" style="width: 100%; display: inline-block; text-align: center; text-decoration: none;" onclick="window.__cnlab_closePersonaTest()">관련 연구 보러가기</a>
        </div>
        
        <button class="btn btn--primary" onclick="window.__cnlab_closePersonaTest()" style="width: 100%;">닫기</button>
      </div>
    `;
  }

  window.__cnlab_openPersonaTest = function() {
    ensurePersonaModal();
    const modal = document.getElementById('persona-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const content = document.getElementById('persona-content');
    content.innerHTML = `
      <h3 style="font-size: 1.5rem; font-weight: 700; text-align: center; margin-bottom: 20px;">🧩 나와 닮은 뇌 영역은?</h3>
      <p style="text-align: center; color: var(--color-text-secondary); margin-bottom: 30px;">간단한 5가지 질문으로 당신의 뇌 성격을 알아보세요!</p>
      <button class="btn btn--primary" id="btn-start-persona" style="width: 100%;">테스트 시작하기</button>
    `;
    document.getElementById('btn-start-persona').addEventListener('click', startPersonaQuiz);
  };

  window.__cnlab_closePersonaTest = function() {
    const modal = document.getElementById('persona-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Init NiiVue on load if canvas exists
  window.addEventListener('DOMContentLoaded', initBrainExplorer);

})();
