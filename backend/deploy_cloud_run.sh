#!/usr/bin/env bash
set -euo pipefail

# =========================
# Config (edit if needed)
# =========================
PROJECT_ID="${PROJECT_ID:-acorn-survey}"
REGION="${REGION:-australia-southeast1}"

SERVICE_NAME="${SERVICE_NAME:-survey-backend}"
REPO_NAME="${REPO_NAME:-survey-repo}"
IMAGE_NAME="${IMAGE_NAME:-survey-backend}"

# Your GCS bucket for uploads
GCS_BUCKET="${GCS_BUCKET:-acorn-survey-uploads}"

# Cloud Run runtime service account
RUN_SA_NAME="${RUN_SA_NAME:-survey-runner}"
RUN_SA_EMAIL="${RUN_SA_EMAIL:-${RUN_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com}"

# Uvicorn app path (must match your project)
UVICORN_APP="${UVICORN_APP:-app.main:app}"

# Optional env vars for app (add more as needed)
ENVIRONMENT="${ENVIRONMENT:-production}"
JWT_SECRET="${JWT_SECRET:-}"
DATABASE_URL="${DATABASE_URL:-}"

# If you want public access, keep true. Otherwise set ALLOW_UNAUTH=false and add IAM later.
ALLOW_UNAUTH="${ALLOW_UNAUTH:-true}"

# =========================
# Helpers
# =========================
log() { echo -e "\n\033[1;32m==>\033[0m $*"; }
warn() { echo -e "\n\033[1;33m[WARN]\033[0m $*"; }
die() { echo -e "\n\033[1;31m[ERR]\033[0m $*"; exit 1; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing command: $1"
}

# =========================
# Preconditions
# =========================
need_cmd gcloud

if [[ ! -f "Dockerfile" ]]; then
  warn "Dockerfile not found in current dir: $(pwd)"
  warn "This script expects to run inside your backend/ directory."
fi

# =========================
# Main
# =========================
log "Setting gcloud project/region"
gcloud config set project "$PROJECT_ID" >/dev/null
gcloud config set run/region "$REGION" >/dev/null

log "Enabling required Google APIs"
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com >/dev/null

log "Ensuring Artifact Registry repo exists: $REPO_NAME"
if ! gcloud artifacts repositories describe "$REPO_NAME" \
  --location "$REGION" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$REPO_NAME" \
    --repository-format=docker \
    --location="$REGION" >/dev/null
else
  echo "Repo already exists."
fi

log "Configuring Docker auth for Artifact Registry"
gcloud auth configure-docker "${REGION}-docker.pkg.dev" -q >/dev/null || true

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}:latest"

log "Building & pushing image with Cloud Build: $IMAGE_URI"
gcloud builds submit --tag "$IMAGE_URI"

log "Ensuring Cloud Run service account exists: $RUN_SA_NAME"
if ! gcloud iam service-accounts describe "$RUN_SA_EMAIL" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$RUN_SA_NAME" >/dev/null
else
  echo "Service account already exists."
fi

log "Granting GCS bucket permissions to Cloud Run service account"
# Needs gcloud storage (new) command. If you don't have it, update gcloud.
if gcloud storage buckets describe "gs://${GCS_BUCKET}" >/dev/null 2>&1; then
  gcloud storage buckets add-iam-policy-binding "gs://${GCS_BUCKET}" \
    --member="serviceAccount:${RUN_SA_EMAIL}" \
    --role="roles/storage.objectAdmin" >/dev/null
else
  warn "Bucket gs://${GCS_BUCKET} not found or no access. Skipping IAM binding."
  warn "Create it or verify name, then rerun."
fi

log "Deploying to Cloud Run: $SERVICE_NAME"
ENV_FLAGS=("ENV=${ENVIRONMENT}" "GCP_PROJECT=${PROJECT_ID}" "GCS_BUCKET=${GCS_BUCKET}")

# Only add optional vars if provided
if [[ -n "$JWT_SECRET" ]]; then ENV_FLAGS+=("JWT_SECRET=${JWT_SECRET}"); fi
if [[ -n "$DATABASE_URL" ]]; then ENV_FLAGS+=("DATABASE_URL=${DATABASE_URL}"); fi

# Tell container how to start (you can also bake this into Dockerfile CMD)
# We'll pass UVICORN_APP as env and let Dockerfile CMD read it if you want.
ENV_FLAGS+=("UVICORN_APP=${UVICORN_APP}")

# Join env flags with comma
ENV_JOINED="$(IFS=, ; echo "${ENV_FLAGS[*]}")"

DEPLOY_ARGS=(
  run deploy "$SERVICE_NAME"
  --image "$IMAGE_URI"
  --service-account "$RUN_SA_EMAIL"
  --set-env-vars "$ENV_JOINED"
)

if [[ "$ALLOW_UNAUTH" == "true" ]]; then
  DEPLOY_ARGS+=(--allow-unauthenticated)
else
  DEPLOY_ARGS+=(--no-allow-unauthenticated)
fi

gcloud "${DEPLOY_ARGS[@]}"

log "Done. Service URL:"
gcloud run services describe "$SERVICE_NAME" --format="value(status.url)"
