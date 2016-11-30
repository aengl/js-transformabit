build:
	tsc

setup:
	npm install
	npm install -g typescript

clean:
	rm -rf dist

test: clean build
	npm test
