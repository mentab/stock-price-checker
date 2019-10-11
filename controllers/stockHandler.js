const mongoose = require("mongoose");
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const https = require("https");

const Like = require("../models/like");

let promises = [];
let stockData = [];

exports.stockGet = (req, res) => {
  if (!req.query || !req.query.stock) {
    return res.send("no stock provided");
  }

  stockData = [];
  promises = [];

  const like = req.query.like;
  const ip = req.ip;

  if (Array.isArray(req.query.stock)) {
    if (req.query.stock.length > 2) {
      return res.send("you must provide at most 2 stocks");
    }
    req.query.stock.forEach(stock => {
      preparePromises(stock, ip, like);
    });
  }

  if (typeof req.query.stock === "string") {
    const stock = req.query.stock.toLowerCase();
    preparePromises(stock, ip, like);
  }

  Promise.all(promises)
    .then(function(stocks) {
      stocks.forEach(stock => {
        if (typeof stock === "object" && stock !== null) {
          stockData.push({
            stock: stock.symbol,
            price: stock.latestPrice,
            likes: stock.likes
          });
        }
        if (stockData.length === 2) {
          stockData[0].rel_likes = stockData[0].likes - stockData[1].likes;
          stockData[1].rel_likes = stockData[1].likes - stockData[0].likes;
          delete stockData[0].likes;
          delete stockData[1].likes;
        }
      });
      res.json({ stockData: stockData });
    })
    .catch(err => {
      res.send(err);
    });
};

const preparePromises = (stock, ip, like) => {
  if (like) {
    promises.push(saveLike(stock, ip));
  }
  promises.push(getStock(stock));
};

const saveLike = (stock, ip) => {
  return new Promise(function(resolve, reject) {
    Like.findOneAndUpdate(
      { stock },
      { $addToSet: { ips: ip } },
      { upsert: true, useFindAndModify: false, new: true },
      function(err, data) {
        if (err) {
          reject("error during like findOneAndUpdate");
        } else if (data) {
          resolve("saveLike " + stock + " with ip : " + ip);
        }
      }
    );
  });
};

const getStock = stockParam => {
  const url =
    "https://repeated-alpaca.glitch.me/v1/stock/" + stockParam + "/quote ";
  return new Promise(function(resolve, reject) {
    https.get(url, res => {
      res.setEncoding("utf8");
      let stock = "";
      res.on("data", data => {
        stock += data;
      });
      res.on("end", () => {
        stock = JSON.parse(stock);
        Like.findOne({ stock: stockParam }, function(err, data) {
          if (err) {
            reject("error during like findOne");
          } else if (data) {
            stock.likes = data.ips.length;
            resolve(stock);
          } else {
            resolve(stock);
          }
        });
      });
    });
  });
};
