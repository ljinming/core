import ReactDom, { render } from 'react-dom';
import {createBrowserHistory,History,createHashHistory} from 'history';
import {isHTMLElement} from '@/utils/isType';
import createSagaMiddleware from 'redux-saga';
import {AppOptions, HistoryType, AppApi, ModelApi, OnReducerApi} from './types';
import reducerBuilder from './reducer/reducerBuilder';
import sagaBuilder from './reducer/sagaBuilder';
import createStore from './reducer/createStore';
import renderApp from './renderApp';


class App implements AppApi{
    router?: (app:App) => JSX.Element;
    store:any;
    history:History;
    private onSuccess?:()=>any;
    private onFetchOption?:  AppOptions['onFetchOption'];
    private onReducer?:OnReducerApi;
    private models:any[];


    constructor (opts:AppOptions) {
        const {historyType, onSuccess, onFetchOption, onReducer} = opts;
        this.history = createBrowserHistory();
        this.models =[];
        this.onFetchOption = onFetchOption;
        this.onReducer = onReducer;
        this.onSuccess = onSuccess

        switch (historyType){
            case HistoryType.HASH:
                this.history = createHashHistory(); //产生的控制浏览器 hash 的 history 对象
            break;
            default: 
            this.history = createBrowserHistory(); //产生的控制浏览器真实地址的 history 对象
            break;
        }

    }

    buildStore =()=>{
        const sagaMiddleware = createSagaMiddleware();
        let initialState = {};
        // 可以通过webpack注入全局的state

        const reducers = reducerBuilder(this.models,this.onReducer);
        console.log('===',reducers)
        this.store = createStore({
            reducers,
            initialState,
            sagaMiddleware,
        });

        (this.store as any).runSaga = sagaMiddleware.run;

        const sagas = sagaBuilder(this.models,{
            onSuccess:this.onSuccess,
            onFetchOption:this.onFetchOption,
            history:this.history,
        })

        sagaMiddleware.run(sagas);

        this.history = patchHistory(this.history);
    }

    start = (container: string | Element | null) => {
        if (typeof container === 'string') {
          let cElement = document.querySelector(container);
          if (!cElement) {
            throw new Error(`container ${container} not found`);
          }
          container = cElement;
        }
    
        if (!isHTMLElement(container)) {
          throw new Error(`container should be html element `);
        }
    
        if (!this.router) {
          throw new Error(` app.setRouter() must be called before app.start() `);
        }
    
        if (!this.store) {
          this.buildStore();
        }
    
        this.render(container);
      };

    setRouter = (router: (app: App) => JSX.Element) => {
        this.router = router;
      };
    
    setModels = (models: Array<ModelApi | ModelApi[]>) => {
        this.models = [...models];
      };
    

    render=(container:Element | null) :void=>{
        const dom = renderApp(this);
        if(dom){
            ReactDom.render(dom,container);
        } 
    }
}

/**
 * 给  history.listen 额外添加一个回调函数，监听事件时触发自定义逻辑
 * @param history
 */

function patchHistory(history:History){
    const oldListen = history.listen;
    history.listen = (callback:any) =>{
        callback&& callback(history.location);
        return oldListen.call(history,callback);
    }
    return history
}

export default App;                                                                                                    