css:
	@bun x @tailwindcss/cli -i ./src/styles.css -o ./build/styles.css
watch:
	@bun x @tailwindcss/cli -i ./src/styles.css -o ./build/styles.css --watch

build:
	@bun install --frozen-lockfile
	@make css

.PHONY: css watch build
