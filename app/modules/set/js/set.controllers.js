var app = angular.module('forge.set.controllers', []);

app.controller('SetListCtrl', function($scope, $location, SetService, StringService) {

    // Parse descriptions for display
    SetService.parseAllDescriptions();

    // Get the sets
    $scope.sets = SetService.getAll();

    // Handle editor view window
    $scope.Editor = {
        display: false, // display editor?
        mode: "", // current mode: add, edit
        selected: null, // Currently selected set
        open: function(mode, selected) {
            this.mode = mode;
            this.selected = selected;
            this.display = true;
            $location.search('editor', true);
        },
        close: function() {
            if (this.mode == "add") {
                SetService.add(this.selected);
            }
            this.mode = "";
            this.selected = null;
            this.display = false;
            $location.search('editor', null);
        },
        dismiss: function() {
            this.mode = "";
            this.selected = null;
            this.display = false;
            $location.search('editor', null);
        }
    }

    // Edit button clicked
    $scope.edit = function(set) {
        $scope.Editor.open('edit', set);
    }

    // Remove selected
    $scope.delete = function(set) {
        if (confirm('Are you sure you want to delete set ' + set.id + '?')) {
            SetService.remove(set);
        }
    }

    // Open creator
    $scope.create = function() {
        var newSet = SetService.create();
        $scope.Editor.open('add', newSet);
    }

    // Route update, makes back button in browser work
    $scope.$on('$routeUpdate', function(scope, next, current) {
        if (next.params['editor'] == null) {
            $scope.Editor.dismiss();
        }
    });

});
