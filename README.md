# YASSGen

YASSGen is Yet Another Static Site Generator

## Features

- Copies assets to the build folder
- Generates the blog with normal template and AMP template
- Builds SASS to CSS and includes the CSS in the HTML files
- Parses metadata from Markdown files
- Converts Markdown to HTML and includes it in the HTML files
- Generates the navigation to the main page
- Automatically watches changes and updates the build accordingly

## Installing

1. Install [Node](http://nodejs.org/)
2. Install gulp.js client and development dependencies of the build tool by running these commands in this project's directory:

```sh
    npm install -g gulp-cli
    npm install
```

## Directory structure

The default directory structure that the build tool uses:

    assets/
      *.html
      *.png
      *.js
    build/
      <build result>
    src/
      posts/
        *.md
      views/
        index.html
        *.html
    styles/
      index.scss
      *.scss
    gulpfile.js
    package.json

This is easy to change by modifying the config object from gulpfile.js.

## Building

Here are the main commands to use when building the website. More can be found from gulpfile.js.

```sh
    gulp          - runs the default build command
    gulp clean    - removes the build folder
    gulp watch    - runs a webserver for static content on http://localhost:3000
```
