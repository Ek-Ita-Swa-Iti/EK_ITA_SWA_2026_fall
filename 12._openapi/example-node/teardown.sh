#!/usr/bin/env bash
# Delete everything deploy.sh created: the whole resource group (VM, disk, IP, NSG, VNet).
#
#   ./teardown.sh          # asks before deleting
#   ./teardown.sh -y       # no question
set -euo pipefail

RESOURCE_GROUP="${RESOURCE_GROUP:-rg-swa-notes-openapi}"

if [ "$(az group exists --name "$RESOURCE_GROUP")" != "true" ]; then
  echo "Resource group $RESOURCE_GROUP findes ikke, intet at slette."
  exit 0
fi

if [ "${1:-}" != "-y" ]; then
  read -r -p "Slet resource group $RESOURCE_GROUP og alt i den? [y/N] " answer
  [[ "$answer" =~ ^[yY]$ ]] || { echo "Afbrudt."; exit 1; }
fi

echo "==> Sletter $RESOURCE_GROUP (tager et par minutter)"
az group delete --name "$RESOURCE_GROUP" --yes
rm -f "$HOME/.ssh/known_hosts_azure_notes"
echo "Slettet."
