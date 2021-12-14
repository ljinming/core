
import {Reducer,combineReducers} from 'redux';
import {ModelApi, OnReducerApi} from '../types';
import {isStateLegal} from './utils';
import {isFunction} from '@/utils/isType';

type GroupType = Map<string, ModelApi>

/*
创建reducer
@param options 所有的action 请求
@param onReducer reducer函数
@ reducerBuilder 接受 请求和处理请求的函数 return 合成的reducer 

reducer 状态分别为 loading success failure



combineReducers 辅助函数的作用是，
把一个由多个不同 reducer 函数作为 value 的 object，
合并成一个最终的 reducer 函数，然后就可以对这个 reducer 调用 createStore。

*/

function reducerBuilder (
    options:Array< ModelApi| Array<ModelApi> >,
    onReducer?:OnReducerApi
):Reducer{
    const reducers ={};

    const reducerGroups = new Map(); 
    const optionsArr = options.flat(); // 将数组拉平 二维数组可转化成一维数组
    optionsArr.forEach((reducer) => {
        if(!reducer.key){
            throw new Error('YOU should define a key');
        }
        collectReducers(reducerGroups,reducer)
    })

    /*
    ast 的格式 抽象语法树结构
        history:{
            history.curve:reducer函数，
            history.bond:reducer 函数
        }

    
    */
    // reducerGroups ={}

        for(const [key, reducerGroup] of reducerGroups.entries()){
            reducers[key]= buildReducerGroup(reducerGroup, onReducer as OnReducerApi)

        }

    return combineReducers(reducers) // 合成reducer
   
}


/*
    
        group 的数据格式 map
        reducer   {
        key: 'history.curve',
        method: 'post',
        }, 
        reducer.key: ()=>{} // reducer函数
    
    */
function collectReducers(
    reducerGroups:Map<string,GroupType>,
    reducer:ModelApi,
){
    const keys = reducer.key.split('.');
    const [groupKey, ...subKeys] = keys; //eg key ='home.list'
    let group = reducerGroups.get(groupKey);
    if(!group){
        group = new Map(); 
        reducerGroups.set(groupKey,group)
    }

    if(keys.length === 1){
        // 说明没有 '.'
        reducer.single = true;
    }else{
        reducer.subKeys = subKeys;  
    }
    
    if(group.get(reducer.key)){
        throw new Error( `You have duplicate ${groupKey} or ${groupKey}'s subKey`)
    }
    group.set(reducer.key,reducer)
}

/**
 * 创建一级 key 下的reducer
 * @param reducerGroup
 * @param onReducer
 */

function buildReducerGroup(reducerGroup:GroupType,onReducer?:OnReducerApi){
    const handlers ={};
    let initialState ={};

    for(const reducer of reducerGroup.values()){ 
        // values() 返回一个遍历器对象，用来遍历所有的键值。
        if(!isStateLegal(initialState, reducer)){  
            throw new Error(
                `Build ${reducer.key} state failure. Check if ${reducer.key}'s key or 
                initialState is duplicate in it's father state`
              );
        }

        if(reducer.single){
            initialState = reducer.initialState||{};
        }else {
            buildState( initialState,reducer.subKeys as string[],reducer.initialState)
        }

        // 使用key 作为action.type
        const action = reducer.key;
        // action 可能需异步处理，注入不同的状态处理函数
        handlers[action] = createReducerHandler(reducer,'reducer', (state,action) => {
            const {payload,...other} = action;
            let newState = {
                ...payload,
                ...other,
            }
            delete newState.type;
            if(onReducer){
                onReducer = onReducer(newState,state, action,'reducer');
            }
            return newState;
        })

        handlers[`${action}_LOADING`] = createReducerHandler(reducer,'loading',(state, action)=>{
            const {payload,...other} = action;
            let newState = {
                result:null,
                payload,
                success:false,
                loading:true,
                ...other
            }
            delete newState.type;
            if(onReducer){
                onReducer = onReducer(newState,state, action,'reducer');
            }
            return newState;
        })

        handlers[`${action}__SUCCESS`] = createReducerHandler(
            reducer,
            'success',
            (state: any, action: any) => {
              const {done, result, payload, ...other} = action;
              let newState = {
                result,
                payload,
                success: true,
                loading: false,
                ...other,
              };
      
              delete newState.type;
              if (onReducer) {
                newState = onReducer(newState, state, action, 'success');
              }
              return newState;
            }
          );

          handlers[`${action}__FAILURE`] = createReducerHandler(
            reducer,
            'failure',
            (state: any, action: any) => {
              const {payload, error, ...other} = action;
              let newState = {
                payload,
                error,
                success: false,
                loading: false,
                ...other,
              };
      
              delete newState.type;
              if (onReducer) {
                newState = onReducer(newState, state, action, 'failure');
              }
              return newState;
            }
          );

    }

    return createReducer(handlers,initialState)
}


/**
 * 创建不同类型的action对应的reducer
 * @param reducer
 * @param method
 * @param handler
 */

function createReducerHandler(
    reducer:ModelApi,
    method:string,
    handler:(state:any,action:any)=>any
){
    return (state:any,action:any) => {
        let result;
        if(reducer.url &&
             !['SUCCESS,LOADING,FAILURE'].some(status=> action.type.includes(status)) ) {
            return state;
        }

        if(reducer[method] && !isFunction(reducer[method])){
            // 不存在
            throw new Error(`${reducer[method]}'s ${method} must be function`)
        }

        if(reducer[method]){
            result = reducer[method](state, action)
        }else{
            result = handler(state, action)
        }
        //  根据层级的不同进行处理
        if (reducer.single) {
            state = result;
        } else {
            state = {...state};
            console.log('---------s',state);
            buildState(state, reducer.subKeys as string[], result);
        }
        return state;
    }
}


/**
 * 构建 group 对应的多级state
 * @param groupState
 * @param keys      
 * @param subState
 */
function buildState(
    groupState: object,
    keys: Array<string>,
    subState = {}
):void {
    const length = keys.length;
    if(length === 1){
        groupState[keys[0]] = subState;
        return 
    }

    let top = groupState;
    keys.forEach((key,index) => {
        if(index !== length -1){
            let goNext = top[key]
            if (!goNext) {
                top[key] = {};
                goNext = top[key];
              }
              top = goNext;
        }else{
            top[key] = subState;   
        }
    })
}


/**
 * 创建reducer -> 组级别的根reducer
 * @param initialState
 * @param hanlers：action 对应的handler
 */
function createReducer(handlers:object,initialState:object){
    return (state:any=initialState, action:any) =>{
        if(!action || !action.type) {
            return state;
        }

        const handler = handlers[action.type];
        const newState = !handler ? state : handler(state,action)
        if(!action.type.includes('__FAILURE')){
            delete newState.error;
        }
        return newState;
    }
}


export default reducerBuilder; 