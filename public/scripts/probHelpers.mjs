// Calculates the probability of drawing exactly some amount of cards from a deck. the deck cards must not be unique. 
// The deck is described by an array where each element is the count of that type of card. 
// For example, a deck with 3 red, 7 white, 2 blue, and 5 black cards would be described by: drawPile = [3,7,2,5].
// A separate array should be used to describe the cards. eg: desc = ['red','white','black']
//
// note: if you attempt to draw more of any type of card than exists in the deck, this will always return 0
//
// Theory is as follows:
//      The chance of pulling 1 card of d1 is: (d1)/(total)
//      The chance of pulling 1 card of d1 then another of d1 in a row is: (d1*(d1-1))/((total-0)*(total-1))
//      The chance of pulling 1 of d1 and then 1 card of d2 is: (d1 * d2) /((total-0)*(total-1))
//        However, the order does not matter when pulling cards. We must multiply by the number of different ways to pull those cards.
//      The chance of pulling 1 of d1 and 1 of d2 in any order is: (d1*d2 * 1*2)/((total-0)*(total-1)*1*1)
//      When drawing multiple of the same type, order does not matter
//      The chance of drawing 3 of d1, 2 of d2, and 1 of d3 is: ((d1-0)*(d1-1)*(d1-2) * (d2-0)*(d2-1) * (d3-0) * 1*2*3*4*5*6)/((total-0)*(total-1)*(total-2)*(total-3)*(total-4)*(total-5) * 1*2*3 * 1*2 * 1) 
// The calculation can be done with factorials: 
//      d# is drawPile[#] which means the amount of that card type in the deck, 
//      t# is toDraw[#] which means the amount of that card type that must be drawn
//      The process must be computed for each card type
//      The calculation for a deck with 4 card types: note: ! is factorial, 
//      prob = (  d1!    *   d2!    *    d3!    *   d4!    * (d1+d2+d3+d4-t1-t2-t3-t4)! * (t1+t2+t3+t4)!)/
//             ((d1-t1)! * (d2-t2)! *  (d3-t3)! * (d4-t4)! * (d1+d2+d3+d4)! ) /
//              (  t1!    *   t2!    *    t3!    *   t4!    )  
//   or the calculation can be done with ranges:
//      prob = (d1:-1:d1-t1+1) * (d2:-1:d2-t2+1) * (d3:-1:d3-t3+1) * (d4:-1:d4-t4+1) * (          1: 1:t1+t2+t3+t4)/
//                (1:1:t1)     *    (1:1:t2)     *    (1:1:t2)     *    (1:1:t2)     * (d1+d2+d3+d4:-1:d1+d2+d3+d4-t1-t2-t3-t4+1)
//      note: ranges are inclusive. ie 1:1:3 = 1*2*3
//      note: (1:1:0) = 1  (1:1:-1) = Infinity
//
// example for a deck with 4 card types and pulling[4,1,2,3] from [6,6,3,3] cards: d=drawPile=[6,6,3,3], t=toDraw=[4,1,2,3]
//   prob = (6*5*4*3 * 6 * 3*2 * 3*2*1 * 1 *2 *3 *4 *5 *6 *7 *8 *9 *10) 
//          (1*2*3*4 * 1 * 1*2 * 1*2*3 * 18*17*16*15*14*13*12*11*10*9)  ==  0.006170300287947345
import { factorial } from "./factorial.mjs";

export function drawXsFromPile(toDraw,drawPile){
    let dTotal = 0; //d1+d2+d3+d4 total cards in the draw pile
    let tTotal = 0; //t1+t2+t3+t4 amount of cards to be removed fro the draw pile
    let drawnCardsEachStep = 1;
    let validCardsEachStep = 1;
    for(let i = 0; i<toDraw.length; i++){            
        dTotal += drawPile[i];
        tTotal += toDraw[i]; //accumulate to total being added
        validCardsEachStep *= factorial(drawPile[i])/factorial(drawPile[i]-toDraw[i]); // 6*5*4*3 * 6 * 3*2 * 3*2*1
        drawnCardsEachStep *= factorial(toDraw[i]);                                    // 1*2*3*4 * 1 * 1*2 * 1*2*3
    };
    const drawnPileTotalEachStep = factorial(tTotal);                           // 1 *2 *3 *4 *5 *6 *7 *8 *9 *10
    const drawPileTotalEachStep = factorial(dTotal) / factorial(dTotal-tTotal); // 18*17*16*15*14*13*12*11*10*9

    return ((validCardsEachStep * drawnPileTotalEachStep) / //6*5*4*3 * 6 * 3*2 * 3*2*1  *  1 *2 *3 *4 *5 *6 *7 *8 *9 *10
            (drawnCardsEachStep * drawPileTotalEachStep));  //1*2*3*4 * 1 * 1*2 * 1*2*3  *  18*17*16*15*14*13*12*11*10*9
}

// example for a dice with 4 sides weighted by [6,6,3,3] and rolling [4,1,2,3] 
//   prob = (6 *6 *6 *6  * 6  * 3*3  * 3 *3 *3  * 1*2*3*4 * 5 * 6*7 * 8*9*10) 
//          (18*18*18*18 * 18 *18*18 * 18*18*18 * 1*2*3*4 * 1 * 1*2 * 1*2*3)  ==  0.0066681908245694215
export function rollXsDice(roll, diceWeight){
    const totalRolls = roll.reduce(sum,0);
    const diceWeightSum = diceWeight.reduce(sum,0);
    return roll.reduce((prev,rollCount,i)=>{
        return prev * Math.pow( diceWeight[i]/diceWeightSum, rollCount ) / factorial(rollCount);
    },factorial(totalRolls));
}

export function rollDice(diceWeightVector, might){
    const probByMight = Array(might+1).fill().map(()=>[]);
    
    drawAll(Array(diceWeightVector.length).fill(might),(indexArr)=>{
        const currentMight = indexArr.reduce(sum,0);
        if(currentMight <= might){
            const prob = rollXsDice(indexArr,diceWeightVector);
            probByMight[currentMight].push([prob,indexArr]);
        }
    })
    return probByMight;
}

export function drawDeck(drawPile,discPile,might){
    const probByMight = Array(might+1).fill().map(()=>[]);
    drawAll(drawPile,(indexArr)=>{
        const currentMight = indexArr.reduce(sum,0);
        if(currentMight <= might){
            const prob = drawXsFromPile(indexArr,drawPile);
            probByMight[currentMight].push([prob,indexArr]);
        }
    });
    //calculate for discard pile
    const drawPileMight = drawPile.reduce(sum,0);
    if(might > drawPileMight) {
        drawAll(discPile,(indexArr)=>{
            const currentMight = drawPileMight + indexArr.reduce(sum,0);
            if(currentMight <= might && currentMight > drawPileMight){
                const prob = drawXsFromPile(indexArr,discPile);
                probByMight[currentMight].push([prob,addArrays(indexArr,drawPile)]);
            }
        })
    }
    return probByMight
}

function numToIndexArray(inum,maxValStates){
    let ret = Array(maxValStates.length);
    for(let i=0;i<maxValStates.length;i++){
        const divBy = maxValStates[i];
        const remainder = inum % divBy;
        ret[i] = remainder;
        inum = (inum-remainder)/divBy;
    }
    return ret;
}

export function drawAll(pile, callback, additionalArgs=[]){
    const pileStates = Array.from(pile,v=>v+1);
    const pileCombinations = pileStates.reduce(mult,1);
    for(let i=0;i<pileCombinations;i++){
        const indexArr = numToIndexArray(i,pileStates);
        callback(indexArr,...additionalArgs);
    }
}

function sum(prev,v){return prev+v;}
function mult(prev,v){return prev*v;}
function addArrays(a1,a2){
    const [shorterArray,longerArray] = (a1.length < a2.length)? [a1,a2]: [a2,a1];
    const ret = Array.from(longerArray);
    for(let i=0;i<shorterArray.length;i++){
        ret[i] += shorterArray[i];
    }
    return ret;
}

//TODO: move these to a unit test framework
export function testCardProb(){
    Object.defineProperty(Array,'fromDimensions',{value: function(sizeArr){
        if(sizeArr.length===0) return undefined;
        return Array(sizeArr[0]).fill().map(() => Array.fromDimensions(sizeArr.slice(1)));
    }});
    
    Object.defineProperty(Array.prototype,'n',{value: function(indexArr){
        return indexArr.reduce((prev,nextIndex)=> prev? prev[nextIndex] : prev,this);
    }});
    
    Object.defineProperty(Array.prototype,'nSet',{value: function(indexArr,val){
        return indexArr.slice(0,-1).reduce((prev,nextIndex)=> prev? prev[nextIndex] : prev,this)[indexArr.at(-1)] = val;
    }});
    
    Object.defineProperty(Array.prototype,'nforEach',{value: function(callback){
        function subnforEach(v,indexArr){
            if(Array.isArray(v)) for(let i=0;i<v.length;i++){subnforEach(v[i],[...indexArr,i])}
            else callback(v,indexArr);
        }
        for(let i = 0; i<this.length; i++) {subnforEach(this[i],[i])};
    }});

    function sumArr(arr){
        let total = 0;
        for(let i=0;i<arr.length;i++){total += arr[i];}
        return total;
    }

    const might = 18;
    const probByMight = Array(might+1).fill().map(()=>[]);
    probByMight[0].push([1,[0,0,0,0]]);

    const initialStateProbability = Array.fromDimensions([7,7,4,4]);
    initialStateProbability.nSet([0,0,0,0],1);

    // A recursive approach to double check results
    function probForDrawn(finalDrawnPile, finalDrawPile){
        const probOfDrawn = initialStateProbability.n(finalDrawnPile);
        if(probOfDrawn) return probOfDrawn;

        const totalLeftToDraw = sumArr(finalDrawPile);

        let prob = 0;
        for(let cardIndex = 0; cardIndex < finalDrawPile.length; cardIndex++){
            const cardsLeftToUndraw = finalDrawnPile[cardIndex];
            if(cardsLeftToUndraw > 0){
                const nextDrawnPile = Array.from(finalDrawnPile); nextDrawnPile[cardIndex]--; //remove from drawn pile
                const nextDrawPile = Array.from(finalDrawPile); nextDrawPile[cardIndex]++; //add to draw pile
                prob +=  probForDrawn(nextDrawnPile,nextDrawPile) * nextDrawPile[cardIndex] / (totalLeftToDraw+1)//initialStateProbability.n(nextDrawPile)||0; 
            }
        }

        initialStateProbability.nSet(finalDrawnPile, prob);
        const totalDrawn = sumArr(finalDrawnPile);
        if(totalDrawn <= might) probByMight[totalDrawn].push([prob,finalDrawnPile]);
        return prob;
    }

    let t = Date.now();
    probForDrawn([6,6,3,3], [0,0,0,0]);
    console.log('recursive',Date.now()-t, probByMight);

    t = Date.now();
    let probFast = probByMight.map(mArr=>mArr.map(v=>{
        const [targetProb, toDraw] = v;
        return drawXsFromPile(toDraw,[6,6,3,3]);
    }))
    console.log('equation',Date.now()-t, probFast);

    const diff = probByMight.map((mArr,i)=>mArr.map((v,j)=>{
        const [targetProb, indexArr] = v;
        const testProb = probFast[i][j];
        return Math.abs(testProb-targetProb)<1e-15;
    }))
    console.log('Equation matches recursive funtion', diff.every(v=>v.every(w=>w===true)), diff);

    const probSums = probFast.map(v=>v.reduce(sum,0));
    console.log('When drawing n cards, the sum of all probabilities should be 1', probSums.every(v=>Math.abs( v-1 ) < 1e-15));
}

function testDiceProb(){
    const prob = rollDice([6,6,3,3], 18);
    const probSums = prob.map(v=>v.reduce((p,w)=>p+w[0],0));
    console.log('When drawing n dice, the sum of all probabilities should be 1', probSums.every(v=>Math.abs( v-1 ) < 1e-14));
}

//testCardProb();
//testDiceProb();