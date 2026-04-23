import codecs

with codecs.open('index.html', 'r', 'utf-8') as f:
    text = f.read()

idx_research = text.find('<section class="section" id="research"')
idx_dup_home = text.find('<section class="section active" id="home"', text.find('Research Section'))

if idx_research != -1 and idx_dup_home != -1:
    text = text[:idx_dup_home] + text[idx_research:]
    with codecs.open('index.html', 'w', 'utf-8') as f:
        f.write(text)
    print('Duplicate stripped!')
else:
    print('Not found', idx_research, idx_dup_home)
