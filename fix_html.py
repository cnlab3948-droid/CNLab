import codecs
import re

with codecs.open('index.html', 'r', 'utf-8') as f:
    text = f.read()

target = '''        <!-- Affiliated & Undergraduates -->
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 24px; color: var(--color-text);">
          <span class="lang-ko">기타 구성원</span>
          <span class="lang-en">Other Members</span>
        </h3>
        <div class="researchers__grid">
          <div class="researcher-card animate-on-scroll">
            <div class="researcher-card__photo"><div class="researcher-card__photo-placeholder">👤</div></div>
            <h4 class="researcher-card__name">
              <span class="lang-ko">이태강</span>
              <span class="lang-en">Taegang Lee</span>
            </h4>
            <p class="researcher-card__role">Affiliated</p>
            <p style="font-size: 0.8rem; color: var(--color-primary); font-weight: 500; margin-top: 8px; margin-bottom: 4px; line-height: 1.4;">
              <span class="lang-ko">#제2언어 처리 및 습득 #심리언어학 방법론 (e.g., 시선추적, EEG)</span>
              <span class="lang-en">#Second language processing and acquisition #Psycholinguistic methodology (e.g., Eye-tracking, EEG)</span>
            </p>
            <p class="researcher-card__email" style="margin-top: 0;">📧 <a href="mailto:taegangl@andrew.cmu.edu">taegangl@andrew.cmu.edu</a></p>
          </div>
          <div class="researcher-card animate-on-scroll">
            <div class="researcher-card__photo"><div class="researcher-card__photo-placeholder">👤</div></div>
            <h4 class="researcher-card__name">
              <span class="lang-ko">최병채</span>
              <span class="lang-en">Byeongchae Choi</span>
            </h4>
            <p class="researcher-card__role">Affiliated</p>
            <p style="font-size: 0.8rem; color: var(--color-primary); font-weight: 500; margin-top: 8px; margin-bottom: 4px; line-height: 1.4;">
              <span class="lang-ko">#제2언어 습득 #심리언어학</span>
              <span class="lang-en">#Second language acquisition #Psycholinguistics</span>
            </p>
            <p class="researcher-card__email" style="margin-top: 0;">📧 <a href="mailto:rookie102412@knu.ac.kr">rookie102412@knu.ac.kr</a></p>
          </div>
          <div class="researcher-card animate-on-scroll">
            <div class="researcher-card__photo"><div class="researcher-card__photo-placeholder">👤</div></div>
            <h4 class="researcher-card__name">
              <span class="lang-ko">조혜린</span>
              <span class="lang-en">Hyerin Cho</span>
            </h4>
            <p class="researcher-card__role">
              <span class="lang-ko">학부생</span>
              <span class="lang-en">Undergraduate</span>
            </p>
            <p class="researcher-card__email" style="margin-top: 28px;">📧 <a href="mailto:hyerin041104@gmail.com">hyerin041104@gmail.com</a></p>
          </div>
        </div>

      </div>
    </section>

    <!-- ============================
         Research Section
         ============================ -->'''

start_idx = text.find('<!-- Affiliated & Undergraduates -->')
end_idx = text.find('<!-- ============================')
end_idx = text.find('============================ -->', end_idx) + 32

new_text = text[:start_idx] + target + text[end_idx:]

with codecs.open('index.html', 'w', 'utf-8') as f:
    f.write(new_text)

print('missing chunk replaced')
