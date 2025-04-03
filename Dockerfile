FROM python:3.12-slim

COPY artifact/ /artifact/

RUN cd /artifact &&\
    pip install --no-cache-dir --no-compile *.whl &&\
    cd / &&\
    rm -rf /artifact

CMD ["filenav", "--host", "0.0.0.0", "--port", "80"]
