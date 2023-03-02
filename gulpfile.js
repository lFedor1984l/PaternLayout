const project_folder = 'dist';
const source_folder = '#src';

/* Подключение плагинов */
/*================================================================================================*/
const fs = require('fs');
const {src, dest} = require('gulp');
const fileincude = require('gulp-file-include');
const autoprefixer = require('gulp-autoprefixer');
const clean_css = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const del = require('del');
const scss = require('gulp-sass')(require('sass'));
const group_media = require('gulp-group-css-media-queries');
const webp = require('gulp-webp');
const webphtml = require('gulp-webp-html');
const webpcss = require("gulp-webpcss");
const plumber = require('gulp-plumber');
const fonter = require('gulp-fonter');
/*================================================================================================*/


/* Пути к папкам и файлам */
/*================================================================================================*/
const path = {
    build: {
        html: project_folder + '/',
        css: project_folder + '/css/',
        js: project_folder + '/js/',
        img: project_folder + '/img/',
        fonts: project_folder + '/fonts/',
    },
    src: {
        html: [source_folder + '/*.html', '!' + source_folder + '/_**/_*.html'],
        css: source_folder + '/scss/style.scss',
        js: source_folder + '/js/script.js',
        img: source_folder + '/img/**/*.{jpg, png, svg, gif, ico, webp}',
        fonts: source_folder + '/fonts/*.ttf',
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.{jpg, png, svg, gif, ico, webp}',
    },
    clean: './' + project_folder + '/'
}
/*================================================================================================*/

/* Запуск браузера */
/*================================================================================================*/
function browserSync () {
    browsersync.init({
        server: {
            baseDir: './' + project_folder + '/'
        },
        port: 3000,
        notify: false,
    })
}
/*================================================================================================*/

/* Обработка HTML*/
/*================================================================================================*/
function html() {
    return src(path.src.html)
        .pipe(fileincude())
        .pipe(webphtml())                                
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}
/*================================================================================================*/

/* Обработка CSS */
/*================================================================================================*/
function css() {
    return src(path.src.css)
        .pipe(scss({
            outputStyle: 'expanded'
        }))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 versions'],
            cascade: true
        }))                                            
        .pipe(group_media())                            
        .pipe(webpcss())
        .pipe(dest(path.build.css))
        .pipe(clean_css())                             
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}
/*================================================================================================*/

/* Обработка JS */
/*================================================================================================*/
function js() {
    return src(path.src.js)
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}
/*================================================================================================*/

/* Обработка картинок*/
/*================================================================================================*/
function images() {
    return src(path.src.img)
        .pipe(webp({
            quality: 70
        }))
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            interlased: true,
            optimizationLevel: 5
        }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}
/*================================================================================================*/

/* Обработка шрифтов*/
/*================================================================================================*/
function fonts() {
	src(path.src.fonts)
		.pipe(plumber())
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts));
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts))
		.pipe(browsersync.stream());
}

gulp.task('otf2ttf', function() {
	return src([source_folder + '/fonts/*.otf'])
		.pipe(plumber())
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(gulp.dest(source_folder + '/fonts/'));
});

// function fontStyle() {
// 	let file_content = fs.readFileSync(src_folder + '/scss/fonts.scss');
// 	if (file_content == '') {
// 		fs.writeFile(src_folder + '/scss/fonts.scss', '', cb);
// 		fs.readdir(path.build.fonts, function (err, items) {
// 			if (items) {
// 				let c_fontname;
// 				for (var i = 0; i < items.length; i++) {
// 					let fontname = items[i].split('.');
// 					fontname = fontname[0];
// 					if (c_fontname != fontname) {
// 						fs.appendFile(src_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
// 					}
// 					c_fontname = fontname;
// 				}
// 			}
// 		})
// 	}
// 	return src(path.src.html).pipe(browsersync.stream());
// }
// function infofile() {

// }
// function cb() {

// }

/* Обработчик SVG спрайтов*/
/*================================================================================================*/
gulp.task('svgSprite', function() {
    return gulp.src([source_folder + '/iconsprite/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../icons/icons.svg',
                    example: true
                }
            },
        }))
        .pipe(dest(path.build.img))
})

/*Наблюдаьель - реагирует на изменения в файлах*/
/*================================================================================================*/
function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}
/*================================================================================================*/

/* Удаляет предыдущую версию */
/*================================================================================================*/
function clean() {
    return del(path.clean);
}
/*================================================================================================*/


const build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts)/*, fontStyle*/)
const watch = gulp.parallel(build, watchFiles, browserSync);

// exports.fontStyle = fontStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;