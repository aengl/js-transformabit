build:
	tsc

clean:
	rm -rf dist

test: build
	npm test
