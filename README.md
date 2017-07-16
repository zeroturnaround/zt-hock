# zt-hock [![Build Status](https://travis-ci.org/zeroturnaround/zt-hock.svg?branch=master)](https://travis-ci.org/zeroturnaround/zt-hock) [![Coverage Status](https://coveralls.io/repos/github/zeroturnaround/zt-hock/badge.svg?branch=master)](https://coveralls.io/github/zeroturnaround/zt-hock?branch=master)

An HTTP mocking server forked from [Hock](https://github.com/mmalecki/hock), which itself is based on
a project called [Nock](https://github.com/flatiron/nock).

## Why fork

We use hock for several projects, but lacked a couple of features and configurations options. The project looked like it was dead (no comments and merged PRs for more than half a year). As a result, we decided to fork the project, re-write it, and add our missing features.

## Difference with hock

At a glance:

- Modern code base, written in ES6
- delay() API
- Object comparison for bodies tries to compare first using deep-equals, then falls back to stringify
- Option to turn off throwing errors for unprocessed requests in the assertion queue
- ... we await your feature requests!

## WIP: Readme
