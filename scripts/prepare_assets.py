from pathlib import Path
import requests, re, cv2, json
from PIL import Image
root=Path(__file__).resolve().parents[1]
out=root/'public/assets'; out.mkdir(exist_ok=True)
page=requests.get('https://svs.gsfc.nasa.gov/5313/',timeout=45).text
urls=re.findall(r'href="([^"]+\.mp4)"',page)
url=next(u for u in urls if 'h265' in u)
if url.startswith('/'): url='https://svs.gsfc.nasa.gov'+url
video=root/'.cache/eic.mp4'; video.parent.mkdir(exist_ok=True)
if not video.exists():
 r=requests.get(url,timeout=120); r.raise_for_status(); video.write_bytes(r.content)
cap=cv2.VideoCapture(str(video))
print('video',cap.get(cv2.CAP_PROP_FRAME_WIDTH),cap.get(cv2.CAP_PROP_FRAME_HEIGHT),cap.get(cv2.CAP_PROP_FRAME_COUNT))
for second in [0,3,10,20,40,60,80]:
 cap.set(cv2.CAP_PROP_POS_MSEC,second*1000); ok,frame=cap.read()
 if ok:
  frame=cv2.resize(frame,(1280,360));cv2.imwrite(str(root/f'.cache/frame-{second}.jpg'),frame)
(out/'source.json').write_text(json.dumps({'eic':'https://svs.gsfc.nasa.gov/5313/','video':url,'globe':'Derived from EIC frame 0 by scripts/extract_regions.py','credit':'NASA Scientific Visualization Studio / Kel Elkins. Black Marble: NASA Earth Observatory / Joshua Stevens; Suomi NPP VIIRS data / Miguel Roman, NASA GSFC.'},indent=2))
print('EIC downloaded; run extract_regions.py next')
