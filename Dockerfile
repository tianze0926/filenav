FROM python:3.12-slim

COPY artifact/*.whl /wheel.whl

RUN pip install --no-cache-dir --no-compile /wheel.whl &&\
    rm /wheel.whl

CMD ["filenav", "--host", "0.0.0.0", "--port", "80"]
