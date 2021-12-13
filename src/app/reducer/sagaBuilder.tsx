import {isFunction} from '@/utils/isType';
import {AppOptions, ModelApi, PutAction} from '../types';
import {fork,call,put,takeEvery} from 'redux-saga/effects';
import axios from 'axios';


type CreateOptions = AppOptions & {
    history: History;
  };

function sagaBuilder (models: Array<ModelApi | Array<ModelApi>>, args: any){
    const sagaModels = models.flat();
    const sagaArr:any = []; 
    sagaModels.forEach((sagaModel) => {
        if(sagaModel.url){
            sagaArr.push(createSaga(sagaModel, args));
        }
    })

    return function *(){
        for(let saga of sagaArr){
            yield fork(saga)
        }
    }
}

/**
 * 创建每个model对应的saga
 * @param model
 * @param args
 */
function createSaga (model: ModelApi, args: CreateOptions){
    const {onFetchOption, onSuccess, history} = args;
    return function *(){
        // 处理action 对应的网络请求
        yield takeEvery(model.key,function*(action){
            let putAction:PutAction = {
                type: `${model.key}_LOADING`,
                payload: (action as any).payload,
                loading: true,
                success:false,
                result:null
            };
            yield put(putAction)

            try{
                let option = createOption(model,(action as any).payload);
                if(isFunction(onFetchOption)){
                    option = onFetchOption && onFetchOption(option, model);
                }
                const response: {} = yield call(axios, option);
                if (response) {
                    putAction = {
                      type: `${model.key}__${
                        (response as any).success ? 'SUCCESS' : 'FAILURE'
                      }`,
                      payload: (action as any).payload,
                      success: (response as any).success,
                      loading: false,
                      //    不加yield ？
                      result: (response as any).data,
                    };
          
                    if (onSuccess) {
                      const result = onSuccess(
                        {payload: (action as any).payload, url: option.url},
                        response,
                        history
                      );
                      putAction = {
                        ...putAction,
                        ...result,
                      };
                    }
                    yield put(putAction);
            }
        }catch (error:any) {
            putAction = {
                type: `${model.key}__FAILURE`,
                payload: (action as any).payload,
                success: false,
                loading: false,
                result: {},
                error: error?.message || '请求异常',
              };
              yield put(putAction);
        }
        })
    }
}


function createOption(modal:ModelApi,payload:any){
    const {method, type = 'json', headers, bodyParser} = modal;
    const option: any = {};
    option.method = method;
    option.url = (modal.url as any)(payload)
    option.headers = headers || {
        Accept: 'application/json', 
        "Content-Type": type === 'json' ? 'application/json' : 'application/x-www-form-urlencoded',
    };

    if(option.method !== 'get' && payload){
        if(bodyParser){
            option.data = bodyParser(payload)
        }else{
            if(type === 'json'){
                option.data = JSON.stringify(payload);
            }else if(type === 'form'){
                let paris =[];
                for(let key of payload){
                    paris.push(key + '=' + payload[key]);
                }
                option.data = paris.join('&');
            }else{
                option.data = payload;
            }
        }

    }

    return option;
}

export default sagaBuilder;