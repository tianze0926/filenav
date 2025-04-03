FROM python:3.12-alpine

RUN pip install --no-cache-dir --no-compile filenav

CMD ["filenav", "--host", "0.0.0.0", "--port", "80"]
