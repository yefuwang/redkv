FROM postgres:latest
ENV POSTGRES_USER=redkvtester \
    POSTGRES_PASSWORD=redtesterpwd \
    POSTGRES_DB=redkv_test

ADD init.sql /docker-entrypoint-initdb.d/
