# A DRIVEN adapter: implements the port by printing to the screen.

from core.notifier import Notifier


class ConsoleNotifier(Notifier):
    def send(self, message):
        print(message)
