[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Step,
    [Parameter(Mandatory = $true)][string]$Command,
    [Parameter(Mandatory = $true)][string]$Objective,
    [string]$PublicCommand,
    [string]$Solution = '',
    [switch]$RedactOutput,
    # Compatibility with previous calls: all technical records are now local.
    [switch]$TranscriptOnly,
    [int[]]$SuccessExitCodes = @(0)
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $repoRoot '.lab-logs'
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
$displayOutput = if ($RedactOutput) { '(Salida omitida de pantalla; respaldo local disponible.)' } else { ConvertTo-PublicText $outputText }
if ($displayOutput.Length -gt 14000) { $displayOutput = $displayOutput.Substring(0, 14000) + "`n[Salida de pantalla abreviada; respaldo completo local.]" }
$privateRecord = "Fecha: $($started.ToString('o'))`r`nDirectorio: $cwd`r`nObjetivo: $(ConvertTo-PublicText $Objective)`r`nComando:`r`n$Command`r`nEstado: $status`r`nCodigo: $nativeCode`r`nError o solucion: $(ConvertTo-PublicText $Solution)`r`nSalida:`r`n$(ConvertTo-PublicText $outputText)`r`n"
[IO.File]::WriteAllText($recordPath, $privateRecord, $utf8)
Write-Output (ConvertTo-PublicText $PublicCommand)
Write-Output $displayOutput
Write-Output "Registro local ${Step}: $status; $recordPath"
if ($transcriptStarted) { Stop-Transcript | Out-Null }
if (-not $ok) { throw "El comando del registro $Step fallo. El respaldo local conserva el resultado." }
