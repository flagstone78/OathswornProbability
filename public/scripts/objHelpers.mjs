function isObject(obj){
    return (obj instanceof Object) && !(obj instanceof Array);
}

function applyObjHelperFuncions(){
    Object.defineProperty(Object.prototype, 'merge',{value:function(source){
        if(isObject(source)) Object.keys(source).forEach(k=>{
            if(this[k]===undefined) {this[k] = source[k]; return this;}
            if(isObject(this[k])) {
                if(isObject(source[k])) return this[k].merge(source[k]);
                throw "cannot override object with value";
            } else {
                if(isObject(source[k])) throw "cannot override value with obj"
                this[k] = source[k];
            }
            return this;
        })
        return this;
    }});

    Object.defineProperty(Object.prototype, 'split',{value:function(source){
        if(isObject(source)) {
            let firstKey = Object.keys(source)[0];
            if(isObject(this[firstKey])) return this[firstKey].split(source[firstKey]);
            else return this[firstKey];
        } else {
            return this;
        }
    }});

    Object.defineProperty(Object.prototype, 'map',{value:function(fn){
        //const objectMap = (obj, fn) =>
        return Object.fromEntries(
            Object.entries(this).map(
                ([k, v], i) => [k, fn(v, k, i)]
            )
        )
    }})

}

export{applyObjHelperFuncions, isObject}