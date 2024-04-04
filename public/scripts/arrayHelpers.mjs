function applyArrayHelperFuncions(){
    Object.defineProperty(Array.prototype,'sum',{value: function(){return this.reduce((prev,cur)=>{return prev+cur},0)}});
    Object.defineProperty(Array.prototype,'cumsum',{value: function(){return this.map((sum => value => sum += (value)?value:0)(0))}});
    Object.defineProperty(Array.prototype,'reversecumsum',{value: function(){return [...this].reverse().cumsum().reverse()}});
    Object.defineProperty(Array.prototype,'shuffle',{value: function(numToShuffle=this.length-1){
        for (let i = this.length - 1; i >= this.length-numToShuffle; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this.slice(-numToShuffle);
    }});


    Object.defineProperty(Array.prototype,'collectBy',{value: function(collectFcn){
        return this.reduce((prev,cur,index)=>{
            let groupNum = collectFcn(index);//Math.floor(index/collectSize);
            prev[groupNum]? prev[groupNum]+=cur : prev[groupNum]=cur;
            return prev;
        },[]);
    }});

    Object.defineProperty(Array,'fromRange',{value: function(start,stop,step){
        return Array.from({length:(stop-start)/step +1}, (value,index)=>start+index*step);
    }});
}

const debounce = (callback, wait) => { //https://stackoverflow.com/questions/75988682/debounce-in-javascript
    let timeoutId = null;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
        callback(...args);
        }, wait);
    };
}

const objectMap = (obj, fn) =>
    Object.fromEntries(
        Object.entries(obj).map(
            ([k, v], i) => [k, fn(v, k, i)]
        )
    )

export{applyArrayHelperFuncions, debounce, objectMap}