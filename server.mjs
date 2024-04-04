import { applyObjHelperFuncions } from "./public/scripts/objHelpers.mjs";
applyObjHelperFuncions();

import express from 'express';
const app = express();
const httpPort = 3000;
const wsPort = 3001;

function cacheToIvon(cacheObj){
    let obj = {
        white_deck:{'0':0,'1':0,'2':0,'w':0},
        yellow_deck:{'0':0,'1':0,'2':0, '3':0, 'y':0},
        red_deck:{'0':0,'2':0,'3':0,'r':0},
        black_deck:{'0':0,'3':0,'4':0,'b':0},
    }
    let wval =cacheObj?.white?.deck?.map((val)=>{return val.discarded});
    if(wval) obj.white_deck.merge(wval);
    let yval = cacheObj?.yellow?.deck?.map((val)=>{return val.discarded});
    if(yval) obj.yellow_deck.merge(yval);
    let rval = cacheObj?.red?.deck?.map((val)=>{return val.discarded});
    if(rval) obj.red_deck.merge(rval);
    let bval = cacheObj?.black?.deck?.map((val)=>{return val.discarded});
    if(bval) obj.black_deck.merge(bval);
    return obj;
}

function ivonToCache(bodyObj){
    let obj = {};
    if(bodyObj.white_deck) obj.white = {deck: bodyObj.white_deck.map(val=>{return {discarded:val}})}
    if(bodyObj.yellow_deck) obj.yellow = {deck: bodyObj.yellow_deck.map(val=>{return {discarded:val}})}
    if(bodyObj.red_deck) obj.red = {deck: bodyObj.red_deck.map(val=>{return {discarded:val}})}
    if(bodyObj.black_deck) obj.black = {deck: bodyObj.black_deck.map(val=>{return {discarded:val}})}
    return obj;
}

app.get("/json/player",function(req,res){
    res.send(JSON.stringify(cacheToIvon(cachedValues.player)));
})
app.post("/json/player",express.json(),function(req,res){
    console.log("post",req.body);
    let obj = {player:ivonToCache(req.body)};
    console.log("post parsed",JSON.stringify(obj))
    recieveObj(obj);
    sendToAllButSender(JSON.stringify(obj),"");
    res.send(JSON.stringify(cacheToIvon(cachedValues.player)));
})
// app.get("/json/monster",function(req,res){
//     res.send(JSON.stringify(cachedValues.monster));
// })
app.use(express.static('public'));
app.use(express.static('rules'));
app.listen(httpPort, () => console.log(`Listening on ${httpPort}`));

let clientIdCounter = new Uint8Array(1); //max of 256 connections
import { WebSocketServer } from 'ws';
const sockserver = new WebSocketServer({ port: wsPort })
sockserver.on('connection', ws => {
  console.log('New client connected!')
  let id = clientIdCounter[0]++;
  ws.clientId = id;
  ws.send('connection established')
  ws.on('close', () => console.log('Client has disconnected!'))
  ws.on('message', data => {
    storeData(data);
    sendToAllButSender(data,id);
  })
  ws.onerror = function () {
    console.log('websocket error')
  }
  sendAll(ws);
  ws.send(JSON.stringify({player:cachedValues.player}))
  ws.send(JSON.stringify({monster:cachedValues.monster}))
})

function sendToAllButSender(data,id){
    console.log(`distributing message: ${data}`)
    sockserver.clients.forEach(client => {
        if(client.clientId !== id) client.send(`${data}`)
    })
}

function storeData(data){
    let arr;
    try{
        arr = JSON.parse(data);
    } catch{ console.warn("could not parse JSON")}
    if(!(arr instanceof Array) && (arr instanceof Object)) try {recieveObj(arr)} catch(e){console.warn("Could not recieve ui obj",e)}
    else if(arr.length==3) try{recieveFromAll(...arr)}catch(e){console.warn("Could not recieve individual key",e)};
}


let cachedValues = {
    white:{},
    black:{},
    yellow:{},
    red:{},
    w0:{},
    w1:{},
    w2:{},
    wc:{},
    y0:{},
    y1:{},
    y2:{},
    y3:{},
    yc:{},
    r0:{},
    r2:{},
    r3:{},
    rc:{},
    b0:{},
    b3:{},
    b4:{},
    bc:{},
}

function recieveObj(obj){
    cachedValues.merge(obj);
    //console.log(JSON.stringify(cachedValues.player));
}

function recieveFromAll(id,key,value){
    switch(key){
        case 'numInDiscard':
            if(cachedValues[id] != undefined && Number.isInteger(value)) cachedValues[id][key] = value;
            break;
        case 'toDraw':
            if(cachedValues[id] != undefined && Number.isInteger(value)) cachedValues[id][key] = value;
            break;
    }
}

function sendAll(client){
    for(let id in cachedValues){
        for(let key in cachedValues[id]){
            client.send(JSON.stringify([id,key,cachedValues[id][key]]));
        }
    }
}