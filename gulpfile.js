const SRC_DIR = './src';
const BUILD_DIR = './build';

const gulp = require("gulp");
const babel = require("gulp-babel");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const replace = require("gulp-replace");
const terser = require("gulp-terser");
const sync = require("browser-sync");
const autoprefixer = require("gulp-autoprefixer");
const compression = require("compression");

const fs = require("fs");
// Создание базовых директорий
[].forEach.call(
	[
		SRC_DIR,
		BUILD_DIR,

		SRC_DIR + "/sass",
		SRC_DIR + "/script",
		SRC_DIR + "/images",
		BUILD_DIR + "/assets",
		BUILD_DIR + "/assets/css",
		BUILD_DIR + "/assets/js",
		BUILD_DIR + "/assets/images",
	],
	(dir) => {
		try {
			fs.statSync(dir);
		} catch (err) {
			if (err.code === "ENOENT") {
				fs.mkdirSync(dir);
			}
		}
	}
);
// Создание базовых файлов
[].forEach.call(
	[
		SRC_DIR + "/script/index.js", 
		SRC_DIR + "/sass/index.scss"
	],
	(file) => {
		try {
			fs.statSync(file);
		} catch (err) {
			if (err.code === "ENOENT") {
				fs.writeFile(file, "", (err) => {});
			}
		}
	}
);

//Обработка html
const html = () => {
	return gulp
		.src(SRC_DIR + "/*.html")
		.pipe(gulp.dest(BUILD_DIR))
		.pipe(sync.stream());
};

exports.html = html;

// Обработка стилей
const styles = () => {
	return gulp
		.src(SRC_DIR + "/sass/index.scss")
		.pipe(sourcemaps.init())
		.pipe(
			sass({
				allowEmpty: true,
				compress: true,
			})
		)
		.pipe(replace(/\.\.\/\.\.\//g, "../"))
		.pipe(
			autoprefixer({
				cascade: true,
			})
		)
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(BUILD_DIR + "/assets/css"))
		.pipe(sync.stream());
};

exports.styles = styles;


//Настрока локального сервера
const server = () => {
	sync.init({
		ui: false,
		notify: false,
		server: {
			baseDir: BUILD_DIR,
		},
		middleware: [compression()],
	});
};

exports.server = server;

// Обработка JS
const scripts = () => {
	return gulp
		.src(SRC_DIR + "/script/index.js")
		.pipe(
			babel({
				presets: ["@babel/preset-env"],
			})
		)
		.pipe(terser())
		.pipe(gulp.dest(BUILD_DIR + "/assets/js"))
		.pipe(sync.stream());
};

exports.scripts = scripts;

// Копирование файлов
const copy = () => {
	return gulp
		.src([SRC_DIR + "/images/**/*"], {
			base: SRC_DIR,
		})
		.pipe(gulp.dest(BUILD_DIR + "/assets"))
		.pipe(
			sync.stream({
				once: true,
			})
		);
};
exports.copy = copy;

// Правка путей
const paths = () => {
	return gulp
		.src(BUILD_DIR + "/*.html")
		.pipe(replace(/"sass\/([^\.]+)\.scss/, '"./assets/css/$1.css'))
		.pipe(replace('href="../build', 'href=".'))
		.pipe(
			replace(/(<script src=")(script)\/(index.js">)/, "$1./assets/js/$3")
		)
		.pipe(replace('src="../build', 'src=".'))
		// .pipe(replace("upload/", "./assets/images/upload/"))
		.pipe(replace('"images/', '"./assets/images/'))
		.pipe(gulp.dest(BUILD_DIR));
};

exports.paths = paths;



// Watch
const watch = () => {
	gulp.watch(SRC_DIR + "/*.html", gulp.series(html, paths));
	gulp.watch(SRC_DIR + "/sass/**/*.scss", gulp.series(styles));
	gulp.watch(SRC_DIR + "/script/**/*.js", gulp.series(scripts));
	gulp.watch([SRC_DIR + "/images/**/*"], gulp.series(copy));
};

exports.watch = watch;



exports.default = gulp.series(
	gulp.parallel(html, styles, scripts, copy),
	paths,
	gulp.parallel(watch, server)
);


