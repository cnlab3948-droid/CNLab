import codecs

with codecs.open('index.html', 'r', 'utf-8') as f:
    text = f.read()

# 1. Lightbox and Modals HTML to insert before </main>
modals_html = '''    <!-- ===== Lightbox Modal ===== -->
    <div class="lightbox-modal" id="lightbox-modal" style="display: none; position: fixed; inset: 0; z-index: 9999; align-items: center; justify-content: center; background: rgba(0,0,0,0.85); backdrop-filter: blur(5px);">
      <button onclick="closeLightbox()" style="position: absolute; right: 30px; top: 30px; background: none; border: none; color: white; font-size: 3rem; cursor: pointer; z-index: 10000; line-height: 1;">&times;</button>
      <img id="lightbox-img" src="" style="max-width: 90%; max-height: 90vh; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
    </div>

    <script>
      function openLightbox(url) {
        document.getElementById('lightbox-img').src = url;
        const modal = document.getElementById('lightbox-modal');
        modal.style.display = 'flex';
        // force reflow
        void modal.offsetWidth;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
      function closeLightbox() {
        const modal = document.getElementById('lightbox-modal');
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
        document.body.style.overflow = 'auto';
      }
      function openRTModal() {
        const modal = document.getElementById('rt-experiment-modal');
        modal.style.display = 'flex';
        void modal.offsetWidth;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
      function closeRTModal() {
        const modal = document.getElementById('rt-experiment-modal');
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
        document.body.style.overflow = 'auto';
      }
    </script>
'''

# We need to extract the existing experiment panels
start_exp = text.find('<!-- Experiment Type Tabs -->')
end_exp = text.find('</section>', start_exp) 

# find the exact div wrapper closing
end_exp = text.find('</div>\n    </section>', start_exp)
if end_exp == -1: end_exp = text.find('</div>\r\n    </section>', start_exp)

if start_exp != -1 and end_exp != -1:
    panels_str = text[start_exp:end_exp].strip()

    rt_modal_html = f'''
    <!-- ===== Experiment Hidden Modal ===== -->
    <div class="experiment-modal" id="rt-experiment-modal" style="display: none;">
      <div class="experiment-modal__overlay" onclick="closeRTModal()"></div>
      <div class="experiment-modal__content">
        <button onclick="closeRTModal()" style="position: absolute; right: 20px; top: 20px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--color-text); z-index: 10;">&times;</button>
        <h2 style="margin-top:0; margin-bottom: 24px; font-size: 1.5rem; color: var(--color-primary);">반응시간(RT) 테스트</h2>
        {panels_str}
      </div>
    </div>
'''
    # Construct the NEW experiment section
    new_exp_section = '''<!-- New Experiment Section Grid -->
        <div class="survey__grid" id="experiment-grid">
           <!-- Built-in RT Test Card -->
           <div class="survey-card animate-on-scroll" style="opacity: 1; transform: none;">
             <div class="survey-card__content">
               <div class="survey-card__status survey-card__status--active">
                 <span class="lang-ko">테스트 가능</span><span class="lang-en">Available</span>
               </div>
               <h3 class="survey-card__title">
                 <span class="lang-ko">반응 시간 테스트</span><span class="lang-en">Reaction Time Test</span>
               </h3>
               <p class="survey-card__description" style="margin-bottom: 24px;">
                 <span class="lang-ko">기본 내장된 인지 반응시간(RT) 측정 시범 모듈입니다. 버튼을 누르면 즉석에서 실험 팝업이 활성화되어 단순/선택 반응시간을 검사할 수 있습니다.</span>
                 <span class="lang-en">Built-in cognitive reaction time (RT) demonstrative module. Tests simple and choice reaction speeds instantly.</span>
               </p>
               <div class="survey-card__meta">
                 <span>⏱️ 3 mins</span>
                 <span>💻 Desktop Only</span>
               </div>
             </div>
             <div class="survey-card__footer">
               <button class="btn btn--primary" style="width: 100%; border-radius: 0 0 calc(var(--radius-lg) - 1px) calc(var(--radius-lg) - 1px);" onclick="openRTModal()">
                 <span class="lang-ko">테스트 하기</span><span class="lang-en">Start Test</span>
               </button>
             </div>
           </div>
        </div>
      </div>'''

    # Replace the old section payload with the new layout
    text = text[:start_exp] + new_exp_section + text[end_exp + 6:]
    
    # Inject modals right before </main>
    idx_main = text.find('</main>')
    text = text[:idx_main] + modals_html + rt_modal_html + '\n  ' + text[idx_main:]

    with codecs.open('index.html', 'w', 'utf-8') as f:
        f.write(text)
    print("index.html refactored successfully")
else:
    print("Could not find Experiment Type Tabs!")
