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
CMD ["gunicorn", "-b", ":5000", "app:app"]
