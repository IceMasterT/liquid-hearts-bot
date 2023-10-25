
# build docker image
gcloud builds submit  --tag us-central1-docker.pkg.dev/hellbenders-public/saddlebagsbot/docker-image . --project hellbenders-public

gcloud compute instance-groups managed rolling-action start-update saddlebags-bot-mig --version=template=saddlebags-bot-template --zone=us-central1-c --type=proactive
