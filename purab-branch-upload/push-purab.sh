#!/usr/bin/env bash
# Run from inside the purab-branch-upload folder after unzipping. Needs git and a clone-able GitHub login.
set -e
git clone https://github.com/giannaf5027/Cooking-Quest.git cq-tmp
cd cq-tmp
git checkout Purab
git config user.name "Purab Ojha"
git config user.email "purabbookmaster@gmail.com"
cp -R ../purab-branch/. .
git add -A
git commit -m "Add pre-login portal, recipe request bar, and dashboard functionality"
git push origin Purab
cd .. && rm -rf cq-tmp
echo "Done: pushed to Purab."
