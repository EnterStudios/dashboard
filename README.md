The developer dashboard for [bespoken.tools](https://bespoken.tools/dashboard)

[![Build Status](https://travis-ci.org/bespoken/dashboard.svg?branch=master)](https://travis-ci.org/bespoken/dashboard) [![Coverage Status](https://coveralls.io/repos/github/bespoken/dashboard/badge.svg)](https://coveralls.io/github/bespoken/dashboard) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/be0cf929dced4e16befad6da2c327a4c)](https://www.codacy.com/app/bespoken/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=bespoken/dashboard&amp;utm_campaign=Badge_Grade)

## Installation

### With Bower

```bash
$ bower install bespoken-dashboard
```

## Setup

Place the following CSS dependencies within your `<head>` tag:

```html
<!-- Dashboard Required Dependencies -->
<link rel="stylesheet" href="https://code.getmdl.io/1.2.1/material.grey-red.min.css" />
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
```

and the following script tags before the closing `</body>` tag:

```html
<!-- Dashboard Required Dependencies -->
<script src="https://unpkg.com/react@15.3.2/dist/react.js"></script>
<script src="https://unpkg.com/react-dom@15.3.2/dist/react-dom.js"></script>
<script defer src="https://code.getmdl.io/1.2.1/material.min.js"></script>
<!-- Import the dashboard dependency -->
<script src="/bower/directory/bespoken-dashboard/scripts/dashboard.js"></script>
```

Most importantly, place the dashboard container tag somewhere within your `<body />`.

```html
<!-- This is where the dashboard will be injected -->
<div id="dashboard"></div>
```

## Resources

- Working on the project? Go [here](./docs/developer.md)
- [Deployment](./docs/deployment.md)
- [Roadmap](https://github.com/bespoken/dashboard/milestones)
- [Releases](https://github.com/bespoken/dashboard/releases)
- [Issues](https://github.com/bespoken/dashboard/issues)
