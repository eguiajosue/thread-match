"""Deterministic extraction for the supplied Casa Diaz Polystitch 2025 chart."""
import argparse, hashlib, json, re, unicodedata
from pathlib import Path
import fitz
import numpy as np
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser(); a.add_argument('pdf'); args=a.parse_args()
raw=Path(args.pdf).read_bytes(); doc=fitz.open(args.pdf); colors=[]; tiles=[]
for page_index in (1,2,3):
    page=doc[page_index]
    for block in page.get_text('dict')['blocks']:
        if block['type']!=0: continue
        lines=[''.join(s['text'] for s in line['spans']).strip() for line in block['lines']]
        indices=[i for i,t in enumerate(lines) if re.fullmatch(r'\d{4}',t)]
        if not indices: continue
        k=indices[0]
        if k+1>=len(lines): raise ValueError('Missing name')
        code=lines[k]; name=unicodedata.normalize('NFKC',' '.join(lines[k+1:]))
        x0,y0,x1,y1=block['lines'][k]['bbox']
        # Anchors are code text; swatch is to its right, center near code baseline.
        center=(y0+y1)/2
        roi=fitz.Rect(x1+29,center-9,x1+76,center+9)
        pix=page.get_pixmap(matrix=fitz.Matrix(3,3),clip=roi,colorspace=fitz.csRGB,alpha=False)
        arr=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,3)
        flat=arr.reshape(-1,3); light=flat.mean(axis=1); lo,hi=np.percentile(light,[10,90])
        rgb=np.rint(np.median(flat[(light>=lo)&(light<=hi)],axis=0)).astype(int).tolist()
        colors.append(dict(code=code,name=name,rgb=dict(zip('rgb',rgb)),hex='#'+''.join('%02X'%v for v in rgb),collection='Polystitch',weight='40',source=dict(page=page_index+1,roi_points=list(roi),method='central RGB median; luminance tails 10-90 percent removed',calibrated=False)))
        tile=Image.new('RGB',(185,88),'white'); crop=Image.fromarray(arr); crop.thumbnail((145,40)); tile.paste(crop,(8,4)); draw=ImageDraw.Draw(tile); draw.text((8,47),code+' '+name,fill='black'); draw.rectangle((155,4,181,40),fill=tuple(rgb)); tiles.append(tile)
assert len(colors)==160,len(colors)
assert len({c['code'] for c in colors})==160
catalog=dict(schemaVersion=1,brand='Madeira',collection='Polystitch',weight='40',colorSpace='sRGB',whitePoint='D65',source=dict(filename=Path(args.pdf).name,sha256=hashlib.sha256(raw).hexdigest(),calibrated=False),colors=sorted(colors,key=lambda c:c['code']))
catalog['references']=json.loads((ROOT/'data/reference-policy.json').read_text())
(ROOT/'data/madeira-polystitch.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
contact=Image.new('RGB',(185*5,88*((len(tiles)+4)//5)), '#dddddd')
for i,t in enumerate(tiles):contact.paste(t,((i%5)*185,(i//5)*88))
contact.save(ROOT/'docs/extraction-review.png')
print('Extracted',len(colors),'unique colors')
