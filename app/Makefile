.PHONY: startup

all: startup

startup:
	gunicorn -b :8000 -w 4 app:app --threads 4
