import {applyArrayHeperFuncions, debounce, objectMap} from "./arrayHelpers.mjs"
applyArrayHeperFuncions();
import{probCheckMonster} from "./monsterProb.mjs"

const dUpdateStats = debounce(updateStats,100);

let websocketPort = 443;
let hostname = location.hostname || "localhost";
let socket = new WebSocket('ws://'+hostname+':'+websocketPort);
// Connection opened
socket.addEventListener("open", (event) => {
    //socket.send("Hello Server!");
});
  
// Listen for messages
socket.addEventListener("message", (event) => {
    console.log("Message from server ", event.data);
    try{
        let arr = JSON.parse(event.data);
        if(arr.length==3) recieveFromAll(...arr);
    } catch{}
});

// Listen for error
socket.addEventListener("error", (event) => {
    console.log("Websocket Error");
});

// Listen for error
socket.addEventListener("close", (event) => {
    console.log("Websocket closed");
});

function syncToAll(id,key,value){
    if(socket.readyState==socket.OPEN){
        socket.send(JSON.stringify([id,key,value]));
    } else { //pass through to recieve function
        recieveFromAll(id,key,value);
    }
}

function recieveFromAll(id,key,value){
    switch(key){
        case 'numInDiscard':
            if(cardsById[id] != undefined && Number.isInteger(value)) cardsById[id][key] = value;
            break;
        case 'toDraw':
            if(cardsByColors[id] != undefined && Number.isInteger(value)) cardsByColors[id][key] = value;
            break;
    }
}

const cardHandler = {
    set(target, prop, value, reciever){
        if(prop=="numInDiscard" && value >= 0 && value <= target.max){
            target.element.innerHTML = value +'/'+target.max;
            Reflect.set(target,'numInDeck',target.max-value,reciever); //update num in deck
            let r = Reflect.set(...arguments); //update num in discard
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
            if(value>target.total) value=target.total;
            target.mightElement.innerHTML = value;
            dUpdateStats();
        }
        return Reflect.set(target, prop, value, reciever);
    }
}

function getCardClickFcn(currentCard){
    return (e)=>{syncToAll(currentCard.id,'numInDiscard', currentCard.numInDiscard+1); e.stopPropagation()};
}
function getCardCounterClickFcn(currentCard){
    return (e)=>{syncToAll(currentCard.id,'numInDiscard', currentCard.numInDiscard-1); e.stopPropagation()};
}
function getMightClickFcn(currentColor){
    return e=>{syncToAll(currentColor.id,'toDraw', currentColor.toDraw+1);e.stopPropagation();};
}
function getMightCounterClickFcn(currentColor){
    return e=>{syncToAll(currentColor.id,'toDraw', currentColor.toDraw-1);e.stopPropagation();};
}

const cardsById = Array.from(document.querySelectorAll(".card")).reduce((out,current)=>{
    let counter = current.children[1];
    let vals = counter.innerHTML.split('/');
    let num = Number(current.children[0].innerHTML);
    let card = {
        id: current.id,
        color: current.classList[0],
        value: num, 
        numInDiscard:Number(vals[0]), 
        numInDeck: Number(vals[1])-Number(vals[0]),
        max:Number(vals[1]),
        element: current.children[1],
        isCrit: current.classList.contains('crit'),
        isFail: !num //zeros count as failure by default
    };
    
    out[card.id] = new Proxy(card,cardHandler);

    current.addEventListener('click', getCardClickFcn(out[card.id]));
    counter.addEventListener('click', getCardCounterClickFcn(out[card.id]));

    return out;
},{});


const cardsByColors = (()=>{
    let ret = {};
    //gather elements by color
    for(let prop in cardsById){
        let v = cardsById[prop];
        ret[v.color] ? ret[v.color].push(v) : ret[v.color]=[v];
    }

    //add stats and handlers
    return Array.from(document.querySelectorAll(".might")).reduce((out,re)=>{
        let count = re.children[0];
        let color = re.classList[0];
        if(!out[color]) {
            let arr = ret[color];
            arr.id = color;
            arr.mightElement = count;
            arr.total = 0;
            arr.toDraw = Number(count.innerHTML);
            arr.totalInDeck = 0;
            arr.totalInDiscard = 0;
            out[color] = new Proxy(arr, mightHandler);
        }
        
        re.addEventListener('click',getMightClickFcn(out[color]));
        count.addEventListener('click',getMightCounterClickFcn(out[color]));
        return out;
    },{})
})();


Array.from(document.querySelectorAll(".reset")).forEach(re=>{
    re.addEventListener('click',e=>{
        let color = re.classList[0];
        cardsByColors[color].forEach(card=>{
            //card.numInDiscard=0;
            syncToAll(card.id,'numInDiscard', 0); 
        });
    });
})

//puts heavy calculation on the webworker. falls back to running inline
let myWorker={terminate:function(){}};
function startWork(fcn, functionFile, parameters, callBackFcn){
    if(window.Worker){
        myWorker.terminate(); //kill previous instance
        myWorker = new Worker(functionFile, { type: "module" }); //remake
        document.myWorker = myWorker;
        myWorker.onmessage = (e)=>{
            //console.log('Message received from worker', e.data);
            callBackFcn(e.data);
        }
        myWorker.postMessage(parameters);
    } else {
        callBackFcn(fcn(...parameters)); // do the work directly
    }
}


function updateUI(res){
    let chanceAtleast = res.prob.reversecumsum();
    let chanceAtleastMaxRemoved = res.probMaxRemoved.reversecumsum();
    loadTableGraphic("Chance of at least x", [chanceAtleast,chanceAtleastMaxRemoved]);
    loadTableGraphic("Chance of exactly x", [res.prob,res.probMaxRemoved],false);
    loadTableList("Chance Table",[chanceAtleast,chanceAtleastMaxRemoved,res.prob,res.probMaxRemoved], ['x','% to get x+','% to get x+ mr','% to get x','% to get x mr'], false);

    let defense = Array.fromRange(1,10,1); //calculate for defense values between 2 and 10
    let damageProb = defense.map((e)=>{return res.prob.collectBy(e);});
    let damageProbCumulative = damageProb.map(d=>{return d.cumsum();})
    let damageProbMaxRemoved = defense.map((e)=>{return res.probMaxRemoved.collectBy(e);});
    let damageProbCumulativeMaxRemoved = damageProbMaxRemoved.map(d=>{return d.cumsum();})
    loadTableList("Chance of y Damage or Less given x Defense",damageProbCumulative, ['defense → <br> damage⤵', ...defense],true);
    loadTableList("Chance of y Damage or Less given x Defense (max removed)",damageProbCumulativeMaxRemoved, ['defense → <br> damage⤵', ...defense],false);
    loadTableList("Chance of y Damage given x Defense",damageProb, ['defense → <br> damage⤵', ...defense],false);
    loadTableList("Chance of y Damage given x Defense (max removed)",damageProbMaxRemoved, ['defense → <br> damage⤵', ...defense],false);
}

//called every time the ui changes (with debounce)
function updateStats(){
    //update card count
    for(const [k,v] of Object.entries(cardsByColors)){
        //find total number of cards in the deck and discard
        let nums = v.reduce((total,current)=>{
            total.deck += current.numInDeck; 
            total.discard += current.numInDiscard; 
            total.total += current.max;
            return total
        },{deck:0,discard:0,total:0});
        v.totalInDeck = nums.deck;
        v.totalInDiscard = nums.discard;
        v.total = nums.total;
    }

    //set up decks
    let cardCopy = objectMap(cardsByColors,v=>{
        return{
            deckCards: v.reduce((accu,current)=>{return accu.concat(Array(current.numInDeck).fill(current.value))},[]),
            discardCards: v.reduce((accu,current)=>{return accu.concat(Array(current.numInDiscard).fill(current.value))},[]),
            toDraw:v.toDraw
        }
    });
    // for(const [k,v] of Object.entries(cardsByColors)){
    //     //creates arrays containing the value of each card. strips out isFail and isCrit flags
    //     deckCards[k] = v.reduce((accu,current)=>{return accu.concat(Array(current.numInDeck).fill(current.value))},[]);
    //     discardCards[k] = v.reduce((accu,current)=>{return accu.concat(Array(current.numInDiscard).fill(current.value))},[]);
    // }
    startWork(probCheckMonster,'scripts/monsterProb.mjs',[cardCopy], updateUI);
    console.log("stats");
}

updateStats();


