kryptos.publicKey.RSA = function() {
  
}

kryptos.publicKey.RSA.prototype = {
  construct : function(n, e, d) {
    this.n = n;
    this.e = e;
    this.d = d;

    return this;
  },

  sign : function(m, K) {
    return [m.modPow(this.d, this.n), ''];
  },

  verify : function(m, sig) {
    var s = sig[0];  // HACK - We should use the previous line instead, but
                     // this is more compatible and we're going to replace
                     // the Crypto.PublicKey API soon anyway.
    return s.modPow(this.e, this.n).equals(m);
  },

  generate : function() {
    alert('NOT_IMPLEMENTED');
  }
};
