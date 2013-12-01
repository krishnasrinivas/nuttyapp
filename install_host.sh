#!/bin/bash
# Copyright 2013 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

# Adapted the script from here:
# http://src.chromium.org/svn/trunk/src/chrome/common/extensions/docs/examples/api/nativeMessaging/host/install_host.sh

set -e

if [ $(uname -s) == 'Darwin' ]; then
  MANIFEST_DIR='/Library/Google/Chrome/NativeMessagingHosts'
else
# Linux users need to run this as root
  if [[ $EUID -ne 0 ]]; then
    echo "This script needs to be run using sudo or as the root user"
    exit 1
  fi
  MANIFEST_DIR='/etc/opt/chrome/native-messaging-hosts'
fi

HOST_NAME=io.nutty.terminal

# Place the script in /usr/local/bin from where it is readable by all users
SCRIPT_DIR=/usr/local/bin
mkdir -p $SCRIPT_DIR

# Create directory to store native messaging host.
mkdir -p $MANIFEST_DIR

# Copy native messaging host manifest.
curl https://nutty.io/$HOST_NAME.json > $MANIFEST_DIR/$HOST_NAME.json
curl https://nutty.io/nutty.py > $SCRIPT_DIR/nutty.py
chmod +x $SCRIPT_DIR/nutty.py

# Set permissions for the manifest so that all users can read it.
chmod o+r $MANIFEST_DIR/$HOST_NAME.json

echo Native messaging host $HOST_NAME has been installed.
