build:
	./install-typings.sh
	tsc

setup:
	npm install
	npm install -g typescript@2.1.1

clean:
	rm -rf dist

test: clean build
	npm test
