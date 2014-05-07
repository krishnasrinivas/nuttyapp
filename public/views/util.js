paramikojs.util = {};

paramikojs.util.inflate_long = function(s, always_positive) {
  var out = new BigInteger("0", 10);
  var negative = 0;
  if (!always_positive && s.length > 0 && s.charCodeAt(0) >= 0x80) {
    negative = 1;
  }
  if (s.length % 4) {
    var filler = '\x00';
    if (negative) {
      filler = '\xff';
    }
    s = new Array(4 - s.length % 4 + 1).join(filler) + s;
  }
  for (var i = 0; i < s.length; i += 4) {
    out = out.shiftLeft(32);
    out = out.add(new BigInteger(struct.unpack('>I', s.substring(i, i+4))[0].toString(), 10));
  }
  if (negative) {
    var one = new BigInteger("1", 10);
    out = one.shiftLeft(8 * s.length);
    out = out.subtract(one);
  }
  return out;
};

paramikojs.util.deflate_long = function(n, add_sign_padding) {
  n = typeof n == "number" ? new BigInteger(n.toString(), 10) : n.clone();
  add_sign_padding = add_sign_padding == undefined ? true : add_sign_padding;
  var s = '';
  var negOne = new BigInteger("-1", 10);
  var bottom32BitMask = new BigInteger("ffffffff", 16);
  while (!n.equals(BigInteger.ZERO) && !n.equals(negOne)) {
    s = struct.pack('>I', n.and(bottom32BitMask)) + s;
    n = n.shiftRight(32);
  }
  // strip off leading zeros, FFs
  var found = false;
  var i = 0;
  for (; i < s.length; ++i) {
    if (n.equals(BigInteger.ZERO) && s.charAt(i) != '\000') {
      found = true;
      break;
    }
    if (n.equals(negOne) && s.charAt(i) != '\xff') {
      found = true;
      break;
    }
  }
  if (!found) {
    // degenerate case, n was either 0 or -1
    i = 0;
    if (n.equals(BigInteger.ZERO)) {
      s = '\000';
    } else {
      s = '\xff';
    }
  }
  s = s.substring(i);
  if (add_sign_padding) {
    if (n.equals(BigInteger.ZERO) && s.charCodeAt(0) >= 0x80) {
      s = '\x00' + s;
    }
    if (n.equals(negOne) && s.charCodeAt(0) < 0x80) {
      s = '\xff' + s;
    }
  }
  return s;
};

paramikojs.util.format_binary_weird = function(data) {
  var out = '';
  for (var x = 0; x < data.length; ++x) {
    var i = data[x];
    out += '%02X' % i[1].charCodeAt(0);
    if (i[0] % 2) {
      out += ' ';
    }
    if (i[0] % 16 == 15) {
      out += '\n';
    }
  }
  return out;
};

paramikojs.util.format_binary = function(data, prefix) {
  prefix = prefix || '';
  var x = 0;
  var out = [];
  while (data.length > x + 16) {
    out.push(paramikojs.util.format_binary_line(data.substring(x, x+16)));
    x += 16;
  }
  if (x < data.length) {
    out.push(paramikojs.util.format_binary_line(data.substring(x)));
  }
  var ret = [];
  for (var i = 0; i < out.length; ++i) {
    ret.push(prefix + out[i]);
  }
  return '\n' + ret.join('\n');
};

paramikojs.util.format_binary_line = function(data) {
	var left = paramikojs.util.hexify(data, ' ');
  left = left.length < 50 ? left + new Array(50 - left.length + 1).join('&nbsp;') : left;
  var right = "";
  for (var x = 0; x < data.length; ++x) {
    var c = data[x];
    right += parseInt((c.charCodeAt(0) + 63) / 95) == 1 ? c : '.';
  }
  return left + ' ' + right;
};

paramikojs.util.hexify = function(s, padding) {
	return binascii.hexlify(s, padding).toUpperCase();
};

paramikojs.util.unhexify = function(s) {
	return binascii.unhexlify(s);
};

paramikojs.util.safe_string = function (s) {
	out = '';
  for (var x = 0; x < s.length; ++x) {
    var c = s[x];
    if (c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 127) {
      out += c;
    } else {
      out += '%' + c.charCodeAt(0) + ' ';
    }
  }
  return out;
};

// ''.join([['%%%02X' % ord(c), c][(ord(c) >= 32) and (ord(c) <= 127)] for c in s])

paramikojs.util.bit_length = function(n) {
	var norm = paramikojs.util.deflate_long(n, 0);
  var hbyte = norm[0].charCodeAt(0);
  if (hbyte == 0) {
    return 1;
  }
  var bitlen = norm.length * 8;
  while (!(hbyte & 0x80)) {
    hbyte <<= 1;
    bitlen -= 1;
  }
  return bitlen;
};

paramikojs.util.tb_strings = function() {
	return '';  // todo print stack
};

/*
  Given a password, passphrase, or other human-source key, scramble it
  through a secure hash into some keyworthy bytes.  This specific algorithm
  is used for encrypting/decrypting private key files.

  @param hashclass: class from L{Crypto.Hash} that can be used as a secure
      hashing function (like C{MD5} or C{SHA}).
  @type hashclass: L{Crypto.Hash}
  @param salt: data to salt the hash with.
  @type salt: string
  @param key: human-entered password or passphrase.
  @type key: string
  @param nbytes: number of bytes to generate.
  @type nbytes: int
  @return: key data
  @rtype: string
*/
paramikojs.util.generate_key_bytes = function(hashclass, salt, key, nbytes) {
  var keydata = '';
  var digest = '';
  if (salt.length > 8) {
    salt = salt.substring(0, 8);
  }
  while (nbytes > 0) {
    var hash_obj = new hashclass();
    if (digest.length > 0) {
      hash_obj.update(digest);
    }
    hash_obj.update(key);
    hash_obj.update(salt);
    digest = hash_obj.digest();
    var size = Math.min(nbytes, digest.length);
    keydata += digest.substring(0, size);
    nbytes -= size;
  }
  return keydata;
};

/*
  Read a file of known SSH host keys, in the format used by openssh, and
  return a compound dict of C{hostname -> keytype ->} L{PKey <paramiko.pkey.PKey>}.
  The hostname may be an IP address or DNS name.  The keytype will be either
  C{"ssh-rsa"} or C{"ssh-dss"}.

  This type of file unfortunately doesn't exist on Windows, but on posix,
  it will usually be stored in C{os.path.expanduser("~/.ssh/known_hosts")}.

  Since 1.5.3, this is just a wrapper around L{HostKeys}.

  @param filename: name of the file to read host keys from
  @type filename: str
  @return: dict of host keys, indexed by hostname and then keytype
  @rtype: dict(hostname, dict(keytype, L{PKey <paramiko.pkey.PKey>}))
*/
paramikojs.util.load_host_keys = function(filename) {
  return new paramikojs.HostKeys(filename);
};

/*
  Provided only as a backward-compatible wrapper around L{SSHConfig}.
*/
paramikojs.util.parse_ssh_config = function(file_obj) {
  var config = new paramikojs.SSHConfig();
  config.parse(file_obj);
  return config;
};

/*
  Provided only as a backward-compatible wrapper around L{SSHConfig}.
*/
paramikojs.util.lookup_ssh_host_config = function(hostname, config) {
  return config.lookup(hostname);
};

paramikojs.util.mod_inverse = function(x, m) {
  var u1 = 1; var u2 = 0; var u3 = m;
  var v1 = 0; var v2 = 1; var v3 = x;

  while (v3 > 0) {
    var q = parseInt(u3 / v3);
    var t = v1;
    v1 = u1 - v1 * q;
    u1 = t;
    t  = v2;
    v2 = u2 - v2 * q;
    u2 = t;
    t  = v3;
    v3 = u3 - v3 * q;
    u3 = t;
  }
  if (u2 < 0) {
    u2 += m;
  }
  return u2;
};

// Stateful counter for CTR mode crypto
paramikojs.util.Counter = function(nbits, initial_value, overflow) {
  initial_value = initial_value == undefined ? 1 : initial_value;
  overflow = overflow || 0;
  this.blocksize = nbits / 8;
  this.overflow = overflow;
  // start with value - 1 so we don't have to store intermediate values when counting
  // could the iv be 0?
  if (initial_value == 0) {
    this.value = new Array(this.blocksize + 1).join('\xFF');
  } else {
    var one = BigInteger.ONE;
    var x = paramikojs.util.deflate_long(initial_value.subtract(one), false);
    this.value = new Array(this.blocksize - x.length + 1).join('\x00') + x;
  }
};

paramikojs.util.Counter.prototype = {
  // Increment the counter and return the new value
  call : function() {
    var i = this.blocksize - 1;
    while (i > -1) {
      var c = String.fromCharCode((this.value.charCodeAt(i) + 1) % 256);
      this.value = paramikojs.util.setCharAt(this.value, i, c);
      if (c != '\x00') {
        return this.value;
      }
      i -= 1;
    }
    // counter reset
    var x = paramikojs.util.deflate_long(this.overflow, false);
    this.value = new Array(this.blocksize - x.length + 1).join('\x00') + x;
    return this.value;
  }
};

paramikojs.util.setCharAt = function(str, index, ch) {    // how annoying
  return str.substr(0, index) + ch + str.substr(index + 1);
};


paramikojs.util.get_logger = function(name) {
  return logging;
}
