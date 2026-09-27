# example-simple — ports & adapters in six tiny files

The core builds a welcome message and hands it to a port. Adapters decide where the message comes from and where it goes.

## Run it

```bash
python main.py Ana
```

No Python installed? Run it in Docker instead:

```bash
docker run --rm -v "$PWD":/app -w /app python:3.13-alpine python main.py Ana
```

It prints `Welcome, Ana!`.

## The files

| File | Role |
|------|------|
| `core/notifier.py` | **Port**: "send this message somewhere" |
| `core/welcome_service.py` | **Core**: builds the message and uses the port |
| `adapters/console_notifier.py` | **Driven adapter**: sends by printing |
| `adapters/file_notifier.py` | **Driven adapter**: sends by writing to `messages.txt` |
| `adapters/command_line.py` | **Driving adapter**: reads the name, calls the core |
| `main.py` | **Composition root**: plugs it all together |

## Swap an adapter

In `main.py`, change `ConsoleNotifier()` to `FileNotifier()` (and its import). Run it again: nothing is printed, and the message ends up in `messages.txt`.

Nothing in `core/` changed.
