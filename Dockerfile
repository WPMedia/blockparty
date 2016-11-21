# alpine is smaller! ~5m vs 200+
FROM python:2.7-alpine

LABEL author="John Muyskens"
LABEL email="john.muyskens@washpost.com"

ENV PYTHONBUFFERED 1

RUN apk add --no-cache make

RUN mkdir /app

COPY ./app /app

WORKDIR /app

RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["make"]
