#!/bin/sh
# Tạo bucket cho MinIO bằng cách tạo thư mục trong /data (MinIO coi mỗi thư mục cấp một là một bucket).
# Dùng cách này vì image `mc` không tải được; không cần client riêng.
set -eu
BUCKET="${S3_BUCKET:-chieuhoi-staging}"
mkdir -p "/data/${BUCKET}"
echo "Đã tạo bucket ${BUCKET}"
