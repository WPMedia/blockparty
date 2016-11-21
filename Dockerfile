# alpine is smaller! ~5m vs 200+
FROM python:2.7

LABEL author="John Muyskens"
LABEL email="john.muyskens@washpost.com"

ENV PYTHONBUFFERED 1

RUN apt-get update && apt-get install -y -q --no-install-recommends \
    make \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get -y autoclean

RUN mkdir /blockparty

COPY ./blockparty /blockparty/

RUN pip install -r /blockparty/requirements.txt

WORKDIR /blockparty

EXPOSE 8000

CMD ["make"]
