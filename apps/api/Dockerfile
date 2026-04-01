# ================
# Builder Stage
# ================
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system dependencies needed for building Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python build dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir build

# Copy requirements first for better caching
COPY apps/api/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ================
# Runner Stage
# ================
FROM python:3.11-slim AS runner

WORKDIR /app

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libpq5 \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -u 1000 appuser

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY --chown=appuser:appuser apps/api/ .

# Create logs directory
RUN mkdir -p /app/logs && chown appuser:appuser /app/logs

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3100

# Environment variables for production
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV LOG_LEVEL=INFO

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3100/health || exit 1

# Run the application with uvicorn
CMD ["uvicorn", "internal.main:app", "--host", "0.0.0.0", "--port", "3100", "--access-log"]
