import { storeUIobj, getElementUIobj } from "./storage.mjs";

function addUIProperties(e, onChangeFn){
    e.val = e.checked;
    e.addEventListener('change',event=>{e.userSetValue(e.checked);});
    e.userSetValue = (value)=>{
        if(value != e.getValue()){ //is new value
            if(e.getAttribute('sync') !== null) sendUIobj(getElementUIobj(e, value)); //sync to server
            e.setValue(value); 
        }
    };
    e.setValue = (value)=>{
        if(e.getValue() != value) { //is new value
            e.val = value; //update value
            e.checked = value; //update ui
            storeUIobj(getElementUIobj(e, value)); //store in ui obj
            onChangeFn(); //show or hide other ui elements
        }
    }
    e.getValue = ()=>e.val;
    e.initialize = ()=>{
        storeUIobj(getElementUIobj(e, e.getValue()));
        onChangeFn(); //show or hide other ui elements
    }
}
export{addUIProperties}