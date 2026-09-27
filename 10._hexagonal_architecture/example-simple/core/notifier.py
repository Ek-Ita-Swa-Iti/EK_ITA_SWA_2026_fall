# The PORT: the core says what it needs — "send this message somewhere".
# It doesn't say where.

from abc import ABC, abstractmethod


class Notifier(ABC):
    @abstractmethod
    def send(self, message):
        pass
