#!/usr/bin/env node

const packageJson = require('../package.json');
const { program } = require('commander');
const path = require('path');
const validateProjectName = require('validate-npm-package-name');
const fs = require('fs-extra');

program
  .command(packageJson.name)
  .version(packageJson.version)
  //.arguments('<project-dir>')
  .action((name) => {
    projectName = name;
  })
  .parse(process.argv);

if (typeof projectName === 'undefined') {
  console.error('Please specify the project directory:');
  process.exit(1);
}

const root = path.resolve('core');
const appName = path.basename(root);
checkAppName(appName);

const sourcePath = path.resolve(__dirname, '../');

const files = fs
  .readdirSync(sourcePath)
  .filter((file) => !['bin', 'node_modules', 'package-lock.json', '.git'].includes(file));

files.forEach((file) => {
  const sourceFile = path.resolve(sourcePath, file);
  const targetFile = path.resolve(root, file);
  fs.copySync(sourceFile, targetFile);
});

function checkAppName(appName) {
  const validationResult = validateProjectName(appName);
  if (!validationResult.validForNewPackages) {
    console.error(`Cannot create a project named ${appName} because of npm naming restrictions:\n`);
    [...(validationResult.errors || []), ...(validationResult.warnings || [])].forEach((error) => {
      console.error(`  * ${error}`);
    });
    console.error('\nPlease choose a different project name.');
    process.exit(1);
  }

  // TODO: there should be a single place that holds the dependencies
  const dependencies = ['react', 'react-dom', 'react-scripts'].sort();
  if (dependencies.includes(appName)) {
    console.error(`Cannot create a project named ${appName} because a dependency with the same name exists.\n`);
    process.exit(1);
  }
}
