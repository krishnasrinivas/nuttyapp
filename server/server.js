/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

var authinfo;

try {
    authinfo = JSON.parse(Assets.getText("authinfo.json"));
} catch (ex) {
    console.log("failed reading private/authinfo.json, using default values");
    authinfo = {};
}

if (!authinfo.google)
    authinfo.google = {
        clientId: "junk",
        secret: "junk"
    }

if (!authinfo.aws)
    authinfo.aws = {
        awsid: "junk",
        awssecret: "junk"
    }

/*
 * you can use google's STUN server or configure your own
 * download STUN/TURN implementation here:
 * https://code.google.com/p/rfc5766-turn-server/
 *
 * for webrtc signalling you can use peerjs.com's implementation:
 * npm install peer
 */

if (!authinfo.webrtc)
    authinfo.webrtc = {
        host: "",
        port: 9000,
        'iceServers': [{ url: 'stun:stun.l.google.com:19302' }]
    }

ServiceConfiguration.configurations.remove({
    service: "google"
});

ServiceConfiguration.configurations.insert({
    service: "google",
    clientId: authinfo.google.clientId,
    secret: authinfo.google.secret
});

Accounts.config({
    sendVerificationEmail: true
});

Accounts.emailTemplates.siteName = "nutty.io";
Accounts.emailTemplates.from = "Nutty Admin <no-reply@nutty.io>";
Accounts.emailTemplates.verifyEmail.text = function (user, url) {
    return "Hello,\n\n" +
        "To verify your account email, simply click the link below.\n\n" +
        url.replace('/#', '') + "\n\n" +
        "Thanks.";
};

Accounts.emailTemplates.resetPassword.text = function (user, url) {
    return "Hello,\n\n" +
        "To reset your password, simply click the link below.\n\n" +
        url.replace('/#', '') + "\n\n" +
        "Thanks.";
};

Accounts.validateNewUser(function(user) {
    if (user.services.google)  {
        if (!user.services.google.email) {
            return false;
        }
    }
    if (user.services.password) {
        if (!user.username)
            throw new Meteor.Error(403, "Username not provided");
        if (!user.emails)
            throw new Meteor.Error(403, "Email not provided");
    }
    return true;
});

var awsid = authinfo.aws.awsid;
var awssecret = authinfo.aws.awssecret;

pipeserver = new Meteor.PipeServer();
chatserver = new Meteor.Broadcast();
var winston = Winston;
var client = Knox.createClient({
    key: awsid,
    secret: awssecret,
    bucket: 'nutty'
});

// db.users.ensureIndex({username:1}, {unique: true})
Meteor.users._ensureIndex({
    username: 1
}, {
    unique: true
});
Meteor.users.allow({
    update: function(userId, doc, fields, modifier) {
        var username;
        if (fields.length !== 1)
            return false;
        if (fields[0] !== "username")
            return false;
        username = modifier["$set"].username;
        if (!Match.test(username, String))
            return false;
        if (!username.match(/^[a-z][a-z0-9]{2}[a-z0-9]*$/))
            return false;
        if (username.length > 20)
            return false;
        if (doc.username)
            return false;
        if (userId !== doc._id)
            return false;

        return true;
    }
});

//db.nuttysession.ensureIndex({expireAt:1}, {sparse: true, expireAfterSeconds: 0})
//db.nuttysession.ensureIndex({sessionid:1})
//db.nuttysession.ensureIndex({userId:1})
NuttySession = new Meteor.Collection('nuttysession');
NuttySession._ensureIndex({
    expireAt: 1
}, {
    sparse: true,
    expireAfterSeconds: 0
});
NuttySession._ensureIndex({
    sessionid: 1
});
NuttySession._ensureIndex({
    userId:1
});
NuttySession.allow({
    update: function(userId, doc, fields, modifier) {
        var desc;
        if (fields.length !== 1)
            return false;
        if (fields[0] !== "rowcol" && fields[0] !== "desc" && fields[0] !== "readonly" && fields[0] !== "conntype")
            return false;
        if (fields[0] === "desc") {
            desc = modifier["$set"].desc;
            if (!Match.test(desc, String)) {
                return false;
            }
            if (desc.length > 100)
                return false;
        }
        if (doc.userId) {
            if (doc.userId === userId) {
                return true;
            } else
                return false;
        }
        //master user not logged in
        return true;
    }
});

//db.nuttyrecordings.ensureIndex({userId:1, createdAt:-1})
//db.nuttyrecordings.ensureIndex({filename:1}, {unique: true})

NuttyRecordings = new Meteor.Collection('nuttyrecordings');
NuttyRecordings._ensureIndex({
    sessionid: 1,
    userId: 1,
    createdAt: -1
});

NuttyRecordings.allow({
    insert: function(userId, doc) {
        if (!Match.test(doc, {
            userId: String,
            filename: String,
            sessionid: String,
            desc: Match.Optional(String),
            createdAt: Date
        })) {
            console.log("does not match");
            console.log(doc);
            return false;
        }
        if (doc.userId !== userId)
            return false;
        if (doc.desc && (doc.desc.length > 100))
            false;

        return true;
    },
    remove: function(userId, doc) {
        if (userId && userId === doc.userId) {
            return true;
        } else
            return false;
    }
});

CannedScripts = new Meteor.Collection('cannedscripts');
CannedScripts._ensureIndex({
    userId: 1,
    createdAt: -1
});
CannedScripts.allow({
    insert: function(userId, doc) {
        if (doc.userId !== userId)
            return false;
        if (!doc.description)
            return false;
        return true;
    },
    remove: function(userId, doc) {
        if (userId && userId === doc.userId)
            return true;
        else
            return false;
    }
});

Meteor.startup(function() {
    NuttySession.remove({
        $or: [{
            type: "master"
        }, {
            type: "slave"
        }]
    });
});

var methods = {};
methods['getWebrtcConfig'] = function(host) {
    return authinfo.webrtc;
};
methods['createMasterSession'] = function(clientid) {
    var sessionid = Random.hexString(10);
    if (!Match.test(clientid, String))
        return undefined;
    NuttySession.insert({
        sessionid: sessionid,
        masterid: clientid,
        type: "session",
        masterconnected: false,
        userId: this.userId
    });
    return sessionid;
};
methods['userExists'] = function(username) {
    if (Meteor.users.findOne({
        username: username
    }))
        return true;
    else
        return false;
};

methods['s3downloadinfo'] = function(_key) {
    var ContentMD5 = "";
    var ContentType = "";
    var Expires;
    var expirytime = new Date();
    if (!Match.test(_key, String))
        return undefined;
    expirytime.setSeconds(1000);
    Expires = Math.floor(expirytime.getTime() / 1000);
    var StringToSign = "GET" + "\n" +
        ContentMD5 + "\n" +
        ContentType + "\n" +
        Expires + "\n" +
        "/nutty/" + _key;

    var signature = CryptoJS.HmacSHA1(StringToSign, awssecret).toString(CryptoJS.enc.Base64);
    var retobj = {
        AWSAccessKeyId: awsid,
        Expires: Expires,
        Signature: signature
    };
    return retobj;
}

methods['s3uploadinfo'] = function(sessionid, clientid) {
    var bucket = "nutty";
    var key = sessionid + '.' + Random.hexString(6);
    var acl = "private";
    var type = "application/binary";
    var Expiration = new Date;
    if (!Match.test(sessionid, String))
        return undefined;

    Expiration.setSeconds(24 * 60 * 60); // expire in one day
    var JSON_POLICY = {
        // "expiration": "2020-01-01T00:00:00Z",
        "expiration": Expiration.getFullYear() + '-' + (Expiration.getMonth() + 1) + '-' + Expiration.getDate() + 'T' + Expiration.getHours() + ':' +
            Expiration.getMinutes() + ':' + Expiration.getSeconds() + 'Z',
        "conditions": [{
                "bucket": bucket
            },
            ["starts-with", "$key", key], {
                "acl": acl
            },
            ["starts-with", "$Content-Type", type],
            ["content-length-range", 0, 1048576]
        ]
    };
    var policy = new Buffer(JSON.stringify(JSON_POLICY)).toString('base64');
    var signature = CryptoJS.HmacSHA1(policy, awssecret).toString(CryptoJS.enc.Base64);
    var retobj = {
        key: key,
        AWSAccessKeyId: awsid,
        acl: acl,
        policy: policy,
        signature: signature,
        ContentType: type,
    }
    return retobj;
}


methods['userloggedin'] = function(sessionid, clientid, type) {
    if (!this.userId) {
        return;
    }
    var user = Meteor.user();
    var username = "";
    if (user)
        username = user.username;

    NuttySession.update({
        sessionid: sessionid,
        masterid: clientid
    }, {
        $set: {
            userId: this.userId,
            username: username
        }
    });

    NuttySession.update({
        sessionid: sessionid,
        clientid: clientid,
        type: type
    }, {
        $set: {
            userId: this.userId,
            username: username
        }
    });

    var r = NuttySession.findOne({
        sessionid: sessionid,
        userId: this.userId,
        clientid: clientid
    });
    if (!r) {
        return;
    }
    r = NuttyRecordings.findOne({
        sessionid: sessionid,
        userId: this.userId
    });
    if (r) {
        return;
    }
    NuttyRecordings.upsert({
        sessionid: sessionid,
        userId: this.userId
    }, {
        $set: {
            sessionid: sessionid,
            userId: this.userId,
            createdAt: new Date()
        }
    });
}

methods['userloggedout'] = function(sessionid, clientid) {
    NuttySession.update({
        sessionid: sessionid,
        masterid: clientid
    }, {
        $set: {
            userId: '',
            username: ''
        }
    });
    NuttySession.update({
        sessionid: sessionid,
        clientid: clientid,
    }, {
        $set: {
            userId: '',
            username: ''
        }
    });
}

methods['getscriptcontent'] = function(_id) {
    if (!this.userId) {
        return;
    }

    var script = CannedScripts.findOne({_id:_id});
    if (script.userId !== "standardscript" && script.userId !== this.userId)
        return;
    if (script) {
        return script.content;
    }
}

methods['recput'] = function(sessionid, tindex, buffers) {
    var ret;
    try {
        ret = HTTP.put("http://localhost:9090/recording/" + sessionid + "/" + tindex, {
            content: buffers
        });
    } catch (ex) {
        throw ex;
    }
    return 0;
}

methods['recget'] = function(sessionid, tindex) {
    var ret;
    try {
        ret = HTTP.get("http://localhost:9090/recording/" + sessionid + "/" + tindex);
    } catch (ex) {
        throw ex;
    }
    return ret.data;
}


Meteor.methods(methods);

Meteor.publish('mastersession', function(sessionid, clientid) {
    var timer;
    if (!Match.test(sessionid, String)) {
        this.error(new Meteor.Error(500, 'Internal server error'));
        return undefined;
    }
    if (!Match.test(clientid, String)) {
        this.error(new Meteor.Error(500, 'Internal server error'));
        return undefined;
    }

    var s = NuttySession.findOne({
        sessionid: sessionid,
        type: "session",
        masterid: clientid
    });
    if (!s) {
        this.error(new Meteor.Error(500, 'Internal server error'));
        return;
    }

    function _f() {
        var d = new Date();
        d.setDate(d.getDate() + 5);
        NuttySession.update({
            sessionid: sessionid,
            masterid: clientid
        }, {
            $set: {
                expireAt: d
            }
        });
    }
    _f();
    timer = Meteor.setInterval(_f, 1000 * 60 * 60 * 24); // once per day
    var user = Meteor.users.findOne({
        _id: this.userId
    });
    var username = "";
    if (user)
        username = user.username;
    NuttySession.upsert({
        sessionid: sessionid,
        clientid: clientid,
        type: "master"
    }, {
        $set: {
            sessionid: sessionid,
            clientid: clientid,
            type: "master",
            username: username,
            userId: this.userId
        }
    }, {
        multi: true
    });
    this.onStop(function() {
        Meteor.clearInterval(timer);
        NuttySession.remove({
            sessionid: sessionid,
            clientid: clientid
        });
    });
    return NuttySession.find({
        sessionid: sessionid
    }, {
        fields: {
            clientid: 0,
            masterid: 0
        }
    });
});

Meteor.publish('slavesession', function(sessionid, clientid) {
    if (!Match.test(sessionid, String)) {
        this.error(new Meteor.Error(500, 'Internal server error'));
        return undefined;
    }
    if (!Match.test(clientid, String)) {
        this.error(new Meteor.Error(500, 'Internal server error'));
        return undefined;
    }
    var s = NuttySession.findOne({
        sessionid: sessionid,
        type: "session"
    });
    if (!s) {
        this.error(new Meteor.Error(500, 'Internal server error'));
        return;
    }
    var user = Meteor.users.findOne({
        _id: this.userId
    });
    var username = "";
    if (user)
        username = user.username;
    NuttySession.upsert({
        sessionid: sessionid,
        clientid: clientid,
        type: "slave"
    }, {
        $set: {
            sessionid: sessionid,
            clientid: clientid,
            type: "slave",
            username: username,
            userId: this.userId
        }
    }, {
        multi: true
    });
    this.onStop(function() {
        NuttySession.remove({
            sessionid: sessionid,
            clientid: clientid
        });
    });
    return NuttySession.find({
        sessionid: sessionid
    }, {
        fields: {
            clientid: 0,
            masterid: 0
        }
    });
});

Meteor.publish('ownedsessions', function() {
    if (!this.userId) {
        this.ready();
        return;
    }
    return NuttySession.find({
        userId: this.userId,
        type: "master"
    }, {
        fields: {
            clientid: 0
        }
    });
});

Meteor.publish('ownedrecordings', function(limit) {
    if (!this.userId) {
        this.ready();
        return;
    }
    return NuttyRecordings.find({
        userId: this.userId
    }, {
        limit: limit,
        sort : {
            createdAt: -1
        }
    });
});

Meteor.publish('demosession', function() {
    return NuttySession.find({
        sessionid: "demosessionid"
    });
});

Meteor.publish('ownedcannedscripts', function() {
    if (!this.userId) {
        this.ready();
        return;
    }
    return CannedScripts.find({
        $or : [{
            userId: this.userId
        }, {
            userId: "standardscript"
        }]
    }, {
        fields: {
            content: 0,
            userId: 0
        }
    });
});
