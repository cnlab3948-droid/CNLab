import codecs

with codecs.open('js/cms.js', 'r', 'utf-8') as f:
    text = f.read()

# 1. Update mapping
text = text.replace("surveys: d.surveys || d['설문'] || d['실험기록'] || d['실험'] || [],", 
                    "surveys: d.surveys || d['설문'] || d['실험기록'] || [],\n          experiments: d.experiments || d['실험'] || [],")

# 2. Add renderExperiments(); to initCMS
text = text.replace("renderPublications();\n    renderGallery();", 
                    "renderPublications();\n    renderExperiments();\n    renderGallery();")

# 3. Change renderGallery layout
old_gallery = '''        html += `<a href="${imgSrc}" target="_blank" class="gallery-item animate-on-scroll">
                   <img src="${imgSrc}" alt="Gallery image" loading="lazy">
                 </a>`;'''
new_gallery = '''        html += `<div class="gallery-item animate-on-scroll" onclick="openLightbox('${imgSrc}')" style="cursor: pointer;">
                   <img src="${imgSrc}" alt="Gallery image" loading="lazy">
                 </div>`;'''
text = text.replace(old_gallery, new_gallery)

# 4. Add renderExperiments function at the very end
render_exp_func = '''
  // ===== Experiments Rendering =====
  function renderExperiments() {
    const container = document.getElementById('experiment-grid');
    if (!container) return;
    
    const experiments = window.__cnlab_cms_data.experiments || [];
    if (experiments.length === 0) return; // if no custom experiments, just leave the built-in one
    
    let html = '';
    experiments.forEach((exp, index) => {
      const titleKo = exp.title_ko || '';
      const titleEn = exp.title_en || exp.title_ko || '';
      const summaryKo = exp.summary_ko || '';
      const summaryEn = exp.summary_en || exp.summary_ko || '';
      const statusKo = exp.status_ko || '진행중';
      const statusEn = exp.status_en || 'Open';
      const url = exp.url || '#';
      const duration = exp.duration || 'N/A';
      const device = exp.device || 'Any Device';
      
      const isClosed = statusKo.includes('종료') || statusEn.includes('Closed');
      const statusClass = isClosed ? 'survey-card__status--closed' : 'survey-card__status--active';
      const btnClass = isClosed ? 'btn--secondary' : 'btn--primary';
      const btnDisabled = isClosed ? 'disabled' : '';
      const btnTextKo = isClosed ? '종료됨' : '참여하기';
      const btnTextEn = isClosed ? 'Closed' : 'Participate';
      
      html += `
        <div class="survey-card animate-on-scroll" style="animation-delay: ${index * 0.1}s">
          <div class="survey-card__content">
            <div class="survey-card__status ${statusClass}">
              <span class="lang-ko">${statusKo}</span>
              <span class="lang-en">${statusEn}</span>
            </div>
            <h3 class="survey-card__title">
              <span class="lang-ko">${titleKo}</span>
              <span class="lang-en">${titleEn}</span>
            </h3>
            <p class="survey-card__description">
              <span class="lang-ko">${summaryKo}</span>
              <span class="lang-en">${summaryEn}</span>
            </p>
            <div class="survey-card__meta">
              <span>⏱️ ${duration}</span>
              <span>💻 ${device}</span>
            </div>
          </div>
          <div class="survey-card__footer">
            <a href="${url}" target="_blank" class="btn ${btnClass}" ${btnDisabled} style="width: 100%; border-radius: 0 0 calc(var(--radius-lg) - 1px) calc(var(--radius-lg) - 1px);">
              <span class="lang-ko">${btnTextKo}</span>
              <span class="lang-en">${btnTextEn}</span>
            </a>
          </div>
        </div>
      `;
    });
    
    // Append to existing experiment grid (which holds the built-in test)
    container.insertAdjacentHTML('beforeend', html);
  }
'''

text = text + render_exp_func

# Update tasks
with codecs.open(r'C:\Users\LG\.gemini\antigravity\brain\194b6455-cdf4-4424-979d-d6c805bf2418\task.md', 'r', 'utf-8') as f:
    t = f.read()
t = t.replace('- [/] 실험 탭 리팩토링 및 히든 모달(Hidden Modal) 이식', '- [x] 실험 탭 리팩토링 및 히든 모달(Hidden Modal) 이식')
t = t.replace('- [ ] 갤러리 위치 클릭 시 동작할 라이트박스 팝업 UI 구현', '- [x] 갤러리 위치 클릭 시 동작할 라이트박스 팝업 UI 구현')
t = t.replace('- [ ] CSS 업데이트 (모달 및 라이트박스 디자인 추가)', '- [x] CSS 업데이트 (모달 및 라이트박스 디자인 추가)')
t = t.replace('- [ ] `cms.js` 수정 (실험 탭 연동 함수 생성, 갤러리 모달 호출 스크립트 연결)', '- [x] `cms.js` 수정 (실험 탭 연동 함수 생성, 갤러리 모달 호출 스크립트 연결)')
with codecs.open(r'C:\Users\LG\.gemini\antigravity\brain\194b6455-cdf4-4424-979d-d6c805bf2418\task.md', 'w', 'utf-8') as f:
    f.write(t)

with codecs.open('js/cms.js', 'w', 'utf-8') as f:
    f.write(text)

print('cms.js successfully updated')
