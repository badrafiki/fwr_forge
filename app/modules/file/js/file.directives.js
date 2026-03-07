/* Directives */
var app = angular.module('forge.file.directives', []);

// File dropzone
app.directive("dropzone", function() {
    return {
        restrict: "A",
        scope: {
            'dropzoneFn': '&'
        },
        link: function(scope, elem, attr) {

            elem.bind('dragover', function(e) {
                e.stopPropagation();
                e.preventDefault();
                e.originalEvent.dataTransfer.dropEffect = 'copy';
            });

            elem.bind('dragenter', function(e) {
                e.stopPropagation();
                e.preventDefault();
            });

            elem.bind('dragleave', function(e) {
                e.stopPropagation();
                e.preventDefault();
            });

            elem.bind('drop', function(e) {
                e.stopPropagation();
                e.preventDefault();
                var droppedFiles = Array.apply([], e.originalEvent.dataTransfer.files);
                scope.dropzoneFn({
                    files: droppedFiles
                });
            });
        }
    }
});

// Browse for files
app.directive("importButton", function() {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            'callbackFn': '&',
            'class': '@'
        },
        template: '<button class="{{class}}" type="button">' +
                        '<span class="glyphicon glyphicon-import"></span>&nbsp;' +
                        '<span ng-transclude></span>' +
                        '<input type="file" multiple="multiple" style="display:none;">' +
                    '</button>',
        link: function(scope, element, attributes) {

            // Find the input child element
            var inputElement = element.find("input");

            // Make button click the input file element
            element.bind("click", function(e) {
                inputElement.click();
            });

            // Stop a click loop from child to parent
            inputElement.bind("click", function(e) {
                e.stopPropagation();
            });

            // Notice file was selected, send files to callback function
            inputElement.bind("change", function(changeEvent) {
                var input = changeEvent.target.files;
                for (var i = 0; i < input.length; i++) {
                    scope.callbackFn({
                        file: input[i]
                    });
                }
                inputElement.val(''); // Reset file input
            });
        }
    }
});

// Export files
app.directive('exportButton', function($timeout) {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            'filename': '@filename',
            'getData': '&data',
            'class': "@"
        },
        template: '<button class="{{class}}" type="button" data-loading-text="Exporting...">' +
                        '<span class="glyphicon glyphicon-export"></span>&nbsp' +
                        '<span ng-transclude></span>' +
                    '</button>',
        link: function(scope, elem, attrs) {
            var doExport = function() {
                var filename = prompt("Save file as:", scope.filename);
                if (filename == null) {
                    elem.button('reset');
                    return; // User cancelled export
                }

                var start = Date.now();
                var data = scope.getData();
                var end = Date.now();

                if (data == null) {
                    return; // Dont do anything
                }

                console.log("Export execution time: " + (end - start) + " ms");

                var blob = new Blob([data], {
                    type: 'application/octet-stream'
                });

                var url = window.URL.createObjectURL(blob);

                var a = document.createElement("a");
                a.download = filename;
                a.href = url;
                a.textContent = "";
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                elem.button('reset');
            }

            elem.bind('click', function() {
                elem.button('loading');
                var timeout = $timeout(function() {
                    doExport();
                });
            });
        }
    }
});
