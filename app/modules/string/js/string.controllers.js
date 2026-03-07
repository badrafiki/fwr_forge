var app = angular.module('forge.string.controllers', ['ui.bootstrap']);

// List all strings
app.controller('StringListCtrl', function($scope, $modal, StringService) {

    // Display limit
    $scope.defaultLimit = 50; // for reverting
    $scope.limit = $scope.defaultLimit;

    // All Game Strings
    $scope.strings = StringService.getAll();

    // Open string view modal
    $scope.OpenStringViewDialog = function(string) {
        $scope.selected = string;
        var modalInstance = $modal.open({
            templateUrl: 'modules/string/partials/string-view.tpl.html',
            controller: 'StringViewCtrl',
            size: 'lg',
            resolve: {
                selected: function() {
                    return $scope.selected;
                }
            }
        });
    }

    // Open string create dialog
    $scope.OpenStringCreateDialog = function() {
        var modalInstance = $modal.open({
            templateUrl: 'modules/string/partials/string-create.tpl.html',
            controller: 'StringCreateCtrl',
            size: 'lg'
        });
    };
});

// View an existing string
app.controller('StringViewCtrl', function($scope, $modalInstance, StringService, selected) {
    $scope.selected = selected; // put selected item into scope
    $scope.original = angular.copy(selected); // Keep an original copy
    $scope.temp = angular.copy(selected); // Temp for editing
    $scope.editMode = false; // In edit mode?

    // Revert string back to original
    $scope.revert = function(form) {
        $scope.selected.english = $scope.original.english;
        $scope.temp.english = $scope.original.english;
        form.$setPristine();
    }

    // Delete string from list
    $scope.delete = function(string) {
        if ($scope.selected.id == 0) {
            alert("You cannot delete this string");
            return;
        }
        if (confirm('Are you sure you want to delete this string?')) {
            StringService.remove($scope.selected.id);
            $modalInstance.dismiss('deleted');
        }
    }

    // Edit string
    $scope.edit = function(form) {
        $scope.selected.english = $scope.temp.english;
        $scope.original.english = $scope.selected.english;
        form.$setPristine();
        $modalInstance.dismiss('edited');
    }

    // Close modal
    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    }
});

// Create a new string
app.controller('StringCreateCtrl', function($scope, $modalInstance, StringService) {

    $scope.newString = StringService.create(); // New string input

    // Clear the form
    $scope.clear = function(form) {
        $scope.newString = StringService.create();
        form.$setPristine();
    }

    // Add new string
    $scope.add = function(string) {
        StringService.add(string);
        $modalInstance.dismiss('success');
    }

    // Close modal
    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    }
});
