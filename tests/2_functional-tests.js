/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");
var likes = 0;
chai.use(chaiHttp);

suite("Functional Tests", function() {
  suite("GET /api/stock-prices => stockData object", function() {
    test("1 stock", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices?stock=goog")
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, "stockData");
          assert.isArray(res.body.stockData);
          assert.property(res.body.stockData[0], "stock");
          assert.property(res.body.stockData[0], "price");
          done();
        });
    });

    test("1 stock with like", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices?stock=goog&like=true")
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, "stockData");
          assert.isArray(res.body.stockData);
          assert.property(res.body.stockData[0], "stock");
          assert.property(res.body.stockData[0], "price");
          assert.property(res.body.stockData[0], "likes");
          assert.equal(res.body.stockData.length, 1);

          likes = res.body.stockData[0].likes;

          done();
        });
    });

    test("1 stock with like again (ensure likes arent double counted)", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices?stock=goog&like=true")
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, "stockData");
          assert.isArray(res.body.stockData);
          assert.property(res.body.stockData[0], "stock");
          assert.property(res.body.stockData[0], "price");
          assert.property(res.body.stockData[0], "likes");
          assert.equal(res.body.stockData[0].likes, likes);
          assert.equal(res.body.stockData.length, 1);
          done();
        });
    });

    test("2 stocks", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices?stock=goog&stock=msft")
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, "stockData");
          assert.isArray(res.body.stockData);
          assert.property(res.body.stockData[0], "stock");
          assert.property(res.body.stockData[0], "price");
          assert.notProperty(res.body.stockData[0], "likes");
          assert.property(res.body.stockData[0], "rel_likes");
          assert.property(res.body.stockData[1], "stock");
          assert.property(res.body.stockData[1], "price");
          assert.property(res.body.stockData[1], "rel_likes");
          assert.notProperty(res.body.stockData[1], "likes");
          assert.equal(res.body.stockData.length, 2);
          done();
        });
    });

    test("2 stocks with like", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices?stock=goog&stock=msft&like=true")
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, "stockData");
          assert.isArray(res.body.stockData);
          assert.property(res.body.stockData[0], "stock");
          assert.property(res.body.stockData[0], "price");
          assert.property(res.body.stockData[0], "rel_likes");
          assert.notProperty(res.body.stockData[0], "likes");
          assert.property(res.body.stockData[1], "stock");
          assert.property(res.body.stockData[1], "price");
          assert.property(res.body.stockData[1], "rel_likes");
          assert.notProperty(res.body.stockData[1], "likes");
          assert.equal(res.body.stockData.length, 2);
          done();
        });
    });
  });
});
