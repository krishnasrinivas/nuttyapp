#!/bin/bash

# to uninstall on Linux do: 
# rm -f /etc/opt/chrome/native-messaging-hosts/io.nutty.terminal.json
# rm -f /etc/chromium/native-messaging-hosts/io.nutty.terminal.json
# rm -f  /usr/local/bin/nutty.py
# rm -f  /usr/local/etc/nutty.conf

# to uninstall on MacOS do:
# rm -f /Library/Google/Chrome/NativeMessagingHosts/io.nutty.terminal.json
# rm -f '/Library/Application Support/Chromium/NativeMessagingHosts/io.nutty.terminal.json'
# rm -f  /usr/local/bin/nutty.py
# rm -f  /usr/local/etc/nutty.conf

if [ $(uname -s) = 'Darwin' ]; then
  CHROME_TARGET_DIR='/Library/Google/Chrome/NativeMessagingHosts'
  CHROMIUM_TARGET_DIR='/Library/Application Support/Chromium/NativeMessagingHosts'
else
  CHROME_TARGET_DIR='/etc/opt/chrome/native-messaging-hosts'
  CHROMIUM_TARGET_DIR='/etc/chromium/native-messaging-hosts'
fi

for TARGET_DIR in "$CHROME_TARGET_DIR" "$CHROMIUM_TARGET_DIR"
do
if [ ! -x "$TARGET_DIR" ];then
mkdir -p "$TARGET_DIR"

if [ $? != 0 ]
then
  echo failed to create $TARGET_DIR, not root?
  exit 1
fi
fi

cat > "$TARGET_DIR"/io.nutty.terminal.json<<__EOF__
// Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
// This file is part of nutty.io

{
  "name": "io.nutty.terminal",
  "description": "nutty.io - Securely share terminals over web using browser",
  "path": "/usr/local/bin/nutty.py",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://ooelecakcjobkpmbdnflfneaalbhejmk/"
  ]
}
__EOF__

if [ $? != 0 ]
then
  echo failed to write to "$TARGET_DIR"/io.nutty.terminal.json
  exit 1
fi

chmod 0644 "$TARGET_DIR"/io.nutty.terminal.json

echo Installed "$TARGET_DIR"/io.nutty.terminal.json
done

NUTTYSCRIPT=/usr/local/bin/nutty.py

mkdir -p /usr/local/etc
echo 'set -g mouse-select-window on
set -g mouse-select-pane on
set -g mouse-resize-pane on
bind-key k kill-session
' > /usr/local/etc/nutty.conf
chmod 0644 /usr/local/etc/nutty.conf
echo Installed /usr/local/etc/nutty.conf

echo '#!/usr/bin/python
# https://nutty.io (c) Krishna Srinivas (https://github.com/krishnasrinivas)
# GPLv3 License

import sys
import struct
import os
import threading
import signal
import json
import fcntl
import termios

os.environ["TERM"] = "xterm-256color"
os.environ["DISPLAY"] = ""
os.environ["PATH"] = os.environ["PATH"] + ":/usr/local/bin"

version="1.0"

signal.signal(signal.SIGCHLD, signal.SIG_IGN)
def newterm(fd):
    try:
        fromterm = {}
        fromterm["nativehost"]="connected"

        dump=json.dumps(fromterm)
        os.write (1, struct.pack("I", len(dump.encode("utf-8"))))
        os.write (1, dump.encode("utf-8"))
        sys.stdout.flush()
    except Exception as e:
        sys.stderr.write("error in newterm()")
        sys.stderr.write(str(e))
        sys.stderr.flush()
        return

    while 1:
        try:
            buf = os.read (fd, 10000)
            buf = buf.decode("utf-8")
            if len(buf) == 0:
                break
            fromterm = {}
            fromterm["data"]=buf

            dump=json.dumps(fromterm)
            os.write (1, struct.pack("I", len(dump.encode("utf-8"))))
            os.write (1, dump.encode("utf-8"))
            sys.stdout.flush()
        except UnicodeDecodeError:
            continue
        except IOError:
            break
        except Exception as e:
            sys.stderr.write("newterm: error in while(1)")
            sys.stderr.write(str(e))
            sys.stderr.flush()
            break

pid, fd = os.forkpty()
if pid == 0:
    try:
        os.execlp("tmux", "tmux", "-f", "/usr/local/etc/nutty.conf")
    except Exception as e:
        sys.stderr.write("unable to execute tmux : " + str(e))
        sys.stderr.flush()
        sys.exit(1)

threading.Thread(target=newterm, args=(fd,)).start()

while 1:
    try:
        text_length_bytes = os.read(0, 4)

        if len(text_length_bytes) == 0:
            break

        # Read the message length (4 bytes).
        text_length = struct.unpack("i", text_length_bytes)[0]
        text = os.read(0, text_length)
        text = text.decode(encoding="UTF-8")
        toterm = json.loads(text)

        if "rowcol" in toterm:
            winsize = struct.pack("HHHH", toterm["row"], toterm["col"], 0, 0)
            fcntl.ioctl(fd, termios.TIOCSWINSZ, winsize)
            continue

        if "data" in toterm:
            os.write (fd, toterm["data"].encode("utf-8"))
            continue

        if "version" in toterm:
            scriptver = {}
            scriptver["version"] = version
            dump=json.dumps(scriptver)
            os.write (1, struct.pack("I", len(dump.encode("utf-8"))))
            os.write (1, dump.encode("utf-8"))
            sys.stdout.flush()

    except UnicodeDecodeError:
        continue

    except Exception as e:
        sys.stderr.write(str(e))
        sys.stderr.write("main(): error in while(1)")
        sys.stderr.flush()
        break

' > "$NUTTYSCRIPT"

if [ $? != 0 ] 
then
  echo failed to write to "$NUTTYSCRIPT"
  exit 1
fi

chmod 0755 "$NUTTYSCRIPT"
echo Installed "$NUTTYSCRIPT"
