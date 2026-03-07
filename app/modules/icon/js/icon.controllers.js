var app = angular.module('forge.icon.controllers', []);

app.controller('IconListCtrl', function($scope, IconService) {
    $scope.icons = IconService.getAll() || [];
});
