#!/bin/bash

# to uninstall do: rm -f /etc/opt/chrome/native-messaging-hosts/io.nutty.terminal.json /usr/local/bin/nutty.sh

if [ $(uname -s) == 'Darwin' ]; then
  TARGET_DIR='/Library/Google/Chrome/NativeMessagingHosts'
else
  TARGET_DIR='/etc/opt/chrome/native-messaging-hosts'
fi

if [ ! -x $TARGET_DIR ];then
mkdir -p $TARGET_DIR

if [ $? != 0 ]
then
  echo failed to create $TARGET_DIR, not root?
  exit 1
fi
fi

cat > $TARGET_DIR/io.nutty.terminal.json<<__EOF__
// Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
// This file is part of nutty.io

{
  "name": "io.nutty.terminal",
  "description": "nutty.io - Securely share terminals over web using browser",
  "path": "/usr/local/bin/nutty.sh",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://ooelecakcjobkpmbdnflfneaalbhejmk/"
  ]
}
__EOF__

if [ $? != 0 ]
then
  echo failed to write to $TARGET_DIR/io.nutty.terminal.json
  exit 1
fi

echo Installed $TARGET_DIR/io.nutty.terminal.json

echo '#!/bin/bash

if [ $(uname -s) == 'Darwin' ]; then
  EXT_DIR=$HOME"/Library/Application Support/Google/Chrome/Default/Extensions/ooelecakcjobkpmbdnflfneaalbhejmk/"
else
  EXT_DIR=$HOME"/.config/google-chrome/Default/Extensions/ooelecakcjobkpmbdnflfneaalbhejmk/"
fi

SCRIPT_DIR=$(ls -d "$EXT_DIR"* 2> /dev/null | tail -1)
if [ -z "$SCRIPT_DIR" ]
then
  echo SCRIPT_DIR not found, please install nutty extension >&2
  exit 1
fi

NUTTYSCRIPT="$SCRIPT_DIR""/nutty.py"


if [ -z "$NUTTYSCRIPT" ]
then
  echo $SCRIPT_DIR"/nutty.py" not found, please install nutty extension >&2
  exit 1
fi
chmod +x "$NUTTYSCRIPT" "$SCRIPT_DIR"/tmux*
exec "$NUTTYSCRIPT"

' > /usr/local/bin/nutty.sh

if [ $? != 0 ] 
then
  echo failed to write to $NUTTYSCRIPT
  exit 1
fi

chmod +x /usr/local/bin/nutty.sh
echo Installed /usr/local/bin/nutty.sh



