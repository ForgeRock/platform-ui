# Building IDM Enduser Package

This guide covers building the `idm-enduser` package locally and via Jenkins.

## Local Development

### Prerequisites

- Node.js 14.0.0 or newer
- Yarn 3.6.1
- Docker (for containerized builds)

### Quick Start

```bash
# Navigate to the package directory
cd packages/idm-enduser

# Install dependencies
yarn install

# Run development server (with hot-reload)
yarn dev

# Build for production
yarn build

# Run unit tests
yarn unit
```

### Development Server

The development server runs on `http://localhost:8889` (auto-increments if port is in use).

**Configuration**: Edit `.env` file to configure your IDM backend:

```env
VUE_APP_IDM_URL=/openidm
VUE_APP_ADMIN_URL=http://localhost:8080/admin
THEME=default
VUE_APP_ENABLE_SELF_SERVICE=false
```

The dev server proxies `/openidm` requests to `https://localhost:8443/openidm` by default (configurable in `vue.config.js`).

### Production Build

```bash
yarn build
```

This creates:

- `dist/` - Optimized production build
- `COMMITHASH` - Git commit hash
- `VERSION` - Version information

### Docker Build (Local)

```bash
# From packages/idm-enduser directory

# Build the application
yarn build

# Build Docker image
docker build -t idm-enduser:local .

# Run the container
docker run -p 8080:8080 idm-enduser:local
```

Access the application at `http://localhost:8080`

### Testing Against Standalone IDM

1. **Start your IDM instance** (e.g., on `https://localhost:8443`)

2. **Configure the proxy** in `vue.config.js`:

   ```javascript
   proxy: {
     '/openidm': {
       target: 'https://localhost:8443/openidm',  // Your IDM URL
       pathRewrite: { '^/openidm': '' },
       changeOrigin: true,
     },
   }
   ```

3. **Run the dev server**:

   ```bash
   yarn dev
   ```

4. **Access the UI** at `http://localhost:8889`

### Environment Variables

Set these before building:

```bash
# Build number (defaults to git commit)
export VUE_APP_BUILD_NUMBER="custom-build-123"

# Version (defaults to package version)
export VUE_APP_VERSION="1.0.0"

# Enable self-service features (for IDM 7.5.x and below)
export VUE_APP_ENABLE_SELF_SERVICE=true

# Build
yarn build
```

## Jenkins Pipeline

### Independent Pipeline

The idm-enduser package has its own independent Jenkins pipeline that builds **only** this package.

**Pipeline Location**: `jenkins-scripts/pipelines/idm-enduser/Jenkinsfile`

### Setting Up Jenkins Job

1. Create a **Multibranch Pipeline** job in Jenkins
2. Name: `platform-ui-idm-enduser`
3. Branch Sources: Configure your Git repository
4. Build Configuration:
   - Mode: `by Jenkinsfile`
   - Script Path: `jenkins-scripts/pipelines/idm-enduser/Jenkinsfile`

### What the Pipeline Does

**For Pull Requests**:

- Installs dependencies
- Runs unit tests (linting is included via Jest's eslint runner)
- Builds the application
- Creates Docker image with SHA1 tag
- Pushes to `gcr.io/forgerock-io/idm-enduser-ui/pull-requests:<sha1>`

**For Commits to master/sustaining/release branches**:

- All of the above, plus:
- Creates multiple Docker tags (SHA1, postcommit-latest, latest)
- Pushes to `gcr.io/forgerock-io/idm-enduser-ui/docker-build:<tag>`
- Archives build artifacts

> **Note**: Linting is automatically performed as part of the unit test suite via `jest-runner-eslint` configured at the repository root level.

### Triggering a Build

**Manual**:

1. Go to Jenkins job
2. Click "Scan Multibranch Pipeline Now"
3. Or select a branch and click "Build Now"

**Automatic**:

- Configure Git webhooks to trigger on push/PR

### Docker Images

Images are available at:

```
# For PRs
gcr.io/forgerock-io/idm-enduser-ui/pull-requests:8.0.0-SNAPSHOT-<sha1>

# For commits
gcr.io/forgerock-io/idm-enduser-ui/docker-build:8.0.0-SNAPSHOT-<sha1>
gcr.io/forgerock-io/idm-enduser-ui/docker-build:8.0.0-SNAPSHOT-postcommit-latest
gcr.io/forgerock-io/idm-enduser-ui/docker-build:latest
```

### Deploying Built Images

Pull and run a Jenkins-built image:

```bash
# Authenticate with GCR
gcloud auth configure-docker

# Pull the image
docker pull gcr.io/forgerock-io/idm-enduser-ui/docker-build:latest

# Run it
docker run -p 8080:8080 gcr.io/forgerock-io/idm-enduser-ui/docker-build:latest
```

## Customization

### Theming

Set the `THEME` environment variable before building:

```bash
THEME=custom-theme yarn build
```

Theme files should be in `@forgerock/platform-shared/src/scss/`.

### Self-Service Features

Enable self-service (for IDM 7.5.x and below):

```bash
VUE_APP_ENABLE_SELF_SERVICE=true yarn build
```

## Troubleshooting

### Port 8889 Already in Use

The dev server auto-increments to 8890, 8891, etc.

### Proxy Connection Refused

- Ensure your IDM instance is running
- Check the proxy configuration in `vue.config.js`
- Verify SSL certificates if using HTTPS

### Build Fails

- Clear node_modules: `rm -rf node_modules && yarn install`
- Clear yarn cache: `yarn cache clean`
- Check Node.js version: `node --version` (should be 14.0.0+)

### Docker Build Fails

- Ensure you've run `yarn build` first
- Check that `dist/` directory exists and contains files

## Additional Resources

- [Main README](./README.md) - General information about the package
- [Jenkins Pipeline README](../../jenkins-scripts/pipelines/idm-enduser/README.md) - Detailed pipeline documentation
- [ForgeRock IDM Documentation](https://docs.pingidentity.com/pingidm/7.5/)
