var app = angular.module('forge.icon.directives', []);

app.directive('gameIcon', function() {
    return {
        restrict: 'E',
        scope: {
            icon: '=icon',
            tooltip: '=iconTooltip'
        },
        templateUrl: 'modules/icon/partials/game-icon.tpl.html'
    };
});
