param([switch]$RestoreDebugSettings)
$ErrorActionPreference='Stop'
if (Get-Process -Name Illustrator -ErrorAction SilentlyContinue) { throw 'Cierra Illustrator antes de desinstalar ThreadMatch.' }
$target=Join-Path $env:APPDATA 'Adobe\CEP\extensions\com.threadmatch.illustrator'
if(Test-Path $target){Remove-Item -LiteralPath $target -Recurse -Force}
$stateFile=Join-Path $env:APPDATA 'ThreadMatch\cep-install-state.json'
if($RestoreDebugSettings -and (Test-Path $stateFile)){
 $state=Get-Content -Raw $stateFile | ConvertFrom-Json
 foreach($setting in $state.settings){
  $current=Get-ItemProperty -Path $setting.key -Name PlayerDebugMode -ErrorAction SilentlyContinue
  if($current -and [string]$current.PlayerDebugMode -eq '1'){
   if($setting.existed){New-ItemProperty -Path $setting.key -Name PlayerDebugMode -Value $setting.value -PropertyType $setting.kind -Force | Out-Null}
   else{Remove-ItemProperty -Path $setting.key -Name PlayerDebugMode -ErrorAction SilentlyContinue}
  }
 }
 Remove-Item -LiteralPath $stateFile -Force
}
Write-Host 'ThreadMatch desinstalado.' -ForegroundColor Green
