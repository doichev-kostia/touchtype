css:
	@bun x @tailwindcss/cli -i ./static/tailwind.css -o ./static/styles.css
watch:
	@bun x @tailwindcss/cli -i ./static/tailwind.css -o ./static/styles.css --watch

build:
	@bun install --frozen-lockfile
	@make css

dev:
	@bun x wrangler dev

deploy:
	@bun x wrangler deploy

.PHONY: css watch build
