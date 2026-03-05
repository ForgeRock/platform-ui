# Deploying IDM End-User UI

This guide explains how to build, configure and run the **idm-enduser** package
as a standalone Docker container served by Nginx.

---

## Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Build Artifacts](#build-artifacts)
- [Docker](#docker)
  - [Build the Image](#build-the-image)
  - [Run the Container](#run-the-container)
  - [Environment Variables](#environment-variables)
  - [Custom Nginx Config](#custom-nginx-config)
- [Standalone Nginx](#standalone-nginx)
- [File Reference](#file-reference)

---

## Prerequisites

| Tool   | Minimum Version |
| ------ | --------------- |
| Docker | 20.10+          |

---

## Quick Start

```bash
# Build the Docker image
docker build -t idm-enduser:latest .

# Run the container
docker run -p 8083:8080 -e IDM_REST_URL="/openidm" idm-enduser:latest
```

Open <http://localhost:8083> in your browser.

---

## Build Artifacts

Running `yarn build` inside `packages/idm-enduser` produces a `dist/` directory.
The CI pipeline (and the zip archive) restructures this into `www/enduser/`:

```
www/enduser/
├── css/          # Compiled and minified stylesheets
├── fonts/        # Webfont files
├── img/          # Optimised image assets
├── js/           # Bundled and minified JavaScript
├── static/       # Static assets copied from public/
├── favicon.ico
└── index.html    # Application entry point
```

---

## Docker

### Build the Image

The `Dockerfile` takes a pre-built `www/enduser/` folder and serves it with
`nginxinc/nginx-unprivileged`. No build tools are needed inside the image.

```bash
# From the idm-enduser package directory (or unzipped archive root)
docker build -t idm-enduser:latest .
```

The Dockerfile accepts two optional build arguments:

| Argument            | Default             | Description                    |
| ------------------- | ------------------- | ------------------------------ |
| `WEB_ROOT_LOCATION` | `www/enduser`       | Path to the built UI assets    |
| `NGINX_CONF`        | `nginx.docker.conf` | Nginx server block config file |

```bash
docker build --build-arg WEB_ROOT_LOCATION=my/assets --build-arg NGINX_CONF=my-nginx.conf -t idm-enduser .
```

### Run the Container

Pass runtime environment variables with `-e` flags. The entrypoint runs
`variable_replacement.sh` to substitute them into the compiled JS before
starting Nginx.

```bash
docker run -d --name idm-enduser -p 8083:8080 \
  -e IDM_REST_URL="/openidm" \
  idm-enduser:latest
```

---

### Environment Variables

Injected into the compiled JS bundles when the container starts via
`variable_replacement.sh`. Build the image once, configure per-environment
with `docker run -e`.

| Variable          | Default    | Description                      |
| ----------------- | ---------- | -------------------------------- |
| `IDM_REST_URL`    | `/openidm` | IDM REST API URL                 |
| `IDM_ADMIN_URL`   | _(empty)_  | IDM admin console URL (optional) |

The entrypoint also runs `variable_replacement.sh`, which passes every
environment variable listed in that script through `envsubst`. The two
variables above are the only ones referenced by idm-enduser source code.

---

### Custom Nginx Config

The image uses `nginx.docker.conf` as its server block. If you have an `IDM_REST_URL` of `/openidm` and are running docker on macOS, it contains an example of how to proxy requests to IDM. To override it at runtime, mount your own config:

```bash
docker run -p 8083:8080 \
  -v /path/to/my-nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  idm-enduser:latest
```

---

## Standalone Nginx

1. Install nginx. For macOS it would be this command
    ```
    brew install nginx
    ```

2. Set your environment variables. IDM_REST_URL should be where the backend is hosted and IDM_ADMIN_URL should be where the Admin UI is hosted. In this example, IDM_REST_URL points to this nginx server and the requests are then proxied to the default IDM ports and the IDM_ADMIN_URL points to the default Admin UI ports

    ```
    export IDM_REST_URL=/openidm
    export IDM_ADMIN_URL=http://localhost:8080/admin
    ```

3. Run the `variable_replacement.sh` script

    ```
    ./variable_replacement.sh www/enduser/js/*.js
    ```

4. Copy the contents of the `www/` folder into the nginx `html` webroot. For macOS you would do that with this command.

    ```
    cp -r www/* /opt/homebrew/opt/nginx/html/
    ```

5. Copy the nginx configuration to the nginx configuration directory. For macOS that would look like this.

    ```
    cp nginx.conf /opt/homebrew/etc/nginx/nginx.conf
    ```

6. Start nginx. For macOS this would be

    ```
    brew services start nginx
    ```

7. UI will be available at <http://localhost:8083>

---

## File Reference

```
IDMEnduserUI/                  (zip archive root)
├── www/
│   └── enduser/               # Production build output
├── Dockerfile                 # Production image (Nginx + Alpine)
├── nginx.conf                 # Example nginx config
├── nginx.docker.conf          # Example nginx config for docker
├── entrypoint.sh              # Container entrypoint (copied from repo root by CI)
├── variable_replacement.sh    # envsubst script (copied from repo root by CI)
└── DEPLOYMENT.md              # This file
```
