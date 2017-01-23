install: clean
	yarn install

build:
	yarn run build

clean:
	rm -rf dist

test: clean build
	yarn test
