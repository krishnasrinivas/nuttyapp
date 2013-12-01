#!/usr/bin/env python
# Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
# This script is part of nutty.io project
# GPLv3 License <http://www.gnu.org/licenses/gpl.txt>

import sys
import struct
import os
import time
import json
import termios
import fcntl
import signal
import logging
import threading


os.environ['TERM'] = 'xterm-256color'
os.environ['DISPLAY'] = ''

keyfdmap = {}
keypidmap = {}

signal.signal(signal.SIGCHLD, signal.SIG_IGN)

# log = logging.getLogger('nutty')
# log.setLevel(logging.DEBUG)

# fh = logging.FileHandler('/tmp/nutty.log')
# fh.setLevel(logging.DEBUG)

# frmt = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# fh.setFormatter(frmt)

# log.addHandler(fh)

def newterm(fd, key, portnum):
    while 1:
        try:
            buf = os.read (fd, 10000)
            if len(buf) == 0:
                break
            fromterm = {};
            fromterm["data"]=buf
            fromterm["key"] = key
            fromterm["portnum"] = portnum
            dump=json.dumps(fromterm)
            os.write (1, struct.pack("I", len(dump)))
            os.write (1, dump)
            sys.stdout.flush()
        except:
            break


while 1:
    try:
        text_length_bytes = sys.stdin.read(4)

        if len(text_length_bytes) == 0:
            # log.warn ("text_length_bytes length is 0")
            break

        # Read the message length (4 bytes).
        text_length = struct.unpack('i', text_length_bytes)[0]

        text = sys.stdin.read(text_length).decode('utf-8')

        toterm = json.loads(text)

        if "key" not in toterm:
            continue

        if "portnum" not in toterm:
            continue

        key = toterm["key"]
        portnum = toterm["portnum"]

        if "newTerm" in toterm:
            pid, fd = os.forkpty()
            if pid == 0:
                os.execlp("bash","bash", "-il")

            keyfdmap[key] = fd
            keypidmap[key] = pid
            threading.Thread(target=newterm, args=(fd, key, portnum)).start()
            continue

        if key not in keyfdmap:
            fromterm = {}
            fromterm["key"] = key
            fromterm["portnum"] = portnum
            fromterm["error"] = "keyfdmap: terminal does not exist"
            dump=json.dumps(fromterm)
            os.write (1, struct.pack("I", len(dump)))
            os.write (1, dump)
            sys.stdout.flush()
            continue

        if key not in keypidmap:
            fromterm = {}
            fromterm["key"] = key
            fromterm["portnum"] = portnum
            fromterm["error"] = "keypidmap terminal does not exist"
            dump=json.dumps(fromterm)
            os.write (1, struct.pack("I", len(dump)))
            os.write (1, dump)
            sys.stdout.flush()
            continue

        if "rowcol" in toterm:
            winsize = struct.pack("HHHH", toterm["row"], toterm["col"], 0, 0)
            fcntl.ioctl(keyfdmap[key], termios.TIOCSWINSZ, winsize)
            continue

        if "closeTerm" in toterm:
            os.kill(keypidmap[key], signal.SIGKILL)
            os.close(keyfdmap[key])
            del keyfdmap[key]
            del keypidmap[key]
            continue

        if "data" in toterm:
            os.write (keyfdmap[key], toterm["data"])

    except:
        fromterm = {}
        fromterm["key"] = key
        fromterm["portnum"] = portnum
        fromterm["error"] = "error in nutty.py"
        dump=json.dumps(toterm)
        os.write (1, struct.pack("I", len(dump)))
        os.write (1, dump)
        sys.stdout.flush()
        continue
