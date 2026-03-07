var app = angular.module('forge.controllers', []);

/*
Controller for the header, mostly to handle active pages
 */
app.controller('HeaderCtrl', function($scope, $location, $timeout, $rootScope) {
    $scope.isActive = function(viewLocation) {
        return viewLocation === $location.path();
    };
});

/*
Scroll back to to the top of the page where an <a id="top"></a> exists
*/
app.controller('ScrollControl', function($scope, $location, $anchorScroll) {
    $scope.gotoTop = function() {
        // set the location.hash to the id of
        // the element you wish to scroll to.
        $location.hash('top');

        // call $anchorScroll()
        $anchorScroll();
    };
});
