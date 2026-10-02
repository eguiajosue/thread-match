"""Reproduce all PDF samples and compare two independent PDF renderers.

Usage: python scripts/audit_catalog.py chart.pdf --poppler-dir /path/to/pngs
Generate the Poppler pages with pdftoppm -f 2 -l 4 -r 216 -png chart.pdf poppler
Then run node scripts/report_color_audit.js.
The input PDF remains outside the public repository.
"""
import argparse
import hashlib
import io
import json
import math
import re
import unicodedata
from pathlib import Path

import fitz
import numpy as np
from PIL import Image, ImageCms

ROOT = Path(__file__).resolve().parents[1]


def sample(array):
    pixels = array.reshape(-1, 3)
    light = pixels.mean(axis=1)
    low, high = np.percentile(light, [10, 90])
    rgb = np.rint(np.median(pixels[(light >= low) & (light <= high)], axis=0))
    return rgb.astype(int).tolist(), [round(float(low), 3), round(float(high), 3)]


def audit(pdf, poppler_dir):
    catalog = json.loads((ROOT / 'data/madeira-polystitch.json').read_text())
    doc = fitz.open(pdf)
    digest = hashlib.sha256(Path(pdf).read_bytes()).hexdigest()
    if digest != catalog['source']['sha256']:
        raise ValueError('PDF does not match the catalog source SHA-256')
    anchors = {}
    for n in (1, 2, 3):
        for block in doc[n].get_text('dict')['blocks']:
            if block['type'] != 0:
                continue
            lines = [''.join(s['text'] for s in line['spans']).strip() for line in block['lines']]
            for i, line in enumerate(lines):
                if re.fullmatch(r'\d{4}', line):
                    name = unicodedata.normalize('NFKC', ' '.join(lines[i + 1:]))
                    if line in anchors:
                        raise ValueError('Duplicate code in PDF: ' + line)
                    anchors[line] = (n + 1, name, block['lines'][i]['bbox'])
    if len(anchors) != 160 or set(anchors) != {c['code'] for c in catalog['colors']}:
        raise ValueError('Code coverage mismatch')
    profiles = []
    for xref in range(1, doc.xref_length()):
        if '/N ' in doc.xref_object(xref) and doc.xref_is_stream(xref):
            try:
                profile = ImageCms.ImageCmsProfile(io.BytesIO(doc.xref_stream(xref)))
                profiles.append({'xref': xref, 'description': ImageCms.getProfileDescription(profile).strip(),
                                 'sha256': hashlib.sha256(doc.xref_stream(xref)).hexdigest()})
            except OSError:
                pass
    images = {n: np.asarray(Image.open(Path(poppler_dir) / ('poppler-' + str(n) + '.png')).convert('RGB'))
              for n in (2, 3, 4)}
    rows = []
    for color in catalog['colors']:
        code = color['code']
        page_number, name, bbox = anchors[code]
        if color['name'] != name or color['source']['page'] != page_number:
            raise ValueError('Name/page mismatch for ' + code)
        roi = fitz.Rect(color['source']['roi_points'])
        x0, y0, x1, y1 = bbox
        expected = [x1 + 29, (y0 + y1) / 2 - 9, x1 + 76, (y0 + y1) / 2 + 9]
        if max(abs(a - b) for a, b in zip(roi, expected)) > 0.001:
            raise ValueError('Sample coordinates mismatch for ' + code)
        pix = doc[page_number - 1].get_pixmap(matrix=fitz.Matrix(3, 3), clip=roi, colorspace=fitz.csRGB, alpha=False)
        array = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
        sampled, percentiles = sample(array)
        poppler = images[page_number][math.floor(roi.y0 * 3):math.ceil(roi.y1 * 3),
                                      math.floor(roi.x0 * 3):math.ceil(roi.x1 * 3)]
        independent, _ = sample(poppler)
        # Spatial medians describe photographic texture/lighting variation,
        # not measurement uncertainty of the actual physical thread.
        zones = [sample(zone)[0] for strip in np.array_split(array, 3, axis=0)
                 for zone in np.array_split(strip, 3, axis=1)]
        rows.append({'code': code, 'name': name, 'page': page_number, 'roi': list(roi),
                     'catalogRGB': color['rgb'], 'sampleRGB': dict(zip('rgb', sampled)),
                     'popplerRGB': dict(zip('rgb', independent)), 'luminanceProxyP10P90': percentiles,
                     'spatialRGB': [dict(zip('rgb', zone)) for zone in zones],
                     'exactReproduction': sampled == list(color['rgb'].values())})
    report = {'sourceSHA256': digest, 'pageCount': len(doc), 'iccProfiles': profiles,
              'renderDPI': 216, 'pymupdfVersion': fitz.VersionBind,
              'colorCount': len(rows), 'exactReproductions': sum(r['exactReproduction'] for r in rows),
              'notes': 'Spatial variation and renderer disagreement are digital diagnostics, not physical fidelity measurements.',
              'colors': rows}
    (ROOT / 'data/color-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print('Audited', len(rows), 'codes/names/regions; exactly reproduced', report['exactReproductions'])


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('pdf')
    parser.add_argument('--poppler-dir', required=True)
    args = parser.parse_args()
    audit(args.pdf, args.poppler_dir)
