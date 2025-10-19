# USDA Plant Hardiness Zone Map - Dockerfile
FROM nginx:alpine

# Copy web files to nginx html directory
COPY web/ /usr/share/nginx/html/

# Copy data files to serve GeoJSON files
COPY data/ /usr/share/nginx/html/data/

# Documentation is available in the repository, not needed in web container

# Create nginx configuration for serving the application
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Enable CORS for GeoJSON files' >> /etc/nginx/conf.d/default.conf && \
    echo '    location /data/ {' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Access-Control-Allow-Origin *;' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept";' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ =404;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Serve main application' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
