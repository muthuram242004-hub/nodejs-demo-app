# nodejs-demo-app — CI/CD with GitHub Actions + Docker Hub

[![CI/CD Pipeline](https://github.com/muthuram242004-hub/nodejs-demo-app/actions/workflows/main.yml/badge.svg)](https://github.com/muthuram242004-hub/nodejs-demo-app/actions/workflows/main.yml)

A small Express app with an automated pipeline: every push to `main` runs the tests, builds a Docker image, pushes it to Docker Hub, then pulls it back and checks that it starts healthy.

```
push to main ──▶ test (Node 22 & 24) ──▶ build & push image ──▶ smoke-test from Docker Hub
pull request ──▶ test ──▶ build image only (nothing pushed)
```

## Project structure

```
nodejs-demo-app/
├── .github/workflows/main.yml   # the CI/CD pipeline
├── src/
│   ├── app.js                   # Express routes (/, /health, /add)
│   └── server.js                # starts the server on $PORT (default 3000)
├── tests/app.test.js            # Jest + Supertest tests
├── Dockerfile                   # multi-stage, non-root, with HEALTHCHECK
├── .dockerignore
├── .gitignore
└── package.json
```

## Run it locally

```bash
npm install          # also creates package-lock.json — commit it
npm test             # runs the test suite with coverage
npm start            # http://localhost:3000
```

With Docker:

```bash
docker build -t nodejs-demo-app .
docker run -p 3000:3000 nodejs-demo-app
curl http://localhost:3000/health
```

## Set up the pipeline (one time)

1. **Create a Docker Hub access token**
   Docker Hub → Account settings → Personal access tokens → *Generate new token* (Read & Write). Copy it.

2. **Create the GitHub repo** named `nodejs-demo-app` and push this code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Node app + CI/CD pipeline"
   git branch -M main
   git remote add origin https://github.com/<your-github-username>/nodejs-demo-app.git
   git push -u origin main
   ```

3. **Add two repository secrets**
   GitHub repo → Settings → Secrets and variables → Actions → *New repository secret*:

   | Name                 | Value                              |
   |----------------------|------------------------------------|
   | `DOCKERHUB_USERNAME` | your Docker Hub username           |
   | `DOCKERHUB_TOKEN`    | the access token from step 1       |

4. **Trigger the pipeline**: push any commit to `main` (or use *Actions → CI/CD Pipeline → Run workflow*). Watch it under the **Actions** tab.

If you pushed before adding the secrets, the first run fails at "Log in to Docker Hub" — add the secrets and click *Re-run all jobs*.

## What the workflow does

| Job | Runs on | Steps |
|-----|---------|-------|
| `test` | every push & PR | checkout → setup Node (22 and 24 in parallel) → install → `npm test` |
| `build-and-push` | after `test` passes | Buildx → log in to Docker Hub → generate tags → build image → push (main only) |
| `smoke-test` | after push, main only | pull the just-pushed image → run it → poll `/health` until it answers |

Image tags pushed on each main commit:

- `<username>/nodejs-demo-app:latest`
- `<username>/nodejs-demo-app:sha-<short commit>` — a fixed version you can roll back to

Docker layer caching (`type=gha`) keeps rebuilds fast.

## Use the deployed image

```bash
docker pull <your-dockerhub-username>/nodejs-demo-app:latest
docker run -p 3000:3000 <your-dockerhub-username>/nodejs-demo-app:latest
```

`GET /` returns the commit SHA the image was built from, so you can see which version is running.

## Endpoints

| Route | Response |
|-------|----------|
| `GET /` | welcome message + version |
| `GET /health` | `{ "status": "ok" }` |
| `GET /add?a=2&b=3` | `{ "result": 5 }` |
