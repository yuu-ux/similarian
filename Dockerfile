FROM python:3.13.2-bookworm

WORKDIR /app

COPY ./backend/ .
COPY .env .
RUN pip install --no-cache-dir -r requirements.txt

CMD ["gunicorn", "--reload", "-w", "4", "-b", "0.0.0.0:9000", "app:app"]
