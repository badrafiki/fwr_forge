var app = angular.module('forge.file.services', []);

app.service('FileDetector', function(StringService, MapService, IconService, FileLocService, SetService) {

    // Detect the file type and import
    this.detect = function(file) {
        var reader = new FileReader();

        // Event for when reader completes
        reader.onloadend = function(evt) {
            if (evt.target.readyState == FileReader.DONE) {
                var fileContents = evt.target.result;

                if (StringService.import(fileContents) ||
                    MapService.import(fileContents) ||
                    FileLocService.import(fileContents) ||
                    SetService.import(fileContents) ||
                    IconService.import(file.name, fileContents)
                ) {
                    console.log("Import success: " + file.name);
                } else {
                    console.log("Import failed: " + file.name + " is not a valid file");
                }
            }
        }

        // read file
        reader.readAsArrayBuffer(file);
    }
});
