$ErrorActionPreference = 'Stop'
if (Get-Process -Name Illustrator -ErrorAction SilentlyContinue) { throw 'Cierra Illustrator antes de instalar ThreadMatch.' }
$extensionName = 'com.threadmatch.illustrator'
$source = Join-Path $PSScriptRoot $extensionName
if (!(Test-Path (Join-Path $source 'CSXS\manifest.xml'))) { throw 'Extrae el ZIP completo antes de ejecutar el instalador.' }
$integrity = Join-Path $PSScriptRoot 'INTEGRITY.sha256'
if (!(Test-Path $integrity)) { throw 'Falta INTEGRITY.sha256. Descarga y extrae el paquete completo.' }
foreach ($line in Get-Content -LiteralPath $integrity) {
 if ($line -notmatch '^([0-9a-f]{64})  (com[.]threadmatch[.]illustrator/[^\r\n]+)$') { throw 'Manifiesto de integridad invalido.' }
 $expected = $Matches[1]
 $file = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot $Matches[2]))
 $rootPath = [IO.Path]::GetFullPath($source) + [IO.Path]::DirectorySeparatorChar
 if (!$file.StartsWith($rootPath,[StringComparison]::OrdinalIgnoreCase) -or !(Test-Path -LiteralPath $file) -or (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLower() -ne $expected) { throw 'Paquete incompleto o corrupto. Descargalo de nuevo.' }
}
$extensions = Join-Path $env:APPDATA 'Adobe\CEP\extensions'
$stateDir = Join-Path $env:APPDATA 'ThreadMatch'
$stateFile = Join-Path $stateDir 'cep-install-state.json'
New-Item -ItemType Directory -Force -Path $extensions,$stateDir | Out-Null
$target = Join-Path $extensions $extensionName
$stage = Join-Path $stateDir ('stage-' + [guid]::NewGuid().ToString())
$previous = Join-Path $stateDir 'previous-extension'
$settings = @()
foreach ($version in @(11,12)) {
 $key = "HKCU:\Software\Adobe\CSXS.$version"
 $item = Get-ItemProperty -Path $key -ErrorAction SilentlyContinue
 $property = if ($item) { $item.PSObject.Properties['PlayerDebugMode'] } else { $null }
 $settings += @{key=$key; existed=($null -ne $property); value=$(if($property){[string]$property.Value}else{$null}); kind=$(if($property){[string](Get-Item $key).GetValueKind('PlayerDebugMode')}else{$null})}
}
Copy-Item -LiteralPath $source -Destination $stage -Recurse
$movedPrevious = $false
$installedNew = $false
try {
 if (Test-Path $previous) { Remove-Item -LiteralPath $previous -Recurse -Force }
 if (Test-Path $target) { Move-Item -LiteralPath $target -Destination $previous; $movedPrevious=$true }
 Move-Item -LiteralPath $stage -Destination $target
 $installedNew = $true
 if (!(Test-Path $stateFile)) { @{settings=$settings} | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 -Path $stateFile }
 foreach ($setting in $settings) {
  $registryKey = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($setting.key.Substring(6))
  $registryKey.Close()
  New-ItemProperty -Path $setting.key -Name PlayerDebugMode -Value '1' -PropertyType String -Force | Out-Null
 }
 # Keep one previous extension for an explicit rollback; preferences are unchanged.
 Write-Host 'ThreadMatch instalado. Abre Illustrator > Ventana > Extensiones > ThreadMatch.' -ForegroundColor Green
 Write-Host 'Es una extension local sin firma: PlayerDebugMode se ha habilitado para CEP 11 y 12 en tu usuario.'
} catch {
 if ($installedNew -and (Test-Path $target)) { Remove-Item -LiteralPath $target -Recurse -Force }
 if ($movedPrevious -and (Test-Path $previous)) { Move-Item -LiteralPath $previous -Destination $target }
 foreach ($setting in $settings) {
  if ($setting.existed) { New-ItemProperty -Path $setting.key -Name PlayerDebugMode -Value $setting.value -PropertyType $setting.kind -Force | Out-Null }
  else { Remove-ItemProperty -Path $setting.key -Name PlayerDebugMode -ErrorAction SilentlyContinue }
 }
 throw
} finally { if (Test-Path $stage) { Remove-Item -LiteralPath $stage -Recurse -Force } }
