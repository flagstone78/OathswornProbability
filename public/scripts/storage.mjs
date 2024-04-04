import { isObject } from "./objHelpers.mjs";
if(localStorage.getItem('__uiObj') == null) localStorage.setItem('__uiObj','{}')
let __uiObj=JSON.parse(localStorage.getItem('__uiObj'));
window.__uiObj = __uiObj;

window.onbeforeunload = function() {
    localStorage.setItem('__uiObj',JSON.stringify(__uiObj));
};

function storeUIobj(uiobj){
    __uiObj.merge(uiobj);
}

function getStoredUIvalue(subObj){
    return __uiObj.split(subObj); //TODO: perform a deep copy to prevent unintended changes to the original object
}

function getElementUIobj(element, obj){
    let id = element.getAttribute('uiID');
    if(id==null) return obj;
    if(id=='') return getElementUIobj(element.parentNode,obj);
    return getElementUIobj(element.parentNode,{[id]:obj});
}

function getElementsByObj(obj,callback, e=document.body){
    for(let k in obj){
        //if uIId is assigned empty, try again on children
        e.querySelectorAll(`:scope > [uiID='']`).forEach(nexte=>{
            getElementsByObj(obj,callback,nexte);
        })
        //if uiID matches the current key, recurse with child object on child elements
        e.querySelectorAll(`:scope > [uiID="${k}"]`).forEach(nexte=>{
            if(isObject(obj[k])) getElementsByObj(obj[k],callback,nexte);
            else callback(nexte,obj[k]);
        })
    }
}

export{storeUIobj, getElementUIobj, getElementsByObj, getStoredUIvalue}