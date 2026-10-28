# Hướng dẫn deploy Chiếu Hới

Tài liệu này dành cho người không chuyên. Làm lần lượt từ trên xuống. Mỗi bước ghi: làm ở đâu, chép giá trị gì, kiểm thế nào.

Bản staging dùng Vercel Hobby (chạy web) + Neon free (Postgres) + Cloudflare R2 free (lưu ảnh). Cả ba đều miễn phí ở mức dùng thử.

Quy ước trong tài liệu:

- `<...>` là chỗ bạn thay bằng giá trị thật. Không chép nguyên dấu `<>`.
- Mật khẩu, khoá bí mật **không bao giờ** đưa vào git, ảnh chụp màn hình hay tin nhắn công khai.
- Lệnh chạy trong thư mục dự án, Node 22 (`.nvmrc`). Ví dụ lệnh viết cho bash. Nếu terminal của bạn là fish, bọc lệnh trong `bash -c '…'`.

---

## 0. Chuẩn bị trên máy

1. Cài Node 22 (`.nvmrc` ghi bản chính xác) và chạy `npm ci`.
2. Có Docker nếu muốn diễn tập ở máy (mục 8).
3. Tạo mật khẩu ngẫu nhiên khi cần bằng lệnh:

   ```bash
   openssl rand -hex 32
   ```

   Mỗi lần chạy ra một chuỗi mới. Dùng cho `PAYLOAD_SECRET` và các mật khẩu bên dưới.

---

## 1. Tạo tài khoản

### 1.1 Vercel (chạy web)

1. Vào <https://vercel.com/signup>, chọn gói **Hobby**, đăng nhập bằng **GitHub**.
2. Cho phép Vercel đọc repo private của dự án (GitHub sẽ hỏi quyền).
3. Kiểm: trang Dashboard của Vercel hiện tên tài khoản của bạn.

### 1.2 Neon (cơ sở dữ liệu Postgres)

1. Vào <https://neon.tech>, đăng ký gói **Free**.
2. Tạo project:
   - Project name: `chieuhoi-staging`
   - Region: **AWS Asia Pacific (Singapore)**
   - Postgres version: bản mặc định.
3. Ở trang project, bấm **Connect**. Chọn bật **Connection pooling**, rồi chép chuỗi kết nối dạng:

   ```
   postgresql://<user>:<mật-khẩu>@<host>-pooler.<vùng>.aws.neon.tech/<tên-db>?sslmode=require
   ```

   Đây là giá trị `DATABASE_URI`.
4. Kiểm: chuỗi có `sslmode=require` và host có chữ `singapore` hoặc `ap-southeast-1`.

### 1.3 Cloudflare R2 (lưu ảnh)

1. Vào <https://dash.cloudflare.com>, đăng ký tài khoản miễn phí.
2. Menu trái: **R2 Object Storage**. Lần đầu Cloudflare yêu cầu bật R2 (gói free vẫn cần thêm phương thức thanh toán; dùng trong hạn mức free thì không mất tiền).
3. Bấm **Create bucket**:
   - Bucket name: `chieuhoi-staging`
   - Location: **Automatic** (hoặc gợi ý Asia-Pacific nếu có).
   - Không bật **Public access** (bucket để private, ảnh đi qua app theo R7).
4. Chép **Account ID** (hiện ở trang R2 Overview). Endpoint S3 là:

   ```
   https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   ```

   Đây là giá trị `S3_ENDPOINT`.

---

## 2. Cấu hình R2

### 2.1 API token chỉ cho bucket staging

1. Trang R2 Overview → **Manage R2 API Tokens** (hoặc **API** → **Manage API tokens**) → **Create API token**.
2. Chọn:
   - Permissions: **Object Read & Write**
   - Specify bucket(s): **Apply to specific buckets only** → chọn `chieuhoi-staging`
   - TTL: **Forever** (hoặc thời hạn bạn muốn).
3. Bấm tạo. Cloudflare hiện **Access Key ID** và **Secret Access Key** đúng một lần. Chép ngay:
   - Access Key ID → `S3_ACCESS_KEY_ID`
   - Secret Access Key → `S3_SECRET_ACCESS_KEY`
4. Kiểm: token chỉ ghi tên bucket `chieuhoi-staging`, không phải "All buckets".

### 2.2 CORS (bắt buộc để tải ảnh từ trang admin)

Admin tải ảnh thẳng từ trình duyệt lên R2 (R8, để vượt giới hạn 4,5 MB của Vercel). Bucket phải cho phép tên miền staging.

1. Mở bucket `chieuhoi-staging` → **Settings** → **CORS Policy** → **Add CORS policy** (hoặc **Edit**).
2. Dán JSON sau, thay `<tên-miền-staging>` bằng tên miền Vercel ở mục 3 (ví dụ `chieuhoi-staging.vercel.app`):

   ```json
   [
     {
       "AllowedOrigins": ["https://<tên-miền-staging>"],
       "AllowedMethods": ["PUT", "GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

3. Lưu. Kiểm: trang Settings hiện đúng tên miền, không có dấu `/` ở cuối.

Nếu sau này đổi tên miền staging, nhớ sửa lại CORS. Sai CORS thì ô tải ảnh trong admin báo lỗi mạng.

---

## 3. Vercel

### 3.1 Import repo

1. Vercel Dashboard → **Add New…** → **Project** → chọn repo private của dự án → **Import**.
2. **Project Name**: `chieuhoi-staging`. Tên miền staging sẽ là `https://chieuhoi-staging.vercel.app` (nếu tên đã có người dùng, Vercel thêm hậu tố; xem tên thật ở mục 3.4).
3. **Framework Preset**: Next.js (Vercel tự nhận).
4. Mở **Build and Output Settings**, bật **Override** ở **Build Command**, nhập:

   ```
   npm run ci
   ```

   Lệnh này kiểm biến môi trường (`tools/check-env.mjs`, cấu hình sai thì dừng trước khi chạm DB), chạy `payload migrate` rồi `npm run build`: schema DB luôn khớp code trước khi dựng trang (R10). Migration lỗi thì deploy dừng, bản đang chạy giữ nguyên.
5. **Install Command** và **Output Directory**: để mặc định.
6. Chưa bấm Deploy. Nhập biến môi trường trước (mục 3.3).

### 3.2 Node và vùng chạy

Làm ở **Settings** của project (sau khi import, hoặc ngay trong màn hình import nếu có):

1. **Settings → Build and Deployment → Node.js Version**: chọn **22.x**.
2. **Settings → Functions → Function Region**: chọn **Singapore (sin1)**, cùng vùng với Neon.
3. Kiểm: hai mục trên hiện `22.x` và `sin1`.

### 3.3 Biến môi trường

**Settings → Environment Variables**. Nhập từng dòng, chọn môi trường **Production** (bản staging chạy ở nhánh chính của project này). Không dùng Deployment Protection của Vercel (gói trả phí); mật khẩu staging do app tự làm bằng `STAGING_AUTH`.

| Tên | Ví dụ | Bắt buộc ở đâu | Ghi chú |
|---|---|---|---|
| `APP_ENV` | `staging` | Vercel, `.env.staging` | `development`, `staging` hoặc `production`. Thiếu hoặc sai thì build dừng. |
| `SITE_URL` | `https://chieuhoi-staging.vercel.app` | Vercel, `.env.staging` | **Đúng tên miền `*.vercel.app` của project**, có `https://`, không có `/` cuối. Dùng cho ảnh OG và robots. |
| `PAYLOAD_SECRET` | `<openssl rand -hex 32>` | Vercel, `.env.staging` | Ít nhất 32 ký tự. Dùng **cùng một giá trị** ở Vercel và `.env.staging`. |
| `DATABASE_URI` | `postgresql://<user>:<mật-khẩu>@<host>-pooler…/<db>?sslmode=require` | Vercel, `.env.staging` | Chuỗi Neon ở mục 1.2. |
| `PREVIEW_ALL` | `true` | Vercel | (`APP_ENV=development` chỉ mở nội dung chưa duyệt qua `next dev`; `next start` bỏ qua `PREVIEW_ALL`, và `APP_ENV=development` bị từ chối khi có `VERCEL`.) Staging hiện cả nội dung chờ xác minh để người xem thấy giống thiết kế (R4). Production **không** đặt. |
| `ALLOW_FIRST_USER` | `false` | Vercel (nên đặt) | Staging/production mà đặt `true` thì build dừng. Người duyệt đầu tiên tạo bằng `npm run create-reviewer`. |
| `STAGING_AUTH` | `<user>:<mật-khẩu>` | Vercel | Chỉ staging. Tên và mật khẩu xem site, cách nhau bằng dấu `:` đầu tiên. Thiếu thì build dừng; nếu vẫn chạy được tới server thì site trả 503, không bao giờ mở toang. |
| `S3_BUCKET` | `chieuhoi-staging` | Vercel, `.env.staging` | Tên bucket R2. |
| `S3_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` | Vercel, `.env.staging` | Mục 1.3. |
| `S3_REGION` | `auto` | Không bắt buộc | R2 dùng `auto` (mặc định khi bỏ trống). |
| `S3_ACCESS_KEY_ID` | `<Access Key ID>` | Vercel, `.env.staging` | Mục 2.1. |
| `S3_SECRET_ACCESS_KEY` | `<Secret Access Key>` | Vercel, `.env.staging` | Mục 2.1. |
| `SEED_REVIEWER_EMAIL` | `seed@<tên-miền-của-bạn>` | Chỉ `.env.staging` | `npm run seed` tạo tài khoản người duyệt này. Không cần trên Vercel. |
| `SEED_REVIEWER_PASSWORD` | `<openssl rand -hex 16>` | Chỉ `.env.staging` | Mật khẩu mạnh, vì tài khoản này đăng nhập được admin staging. |
| `REVIEWER_EMAIL` | `<email người duyệt>` | Chỉ `.env.staging` | Dùng cho `npm run create-reviewer`. |
| `REVIEWER_PASSWORD` | `<mật khẩu người duyệt>` | Chỉ `.env.staging` | Đổi sau khi đăng nhập lần đầu nếu muốn. |

Biến chỉ dùng khi kiểm (mục 5), đặt ngay trên dòng lệnh, không đặt trên Vercel: `STAGING_URL`, `STAGING_AUTH`, `STAGING_REVIEWER_EMAIL`, `STAGING_REVIEWER_PASSWORD`.

Kiểm: đủ các dòng có chữ "Vercel" ở cột thứ ba.

### 3.4 Deploy lần đầu

Nên nạp dữ liệu (mục 4) **trước** khi deploy lần đầu, vì lúc build Next đọc DB để dựng trang tĩnh.

1. Bấm **Deploy** (hoặc **Deployments → Redeploy**).
2. Kiểm log build: có dòng `Migrating`/`Done` của Payload, rồi `next build` xong không lỗi.
3. Mở **Settings → Domains**, xem tên miền thật. Nếu khác `SITE_URL` đã nhập: sửa `SITE_URL` (mục 3.3) và CORS (mục 2.2), rồi **Redeploy**.

---

## 4. Nạp dữ liệu từ máy

Seed chạy ở máy dev, không chạy trên Vercel (R9). Ảnh tham khảo nằm ở `design/reference-images` trên máy, không bao giờ vào repo hay bản build; seed tải chúng thẳng lên R2.

1. Tạo file `.env.staging` ở thư mục gốc dự án (git đã bỏ qua mọi file `.env*` trừ `.env.example`; kiểm bằng `git check-ignore -v .env.staging`, phải in ra một dòng):

   ```
   APP_ENV=staging
   SITE_URL=https://<tên-miền-staging>
   PAYLOAD_SECRET=<cùng giá trị như trên Vercel>
   DATABASE_URI=<chuỗi Neon>
   S3_BUCKET=chieuhoi-staging
   S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   S3_REGION=auto
   S3_ACCESS_KEY_ID=<Access Key ID>
   S3_SECRET_ACCESS_KEY=<Secret Access Key>
   SEED_REVIEWER_EMAIL=<email>
   SEED_REVIEWER_PASSWORD=<mật khẩu mạnh>
   REVIEWER_EMAIL=<email người duyệt>
   REVIEWER_PASSWORD=<mật khẩu người duyệt>
   ```

2. Chạy (lệnh nạp biến từ file, không in giá trị ra màn hình):

   ```bash
   bash -c 'set -a; . ./.env.staging; set +a; npm run migrate && npm run seed && npm run create-reviewer'
   ```

   - `npm run migrate`: tạo bảng trên Neon.
   - `npm run seed`: nạp nội dung mẫu và ảnh lên R2. Seed chỉ chạy khi `APP_ENV` là `development` hoặc `staging`.
   - `npm run create-reviewer`: tạo người duyệt từ `REVIEWER_EMAIL`/`REVIEWER_PASSWORD`. Đã có thì bỏ qua.
3. Kiểm:
   - cuối lệnh seed in `Seed xong:` kèm số bản ghi;
   - lệnh cuối in `Đã tạo người duyệt:` (hoặc `Người duyệt đã tồn tại, bỏ qua.`);
   - trang bucket R2 có các file `.webp`.

File `.env.staging` có mật khẩu thật: không gửi cho ai, xoá khi không cần nữa.

---

## 5. Kiểm sau deploy

1. Mở `https://<tên-miền-staging>` trong trình duyệt. Trình duyệt hỏi tên và mật khẩu: nhập hai vế của `STAGING_AUTH`.
2. Chạy bộ kiểm staging tự động ở máy:

   ```bash
   STAGING_URL=https://<tên-miền-staging> STAGING_AUTH='<user>:<mật-khẩu>' \
   STAGING_REVIEWER_EMAIL='<email người duyệt>' STAGING_REVIEWER_PASSWORD='<mật khẩu người duyệt>' \
   npm run test:e2e -- --project=staging
   ```

   Bộ kiểm này:
   - không mật khẩu: `/`, `/admin`, file ảnh đều 401;
   - có mật khẩu: trang chủ 200, có `noindex` (header và thẻ meta), `robots.txt` chặn tất cả, có nhãn `[cần xác minh]`;
   - mọi ảnh trên `/`, `/thu-vien`, `/nghe-det-chieu` tải được (ảnh qua R2);
   - ảnh OG là địa chỉ tuyệt đối bắt đầu bằng tên miền staging (sai thì `SITE_URL` sai);
   - đăng nhập admin bằng người duyệt, tải một ảnh thử thẳng lên R2, kiểm đủ cỡ `thumb`/`card`/`wide`, rồi xoá ảnh thử.

   Thiếu `STAGING_REVIEWER_EMAIL`/`STAGING_REVIEWER_PASSWORD` thì ca tải ảnh tự bỏ qua. Kết quả mong đợi: tất cả `passed`.
3. Chạy Lighthouse (Accessibility ≥ 95, CLS < 0.1):

   ```bash
   npm run audit:lighthouse -- --base=https://<tên-miền-staging> --auth='<user>:<mật-khẩu>'
   ```

   Thêm `--out=.superpowers/lighthouse-staging.json` nếu muốn lưu bảng kết quả. Lệnh thoát lỗi khi có trang dưới ngưỡng.

Muốn đo bản xem trước (nội dung chờ xác minh) bằng `next start` thì phải chạy với `APP_ENV=staging`, `STAGING_AUTH`, `PREVIEW_ALL=true` và thêm `--auth` (hoặc đo thẳng staging); `APP_ENV=development` không còn mở bản xem trước ngoài `next dev`.

Lưu ý: lệnh có mật khẩu sẽ nằm trong lịch sử terminal. Xoá lịch sử hoặc thêm dấu cách ở đầu lệnh (bash bỏ qua lệnh đó khi `HISTCONTROL=ignorespace`).

---

## 6. Chuyển sang VPS (khi cần)

App không dùng tính năng riêng của Vercel, nên chạy được trên máy chủ bất kỳ có Node 22:

```bash
npm ci && npm run ci && npm run start
```

- Đặt cùng các biến môi trường như bảng ở mục 3.3 (qua file môi trường của systemd, Docker, PM2…).
- `npm run start` mở cổng 3000; thêm `-- -p <cổng>` để đổi. Đặt Nginx/Caddy phía trước để có HTTPS.
- Lưu ảnh: giữ R2, hoặc tự chạy MinIO (xem dịch vụ `minio` trong `docker-compose.yml`) và trỏ `S3_ENDPOINT` tới nó. Nhớ CORS cho tên miền mới.
- Postgres: giữ Neon, hoặc Postgres trên VPS (sửa `DATABASE_URI`).

---

## 7. Production sau này

- DB và bucket **riêng**, không dùng chung với staging.
- **Không** chạy `npm run seed` (seed tự chặn khi `APP_ENV=production`). Nội dung thật nhập qua admin.
- `APP_ENV=production`. **Không** đặt `PREVIEW_ALL` hay `ALLOW_FIRST_USER` (đặt `true` thì build dừng). Không cần `STAGING_AUTH`.
- Người duyệt đầu tiên: `npm run create-reviewer` với `.env.production` riêng (cùng cách nạp như mục 4).
- Ảnh: khi thu hồi quyền một ảnh, **không cần** xoá cache CDN, vì bộ tối ưu ảnh của Next đã tắt (R6) và file luôn đi qua kiểm quyền của Payload (R7).

---

## 8. Diễn tập staging ở máy (R11)

Chạy đúng chuỗi lệnh của Vercel trên máy, với DB riêng và MinIO giả lập R2. Không đụng DB dev `chieuhoi` và DB test `chieuhoi_test`.

1. Bật Postgres và MinIO, tạo DB riêng:

   ```bash
   docker compose up -d
   docker compose --profile s3 up -d
   docker compose exec postgres psql -U postgres -c 'CREATE DATABASE chieuhoi_staging'
   ```

   MinIO: API ở `http://localhost:9000`, console ở `http://localhost:9001` (tài khoản mặc định `minioadmin`). Dịch vụ `minio-init` tạo sẵn bucket `chieuhoi-staging`; MinIO đã đặt CORS cho `http://localhost:3200`.
2. Tạo `.env.staging.local` (git bỏ qua) như mục 4, với các giá trị cục bộ:
   - `APP_ENV=staging`, `PREVIEW_ALL=true`, `ALLOW_FIRST_USER=false`, `SITE_URL=http://localhost:3200`;
   - `DATABASE_URI=postgres://postgres:postgres@localhost:5433/chieuhoi_staging`;
   - `S3_BUCKET=chieuhoi-staging`, `S3_ENDPOINT=http://localhost:9000`, `S3_ACCESS_KEY_ID=minioadmin`, `S3_SECRET_ACCESS_KEY=minioadmin`;
   - `PAYLOAD_SECRET`, `STAGING_AUTH`, `SEED_REVIEWER_*`, `REVIEWER_*` ngẫu nhiên (`openssl rand -hex …`).
3. Chạy chuỗi lệnh:

   ```bash
   bash -c 'set -a; . ./.env.staging.local; set +a; npm run migrate && npm run seed && npm run create-reviewer && npm run ci && npm run start -- -p 3200'
   ```

   Biến nạp từ file đè lên `.env` dev (Next và Payload không ghi đè biến đã có). Kiểm: `http://localhost:3200` hỏi mật khẩu (401).
4. Ở terminal khác, kiểm:

   ```bash
   bash -c 'set -a; . ./.env.staging.local; set +a; STAGING_URL=http://localhost:3200 STAGING_REVIEWER_EMAIL="$REVIEWER_EMAIL" STAGING_REVIEWER_PASSWORD="$REVIEWER_PASSWORD" npm run test:e2e -- --project=staging'
   ```

5. Kiểm schema khớp migration: lệnh sau không được sinh file mới trong `src/migrations`:

   ```bash
   bash -c 'set -a; . ./.env.staging.local; set +a; npm run migrate:create -- kiem-tra --skip-empty'
   ```

   Nếu sinh file: schema đã đổi mà chưa có migration. Xem file, đổi tên cho đúng nội dung rồi commit.
6. Dọn: dừng server :3200 (Ctrl+C), rồi dừng MinIO bằng `docker compose --profile s3 stop minio`. Ghi rõ tên `minio`: `docker compose --profile s3 stop` không kèm tên sẽ dừng cả Postgres dev.

Xoá hẳn dữ liệu diễn tập khi không cần nữa:

```bash
docker compose exec postgres psql -U postgres -c 'DROP DATABASE chieuhoi_staging'
docker compose --profile s3 rm -sf minio minio-init
docker volume rm chieuhoivn_miniodata
```

**Không** dùng `docker compose down -v`: lệnh đó xoá cả volume `pgdata` chứa DB dev.
