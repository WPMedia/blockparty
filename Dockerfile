# alpine is smaller! ~5m vs 200+
FROM python:2.7-alpine

LABEL author="John Muyskens"
LABEL email="john.muyskens@washpost.com"

ENV PYTHONBUFFERED 1

RUN mkdir /code

WORKDIR /code

# make sure we're excluding using dockerignore
COPY . /code/

RUN pip install -r requirements.txt

# this might go here?
CMD ["gunicorn", "--bind=:8000", "--log-level=debug", "--timeout=120", "--workers=4", "app:app"]
