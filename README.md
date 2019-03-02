# scss-onsave
Atom package to run the scss command when you save a `.scss` or `.sass` file.

## Dependencies
* Sass command.
To install this dependency, execute `npm install -g sass`
For more information, please visit: https://sass-lang.com/install

### Update 0.3.0 ###

Since version 0.3, the module uses to compile the command installed with npm.
For compatibility reasons, we have left the operation with "Sass Ruby gem" by default.
**Please specify the parameter `useNpmSass` to `true` if you use the npm command.**

## Installation

Use atom package manager to install scss-onsave.

`apm install scss-onsave`

## Configuration file

You need to create a configuration file named `.scss-onsave.json` at the root of the project.

The content of the `.scss-onsave.json` file must be an array of objects with the following properties:

* `inputDir`: The source directory. The path is relative to `.scss-onsave.json`.
* `outputDir`: The destination directory. The path is relative to `.scss-onsave.json`.
* `useNpmSass` _(default to `false`)_: This setting allows users with Rugy-sass installed to continue using this package. **Set to `true` in the case of an installation with NPM.**
* `style` _(default to `"compressed"`)_: Sets the style of the CSS output. The value must be: `expanded`, `compressed`.
* `sourcemap` _(default to `"none"`)_: Controls how sourcemaps are generated. The value must be: `none`, `relative`, `absolute`.
* `showStartup` _(default to `false`)_: A boolean indicating whether a notification at startup of compilation should be displayed or not.
* `showOutput` _(default to `false`)_: A boolean indicating whether the output stream should be displayed or not.
* `showError` _(default to `true`)_: A boolean indicating whether the error stream should be displayed or not.

### Example ###

Here is an example of a configuration file.

```
{
	"inputDir": "resources/scss/",
	"outputDir": "public/css/",
	"useNpmSass": true,
	"style":"compressed",
	"sourcemap":"none",
	"showStartup":false,
	"showOutput":false,
	"showError":true
}
```

### Minify JS ###

You can use the [js-onsave](https://atom.io/packages/js-onsave) package that works the same way for Javascript files.
