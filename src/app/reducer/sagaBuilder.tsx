

function sagaBuilder (models: Array<ModelApi | Array<ModelApi>>, args: any){

    const sagaModels = models.flat();
    const sagaArr:[] = []; 
    sagaModels.forEach((sagaModel) => {
        if(sagaModel.url){
            sagaArr.push(createSaga(sagaModel,args));
        }
    })

    return function *(){
        for(let saga of sagaArr){
            yield fork(saga)
        }
    }

}