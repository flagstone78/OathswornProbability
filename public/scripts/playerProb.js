function sumArray(arr,amt){
    let failCount = 0;
    let ret = 0;
    let prevWasCrit = false;
    for(let i=0; i<amt; i++){
        let val = arr[i];
        if(val.isFail && !prevWasCrit){failCount+=1; if(failCount>=2){return 0;}}
        else{ret+=val.value;}
        prevWasCrit = val.isCrit;
    }
    return ret;
}

//remove unnecessary items from the deck
function slimDeck(cards){
    let deck = {};
    let discard = {};
    let stats={};
    for(const [k,v] of Object.entries(cards)){
        discard[k]=v.map((card)=>{
            return {count: card.numInDiscard, value:card.value, isCrit:card.isCrit, isFail:card.isFail};
        });
        deck[k]=v.map((card)=>{
            return {count: card.numInDeck, value:card.value, isCrit:card.isCrit, isFail:card.isFail};
        });
        stats[k] = {toDraw: v.toDraw, totalInDiscard:v.totalInDiscard, totalInDeck:v.totalInDeck};
    }
    return {deck, discard, stats};
}

//given a discription of a deck, expand the deck into individual card objects
function expandCards(cards){
    return cards.reduce((cumu,current)=>{
        return cumu.concat(Array(current.count).fill({value:current.value, isCrit:current.isCrit, isFail:current.isFail}));
    },[])
}

function probCheck(color='white', pick=13, iterations=1000000){
    //let pick = 13;
    let deck = slimDeck(cardsByColors).deck[color];
    let individualCards = expandCards(deck);
    let scores = [];
    for(let i = 0; i<iterations; i++){
        let randomizedCards = randomize(individualCards,pick);
        let res = sumArray(randomizedCards,pick);
        (scores[res]) ? scores[res]+=1 : scores[res]=1;
    }
    let prob = scores.map(val=>{
        return val/iterations;
    })
    return prob;
}