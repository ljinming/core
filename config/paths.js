const path = require('path');

const moduleFileExtensions = [
    'web.mjs',
    'mjs',
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
  ];

module.exports ={
    appPath: path.resolve(__dirname,'../'),
    appHtml: path.resolve(__dirname,'../public/index.html'),
    appSrc:path.resolve(__dirname,'../src'),
    appIndexJs:path.resolve(__dirname,'../src/index.tsx'),
    appTsConfig:path.resolve(__dirname,'../tsconfig.json'),
    appPackageJson:path.resolve(__dirname,'../package.json'),
    appNodeModules:path.resolve(__dirname,'../node_modules'),
    moduleFileExtensions:moduleFileExtensions,
    publicUrlOrPath:'/'
   }


