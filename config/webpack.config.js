const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');

const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const postcssNormalize = require('postcss-normalize');
const TerserPlugin = require('terser-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const paths = require('./paths');
const useTypeScript = fs.existsSync(paths.appTsConfig);

const imageInlineSizeLimit = parseInt(
    process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
  );

const reactRefreshOverlayEntry = require.resolve(
    'react-dev-utils/refreshOverlayInterop'
  );

  const disableESLintPlugin = process.env.DISABLE_ESLINT_PLUGIN === 'true';

  const isEnvProductionProfile = isEnvProduction && process.argv.includes('--profile')

  const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

module.exports = function (webpackEnv){
    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';

// Source maps are resource heavy and can cause out of memory issue for large source files.

    function getClientEnvironment(publicUrl){
        const raw ={
            NODE_ENV:process.env.NODE_ENV || 'development',
            PUBLIC_URL:publicUrl,
            FAST_REFRESH:process.env.FAST_REFRESH !== false
        };
        const stringified={
            'process.env':Object.keys(raw).reduce((env,key)=>{
                env[key] = JSON.stringify(raw[key]);
                return env

            },{})
        }
        return {raw,stringified};
    }

    const env = getClientEnvironment('');

    const shouldUseReactRefresh = env.raw.FAST_REFRESH;

    const getStyleLoaders =(cssOptions,preProcessor) => {  // style loaders
        const loaders =[
            isEnvDevelopment && require.resolve('style-loader'),
            isEnvProduction && {
                loader:MiniCssExtractPlugin.loader,
                options:paths.publicUrlOrPath.startsWith('.')? {publicPath:'../../'}:{}, 
            },
            {
                loader:require.resolve('css-loader'),
                options:cssOptions,
            },
            {
                loader:require.resolve('postcss-loader'),
                options:{
                    ident:'postcss',
                    plugins:()=>[
                        require('postcss-flexbugs-fixes'),
                        require('postcss-preset-env')({
                            autoprefixer:{
                                flexbox:'no-2009'
                            },
                            stage:3
                        }),
                        postcssNormalize(),
                    ],
                    sourceMap:isEnvProduction? shouldUseSourceMap /*bool*/ :isEnvDevelopment,
                }
            }
        ].filter(Boolean);

        if(preProcessor){
            loaders.push(
                {
                    loader:require.resolve('resolve-url-loader'),
                    options:isEnvProduction?shouldUseSourceMap :isEnvDevelopment,
                    root:paths.appSrc,
                },
                {
                    loader:require.resolve(preProcessor),
                    options:{
                        sourceMap:true
                    }
                }
            )
        }
        return loaders;
    }

    return {
        mode:isEnvProduction ? 'production' : isEnvDevelopment&&'development',
        bail:isEnvProduction, // 在第一个错误出现时抛出失败结果，而不是容忍它
        devtool:  // 如何生产sourcemap ,不同的值会明显影响到构建(build)和重新构建(rebuild)的速度。
        isEnvProduction ?
         shouldUseSourceMap ? 'source-map':false 
         : isEnvDevelopment && 'cheap-module-source-map',

         entry : isEnvProduction && !shouldUseReactRefresh ? 
                [webpackDevClientEntry, paths.appIndexJs]:paths.appIndexJs,

        output :{
        path:isEnvProduction ?paths.appBuild : undefined, // output 目录对应一个绝对路径。
        pathinfo:isEnvProduction, // 告知 webpack 在 bundle 中引入「所包含模块信息」的相关注释
            //filename 决定了每个输出 bundle 的名称。这些 bundle 将写入到 output.path 选项指定的目录下。
        filename :isEnvProduction? 'static/js/[name].[contenthash:8].js':isEnvDevelopment && 'static/ks/bundle.js',
        futureEmitAssets:true, //回收机制
        chunkFilename:isEnvProduction ? 'static/js/[name].[contenthash:8].chunk.js':isEnvDevelopment && 'static/js/[name].chunk.js',
        publicPath:paths.publicUrlOrPath,
        devtoolModuleFilenameTemplate:isEnvProduction 
                    ?(info)=>
                     path
                     .relative(paths.appSrc,info.absoluteResourcePath).replace(/\\/g,'/')
                     :isEnvDevelopment && ((info)=>path.resolve(info.absoluteResourcePath).replace(/\\/g,'/')),
        uniqueName:`webpackJson${appPackageJson.name}`,
        globalObject:'this',
        },
        optimization:{  // 优化
            minimize:isEnvProduction,
            minimizer:[  //允许你通过提供一个或多个定制过的 TerserPlugin 实例，覆盖默认压缩工具(minimizer)
                new TerserPlugin({
                    terserOptions:{parse:{
                        ecma:8,
                    },
                    compress:{
                        ecma:5,
                        warnings:false,
                        comparison:false,
                        inline:2
                    },
                    mangle:{
                        safari10:true,
                    },
                    keep_classnames:isEnvProductionProfile,
                    keep_fnames:isEnvProductionProfile,
                    output:{
                        ecma:5,
                        comments:false,
                        ascii_only:true,
                    }
                },
                sourceMap:shouldUseSourceMap,
                }),
            ],
            splitChunks:{
                chunks:'all',
                name:isEnvDevelopment,
            },
            runtimeChunk:{
                name:(entrypoint)=> `runtime-${entrypoint.name}`
            }
        },

        resolve:{
            modules:['node_modules',paths.appNodeModules],
            extensions:paths.moduleFileExtensions.map(ext=>`.${ext}`).filter((ext)=>useTypeScript || !ext.includes('ts')),
            alias:{
                "react-native":'react-native-web',
                ...(isEnvProductionProfile && {
                    'react-dom$':'react-dom/profiling',
                    'scheduler/tracing':'scheduler/tracing-profiling',
                }),
                '@':path.resolve(__dirname,'../src'),
            },
            plugins:[
                new ModuleScopePlugin(paths.appSrc,[
                    paths.appPackageJson,
                    reactRefreshOverlayEntry,
                ])
            ]       
        },
        module:{
            strictExportPresence:true,
            rules:[
                {parser:{requireEnsure:false}},
                {
                    oneOf:[
                        {
                            test:[/\.avif$/],
                            loader:require.resolve('url-loader'),
                            options:{
                                limit:imageInlineSizeLimit,
                                mimetype:'image/avif',
                                name:'static/media/[name].[hash:8],[ext]',
                            }
                        },
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: require.resolve('url-loader'),
                            options: {
                                limit: imageInlineSizeLimit,
                                name: 'static/media/[name].[hash:8].[ext]',
                            },
                        },
                        {
                            test: /\.(js|mjs|jsx|ts|tsx)$/,
                            include: paths.appSrc,
                            loader: require.resolve('babel-loader'),
                            options: {
                              customize: require.resolve(
                                'babel-preset-react-app/webpack-overrides'
                              ),  
                              presets: [
                                [
                                  require.resolve('babel-preset-react-app'),
                                  {
                                    runtime: hasJsxRuntime ? 'automatic' : 'classic',
                                  },
                                ],
                              ],
              
                              plugins: [
                                [
                                  require.resolve('babel-plugin-named-asset-import'),
                                  {
                                    loaderMap: {
                                      svg: {
                                        ReactComponent:
                                          '@svgr/webpack?-svgo,+titleProp,+ref![path]',
                                      },
                                    },
                                  },
                                ],
                                isEnvDevelopment &&
                                  shouldUseReactRefresh &&
                                  require.resolve('react-refresh/babel'),
                              ].filter(Boolean),
                              // This is a feature of `babel-loader` for webpack (not Babel itself).
                              // It enables caching results in ./node_modules/.cache/babel-loader/
                              // directory for faster rebuilds.
                              cacheDirectory: true,
                              // See #6846 for context on why cacheCompression is disabled
                              cacheCompression: false,
                              compact: isEnvProduction,
                            },
                          },
                          {
                              test :/\.(js|mjs)$/,
                              exclude:/@babel(?:\/|\\{1,2}runtime)/,
                              loader:require.resolve('babel_loader'),
                              options:{
                                  babelrc:false,
                                  configFile: false,
                                  compact: false,
                                  presets: [
                                    [
                                      require.resolve('babel-preset-react-app/dependencies'),
                                      {helpers: true},
                                    ],
                                  ],
                                  cacheDirectory: true,
                                  cacheCompression: false,
                                  sourceMaps: shouldUseSourceMap,
                                  inputSourceMap: shouldUseSourceMap,
                              },
                          },
                          {
                            test: cssRegex,
                            exclude: cssModuleRegex,
                            use: getStyleLoaders({
                              importLoaders: 1,
                              sourceMap: isEnvProduction
                                ? shouldUseSourceMap
                                : isEnvDevelopment,
                            }),
                            // Don't consider CSS imports dead code even if the
                            // containing package claims to have no side effects.
                            // Remove this when webpack adds a warning or an error for this.
                            // See https://github.com/webpack/webpack/issues/6571
                            sideEffects: true,
                          },

                          {
                            test: cssModuleRegex,
                            use: getStyleLoaders({
                              importLoaders: 1,
                              sourceMap: isEnvProduction
                                ? shouldUseSourceMap
                                : isEnvDevelopment,
                              modules: {
                                getLocalIdent: getCSSModuleLocalIdent,
                              },
                            }),
                          },

                          {
                            test: sassRegex,
                            exclude: sassModuleRegex,
                            use: getStyleLoaders(
                              {
                                importLoaders: 3,
                                sourceMap: isEnvProduction
                                  ? shouldUseSourceMap
                                  : isEnvDevelopment,
                              },
                              'sass-loader'
                            ),
                            // Don't consider CSS imports dead code even if the
                            // containing package claims to have no side effects.
                            // Remove this when webpack adds a warning or an error for this.
                            // See https://github.com/webpack/webpack/issues/6571
                            sideEffects: true,
                          },
                          {
                            test: sassModuleRegex,
                            use: getStyleLoaders(
                              {
                                importLoaders: 3,
                                sourceMap: isEnvProduction
                                  ? shouldUseSourceMap
                                  : isEnvDevelopment,
                                modules: {
                                  getLocalIdent: getCSSModuleLocalIdent,
                                },
                              },
                              'sass-loader'
                            ),
                          },
                          {
                            loader: require.resolve('file-loader'),
                            // Exclude `js` files to keep "css" loader working as it injects
                            // its runtime that would otherwise be processed through "file" loader.
                            // Also exclude `html` and `json` extensions so they get processed
                            // by webpacks internal loaders.
                            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                            options: {
                              name: 'static/media/[name].[hash:8].[ext]',
                            },
                          },
                    ]
                }
            ]
        },
        plugins:[
            new HtmlWebpackPlugin(
                Object.assign(
                    {},
                    {
                      title: 'MyTitle',
                      inject: true,
                      template: paths.appHtml,
                    },
                    isEnvProduction
                      ? {
                          minify: {
                            removeComments: true,
                            collapseWhitespace: true,
                            removeRedundantAttributes: true,
                            useShortDoctype: true,
                            removeEmptyAttributes: true,
                            removeStyleLinkTypeAttributes: true,
                            keepClosingSlash: true,
                            minifyJS: true,
                            minifyCSS: true,
                            minifyURLs: true,
                          },
                        }
                      : undefined
                  )
            ),
            isEnvProduction &&
            shouldInlineRuntimeChunk &&
            new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
            new ModuleNotFoundPlugin(paths.appPath),
            new webpack.DefinePlugin(env.stringified),
            isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
            isEnvDevelopment &&shouldUseReactRefresh &&
                                new ReactRefreshWebpackPlugin({
                                overlay: {
                                    entry: webpackDevClientEntry,
                                    // The expected exports are slightly different from what the overlay exports,
                                    // so an interop is included here to enable feedback on module-level errors.
                                    module: reactRefreshOverlayEntry,
                                    // Since we ship a custom dev client and overlay integration,
                                    // the bundled socket handling logic can be eliminated.
                                    sockIntegration: false,
                                },
                                }),
        isEnvDevelopment && new CaseSensitivePathsPlugin(),
        isEnvDevelopment &&
        new WatchMissingNodeModulesPlugin(paths.appNodeModules),
        isEnvProduction &&
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
        new ManifestPlugin({
            fileName: 'asset-manifest.json',
            publicPath: paths.publicUrlOrPath,
            generate: (seed, files, entrypoints) => {
              const manifestFiles = files.reduce((manifest, file) => {
                manifest[file.name] = file.path;
                return manifest;
              }, seed);
              const entrypointFiles = entrypoints.main.filter(
                (fileName) => !fileName.endsWith('.map')
              );
    
              return {
                files: manifestFiles,
                entrypoints: entrypointFiles,
              };
            },
          }),
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

          useTypeScript &&
        new ForkTsCheckerWebpackPlugin({
          typescript: resolve.sync('typescript', {
            basedir: paths.appNodeModules,
          }),
          async: isEnvDevelopment,
          checkSyntacticErrors: true,
          tsconfig: paths.appTsConfig,
          reportFiles: [
            // This one is specifically to match during CI tests,
            // as micromatch doesn't match
            // '../cra-template-typescript/template/src/App.tsx'
            // otherwise.
            '../**/src/**/*.{ts,tsx}',
            '**/src/**/*.{ts,tsx}',
            '!**/src/**/__tests__/**',
            '!**/src/**/?(*.)(spec|test).*',
            '!**/src/setupProxy.*',
            '!**/src/setupTests.*',
          ],
          silent: true,
          // The formatter is invoked directly in WebpackDevServerUtils during development
          formatter: isEnvProduction ? typescriptFormatter : undefined,
        }),
        !disableESLintPlugin &&
        new ESLintPlugin({
          // Plugin options
          extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
          formatter: require.resolve('react-dev-utils/eslintFormatter'),
          eslintPath: require.resolve('eslint'),
          emitWarning: isEnvDevelopment && emitErrorsAsWarnings,
          context: paths.appSrc,
          cache: true,
          cacheLocation: path.resolve(
            paths.appNodeModules,
            '.cache/.eslintcache'
          ),
          // ESLint class options
          cwd: paths.appPath,
          resolvePluginsRelativeTo: __dirname,
          baseConfig: {
            extends: [require.resolve('eslint-config-react-app/base')],
            rules: {
              ...(!hasJsxRuntime && {
                'react/react-in-jsx-scope': 'error',
              }),
            },
          },
        }),
        ].filter(Boolean),
        node: {
            module: 'empty',
            dgram: 'empty',
            dns: 'mock',
            fs: 'empty',
            http2: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty',
          },
          performance: false,
    }
}