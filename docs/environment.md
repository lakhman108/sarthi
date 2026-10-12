# Environment variables

Copy the examples, then fill in the secrets on your machine.

```bash
cp Backend/.env.example Backend/.env
cp classroom/.env.example classroom/.env
```

`.env` files are gitignored. Do not commit them.

The API reads `Backend/.env` through `dotenv` at startup. Restart `node app.js` after every change.

The website only reads variables whose names start with `REACT_APP_`. Create React App reads `classroom/.env` when `npm start` launches. Restart the website after you change it.

## API (`Backend/.env`)

| Variable | Required to boot | Local example | What it does |
| --- | --- | --- | --- |
| `PORT` | No, defaults to `3000` | `5000` | HTTP port. Use `5000` so the React app can keep `3000`. |
| `HOST` | Yes, for a useful log line and for Swagger | `http://localhost:5000` | Public base URL of this API. HLS playlists and Swagger use it. |
| `FRONTEND_HOST` | Yes, for the browser app | `http://localhost:3000` | Origins allowed by CORS. The API splits this value on commas. The verification email uses the whole value as one URL, so for a local run keep a single origin: `http://localhost:3000`. |
| `ENVIRONMENT` | No, defaults to `production` | `development` | Turns off the production rate limit. Also becomes part of the Redis queue name: `video-processing-development`. |
| `MONGODB_URI` | Yes | `mongodb://127.0.0.1:27017/sarthi` | MongoDB connection string. The database name is `sarthi`. |
| `REDIS_URL` | Yes | `redis://127.0.0.1:6379` | Redis connection. The API creates the queue as soon as it starts, so Redis must be up first. |
| `JWT_SECRET` | Yes, at login and on protected routes | a long random string | Secret used to sign and check login tokens. |
| `LIMIT` | No | `100` | Max requests per IP per 15 minutes. Used only when `ENVIRONMENT` is `production`. |

### Email

Signup and unverified login send a 6-digit code. Nodemailer needs a working mailbox or those requests return 500 after the user row is saved.

| Variable | Local example | What it does |
| --- | --- | --- |
| `EMAIL_SERVICE` | `gmail` | Nodemailer service name, such as `gmail`. |
| `EMAIL_USER` | your Gmail address | From address, and the mailbox login. |
| `EMAIL_PASSWORD` | Google App Password | Used when the OAuth variables below are empty. |
| `EMAIL_CLIENT_ID` | empty locally | If this, the secret, and the refresh token are all set, Nodemailer uses OAuth2 instead of `EMAIL_PASSWORD`. |
| `EMAIL_CLIENT_SECRET` | empty locally | OAuth client secret. |
| `EMAIL_REFRESH_TOKEN` | empty locally | OAuth refresh token. |

The verification link in the email is `${FRONTEND_HOST}/verify-email?email=...`.

### Video storage

You can boot the API without these. Upload and profile-picture routes need them.

| Variable | Local example | What it does |
| --- | --- | --- |
| `AWS_ACCESS_KEY_ID` | `minioadmin` | MinIO or S3 access key. |
| `AWS_SECRET_ACCESS_KEY` | `minioadmin` | MinIO or S3 secret key. |
| `AWS_S3_BUCKET_NAME` | `sarthi` | Bucket name. Create this bucket in MinIO before the first upload. |
| `MINIO_ENDPOINT` | `http://localhost:9000` | S3 API address. The SDK prefers this over `MINIO_BROWSER_REDIRECT_URL`. |
| `MINIO_BROWSER_REDIRECT_URL` | `http://localhost:9000` | Base URL written into the lecture's `videoLink`. The player loads the playlist from here. |

`Backend/storage/test.js` also reads `Account_ID`, `Access_Key_ID`, and `Secret_Access_Key` for a Cloudflare R2 experiment. The running API does not use those names.

## Website (`classroom/.env`)

| Variable | Local example | What it does |
| --- | --- | --- |
| `REACT_APP_API_URL` | `http://localhost:5000` | API origin. The pages append `/api/...` themselves. Do not put `/api` on the end. |

There is a hardcoded `classroom/src/config/config` file with `apiUrl: "http://localhost:3000"`. The pages that talk to the API use `REACT_APP_API_URL`, not that file. Leave it alone for a normal local run.
