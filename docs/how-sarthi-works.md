# How Sarthi fits together

This page explains the running system. The commands to start it are in the [README](../readme.md).

## The two apps

`classroom/` is a React app made with Create React App. It is the website people use. It has no database of its own. Every class, user, and lecture comes from the API.

`Backend/` is an Express server. `Backend/app.js` connects to MongoDB, opens the HTTP routes, and starts the video worker. One Node process does both the API and the video work.

```text
Browser (localhost:3000)
        |
        |  HTTP, with a JWT after login
        v
Express API (localhost:5000)
        |
        +-- MongoDB     users, classes, lectures, enrollments
        +-- Redis       video jobs waiting to run
        +-- FFmpeg      turns the upload into HLS files
        +-- MinIO       stores the HLS files
```

## Pages

`classroom/src/App.js` defines the routes.

| Path | Who can open it | What it is |
| --- | --- | --- |
| `/login`, `/signup` | Anyone | Sign in or create an account |
| `/verify-email` | Anyone with a pending signup | Enter the 6-digit email code |
| `/classroom` | Signed-in user | List of classes |
| `/classroom/:id` | Someone in that class | Lectures, player, comments, notes |
| `/share/:id` | Signed-in user | Share a class |
| `/join/:inviteCode` | Anyone with the link | Join by class code |
| `/settings` | Signed-in user | Name, password, profile picture |

A signed-in user is someone whose browser holds a cookie named `token`. That cookie is a JWT. A JWT is a signed string that says which user id and role this browser belongs to. The API checks it with `JWT_SECRET` in `Backend/middleware/authMiddleware.js`. The token lasts 720 hours.

Roles are `teacher` and `student`. Both can create a class in the current API. Only the teacher who owns a class can rename it, delete it, or change its lectures.

## Accounts

Signup is `POST /api/users/register`. The handler in `Backend/controllers/authController.js` does four things:

1. Rejects a username or email that is already taken.
2. Saves the user with `isVerified: false`.
3. Stores a 6-digit OTP that expires in 15 minutes. OTP means one-time password.
4. Emails that code with Nodemailer.

`POST /api/users/verify-otp` checks the code, sets `isVerified: true`, and returns a JWT. Login refuses an account that is still unverified, and it sends a fresh code when it does.

Passwords are hashed with bcrypt before they are saved. The database never stores the original password.

## Classes and lectures

A class is a MongoDB `Course`. On save, the model creates a unique 6-character `classCode`. A student joins with `POST /api/enrollments/join`. An enrollment is the record that links one user to one class. Notes live on that enrollment.

A lecture belongs to one class. The lecture routes live in `Backend/routes/lectureroutes.js`. They cover the list for a class, likes, view counts, comments, and edits.

The browser is only allowed to call the API when its origin is listed in `FRONTEND_HOST`. That check is CORS. CORS is the browser rule that blocks a page on port 3000 from calling an API on port 5000 unless the API explicitly allows it. `Backend/app.js` splits `FRONTEND_HOST` on commas, so you can list more than one origin.

## What happens when a teacher uploads a video

The upload route is `POST /api/upload` in `Backend/routes/videoprocessingroutes/upload.js`.

1. Multer saves the file under the API's public upload folder.
2. The API creates or updates the lecture and sets `processingStatus` to `pending`.
3. It adds a job to a BullMQ queue named `video-processing-<ENVIRONMENT>`. BullMQ is a job queue. Redis holds the job until a worker takes it.
4. The HTTP response returns immediately. The teacher can keep using the site.
5. The worker, started in the same file when the API boots, sets the lecture to `processing`.
6. FFmpeg builds 240p, 360p, and 720p HLS. HLS is a playlist plus short video chunks, so the player can switch quality.
7. The worker uploads that folder to the MinIO bucket under `hls-videos/<videoName>/`.
8. It saves `videoLink` on the lecture and sets `processingStatus` to `completed`.
9. It deletes the local HLS folder.

The website polls the lecture until the status is `completed`, then plays `videoLink`. While you wait, http://localhost:5000/admin/queues shows the job. That page is Bull Board.

MinIO is used with the AWS S3 SDK (`s3ForcePathStyle: true`) in `Backend/routes/videoprocessingroutes/cloud.js`. The same variables can point at real AWS S3 or Cloudflare R2. For a local try, MinIO on port 9000 is enough.

Profile pictures use the same S3 client and bucket. See `Backend/controllers/userController.js`.

## Useful API paths

| Path | Purpose |
| --- | --- |
| `GET /` | Small JSON response. Use it to see that the process is up. |
| `/api-docs` | Swagger UI generated from the route files |
| `/admin/queues` | Video job dashboard |
| `/api/users` | Register, login, verify, current user |
| `/api/courses` | List and create classes |
| `/api/lectures` | Lecture list, comments, likes |
| `/api/upload` | Video upload |
| `/api/enrollments` | Join a class and save notes |
| `/api/hls` | Local HLS files, when a stream is still on disk |

`ENVIRONMENT` should be `development` on your machine. In `production`, the API trusts a reverse proxy and turns on a rate limit of 100 requests per 15 minutes per IP. Locally you want those off, so set `development`.

The queue name includes `ENVIRONMENT`. A worker started with `development` will not pick up jobs that were queued as `production`. Keep the value the same for the whole time you are trying uploads.
