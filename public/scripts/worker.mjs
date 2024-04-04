//puts heavy calculation on the webworker. falls back to running inline
let myWorker={terminate:function(){}};
function startWork(fcn, functionFile, parameters, callBackFcn){
    //if(false){
    if(window.Worker){
        myWorker.terminate(); //kill previous instance
        myWorker = new Worker(functionFile, { type: "module" }); //remake
        document.myWorker = myWorker;
        myWorker.onmessage = (e)=>{
            //console.log('Message received from worker', e.data);
            callBackFcn(e.data);
        }
        myWorker.postMessage(parameters);
    } else {
        callBackFcn(fcn(...parameters)); // do the work directly
    }
}

export{startWork}