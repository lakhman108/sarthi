# Sarthi

Sarthi is a small classroom app. A teacher creates a class and uploads lecture videos. A student joins with a class code, watches lectures, writes comments, and keeps notes.

The project has two apps:

| App | Folder | What it is | Local URL |
| --- | --- | --- | --- |
| Classroom | `classroom/` | React website | http://localhost:3000 |
| API | `Backend/` | Node.js and Express | http://localhost:5000 |

The API stores users, classes, and lectures in MongoDB. Video jobs wait in Redis. FFmpeg turns an uploaded video into an HLS stream, and MinIO stores those files.

## What you need installed

- [Node.js 20](https://nodejs.org/) and npm. The backend Docker image uses Node 20.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/). This is the easy way to run MongoDB and Redis.
- [FFmpeg](https://ffmpeg.org/), only if you want to upload a lecture video. On macOS: `brew install ffmpeg`.
- Git.

Check the tools:

```bash
node -v
npm -v
docker -v
ffmpeg -version
```

## 1. Start MongoDB and Redis

From the project root:

```bash
docker run -d --name sarthi-mongo -p 27017:27017 mongo:7
docker run -d --name sarthi-redis -p 6379:6379 redis:7
```

If a container name already exists from an earlier try, start it again with `docker start sarthi-mongo` and `docker start sarthi-redis`.

## 2. Configure the API

```bash
cd Backend
cp .env.example .env
npm install
```

Open `Backend/.env` and set `JWT_SECRET` to any long random string. The other values in `.env.example` already match this local setup.

`PORT` is `5000` on purpose. The React app also wants port `3000`. If both use `3000`, one of them fails to start.

## 3. Start the API

Stay in `Backend/` and run:

```bash
node app.js
```

Leave this terminal open. You should see:

- `Connected to MongoDB successfully!`
- `Server is running on http://localhost:5000`
- `[QUEUE] Bull Board dashboard available at /admin/queues`

`npm start` also boots the API, but it writes output to `Backend/app.log` instead of the terminal. Use `node app.js` while you are setting the project up.

Quick check in a second terminal:

```bash
curl http://localhost:5000/
```

A JSON body means the API is up. API docs are at http://localhost:5000/api-docs. The video job dashboard is at http://localhost:5000/admin/queues.

## 4. Configure and start the website

Open a new terminal:

```bash
cd classroom
cp .env.example .env
npm install
npm start
```

Create React App opens http://localhost:3000. If you change `classroom/.env` later, stop the website and run `npm start` again. React only reads `REACT_APP_*` variables at startup.

`REACT_APP_API_URL` is the API origin, with no `/api` on the end. The website adds `/api/...` itself. Example: `http://localhost:5000`.

The API only accepts browser calls from origins listed in `FRONTEND_HOST`. For this setup that value is `http://localhost:3000`.

## 5. Try it in the browser

1. Open http://localhost:3000. You land on the login page.
2. Choose **Sign up**. Pick the **teacher** role for the first account.
3. Submit the form. Sarthi emails a 6-digit code (OTP). The code lasts 15 minutes.
4. Enter the code on the verify page. After that, the site sends you to the classroom home.
5. Create a class. Sarthi makes a 6-character class code.
6. Sign up a second account with the **student** role, in a private window or another browser.
7. Join the class with that code.
8. As the teacher, open the class and add a lecture. Uploading a video needs the extra setup in the next section.

Signup calls your email provider. Fill in `EMAIL_SERVICE`, `EMAIL_USER`, and `EMAIL_PASSWORD` in `Backend/.env` before you sign up. For Gmail, `EMAIL_SERVICE` is `gmail`, and `EMAIL_PASSWORD` is a Google App Password, not your normal Gmail password.

If email is not set up yet, registration still saves the user, then the API returns an error because the mail send failed. You can read the code from your local database and verify by hand:

```bash
docker exec sarthi-mongo mongosh sarthi --quiet --eval 'db.users.find({}, {email:1, otp:1, isVerified:1, role:1}).toArray()'
```

Then:

```bash
curl -X POST http://localhost:5000/api/users/verify-otp \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","otp":"123456"}'
```

Use the email and `otp` from the database output. A `token` in the response means the account is verified. Go back to http://localhost:3000/login and sign in.

## Video upload (optional)

Lecture playback needs three more things: FFmpeg on your PATH, Redis (already started above), and a MinIO bucket.

```bash
docker run -d --name sarthi-minio \
  -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

Open http://localhost:9001, sign in with `minioadmin` / `minioadmin`, and create a bucket named `sarthi`. The matching API settings are already in `Backend/.env.example`:

```bash
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_BUCKET_NAME=sarthi
MINIO_ENDPOINT=http://localhost:9000
MINIO_BROWSER_REDIRECT_URL=http://localhost:9000
```

Restart `node app.js` after you edit `.env`. Upload a short video from the class page. The job shows up at http://localhost:5000/admin/queues. When it finishes, the lecture status becomes `completed` and the player uses the HLS playlist stored in MinIO.

## More detail

- [How Sarthi fits together](docs/how-sarthi-works.md)
- [Environment variables](docs/environment.md)

## If something fails

| What you see | What to check |
| --- | --- |
| `EADDRINUSE` on port 3000 | The API is still on the default port. Set `PORT=5000` in `Backend/.env`. |
| Browser error about CORS | `FRONTEND_HOST` must be exactly `http://localhost:3000`, including `http://`. |
| `connection error` and MongoDB | The `sarthi-mongo` container is running, and `MONGODB_URI` is `mongodb://127.0.0.1:27017/sarthi`. |
| Queue or Redis errors on startup | The `sarthi-redis` container is running, and `REDIS_URL` is `redis://127.0.0.1:6379`. |
| Signup returns 500 | Email settings are empty or rejected. Use the MongoDB OTP steps above, or set a real app password. |
| Video stays pending | `ffmpeg` is missing, Redis is down, or the MinIO bucket `sarthi` does not exist. Read the API terminal for `[WORKER]` lines. |
| Website calls the wrong host | `classroom/.env` has `REACT_APP_API_URL=http://localhost:5000`, and you restarted `npm start` after editing it. |
