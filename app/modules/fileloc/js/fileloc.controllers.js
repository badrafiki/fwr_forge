var app = angular.module('forge.fileloc.controllers', []);

app.controller('FileLocListCtrl', function($scope, FileDetector, FileLocService) {

    $scope.files = FileLocService.getAll();
    $scope.selected = 0; // Start with first element

    // Add file
    $scope.add = function(files) {
        var file = files.split('\n');
        for (var i = 0, l = file.length; i < l; i++) {
            FileLocService.add(file[i]);
        }
        $scope.newFile = ""; // Clear input
        $scope.selected = $scope.files.length - 1; // Select added element
    }

    // Remove selected file
    $scope.remove = function() {
        if (confirm('Are you sure you want to remove ' + $scope.files[$scope.selected] + '?')) {
            FileLocService.remove($scope.files[$scope.selected]);
            $scope.selected = Math.min($scope.selected, $scope.files.length - 1);
        }
    }

    // Import file
    $scope.import = function(file) {
        FileDetector.detect(file);
    }

    // Export file
    $scope.export = function() {
        return FileLocService.export();
    }
});
