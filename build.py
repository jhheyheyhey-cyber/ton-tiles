# Baut index.html aus src.html + detect.js
src=open('src.html').read();det=open('detect.js').read()
core=det.split('// CORE-START')[1].split('// CORE-END')[0]
import time
open('index.html','w').write(src.replace('/*DETECT*/','// Tonprüfung'+core).replace('__BUILD__',str(int(time.time()))))
