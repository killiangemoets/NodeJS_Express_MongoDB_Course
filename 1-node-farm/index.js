//// CORE MODULES ////
// With the fs module we get access to functions for reading and writing data
// We require the fs module and we store the result in a variable
// The results will be an object of functions that we can use
const fs = require("fs");
const http = require("http");
const url = require("url");
const { text } = require("stream/consumers");
const path = require("path");

//// 3rd PARTY MODULES ////
const slufigy = require("slugify");

//// OUR OWN MODULES ////
const replaceTemplate = require("./modules/replaceTemplate");
const { default: slugify } = require("slugify");

///////////////////////////////////////////
// FILES

// // Blocking, Synchronous way of file reading and writting:
// // It takes 2 arguments:
// // - The path to the file that we're reading
// // - The character encoding
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}\nCreated on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("File written!");

// // Non-Blocking, Asynchronous way of file reading and writting:
// // The callback function takes 2 arguments: the error and the actual data.
// fs.readFile("./txt/start.txt", "utf-8", (err, data) => {
//   console.log(data);
// });
// console.log("Will read file!");

// fs.readFile("./txt/start.tx", "utf-8", (err, data1) => {
//   if (err) return console.log("ERROR!!");
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err2, data2) => {
//     console.log(data2);
//     fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
//       console.log(data3);

//       fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
//         console.log("Your file has been written.");
//       });
//     });
//   });
// });

///////////////////////////////////////////
// SERVER

// fs.readFile("./dev-data/data.json");
// But . is where the script is running while __dirname is where the current file is located.
// So better way :
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
// data is a string that we transform into an object using JSON.parse
const dataObj = JSON.parse(data);

// Example of how slugify works
const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

// createServer accepts a callback function.
// This callback function get access to 2 very important variables: the request and the response objects.
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Overview page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });

    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");

    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);

    res.end(output);

    // Product page
  } else if (pathname === "/product") {
    const product = dataObj[query.id];
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // API
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);

    // Not Found
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "Hello-world",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

// Listent accepts different parameters:
// - The port: a sub-adress on a certain host
// - The host: we actually don't need to specify it. By default, it's localhost
server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to request on port 8000");
});
