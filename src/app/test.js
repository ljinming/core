function a (value){
    return value+'a'
}


function b (value){
    return value+'b'
}

function c (value){
    return value+'c'
}


function compose (...args) {
    console.log('===3',args)
        return args.reduce((a,b)=>{
            return (...args)=>{
              return  a(b(...args));
            }   
        })
}

const str = compose(c,b,a,(n,)=>'first')();
console.log('-----------',str)
