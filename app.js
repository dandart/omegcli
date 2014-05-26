var request = require('request'),
    readline = require('readline'),
    fs = require('fs'),
    querystring = require('querystring'),
    App = function() {
        var endpoint = 'http://front2.omegle.com',
            strUserAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.132 Safari/537.36',
            headers = {
                'Referer': 'http://www.omegle.com/',
                'User-Agent': strUserAgent,
                'Cache-Control': 'no-cache',
                'Origin': 'http://www.omegle.com',
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            };

        this.randid = (Math.floor(Math.random() * 100000000000 + 100000000000)).toString(36).toUpperCase();
        this.clientID = null;
        this.isConnected = false;

        this.start = function() {
            this.login();
            this.setupEvents();
        }.bind(this);

        this.login = function() {
            var arrTopics = JSON.parse(fs.readFileSync(__dirname+'/likes.json')),
                query = {
                    rcs: 1,
                    firstevents: 1,
                    spid: '',
                    randid: this.randid,
                    topics: JSON.stringify(arrTopics),
                    lang: 'en'
                };
            console.log('Connecting with likes '+arrTopics.join(', '));
            request.post(
                endpoint+'/start?'+querystring.encode(query),
                {},
                function(err, response, body) {
                    if (err) throw err;

                    body = JSON.parse(body);
                    console.log('Response received. Initialising.');
                    this.clientID = body.clientID;
                    if ('undefined' !== typeof this.events) {
                        this.parseEvents(body.events);
                    }
                    this.events();
                }.bind(this)
            );
        }.bind(this);

        this.connected = function() {
            this.isConnected = true;
            console.log('Connected.');
            this.init();
        }.bind(this);

        this.commonLikes = function(arrCommonLikes) {
            console.log('Common likes: '+arrCommonLikes.join(', '));
        }

        this.strangerTyping = function() {
            if (!this.isConnected) {
                this.connected();
            }

            console.log('Stranger typing...');
        }.bind(this);

        this.gotMessage = function(msg) {
            if (!this.isConnected) {
                this.connected();
            }
            console.log('Stranger: '+msg);
        }.bind(this);

        this.parseEvents = function(body) {
            for (var i = 0; i < body.length; i++) {
                switch(body[i][0]) {
                    case 'waiting':
                        console.log('Waiting...');
                        break;
                    case 'connected':
                        this.connected();
                        break;
                    case 'commonLikes':
                        this.commonLikes(body[i][1]);
                        break;
                    case 'typing':
                        this.strangerTyping();
                        break;
                    case 'stoppedTyping':
                        console.log('Stranger stopped typing.');
                        break;
                    case 'gotMessage':
                        this.gotMessage(body[i][1]);
                        break;
                    case 'strangerDisconnected':
                        console.log('Stranger disconnected');
                        this.disconnect();
                        break;
                    case 'statusInfo':
                    case 'identDigests':
                        break;
                    default:
                        console.log(body[i]);
                        break;
                }
            }
        }.bind(this);

        this.events = function() {
            request.post(
                endpoint+'/events',
                {
                    body: 'id='+querystring.escape(this.clientID),
                    headers: headers
                },
                function(err, response, body) {
                    if (err) throw err;
                    try {
                        body = JSON.parse(body);
                    } catch (err) {
                        console.log('Body was not JSON.');
                        console.log(body);
                        process.exit(0);
                    }

                    if (null === body) {
                        console.log('Body was NULL');
                        this.disconnect();
                        return;
                    }

                    this.parseEvents(body);
                    this.events();
                }.bind(this)
            );
        }.bind(this);

        this.typing = function() {
            var lH = headers;
            lH.Accept = 'text/javascript, text/html, application/xml, text/xml, */*';
            request.post(
                endpoint+'/typing',
                {
                    body: 'id='+querystring.escape(this.clientID),
                    headers: lH
                },
                function(err, response, body) {
                }
            );
        }.bind(this);

        this.bored = function() {
            request.post(
                endpoint+'/stoplookingforcommonlikes',
                {
                    body: 'id='+querystring.escape(this.clientID),
                    headers: headers
                },
                function(err, response, body) {
                    console.log('Looking for a random');
                }
            );
        }.bind(this);

        this.disconnect = function() {
            request.post(
                endpoint+'/disconnect',
                {
                    body: 'id='+querystring.escape(this.clientID),
                    headers: headers
                },
                function(err, response, body) {
                    console.log('Disconnected.');
                    process.exit(0);
                }
            );
        }.bind(this);

        this.send = function(text) {
            var lH = headers;
            lH.Accept = 'text/javascript, text/html, application/xml, text/xml, */*';
            request.post(
                endpoint+'/send',
                {
                    body: 'msg='+querystring.escape(text)+'&id='+querystring.escape(this.clientID),
                    headers: lH
                },
                function(err, response, body) {
                }
            )
        }.bind(this);

        this.init = function() {
            var rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            })
            .on('line', function(data) {
                this.send(data);
            }.bind(this))
            .on('pause', function() {
                this.typing();
            }.bind(this))
            .on('close', function() {
                this.disconnect();
            }.bind(this))
            .on('SIGINT', function() {
                this.disconnect();
            }.bind(this));
        }.bind(this);

        this.setupEvents = function() {
            process.on('SIGINT', function() {
                this.disconnect();
            }.bind(this));
        };
    },
    app = new App();
app.start();
