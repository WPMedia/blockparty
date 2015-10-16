FROM quay.io/washpost/blockparty

MAINTAINER John Muyskens <john.muyskens@washpost.com>

RUN apt-get update && \
    apt-get install -y python-setuptools

RUN pip install -r blockparty/requirements.txt
CHDIR blockparty