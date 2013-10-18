#!/bin/bash
# Copyright 2013 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

# Adapted the script from here:
# http://src.chromium.org/svn/trunk/src/chrome/common/extensions/docs/examples/api/nativeMessaging/host/install_host.sh

set -e

if [ $(uname -s) == 'Darwin' ]; then
  TARGET_DIR='/Library/Google/Chrome/NativeMessagingHosts'
else
  TARGET_DIR='/etc/opt/chrome/native-messaging-hosts'
fi

HOST_NAME=io.nutty.terminal

# Create directory to store native messaging host.
mkdir -p $TARGET_DIR

# Copy native messaging host manifest.
curl https://nutty.io/$HOST_NAME.json > $TARGET_DIR/$HOST_NAME.json
curl https://nutty.io/nutty.py > $HOME/nutty.py
chmod +x $HOME/nutty.py

# Update host path in the manifest.
HOST_PATH=$HOME/nutty.py
ESCAPED_HOST_PATH=${HOST_PATH////\\/}
sed -i -e "s/HOST_PATH/$ESCAPED_HOST_PATH/" $TARGET_DIR/$HOST_NAME.json

# Set permissions for the manifest so that all users can read it.
chmod o+r $TARGET_DIR/$HOST_NAME.json

echo Native messaging host $HOST_NAME has been installed.
