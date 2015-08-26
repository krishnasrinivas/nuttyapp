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
    .factory('cannedscripts', ['$rootScope', 'alertBox',
        function($rootScope, alertBox) {
            var ScriptsColl = new Meteor.Collection('cannedscripts');
            Meteor.subscribe('ownedcannedscripts');
            var scriptscursor = ScriptsColl.find({}, {
                sort: {
                    createdAt: -1
                }
            });
            var scripts = [];
            window.scripts = scripts;
            scriptscursor.observe({
                addedAt: function(doc, atIndex, before) {
                    if (before) {
                        scripts.unshift(doc);
                    } else {
                        scripts[atIndex] = doc;
                    }
                    safeApply($rootScope);
                },
                changedAt: function(newdoc, olddoc, atIndex) {
                    scripts[atIndex] = newdoc;
                    safeApply($rootScope);
                },
                removedAt: function(doc, atIndex) {
                    scripts.splice(atIndex, 1);
                    safeApply($rootScope);
                },
                movedTo: function(document, fromIndex, toIndex, before) {
                    console.log("movedTo");
                    console.log(fromIndex);
                    console.log(toIndex);
                    console.log(before);
                }
            });

            function insertscript(doc) {
                ScriptsColl.insert(doc);
            }

            function removescript(_id) {
                ScriptsColl.remove({
                    _id: _id
                });
            }

            function getscriptcontent(_id, cbk) {
                Meteor.call('getscriptcontent', _id, cbk);
            }
            var retobj = {
                insertscript: insertscript,
                removescript: removescript,
                getscriptcontent: getscriptcontent,
                scripts: scripts
            }
            return retobj;
        }
    ]);
