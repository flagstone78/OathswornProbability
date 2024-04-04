import { storeUIobj, getElementUIobj } from "./storage.mjs";

function addUIProperties(e, onChangeFn, onClickFn){
    let min = parseInt(e.getAttribute('min')) || 0;
    let max = parseInt(e.getAttribute('max')) || Infinity;
    e.sync = e.getAttribute('sync') !== null;
    let hasMax = (max!=Infinity);
    let maxText = hasMax? `<span>/</span><span uiID="max">${max}</span>`:'';
    let valueText = parseInt(e.textContent);
    e.innerHTML=
        `<button>−</button>`+
        `<span store uiID="discarded">${valueText}</span>${maxText}`+
        `<button>+</button>`;
    let displayElement = e.childNodes[1];
    displayElement.queue = (value)=>e.queue(value);
    displayElement.mergeQueue = (value)=>e.mergeQueue(value);
    displayElement.setValue = (value)=>e.setValue(value);
    function userSetValue(newVal){
        if(e.validate(newVal)) {
            e.setValue(newVal);
            onClickFn(e);
        }
    }
    let buttonDecrement = e.childNodes[0];
    buttonDecrement.onclick = ()=>{userSetValue(e.getValue()-1)}
    let buttonIncrement = e.childNodes[4];
    buttonIncrement.onclick = ()=>{userSetValue(e.getValue()+1)}

    e.validate = (value)=>{
        let current = e.getValue();
        return value != current && value <= max && value >= min
    }
    e.getValue = ()=>parseInt(displayElement.textContent);

    //should always update the ui object, but only fire uiChange when different
    e.setValue = (value)=>{
        if(e.validate(value)) { //is new value
            displayElement.textContent = value; //sets the ui and current value
            e.queueUI();
            storeUIobj(e.getUIobj()); //store in ui obj
            onChangeFn(e); //trigger calculations from ui change
        }
    }
    e.initialize = ()=>{
        storeUIobj(e.getUIobj());
        e.queue(e.getValue());
        if(hasMax) storeUIobj(getElementUIobj(e.childNodes[3], max));
        if(e.getAttribute('points')!=null) storeUIobj(getElementUIobj(e, {points:parseInt(e.getAttribute('points'))}));
    }

    e.getUIobj= ()=>getElementUIobj(displayElement, e.getValue())

    e.queueValue = e.getValue();
    e.queueElement = e.nextElementSibling;
    e.queue = (value)=>{
        e.queueValue = value;
        e.queueUI();
    }
    e.queueUI = ()=>{
        let isSame = e.queueValue == e.getValue();
        if(e.queueElement) {
            e.queueElement.textContent = e.queueValue;
            if(!e.sync) e.queueElement.style.display = 'none';
            if(isSame) e.queueElement.style.visibility = 'hidden';
            else e.queueElement.style.visibility = '';
        }
        return !isSame;
    }
    e.mergeQueue= ()=>{
        if(e.queueValue != e.getValue()){
            e.setValue(e.queueValue);
        }
    }
}

export{addUIProperties}