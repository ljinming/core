import {ModelApi} from '../types';
import {isEmptyObject} from '@/utils/isType';


/**
 * 创建state的子级时，判断是否可以创建
 * @param state
 * @param reducer
 */
 export function isStateLegal(state: any, reducer: ModelApi) {
    const reducerKey = reducer.key.split('.');
    reducerKey.shift(); //[list,one]
    const reducerStateKeys = isEmptyObject(reducer.initialState || {})
      ? [reducerKey.join('.')] // list.one
      : Object.keys(reducer.initialState || {}).map( //{a:6}
          (key) => `${reducerKey.join('.')}.${key}` //  list.one.a
        );
  
    const stateKeys = getDeepStateKey(state).flat();
  
    const hasKey = reducerStateKeys.some((key) =>
      stateKeys.some(
        (statekey) =>
          key &&
          statekey &&
          (statekey.startsWith(key) || key.startsWith(statekey))
      )
    );
    return !hasKey;
  }

  /**
 * 递归变量state对象，获取所有可访问的最深层路径
 * @param state
 * @param initialKey
 */
function getDeepStateKey(
    state: object,
    initialKey?: string
  ): Array<Array<string> | string> {
    if (isEmptyObject(state)) {
      return [initialKey as string];
    }
  
    const initialKeys = Object.keys(state).map((key) => getKey(key, initialKey));
    return initialKeys.map((initKey) => {
      const cur = initKey.split('.').pop();
      const deepKeys = getDeepStateKey(state[cur as string], initKey);
      return deepKeys.flat();
    });
  }

  /**
 * 拼接key
 * @param key
 * @param initialKey
 */
function getKey(key: string, initialKey?: string): string {
    return initialKey ? `${initialKey}.${key}` : key;
  }
  