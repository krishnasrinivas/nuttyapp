var binascii = {
  hexlify : function(str, padding) {
    var result = "";
    padding = padding || '';
    for (var x = 0; x < str.length; ++x) {
      var c = str.charCodeAt(x).toString(16);
      result += (c.length == 1 ? '0' : '') + c + padding;      
    }
    return result;
  },

  unhexlify : function(str) {
    var result = "";
    for (var x = 0; x < str.length; x += 2) {
      result += String.fromCharCode(parseInt(str.charAt(x) + str.charAt(x + 1), 16));
    }  
    return result;
  }
};

var base64 = {
  encodestring : function(input) {
    return window.btoa(input);
  },

  decodestring : function(input) {
    return window.atob(input);
  }
};

/*
   This is a dumbed down version of the python function only doing a couple formats and big-endian only currently.
   todo: allow for unlimited arguments
 */
var struct = {
  pack : function(fmt, v) {
    var type = fmt[1];
    var result = "";
    switch (type) {
      case 'Q':
        var ff = new BigInteger('ff', 16);
        result += String.fromCharCode(v.shiftRight(56).and(ff));
        result += String.fromCharCode(v.shiftRight(48).and(ff));
        result += String.fromCharCode(v.shiftRight(40).and(ff));
        result += String.fromCharCode(v.shiftRight(32).and(ff));
        result += String.fromCharCode(v.shiftRight(24).and(ff));
        result += String.fromCharCode(v.shiftRight(16).and(ff));
        result += String.fromCharCode(v.shiftRight(8).and(ff));
        result += String.fromCharCode(v.and(ff));
        break;
      case 'I':
        result += String.fromCharCode(v >>> 24 & 0xff);
        result += String.fromCharCode(v >>> 16 & 0xff);
        result += String.fromCharCode(v >>> 8  & 0xff);
        // fall through
      case 'B':
        result += String.fromCharCode(v        & 0xff);
        break;
    }

    return result;
  },

  unpack : function(fmt, str) {
    var type = fmt[1];
    var result = [];
    var index = 0;
    var v = 0;
    switch (type) {
      case 'Q':
        v = new BigInteger("0", 10);

        v = v.add(new BigInteger(str.charCodeAt(0).toString(), 10).shiftLeft(56));
        v = v.add(new BigInteger(str.charCodeAt(1).toString(), 10).shiftLeft(48));
        v = v.add(new BigInteger(str.charCodeAt(2).toString(), 10).shiftLeft(40));
        v = v.add(new BigInteger(str.charCodeAt(3).toString(), 10).shiftLeft(32));
        v = v.add(new BigInteger(str.charCodeAt(4).toString(), 10).shiftLeft(24));
        v = v.add(new BigInteger(str.charCodeAt(5).toString(), 10).shiftLeft(16));
        v = v.add(new BigInteger(str.charCodeAt(6).toString(), 10).shiftLeft(8));
        v = v.add(new BigInteger(str.charCodeAt(7).toString(), 10).shiftLeft(0));
        result.push(v);
        break;
      case 'I':
        v += str.charCodeAt(0) << 24 >>> 0;
        v += str.charCodeAt(1) << 16 >>> 0;
        v += str.charCodeAt(2) << 8  >>> 0;
        index += 3;
        // fall through
      case 'B':
        v += str.charCodeAt(0 + index) << 0  >>> 0;
        result.push(v);
        break;
    }

    return result;
  }
};

var sys = {
  'browser' : navigator.userAgent.toLowerCase().indexOf('chrome') != -1 ? 'chrome' : 'mozilla',
  'platform' : navigator.platform.toLowerCase().indexOf('linux') != -1 ? 'linux' :
              (navigator.platform.toLowerCase().indexOf('mac') != -1   ? 'darwin' : 'win32')
};
