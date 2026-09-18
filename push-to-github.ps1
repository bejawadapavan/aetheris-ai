param(
    [Parameter(Mandatory=$false)]
    [string]$RepoUrl
)

if (-not $RepoUrl) {
    $username = Read-Host "Enter your GitHub username (e.g. bejawadapavankumargoud)"
    $repoName = Read-Host "Enter repository name [default: aetheris-ai]"
    if (-not $repoName) { $repoName = "aetheris-ai" }
    $RepoUrl = "https://github.com/$username/$repoName.git"
}

Write-Host "Setting remote origin to $RepoUrl..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $RepoUrl
git branch -M main

Write-Host "Pushing main branch to GitHub..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSUCCESS! Your code is now live on GitHub." -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Render.com: Deploy 'server' directory with your MongoDB Atlas URI"
    Write-Host "2. Vercel.com: Deploy 'client' directory with VITE_API_URL"
} else {
    Write-Host "`nIf push failed, make sure you created the repository first at https://github.com/new" -ForegroundColor Red
}
