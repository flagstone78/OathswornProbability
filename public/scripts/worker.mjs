//puts heavy calculation on the webworker. falls back to running inline
let myWorker={terminate:function(){}};
async function startWork(fcn, functionFile, parameterLists){
    //if(false){
    if(window.Worker){
        myWorker.terminate(); //kill previous instance
        myWorker = new Worker(functionFile, { type: "module" }); //remake
        //document.myWorker = myWorker;
        const ret = Array(parameterLists.length);
        for(let i=0; i<ret.length; i++){
            const workDone = new Promise((resolve)=>{myWorker.onmessage = (e)=>resolve(e.data)})
            const parameters = parameterLists[i];
            myWorker.postMessage(parameters);
            ret[i] = await workDone;
        }
        return ret;
    } else {
        return parameterLists.map(parameters=>fcn(...parameters)); // do the work directly
    }
}

export{startWork}