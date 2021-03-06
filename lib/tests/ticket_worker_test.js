// Generated by CoffeeScript 1.6.3
/*
# test for ticket_worker
*/


(function() {
  var HOST, TicketManager, TicketWorker, WORKER_RECORD, assert, config, debuglog, request, setTicketWorker, should, ticketManager, ticketWorker;

  should = require("should");

  request = require("request");

  TicketWorker = require("../").TicketWorker;

  debuglog = require("debug")("ticketman:test:ticket_worker_test");

  assert = require("assert");

  config = require("../config/config")['development'];

  WORKER_RECORD = null;

  TicketManager = require("../").TicketManager;

  ticketManager = new TicketManager("test ticket_manager", "http://localhost:3456");

  ticketWorker = null;

  setTicketWorker = function(val) {
    return ticketWorker = val;
  };

  HOST = "http://localhost:3456";

  describe("test ticket_worker", function() {
    before(function(done) {
      var options;
      options = {
        method: 'POST',
        url: "" + HOST + "/workers/new.json",
        auth: config.basicAuth,
        json: {
          name: "test#" + (Date.now().toString(36)),
          desc: "just for test"
        }
      };
      return request(options, function(err, res, body) {
        debuglog("err:" + err + ", res.statusCode:" + (res != null ? res.statusCode : "n/a") + ", body:%j", body);
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        assert.notEqual(body, null);
        body.id = body._id;
        WORKER_RECORD = body;
        WORKER_RECORD.host = HOST;
        WORKER_RECORD.basicAuth = config.basicAuth;
        WORKER_RECORD.category = "sample";
        WORKER_RECORD.interval = 300;
        WORKER_RECORD.timeout = 10000;
        ticketWorker = new TicketWorker(WORKER_RECORD);
        return done();
      });
    });
    beforeEach(function() {
      return ticketWorker.removeAllListeners();
    });
    afterEach(function() {
      return ticketWorker.removeAllListeners();
    });
    return describe("ticket_worker", function() {
      this.timeout(30 * 1000);
      it("live cycle for timeout", function(done) {
        ticketWorker.on("giveup", function() {
          debuglog("ticketWorker.on 'giveup'");
          ticketWorker.removeAllListeners();
          return done();
        });
        ticketWorker.on("complete", function() {
          debuglog("ticketWorker.on 'complete'");
          throw new Error("this should not hasppen, ticketWorker.on 'complete'");
        });
        ticketWorker.on("new ticket", function(ticket) {
          debuglog("ticketWorker.on 'new ticket', ticket:%j", ticket);
          should.exist(ticket);
          ticketWorker.isBusy().should.be.ok;
          setTimeout((function() {
            return ticketWorker.update("test update 1");
          }), 1000);
          setTimeout((function() {
            return ticketWorker.update("test update 2", "info");
          }), 2000);
          setTimeout((function() {
            return ticketWorker.update("test update 3", "warning");
          }), 3000);
          setTimeout((function() {
            return ticketWorker.update("test update 4", "danger");
          }), 4000);
          return setTimeout((function() {
            return ticketWorker.update("test update 5", "success");
          }), 5000);
        });
        ticketWorker.isBusy().should.not.be.ok;
        return ticketManager.issue("test ticket worker " + (Date.now()), "sample", {
          some: "content"
        }, function(err, ticket) {
          debuglog("err:" + err + ", ticket:%j", ticket);
          should.not.exist(err);
          return should.exist(ticket);
        });
      });
      it("live cycle for completion", function(done) {
        ticketWorker.on("complete", function() {
          debuglog("ticketWorker.on 'complete'");
          ticketWorker.removeAllListeners();
          return done();
        });
        ticketWorker.on("timeout", function() {
          debuglog("ticketWorker.on 'timeout'");
          throw new Error("this should not hasppen, ticketWorker.on 'timeout'");
        });
        ticketWorker.on("new ticket", function(ticket) {
          debuglog("ticketWorker.on 'new ticket', ticket:%j", ticket);
          should.exist(ticket);
          ticketWorker.isBusy().should.be.ok;
          return setTimeout((function() {
            return ticketWorker.complete();
          }), 2000);
        });
        return ticketManager.issue("test ticket worker " + (Date.now()), "sample", {
          some: "content"
        }, function(err, ticket) {
          debuglog("err:" + err + ", ticket:%j", ticket);
          should.not.exist(err);
          return should.exist(ticket);
        });
      });
      return it("live cycle for giveup", function(done) {
        ticketWorker.on("giveup", function() {
          debuglog("ticketWorker.on 'giveup'");
          ticketWorker.removeAllListeners();
          return done();
        });
        ticketWorker.on("complete", function() {
          debuglog("ticketWorker.on 'complete'");
          throw new Error("this should not hasppen, ticketWorker.on 'complete'");
        });
        ticketWorker.on("timeout", function() {
          debuglog("ticketWorker.on 'timeout'");
          throw new Error("this should not hasppen, ticketWorker.on 'timeout'");
        });
        ticketWorker.on("new ticket", function(ticket) {
          debuglog("ticketWorker.on 'new ticket', ticket:%j", ticket);
          should.exist(ticket);
          ticketWorker.isBusy().should.be.ok;
          return setTimeout((function() {
            return ticketWorker.giveup("give up for some reason");
          }), 2000);
        });
        return ticketManager.issue("test ticket worker " + (Date.now()), "sample", {
          some: "content"
        }, function(err, ticket) {
          debuglog("err:" + err + ", ticket:%j", ticket);
          should.not.exist(err);
          return should.exist(ticket);
        });
      });
    });
  });

}).call(this);
