FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ARG PIP_INDEX_URL=https://pypi.org/simple
ARG EMBEDDING_MODEL=BAAI/bge-small-zh-v1.5

COPY requirements.txt .
RUN pip install --no-cache-dir --index-url "$PIP_INDEX_URL" -r requirements.txt

# A production cold start must not depend on Hugging Face being reachable from
# the ECS host. Download and execute the exact model while building the
# immutable image, then bind every model byte to a manifest used at runtime.
RUN mkdir -p /opt/fastembed-models \
  && python -c "from fastembed import TextEmbedding; model=TextEmbedding(model_name='${EMBEDDING_MODEL}', cache_dir='/opt/fastembed-models'); vector=next(iter(model.embed(['ResumeSystem offline model artifact probe']))); assert len(vector) == 512" \
  && (cd /opt/fastembed-models \
    && find . -type f -print0 | sort -z | xargs -0 sha256sum) \
    > /opt/fastembed-models.SHA256SUMS \
  && (cd /opt/fastembed-models \
    && find . -type l -printf '%p\t%l\n' | LC_ALL=C sort) \
    > /opt/fastembed-models.SYMLINKS \
  && test -s /opt/fastembed-models.SHA256SUMS \
  && test -s /opt/fastembed-models.SYMLINKS

COPY app ./app
COPY scripts ./scripts
RUN chmod 0755 ./scripts/agent-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["./scripts/agent-entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
