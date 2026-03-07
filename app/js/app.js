// Declare app level module which depends on filters, and services
var forgeApp = angular.module('forgeApp', [
    'ngRoute',
    'ui.bootstrap',
    'array.services',
    'forge.controllers',
    'forge.directives',
    'forge.file',
    'forge.icon',
    'forge.map',
    'forge.string',
    'forge.fileloc',
    'forge.set',
    'forge.spawn'
])

forgeApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/files', {
            templateUrl: 'modules/file/partials/files.html',
            controller: 'FilesCtrl'
        });
        $routeProvider.when('/strings', {
            templateUrl: 'modules/string/partials/string-list.html',
            controller: 'StringListCtrl'
        });
        $routeProvider.when('/maps', {
            reloadOnSearch: false,
            templateUrl: 'modules/map/partials/map-list.html',
            controller: 'MapListCtrl'
        });
        $routeProvider.when('/icons', {
            templateUrl: 'modules/icon/partials/icon-list.html',
            controller: 'IconListCtrl'
        });
        $routeProvider.when('/filelocs', {
            templateUrl: 'modules/fileloc/partials/fileloc-list.html',
            controller: 'FileLocListCtrl'
        });
        $routeProvider.when('/sets', {
            reloadOnSearch: false,
            templateUrl: 'modules/set/partials/set-list.html',
            controller: 'SetListCtrl'
        });
        $routeProvider.when('/spawns', {
            templateUrl: 'modules/spawn/partials/extract-spawns.html',
            controller: 'ExtractSpawnsCtrl'
        });
        $routeProvider.otherwise({
            redirectTo: '/files'
        });
    }
]);
