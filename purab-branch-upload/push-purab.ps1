# Run in PowerShell from inside the purab-branch-upload folder after unzipping.
$ErrorActionPreference = "Stop"
git clone https://github.com/giannaf5027/Cooking-Quest.git cq-tmp
Set-Location cq-tmp
git checkout Purab
git config user.name "Purab Ojha"
git config user.email "purabbookmaster@gmail.com"
Copy-Item -Path ..\purab-branch\* -Destination . -Recurse -Force
git add -A
git commit -m "Add pre-login portal, recipe request bar, and dashboard functionality"
git push origin Purab
Set-Location ..
Remove-Item -Recurse -Force cq-tmp
Write-Host "Done: pushed to Purab."
