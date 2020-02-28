var http = require("http");
var fs = require("fs");
var qs = require("querystring");
var path = require("path");
var socket = require("socket.io");

var globalID = 0;
var userTab = [];
var playerTurn = 0;
var waitingForSync = true;
var currentBoard = [];
var server = http.createServer(function (req, res) {
    let x = (req.url.split('/')).slice(1);
    switch (req.method) {
        case "GET":
            if (req.url.indexOf("css") != -1) {
                fs.readFile(path.resolve(__dirname, 'static', ...x), function (error, data) {
                    res.writeHead(200, { 'Content-Type': 'text/css' });
                    res.write(data);
                    res.end();
                });
            }
            else if (req.url.indexOf("js") != -1) {
                fs.readFile(path.resolve(__dirname, 'static', ...x), function (error, data) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(data);
                    res.end();
                });
            }
            else if (req.url.indexOf("png") != -1) {
                fs.readFile(path.resolve(__dirname, 'static', ...x), function (error, data) {
                    res.writeHead(200, { 'Content-Type': 'image/png' });
                    res.write(data);
                    res.end();
                });
            } else {
                fs.readFile(path.resolve(__dirname, 'static', 'index.html'), function (error, data) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(data);
                    res.end();
                });
            }
            break;
        case "POST":
            handleResponse(req, res);
            break;
    }
})

server.listen(3000, function () {
    console.log("serwer startuje na porcie 3000")
});

function handleResponse(req, res) {
    let allData = "";
    req.on("data", (data) => allData += data)
    req.on("end", (data) => {
        var finish = qs.parse(allData);
        switch (finish.action) {

        }
    });
}

function formatResponse(su, st, data) {
    let res = "";
    try {
        res = JSON.stringify({
            success: su,
            status: st,
            ...data
        });
    } catch (e) {
        console.error("[ERROR]", e);
    }
    console.log(res);
    return res;
}

var io = socket.listen(server);
var players = 0;
var layouts = 5;
let pair = [];
var planszaid = undefined;
io.sockets.on("connection", function (client) {
    console.log("[klient]" + client.id);
    client.broadcast.emit("playerconnection");
    if (!!planszaid) planszaid = undefined;
    client.on("updatestate", function (data) {
        client.broadcast.emit("updatestate", { x: data.x, y: data.y, brot: data.brot, crot: data.crot });
    })
    client.on("getpair", function () {
        pair.push(client);
        if (pair.length > 1) {
            let plansza = Math.round((layouts - 1) * Math.random());
            for (let c of pair) {
                io.sockets.to(c.id).emit("gamestart", {
                    number: (players++ % 2),
                    planszaid: plansza
                });
            }
            pair = [];
        }
    })
})