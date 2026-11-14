from pathlib import Path
import requests,re,json,concurrent.futures,io
from PIL import Image,ImageDraw
root=Path.cwd();out=root/'public/assets/catalog';out.mkdir(parents=True,exist_ok=True)
specs=[('currents','3912','25000.jpg'),('aerosols','5572','2048x1024_30p_0000.png'),('air-quality','5533','1920x1080_0000.png'),('perpetual','5425','carousel.jpg'),('co2','5196','00200_print.jpg'),('lightning','5011','iss_lightning_preview.jpg'),('river','4960','04370_print.jpg'),('forest','4950','0900_print.jpg'),('caldwell','13786','wide.jpg')]
def fetch(spec):
 key,id,match=spec;page=f'https://svs.gsfc.nasa.gov/{id}/';r=requests.get(page,timeout=60);r.raise_for_status();links=list(dict.fromkeys(re.findall(r'href="([^"]+\.(?:png|jpg))"',r.text)))
 candidates=[u for u in links if match in u];
 if not candidates: candidates=[u for u in links if 'print.jpg' in u]
 if not candidates:raise RuntimeError((key,links))
 u=candidates[0];u='https://svs.gsfc.nasa.gov'+u if u.startswith('/') else u
 r=requests.get(u,timeout=90);r.raise_for_status();im=Image.open(io.BytesIO(r.content)).convert('RGB');im.thumbnail((1280,720));im.save(out/f'{key}.jpg',quality=92)
 print(key,im.size,u)
 return {'id':key,'source':page,'imageSource':u,'image':f'catalog/{key}.jpg','dimensions':list(im.size),'processing':'Resized NASA published still; analysis ROI specified separately; no raw physical quantities reconstructed.'}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:items=list(ex.map(fetch,specs))
(out/'provenance.json').write_text(json.dumps(items,indent=2))
sheet=Image.new('RGB',(960,3*220),'#111719');draw=ImageDraw.Draw(sheet)
for i,item in enumerate(items):
 im=Image.open(out/f"{item['id']}.jpg");im.thumbnail((310,185));x=(i%3)*320;y=(i//3)*220;sheet.paste(im,(x,y+25));draw.text((x+8,y+5),item['id'],fill='white')
(root/'.cache/catalog-contact.jpg').parent.mkdir(exist_ok=True);sheet.save(root/'.cache/catalog-contact.jpg')
