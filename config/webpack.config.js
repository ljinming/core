const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssNormalize = require('postcss-normalize');
const TerserPlugin = require('terser-webpack-plugin');
const paths = require('./paths');


const useTypeScript = fs.existsSync(paths.appTsConfig);

const imageInlineSizeLimit = parseInt(
    process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
  );

const reactRefreshOverlayEntry = require.resolve(
    'react-dev-utils/refreshOverlayInterop'
  );

module.exports = function (webpackEnv){
    const isEnvDevelopment = webpack === 'development';
    const isEnvProduction = webpack === 'production';


    const isEnvProductionProfile = isEnvProduction && process.argv.includes('--profile')

    
// Source maps are resource heavy and can cause out of memory issue for large source files.
    const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

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
                new moduleScopePlugin(paths.appSrc,[
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
                              ),    v 
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
                    ]
                }
            ]
        }
    }
}