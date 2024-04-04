import { storeUIobj, getElementUIobj } from "./storage.mjs";

function addUIProperties(e,onChangeFn){
    let value = parseInt(e.textContent);
    e.innerHTML=
        `<button onclick="this.parentNode.userSetValue(this.parentNode.getValue()-1)">−</button>`+
        `<span>${value}</span>`+
        `<button onclick="this.parentNode.userSetValue(this.parentNode.getValue()+1)">+</button>`;
    let displayElement = e.childNodes[1];
    e.getValue = ()=>parseInt(displayElement.textContent);
    e.validate = (val)=> (val >= 0 && val != e.getValue());
    e.userSetValue = (value)=>{
        if(e.validate(value)){ //is new value
            if(e.getAttribute('sync') !== null) sendUIobj(getElementUIobj(e, value)); //sync to server
            e.setValue(value);
        }
    }
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