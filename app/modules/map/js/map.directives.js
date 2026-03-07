var app = angular.module('forge.map.directives', []);

app.directive('descriptionEditor', function(MapService, StringService) {
    return {
        restrict: 'E',
        templateUrl: 'modules/map/partials/description-editor.tpl.html',
        scope: {
            'map': '='
        },
        controller: function($scope, $element, $location, $anchorScroll, $timeout) {
            // Scroll to editor so we can see it all
            var scrollTo = function(id) {
                $timeout(function() {
                    var old = $location.hash();
                    $location.hash(id);
                    $anchorScroll();
                    //reset to old to keep any additional routing logic from kicking in
                    $location.hash(old);
                }, 50)
            };

            // Functionality
            var STATES = {
                DEFAULT: 1,
                ADDING: 2,
                REMOVING: 4,
                STRING_SELECTED: 8,
                ADD: 16
            }
            $scope.STATES = STATES;

            var PARAM_TYPES = {
                NONE: 1,
                VAL: 2,
                STRING: 4,
                STANCE: 8
            }
            $scope.PARAM_TYPES = PARAM_TYPES;

            // Current state
            var currentState = STATES.DEFAULT;

            // Scope variables
            $scope.selectedDescriptor = 0;
            $scope.strings = StringService.getAll();

            // Initialize forms
            var reset = function() {
                currentState = STATES.DEFAULT;
                // New descriptor for adding
                $scope.newDescriptor = {
                    baseString: {},
                    raw: [0, 0, 0],
                    readable: "",
                    paramTypes: [PARAM_TYPES.NONE, PARAM_TYPES.NONE]
                }
                $scope.paramStringQuery = ["", ""];
            }
            reset();

            // Change current state
            $scope.changeState = function(newState) {
                currentState = newState;
                switch (currentState) {
                    case STATES.ADDING:
                        scrollTo('descriptionEditor');
                        break;
                    case STATES.REMOVING:
                        remove();
                        break;
                    case STATES.STRING_SELECTED:
                        //selectBase();
                        break;
                    case STATES.ADD:
                        add();
                        break;
                    default:
                        reset();
                        break;
                }
            }

            // Compare current state
            $scope.is = function(state) {
                return currentState == state;
            }

            // Limit string search because max string id in descriptor can be 65535 due to 16bit
            $scope.stringSearchLimit = function(string) {
                return string.id <= 65535;
            }

            // Select base descriptor string            
            $scope.selectBase = function(stringId) {
                $scope.changeState(STATES.STRING_SELECTED);
                $scope.newDescriptor.raw[0] = stringId;
                $scope.newDescriptor.baseString = StringService.get($scope.newDescriptor.raw[0]);
                $scope.newDescriptor.readable = $scope.newDescriptor.baseString.english.string;
                var gameString = $scope.newDescriptor.baseString.english;

                for (var i = 0; i < 2; i++) {
                    if (gameString.params.length > i) {
                        if (gameString.params[i].toLowerCase() == "VAL".toLowerCase()) {
                            $scope.newDescriptor.paramTypes[i] = PARAM_TYPES.VAL;
                        } else if (gameString.params[i].toLowerCase() == "STANCE".toLowerCase()) {
                            $scope.newDescriptor.paramTypes[i] = PARAM_TYPES.STANCE;
                        } else if (gameString.params[i].toLowerCase() == "STRING".toLowerCase()) {
                            $scope.newDescriptor.paramTypes[i] = PARAM_TYPES.STRING;
                        }
                    }
                }
                $scope.liveParse();
                $scope.selectedBase = -1;
            }

            // Add descriptor
            var add = function() {
                $scope.map.description.raw.push(angular.copy($scope.newDescriptor.raw));
                $scope.map.parseDescription();
                reset();
            }

            // Remove a descriptor
            var remove = function() {
                $scope.map.description.raw.splice($scope.selectedDescriptor, 1);
                $scope.map.parseDescription();
                // Fix overflow bug
                $scope.selectedDescriptor = Math.min($scope.selectedDescriptor, $scope.map.description.raw.length - 1);
                // Back to default state
                currentState = STATES.DEFAULT;
            }

            // Move descriptor up
            $scope.moveUp = function() {
                var selected = parseInt($scope.selectedDescriptor);
                swapDescriptors(selected, selected - 1);
                $scope.selectedDescriptor = Math.max($scope.selectedDescriptor - 1, 0);
            }

            // Move descriptor down
            $scope.moveDown = function() {
                var selected = parseInt($scope.selectedDescriptor);
                swapDescriptors(selected, selected + 1);
                $scope.selectedDescriptor = Math.min($scope.selectedDescriptor + 1, $scope.map.description.raw.length - 1);
            }

            // Swap two descriptors in a description
            var swapDescriptors = function(a, b) {
                if (a < 0 || a > $scope.map.description.raw.length - 1 || b < 0 || b > $scope.map.description.raw.length - 1) {
                    return;
                }
                var tmp = $scope.map.description.raw[b];
                $scope.map.description.raw[b] = $scope.map.description.raw[a];
                $scope.map.description.raw[a] = tmp;
                $scope.map.parseDescription();
            }

            // Live parse the readable description
            $scope.liveParse = function() {
                $scope.newDescriptor.readable = MapService.parseDescriptor($scope.newDescriptor.raw);
            }

            // See if map changes so we can reset
            $scope.$watch('map', function(newValue, oldValue) {
                reset();
            });
        }
    }
});
