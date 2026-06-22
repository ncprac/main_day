# Hello World — Build & Deploy Guide

## Project layout

```
.
├── backend/        Spring Boot API (Java 21)
├── frontend/       Static HTML/CSS/JS served by nginx
├── .github/
│   └── workflows/
│       └── deploy.yml   GitHub Actions CI/CD
└── .do/
    └── app.yaml    Digital Ocean App Platform spec
```

## API endpoints

| Method | Path             | Description        |
|--------|------------------|--------------------|
| GET    | /api/hello       | Customer greeting  |
| GET    | /api/admin/hello | Admin greeting     |

---

## Run locally

### Backend

```bash
cd backend
mvn spring-boot:run
# → http://localhost:8080/api/hello
```

### Frontend

```bash
cd frontend
python3 -m http.server 3000
# → http://localhost:3000
# The frontend auto-detects localhost and points to http://localhost:8080
```

### Docker (both services)

```bash
# Backend
docker build -t hello-backend ./backend
docker run -p 8080:8080 hello-backend

# Frontend
docker build -t hello-frontend ./frontend
docker run -p 3000:80 hello-frontend
```

---

## CI/CD pipeline

**Flow:** push to `main` → GitHub Actions → tests → Docker build → push to GHCR → deploy to DO App Platform

### GitHub secrets required

| Secret                    | Value                                          |
|---------------------------|------------------------------------------------|
| `DIGITALOCEAN_ACCESS_TOKEN` | DO personal access token (read+write)        |
| `DO_APP_ID`               | App ID from `doctl apps list`                  |
| `GITHUB_TOKEN`            | Auto-provided by GitHub Actions (no action needed) |

### First-time setup

1. **Push your repo to GitHub.**

2. **Create the DO App** (first time only):
   ```bash
   # Install doctl: https://docs.digitalocean.com/reference/doctl/how-to/install/
   doctl auth init

   # Replace <YOUR_GITHUB_USERNAME> in .do/app.yaml, then:
   doctl apps create --spec .do/app.yaml

   # Note the App ID from the output — add it as DO_APP_ID secret in GitHub
   ```

3. **Make GHCR packages public** (or grant DO read access):
   - Go to `github.com/<you>` → Packages → `hello-backend` / `hello-frontend` → Package settings → Change visibility to **Public**
   - *Alternatively*, create a DO registry integration with a GHCR PAT (read:packages scope) and set it in app.yaml.

4. **Add GitHub secrets**:
   - `DIGITALOCEAN_ACCESS_TOKEN` — from digitalocean.com → API → Generate Token
   - `DO_APP_ID` — from step 2 output

5. **Push to main** — the pipeline runs automatically on every commit.

### What the pipeline does

```
push to main
  └─ test job
       mvn test
  └─ build-and-deploy job (only on main push, after tests pass)
       docker build + push backend  → ghcr.io/<you>/hello-backend:latest
       docker build + push frontend → ghcr.io/<you>/hello-frontend:latest
       doctl apps create-deployment $DO_APP_ID --wait
```

PRs only run the `test` job — no deploy.

---

## Update the DO App spec

If you change ports, routing, or add env vars:

```bash
doctl apps update $DO_APP_ID --spec .do/app.yaml
```
