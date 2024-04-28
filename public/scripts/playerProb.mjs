import {applyArrayHelperFuncions} from "./arrayHelpers.mjs"
import { drawAll, drawDeck, rollDice } from "./probHelpers.mjs";
console.log("playerprob loaded")
self.onmessage = (e) => {
    if(!Array.fromRange) applyArrayHelperFuncions();
    //console.log('Worker: Message received from main script');
    let res = probCheckPlayer(...e.data);
    postMessage(res);
}

//strategy: when redrawing, from all the piles that have a fail, redraw from the pile with the least chance of another fail

function expandArray(mightArray){
    if(mightArray[0] === undefined) return undefined;
    return Array(mightArray[0]+1) //create array of length v+1
        .fill().map((v,i)=> Array(mightArray[0]+1-i) //fill array with arrays of decreasing size
           .fill().map(()=>mightArray.slice(1)).map(expandArray) //fill those arrays with sub array of mightArray and 
        );
}
function forEvery(arr,callback,index=[]){
    for(let i=0;i<arr.length;i++){
        const newIndex = [...index,i];
        if(Array.isArray(arr[i])) forEvery(arr[i],callback,newIndex);
        else arr[i] = callback(newIndex);
    }
}

//goal: find score probability for given #dice and #deck, then  
export function probCheckPlayer(cards, rerolls){
    if(cards == undefined) return [];
    console.log(cards);

    const decks = Object.entries(cards);
    const decksName = decks.map(v=>v[0]);
    const decksDesc = decks.map(v=>v[1]);
    for(const v of decksDesc){ //for each deck
        //ensure cards are sorted from least to highest points
        const sortedKeys = Object.keys(v.deck).sort((a,b)=>{
            const vala = v.deck[a].points - v.deck[a].isfail||0 + v.deck[a].iscrit||0;
            const valb = v.deck[b].points - v.deck[b].isfail||0 + v.deck[b].iscrit||0;
            return vala - valb;
        });
        v.sortedKeys = sortedKeys;
        v.points = sortedKeys.map(k=>v.deck[k].points);
        v.iscrit = sortedKeys.map(k=>v.deck[k].iscrit===true);
        v.isfail = sortedKeys.map(k=>v.deck[k].isfail===true);
        
        //calculate for draw pile
        const might = v.toDraw;
        const drawPile = sortedKeys.map(k=>v.deck[k].max-v.deck[k].discarded);
        const discPile = sortedKeys.map(k=>v.deck[k].discarded);
        v.deckProb = drawDeck(drawPile,discPile,might);
        
        //calculate for dice pile
        const diceWeights = sortedKeys.map(k=>v.deck[k].max);
        v.diceProb = rollDice(diceWeights,might) 
    }

    const deckDice = decksDesc.map(v=>[v.deckProb,v.diceProb]).flat();
    const points = decksDesc.map(v=>[v.points,v.points]).flat();
    const iscrit = decksDesc.map(v=>[v.iscrit,v.iscrit]).flat();
    const isfail = decksDesc.map(v=>[v.isfail,v.isfail]).flat();

    function combinationOfMights(scoreIndex){
        const probArrays = scoreIndex.map((might,i)=>deckDice[i][might]);
        const scoreProb=[];
        const probArraysLength = probArrays.map(v=>v.length-1);
        drawAll(probArraysLength,combinationOfPulls,[probArrays,scoreProb]);
        return scoreProb;
    }

    function combinationOfPulls(probi,probArrays,scoreProb){
        const chosenCardsAndProb = probi.map((i,probArraysi)=>probArrays[probArraysi][i]); //array of [prob, pulled]
        const chosenCards = chosenCardsAndProb.map(v=>v[1]);
        const chosenProb = chosenCardsAndProb.map(v=>v[0]);
        const baseProb = chosenProb.reduce(mult,1);
        
        //const crits = Array(chosenCards.length/2).fill(0);
        const fails = Array(chosenCards.length).fill(0);
        let score = 0;
        for(let deckdicei=0; deckdicei<chosenCards.length;deckdicei++){
            const deck = chosenCards[deckdicei];
            for(let cardi=0; cardi<deck.length; cardi++){
                const cardCount = deck[cardi];
                //crits[deckIndex] += curC*deck.iscrit[iC];
                fails[deckdicei] += cardCount*isfail[deckdicei][cardi];
                score += cardCount*points[deckdicei][cardi];
            }
        }

        const totalFails = fails.sum();
        const baseScore = (totalFails>1)?0:score;
        scoreProb[baseScore] = (scoreProb[baseScore]||0) + baseProb; 
    }

    //for every combination of mights, resolve score
    const maxMights = decksDesc.map(v=>v.toDraw);
    const allScoreProbs = [maxMights].map(expandArray)[0];
    forEvery(allScoreProbs,combinationOfMights)

    return allScoreProbs; //[wdeck][wdice][ydeck][ydice][rdeck][rdice][bdeck][bdice][rerolls] = [score]
}



function addNested(arr,indexArr,val){
    let curArr = arr;
    for(let i=0;i<indexArr.length-2;i++){
        const index = indexArr[i];
        if(curArr[index] === undefined) curArr[index]=[];
        curArr = curArr[index];
    }
    const lasti = indexArr.at(-1);
    curArr[lasti] = curArr[lasti]||0 + val; 
}
function sum(prev,v){return prev+v;}
function mult(prev,v){return prev*v;}