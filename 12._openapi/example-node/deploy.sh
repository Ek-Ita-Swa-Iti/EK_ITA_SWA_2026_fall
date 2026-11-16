#!/usr/bin/env bash
# Deploy notes-service (backend + mongo + swagger-ui) to a fresh Azure VM.
# Everything lives in its own resource group, so teardown.sh can delete it in one go.
#
#   ./deploy.sh            # create VM (if missing), copy code, docker compose up
#   ./teardown.sh          # delete everything again
#
# Override defaults with env vars, e.g.  LOCATION=westeurope ./deploy.sh
set -euo pipefail

RESOURCE_GROUP="${RESOURCE_GROUP:-rg-swa-notes-openapi}"
LOCATION="${LOCATION:-swedencentral}"
VM_NAME="${VM_NAME:-vm-notes}"
VM_SIZE="${VM_SIZE:-Standard_B2s}"
VM_USER="${VM_USER:-azureuser}"
IMAGE="${IMAGE:-Ubuntu2404}"
REMOTE_DIR="/home/$VM_USER/example-node"

cd "$(dirname "$0")"
command -v az >/dev/null || { echo "Azure CLI (az) mangler"; exit 1; }
az account show >/dev/null 2>&1 || { echo "Log ind først: az login"; exit 1; }

echo "==> Resource group $RESOURCE_GROUP ($LOCATION)"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" -o none

if ! az vm show -g "$RESOURCE_GROUP" -n "$VM_NAME" -o none 2>/dev/null; then
  echo "==> Opretter VM $VM_NAME ($VM_SIZE, $IMAGE)"
  az vm create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$VM_NAME" \
    --image "$IMAGE" \
    --size "$VM_SIZE" \
    --admin-username "$VM_USER" \
    --generate-ssh-keys \
    --public-ip-sku Standard \
    -o none

  echo "==> Åbner port 3000 (API) og 8081 (Swagger UI)"
  az vm open-port -g "$RESOURCE_GROUP" -n "$VM_NAME" --port 3000,8081 --priority 1010 -o none
else
  echo "==> VM $VM_NAME findes allerede, genbruger den"
fi

IP=$(az vm show -d -g "$RESOURCE_GROUP" -n "$VM_NAME" --query publicIps -o tsv)
SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o UserKnownHostsFile="$HOME/.ssh/known_hosts_azure_notes")
echo "==> VM'ens IP: $IP"

echo "==> Venter på SSH"
for _ in $(seq 1 30); do
  ssh "${SSH_OPTS[@]}" -o ConnectTimeout=5 "$VM_USER@$IP" true 2>/dev/null && break
  sleep 5
done

echo "==> Installerer Docker (hvis det mangler)"
ssh "${SSH_OPTS[@]}" "$VM_USER@$IP" '
  if ! command -v docker >/dev/null; then
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker $USER
  fi'

echo "==> Kopierer koden til VM'en"
tar --exclude=node_modules --exclude=.DS_Store --exclude='*.sh' -czf - backend spec docker-compose.yml \
  | ssh "${SSH_OPTS[@]}" "$VM_USER@$IP" "rm -rf $REMOTE_DIR && mkdir -p $REMOTE_DIR && tar -xzf - -C $REMOTE_DIR"

# Swagger UI's "Try it out" runs in the browser, so "localhost:3000" in the spec
# would point at the student's own laptop. Put the VM's address first in the
# copy on the VM only — the spec in the repo stays unchanged.
ssh "${SSH_OPTS[@]}" "$VM_USER@$IP" \
  "sed -i 's|\"servers\": \[{ \"url\": \"http://localhost:3000\" }\]|\"servers\": [{ \"url\": \"http://$IP:3000\" }, { \"url\": \"http://localhost:3000\" }]|' $REMOTE_DIR/spec/swagger.json"

echo "==> docker compose up"
ssh "${SSH_OPTS[@]}" "$VM_USER@$IP" "cd $REMOTE_DIR && sudo docker compose up -d --build"

echo "==> Venter på API'et"
for _ in $(seq 1 30); do
  curl -fs "http://$IP:3000/v1/notes" >/dev/null 2>&1 && break
  sleep 3
done

cat <<EOF

Færdig.
  API:        http://$IP:3000/v1/notes
  Swagger UI: http://$IP:8081
  SSH:        ssh $VM_USER@$IP

Kør ./deploy.sh igen for at sende ny kode op, og ./teardown.sh for at slette det hele.
EOF
