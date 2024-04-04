import {debounce, objectMap} from "./arrayHelpers.mjs"
import { loadTableGraphic, loadTableList } from "./table.mjs";
import{probCheckMonster} from "./monsterProb.mjs"
import{initializeSocket} from "./socket.mjs"
import { startWork } from "./worker.mjs";
import{getElementUIobj, getElementsByObj, storeUIobj} from "./storage.mjs"
import {applyObjHelperFuncions, isObject} from "/scripts/objHelpers.mjs"
applyObjHelperFuncions();

const dUpdateStats = debounce(()=>calculate(),10);

let calculate = ()=>{
    console.warn("calculate function not set")
}

export default function setCalcFn(calcFn){
    calculate = calcFn;
}

let sendUIobj = initializeSocket(recieveUIobj); //returns function for sending objects

function recieveUIobj(obj){
    getElementsByObj(obj,(e,val)=>{ e.serverSetValue(val)})
}

const cardHandler = {
    set(target, prop, value, reciever){
        if(prop=="numInDiscard" && value >= 0 && value <= target.max){
            target.element.innerHTML = value +'/'+target.max;
            Reflect.set(target,'numInDeck',target.max-value,reciever); //update num in deck
            let r = Reflect.set(...arguments); //update num in discard
            storeUIobj(target.element.parentElement.getUIobj())
            dUpdateStats();
            return r;
        }
        return 1; //dont allow setting of other properties
    }
}

const mightHandler = {
    set(target, prop, value, reciever){
        if(prop=="toDraw"){
            if(value<0) value=0;
            target.mightElement.innerHTML = value;
            storeUIobj(target.mightElement.parentElement.getUIobj())
            dUpdateStats();
        }
        return Reflect.set(target, prop, value, reciever);
    }
}

function getResetClickFcn(resetElement){
    return e=>{
        e.target.parentElement.querySelectorAll('.card').forEach(card=>{
            card.serverSetValue(0);
            sendUIobj(card.getUIobj());
        })
    }
}

document.querySelectorAll(".card").forEach(element=>{
    let counter = element.children[1];
    let vals = counter.innerHTML.split('/');
    let points = Number(element.children[0].innerHTML);
    let max = Number(vals[1]);
    let num = Number(vals[0]);
    let card = {
        color: element.classList[0],
        value: points, 
        numInDiscard: num, 
        numInDeck: max-num,
        max:max,
        element: element.children[1],
        isCrit: element.classList.contains('crit'),
        isFail: !num //zeros count as failure by default
    };
    
    let prox = new Proxy(card,cardHandler);
    element.getUIobj = ()=>getElementUIobj(element,{discarded: prox.numInDiscard});
    element.serverSetValue = (val)=>prox.numInDiscard = val;
    element.addEventListener('click', (e)=>{prox.numInDiscard += 1; sendUIobj(element.getUIobj()); e.stopPropagation()});
    counter.addEventListener('click', (e)=>{prox.numInDiscard -= 1; sendUIobj(element.getUIobj()); e.stopPropagation()});
    counter.serverSetValue =element.serverSetValue;
    storeUIobj(getElementUIobj(element,{discarded: prox.numInDiscard, max:max, points:points}))
});


//add stats and handlers
document.querySelectorAll(".might").forEach((re)=>{
    let count = re.children[0];
    let color = re.classList[0];
    
    let arr = {
        mightElement: count,
        toDraw: parseInt(count.textContent),
        totalInDeck: 0,
        totalInDiscard: 0,
    }
    let prox = new Proxy(arr, mightHandler);

    re.getUIobj = ()=>getElementUIobj(re, prox.toDraw);
    re.serverSetValue = (val)=>prox.toDraw = val;
    re.addEventListener('click', (e)=>{prox.toDraw += 1; sendUIobj(re.getUIobj()); e.stopPropagation()});
    count.addEventListener('click', (e)=>{prox.toDraw -= 1; sendUIobj(re.getUIobj()); e.stopPropagation()});
    storeUIobj(re.getUIobj());
});


Array.from(document.querySelectorAll(".reset")).forEach(re=>{
    re.addEventListener('click',getResetClickFcn(re));
})