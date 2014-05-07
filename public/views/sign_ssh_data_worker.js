importScripts('kryptos/kryptos.js',
              'kryptos/PublicKey/RSA.js',
              'common.js',
              'python_shim.js',
              'BigInteger.js',
              'util.js');

onmessage = function(event) {
  var rsa = new kryptos.publicKey.RSA().construct(new BigInteger(event.data.n, 10),
                                                 new BigInteger(event.data.e, 10),
                                                 new BigInteger(event.data.d, 10));
  var inflated = paramikojs.util.inflate_long(event.data.pkcs1imified, true);
  postMessage(rsa.sign(inflated, '')[0].toString());
};
