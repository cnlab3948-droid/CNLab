import codecs

with codecs.open('old_index.html', 'r', 'utf-16le') as f:
    text = f.read()

start_mark = '<!-- Ph.D. Candidates -->'
end_mark = '</div>\r\n      </div>\r\n    </section>\r\n\r\n    <!-- ============================'

start_idx = text.find(start_mark)
end_idx = text.find(end_mark, start_idx)

chunk = text[start_idx:end_idx].strip()

# Now update current index.html
with codecs.open('index.html', 'r', 'utf-8') as f:
    curr = f.read()

s_curr = curr.find('<!-- Dynamic Members Grid -->')
e_curr = curr.find('</div>\n      </div>\n    </section>\n\n    <!-- ============================', s_curr)
if e_curr == -1:
    e_curr = curr.find('</div>\r\n      </div>\r\n    </section>\r\n\r\n    <!-- ============================', s_curr)

if s_curr != -1 and e_curr != -1:
    new_html = curr[:s_curr] + chunk + '\n        ' + curr[e_curr:]
    with codecs.open('index.html', 'w', 'utf-8') as f:
         f.write(new_html)
    print('index.html reverted successfully.')
else:
    print('Could not find replace targets in index.html')

# Also clean up cms.js
with codecs.open('js/cms.js', 'r', 'utf-8') as f:
    cms = f.read()

cms = cms.replace('renderMembers();\n    renderGallery();', 'renderGallery();')

s_cms = cms.find('// ===== Members Rendering =====')
e_cms = cms.find('// ===== Gallery Rendering =====')
if s_cms != -1 and e_cms != -1:
    cms = cms[:s_cms] + cms[e_cms:]

with codecs.open('js/cms.js', 'w', 'utf-8') as f:
    f.write(cms)
print('cms.js reverted successfully')
