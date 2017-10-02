# latest-node

HTTP redirecting service for fetching NodeJS installation package matching filter


## About

Automatic installation of NodeJS always fails due to one of two reasons:

* On using some version manager such as [n](https://www.npmjs.com/package/n) there are some pre-requisites to be met such as having a running NodeJS environment.
* Automatically getting URL of latest available release package matching your operating system isn't well supported by nodejs.org website.

Since I wanted to set up static NodeJS in a docker image without requiring to fetch all dependencies as declared by either distribution I've created this package providing HTTP service taking requests including some filter to be applied on choosing best matching NodeJS installation package and redirect to that one's download archive so fetching the right package is as simple as using `curl`.

Well I might have been using [nvm](https://github.com/creationix/nvm) instead. But on my behalf, that perception was a little bit late. ;)

## Installation

```
npm i -D latest-node
```

## Running Service

On Linux invoke with:

```
PORT=3000 npm start
```

On Windows try:

```
set PORT=3000 && npm start
```

The whole service makes sense when installed in a persistently available location, only. Thus you might want to expose it on a public server or on a server in your intranet. Instead of using browser use of `curl` may be preferred for automatically downloading installation packages. For the sake of demonstration this documentation expects service to run on local host just like in case of starting it as given before.

## Using Service

Try fetching this URL in your browser:

```
http://127.0.0.1:3000/test/stable
```

This will display URL for downloading some package of latest stable release of NodeJS.

Now omit the `/test` part of path and you will be redirected this time for actually downloading that package.

```
http://127.0.0.1:3000/stable
```

## URL Format

The service is responding to any incoming URL trying to parse segments of requested path as values used to filter selected NodeJS package. You can filter by 

* **channel** or **major version**
   * `4` ... `31` for current release of selected major version
   * `lts` for current LTS release,
   * `stable` for current stable release,
   * `latest` for current release of latest major version
* **operating system**
   * `ms`, `win`, `windows` or `win32` for MS Windows
   * `linux` or `gnu` for GNU/Linux
   * `macos`, `macosx` or `darwin` for MacOS X
   * `aix` for IBM AIX
   * `solaris`, `sun` or `sunos` for Sun Solaris
* **platform**
   * `64`, `x64` or `amd64` for x64
   * `32` or `x86` for x86
   * `arm`, `armv7` or `arm7` for ARM v7
   * `armv6` or `arm6` for ARM v6
   * `arm64` for ARM 64-bit
   * `ppc64`, `ppc64le` or `s390x` for the according platform
* **archive format**
   * `tar`, `gz` or `tar.gz` for GZipped tar archive
   * `xz` or `tar.xz` for the smaller XZipped tar archive
   * `7zip` or `7z` for the 7Zip archive
   * `zip`, `msi` or `pkg` for the accordingly formatted archive

As an example

```
http://127.0.0.1:3000/stable/win/32/msi
```

will redirect to the current stable release for Windows 32-Bit including installer.

The service doesn't require all segments to obey some order, but due to processing segments from left to right lately processed values might replace previous ones of same category as listed before.

```
http://127.0.0.1:3000/stable/latest
```

will fetch recent-most release of `latest` channel which is highest major version currently available for download.

Some filter values have defaults:

* The channel defaults to `lts`.
* The mode defaults to `fetch` (as this is considered the opposite of `test` shown before).

All other filters are unset and thus 

```
http://127.0.0.1:3000/
```

would fetch any version of current LTS release.
