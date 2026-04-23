/**
 * CNLab Website — Announcements Module
 * JSON 데이터 로드, 카테고리 필터링, 페이지네이션, 상세보기 모달
 */

(function () {
  'use strict';

  // ===== Configuration =====
  const ITEMS_PER_PAGE = 5;

  // ===== State =====
  let allAnnouncements = [];
  let filteredAnnouncements = [];
  let currentCategory = '전체';
  let currentPage = 1;

  // ===== DOM Elements =====
  const listContainer = document.getElementById('announcement-list');
  const paginationContainer = document.getElementById('announcement-pagination');
  const tabsContainer = document.getElementById('announcement-tabs');
  const modal = document.getElementById('announcement-modal');
  const modalTitle = document.getElementById('announcement-modal-title');
  const modalCategory = document.getElementById('announcement-modal-category');
  const modalDate = document.getElementById('announcement-modal-date');
  const modalBody = document.getElementById('announcement-modal-body');

  // ===== Load Data =====
  function loadAnnouncements() {
    try {
      allAnnouncements = window.__cnlab_cms_data.announcements || [];

      // Sort: pinned first, then by date descending
      allAnnouncements.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.date) - new Date(a.date);
      });

      filterAndRender();
    } catch (err) {
      console.error('공지사항 로드 실패:', err);
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📭</div>
          <p class="empty-state__text">공지사항을 불러올 수 없습니다.</p>
        </div>
      `;
    }
  }

  // ===== Filter & Render =====
  function filterAndRender() {
    if (currentCategory === '전체') {
      filteredAnnouncements = [...allAnnouncements];
    } else {
      filteredAnnouncements = allAnnouncements.filter((a) => {
        const catKo = (a.category_ko || a.category || '').trim();
        const catEn = (a.category_en || a.category || '').trim();
        return catKo === currentCategory || catEn === currentCategory;
      });
    }

    currentPage = 1;
    renderList();
    renderPagination();
  }

  // ===== Render List =====
  function renderList() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageItems = filteredAnnouncements.slice(start, end);

    if (pageItems.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📭</div>
          <p class="empty-state__text">
             <span class="lang-ko">해당 카테고리의 공지사항이 없습니다.</span>
             <span class="lang-en">No announcements in this category.</span>
          </p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = pageItems
      .map(
        (item) => {
          const categoryKo = item.category_ko || item.category || '';
          const categoryEn = item.category_en || item.category || '';
          const titleKo = item.title_ko || item.title || '';
          const titleEn = item.title_en || item.title || '';
          const summaryKo = item.summary_ko || item.summary || '';
          const summaryEn = item.summary_en || item.summary || '';

          return `
          <div class="announcement-item ${item.pinned ? 'announcement-item--pinned' : ''}" 
               onclick="openAnnouncementModal('${item.id}')" 
               role="button" 
               tabindex="0"
               aria-label="${titleKo}">
            <div class="announcement-item__date">${formatDate(item.date)}</div>
            <div class="announcement-item__content">
              <span class="announcement-item__category announcement-item__category--${item.category}">
                ${item.pinned ? '📌 ' : ''}
                <span class="lang-ko">${categoryKo}</span>
                <span class="lang-en">${categoryEn}</span>
              </span>
              <h4 class="announcement-item__title">
                <span class="lang-ko">${titleKo}</span>
                <span class="lang-en">${titleEn}</span>
              </h4>
              <p class="announcement-item__summary">
                <span class="lang-ko">${summaryKo}</span>
                <span class="lang-en">${summaryEn}</span>
              </p>
            </div>
            <span class="announcement-item__arrow">→</span>
          </div>
          `;
        }
      )
      .join('');
  }

  // ===== Render Pagination =====
  function renderPagination() {
    const totalPages = Math.ceil(filteredAnnouncements.length / ITEMS_PER_PAGE);

    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let html = '';

    // Previous button
    html += `<button class="pagination__btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.__cnlab_goToPage(${currentPage - 1})">‹</button>`;

    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="pagination__btn ${i === currentPage ? 'active' : ''}" onclick="window.__cnlab_goToPage(${i})">${i}</button>`;
    }

    // Next button
    html += `<button class="pagination__btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.__cnlab_goToPage(${currentPage + 1})">›</button>`;

    paginationContainer.innerHTML = html;
  }

  // ===== Page Navigation =====
  function goToPage(page) {
    const totalPages = Math.ceil(filteredAnnouncements.length / ITEMS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderList();
    renderPagination();
  }

  // ===== Category Tabs =====
  tabsContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.announcements__tab');
    if (!tab) return;

    // Update active tab
    tabsContainer.querySelectorAll('.announcements__tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    currentCategory = tab.dataset.category;
    filterAndRender();
  });

  // ===== Modal =====
  window.openAnnouncementModal = function (id) {
    const item = allAnnouncements.find((a) => a.id === id);
    if (!item) return;

    const categoryKo = item.category_ko || item.category || '';
    const categoryEn = item.category_en || item.category || '';
    const titleKo = item.title_ko || item.title || '';
    const titleEn = item.title_en || item.title || '';
    const contentKo = item.content_ko || item.content || '';
    const contentEn = item.content_en || item.content || '';

    modalCategory.innerHTML = `
      <span class="announcement-item__category announcement-item__category--${item.category}">
        <span class="lang-ko">${categoryKo}</span>
        <span class="lang-en">${categoryEn}</span>
      </span>
    `;
    modalTitle.innerHTML = `
      <span class="lang-ko">${titleKo}</span>
      <span class="lang-en">${titleEn}</span>
    `;
    modalDate.textContent = formatDate(item.date);
    modalBody.innerHTML = `
      <div class="lang-ko" style="white-space: pre-line;">${contentKo}</div>
      <div class="lang-en" style="white-space: pre-line;">${contentEn}</div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeAnnouncementModal = function () {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      window.closeAnnouncementModal();
    }
  });

  // ===== Utility =====
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }

  // ===== Expose to global =====
  window.__cnlab_goToPage = goToPage;

  // ===== Initialize =====
  window.addEventListener('cmsDataReady', loadAnnouncements);
})();
