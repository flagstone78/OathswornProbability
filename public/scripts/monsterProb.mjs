import {applyArrayHelperFuncions} from "./arrayHelpers.mjs"
import { forEveryCombination, drawDeck} from "./probHelpers.mjs";
console.log("monsterprob loaded")
self.onmessage = (e) => {
    //console.log('Worker: Message received from main script');
    //const res = probCheckMonster(...e.data);
    const res2 = monsterProb(...e.data);
    postMessage(res2);
}

export function probCheckMonster(cards, removeMax=false, rerollAllZeros=false, iterations=1000000){
    applyArrayHelperFuncions();
    if(cards == undefined) return [];
    console.log(cards);
    //count scores over many iterations
    let scoreCount = [];
    for(let i=0;i<iterations;i++){
        let score = 0;
        let biggestCard = 0;
        //shuffle and choose randomly
        for(const [k,v] of Object.entries(cards)){
            if(v == undefined) return [];
            let numToDraw = v.toDraw;
            let deck = v.deckCards;
            let zerosToReroll = (rerollAllZeros)? Infinity : v.rerollZeros;
            function tally(v){
                score += v;
                if(v>biggestCard) biggestCard = v;
                if(v!=0 || zerosToReroll <= 0) numToDraw--;
                else zerosToReroll--;
            }
            if(numToDraw >= deck.length){ //if we pick the whole deck, sum the whole deck then use the discard pile
                deck.forEach(v => {tally(v)});
                deck = v.discardCards; //switch deck to discard pile
            }
            if(numToDraw>0){ //if there are still cards to draw
                deck.shuffle().some(v=>{
                    tally(v);
                    return !numToDraw;
                }) //shuffle then sum n elements
            }
        }
        if(removeMax) score -= biggestCard;
        (scoreCount[score]) ? scoreCount[score]+=1 : scoreCount[score]=1; //increment count for score
    }

    let prob = scoreCount.map(val=>{
        return val/iterations;
    });

    return prob;
}


//draws exact number of cards; ignores redraws, crits, and dice rolling
export function monsterProb(cards, removeMaxCards=0, removeAllZeros=false){
    if(cards == undefined) return [];
    console.log(cards);

    const decks = Object.entries(cards);
    //const decksName = decks.map(v=>v[0]);
    const decksDesc = decks.map(v=>v[1]);
    for(const v of decksDesc){ //for each deck
        //ensure cards are sorted from least to highest points
        const sortedKeys = Object.keys(v.deck).sort((a,b)=>{
            const vala = v.deck[a].points - v.deck[a].isfail||0 + v.deck[a].iscrit||0;
            const valb = v.deck[b].points - v.deck[b].isfail||0 + v.deck[b].iscrit||0;
            return vala - valb;
        });
        v.sortedKeys = sortedKeys;
        
        //calculate for draw pile
        const might = v.toDraw;
        const drawPile = sortedKeys.map(k=>v.deck[k].max-v.deck[k].discarded);
        const discPile = sortedKeys.map(k=>v.deck[k].discarded);
        if(removeAllZeros){
            drawPile[0]=0;
            discPile[0]=0;
        }
        v.deckProb = drawDeck(drawPile,discPile,might);
    }

    const scoreProb = [];
    const probs = decksDesc.map(v=>v.deckProb[v.toDraw]);
    
    const points = decksDesc.flatMap(v=>v.sortedKeys.map(k=>v.deck[k].points));
    const sortedPointsIndex = Array(points.length).fill().map((v,i)=>i).sort((a,b)=>points[b]-points[a]);

    forEveryCombination(probs,(picked)=>{
        let totalProb = 1;
        let totalCards = [];
        for(let i=0;i<picked.length;i++){
            const [prob, deck] = picked[i];
            totalCards.push(...deck);
            totalProb *= prob;
        }
        
        //remove highest n cards
        let removeMax = removeMaxCards;
        for(let i=0;i<totalCards.length && removeMax>0;i++){
            const highestCounti = sortedPointsIndex[i];
            const highestCount = totalCards[highestCounti];
            if(highestCount){
                const rem = Math.min(highestCount,removeMax);
                removeMax -= rem;
                totalCards[highestCounti] -= rem;
            }
        }

        let totalPoints = 0;
        for(let i=0;i<totalCards.length;i++){
            totalPoints += totalCards[i]*points[i];
        }
        scoreProb[totalPoints] = (scoreProb[totalPoints]||0) + totalProb;
    })
    return scoreProb;
}