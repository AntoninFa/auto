# Aufruf:   .\dive.ps1
# ggf. vorher:  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# oder:         Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser

Param (
  [string]$base = 'distroless'
)

Set-StrictMode -Version Latest

$versionMinimum = [Version]'7.4.0'
$versionCurrent = $PSVersionTable.PSVersion
if ($versionMinimum -gt $versionCurrent) {
  throw "PowerShell $versionMinimum statt $versionCurrent erforderlich"
}

# Titel setzen
$host.ui.RawUI.WindowTitle = 'dive'

$diveVersion = 'v0.11.0'
$imagePrefix = 'juergenzimmermann/'
$imageBase = 'auto'
$imageTag = "2023.10.0-$base"
$image = "$imagePrefix${imageBase}:$imageTag"

docker run --rm --interactive --tty `
  --mount type='bind,source=/var/run/docker.sock,destination=/var/run/docker.sock' `
  --hostname dive --name dive `
  --read-only --cap-drop ALL `
  wagoodman/dive:$diveVersion $image
