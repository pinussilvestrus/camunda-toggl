# camunda-toggl

Easily create time entries for camunda work on [toggl](https://toggl.com). It works as a cli command.

![Build Status](https://github.com/pinussilvestrus/camunda-toggl/workflows/ci/badge.svg) ![Version](https://img.shields.io/npm/v/camunda-toggl.svg)

## Install

```sh
$ npm i -g camunda-toggl
```

## Usage

Export your personal toggl API token

```sh
$ export TOGGL_API_TOKEN=foo
```

Execute cli tool

```sh
$ camunda-toggl -d 'did some stuff' -s '08:00AM' -e '04:00PM'
```

## Help

```sh
$ camunda-toggl -h
```

## Releasing

We use [`np`](https://github.com/sindresorhus/np) for releasing new versions

```sh
$ npm i -g np
$ np
```
