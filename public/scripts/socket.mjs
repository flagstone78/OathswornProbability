let websocketPort = 3001;
let hostname = location.hostname || "localhost";
let socket={};
export function connectSocket(messageCallbackFcn){
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
                messageCallbackFcn(event);
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