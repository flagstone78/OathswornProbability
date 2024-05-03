import { storeUIobj, getElementUIobj } from "./storage.mjs";

function addUIProperties(e, onChangeFn){
    e.val = e.checked;
    e.sync = e.getAttribute('sync') !== null;
    e.addEventListener('change',event=>{e.userSetValue(e.checked);});
    e.userSetValue = (value)=>{
        if(value != e.getValue()){ //is new value
            if(e.sync) sendUIobj(getElementUIobj(e, value)); //sync to server
            e.setValue(value); 
        }
    };
    e.serverSetValue = (val)=>{if(e.sync) e.setValue(val)}
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