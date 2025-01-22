.PHONY: image

IMAGE_NAME = appflowy-web-app
IMAGE_TAG = latest

build:
	pnpm install
	pnpm run build

image:
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) -f deploy/selfhost.Dockerfile .
