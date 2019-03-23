# camunda-toggl

Easily create time entries for camunda work on [toggl](https://toggl.com). It works as a cli command.

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