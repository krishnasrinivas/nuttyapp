function paramikojs() { }
paramikojs = {
  MSG_DISCONNECT : 1,
  MSG_IGNORE : 2,
  MSG_UNIMPLEMENTED : 3,
  MSG_DEBUG : 4,
  MSG_SERVICE_REQUEST : 5,
  MSG_SERVICE_ACCEPT : 6,

  MSG_KEXINIT : 20,
  MSG_NEWKEYS : 21,

  MSG_USERAUTH_REQUEST : 50,
  MSG_USERAUTH_FAILURE : 51,
  MSG_USERAUTH_SUCCESS : 52,
  MSG_USERAUTH_BANNER  : 53,

  MSG_USERAUTH_PK_OK : 60,

  MSG_USERAUTH_INFO_REQUEST : 60,
  MSG_USERAUTH_INFO_RESPONSE : 61,

  MSG_GLOBAL_REQUEST : 80,
  MSG_REQUEST_SUCCESS : 81,
  MSG_REQUEST_FAILURE : 82,

  MSG_CHANNEL_OPEN : 90,
  MSG_CHANNEL_OPEN_SUCCESS : 91,
  MSG_CHANNEL_OPEN_FAILURE : 92,
  MSG_CHANNEL_WINDOW_ADJUST : 93,
  MSG_CHANNEL_DATA : 94,
  MSG_CHANNEL_EXTENDED_DATA : 95,
  MSG_CHANNEL_EOF : 96,
  MSG_CHANNEL_CLOSE : 97,
  MSG_CHANNEL_REQUEST : 98,
  MSG_CHANNEL_SUCCESS : 99,
  MSG_CHANNEL_FAILURE : 100,

  // for debugging:
  MSG_NAMES : {
    1: 'disconnect',
    2: 'ignore',
    3: 'unimplemented',
    4: 'debug',
    5: 'service-request',
    6: 'service-accept',
    20: 'kexinit',
    21: 'newkeys',
    30: 'kex30',
    31: 'kex31',
    32: 'kex32',
    33: 'kex33',
    34: 'kex34',
    50: 'userauth-request',
    51: 'userauth-failure',
    52: 'userauth-success',
    53: 'userauth--banner',
    60: 'userauth-60(pk-ok/info-request)',
    61: 'userauth-info-response',
    80: 'global-request',
    81: 'request-success',
    82: 'request-failure',
    90: 'channel-open',
    91: 'channel-open-success',
    92: 'channel-open-failure',
    93: 'channel-window-adjust',
    94: 'channel-data',
    95: 'channel-extended-data',
    96: 'channel-eof',
    97: 'channel-close',
    98: 'channel-request',
    99: 'channel-success',
    100: 'channel-failure'
  },

  // authentication request return codes:
  AUTH_SUCCESSFUL : 0,
  AUTH_PARTIALLY_SUCCESSFUL : 1,
  AUTH_FAILED : 2,

  // channel request failed reasons:
  OPEN_SUCCEEDED : 0,
  OPEN_FAILED_ADMINISTRATIVELY_PROHIBITED : 1,
  OPEN_FAILED_CONNECT_FAILED : 2,
  OPEN_FAILED_UNKNOWN_CHANNEL_TYPE : 3,
  OPEN_FAILED_RESOURCE_SHORTAGE : 4,

  CONNECTION_FAILED_CODE : {
    1: 'Administratively prohibited',
    2: 'Connect failed',
    3: 'Unknown channel type',
    4: 'Resource shortage'
  },

  DISCONNECT_SERVICE_NOT_AVAILABLE : 7,
  DISCONNECT_AUTH_CANCELLED_BY_USER : 13,
  DISCONNECT_NO_MORE_AUTH_METHODS_AVAILABLE : 14
};
