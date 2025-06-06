FROM python:3.13.2-bookworm

WORKDIR /app/backend

COPY ./backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
ENV FLASK_ENV=development

CMD ["gunicorn", "--reload", "-w", "4", "-b", "0.0.0.0:9000", "app:app"]
