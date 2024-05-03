function applyArrayHelperFuncions(){
    Object.defineProperty(Array.prototype,'sum',{value: function(){
        let sum = 0;
        for(let i=0; i<this.length; i++) sum += this[i]||0;
        return sum
    }});
    Object.defineProperty(Array.prototype,'cumsum',{value: function(){
        let sum = 0;
        const ret = Array.from(this);
        for(let i=0; i<ret.length; i++){
            ret[i] = (sum += this[i]||0);
        }
        return ret
    }});
    Object.defineProperty(Array.prototype,'reversecumsum',{value: function(){return [...this].reverse().cumsum().reverse()}});
    Object.defineProperty(Array.prototype,'shuffle',{value: function(numToShuffle=this.length){
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

    Object.defineProperty(Array.prototype,'conv',{value: function(arr){
        const length = this.length+arr.length-1;
        return Array.from({length:length}, (value,index)=>{
            const start = Math.max(0, index-(arr.length-1));
            const end = Math.min(index, this.length-1);
            let val = undefined;
            for(let i=start; i<=end; i++){
                const partial = this[i]*arr[index-i];
                if(!isNaN(partial)) val = (val||0)+partial;
            }
            return val;
        })
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