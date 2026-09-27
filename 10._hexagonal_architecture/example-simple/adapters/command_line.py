# A DRIVING adapter: reads a name from the command line and calls the core.

import sys


def run(service):
    service.welcome(sys.argv[1])
