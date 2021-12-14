import { applyMiddleware,compose,createStore }  from 'redux';


function createMprStore(opts:any) {
    const {reducers,initialState,sagaMiddleware} = opts

    let middleware =[];
    if(sagaMiddleware) {
        middleware.push(sagaMiddleware)
    }

    let devTools = ()=>(n:any)=>n

    if(process.env.NODE_ENV !== 'production' && (window as any).____REDUX_DEVTOOLS_EXTENSION__) {
        devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
    }

    const enhancers = [applyMiddleware(...middleware),devTools]

    return createStore(reducers, initialState, compose(...enhancers));

}
export default createMprStore