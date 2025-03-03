FROM python:3.11.11

WORKDIR /app

COPY app/ /app/

RUN apt-get update && apt-get install -y portaudio19-dev

ENV API-KEY insert

RUN python3 -m pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]