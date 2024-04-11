import {applyArrayHelperFuncions} from "./arrayHelpers.mjs"
console.log("playerprob loaded")
self.onmessage = (e) => {
    applyArrayHelperFuncions();
    //console.log('Worker: Message received from main script');
    let res = probCheckPlayer(...e.data);
    postMessage(res);
}

function drawOnce(deck,dice,scoreCount, iterations){
    const deckp = [0,...deck.map(v=>v.points).cumsum()];
    const deckf = [0,...deck.map(v=>v.isfail).cumsum()];
    const deckc = [0,...deck.map(v=>v.iscrit).cumsum()];
    const dicep = [0,...dice.map(v=>v.points).cumsum()];
    const dicef = [0,...dice.map(v=>v.isfail).cumsum()];
    const dicec = [0,...dice.map(v=>v.iscrit).cumsum()];

    for(let mdeck=0; mdeck<scoreCount.length; mdeck++){
        for(let mdice=0; mdice<scoreCount[mdeck].length; mdice++){
            const crits = deckc[mdeck]+dicec[mdice];
            const fails = deckf[mdeck]+dicef[mdice];
            
            for(let cardCrit=0;cardCrit<=crits;cardCrit++){
                const diceCrit = crits-cardCrit;
                
                let oldCrits = deckc[mdeck];
                let decki = Math.min(mdeck+cardCrit, deckc.length-1);
                while(deckc[decki]!=oldCrits){
                    oldCrits = deckc[decki];
                    decki = Math.min(mdeck+oldCrits, deckc.length-1);
                }

                oldCrits = dicec[mdice];
                let dicei = Math.min(mdice+diceCrit, dicec.length-1);
                while(dicec[dicei]!=oldCrits){
                    oldCrits = dicec[dicei];
                    dicei = Math.min(mdice+oldCrits, dicec.length-1);
                }

                const points = (deckp[decki] + dicep[dicei]);
                if(scoreCount[mdeck][mdice][points]===undefined) {scoreCount[mdeck][mdice][points] = [];}
                if(scoreCount[mdeck][mdice][points][fails]===undefined) {scoreCount[mdeck][mdice][points][fails] = 0;}
                scoreCount[mdeck][mdice][points][fails] += 100/(iterations*(crits+1))
            }
        }
    }
}

function drawColor(v, iterations){
    const scoreCount = Array(v.toDraw+1).fill().map((_,i)=>Array(v.toDraw+1-i).fill().map(_=>[]));
    let deck = [];
    let discard = [];
    let dice = [];
    for(const n in v.deck){
        const cd = v.deck[n];
        const card = {points:cd.points, isfail:cd.isfail===true, iscrit:cd.iscrit===true};
        dice = dice.concat(Array(cd.max).fill(card));
        deck = deck.concat(Array(cd.max-cd.discarded).fill(card));
        discard = discard.concat(Array(cd.discarded).fill(card));
    }
    for(let i=0;i<iterations;i++){
        const fulldeck = Array.from(deck).shuffle().concat(discard.shuffle()); //randomly shuffled deck
        const fulldice = Array(v.toDraw*2).fill().map(()=>dice[Math.floor(Math.random()*dice.length)])
        drawOnce(fulldeck,fulldice,scoreCount, iterations);
    }
    return scoreCount;
}

//goal: find score probability for given #dice and #deck, then  
function probCheckPlayer(cards, iterations=10000){
    if(cards == undefined) return [];
    console.log(cards);
    //count scores over many iterations
    let scoreColors = [];
    for(const [k,v] of Object.entries(cards)){ //for each deck
        scoreColors[k] = drawColor(v, iterations);
    }

    return scoreColors;
}


function deckProb(deck,currentProb=1,currentNumOfCards=0){
    //calc probability and record score

    //for each card type:
    //call with one removed
}

function playerProb(){
    let might = 3
    for(let m=0; m<=might; m++){
        for(let d=0; d<=might-m;d++){

        }
    }
}

export{probCheckPlayer};