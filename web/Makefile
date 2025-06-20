css:
	@bun x @tailwindcss/cli -i ./static/tailwind.css -o ./static/styles.css
watch:
	@bun x @tailwindcss/cli -i ./static/tailwind.css -o ./static/styles.css --watch

build:
	@bun install --frozen-lockfile
	@make css

serve:
	@bun run ./serve.ts

deploy:
	@bun x wrangler deploy

.PHONY: css watch build
