# alpine is smaller! ~5m vs 200+
FROM python:2.7

LABEL author="John Muyskens"
LABEL email="john.muyskens@washpost.com"

ENV PYTHONBUFFERED 1

# install build dependencies
# See: https://semaphoreci.com/community/tutorials/dockerizing-a-node-js-web-application
RUN apt-get update
RUN apt-get install -y -q --no-install-recommends \
    make \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get -y autoclean

RUN mkdir /blockparty

# make sure we're excluding using dockerignore
COPY ./blockparty /blockparty/

RUN pip install -r /blockparty/requirements.txt

WORKDIR /blockparty

EXPOSE 8000

CMD ["make"]
