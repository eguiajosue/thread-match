"""Package Windows and macOS installers from built CEP source."""
from pathlib import Path
import hashlib,json,zipfile
ROOT=Path(__file__).resolve().parents[1]
version=json.loads((ROOT/'package.json').read_text())['version']
source=ROOT/'plugin';out=ROOT/'release';out.mkdir(exist_ok=True)
shared=['LEEME.md','VALIDACION.md','INTEGRITY.sha256']
platforms={'Windows':['Restore-Previous.ps1','Restaurar-version-anterior.bat','Install.ps1','Uninstall.ps1','Instalar-ThreadMatch.bat','Desinstalar-ThreadMatch.bat','Desinstalar-y-restaurar-ajustes.bat'],'macOS':['Restaurar-version-anterior.command','mac-preferences.sh','Instalar-ThreadMatch.command','Desinstalar-ThreadMatch.command','Desinstalar-y-restaurar-ajustes.command']}
checksums=[]
for platform,names in platforms.items():
 dest=out/f'ThreadMatch-{platform}-v{version}.zip'
 files=sorted(p for p in (source/'com.threadmatch.illustrator').rglob('*') if p.is_file())+[source/n for n in shared+names]
 with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED) as archive:
  for p in files:
   info=zipfile.ZipInfo(p.relative_to(source).as_posix());info.compress_type=zipfile.ZIP_DEFLATED;info.create_system=3
   info.external_attr=((0o100755 if p.suffix in ['.command','.sh'] else 0o100644)<<16)
   archive.writestr(info,p.read_bytes())
 with zipfile.ZipFile(dest) as archive:assert archive.testzip() is None
 checksums.append(hashlib.sha256(dest.read_bytes()).hexdigest()+'  '+dest.name)
 print(dest.name)
(out/'SHA256SUMS.txt').write_text('\n'.join(checksums)+'\n')
