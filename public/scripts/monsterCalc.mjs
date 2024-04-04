import { startWork } from "./worker.mjs";
import { probCheckMonster } from "./monsterProb.mjs";
import {applyArrayHelperFuncions} from "./arrayHelpers.mjs"
import { loadTableGraphic, loadTableList, toggleTable} from "./table.mjs";
applyArrayHelperFuncions();

function updateUI(res){
    window.toggleTable = toggleTable;
    let chanceAtleast = res.prob.reversecumsum();
    let chanceAtleastMaxRemoved = res.probMaxRemoved.reversecumsum();
    loadTableGraphic("Chance Graph of at least x", [chanceAtleast,chanceAtleastMaxRemoved], false);
    loadTableGraphic("Chance Graph of exactly x", [res.prob,res.probMaxRemoved],false);
    loadTableList("Chance Table of at least y or more",[chanceAtleast,chanceAtleastMaxRemoved,], ['y','% to get y+','% to get y+<br>max removed'], false);
    loadTableList("Chance Table of exactly y",[res.prob,res.probMaxRemoved], ['y','% to get y','% to get y<br>max removed'], false);

    let defense = Array.fromRange(1,18,1); //calculate for defense values between 2 and 10
    let damageProb = defense.map((e)=>{return res.prob.collectBy((index)=>Math.floor(index/e))});
    let damageProbMaxRemoved = defense.map((e)=>{return res.probMaxRemoved.collectBy((index)=>Math.floor(index/e))});

    let damageProbT = damageProb.map(p=>p.collectBy((index)=>((index < 6)? index : 6)));
    let damageProbTmr = damageProbMaxRemoved.map(p=>p.collectBy((index)=>((index < 6)? index : 6)));

    loadTableList("Chance of y Damage given x Defense",damageProbT, ['defense→ <br> damage⤵', ...defense],true);
    loadTableList("Chance of y Damage given x Defense<br>(max removed)",damageProbTmr, ['defense→ <br> damage⤵', ...defense],false);
    loadTableList("Chance of y Damage given x Defense<br>Full Table",damageProb, ['defense→ <br> damage⤵', ...defense],false);
    loadTableList("Chance of y Damage given x Defense<br>Full Table (max removed)",damageProbMaxRemoved, ['defense→ <br> damage⤵', ...defense],false);
}

function monsterCalcs(obj){
    console.log('do calcs', obj);
    //cardCopy = {white:{deckCards:[],discardCards:[],toDraw:0}}
    let cardCopy = obj.map(d=>{
        let deckCards = [];
        let discardCards = [];
        for(const prop in d.deck){
            let c = d.deck[prop];
            deckCards = deckCards.concat(Array(c.max-c.discarded).fill(c.points));
            discardCards = discardCards.concat(Array(c.discarded).fill(c.points));
        }
        return {
            deckCards,
            discardCards,
            toDraw: d.might
        }
    })
    startWork(probCheckMonster,'scripts/monsterProb.mjs',[cardCopy], updateUI);
}

export{monsterCalcs}

