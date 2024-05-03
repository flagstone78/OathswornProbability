import { storeUIobj, getElementUIobj } from "./storage.mjs";

function addUIProperties(e,onChangeFn, onClickFn){
    let value = parseInt(e.textContent);
    let min = parseInt(e.getAttribute('min')) || 0;
    e.sync = e.getAttribute('sync') !== null;
    e.innerHTML=
        `<button onclick="this.parentNode.userSetValue(this.parentNode.getValue()-1)">−</button>`+
        `<span>${value}</span>`+
        `<button onclick="this.parentNode.userSetValue(this.parentNode.getValue()+1)">+</button>`;
    let displayElement = e.childNodes[1];
    e.getValue = ()=>parseInt(displayElement.textContent);
    e.getUIobj= ()=>getElementUIobj(e, e.getValue());
    e.validate = (val)=> (val >= min && val != e.getValue());
    e.serverSetValue = (val)=>{if(e.sync) e.setValue(val)}
    function userSetValue(value){
        if(e.validate(value)){ //is new value
            e.setValue(value);
            onClickFn(e);
        }
    }
    let buttonDecrement = e.childNodes[0];
    buttonDecrement.onclick = ()=>{userSetValue(e.getValue()-1)}
    let buttonIncrement = e.childNodes[2];
    buttonIncrement.onclick = ()=>{userSetValue(e.getValue()+1)}
    //should always update the ui object, but only fire uiChange when different
    e.setValue = (value)=>{
        if(e.validate(value)) { //is new value
            displayElement.textContent = value; //sets the ui and current value
            storeUIobj(getElementUIobj(e, value)); //store in ui obj
            onChangeFn(e); //trigger calculations from ui change
        }
    }
    e.initialize = ()=>{
        storeUIobj(getElementUIobj(e, e.getValue()));
    }
}

export{addUIProperties};