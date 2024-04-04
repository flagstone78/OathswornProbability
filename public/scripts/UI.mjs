import {initializeSocket} from "/scripts/socket.mjs"
import {applyObjHelperFuncions, isObject} from "/scripts/objHelpers.mjs"
import {addUIProperties as addCounterUIProperties} from "/scripts/counter.mjs"
import {addUIProperties as addLimitedCounterUIProperties} from "/scripts/limitedCounter.mjs"
import {addUIProperties as addCheckBoxUIProperties} from "/scripts/checkBox.mjs"
import {getElementUIobj, getStoredUIvalue, getElementsByObj} from "/scripts/storage.mjs"
applyObjHelperFuncions();

let calculate = ()=>{
    console.warn("calculate function not set")
}

export default function setCalcFn(calcFn){
    calculate = calcFn;
}

let sendUIobj = initializeSocket(recieveUIobj); //returns function for sending objects

let autoPush = document.querySelector('input[uiID=autoPush]');
let autoPull = document.querySelector('input[uiID=autoPull]');
let autoCalc = document.querySelector('input[uiID=autoCalc]');
let lockCards = document.querySelector('input[uiID=lockCards]');

function onLimitedCounterServerUpdate(e){ if(autoPull.checked) e.mergeQueue();}
function onLimitedCounterClick(e){ if(e.sync && autoPush.checked) sendUIobj(e.getUIobj())}; //sync to server
function onCounterClick(e){if(e.sync) sendUIobj(e.getUIobj())}

document.querySelectorAll(".counter").forEach(e=>{addCounterUIProperties(e, UIchange, onCounterClick)});
document.querySelectorAll(".limitedCounter").forEach(e=>{addLimitedCounterUIProperties(e, UIchange, onLimitedCounterClick, onLimitedCounterServerUpdate)});
document.querySelectorAll("input[type=checkbox]").forEach(e=>{addCheckBoxUIProperties(e, uiVisibilityChange)});

let pullButtons = document.querySelectorAll('button[pull]');
let pushButtons = document.querySelectorAll('button[push]');
let calcButtons = document.querySelectorAll('button[calc]');
let resetButtons = document.querySelectorAll('button[reset]');
let cardButtons = document.querySelectorAll('.subgrid .limitedCounter button');
function uiVisibilityChange(){
    pullButtons.forEach(e=>{e.hidden=autoPull.checked}); 
    pushButtons.forEach(e=>{e.hidden=(autoPush.checked||lockCards.checked)}); 
    calcButtons.forEach(e=>{e.hidden=autoCalc.checked});
    cardButtons.forEach(e=>{e.style.visibility=(lockCards.checked)?'hidden':''}); 
    resetButtons.forEach(e=>{e.hidden=lockCards.checked});
}

function mergeMultiple(elements){return ()=>{elements.forEach(child=>child.mergeQueue())}}
document.querySelectorAll('legend button[pull]').forEach(e=>{e.onclick = mergeMultiple(e.parentNode.parentNode.querySelectorAll('.limitedCounter'))});
document.querySelector('#pullAll').onclick = mergeMultiple(document.querySelectorAll('.subgrid .limitedCounter'));

document.querySelector('#calc').onclick = ()=>calculate();

function pushMultiple(elements){
    return ()=>{
        let toSend={};
        elements.forEach(child=>{
            let value = child.getValue();
            if( value != child.queueValue) {
                toSend.merge(child.getUIobj());
                child.queue(value);
            }
        });
        if(Object.keys(toSend).length>0)sendUIobj(toSend);
    }
}
document.querySelectorAll('legend button[push]').forEach(e=>{e.onclick = pushMultiple(e.parentNode.parentNode.querySelectorAll('.limitedCounter'))});
document.querySelector('#pushAll').onclick = pushMultiple(document.querySelectorAll('.subgrid .limitedCounter'));

document.querySelectorAll('[reset]').forEach(reset=>{
    reset.onclick = ()=>{
        let counters = reset.parentNode.parentNode.querySelectorAll('.limitedCounter');
        counters.forEach(e=>{e.setValue(0)})
        reset.parentNode.querySelector('button[push]').click();
    }
})

//load saved values for all elements with the 'store' attribute
document.querySelectorAll("[store]").forEach(e=>{
    let uiobj = getElementUIobj(e, undefined);
    let storedValue = getStoredUIvalue(uiobj);
    if(storedValue!=undefined) e.setValue(storedValue);
});

//initialize all ui elements to ensure the storedUI state is fully populated
document.querySelectorAll(".limitedCounter, .counter, input[type=checkbox]").forEach(e=>{e.initialize()});

function recieveUIobj(obj){
    console.log("recievedUIOBJ:", JSON.stringify(obj));
    getElementsByObj(obj,(e,val)=>{ e.serverSetValue(val)})
}

function UIchange(){
    if(autoCalc.checked) calculate();
}

