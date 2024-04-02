import { applyObjHelperFuncions } from "./public/scripts/objHelpers.mjs";
applyObjHelperFuncions();

import express from 'express';
const app = express();
const httpPort = 3000;
const wsPort = 3001;
app.get("/json/player",function(req,res){
    res.send(JSON.stringify(cachedValues.player));
})
app.get("/json/monster",function(req,res){
    res.send(JSON.stringify(cachedValues.monster));
})
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
    console.log(`distributing message: ${data}`)
    sockserver.clients.forEach(client => {
        if(client.clientId != id) client.send(`${data}`)
    })
  })
  ws.onerror = function () {
    console.log('websocket error')
  }
  sendAll(ws);
  ws.send(JSON.stringify({player:cachedValues.player}))
})

function storeData(data){
    try{
        let arr = JSON.parse(data);
        if(!(arr instanceof Array) && (arr instanceof Object)) recieveObj(arr);
        else if(arr.length==3) recieveFromAll(...arr);
    } catch{}
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
    console.log(JSON.stringify(cachedValues.player));
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