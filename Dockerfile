FROM python:3.12-bookworm

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

RUN apt update
RUN apt upgrade -y
RUN apt install -y python3-dev

RUN python3.12 -m pip install --upgrade pip

COPY requirements.txt ./requirements.txt
RUN python3.12 -m pip install -r requirements.txt

WORKDIR /app

RUN apt clean

COPY . .

RUN chmod -R 777 ./