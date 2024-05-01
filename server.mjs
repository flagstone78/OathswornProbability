import { applyObjHelperFuncions } from "./public/scripts/objHelpers.mjs";
import {secrets} from "./secrets.mjs";
applyObjHelperFuncions();

import fs from 'fs';
import https from 'https';
import express from 'express';
const app = express();

function cacheToIvon(cacheObj){
    let obj = {
        white_deck:{'0':0,'1':0,'2':0,'w':0},
        yellow_deck:{'0':0,'1':0,'2':0, '3':0, 'y':0},
        red_deck:{'0':0,'2':0,'3':0,'r':0},
        black_deck:{'0':0,'3':0,'4':0,'b':0},
    }
    let wval =cacheObj?.deck?.white?.discard?.map((val)=>{return parseInt(val.discarded)||0});
    if(wval) obj.white_deck = obj.white_deck.map((v,i)=>wval[i]||v);
    let yval = cacheObj?.deck?.yellow?.discard?.map((val)=>{return parseInt(val.discarded)||0});
    if(yval) obj.yellow_deck = obj.yellow_deck.map((v,i)=>yval[i]||v);
    let rval = cacheObj?.deck?.red?.discard?.map((val)=>{return parseInt(val.discarded)||0});
    if(rval) obj.red_deck = obj.red_deck.map((v,i)=>rval[i]||v);
    let bval = cacheObj?.deck?.black?.discard?.map((val)=>{return parseInt(val.discarded)||0});
    if(bval) obj.black_deck = obj.black_deck.map((v,i)=>bval[i]||v);
    return obj;
}

function ivonToCache(bodyObj){
    let obj = {};
    if(bodyObj.white_deck) obj.white = {discard: bodyObj.white_deck.map(val=>{return {discarded:parseInt(val)||0}})}
    if(bodyObj.yellow_deck) obj.yellow = {discard: bodyObj.yellow_deck.map(val=>{return {discarded:parseInt(val)||0}})}
    if(bodyObj.red_deck) obj.red = {discard: bodyObj.red_deck.map(val=>{return {discarded:parseInt(val)||0}})}
    if(bodyObj.black_deck) obj.black = {discard: bodyObj.black_deck.map(val=>{return {discarded:parseInt(val)||0}})}
    return obj;
}

app.post("/admin/restart", express.text(), function(req,res){
    console.log("restart code", req.body);
    if(secrets.restartKey && req.body === secrets.restartKey) {
        res.sendStatus(200);
        httpServer.keepAliveTimeout = 1;
        httpServer.close();
        sockserver.close();
    } else res.sendStatus(401);
})

app.get("/json/player",function(req,res){
    res.send(JSON.stringify(cacheToIvon(cachedValues.player)));
})
app.post("/json/player",express.json(),function(req,res){
    console.log("post",req.body);
    if(Object.keys(req.body).length === 0){
        res.status(400).send(`invalid/empty json object: ${JSON.stringify(req.body)}`);
    } else {
        let obj = {player:{deck: ivonToCache(req.body)}};
        console.log("post parsed",JSON.stringify(obj))
        recieveObj(obj);
        sendToAllButSender(JSON.stringify(obj),"");
        res.send(JSON.stringify(cacheToIvon(cachedValues.player)));
    }
})

app.use(express.static('public'));
app.use(express.static('rules'));

let server = app;
let serverMode = 'HTTP';
try{
    const credentials = {
        key:  fs.readFileSync(secrets.sslKeyPath,'utf8'), 
        cert: fs.readFileSync(secrets.sslCertificatePath,'utf8')
    };
    server = https.createServer(credentials, app);
    serverMode = 'HTTPS';
} catch (e){
    console.log(e);
}
const httpServer = server.listen(secrets.httpPort, () => console.log(`${serverMode} Listening on ${secrets.httpPort}`));

let clientIdCounter = new Uint8Array(1); //max of 256 connections
import { WebSocketServer } from 'ws';
const sockserver = new WebSocketServer({ noServer:true },()=>console.log(`Web Socket Listening on ${secrets.wsPort}`))
httpServer.on('upgrade',
    function upgrade(request, socket, head){
        sockserver.handleUpgrade(request,socket,head,
            function done(ws){ sockserver.emit('connection',ws,request);}
        )
    }
);

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
  ws.send(JSON.stringify(cachedValues))
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

let cachedValues = {}

function recieveObj(obj){
    cachedValues.merge(obj);
    //console.log(JSON.stringify(cachedValues.player));
}