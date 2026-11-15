from pathlib import Path
import cv2,json
from PIL import Image
root=Path('.');cap=cv2.VideoCapture('.cache/eic.mp4');cap.set(cv2.CAP_PROP_POS_FRAMES,240);ok,f=cap.read();assert ok
world=Image.fromarray(cv2.cvtColor(f[:,:3840],cv2.COLOR_BGR2RGB))
v=json.loads(Path('public/assets/validation.json').read_text())
for key,r in v['regions'].items():
 crop=world.crop(r['pixelCrop']);crop.resize((640,round(640*crop.height/crop.width))).save('public/assets/'+key+'-2023.jpg',quality=95)
Path('public/assets/nightlights-timeline.json').write_text(json.dumps({'source':'https://svs.gsfc.nasa.gov/5313/','video':json.loads(Path('public/assets/source.json').read_text())['video'],'frames':[{'year':2012,'frame':0,'seconds':0},{'year':2023,'frame':240,'seconds':8}],'verification':'Year labels visually inspected in the original full map sequence; same projection and regional pixel windows, before the colored change-map transition.','regions':v['regions'],'scope':'Two rendered annual-average snapshots; not radiance measurements or a continuous historical reconstruction.'},indent=2))
