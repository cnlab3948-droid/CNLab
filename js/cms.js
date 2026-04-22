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
    surveys: [],
    research: [],
    journals: [],
    conferences: []
  };

  async function initCMS() {
    try {
      // action=get_all 파라미터를 던져 3개의 시트(공지사항, 설문, 연구) 배열을 요청합니다.
      const response = await fetch(CMS_URL + '?action=get_all');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      if (data.result === 'success') {
        window.__cnlab_cms_data = data.data;
      }
    } catch (err) {
      console.error('CMS 데이터 로드 실패:', err);
    }

    // Hide loader
    const loader = document.getElementById('cms-loading');
    if (loader) {
      loader.classList.add('hidden');
    }

    // Render surveys and research
    renderSurveys();
    renderResearch();
    renderPublications();

    // 공지사항 파트에 '데이터 로딩 완료' 신호를 보냅니다.
    window.dispatchEvent(new Event('cmsDataReady'));
  }

  function renderSurveys() {
    const container = document.getElementById('survey-grid');
    if (!container) return;
    
    const surveys = window.__cnlab_cms_data.surveys || [];
    if (surveys.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 48px 24px;">
          <div class="empty-state__icon">📝</div>
          <p class="empty-state__text">
             <span class="lang-ko">현재 등록된 설문조사가 없습니다.</span>
             <span class="lang-en">No surveys currently available.</span>
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = surveys.map(s => {
      const isActive = s.status_ko === '진행중' || s.status === '진행중';
      const statusClass = isActive ? 'active' : 'closed';
      
      const statusKo = s.status_ko || s.status || '';
      const statusEn = s.status_en || s.status || '';
      const titleKo = s.title_ko || s.title || '';
      const titleEn = s.title_en || s.title || '';
      const descKo = s.description_ko || s.description || '';
      const descEn = s.description_en || s.description || '';
      const timeKo = s.time_ko || s.time || '';
      const timeEn = s.time_en || s.time || '';
      const dateText = s.date || '';

      return `
      <div class="survey-card">
        <div class="survey-card__status survey-card__status--${statusClass}">
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
          <span class="survey-card__meta-item">⏱️ 
             <span class="lang-ko">${timeKo}</span>
             <span class="lang-en">${timeEn}</span>
          </span>
          <span class="survey-card__meta-item">📅 ${dateText}</span>
        </div>
        ${isActive 
          ? `<button class="btn btn--primary btn--sm" onclick="window.open('${s.link}', '_blank')">
               <span class="lang-ko">참여하기 →</span><span class="lang-en">Participate →</span>
             </button>`
          : `<button class="btn btn--ghost btn--sm" disabled>
               <span class="lang-ko">마감됨</span><span class="lang-en">Closed</span>
             </button>`
        }
      </div>
    `}).join('');
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

    // 1. Journal Articles (top 5 + show more)
    if (journals.length === 0) {
      journalList.innerHTML = emptyHtml;
    } else {
      let html = '';
      const displayJournals = journals.slice(0, 5);
      const hiddenJournals = journals.slice(5);

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
              ${link ? `<a href="${link}" target="_blank" style="margin-left:8px; color:var(--color-primary); font-size:0.85em; text-decoration:none; font-weight: 600;">[DOI / Link]</a>` : ''}
            </p>
          </div>
        `;
      };

      html += displayJournals.map(renderJournalCard).join('');
      
      if (hiddenJournals.length > 0) {
        html += `<div id="hidden-journals" style="display: none;">${hiddenJournals.map(renderJournalCard).join('')}</div>`;
        html += `
          <div style="text-align: center; margin-top: 16px;">
            <button id="btn-show-more-journals" class="btn btn--ghost" style="border: 1px solid var(--color-border); font-size: 0.9rem; padding: 8px 16px;">
              <span class="lang-ko">더 보기 ∨</span>
              <span class="lang-en">Show More ∨</span>
            </button>
          </div>
        `;
      }
      
      journalList.innerHTML = html;

      // Event listener for toggle
      const btnShowMore = document.getElementById('btn-show-more-journals');
      if (btnShowMore) {
        btnShowMore.addEventListener('click', () => {
          const hiddenDiv = document.getElementById('hidden-journals');
          if (hiddenDiv.style.display === 'none') {
            hiddenDiv.style.display = 'block';
            btnShowMore.innerHTML = `
              <span class="lang-ko">접기 ∧</span>
              <span class="lang-en">Show Less ∧</span>
            `;
          } else {
            hiddenDiv.style.display = 'none';
            btnShowMore.innerHTML = `
              <span class="lang-ko">더 보기 ∨</span>
              <span class="lang-en">Show More ∨</span>
            `;
          }
        });
      }
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
        const imgUrl = item.image_url || '';

        return `
          <div class="pub-card" style="${imgUrl ? 'display: flex; gap: 24px; align-items: flex-start;' : ''}">
            <div style="flex: 1;">
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

  // DOM 로드 완료 시 CMS 구동 시작
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCMS);
  } else {
    initCMS();
  }

})();
