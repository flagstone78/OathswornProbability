const cache = [1];

function _factorial(n){
    for(let i=cache.length-1; i<n;i++) cache.push((i+1)*cache[i])
    return cache[n];
}
export function factorial(n){
    if(n<0) return Infinity; //throw "Cannot have negative factorial";
    const val = cache[n];
    return (val !== undefined) ? val : _factorial(n);
}