# Maintenance & Workflows

## Bulk Updating Dependencies (NPM)

When Dependabot opens multiple Pull Requests for individual package updates, it is often much faster and safer to update all dependencies at once locally and submit a single PR. 

Running `npm install` alone will **not** update packages to their latest versions because they are locked in `package-lock.json`. 

Instead, use `npm-check-updates` to force-bump all packages to their latest stable versions simultaneously.

### The 4-Step Bulk Update Workflow

1. **Check out your `dev` branch and pull latest changes:**
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Force-bump all versions in `package.json` to the absolute latest:**
   *(This requires `npm-check-updates` which is run via `npx`)*
   ```bash
   npx npm-check-updates -u
   ```

3. **Install the new versions and update the lockfile:**
   ```bash
   npm install
   ```

4. **Commit and push a single Pull Request:**
   ```bash
   git checkout -b chore/bulk-update-dependencies
   git commit -am "chore(deps): bulk update all packages to latest"
   git push -u origin chore/bulk-update-dependencies
   ```

**Post-Merge Action:** Once you merge this single PR into `dev`, you can safely close all the individual open Dependabot PRs!
