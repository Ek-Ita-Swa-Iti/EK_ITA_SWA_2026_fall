# Another DRIVEN adapter: implements the same port by writing to a file.

from core.notifier import Notifier


class FileNotifier(Notifier):
    def send(self, message):
        with open("messages.txt", "a") as file:
            file.write(message + "\n")
