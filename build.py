# Baut index.html aus src.html + detect.js
src=open('src.html').read();det=open('detect.js').read()
core=det.split('// CORE-START')[1].split('// CORE-END')[0]
open('index.html','w').write(src.replace('/*DETECT*/','// Tonprüfung'+core))
