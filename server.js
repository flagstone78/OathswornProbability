const express = require('express');
const app = express();
const httpPort = 3000;
const wsPort = 443;
app.use(express.static('public'));
app.use(express.static('rules'));
app.listen(httpPort, () => console.log(`Listening on ${httpPort}`));

const { WebSocketServer } = require('ws')
const sockserver = new WebSocketServer({ port: wsPort })
sockserver.on('connection', ws => {
  console.log('New client connected!')
  ws.send('connection established')
  ws.on('close', () => console.log('Client has disconnected!'))
  ws.on('message', data => {
    storeData(data);
    console.log(`distributing message: ${data}`)
    sockserver.clients.forEach(client => {
      client.send(`${data}`)
    })
  })
  ws.onerror = function () {
    console.log('websocket error')
  }
  sendAll(ws);
})

function storeData(data){
    try{
        let arr = JSON.parse(data);
        if(arr.length==3) recieveFromAll(...arr);
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
    for(id in cachedValues){
        for(key in cachedValues[id]){
            client.send(JSON.stringify([id,key,cachedValues[id][key]]));
        }
    }
}