# Extract the first repeated global map from the actual EIC frame at t=0 (2012).
# The EIC render repeats the world twice across its 7680x2160 canvas.
import cv2,json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]; out=root/'public/assets'
cap=cv2.VideoCapture(str(root/'.cache/eic.mp4'));ok,f=cap.read();assert ok
world=Image.fromarray(cv2.cvtColor(f[:,:3840],cv2.COLOR_BGR2RGB))
world.resize((2048,1024)).save(out/'earth-night.png')
world.resize((1280,720)).save(out/'eic-frame.jpg',quality=90)
regions={'india':[67,6,98,37],'ukraine':[22,44,41,53]}
report={'source':'https://svs.gsfc.nasa.gov/5313/','observationLabel':'2012 annual average','sourceFrame':0,'sourceDimensions':[7680,2160],'worldCrop':[0,0,3840,2160],'projection':'equirectangular, resized by EIC; first repeated world','regions':{}}
for key,(west,south,east,north) in regions.items():
 box=[round((west+180)/360*3840),round((90-north)/180*2160),round((east+180)/360*3840),round((90-south)/180*2160)]
 crop=world.crop(box);crop.resize((640,round(640*crop.height/crop.width))).save(out/f'{key}.jpg',quality=95)
 report['regions'][key]={'bounds':[west,south,east,north],'pixelCrop':box,'note':'Rectangular regional window; includes neighboring territory, not a national boundary mask.'}
(out/'validation.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
