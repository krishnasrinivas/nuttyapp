#!/bin/bash
# Copyright 2013 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

# Adapted the script from here:
# http://src.chromium.org/svn/trunk/src/chrome/common/extensions/docs/examples/api/nativeMessaging/host/install_host.sh

set -e

if [ $(uname -s) == 'Darwin' ]; then
  MANIFEST_DIR='/Library/Google/Chrome/NativeMessagingHosts'
  SCRIPT_DIR=$HOME
else
# Linux users need to run this as root
  if [[ $EUID -ne 0 ]]; then
    echo "This script needs to be run using sudo or as the root user"
    exit 1
  fi
  MANIFEST_DIR='/etc/opt/chrome/native-messaging-hosts'
# Place the script in /opt from where it is readable by all users
  SCRIPT_DIR=/opt/nutty
  mkdir -p $SCRIPT_DIR
fi

HOST_NAME=io.nutty.terminal


# Create directory to store native messaging host.
mkdir -p $MANIFEST_DIR

# Copy native messaging host manifest.
curl https://nutty.io/$HOST_NAME.json > $MANIFEST_DIR/$HOST_NAME.json
curl https://nutty.io/nutty.py > $SCRIPT_DIR/nutty.py
chmod +x $SCRIPT_DIR/nutty.py

# Update host path in the manifest.
HOST_PATH=$SCRIPT_DIR/nutty.py
ESCAPED_HOST_PATH=${HOST_PATH////\\/}
sed -i -e "s/HOST_PATH/$ESCAPED_HOST_PATH/" $MANIFEST_DIR/$HOST_NAME.json

# Set permissions for the manifest so that all users can read it.
chmod o+r $MANIFEST_DIR/$HOST_NAME.json

echo Native messaging host $HOST_NAME has been installed.
