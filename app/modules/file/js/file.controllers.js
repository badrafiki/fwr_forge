var app = angular.module('forge.file.controllers', []);

app.controller('FilesCtrl', function($scope, $http, FileDetector, StringService, MapService, IconService, FileLocService, SetService) {

    // Load the files from the server rather than upload
    $scope.loadLatestFiles = function() {
        //var BUILD = 'development';
        var BUILD = '';

        if (BUILD == 'development') {
            var mapLocation = '../sample-files/map.bin';
            var stringLocation = '../sample-files/string.bin';
            var viconlistLocation = '../sample-files/viconlist.dat';
            var filelocLocation = '../sample-files/fileloc.dir';
            var setitemLocation = '../sample-files/setitem.bin';
        } else {
            var mapLocation = '../../../updater/newFiles/map.bin';
            var stringLocation = '../../../updater/newFiles/string.bin';
            var viconlistLocation = '../../../updater/newFiles/viconlist.dat';
            var filelocLocation = '../../../updater/newFiles/fileloc.dir';
            var setitemLocation = '../../../updater/newFiles/setitem.bin';
        }


        $http.get(mapLocation, {
            responseType: "blob",
			cache: false
        }).success(function(data) {
            var file = new Blob([data], {
                type: "application/octet-stream"
            });
            file.name = "map.bin";
            $scope.import(file);
        });

        $http.get(stringLocation, {
            responseType: "blob",
			cache: false
        }).success(function(data) {
            var file = new Blob([data], {
                type: "application/octet-stream"
            });
            file.name = "string.bin";
            $scope.import(file);
        });

        $http.get(viconlistLocation, {
            responseType: "blob",
			cache: false
        }).success(function(data) {
            var file = new Blob([data], {
                type: "application/octet-stream"
            });
            file.name = "viconlist.dat";
            $scope.import(file);
        });

        $http.get(filelocLocation, {
            responseType: "blob",
			cache: false
        }).success(function(data) {
            var file = new Blob([data], {
                type: "application/octet-stream"
            });
            file.name = "fileloc.dir";
            $scope.import(file);
        });

        $http.get(setitemLocation, {
            responseType: "blob",
			cache: false
        }).success(function(data) {
            var file = new Blob([data], {
                type: "application/octet-stream"
            });
            file.name = "setitem.bin";
            $scope.import(file);
        });
    }

    // Detect the file type and send it to file service
    $scope.import = function(files) {
        if (!angular.isArray(files)) {
            FileDetector.detect(files)
        } else {
            for (var i = 0; i < files.length; i++) {
                FileDetector.detect(files[i]);
            }
        }
    }

    $scope.exportMaps = function() {
        return MapService.export();
    }

    $scope.exportStrings = function() {
        return StringService.export();
    }

    $scope.exportFileLocs = function() {
        return FileLocService.export();
    }

    $scope.exportSets = function() {
        return SetService.export();
    }

    $scope.exportMapsTSV = function(category) {
        return MapService.exportTSV(category);
    }

    $scope.exportMapsJSON = function(category) {
        return MapService.exportJSON(category);
    }

    $scope.exportStringsTSV = function() {
        return StringService.exportTSV();
    }

    $scope.exportStringsJSON = function() {
        return StringService.exportJSON();
    }

    $scope.exportSetsTSV = function() {
        return SetService.exportTSV();
    }
});
