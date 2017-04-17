'use strict';

const add_static = require('./static-files');
const controller = require('./controller');
const Koa = require('koa');
const bodyParse = require('koa-bodyparser');
const templating = require('./templating');
const app = new Koa();
const ws = require('ws');
const WebSocketServer = ws.Server;
const Cookies = require('cookies');
const url = require('url');
const rest = require('./rest');
const CookieKey = require('./controllers/apis').CookieKey;
const User = require('./model').users;
const crypto = require('crypto');
//const hash = crypto.createHash('sha1');
//const merge = require('./controllers/apis').merge;

const isProduction = process.env.NODE_ENV === 'production';

async function cookie2user(cookie){
    if(!cookie){
        return;
    }
    var lastIndex = cookie.lastIndexOf('-');
    var user_id = cookie.substring(0, lastIndex);
    var user = await User.find({
        where:{
            id: user_id
        }
    });
    if(!user){
        console.log('Error: user not found invalid cookie');
        return;
    }else{
        var ck_str = [user.id, user.password, user.email, CookieKey].join('-');
        var cookie_sha1 = crypto.createHash('sha1').update(ck_str).digest('hex');
        if(cookie_sha1 === cookie.substring(lastIndex+1)){
            var new_user = {
                    name: user.name,
                    email: user.email,
                    id: user.id,
                    gender: user.gender,
                    image: user.image,
                    password: '******'
                };
            return new_user;
        }else{
            console.log('Error: Invalid cookie');
        }
    }
}

app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}`);
    await next();
});

app.use(async (ctx, next) => {
    ctx.state.user = (await cookie2user(ctx.cookies.get(CookieKey))) || '';//?
    await next();
})

app.use(async (ctx, next) => {
    var start = Date.now();
    await next();
    var t = Date.now() - start;
    ctx.response.set('X-Rsponse-Time', `${t}ms`);
});

app.use(add_static('/static/', __dirname));
app.use(bodyParse());
app.use(rest.restify('/api/'));
app.use(templating('views', {
    noCache: !isProduction,
    watch: !isProduction
}));
app.use(controller());

var server = app.listen(3000);
console.log('App is running at port 3000');

async function parseUser(obj){
    if(!obj){
        return;
    }
    console.log('try parse ' + obj);
    var s = '';
    if(typeof(obj) === 'string'){
        s = obj;
    }else if(obj.headers){
        let cookies = new Cookies(obj, null);
        s = cookies.get(CookieKey);
    }

    if(s){
        try {
            let user = await cookie2user(s);
            console.log(`User: ${user.name} ID: ${user.id}`);
            return user;
        } catch (error) {
            console.log(error); 
        }
    }
}

async function createWebSocketServer(server, onConnection, onMessage, onClose, onError){
    let wss = new WebSocketServer({
        server: server
    });
    wss.broadcast = function(data) {
        wss.clients.forEach(function each(client) {
            client.send(data);
        });
    };

    onConnection = onConnection || function(){
        console.log('[WebSocket] connected.');
    };
    onMessage = onMessage || function(msg){
        console.log('[WebSocket] message received ' + msg);
    };
    onClose = onClose || function(code, msg){
        console.log('[WebSocket] closed: ' + code + '-' + msg);
    };
    onError = onError || function(err){
        console.log('[WebSocket] error: ' + err);
    };

    wss.on('connection', async function(ws){
        let location = url.parse(ws.upgradeReq.url, true);
        console.log(`[WebSocketServer] connection: ${location.href}`);

        ws.on('message', onMessage);
        ws.on('close', onClose);
        ws.on('error', onError);

        if(location.pathname !== '/ws/chat'){
            ws.close(4000, 'Invalid url');
        }
        
        var user = await parseUser(ws.upgradeReq);
        if(!user){
            ws.close(4001, 'Invalid user');
        }

        ws.wss = wss;
        ws.user = user;

        onConnection.apply(ws);
    });
    console.log('WebSocketServer was attached');
    return wss;
}

var messageIndex = 0;

function createMessage(type, user, data){
    return JSON.stringify({
        id: ++messageIndex,
        type: type,
        user: user,
        data: data
    });
}

function onConnection(){
    let user = this.user;
    let msg = createMessage('join', user, `${user.name} joined.`);
    this.wss.broadcast(msg);
    let user_list = this.wss.clients.map((client) => {
        return client.user;
    });
    this.send(createMessage('list', user, user_list));
}

function onMessage(msg){
    console.log(msg);
    if(msg && msg.trim()){
        this.wss.broadcast(createMessage('chat', this.user, msg));
    }
}

function onClose(){
    this.wss.broadcast(createMessage('left', this.user, `${this.user.name} is left.`));
}
(async () => {
    app.wss = await createWebSocketServer(server, onConnection, onMessage, onClose);
    console.log('app started at port 3000');
})();


