param (
    [string]$Version = ""
)

$packageJsonPath = "package.json"
$manifestJsonPath = "manifest.json"
$readmePath = "README.md"

# 1. Read current version from package.json
if (-not (Test-Path $packageJsonPath)) {
    Write-Error "package.json not found in current directory!"
    exit 1
}

$packageJson = Get-Content $packageJsonPath -Encoding UTF8 -Raw | ConvertFrom-Json
$currentVersion = $packageJson.version
Write-Host "Current version: $currentVersion"

# 2. Determine new version
if ($Version -eq "") {
    $versionParts = $currentVersion -split '\.'
    $major = [int]$versionParts[0]
    $minor = [int]$versionParts[1]
    
    if ($versionParts[2] -match "^(\d+)(.*)$") {
        $patchNum = [int]$matches[1]
        $newPatch = $patchNum + 1
        $newVersion = "$major.$minor.$newPatch"
    }
    else {
        Write-Error "Could not parse patch version from $currentVersion"
        exit 1
    }
    
    Write-Host "Auto-incrementing to: $newVersion"
}
else {
    $newVersion = $Version
    Write-Host "Setting version to: $newVersion"
}

# 3. Update package.json
$packageJson.version = $newVersion
$packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath -Encoding UTF8
Write-Host "Updated package.json to $newVersion"

# 3.1 Update manifest.json
if (Test-Path $manifestJsonPath) {
    $manifestContent = Get-Content $manifestJsonPath -Raw -Encoding UTF8
    $manifestContent = $manifestContent -replace '"version":\s*"[^"]+"', "`"version`": `"$newVersion`""
    $manifestContent | Set-Content $manifestJsonPath -NoNewline -Encoding UTF8
    Write-Host "Updated manifest.json to $newVersion"
}

# 4. Update README.md
if (Test-Path $readmePath) {
    $readmeContent = Get-Content $readmePath -Raw -Encoding UTF8
    $today = Get-Date -Format "yyyy-MM-dd"
    $pattern = "\*Last updated .*? \(v.*?\)\*"
    $replacement = "*Last updated / 最後更新: $today (v$newVersion)*"
    
    if ($readmeContent -match $pattern) {
        $readmeContent = $readmeContent -replace $pattern, $replacement
        $readmeContent | Set-Content $readmePath -NoNewline -Encoding UTF8
        Write-Host "Updated README.md timestamp and version"
    }
    else {
        Write-Warning "Could not find 'Last updated' pattern in README.md."
    }
}

# 5. Git operations
Write-Host "Executing git commands..."

$userName = git config user.name
$userEmail = git config user.email
if (-not $userName -or -not $userEmail) {
    Write-Host "Configuring repository author identity..."
    git config user.name "Knight317"
    git config user.email "52955917+kingknight317@users.noreply.github.com"
}

git add .
git commit -m "v${newVersion}: Universal PotPlayer launcher, stream booster and full test coverage"
if ($LASTEXITCODE -ne 0) {
    Write-Error "git commit failed! Aborting tag and push."
    exit 1
}

git tag "v$newVersion"
git push
git push --tags

Write-Host "Done! Pushed v$newVersion to remote."
