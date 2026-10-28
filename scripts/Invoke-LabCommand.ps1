[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Step,
    [Parameter(Mandatory = $true)][string]$Command,
    [Parameter(Mandatory = $true)][string]$Objective,
    [string]$PublicCommand,
    [string]$Solution = '',
    [switch]$RedactOutput,
    [switch]$TranscriptOnly,
    [int[]]$SuccessExitCodes = @(0)
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $repoRoot '.lab-logs'
$bitacoraPath = Join-Path $repoRoot 'docs\bitacora-laboratorio.md'
$null = New-Item -ItemType Directory -Path $logDir -Force
$utf8 = New-Object System.Text.UTF8Encoding($false)
$started = [TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTimeOffset]::UtcNow, 'SA Pacific Standard Time')
$cwd = (Get-Location).Path
$safeStep = $Step -replace '[^0-9A-Za-z.-]', '_'
$recordPath = Join-Path $logDir ($started.ToString('yyyyMMdd-HHmmss-fff') + '-' + $safeStep + '.txt')
if (-not $PublicCommand) { $PublicCommand = $Command }

function ConvertTo-PublicText([string]$Value) {
    $Value = [regex]::Replace($Value, '(?im)^\s*(?:[-*]\s*)?(?:Token:|Authorization:\s*Bearer).*$','[linea de credencial omitida]')
    $Value = [regex]::Replace($Value, '(?i)\b(?:gh[pousr]_[A-Za-z0-9_]{10,}|github_pat_[A-Za-z0-9_]{10,}|sk-(?:proj-)?[A-Za-z0-9_-]{16,})\b','[credencial omitida]')
    $Value = [regex]::Replace($Value, '(?is)-----BEGIN [^-]*PRIVATE KEY-----.*?-----END [^-]*PRIVATE KEY-----','[clave privada omitida]')
    [regex]::Replace($Value, '(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}', '[correo omitido]')
}

$transcriptStarted = $false
try {
    Start-Transcript -Path (Join-Path $logDir 'comandos-transcript.txt') -Append -ErrorAction Stop | Out-Null
    $transcriptStarted = $true
} catch {
    Write-Warning 'No se inicio otro transcript; el registro individual se conserva igualmente.'
}

$global:LASTEXITCODE = 0
$captured = [System.Collections.Generic.List[object]]::new()
$caught = $null
try {
    & ([ScriptBlock]::Create($Command)) 2>&1 | ForEach-Object { $captured.Add($_) }
} catch {
    $caught = $_
    $captured.Add($_)
}
$nativeCode = $global:LASTEXITCODE
$commandErrors = @($captured | Where-Object {
    $_ -is [System.Management.Automation.ErrorRecord] -and $_.FullyQualifiedErrorId -notlike 'NativeCommandError*'
})
$ok = ($null -eq $caught) -and ($commandErrors.Count -eq 0) -and ($SuccessExitCodes -contains $nativeCode)
$status = if ($ok) { 'exitoso' } else { 'fallido' }
$outputText = ($captured | Out-String -Width 220).TrimEnd()
if (-not $outputText) { $outputText = '(Sin salida.)' }
$publicOutput = if ($RedactOutput) { '(Salida omitida del documento publico; respaldo local disponible.)' } else { ConvertTo-PublicText $outputText }
if ($publicOutput.Length -gt 14000) { $publicOutput = $publicOutput.Substring(0, 14000) + "`n[Salida publica abreviada; respaldo completo local.]" }
$commandBlock = ((ConvertTo-PublicText $PublicCommand) -split '\r?\n' | ForEach-Object { if ([string]::IsNullOrWhiteSpace($_)) { '' } else { '    ' + $_.TrimEnd() } }) -join "`n"
$outputBlock = ($publicOutput -split '\r?\n' | ForEach-Object { if ([string]::IsNullOrWhiteSpace($_)) { '' } else { '    ' + $_.TrimEnd() } }) -join "`n"
$entry = "`n#### Registro $Step - $Objective`n`n- Fecha y hora: $($started.ToString('yyyy-MM-dd HH:mm:ss zzz')) (Lima).`n- Directorio: $cwd.`n- Objetivo: $Objective`n- Comando exacto (datos personales o secretos omitidos si corresponde):`n`n$commandBlock`n`n- Resultado y salida relevante:`n`n$outputBlock`n`n- Estado: $status (codigo nativo: $nativeCode).`n"
if ($Solution) { $entry += "- Error o solucion: $(ConvertTo-PublicText $Solution)`n" }
if (-not $ok -and -not $Solution) { $entry += "- Error o solucion: revisar la salida anterior; la correccion se documentara en el siguiente registro.`n" }
$entry += "`n"

$privateRecord = "Fecha: $($started.ToString('o'))`r`nDirectorio: $cwd`r`nComando:`r`n$Command`r`nEstado: $status`r`nCodigo: $nativeCode`r`nSalida:`r`n$(ConvertTo-PublicText $outputText)`r`n"
[IO.File]::WriteAllText($recordPath, $privateRecord, $utf8)
if (-not $TranscriptOnly) {
    $document = [IO.File]::ReadAllText($bitacoraPath, [Text.Encoding]::UTF8)
    $markerIndex = $document.IndexOf('### Pasos posteriores')
    if ($markerIndex -lt 0) { throw 'No se encontro el lugar de insercion en la bitacora.' }
    $document = $document.Insert($markerIndex, $entry)
    [IO.File]::WriteAllText($bitacoraPath, $document, $utf8)
}
Write-Output (ConvertTo-PublicText $PublicCommand)
Write-Output $publicOutput
Write-Output "Registro ${Step}: $status; $recordPath"
if ($transcriptStarted) { Stop-Transcript | Out-Null }
if (-not $ok) { throw "El comando del registro $Step fallo. La bitacora conserva el resultado." }
