$ErrorActionPreference = 'Stop'
if (Get-Process -Name Illustrator -ErrorAction SilentlyContinue) { throw 'Cierra Illustrator antes de restaurar ThreadMatch.' }
$stateRoot = Join-Path $env:APPDATA 'ThreadMatch'
$previous = Join-Path $stateRoot 'previous-extension'
$target = Join-Path $env:APPDATA 'Adobe\CEP\extensions\com.threadmatch.illustrator'
$stage = Join-Path $stateRoot ('restore-' + [guid]::NewGuid().ToString())
if (!(Test-Path (Join-Path $previous 'CSXS\manifest.xml'))) { throw 'No hay una version anterior guardada.' }
$moved = $false
try {
 if (Test-Path $target) { Move-Item -LiteralPath $target -Destination $stage; $moved = $true }
 Move-Item -LiteralPath $previous -Destination $target
 if ($moved) { Move-Item -LiteralPath $stage -Destination $previous }
 Write-Host 'Version anterior restaurada. Tus favoritos y opciones se conservan.'
} catch {
 if (!(Test-Path $target) -and (Test-Path $stage)) { Move-Item -LiteralPath $stage -Destination $target }
 throw
}
