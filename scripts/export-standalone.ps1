# Build a standalone CV site (1 repo = 1 CV for employers)
# Usage: .\scripts\export-standalone.ps1 -Id java
# Output: repo/repo_CV_Java/deploy/  (push this folder as its own GitHub repo)

param(
    [Parameter(Mandatory = $true)]
    [string]$Id,
    [string]$RepoFolder = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent

function Get-HubPinHash([string]$Pin) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes("${Pin}:cv-hub-gate")
    $hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
    return -join ($hash | ForEach-Object { $_.ToString("x2") })
}

$hubUrl = "https://dangduy2812.github.io/digitalCVcuaDang.github.io/"
$pinHash = ""
$secretPath = Join-Path $Root ".hub-secret.local.json"
if (Test-Path $secretPath) {
    $secret = Get-Content $secretPath -Raw | ConvertFrom-Json
    if ($secret.hubUrl) { $hubUrl = $secret.hubUrl }
    if ($secret.pin) { $pinHash = Get-HubPinHash $secret.pin }
}

# Resolve repo folder from registry or convention
if (-not $RepoFolder) {
    $registryPath = Join-Path $Root "CV_master_registry.json"
    if (Test-Path $registryPath) {
        $registry = Get-Content $registryPath -Raw | ConvertFrom-Json
        $entry = $registry.cvs | Where-Object { $_.id -eq $Id } | Select-Object -First 1
        if ($entry -and $entry.repoFolder) {
            $RepoFolder = $entry.repoFolder
        }
    }
    if (-not $RepoFolder) {
        $cap = $Id.Substring(0, 1).ToUpper() + $Id.Substring(1)
        $RepoFolder = "repo_CV_$cap"
    }
}

$CvSrc = Join-Path $Root "repo\$RepoFolder"
$Out = Join-Path $CvSrc "deploy"

if (-not (Test-Path (Join-Path $CvSrc "cv.json"))) {
    Write-Error "CV not found: repo/$RepoFolder/cv.json"
}

Write-Host "Exporting standalone CV: $Id -> $Out"

if (Test-Path $Out) {
    Get-ChildItem $Out -Force | Where-Object { $_.Name -ne ".git" } | Remove-Item -Recurse -Force
} else {
    New-Item -ItemType Directory -Force -Path $Out | Out-Null
}

# Platform files (minimal JS set)
foreach ($dir in @("CV_master_css", "CV_master_fonts")) {
    Copy-Item (Join-Path $Root $dir) (Join-Path $Out $dir) -Recurse
}

$jsOut = Join-Path $Out "CV_master_js"
New-Item -ItemType Directory -Force -Path $jsOut | Out-Null
foreach ($js in @("i18n.js", "cv-paths.js", "cv-render.js", "script.js")) {
    Copy-Item (Join-Path $Root "CV_master_js\$js") (Join-Path $jsOut $js)
}

# CV-specific content (keep prefixed folder names)
Copy-Item (Join-Path $CvSrc "cv.json") (Join-Path $Out "cv.json")
Get-ChildItem $CvSrc -Directory | Where-Object { $_.Name -ne "deploy" } | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $Out $_.Name) -Recurse
}

# Patch demo HTML for standalone (back link → index.html, inject standalone config)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$demoStandaloneScript = @"
    <script>window.__CV_STANDALONE__ = { id: "$Id", dataUrl: "cv.json", assetBase: "", repoFolder: "$RepoFolder" };</script>
"@
Get-ChildItem $Out -Recurse -Filter "*.html" | Where-Object { $_.DirectoryName -match "_demos" } | ForEach-Object {
    $html = [System.IO.File]::ReadAllText($_.FullName)
    if ($html -notmatch '__CV_STANDALONE__') {
        $html = $html -replace '(</title>\s*)', "`$1$demoStandaloneScript"
    }
    $html = $html -replace 'href="cv\.html\?id=[^"]+"', 'href="index.html"'
    [System.IO.File]::WriteAllText($_.FullName, $html, $utf8NoBom)
}

# index.html from cv.html + standalone bootstrap
$cvHtml = Get-Content (Join-Path $Root "cv.html") -Raw
$standaloneScript = @"
    <script>
      window.__CV_STANDALONE__ = { id: "$Id", dataUrl: "cv.json", assetBase: "", repoFolder: "$RepoFolder", hubUrl: "$hubUrl", pinHash: "$pinHash" };
    </script>
"@
$cvHtml = $cvHtml -replace '(<script src="CV_master_js/i18n.js"></script>)', "$standaloneScript`n    `$1"
$cvHtml = $cvHtml -replace '<title>CV</title>', "<title>CV - $Id</title>"
$cvHtml = $cvHtml -replace '\s*<a href="index\.html" class="demo-back-link"[^>]*>.*?</a>', ''
$cvHtml = $cvHtml -replace '<a href="index\.html" class="brand">', '<a href="#" class="brand">'
[System.IO.File]::WriteAllText((Join-Path $Out "index.html"), $cvHtml, $utf8NoBom)

Write-Host "Done. Deploy folder: $Out"
Write-Host "  cd $Out"
Write-Host "  git init && git add . && git commit -m 'CV $Id'"
Write-Host "  gh repo create my-cv-$Id --public --source . --push"
