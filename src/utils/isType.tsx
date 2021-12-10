export function isEmptyObject(o: any) {
    return !Object.keys(o).length;
  }

  export function isFunction(f: any) {
    return Object.prototype.toString.call(f).includes('Function');
  }