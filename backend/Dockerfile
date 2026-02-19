FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for building some Python packages and for fonts
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

# Download and install DejaVu fonts for PDF generation
RUN mkdir -p /usr/share/fonts/truetype/dejavu \
    && curl -L -o /usr/share/fonts/truetype/dejavu/DejaVuSans.ttf https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans.ttf \
    && curl -L -o /usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans-Bold.ttf \
    && fc-cache -f -v

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
