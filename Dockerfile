# alpine is smaller! ~5m vs 200+
FROM python:2.7

LABEL author="John Muyskens"
LABEL email="john.muyskens@washpost.com"

ENV PYTHONBUFFERED 1

RUN mkdir /app

# make sure we're excluding using dockerignore
COPY ./app /app/

WORKDIR /app

RUN pip install -r requirements.txt

EXPOSE 5000

# this might go here?
CMD ["python", "app.py"]
