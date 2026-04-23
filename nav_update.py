import codecs

with codecs.open('index.html', 'r', 'utf-8') as f:
    text = f.read()

text = text.replace('<span class="lang-ko">사진첩</span>', '<span class="lang-ko">갤러리</span>')
text = text.replace('href="#gallery" class="nav__link" data-section="gallery">\n          <span class="lang-ko">사진첩</span>', 'href="#gallery" class="nav__link" data-section="gallery">\n          <span class="lang-ko">갤러리</span>')

# Update the task.md status
with codecs.open(r'C:\Users\LG\.gemini\antigravity\brain\194b6455-cdf4-4424-979d-d6c805bf2418\task.md', 'r', 'utf-8') as f:
    t = f.read()
t = t.replace('- [/] `index.html` 내 중복된 HOME 및 구성원 섹션 제거', '- [x] `index.html` 내 중복된 HOME 및 구성원 섹션 제거')
t = t.replace('- [ ] 네비게이션 메뉴 이름 변경 (\'사진첩\' -> \'갤러리\')', '- [x] 네비게이션 메뉴 이름 변경 (\'사진첩\' -> \'갤러리\')')
t = t.replace('- [ ] 실험 탭 리팩토링 및 히든 모달(Hidden Modal) 이식', '- [/] 실험 탭 리팩토링 및 히든 모달(Hidden Modal) 이식')
with codecs.open(r'C:\Users\LG\.gemini\antigravity\brain\194b6455-cdf4-4424-979d-d6c805bf2418\task.md', 'w', 'utf-8') as f:
    f.write(t)

with codecs.open('index.html', 'w', 'utf-8') as f:
    f.write(text)

print('Nav texts replaced')
