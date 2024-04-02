const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);

// Cors error in socket.io, https://stackoverflow.com/questions/24058157/socket-io-node-js-cross-origin-request-blocked
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

// run when client connects
io.on("connection", (socket) => {
  console.log({ msg: "Connected!" });
  socket.on("disconnect", () => {
    console.log({ msg: "Disconnected!" });
  });
  socket.on("client:stream", (stream) => {
    // console.log({ stream });
    io.emit("server:stream", stream);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port : ${PORT}`);
});
