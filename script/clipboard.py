#!/usr/bin/python
# -*- coding: UTF-8 -*-

import getopt
import sys
import tempfile

from PIL import ImageGrab

try:
    file_name = ''
    opts, args = getopt.getopt(sys.argv[1:], "n:", ["name="])

    for opt, arg in opts:
        if opt in ("-n", "--name"):
            file_name = arg

    file_path = tempfile.gettempdir() + "/" + file_name + ".jpg"
    img_file = ImageGrab.grabclipboard()

    img_file.save(file_path)
    print(file_path, end="")
except Exception :
    print('error', end="")
