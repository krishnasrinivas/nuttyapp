#!/usr/bin/python
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

signal.signal(signal.SIGCHLD, signal.SIG_IGN)
def newterm(fd):
    try:
        fromterm = {};
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
            fromterm = {};
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
            sys.stderr.write("newterm: error in while(1)\n")
            sys.stderr.write(str(e))
            sys.stderr.flush()
            break

pid, fd = os.forkpty()
if pid == 0:
    try:
        os.execlp("tmux", "tmux", "-f", os.environ["TERM"] + "/.nutty.conf")
    except:
        sys.stderr.write("unable to execute tmux")
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

    except UnicodeDecodeError:
        continue

    except Exception as e:
        sys.stderr.write(str(e))
        sys.stderr.write("main(): error in while(1)")
        sys.stderr.flush()
        break

