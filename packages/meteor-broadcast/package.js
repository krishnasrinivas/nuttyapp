Package.describe({
  summary: "realtime communication between meteor clients without mongo - broadcast messages"
});

Package.on_use(function (api) {
  api.add_files(['lib/util.js', 'lib/eventemitter.js', 'server/server.js'], 'server');
  api.add_files(['lib/util.js', 'lib/eventemitter.js', 'client/client.js'], 'client');
});
