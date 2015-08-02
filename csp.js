var Hapi = require('hapi');
var Path = require('path');
var host = (process.argv[2]) ? process.argv[2] : 'localhost';
var port = (process.argv[3]) ? process.argv[3] : '8123';
var cspUrl = (process.argv[4]) ? process.argv[4] : 'http://localhost:8000/csp-report';
var querystring = require('querystring');
var handlebars = require('handlebars');

var baseDirective = "'self' https:";

var directivesNames = [
  'default-src',
  'child-src',
  'connect-src',
  'font-src',
  'img-src',
  'media-src',
  'object-src',
  'script-src',
  'style-src',
  'form-action'
];

var directiveString = directivesNames.join(' ' + baseDirective + '; ');
directiveString += ' ' + baseDirective + "; frame-ancestors 'none'; plugin-types 'none';";

var server = new Hapi.Server();
server.connection({
  host: host,
  port: port
});

server.views({
    engines: {
        html: require('handlebars')
    },
    path: Path.join(__dirname, 'templates')
});

// Add the route
server.route({
  method: 'GET',
  path:'/csp',
  config: {
    handler: function (request, reply) {
      var getVars = querystring.stringify(request.query);
      var url = (getVars !== '') ? cspUrl + '?' + getVars : cspUrl;

      console.log(          directiveString + ' report-uri ' + url
);

      reply
        .view('csp')
        .header(
          'Content-Security-Policy',
          directiveString + ' report-uri ' + url
        )
        .header(
          'X-Content-Security-Policy',
          directiveString + ' report-uri ' + url
        )
        .header(
          'X-Webkit-CSP',
          directiveString + ' report-uri ' + url
        );
    }
  }
});

// Start the server
server.start();
