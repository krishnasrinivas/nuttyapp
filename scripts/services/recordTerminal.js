/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

function recordTerminal(key, recordFileName, log) {
    var oldtime;
    var newtime;
    var recordbytes = [];
    var _flushactive = 0;
    var record;
    var self = this;

    function errorHandler(e) {
        var msg = '';

        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
        };
        log.error("recordTerminal error " + msg);
    }

    function _flush() {
        _flushactive = 1;
        if (recordbytes.length && recordfileWriter && recordfileWriter.readyState === 2) {
            recordfileWriter.write(new Blob(recordbytes, {
                type: 'application/octet-stream'
            }));
            recordbytes = [];
        }

        if (!record) {
            recordfileWriter = undefined;
            _flushactive = 0;
            return;
        }
        setTimeout(_flush, 1000);
    }

    this.start = function(startcbk) {
        record = true;
        var onInitFs_record = function(fs) {
            fs.root.getFile(recordFileName, {
                create: true
            }, function(fileEntry) {
                fileEntry.file(function(_file) {
                    self.file = _file;
                }, errorHandler);

                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.truncate(0);
                    recordfileWriter = fileWriter;
                    fileWriter.onwriteend = function(e) {};
                    fileWriter.onerror = function(e) {
                        log.error('Write failed: ' + e.toString());
                    };
                    if (!_flushactive)
                        _flush();
                    startcbk();
                }, errorHandler);
            }, errorHandler);
        };

        oldtime = new Date;
        navigator.webkitTemporaryStorage.requestQuota(1024 * 1024, function(grantedBytes) {
            window.webkitRequestFileSystem(TEMPORARY, grantedBytes, onInitFs_record, errorHandler);
        }, function(e) {
            log.error('Error', e);
        });
    }
    this.stop = function() {
        record = false;
    }
    this.write = function(obj) {
        var bytes = new ArrayBuffer(4);
        var view16 = new Uint16Array(bytes);
        if (record) {
            if (obj.rowcolA) {
                var view8 = new Uint8Array(bytes);
                view16[0] = 65535;
                view8[2] = obj.rowcolA[key].row;
                view8[3] = obj.rowcolA[key].col;
                recordbytes.push(bytes);
            } else if (obj.d) {
                newtime = new Date;
                var delta = newtime - oldtime;
                oldtime = newtime;
                delta = Math.floor(delta / 10);
                delta = delta % 65536;
                if (delta === 65535)
                    delta = 65534;
                view16[0] = delta;

                // write as UTF-8 string
                var b = new Blob([obj.d]);
                var fr = new FileReader();
                fr.onload = function(e) {
                    var wdata = e.target.result;
                    view16[1] = wdata.byteLength;
                    recordbytes.push(bytes);
                    recordbytes.push(wdata);
                };
                fr.readAsArrayBuffer(b);
            }
        }
    }
}
