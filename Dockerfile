# alpine is smaller! ~5m vs 200+
FROM python:2.7-alpine

LABEL author="John Muyskens"
LABEL email="john.muyskens@washpost.com"

ENV PYTHONBUFFERED 1

RUN mkdir /blockparty

# make sure we're excluding using dockerignore
COPY ./blockparty /blockparty/

RUN pip install -r /blockparty/requirements.txt

EXPOSE 8000

# this might go here?
CMD ["gunicorn", "--bind=:8000", "--workers=4", "blockparty.app:app"]
