import {applyArrayHelperFuncions} from "./arrayHelpers.mjs"
console.log("monsterprob loaded")
self.onmessage = (e) => {
    //console.log('Worker: Message received from main script');
    let res = probCheckMonster(...e.data);
    postMessage(res);
}

function probCheckMonster(cards, iterations=1000000){
    applyArrayHelperFuncions();
    if(cards == undefined) return {prob:[],probMaxRemoved:[]};
    //console.log(deckCards, discardCards);
    //count scores over many iterations
    let scoreCount = [];
    let scoreCountMaxRemoved = [];
    for(let i=0;i<iterations;i++){
        let score = 0;
        let biggestCard = 0;
        //shuffle and choose randomly
        for(const [k,v] of Object.entries(cards)){
            if(v == undefined) return {prob:[],probMaxRemoved:[]};
            let numToDraw = v.toDraw;
            let deck = v.deckCards;
            if(numToDraw >= deck.length){ //if we pick the whole deck, sum the whole deck then use the discard pile
                deck.forEach(v => {
                    score += v;
                    if(v>biggestCard) biggestCard = v;
                });
                numToDraw -= deck.length; //pick less cards from the discard pile
                deck = v.discardCards; //switch deck to discard pile
            }
            if(numToDraw>0){ //if there are still cards to draw
                deck.shuffle(numToDraw).forEach(v=>{
                    score += v;
                    if(v>biggestCard) biggestCard=v;
                }) //shuffle then sum n elements
            }
        }
        (scoreCount[score]) ? scoreCount[score]+=1 : scoreCount[score]=1; //increment count for score
        score -= biggestCard;
        (scoreCountMaxRemoved[score]) ? scoreCountMaxRemoved[score]+=1 : scoreCountMaxRemoved[score]=1; //increment count for score
    }

    let prob = scoreCount.map(val=>{
        return val*100/iterations;
    });

    let probMaxRemoved = scoreCountMaxRemoved.map(val=>{
        return val*100/iterations;
    });

    return {prob,probMaxRemoved};
}


/*
//draws exact number of cards; ignores redraws, crits, and dice rolling
function monsterProb(cards = cardsByColors){
    //set up decks
    let deckCards={};
    let discardCards={};
    let toDraw={};
    let deck = {};
    for(const [k,v] of Object.entries(cards)){
        //creates arrays containing the value of each card. strips out isFail and isCrit flags
        deckCards[k] = v.reduce((accu,current)=>{return accu.concat(Array(current.numInDeck).fill(current.value))},[]);
        discardCards[k] = v.reduce((accu,current)=>{return accu.concat(Array(current.numInDiscard).fill(current.value))},[]);
        toDraw[k] = v.toDraw;
        deck[k] = deckCards[k];
    }

    //get minimum starting score
    let scoreCount = [];
    let minscore = 0;
    for(const [k,v] of Object.entries(cards)){
        if(toDraw[k] >= deck[k].length){ //if we pick the whole deck, sum the whole deck then use the discard pile
            minscore += deck[k].sum(); //sum score from the deck
            toDraw[k] -= deck[k].length; //pick less cards from the discard pile
            deck[k] = discardCards[k]; //switch deck to discard pile
        }
    }

    //only one possible score when drawing 0. its 0. nCr and nPr of zero result in 1.
    for(const [k,v] of Object.entries(cards)){
        if(toDraw[k] >= deck[k].length){ console.error("trying to pick too many cards!");}
        
        //TODO: calc combinations of scores and add minimum
    }

    

    let curcolor='white';
    console.log(deck[curcolor],toDraw[curcolor]);

    //(scoreCount[score]) ? scoreCount[score]+=1 : scoreCount[score]=1; //increment count for score
    
    return scoreCount;
}*/

export{probCheckMonster};