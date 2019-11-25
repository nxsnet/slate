#!/bin/bash -e

# Updates the slate NPM packages after making a change in this repo
# Must be run from the repro root
# You must have the two repos checked out in the parent directory of this repo
# Include your commit message as the only argument to this script

yarn install
yarn build

cp packages/slate/package.json ../slate-package-fork/
cp packages/slate/lib/* ../slate-package-fork/lib/
cp packages/slate-react/package.json ../slate-react-package-fork/
cp packages/slate-react/lib/* ../slate-react-package-fork/lib/

cd ../slate-package-fork
if [ -n "$(git status --porcelain)" ]; then
  git add .
  git commit -am "$@"
  git push origin master
fi
echo "slate-package-fork: $(git rev-parse HEAD)"

cd ../slate-react-package-fork
if [ -n "$(git status --porcelain)" ]; then
  git add .
  git commit -am "$@"
  git push origin master
fi
echo "slate-react-package-fork: $(git rev-parse HEAD)"

cd ../slate-hotkeys-package-fork
if [ -n "$(git status --porcelain)" ]; then
  git add .
  git commit -am "$@"
  git push origin master
fi
echo "slate-hotkeys-package-fork: $(git rev-parse HEAD)"
