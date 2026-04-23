import codecs

path = r'D:\AI agent\CNLab\index.html'
with codecs.open(path, 'r', 'utf-8') as f:
    text = f.read()

# 1. Inject Gallery into Navbar (after Publications)
nav_target = '''<a href="#publications" class="nav__link" data-section="publications">
          <span class="lang-ko">논문</span><span class="lang-en">Publications</span>
        </a>'''
nav_gallery = '''
        <a href="#gallery" class="nav__link" data-section="gallery">
          <span class="lang-ko">사진첩</span><span class="lang-en">Gallery</span>
        </a>'''
if nav_target in text:
    text = text.replace(nav_target, nav_target + nav_gallery)
else:
    print('Error: Could not find navbar target')

# 2. Clear out hardcoded Members
# The Members start at "<!-- Ph.D. Candidates -->" and end right before "<!-- ============================"
# Wait, let's find the exact block bounds.
start_str = '<!-- Ph.D. Candidates -->'
end_str = '''    <!-- ============================
         Research Section'''

if start_str in text and end_str in text:
    s_idx = text.find(start_str)
    e_idx = text.find(end_str)
    
    # We replace everything from start_str to the end of its div wrapper with the new div.
    # The div wrapper ends with "</div>\n    </section>" BEFORE the end_str!
    # Looking at index.html layout, the section tags are like this:
    #      </div>
    #    </section>
    #
    #    <!-- ============ Research Section =====
    
    # So we replace from s_idx up to e_idx - something.
    # Let's just insert the new DOM starting from s_idx, replacing up to the "</div>\n    </section>" that precedes end_str.
    # Actually, the simplest is replacing from start_str up to e_idx with:
    
    replacement = '''<!-- Dynamic Members List -->
        <div id="members-list">
          <div class="empty-state" style="padding: 40px 24px; text-align: center;">
            <div class="empty-state__icon">👥</div>
            <p class="empty-state__text" style="color: var(--color-text-secondary);">
              <span class="lang-ko">구성원 데이터를 불러오는 중입니다...</span>
              <span class="lang-en">Loading members data...</span>
            </p>
          </div>
        </div>

      </div>
    </section>

'''
    
    text = text[:s_idx] + replacement + text[e_idx:]
else:
    print('Error: Could not find Members block bounds')

# 3. Add Gallery Section after Publications Section
pub_end_str = '''    <!-- ============================
         Experiment Section'''

gallery_section = '''    <!-- ============================
         Gallery Section
         ============================ -->
    <section class="section" id="gallery" data-section="gallery">
      <div class="container">
        <div class="section__header">
          <span class="section__label">Gallery</span>
          <h2 class="section__title">
            <span class="lang-ko">사진첩</span>
            <span class="lang-en">Gallery</span>
          </h2>
          <p class="section__description">
            <span class="lang-ko">연구실의 생생한 모습과 다양한 외부 활동, 학회 참가 기념 사진들을 확인할 수 있습니다.</span>
            <span class="lang-en">Explore lively moments, various activities, and conference memories of our lab.</span>
          </p>
        </div>

        <div id="gallery-grid" class="gallery-grid">
          <div class="empty-state" style="padding: 40px 24px; grid-column: 1 / -1;">
            <div class="empty-state__icon">📸</div>
            <p class="empty-state__text">
              <span class="lang-ko">사진 데이터를 불러오는 중입니다...</span>
              <span class="lang-en">Loading gallery data...</span>
            </p>
          </div>
        </div>
      </div>
    </section>

'''

if pub_end_str in text:
    text = text.replace(pub_end_str, gallery_section + pub_end_str)
else:
    print('Error: Could not find Experiment Section to insert Gallery before it')

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(text)
print('HTML modified successfully')
