import { isObject } from "./objHelpers.mjs";
let websocketPort = 3001;
let hostname = location.hostname || "localhost";
let socket={};

export function initializeSocket(onRecieveObjectFn){
    connectSocket(onRecieveObjectFn).catch(e=>{console.error("Could not connect to socket at beginning",e)});
    
    window.onfocus = async ()=>{
        await connectSocket(onRecieveObjectFn).catch(e=>{console.error("Could not reconnect to socket on window focus",e)});
    }

    return (obj)=>{
        console.log("send:",JSON.stringify(obj));
        connectSocket().then(
            s => s.send(JSON.stringify(obj)),
        ).catch(
            e => console.error("Could not reconnect before sending value",e)
        );
        onRecieveObjectFn(obj); //loopback all changes to self
    }
}

function connectSocket(onRecieveObjectFn){
    return new Promise((resolve, reject)=>{
        //double check that the socket is open (websocket will close after a minute of inactivity)
        if(socket.readyState == WebSocket.OPEN) resolve(socket);
        else {
            let s =  new WebSocket('ws://'+hostname+':'+websocketPort);
            // Connection opened
            s.addEventListener("open", (event) => {
                resolve(s);
            });
            
            // Listen for messages
            s.addEventListener("message", (event) => {
                console.log("Message from server ", event.data);
                try{
                    let obj = JSON.parse(event.data);
                    if(isObject(obj)) onRecieveObjectFn(obj);
                } catch{console.warn("invalid json from server: ", event.data)}
            });

            s.addEventListener("error", (event) => {
                reject(event);
            });

            s.addEventListener("close", (event) => {
                console.log("Websocket closed");
            });

            socket = s;
        }
    });
}