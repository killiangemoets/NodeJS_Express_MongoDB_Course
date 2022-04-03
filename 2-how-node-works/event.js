const EventEmitter = require("events");
const http = require("http");

// const myEmitter = new EventEmitter();

// It's a best practice to create a new class that will actually inherit from the node EventEmitter:

class Sales extends EventEmitter {
  constructor() {
    super();
  }
}
const myEmitter = new Sales();

// We can set up multiple listeners for the same event!

// These two objects are the observers.
myEmitter.on("newSale", () => {
  console.log("There was a new sale!");
});
myEmitter.on("newSale", () => {
  console.log("Constumer name: Jonas");
});

// This is the object that emits the event
// myEmitter.emit("newSale");

// We can even pass arguments to the EventListener by passing them as an additional argument in the emitter
myEmitter.on("newSale", (stock) => {
  console.log(`There are now ${stock} items left in the stock.`);
});

myEmitter.emit("newSale", 9);

/////////////////////////////////////////////////////////////////
const server = http.createServer();

server.on("request", (req, res) => {
  console.log("Request received!");
  console.log(req.url);
  res.end("Request received");
});

server.on("request", (req, res) => {
  console.log("Another request!");
});

server.on("close", () => {
  console.log("Server closed");
});

server.listen("8000", "127.0.0.1", () => {
  console.log("Waiting for requests...");
});
