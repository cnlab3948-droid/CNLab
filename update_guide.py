import codecs
import re

path = r'D:\AI agent\CNLab\GitHub_업데이트_가이드.html'
with codecs.open(path, 'r', 'utf-8') as f:
    text = f.read()

# 1. Update basic intro text
text = text.replace('기본 구조</h2>\n        <p>구글 시트 하단에 반드시 <strong>네 가지 탭(시트) 이름</strong>이 정확히 존재해야 합니다. (실험기록, 공지사항, 설문, 연구)</p>',
                    '기본 구조</h2>\n        <p>구글 시트 하단에 <strong>7가지 탭(시트) 이름</strong>이 존재하여 홈페이지를 구축하고 있습니다. (공지사항, 설문, 연구, 논문, 학회, 구성원, gallery)</p>')

# 2. Fix Section 6: remove image_url instruction
sec6_start = text.find('<h2>🎤 6. [학회] 탭 작성법</h2>')
if sec6_start != -1:
    sec6_img_tip_start = text.find('<div class="tip">', sec6_start)
    sec6_img_tip_end = text.find('</div>', sec6_img_tip_start) + 6
    if sec6_img_tip_start != -1 and sec6_img_tip_end > 6:
        text = text[:sec6_img_tip_start] + text[sec6_img_tip_end:]

text = text.replace('<th>image_url<br>(사진 링크)</th>', '')
text = text.replace('<td>https://imgur.com/...</td>', '')
text = text.replace('<td>(비워둠)</td>', '')
text = text.replace('<li><strong>image_url</strong>: 구글 드라이브 우클릭 링크 등 직접 접근이 가능한 웹 주소를 복사/붙여넣으시면 바로 인식됩니다.</li>', '')

# 3. Add Section 7 and 8 right before </body>
insert_str = '''
    <div class="card">
        <h2>📸 7. [gallery] 탭 작성법</h2>
        <p>사진첩용 탭입니다. 캡션이 제거되어 오직 사진만 전시됩니다.</p>
        <div class="tip">
            <strong>📁 이미지 파일 반영 규칙:</strong><br>
            GitHub의 <code>images/conferences/</code> 폴더에 사진을 업로드하신 뒤, 파일명만 적어주면 알아서 연결됩니다.
        </div>
        <table style="display: block; overflow-x: auto; white-space: nowrap;">
            <thead>
                <tr>
                    <th>image_url<br>(사진 파일명)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>poster1.jpg</td>
                </tr>
                <tr>
                    <td>https://imgur.com/example.jpg</td>
                </tr>
            </tbody>
        </table>
        <ul>
            <li><strong>image_url</strong>: <code>poster1.jpg</code> 등 깃허브 사진 폴더에 있는 파일 이름을 적어주거나, <code>http...</code> 외부 직접 링크를 쓰셔도 됩니다.</li>
        </ul>
    </div>

    <div class="card">
        <h2>👥 8. [구성원] 탭 작성법</h2>
        <p>연구진 구성원의 소속과 이메일, 관심 연구 분야를 적는 탭입니다.</p>
        <div class="tip">
            <strong>⚠️ 구분(role_ko) 분류 규칙:</strong><br>
            '구분' 열에 기입된 문자에 따라 홈페이지 상에서 정렬 섹션이 분리됩니다.<br>
            <code>책임</code>, <code>PI</code> 포함 -> 연구책임자 상단 배치<br>
            <code>박사과정</code> 포함 -> 박사과정 섹션<br>
            <code>석사과정</code> 포함 -> 석사과정 섹션<br>
            나머지 모든 텍스트 -> 학부생 및 기타 구성원 섹션
        </div>
        <table style="display: block; overflow-x: auto; white-space: nowrap;">
            <thead>
                <tr>
                    <th>name_ko<br>(이름-한글)</th>
                    <th>name_en<br>(이름-영문)</th>
                    <th>role_ko<br>(구분-한글)</th>
                    <th>role_en<br>(구분-영문)</th>
                    <th>email<br>(이메일)</th>
                    <th>keywords_ko<br>(관심분야-한글)</th>
                    <th>keywords_en<br>(관심분야-영문)</th>
                    <th>photo_url<br>(개인사진)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>이윤형</td>
                    <td>Yoonhyoung Lee</td>
                    <td>Principal Investigator</td>
                    <td>Principal Investigator</td>
                    <td>yhlee01...</td>
                    <td>#뇌과학 #언어</td>
                    <td>#Language...</td>
                    <td>교수님.jpg</td>
                </tr>
            </tbody>
        </table>
        <ul>
            <li><strong>photo_url</strong> (선택사항): GitHub <code>images/members/</code> 폴더 안의 본인 사진 이름을 적어주시면 프로필에 뜹니다 (안 적으면 기본 익명 아이콘 송출).</li>
        </ul>
    </div>
'''

if '<h2>📸 7. [gallery] 탭 작성법</h2>' not in text:
    text = text.replace('</body>', insert_str + '\n</body>')

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(text)

print('Guide HTML updated successfully')
