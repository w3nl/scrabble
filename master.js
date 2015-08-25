Array.prototype.shuffle = function() {
  var i = this.length, 
      j, 
      temp;
      
  if ( i == 0 )
      return this;
  
  while ( --i ) {
     j       = Math.floor( Math.random() * ( i + 1 ) ),
     temp    = this[i],
     this[i] = this[j],
     this[j] = temp;
  }
  return this;
} 

var Scrabble = function() {
    
    this.tiles      = [],
    this.response   = {},
    this.ip         = '',
    this.path       = false,
    this.req        = false,
    this.res        = false;
    this.unlocked   = false;
    
    this.fill = function() {
        if(this.unlocked) {
            tiles = [];
            tiles = tiles.concat(new Array(3).join('_').split(''));
            tiles = tiles.concat(new Array(19).join('E').split(''));
            tiles = tiles.concat(new Array(11).join('N').split(''));
            tiles = tiles.concat(new Array(7).join('A').split(''));
            tiles = tiles.concat(new Array(7).join('O').split(''));
            tiles = tiles.concat(new Array(5).join('I').split(''));
            tiles = tiles.concat(new Array(6).join('D').split(''));
            tiles = tiles.concat(new Array(6).join('R').split(''));
            tiles = tiles.concat(new Array(6).join('S').split(''));
            tiles = tiles.concat(new Array(6).join('T').split(''));
            tiles = tiles.concat(new Array(4).join('G').split(''));
            tiles = tiles.concat(new Array(4).join('K').split(''));
            tiles = tiles.concat(new Array(4).join('L').split(''));
            tiles = tiles.concat(new Array(4).join('M').split(''));
            tiles = tiles.concat(new Array(3).join('B').split(''));
            tiles = tiles.concat(new Array(3).join('P').split(''));
            tiles = tiles.concat(new Array(4).join('U').split(''));
            tiles = tiles.concat(new Array(3).join('F').split(''));
            tiles = tiles.concat(new Array(3).join('H').split(''));
            tiles = tiles.concat(new Array(3).join('J').split(''));
            tiles = tiles.concat(new Array(3).join('V').split(''));
            tiles = tiles.concat(new Array(3).join('Z').split(''));
            tiles = tiles.concat(new Array(3).join('C').split(''));
            tiles = tiles.concat(new Array(3).join('W').split(''));
            tiles = tiles.concat(new Array(2).join('X').split(''));
            tiles = tiles.concat(new Array(2).join('Y').split(''));
            tiles = tiles.concat(new Array(2).join('Q').split(''));
            this.tiles = tiles;
        }
        return this;
    };
    
    this.shuffle = function() {
        this.tiles.shuffle();
        return this;
    };
    
    this.catch = function(amount) {
        clients[this.ip] = clients[this.ip] || [];
        var received = [],
            new_tile;
        for(a=0; a<amount; a++) {
            this.shuffle();
            if(this.tiles.length>1) {
                new_tile = this.tiles.shift();
                received.push(new_tile);
                 clients[this.ip].push(new_tile);
            }
        }
        return received;
    }
    
    this.request = function(req, res) {
        this.ip         = req.connection.remoteAddress,
        this.path       = req.url,
        this.req        = req,
        this.res        = res;
        this.response   = {};
        return this;
    }
    
    this.word = function(tiles) {
        var old_tiles = tiles.split(''),
            position;
    
        this.response.word = old_tiles;
        
        clients[this.ip] || this.start();
        
        for(tile=0; tile<old_tiles.length; tile++) {
            position = clients[this.ip].indexOf(tiles[tile].toUpperCase());
            if(position>=0)
                clients[this.ip].splice(position, 1);
        }
        
        this.response.new_tiles = this.catch(7-clients[this.ip].length);
        this.response.tiles     = clients[this.ip];
        this.send();
        
        console.log(this.ip + ' played');
        console.log(this.response);
    }
    
    this.exchange = function(tiles) {
        var old_tiles = tiles.split(''),
            returns   = [],
            position;
    
        this.response.word = old_tiles;
        
        clients[this.ip] || this.start();
        
        for(tile=0; tile<old_tiles.length; tile++) {
            position = clients[this.ip].indexOf(tiles[tile].toUpperCase());
            if(position>=0)
                returns.push( clients[this.ip].splice(position, 1) );
        }
        
        this.response.new_tiles = this.catch(7-clients[this.ip].length);
        this.response.tiles     = clients[this.ip];
        
        for(tile=0; tile<returns.length; tile++) {
            this.tiles.push(returns[tile]);
        }
        
        this.send();
        
        console.log(this.ip + ' exchange');
        console.log(this.response);
    }
    
    this.start = function() {
        clients[this.ip] = [];
        tiles            = this.catch(7),
        clients[this.ip] = tiles;
        return this;
    }
    
    this.get = function() {
        clients[this.ip] || this.start();
        this.response.tiles = clients[this.ip] || [];
        this.send();
        
        console.log(this.ip + ' get');
        console.log(this.response);
    }
    
    this.send = function(info) {
        this.res.send(info || this.response);
        this.unlocked = false;
    }
    
    this.setPassword = function(param_pass) {
        console.log(pass + ' | ' + this.param_pass);
        this.response.pass = (pass == param_pass);
        this.unlocked = (pass == param_pass);
        return this;
    }
    
    this.info = function() {
        this.response.tiles = this.tiles.length;
        this.send();
    }
};

var args = {};
process.argv.forEach(function(val, index, array) {
    valuePointer=val.indexOf('=');
    if (valuePointer>0) {
        args[val.substr(0,valuePointer)] = val.substr(valuePointer+1);
    } else {
        args[val] = true;
    }
});

var http       = require('http'),
    express    = require('express'),
    app        = express(),
    game       = new Scrabble(),
    port       = args.port || 1337,
    pass       = args.pass || 'defaultpassword',
    clients    = [];

if(game.tiles.length<1) 
    game.setPassword(pass).fill().shuffle();

app.get('/', function (req, res) {
  game.request(req, res).get();
});

app.get('/word/:tiles', function (req, res) {
  game.request(req, res).word(req.params.tiles);
});

app.get('/exchange/:tiles', function (req, res) {
  game.request(req, res).exchange(req.params.tiles);
});

app.get('/newgame/:pass', function (req, res) {
  clients = [];
  game.request(req, res)
        .setPassword(req.params.pass)
        .fill()
        .shuffle()
        .send();
});

app.get('/info', function (req, res) {
  game.request(req, res).info();
});

var server = app.listen(port, function () {
  var host = server.address().address,
      port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});