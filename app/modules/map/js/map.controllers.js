var app = angular.module('forge.map.controllers', []);

app.controller('MapListCtrl', function($scope, $http, MapService, StringService, IconService, $location, $modal, $window) {
    // Load icons if Icons have been imported
    MapService.importIcons();
    // Parse descriptions
    if (MapService.lastModified <= StringService.lastModified || !MapService.descriptionsParsed) {
        MapService.parseAllDescriptions();
    }

    // View map editor
    $scope.EditorView = {
        MODES: {
            CREATE: 1,
            EDIT: 2
        },
        mode: 2,
        show: function(map) {
            $scope.selected = map;
            $scope.editorView = true;
            console.log(map); // For inspection
            $location.search('editor', true);
        },
        hide: function() {
            $scope.selected = null;
            $scope.editorView = false;
            $location.search('editor', null);
        }
    }

    // Text color classes
    $scope.itemColors = [
        'item-common', 'item-uncommon', 'item-very-rare',
        'item-rare', 'item-set', 'item-legendary', 'item-quest'
    ];

    // Map data
    $scope.maps = MapService.getAll();
    // String data
    $scope.strings = StringService.getAll();

    // Display Limit
    $scope.defaultLimit = 50;
    $scope.limit = $scope.defaultLimit;

    // Filters
    $scope.query = ''; // Search query
    $scope.filterType = -1; // Map type filter
    $scope.filterRarity = -1; // Map rarity filter
    $scope.filterPowerType = 0; // Filter Powers by Type [All, Player, Mob]

    // Editor View initialize
    $scope.EditorView.hide();

    // Filters

    // Add field names to improve search
    $scope.filterOnFields = function(map) {
        return (map.id + " " + map.english.name + " " + map.english.snippet)
            .toLowerCase().indexOf($scope.query.toLowerCase()) >= 0;
    };

    // Filter on item rarity
    $scope.filterOnItemRarity = function(map) {
        if ($scope.filterRarity < 0) {
            return map.rarity >= $scope.filterRarity;
        }
        return map.rarity == $scope.filterRarity;
    };

    // Filter on map type
    $scope.filterOnMapType = function(map) {
        // We don't want to filter on rarity unless its items
        if ($scope.filterType !== 0) {
            $scope.filterRarity = -1;
        }
        // All filter by all as well as categories
        if ($scope.filterType < 0) {
            return map.type >= $scope.filterType;
        }
        return map.type == $scope.filterType;
    };

    // Filter on map type
    $scope.filterOnPowerType = function(map) {
        // We don't want to filter on rarity unless its items
        if ($scope.filterType !== 2) {
            $scope.filterPowerType = -1;
        }
        // All filter by all as well as categories
        if ($scope.filterPowerType == -1) {
            return map.id >= 0;
        } else if ($scope.filterPowerType == 0) {
            return map.id >= 1000;
        }
        return map.id < 1000;
    };

    // Delete a map
    $scope.delete = function(map) {
        if (confirm('Are you sure you want to delete this map?')) {
            MapService.remove(map.id);
        }
    }

    // Create a map
    $scope.create = function() {
        $scope.EditorView.mode = $scope.EditorView.MODES.CREATE;
        $scope.newMap = MapService.create();
        $scope.EditorView.show($scope.newMap);
    }

    // Edit a map
    $scope.edit = function(map) {
        $scope.EditorView.mode = $scope.EditorView.MODES.EDIT;
        $scope.EditorView.show(map);
    }

    // Close the edit mode
    $scope.closeEditor = function() {
        if ($scope.EditorView.mode == $scope.EditorView.MODES.CREATE) {
            MapService.add($scope.selected);
        }
        //$scope.EditorView.hide();
        $window.history.back(); // We do this so scroll state is preserved
    }

    // Icon select modal
    $scope.IconSelector = {
        show: function() {
            var modalInstance = $modal.open({
                templateUrl: 'modules/icon/partials/game-icon-selector.tpl.html',
                controller: 'IconSelectorCtrl',
                size: 'lg',
                resolve: {
                    icon: function() {
                        return $scope.selected.icon;
                    }
                }
            });
            modalInstance.result.then(function(result) { // Success
                $scope.selected.icon = result;
            }, function() { // Dismissed
                //angular.element('#chooseIconButton').button('reset');
            });
        }
    }

    // Check if current selected Id is a weapon
    $scope.isWeapon = function() {
        if ($scope.selected) {
            return MapService.isWeapon($scope.selected);
        }
        return false;
    }

    // Route update, makes back button in browser work
    $scope.$on('$routeUpdate', function(scope, next, current) {
        if (next.params['editor'] == null || $scope.selected == null) {
            $scope.EditorView.hide();
        }
    });
});

// Icon Selector Controller
app.controller('IconSelectorCtrl', function($scope, $modalInstance, IconService, icon) {
    $scope.icons = IconService.getAll();
    console.log(icon.id);
    // Choose icon
    $scope.select = function(selection) {
        icon = angular.copy(selection);
        console.log(icon.id);
        $modalInstance.close(icon);
    }
    // Close modal
    $scope.dismiss = function() {
        $modalInstance.dismiss('dismiss');
    }
});

// Templates for accordian
app.run(["$templateCache",
    function($templateCache) {
        $templateCache.put("template/accordion/accordion-group.html",
            "<div class=\"panel panel-square panel-white panel-shadowless\" ng-class=\"{'panel-default': isOpen}\">\n" +
            "  <div class=\"panel-heading panel-heading-hover hand-cursor\"  ng-click=\"toggleOpen()\">\n" +
            "    <h5 class=\"panel-title panel-title-default\">\n" +
            "      <span class=\"accordion-toggle\" accordion-transclude=\"heading\"><span ng-class=\"{'text-muted': isDisabled}\">{{heading}}</span></span>\n" +
            "    </h5>\n" +
            "  </div>\n" +
            "  <div class=\"panel-collapse\" collapse=\"!isOpen\">\n" +
            "     <div class=\"panel-body\" ng-transclude></div>\n" +
            "  </div>\n" +
            "</div>");
    }
]);

app.run(["$templateCache",
    function($templateCache) {
        $templateCache.put("template/accordion/accordion.html",
            "<div class=\"panel-group\" ng-transclude></div>");
    }
]);
