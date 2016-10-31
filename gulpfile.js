var path = require("path");
var fs = require("fs");

var gulp = require('gulp');
var sass = require('gulp-sass');

var frontMatter = require('gulp-front-matter');
var marked = require('gulp-marked');
var swig = require('swig');
var rename = require('gulp-rename');
var through = require('through2');

var clean = require('gulp-clean');
var runSequence = require('run-sequence');

var connect = require('connect');
var http = require('http');

var config = {
  build: 'build',
  assets: 'assets/**/*',
  styles: './styles/index.scss',
  sass: './styles/**/*.scss',
  index: './src/views/index.html',
  posts: {
    markdown: './src/posts/**.md',
    template: './src/views/post.html',
    build: './build/blog'
  }
};

var site = {
  URL: "http://mej.fi/",
  blogPath: 'blog/',
  posts: []
};

var cssContents = "";

// Assets: copy files
//===========================================

gulp.task('assets', function () {
  return gulp.src(config.assets)
    .pipe(gulp.dest(path.join(config.build, '/')));
});

//  Sass: compile sass to css task - uses Libsass
//===========================================

function cssContentsAssign() {
  return through.obj(function (file, enc, cb) {
    cssContents = file.contents.toString();
    this.push(file);
    cb();
  });
};

gulp.task('sass', function() {
  return gulp.src(config.styles)
    .pipe(
      sass({
        outputStyle: 'compressed'
      })
      .on('error', sass.logError))
    .pipe(cssContentsAssign());
});

//  Pages: Markdown content
//===========================================

function linkData() {
  return through.obj(function (file, enc, cb) {
    file.page.path = path.basename(file.path, '.md');
    file.page.identifier = "blog-" + file.page.path;
    this.push(file);
    cb();
  });
};

function applyTemplate(templateFile) {
  var template = swig.compileFile(path.join(__dirname, templateFile));

  return through.obj(function (file, enc, cb) {
    var data = {
      site: site,
      css: cssContents,
      page: file.page,
      contents: file.contents.toString()
    };

    file.contents = new Buffer(template(data), 'utf8');

    this.push(file);
    cb();
  });
};

function collectPosts() {
  var posts = [];
  return through.obj(function (file, enc, cb) {
    posts.push(file.page);

    this.push(file);
    cb();
  },
  function (cb) {
    posts.sort(function (a, b) {
      return b.date - a.date;
    });

    site.posts = posts;

    cb();
  });
}

gulp.task('posts', ['sass'], function () {
  return gulp.src([config.posts.markdown])
    .pipe(frontMatter({property: 'page', remove: true}))
    .pipe(marked())
    .pipe(linkData())
    .pipe(collectPosts())
    .pipe(applyTemplate(config.posts.template))
    .pipe(rename(function (path) {
      path.extname = ".html";
      path.dirname = path.basename;
      path.basename = 'index';
    }))
    .pipe(gulp.dest(config.posts.build));
});

// Main page
//===========================================

function indexData() {
  return through.obj(function (file, enc, cb) {
    console.log(file);
    file.page = {}
    this.push(file);
    cb();
  });
};

gulp.task('index', ['posts'], function () {
  return gulp.src(config.index)
    .pipe(applyTemplate(config.index))
    .pipe(indexData())
    .pipe(gulp.dest(config.build));
});

//  Gulp Tasks (commmands)
//===========================================

gulp.task('default', ['assets', 'build']);

gulp.task('build', function(callback) {
  runSequence(
    'sass',
    'posts',
    'index',
    callback
  );
});

gulp.task('clean', function() {
  return gulp.src(config.build, {read: false})
    .pipe(clean());
});

gulp.task('watch', ['default'], function () {
  gulp.watch([config.assets], ['assets']);
  gulp.watch([config.sass], ['build']);
  gulp.watch([config.posts.template, config.posts.markdown], ['index']);
  gulp.watch([config.index], ['index']);

  var app = connect()
    .use(connect.static(config.build))
    .use(connect.directory(config.build));

  http.createServer(app).listen(3000);
});
