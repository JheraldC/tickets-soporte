[CmdletBinding()]
param()

$repoRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $repoRoot '.lab-logs\tool-paths.json'
if (-not (Test-Path -LiteralPath $configPath)) {
    throw 'Falta la configuracion local .lab-logs\tool-paths.json. Revisar la bitacora del Paso 0.'
}
$labTools = Get-Content -LiteralPath $configPath -Raw -Encoding UTF8 | ConvertFrom-Json
$binPaths = @($labTools.GitBin, $labTools.UvBin, $labTools.LabBin, $labTools.CodexBin)
foreach ($directory in $binPaths) {
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        throw "No existe el directorio de herramientas: $directory"
    }
}
$env:PATH = (@($binPaths) + @($env:PATH -split ';') | Select-Object -Unique) -join ';'
$env:UV_TOOL_DIR = Join-Path $labTools.ToolRoot 'tools'
$env:UV_TOOL_BIN_DIR = $labTools.LabBin
$env:UV_PYTHON_INSTALL_DIR = Join-Path $labTools.ToolRoot 'python'
$env:UV_PYTHON_BIN_DIR = $labTools.LabBin
$env:UV_CACHE_DIR = Join-Path $labTools.ToolRoot 'cache'
Write-Output 'Entorno del laboratorio cargado para esta sesion de PowerShell.'
Get-Command git, gh, python, uv, specify, codex, node, npm.cmd -ErrorAction Stop | Select-Object Name, Source
