# Forge - game client file editor

This project aides in editing several game client files for Five Clans Online.


## Getting Started

To get you started you can simply clone the angular-seed repository and install the dependencies:

## Directory Layout

    app/                 --> all of the files to be used in production
	  bower_components	   --> third-party dependencies
      css/                 --> css files
		app.css              --> default stylesheet
		game-icons.css       --> game icons spritesheet stylesheet
      img/                 --> image files
		favicon.ico          --> favicon for browser
		forge.png            --> forge logo
		forge-inverse.png    --> lighter forge logo
		iconsheet1.png       --> spritesheet of game icons
		iconsheet2.png       --> spritesheet of game icons
		iconsheet3.png       --> spritesheet of game icons
      index.html           --> app layout file (the main html template file of the app)
      js/                  --> javascript files
		app.js               --> application
		controllers.js       --> application controllers
		directives.js        --> application directives
		array.services.js    --> additional array functions
      modules/             --> application modules
		file/                --> importing/exporting game files
		  js/                  --> javascript files
		  partials/            --> html partial files
		fileloc/             --> handles fileloc.dir
		  js/                  --> javascript files
		  partials/            --> html partial files
		icon/                --> handles iconsheets
		  js/                  --> javascript files
		  partials/            --> html partial files
		map/                 --> handles map.bin
		  js/                  --> javascript files
		  partials/            --> html partial files
		set/                 --> handles setitem.bin
		  js/                  --> javascript files
		  partials/            --> html partial files
		string/              --> handles string.bin
		  js/                  --> javascript files
		  partials/            --> html partial files

## Serving the Application Files

While angular is client-side-only technology and it's possible to create angular webapps that
don't require a backend server at all, we recommend serving the project files using a local
webserver during development to avoid issues with security restrictions (sandbox) in browsers. The
sandbox implementation varies between browsers, but quite often prevents things like cookies, xhr,
etc to function properly when an html page is opened via `file://` scheme instead of `http://`.


### Running the App during Development

The project comes preconfigured with a local development webserver.  It is a [node.js]
tool called [http-server][http-server].  You can start this webserver with `npm start` but you may choose to
install the tool globally:

```
sudo npm install -g http-server
```

Then you can start your own development web server to serve static files from a folder by
running:

```
http-server
```

Alternatively, you can choose to configure your own webserver, such as apache or nginx. Just
configure your server to serve the files under the `app/` directory.


### Running the App in Production

All you need in production are all the files under the `app/` directory.
Everything else should be omitted.

## Contact

support@fiveclans.com

[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node.js]: http://nodejs.org
[protractor]: https://github.com/angular/protractor
[jasmine]: http://pivotal.github.com/jasmine/
[karma]: http://karma-runner.github.io
[travis]: https://travis-ci.org/
[http-server]: https://github.com/nodeapps/http-server