# The CORE: builds the welcome message. It only knows the port.

from core.notifier import Notifier


class WelcomeService:
    def __init__(self, notifier: Notifier):
        self.notifier = notifier

    def welcome(self, name):
        self.notifier.send(f"Welcome, {name}!")
