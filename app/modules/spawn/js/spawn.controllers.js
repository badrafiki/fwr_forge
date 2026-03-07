var app = angular.module('forge.spawn.controllers', []);

app.controller('ExtractSpawnsCtrl', function($rootScope, $scope, SpawnService, SceneFileReader) {

    $scope.spawnPoints = SpawnService.getAll();
    $scope.selected = 0; // Start with first element

    // Import file
    $scope.import = function(file) {
        SceneFileReader.read(file);
    }

    // Export file
    $scope.export = function() {
        return SpawnService.export();
    }

    // Maps Stuff
    var mapOptions = {
        zoom: 1,
        streetViewControl: false,
        center: new google.maps.LatLng(0, 0),
        mapTypeControlOptions: {
	      mapTypeIds: ['Scene']
	    }
    }

    var sceneTypeOptions = {
        getTileUrl: function(coord, zoom) {
            var normalizedCoord = getNormalizedCoord(coord, zoom);
            if (!normalizedCoord) {
                return null;
            }
            var bound = Math.pow(2, zoom);
            return '../app/img/maps/Z02FV' +
               '/' + zoom + '/' + normalizedCoord.x + '/' +
                (normalizedCoord.y) + '.png';
            //return '../app/img/maps/Z02FV.png';
        },
        tileSize: new google.maps.Size(256, 256),
        maxZoom: 2,
        minZoom: 0,
        name: 'Scene'
    };

    // Normalizes the coords that tiles repeat across the x axis (horizontally)
    // like the standard Google map tiles.
    var getNormalizedCoord = function(coord, zoom) {
        var y = coord.y;
        var x = coord.x;

        // tile range in one direction range is dependent on zoom level
        // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
        var tileRange = 1 << zoom;

        // don't repeat across y-axis (vertically)
        if (y < 0 || y >= tileRange) {
            return null;
        }

        // repeat across x-axis
        if (x < 0 || x >= tileRange) {
            x = (x % tileRange + tileRange) % tileRange;
        }

        return {
            x: x,
            y: y
        };
    }

    var sceneMapType = new google.maps.ImageMapType(sceneTypeOptions);

    $scope.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    $scope.map.mapTypes.set('Scene', sceneMapType);
    $scope.map.setMapTypeId('Scene');

    // Projection
    var RANGE_X = (43788+9682);
    var RANGE_Y = (34698+41698);

    var toLatitude = function(y) {
	  	var a = 0;
		var b = 85 + 85;
		var bottom = -41698; // for fv
		var top = 34698; // For fv

		return ((((b-a)*(y - bottom))/(top-bottom)) + a) - (b/2);
	};

	var toLongitude = function(x) {
		var a = 0;
		var b = 180 + 180;
		var right = -9682; // for fv
		var left = 43788; // For fv

		return ((((b-a)*(x - left))/(right-left)) + a) - (b/2);
	};

    // Markers
    $scope.markers = [];

    var createMarker = function (info){
        
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(toLatitude(info.location.x), toLongitude(info.location.z)),
            title: info.id + ""
        });
        
        $scope.markers.push(marker);

        console.log(marker.position);
        
    }

    var createMarkers = function() {
    	console.log("called");
    	for (var i = 0; i < $scope.spawnPoints.length; i++){
	    	createMarker($scope.spawnPoints[i]);
	    }
    }

    $rootScope.$watch('spawnsLoaded',function(){
	    createMarkers();
	});
});
