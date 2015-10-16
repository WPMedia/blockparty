FROM python:2.7
ENV PYTHONBUFFERED 1
MAINTAINER John Muyskens <john.muyskens@washpost.com>
RUN pip install -r blockparty/requirements.txt
CHDIR blockparty