import ReactDom, { render } from 'react-dom';
import {createBrowserHistory,History,createHashHistory} from 'history';
import createSagaMiddleware from 'redux-saga';
import {AppOptions,AppApi,OnReducerApi} from './types';
import {reducerBuilder,sagaBuilder,createStore}  from './reducer'
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
            case 'HistoryType.HASH':
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

        sagaMiddleware.run(sagas)


        this.history = patchHistory(this.history)

    }



    render=(container:Element | null) :void=>{
        const dom = renderApp(this);
        if(dom){
            ReactDom.render(dom,container);
        } 
    }
}

function patchHistory(history:History){
    const oldListen = history.listen;
    history.listen = (callback:any) =>{
        callback&& callback(history.location);
        return oldListen.call(history,callback);
    }
}

export default App;                                                                                                    