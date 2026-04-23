import codecs
import re

path = r'D:\AI agent\CNLab\js\cms.js'
with codecs.open(path, 'r', 'utf-8') as f:
    text = f.read()

# 1. Add members and gallery to window.__cnlab_cms_data
if 'conferences: []' in text and 'members: []' not in text:
    text = text.replace('conferences: []', 'conferences: [],\n    members: [],\n    gallery: []')

# 2. Add render calls in initCMS()
target_renders = '    renderSurveys();\n    renderResearch();\n    renderPublications();'
new_renders = '    renderSurveys();\n    renderResearch();\n    renderPublications();\n    renderMembers();\n    renderGallery();'
if target_renders in text:
    text = text.replace(target_renders, new_renders)

# 3. Add renderMembers and renderGallery functions
new_funcs = '''
  // ===== Members Rendering =====
  function renderMembers() {
    const list = document.getElementById('members-list');
    if (!list) return;

    let members = window.__cnlab_cms_data.members || [];
    if (members.length === 0) {
      list.innerHTML = `<div class="empty-state" style="padding: 40px 24px; text-align: center;"><div class="empty-state__icon">👥</div><p class="empty-state__text"><span class="lang-ko">아직 등록된 구성원이 없습니다. 스프레드시트를 확인하세요.</span><span class="lang-en">No members registered yet. Please check the spreadsheet.</span></p></div>`;
      return;
    }

    const order = ['PI', '박사과정', '석사과정', '기타'];
    function getGroup(roleKo) {
        if (!roleKo) return '기타';
        const rl = roleKo.toLowerCase();
        if (rl.includes('investigator') || rl.includes('책임') || rl.includes('pi')) return 'PI';
        if (rl.includes('박사')) return '박사과정';
        if (rl.includes('석사')) return '석사과정';
        return '기타';
    }
    
    const grouped = {'PI': [], '박사과정': [], '석사과정': [], '기타': []};
    members.forEach(m => {
        grouped[getGroup(m.role_ko)].push(m);
    });

    const roleTitles = {
        'PI': { ko: '연구책임자', en: 'Principal Investigator' },
        '박사과정': { ko: '박사과정', en: 'Ph.D. Candidates' },
        '석사과정': { ko: '석사과정', en: 'M.A. Students' },
        '기타': { ko: '학부생 및 기타 구성원', en: 'Undergraduates & Affiliated' }
    };

    let html = '';
    
    order.forEach(groupName => {
        const arr = grouped[groupName];
        if (arr.length === 0) return;
        
        if (groupName === 'PI') {
            arr.forEach(m => {
                const nameKo = m.name_ko || '';
                const nameEn = m.name_en || '';
                const email = m.email || '';
                const kwKo = m.keywords_ko || '';
                const kwEn = m.keywords_en || '';
                let photoUrl = m.photo_url || '';
                
                if (!photoUrl) {
                     if (nameKo === '이윤형' || nameEn.includes('Yoonhyoung')) photoUrl = 'images/members/교수님.jpg';
                     else if (nameKo === '김경일') photoUrl = 'images/members/김경일교수님.png'; // Example if another PI
                     else photoUrl = 'images/members/교수님.jpg';
                } else if (!photoUrl.startsWith('http')) {
                     photoUrl = `images/members/${photoUrl}`;
                }

                html += `<div class="researcher-featured animate-on-scroll" style="opacity:1; transform:none; margin-bottom: 48px;">
                  <div class="researcher-featured__photo">
                    ${photoUrl ? `<img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover;" alt="PI Photo">` : `<div class="researcher-card__photo-placeholder" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#eee;font-size:3rem;">👤</div>`}
                  </div>
                  <div class="researcher-featured__info">
                    <h3 style="margin-bottom: 4px;"><span class="lang-ko">${nameKo}</span><span class="lang-en">${nameEn}</span></h3>
                    <p style="color: var(--color-primary); font-weight: 500; font-size: 0.9rem; margin-bottom: 16px;">
                      Principal Investigator
                    </p>
                    <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 8px; line-height: 1.5;">
                      <span class="lang-ko">${kwKo}</span><span class="lang-en">${kwEn}</span>
                    </p>
                    ${email ? `<p class="researcher-card__email" style="margin-bottom: 4px;">📧 <a href="mailto:${email}">${email}</a></p>` : ''}
                  </div>
                </div>`;
            });
        } else {
            html += `<h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 24px; color: var(--color-text); clear: both;">
              <span class="lang-ko">${roleTitles[groupName].ko}</span>
              <span class="lang-en">${roleTitles[groupName].en}</span>
            </h3>
            <div class="researchers__grid" style="margin-bottom: 48px;">`;
            
            arr.forEach(m => {
                const nameKo = m.name_ko || '';
                const nameEn = m.name_en || '';
                const roleKo = m.role_ko || '';
                const roleEn = m.role_en || '';
                const email = m.email || '';
                const kwKo = m.keywords_ko || '';
                const kwEn = m.keywords_en || '';
                
                let photoUrl = m.photo_url || '';
                let photoHtml = `<div class="researcher-card__photo-placeholder" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#eee;font-size:2rem;">👤</div>`;
                if (photoUrl && !photoUrl.startsWith('http')) photoUrl = `images/members/${photoUrl}`;
                if (photoUrl) photoHtml = `<img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="User">`;

                const topMargin = kwKo ? '0' : '28px';

                html += `
              <div class="researcher-card animate-on-scroll" style="opacity:1; transform:none;">
                <div class="researcher-card__photo">${photoHtml}</div>
                <h4 class="researcher-card__name">
                  <span class="lang-ko">${nameKo}</span>
                  <span class="lang-en">${nameEn}</span>
                </h4>
                <p class="researcher-card__role">
                  <span class="lang-ko">${roleKo}</span>
                  <span class="lang-en">${roleEn}</span>
                </p>
                ${kwKo ? `<p style="font-size: 0.8rem; color: var(--color-primary); font-weight: 500; margin-top: 8px; margin-bottom: 4px; line-height: 1.4;">
                  <span class="lang-ko">${kwKo}</span><span class="lang-en">${kwEn}</span>
                </p>` : ''}
                ${email ? `<p class="researcher-card__email" style="margin-top: ${topMargin};">📧 <a href="mailto:${email}">${email}</a></p>` : ''}
              </div>`;
            });
            html += `</div>`;
        }
    });
    
    list.innerHTML = html;
  }

  // ===== Gallery Rendering =====
  function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    let gallery = window.__cnlab_cms_data.gallery || [];
    if (gallery.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="padding: 40px 24px; grid-column: 1 / -1; text-align: center;"><div class="empty-state__icon">📸</div><p class="empty-state__text"><span class="lang-ko">현재 등록된 사진이 없습니다.</span><span class="lang-en">No photos available.</span></p></div>`;
      return;
    }

    let html = '';
    gallery.forEach(item => {
        let imgUrl = item.image_url || '';
        if (imgUrl && !imgUrl.startsWith('http')) {
            imgUrl = `images/conferences/${imgUrl}`;
        }
        
        if (imgUrl) {
            html += `
            <div class="gallery-item" onclick="window.open('${imgUrl}', '_blank')">
                <img src="${imgUrl}" alt="Gallery Photo" loading="lazy">
            </div>`;
        }
    });

    grid.innerHTML = html;
  }
'''
if 'function renderMembers' not in text:
    # insert before initCMS loading complete handler
    insert_point = text.find('// DOM 로드 완료 시')
    if insert_point != -1:
        text = text[:insert_point] + new_funcs + '\n  ' + text[insert_point:]

# 4. Remove image rendering from renderConferenceCard
import re
text = re.sub(r'\$\{imgUrl \? `<div style="flex-shrink: 0[^`]*</div>` : \'\'\}', '', text)
text = text.replace('<div class="pub-card" style="${imgUrl ? \'align-items: flex-start;\' : \'\'}">', '<div class="pub-card">')

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(text)

print('cms.js update completed')
