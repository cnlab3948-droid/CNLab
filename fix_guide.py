import codecs

path = r'D:\AI agent\CNLab\GitHub_업데이트_가이드.html'
with codecs.open(path, 'r', 'utf-8') as f:
    text = f.read()

# Update intro text
text = text.replace('<strong>7가지 탭(시트) 이름</strong>이 존재하여 홈페이지를 구축하고 있습니다. (공지사항, 설문, 연구, 논문, 학회, 구성원, gallery)',
                    '<strong>6가지 탭(시트) 이름</strong>이 존재하여 홈페이지를 구축하고 있습니다. (공지사항, 설문, 연구, 논문, 학회, gallery)')

# Remove Section 8 entirely
sec8_start = text.find('<div class="card">\n        <h2>👥 8. [구성원] 탭 작성법</h2>')
if sec8_start != -1:
    end_val = text.find('</ul>\n    </div>\n\n</body>', sec8_start)
    if end_val != -1:
        end_val += 14  # include </ul>\n    </div>
        text = text[:sec8_start] + text[end_val:]

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(text)

print('Guide HTML restored without members tab instruction')
