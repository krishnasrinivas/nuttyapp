/*
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

angular.module('nuttyapp')
    .factory('NuttySession', ['$rootScope', 'alertBox', '$timeout',
        function($rootScope, alertBox, $timeout) {
            var SessionColl = new Meteor.Collection('nuttysession');
            var users = [];
            var sscursor;
            var ss = [];
            var masterid;
            var recordings = [];
            var NuttyRecordings = new Meteor.Collection('nuttyrecordings');
            window.NuttyRecordings = NuttyRecordings;
            var recordingscursor;
            window.SessionColl = SessionColl;
            window.users = users;
            window.ss = ss;

            $rootScope.$watch(function() {
                return masterid;
            }, function(newval) {
                if (newval && Session.get("desc")) {
                    var desc = Session.get("desc");
                    SessionColl.update({
                        _id: masterid
                    }, {
                        $set: {
                            desc: desc
                        }
                    });
                }
            });

            /* for some reason on load username was not being displayed */
            Meteor.startup(function() {
                setTimeout(function() {
                    $rootScope.$apply();
                }, 1000);
            });

            function _userscursor(sessionid) {
                var userscursor = SessionColl.find({
                    $or: [{
                        type: "master"
                    }, {
                        type: "slave"
                    }],
                    sessionid: sessionid
                });
                window.userscursor = userscursor;
                userscursor.observe({
                    addedAt: function(doc, atIndex, before) {
                        users[atIndex] = doc;
                        if (doc.sessionid === sessionid && doc.type === "master") {
                            retobj.masterid = masterid = doc._id;
                            if (doc.desc)
                                retobj.desc = doc.desc;
                        }
                        if (doc.type === 'master' && retobj.type === 'slave') {
                            alertBox.close();
                        }
                        safeApply($rootScope);
                    },
                    changedAt: function(newdoc, olddoc, atIndex) {
                        users[atIndex] = newdoc;
                        if (newdoc.type === "master")
                            retobj.desc = newdoc.desc;
                        safeApply($rootScope);
                    },
                    removedAt: function(doc, atIndex) {
                        users.splice(atIndex, 1);
                        if (doc.type === 'master' && retobj.type === 'slave') {
                            alertBox.alert("danger", "Sharer is not connected");
                        }
                        safeApply($rootScope);
                    },
                    movedTo: function(document, fromIndex, toIndex, before) {
                        console.log("movedTo");
                        console.log(fromIndex);
                        console.log(toIndex);
                        console.log(before);
                    }
                });
            }
            function observeSession(sessionid) {
                var session = SessionColl.find({
                    type: "session",
                    sessionid: sessionid
                });

                session.observe({
                    addedAt: function(doc) {
                        _.each(doc, function(value, key, list) {
                            if (key === 'rowcol')
                                retobj.rowcol = value;
                            if (key === 'sessionid')
                                retobj.sessionid = value;
                            if (key === '_id')
                                retobj.id = value;
                            if (key === 'desc')
                                retobj.desc = value;
                            if (key === 'readonly')
                                retobj.readonly = value;
                        });
                        safeApply($rootScope);
                    },
                    changedAt: function(newdoc, olddoc, atIndex) {
                        _.each(newdoc, function(value, key, list) {
                            if (key === 'rowcol')
                                retobj.rowcol = value;
                            if (key === 'sessionid')
                                retobj.sessionid = value;
                            if (key === '_id')
                                retobj.id = value;
                            if (key === 'desc')
                                retobj.desc = value;
                            if (key === 'readonly')
                                retobj.readonly = value;
                        });
                        safeApply($rootScope);
                    }
                });
            }

            var retobj = {
                type: "",
                id: undefined,
                masterid: undefined,
                sessionid: undefined,
                clientid: undefined,
                demosessionid: undefined,
                rowcol: {},
                desc: "",
                users: users,
                sharedsessions: ss,
                recordings: recordings,
                readonly: false,
                setmaster: function(sessionid, clientid) {
                    this.type = "master";
                    this.clientid = clientid;
                    var sub = Meteor.subscribe('mastersession', sessionid, clientid);
                    _userscursor(sessionid);
                    observeSession(sessionid);
                    Deps.autorun(function() {
                        var ready = sub.ready();
                        if (ready) {
                            var userid = Meteor.userId();
                            if (userid)
                                retobj.userloggedin();
                            else
                                retobj.userloggedout();
                        }
                    });
                },
                setslave: function(sessionid, clientid) {
                    this.type = "slave";
                    this.clientid = clientid;
                    var sub = Meteor.subscribe('slavesession', sessionid, clientid);
                    _userscursor(sessionid);
                    observeSession(sessionid);
                    Deps.autorun(function() {
                        var ready = sub.ready();
                        if (ready) {
                            var userid = Meteor.userId();
                            if (userid)
                                retobj.userloggedin();
                            else
                                retobj.userloggedout();
                        }
                    });
                    setTimeout(function() {
                        if (!_.find(users,
                            function(doc) {
                                return doc.type === 'master'
                        })) {
                            alertBox.alert("danger", "Sharer is not connected");
                            $rootScope.$apply();
                        }
                    }, 6000);
                },
                setreadonly: function(ro) {
                    SessionColl.update({
                        _id: this.id
                    }, {
                        $set: {
                            readonly: ro
                        }
                    });
                },
                setrowcol: function(rc) {
                    SessionColl.update({
                        _id: this.id
                    }, {
                        $set: {
                            rowcol: rc
                        }
                    });
                },
                setconntype: function(conntype) {
                    SessionColl.update({
                        _id: masterid
                    }, {
                        $set: {
                            conntype: conntype
                        }
                    }, function(error) {
                        if (error)
                            console.log(error);
                    });
                },
                userloggedin: function(cbk) {
                    Meteor.call('userloggedin', retobj.sessionid, retobj.clientid, retobj.type, cbk);
                },
                userloggedout: function(cbk) {
                    Meteor.call('userloggedout', retobj.sessionid, retobj.clientid, cbk);
                },
                setdesc: function(desc) {
                    Session.set("desc", desc);
                    SessionColl.update({
                        _id: masterid
                    }, {
                        $set: {
                            desc: desc
                        }
                    });
                },
                insertrecording: function(doc) {
                    NuttyRecordings.insert(doc);
                },
                deleterecording: function(_id) {
                    NuttyRecordings.remove({
                        _id: _id
                    });
                }
            };

            window.NuttySession = retobj;
            var demosessionsub;
            var demosessioncur;
            demosessionsub = Meteor.subscribe('demosession');
            demosessioncur = SessionColl.find({
                type: "demo"
            });
            demosessioncur.observe({
                addedAt: function(doc, atIndex, before) {
                    retobj.demosessionid = doc.demosessionid;
                    safeApply($rootScope);
                },
                changedAt: function(newdoc, olddoc, atIndex) {
                    retobj.demosessionid = newdoc.demosessionid;
                    safeApply($rootScope);
                },
                removedAt: function(doc, atIndex) {
                    retobj.demosessionid = "";
                    safeApply($rootScope);
                },
                movedTo: function(document, fromIndex, toIndex, before) {
                    console.log("movedTo");
                    console.log(fromIndex);
                    console.log(toIndex);
                    console.log(before);
                }
            });
            var sessionssub;
            var recordingssub;
            sessionssub = Meteor.subscribe('ownedsessions');
            sscursor = SessionColl.find({
                type: "master"
            });
            sscursor.observe({
                addedAt: function(doc, atIndex, before) {
                    ss[atIndex] = doc;
                    safeApply($rootScope);
                },
                changedAt: function(newdoc, olddoc, atIndex) {
                    ss[atIndex] = newdoc;
                    safeApply($rootScope);
                },
                removedAt: function(doc, atIndex) {
                    ss.splice(atIndex, 1);
                    safeApply($rootScope);
                },
                movedTo: function(document, fromIndex, toIndex, before) {
                    console.log("movedTo");
                    console.log(fromIndex);
                    console.log(toIndex);
                    console.log(before);
                }
            });

            Session.set('itemsLimit', 20);
            Deps.autorun(function() {
                recordingssub = Meteor.subscribe('ownedrecordings', Session.get('itemsLimit'));
            });

            recordingscursor = NuttyRecordings.find({}, {
                sort: {
                    createdAt: -1
                }
            });
            recordingscursor.observe({
                addedAt: function(doc, atIndex, before) {
                    if (before) {
                        recordings.unshift(doc);
                    } else {
                        recordings[atIndex] = doc;
                    }
                    safeApply($rootScope);
                },
                changedAt: function(newdoc, olddoc, atIndex) {
                    recordings[atIndex] = newdoc;
                    safeApply($rootScope);
                },
                removedAt: function(doc, atIndex) {
                    recordings.splice(atIndex, 1);
                    safeApply($rootScope);
                },
                movedTo: function(document, fromIndex, toIndex, before) {
                    console.log("movedTo");
                    console.log(fromIndex);
                    console.log(toIndex);
                    console.log(before);
                }
            });
            return retobj;
        }
    ]);
