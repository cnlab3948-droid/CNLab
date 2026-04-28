/**
 * CNLab Website — CMS Module
 * Google Sheets에서 통합 데이터(Announcements, Surveys, Research)를 가져옵니다.
 */

(function () {
  'use strict';

  // Google Apps Script 웹앱 URL (doGet)
  const CMS_URL = 'https://script.google.com/macros/s/AKfycbzULFHwmGJc6705tLxbCXQIZvOaO5vtagONWL61hyRmWL-HYuGYkSzCxSKcdGVpCdIV/exec';

  window.__cnlab_cms_data = {
    announcements: [],
    experiments: [],
    research: [],
    journals: [],
    conferences: [],
    members: [],
    news: [],
    gallery: []
  };

  async function initCMS() {
    try {
      // action=get_all 파라미터를 던져 3개의 시트(공지사항, 설문, 연구) 배열을 요청합니다.
      const response = await fetch(CMS_URL + '?action=get_all');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      if (data.result === 'success') {
        const d = data.data;
        window.__cnlab_cms_data = {
          announcements: d.announcements || d['공지사항'] || [],
          experiments: d.experiments || d['실험'] || [],
          research: d.research || d['연구'] || [],
          journals: d.journals || d['논문'] || [],
          conferences: d.conferences || d['학회'] || d['학술대회발표'] || [],
          members: d.members || d['구성원'] || [],
          news: d.news || d['소식'] || [],
          gallery: d.gallery || d['gallery'] || []
        };
      }
    } catch (err) {
      console.error('CMS 데이터 로드 실패:', err);
    }

    // Hide loader
    const loader = document.getElementById('cms-loading');
    if (loader) {
      loader.classList.add('hidden');
    }

    // Render all sections
    renderExperiments();
    renderResearch();
    renderPublications();
    renderNews();
    renderGallery();
    finalizePage();

    // 공지사항 파트에 '데이터 로딩 완료' 신호를 보냅니다.
    window.dispatchEvent(new Event('cmsDataReady'));
  }


  // ===== Experiments Rendering (3-section: online/offline/survey) =====
  function renderExperiments() {
    const allItems = window.__cnlab_cms_data.experiments || [];
    
    function renderCards(containerId, items, btnLabelKo, btnLabelEn) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      if (items.length === 0) {
        // If container already has content (e.g. built-in demo card), don't overwrite
        if (container.children.length > 0) return;
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1; padding: 48px 24px;">
            <div class="empty-state__icon">📋</div>
            <p class="empty-state__text">
              <span class="lang-ko">현재 등록된 항목이 없습니다.</span>
              <span class="lang-en">No items currently available.</span>
            </p>
          </div>`;
        return;
      }
      
      container.insertAdjacentHTML('beforeend', items.map((item, index) => {
        const titleKo = item.title_ko || item.title || '';
        const titleEn = item.title_en || item.title_ko || item.title || '';
        const descKo = item.summary_ko || item.description_ko || item.description || '';
        const descEn = item.summary_en || item.description_en || item.description || '';
        const statusKo = item.status_ko || item.status || '진행중';
        const statusEn = item.status_en || item.status || 'Open';
        const url = item.url || item.link || '#';
        const duration = item.duration || item.time_ko || item.time || '';
        const device = item.device || '';
        const dateText = item.date || '';
        
        const isClosed = statusKo.includes('종료') || statusKo.includes('마감') || statusEn.includes('Closed');
        const statusClass = isClosed ? 'survey-card__status--closed' : 'survey-card__status--active';
        const btnClass = isClosed ? 'btn--secondary' : 'btn--primary';
        const btnDisabled = isClosed ? 'disabled' : '';
        
        return `
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
                <span class="lang-ko">${descKo}</span>
                <span class="lang-en">${descEn}</span>
              </p>
              <div class="survey-card__meta">
                ${duration ? `<span>⏱️ ${duration}</span>` : ''}
                ${device ? `<span>💻 ${device}</span>` : ''}
                ${dateText ? `<span>📅 ${dateText}</span>` : ''}
              </div>
            </div>
            <div class="survey-card__footer">
              <a href="${url}" target="_blank" class="btn ${btnClass}" ${btnDisabled} style="width: 100%; border-radius: 0 0 calc(var(--radius-lg) - 1px) calc(var(--radius-lg) - 1px);">
                <span class="lang-ko">${isClosed ? '마감됨' : btnLabelKo}</span>
                <span class="lang-en">${isClosed ? 'Closed' : btnLabelEn}</span>
              </a>
            </div>
          </div>`;
      }).join(''));
    }
    
    // Filter by category_ko
    const onlineExps = allItems.filter(e => {
      const cat = (e.category_ko || e.category || '').toLowerCase();
      return cat.includes('온라인') || cat.includes('online') || cat === '';
    });
    const offlineExps = allItems.filter(e => {
      const cat = (e.category_ko || e.category || '').toLowerCase();
      return cat.includes('오프라인') || cat.includes('offline');
    });
    const surveyItems = allItems.filter(e => {
      const cat = (e.category_ko || e.category || '').toLowerCase();
      return cat.includes('설문') || cat.includes('survey');
    });
    
    renderCards('exp-online-grid', onlineExps, '실험하기', 'Participate');
    renderCards('exp-offline-grid', offlineExps, '신청하기', 'Apply');
    renderCards('exp-survey-grid', surveyItems, '설문하기', 'Take Survey');
  }

  // ===== Cleanup loader =====
  function finalizePage() {
    const loader = document.getElementById('cms-loading');
    if (loader) loader.remove();
    console.log('CMS Finalized and Cleaned.');
  }

  function renderResearch() {
    const container = document.getElementById('research-list');
    if (!container) return;

    const researchPosts = window.__cnlab_cms_data.research || [];
    if (researchPosts.length === 0) {
       container.innerHTML = `
        <div class="empty-state" style="padding: 48px 24px; grid-column: 1 / -1;">
          <div class="empty-state__icon">🔬</div>
          <p class="empty-state__text">
            <span class="lang-ko">현재 진행 중 프로젝트는 곧 업데이트될 예정입니다.</span>
            <span class="lang-en">Ongoing projects will be updated soon.</span>
          </p>
        </div>
       `;
       return;
    }

    // 연구 프로젝트 카드 HTML 생성 (더 이상 엑셀 아이콘 셀에 의존하지 않고 멋진 고정 템플릿 사용)
    container.innerHTML = researchPosts.map(r => {
      const titleKo = r.title_ko || r.title || '';
      const titleEn = r.title_en || r.title || '';
      const contentKo = r.content_ko || r.content || '';
      const contentEn = r.content_en || r.content || '';

      return `
      <div class="schedule__info-card" style="align-items: flex-start; padding: 32px;">
        <div class="schedule__info-icon" style="flex-shrink: 0; background: var(--color-bg-secondary); border-radius: 50%; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--color-primary); border: 1px solid var(--color-border);">
          🔬
        </div>
        <div class="schedule__info-text">
          <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary); margin-bottom: 12px; line-height: 1.4;">
            <span class="lang-ko">${titleKo}</span>
            <span class="lang-en">${titleEn}</span>
          </h4>
          <p style="white-space: pre-line; line-height: 1.7; font-size: 0.95rem;">
            <span class="lang-ko">${contentKo}</span>
            <span class="lang-en">${contentEn}</span>
          </p>
        </div>
      </div>
    `}).join('');
  }

  function renderPublications() {
    const rawJournals = window.__cnlab_cms_data.journals || [];
    const rawConferences = window.__cnlab_cms_data.conferences || [];
    
    const journalList = document.getElementById('pub-journal-list');
    const oralList = document.getElementById('pub-oral-list');
    const posterList = document.getElementById('pub-poster-list');
    
    if(!journalList || !oralList || !posterList) return;

    const journals = rawJournals;
    const orals = rawConferences.filter(p => (p.type_ko === '구두발표' || p.type === '구두발표' || p.type_en === 'Oral'));
    const posters = rawConferences.filter(p => (p.type_ko === '포스터' || p.type === '포스터' || p.type_en === 'Poster'));

    const emptyHtml = `
        <div class="empty-state" style="padding: 40px 24px;">
          <div class="empty-state__icon">📄</div>
          <p class="empty-state__text">
            <span class="lang-ko">현재 등록된 항목이 없습니다.</span>
            <span class="lang-en">No items currently available.</span>
          </p>
        </div>`;

    // 1. Journal Articles (Pagination & Search)
    const renderJournalCard = (item) => {
        const titleKo = item.title_ko || item.title || '';
        const titleEn = item.title_en || item.title || '';
        const authorsKo = item.authors_ko || item.authors || '';
        const authorsEn = item.authors_en || item.authors || '';
        const journalKo = item.journal_ko || item.journal || '';
        const journalEn = item.journal_en || item.journal || '';
        const issue = item.issue || '';
        const dateText = item.date || '';
        const link = item.link || '';

        return `
          <div class="pub-card">
            <div class="pub-card__content">
              <h4 class="pub-card__title">
                <span class="lang-ko">${titleKo}</span>
                <span class="lang-en">${titleEn}</span>
              </h4>
              <p class="pub-card__authors">
                <span class="lang-ko">${authorsKo}</span>
                <span class="lang-en">${authorsEn}</span>
              </p>
              <p class="pub-card__journal">
                <em><span class="lang-ko">${journalKo}</span><span class="lang-en">${journalEn}</span></em> ${issue ? `(${issue})` : ''} · ${dateText}
              </p>
            </div>
            ${link ? `<a href="${link}" target="_blank" class="pub-card__link-btn">
              <span class="lang-ko">바로가기 ↗</span>
              <span class="lang-en">Link ↗</span>
            </a>` : ''}
          </div>
        `;
    };

    if (!window.__cnlab_journal_state) {
        window.__cnlab_journal_state = {
            currentPage: 1,
            itemsPerPage: 10,
            searchQuery: '',
            filtered: [...journals]
        };

        const searchInput = document.getElementById('pub-journal-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                window.__cnlab_journal_state.searchQuery = e.target.value.toLowerCase();
                window.__cnlab_journal_state.currentPage = 1;
                filterAndRenderJournals();
            });
        }
    } else {
        window.__cnlab_journal_state.filtered = [...journals];
    }

    window.__cnlab_goToJournalPage = function(page) {
        const st = window.__cnlab_journal_state;
        const total = Math.ceil(st.filtered.length / st.itemsPerPage);
        if (page < 1 || page > total) return;
        st.currentPage = page;
        filterAndRenderJournals();
    };

    function filterAndRenderJournals() {
        const st = window.__cnlab_journal_state;
        const q = st.searchQuery;
        
        const synonyms = [
            ['기억', 'memory'],
            ['언어', 'language'],
            ['인지', 'cognition', 'cognitive'],
            ['정서', 'emotion', 'affective'],
            ['의사결정', 'decision'],
            ['학습', 'learning'],
            ['주의', 'attention'],
            ['뇌파', 'eeg']
        ];

        st.filtered = journals.filter(item => {
            if (!q) return true;
            const textToSearch = Object.values(item).join(' ').toLowerCase();
            if (textToSearch.includes(q)) return true;

            for (const group of synonyms) {
                if (group.some(syn => q.includes(syn))) {
                    if (group.some(syn => textToSearch.includes(syn))) {
                        return true;
                    }
                }
            }
            return false;
        });

        const start = (st.currentPage - 1) * st.itemsPerPage;
        const end = start + st.itemsPerPage;
        const pageItems = st.filtered.slice(start, end);

        const pag = document.getElementById('pub-journal-pagination');

        if (pageItems.length === 0) {
            journalList.innerHTML = emptyHtml;
            if (pag) pag.innerHTML = '';
            return;
        }

        journalList.innerHTML = pageItems.map(renderJournalCard).join('');

        const totalPages = Math.ceil(st.filtered.length / st.itemsPerPage);
        if (!pag) return;
        if (totalPages <= 1) {
            pag.innerHTML = '';
            return;
        }

        let pHtml = '';
        pHtml += `<button class="pagination__btn" style="width: auto; padding: 0 12px;" ${st.currentPage === 1 ? 'disabled' : ''} onclick="window.__cnlab_goToJournalPage(1)">« 처음</button>`;
        pHtml += `<button class="pagination__btn" style="width: auto; padding: 0 12px;" ${st.currentPage === 1 ? 'disabled' : ''} onclick="window.__cnlab_goToJournalPage(${st.currentPage - 1})">‹ 이전</button>`;

        for (let i = 1; i <= totalPages; i++) {
            pHtml += `<button class="pagination__btn ${i === st.currentPage ? 'active' : ''}" onclick="window.__cnlab_goToJournalPage(${i})">${i}</button>`;
        }

        pHtml += `<button class="pagination__btn" style="width: auto; padding: 0 12px;" ${st.currentPage === totalPages ? 'disabled' : ''} onclick="window.__cnlab_goToJournalPage(${st.currentPage + 1})">다음 ›</button>`;
        pHtml += `<button class="pagination__btn" style="width: auto; padding: 0 12px;" ${st.currentPage === totalPages ? 'disabled' : ''} onclick="window.__cnlab_goToJournalPage(${totalPages})">마지막 »</button>`;
        
        pag.innerHTML = pHtml;
    }

    if (journals.length === 0) {
        journalList.innerHTML = emptyHtml;
    } else {
        filterAndRenderJournals();
    }

    // 2. Oral & Poster 
    const renderConferenceCard = (item) => {
        const titleKo = item.title_ko || item.title || '';
        const titleEn = item.title_en || item.title || '';
        const authorsKo = item.authors_ko || item.authors || '';
        const authorsEn = item.authors_en || item.authors || '';
        const journalKo = item.journal_ko || item.journal || '';
        const journalEn = item.journal_en || item.journal || '';
        const dateText = item.date || '';
        let imgUrl = item.image_url || '';
        if (imgUrl && !imgUrl.startsWith('http')) {
          imgUrl = `images/conferences/${imgUrl}`;
        }

        return `
          <div class="pub-card">
            <div class="pub-card__content">
              <h4 class="pub-card__title">
                <span class="lang-ko">${titleKo}</span>
                <span class="lang-en">${titleEn}</span>
              </h4>
              <p class="pub-card__authors">
                <span class="lang-ko">${authorsKo}</span>
                <span class="lang-en">${authorsEn}</span>
              </p>
              <p class="pub-card__journal">
                <em><span class="lang-ko">${journalKo}</span><span class="lang-en">${journalEn}</span></em> · ${dateText}
              </p>
            </div>
            ${imgUrl ? `
            <div style="flex-shrink: 0; width: 140px; margin-top: 4px;">
              <img src="${imgUrl}" alt="Conference Photo" style="width: 100%; border-radius: 8px; border: 1px solid var(--color-border); aspect-ratio: 4/3; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            </div>` : ''}
          </div>
        `;
    };

    if (orals.length === 0) oralList.innerHTML = emptyHtml;
    else oralList.innerHTML = orals.map(renderConferenceCard).join('');

    if (posters.length === 0) posterList.innerHTML = emptyHtml;
    else posterList.innerHTML = posters.map(renderConferenceCard).join('');
  }

  
  // ===== News Rendering (연구실 소식) =====
  function renderNews() {
    const container = document.getElementById('news-list');
    if (!container) return;

    const newsItems = (window.__cnlab_cms_data.news || []).filter(item => {
      const cat = (item.category || '').toLowerCase();
      return !cat.includes('갤러리') && !cat.includes('gallery');
    });

    if (newsItems.length === 0) {
      container.innerHTML = `<div class="empty-state" style="padding: 48px 24px; text-align: center;"><div class="empty-state__icon">📰</div><p class="empty-state__text"><span class="lang-ko">현재 등록된 소식이 없습니다.</span><span class="lang-en">No news available.</span></p></div>`;
      return;
    }

    const badgeMap = {
      '수상': { cls: 'badge-award', icon: '🏆' },
      '학회': { cls: 'badge-conf', icon: '🎤' },
      '논문': { cls: 'badge-paper', icon: '📄' },
      '모집': { cls: 'badge-recruit', icon: '👥' },
      'award': { cls: 'badge-award', icon: '🏆' },
      'conference': { cls: 'badge-conf', icon: '🎤' },
      'paper': { cls: 'badge-paper', icon: '📄' },
      'recruit': { cls: 'badge-recruit', icon: '👥' },
    };

    container.innerHTML = newsItems.map(item => {
      const cat = item.category || item.category_ko || '기타';
      const catLower = cat.toLowerCase();
      let badge = { cls: 'badge-etc', icon: '📋' };
      for (const [key, val] of Object.entries(badgeMap)) {
        if (catLower.includes(key)) { badge = val; break; }
      }

      const title = item.title || item.title_ko || '';
      const desc = item.description || item.summary_ko || item.summary || '';
      const date = item.date || '';

      return `
        <div class="news-card animate-on-scroll" style="display: flex; align-items: flex-start; gap: 16px; background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: 12px; padding: 18px 22px; transition: box-shadow 0.2s, transform 0.15s; cursor: default;">
          <span class="news-badge ${badge.cls}" style="flex-shrink: 0; font-size: 0.75rem; font-weight: 600; padding: 4px 12px; border-radius: 20px; white-space: nowrap; margin-top: 2px;">${badge.icon} ${cat}</span>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 0.95rem; font-weight: 600; color: var(--color-text); margin-bottom: 5px; line-height: 1.5;">${title}</div>
            <div style="font-size: 0.82rem; color: var(--color-text-secondary);">${date}${desc ? ' · ' + desc : ''}</div>
          </div>
        </div>`;
    }).join('');
  }

  // ===== Gallery Rendering =====
  function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    // Gallery items from '소식' sheet (category=갤러리) + legacy gallery sheet
    const newsGallery = (window.__cnlab_cms_data.news || []).filter(item => {
      const cat = (item.category || '').toLowerCase();
      return cat.includes('갤러리') || cat.includes('gallery');
    });
    const legacyGallery = window.__cnlab_cms_data.gallery || [];
    const allGallery = [...newsGallery, ...legacyGallery];

    if (allGallery.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="padding: 40px 24px; grid-column: 1 / -1; text-align: center;"><div class="empty-state__icon">📸</div><p class="empty-state__text"><span class="lang-ko">현재 등록된 사진이 없습니다.</span><span class="lang-en">No photos available.</span></p></div>`;
      return;
    }

    let html = '';
    allGallery.forEach(item => {
        let imgUrl = item.image_url || '';
        if (imgUrl && !imgUrl.startsWith('http')) {
            imgUrl = `images/conferences/${imgUrl}`;
        }
        
        if (imgUrl) {
            html += `
            <div class="gallery-item" onclick="openLightbox('${imgUrl}')" style="cursor: pointer;">
                <img src="${imgUrl}" alt="Gallery Photo" loading="lazy">
            </div>`;
        }
    });

    grid.innerHTML = html;
  }

  // DOM 로드 완료 시 CMS 구동 시작
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCMS);
  } else {
    initCMS();
  }


})();

// ===== Global Fixes & Event Routing =====
window.openAnnouncementModalById = function(id) {
  const items = window.__cnlab_cms_data.announcements || [];
  const item = items.find(i => i.id == id);
  if (item && typeof openAnnouncementModal === 'function') {
    openAnnouncementModal(item);
  }
};
