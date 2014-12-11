// Generated by CoffeeScript 1.8.0
'use-strict';
var Backbone, Fun, WebSock, global, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

global = typeof exports !== "undefined" && exports !== null ? exports : this;

_ = (typeof exports !== 'undefined' ? require('underscore') : global)._;

Backbone = typeof exports !== 'undefined' ? require('backbone') : global.Backbone;

Fun = global.Fun = {};

Fun.getFunctionName = function(fun) {
  var n;
  if ((n = fun.toString().match(/function+\s{1,}([a-zA-Z_0-9]*)/)) != null) {
    return n[1];
  } else {
    return null;
  }
};

Fun.getConstructorName = function(fun) {
  var name;
  return fun.constructor.name || ((name = this.getFunctionName(fun.constructor)) != null ? name : null);
};

WebSock = global.WebSock != null ? global.WebSock : global.WebSock = {
  CHAT_PROTO: 'http',
  CHAT_ADDR: '0.0.0.0',
  CHAT_PORT: 3000
};

WebSock.Client = (function() {
  Client.prototype.__options = {};

  Client.prototype.__streamHandlers = {};

  function Client(opts) {
    if (opts == null) {
      opts = {};
    }
    _.extend(this, Backbone.Events);
    this.model = WebSock.SockData;
    this.__options.protocol = opts.protocol || WebSock.PROTOCOL || 'http';
    this.__options.host = opts.host || WebSock.HOST || '0.0.0.0';
    this.__options.port = opts.port || WebSock.PORT || '3000';
    if (!((this.__options.auto_connect != null) && this.__options.auto_connect === false)) {
      this.connect();
    }
  }

  Client.prototype.connect = function() {
    var validationModel;
    validationModel = Backbone.Model.extend({
      defaults: {
        header: {
          sender_id: String,
          type: String,
          sntTime: Date,
          srvTime: Date,
          rcvTime: Date,
          size: Number
        },
        body: null
      },
      validate: function(o) {
        var key, _i, _len, _ref;
        if (o == null) {
          o = this.attributes;
        }
        if (o.header == null) {
          return "required part 'header' was not defined";
        }
        _ref = this.defaults.header;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          if (o.header[key] == null) {
            return "required header " + key + " was not defined";
          }
        }
        if (typeof o.header.sender_id !== 'string') {
          return "wrong value for sender_id header";
        }
        if (typeof o.header.type !== 'string') {
          return "wrong value for type header";
        }
        if ((new Date(o.header.sntTime)).getTime() !== o.header.sntTime) {
          return "wrong value for sntTime header";
        }
        if ((new Date(o.header.srvTime)).getTime() !== o.header.srvTime) {
          return "wrong value for srvTime header";
        }
        if ((new Date(o.header.rcvTime)).getTime() !== o.header.rcvTime) {
          return "wrong value for rcvTime header";
        }
        if (!o.body) {
          return "required part 'body' was not defined";
        }
        if (!JSON.stringify(o.body === o.size)) {
          return "content size was invalid";
        }
      }
    });
    this.socket = io.connect(("" + this.__options.protocol + "://" + this.__options.host + ":" + this.__options.port + "/").replace(/\:+$/, '')).on('ws:datagram', (function(_this) {
      return function(data) {
        var dM, stream;
        data.header.rcvTime = Date.now();
        (dM = new validationModel).set(data);
        if (dM.isValid() && ((stream = _this.__streamHandlers[dM.attributes.header.type]) != null)) {
          return stream.add(dM.attributes);
        }
      };
    })(this)).on('connect', (function(_this) {
      return function() {
        WebSock.SockData.__connection__ = _this;
        return _this.trigger('connected', _this);
      };
    })(this)).on('disconnect', (function(_this) {
      return function() {
        return _this.trigger('disconnected');
      };
    })(this));
    return this;
  };

  Client.prototype.addStream = function(name, clazz) {
    if (this.__streamHandlers[name] != null) {
      throw "stream handler for " + name + " is already set";
    }
    return this.__streamHandlers[name] = clazz;
  };

  Client.prototype.removeStream = function(name) {
    if (this.__streamHandlers[name] == null) {
      throw "no stream handler for " + name + " is defined";
    }
    return delete this.__streamHandlers[name];
  };

  Client.prototype.getClientId = function() {
    var _ref, _ref1;
    if (((_ref = this.socket) != null ? (_ref1 = _ref.io) != null ? _ref1.engine : void 0 : void 0) == null) {
      return null;
    }
    return this.socket.io.engine.id;
  };

  return Client;

})();

WebSock.SockData = (function(_super) {
  __extends(SockData, _super);

  SockData.prototype.header = {};

  function SockData(attributes, options) {
    SockData.__super__.constructor.call(this, attributes, options);
    this.__type = Fun.getConstructorName(this);
  }

  SockData.prototype.sync = function(mtd, mdl, opt) {
    var m, _base;
    if (opt == null) {
      opt = {};
    }
    m = {};
    if (opt.header != null) {
      _.extend(this.header(opt.header));
    }
    if (mtd === 'create') {
      if ((_base = this.header).type == null) {
        _base.type = this.__type;
      }
      m.header = _.extend(this.header, {
        sntTime: Date.now()
      });
      m.body = mdl.attributes;
      return SockData.__connection__.socket.emit('ws:datagram', m);
    }
  };

  SockData.prototype.getSenderId = function() {
    return this.header.sender_id || null;
  };

  SockData.prototype.getSentTime = function() {
    return this.header.sntTime || null;
  };

  SockData.prototype.getServedTime = function() {
    return this.header.srvTime || null;
  };

  SockData.prototype.getRecievedTime = function() {
    return this.header.rcvTime || null;
  };

  SockData.prototype.getSize = function() {
    return this.header.size || null;
  };

  SockData.prototype.setRoomId = function(id) {
    return this.header.room_id = id;
  };

  SockData.prototype.getRoomId = function() {
    return this.header.room_id;
  };

  SockData.prototype.parse = function(data) {
    this.header = Object.freeze(data.header);
    return SockData.__super__.parse.call(data.body);
  };

  return SockData;

})(Backbone.Model);

WebSock.Message = (function(_super) {
  __extends(Message, _super);

  function Message() {
    return Message.__super__.constructor.apply(this, arguments);
  }

  Message.prototype.defaults = {
    text: ""
  };

  return Message;

})(WebSock.SockData);

WebSock.RoomMessage = (function(_super) {
  __extends(RoomMessage, _super);

  function RoomMessage() {
    return RoomMessage.__super__.constructor.apply(this, arguments);
  }

  RoomMessage.prototype.defaults = {
    text: ""
  };

  RoomMessage.prototype.initialize = function(attrs, options) {
    if (options == null) {
      options = {};
    }
    if (options.room_id != null) {
      return this.header.room_id = options.room_id;
    }
  };

  return RoomMessage;

})(WebSock.SockData);

WebSock.JoinRoom = (function(_super) {
  __extends(JoinRoom, _super);

  function JoinRoom() {
    return JoinRoom.__super__.constructor.apply(this, arguments);
  }

  JoinRoom.prototype.defaults = {
    room_id: null,
    status: "pending"
  };

  JoinRoom.prototype.set = function(attrs, opts) {
    if (attrs.room_id != null) {
      this.header.room_id = attrs.room_id;
    }
    return JoinRoom.__super__.set.call(this, attrs, opts);
  };

  JoinRoom.prototype.sync = function(mtd, mdl, opts) {
    delete mdl.body;
    return JoinRoom.__super__.sync.call(this, mtd, mdl, opts);
  };

  JoinRoom.prototype.validate = function(o) {
    if (!((o.room_id != null) || this.attributes.room_id)) {
      return "parameter 'room_id' must be set";
    }
  };

  JoinRoom.prototype.initialize = function(attrs, options) {
    if (options == null) {
      options = {};
    }
    if (options.room_id != null) {
      return this.header.room_id = options.room_id;
    }
  };

  return JoinRoom;

})(WebSock.SockData);

WebSock.LeaveRoom = (function(_super) {
  __extends(LeaveRoom, _super);

  function LeaveRoom() {
    return LeaveRoom.__super__.constructor.apply(this, arguments);
  }

  return LeaveRoom;

})(WebSock.JoinRoom);

WebSock.StreamCollection = (function(_super) {
  __extends(StreamCollection, _super);

  function StreamCollection() {
    return StreamCollection.__super__.constructor.apply(this, arguments);
  }

  StreamCollection.prototype.model = WebSock.SockData;

  StreamCollection.prototype.fetch = function() {
    return false;
  };

  StreamCollection.prototype.sync = function() {
    return false;
  };

  StreamCollection.prototype._prepareModel = function(attrs, options) {
    var model;
    if (attrs instanceof Backbone.Model) {
      if (!attrs.collection) {
        attrs.collection = this;
      }
      return attrs;
    }
    options = options ? _.clone(options) : {};
    options.collection = this;
    model = new this.model(attrs.body, options);
    model.header = Object.freeze(attrs.header);
    if (!model.validationError) {
      return model;
    }
    this.trigger('invalid', this, model.validationError, options);
    return false;
  };

  StreamCollection.prototype.send = function(data) {
    return this.create(data);
  };

  StreamCollection.prototype.initialize = function() {
    var _client;
    if (arguments[0] instanceof WebSock.Client) {
      return _client = arguments[0];
    }
  };

  return StreamCollection;

})(Backbone.Collection);

if ((typeof module !== "undefined" && module !== null ? (_ref = module.exports) != null ? _ref.WebSock : void 0 : void 0) != null) {
  module.exports.init = function(io) {
    return io.sockets.on('connect', (function(_this) {
      return function(client) {
        return client.on('ws:datagram', function(data) {
          data.header.srvTime = Date.now();
          data.header.sender_id = client.id;
          if (data.header.type === 'JoinRoom') {
            if (data.body.room_id) {
              client.join(data.body.room_id);
              data.body.status = 'success';
              client.emit('ws:datagram', data);
            }
            return;
          }
          if (data.header.type === 'LeaveRoom') {
            client.leave(data.header.room_id);
            data.body.status = 'success';
            client.emit('ws:datagram', data);
            return;
          }
          return (typeof data.header.room_id === 'undefined' || data.header.room_id === null ? io.sockets : io["in"](data.header.room_id)).emit('ws:datagram', data);
        });
      };
    })(this));
  };
}
