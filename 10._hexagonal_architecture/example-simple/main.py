# The COMPOSITION ROOT: picks the adapters and plugs them into the core.

from adapters import command_line
from adapters.console_notifier import ConsoleNotifier
from core.welcome_service import WelcomeService

service = WelcomeService(ConsoleNotifier())
command_line.run(service)
