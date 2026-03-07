var app = angular.module('forge.spawn.services', []);

app.service('SpawnService', function($rootScope, ArrayExt) {

	var items = [];

	// Spawn Point Object
    var SpawnPoint = function() {
    	// Public vars
        this.id = null;
        this.name = null;
        this.location = {
            x: null,
            y: null,
            z: null
        }
    }

    // Get the items array
    this.getAll = function() {
        return items;
    }

    // Get size of array
    this.count = function() {
        return items.length;
    }

    // file header
    this.header = function() {
        return Array.apply([], new Uint8Array([
            0x56, 0x4B, 0x53, 0x43
        ]));
    }

    // import scene file
    this.import = function(filename, fileContents) {

    	// Find start index of spawn points in file based on manual mapping
    	var startIndex = null;
    	for (var i = 0; i < startIndicies.length; i++) {
    		if (filename.indexOf(startIndicies[i].name) > -1) {
    			startIndex = startIndicies[i].index;
    			break;
    		}
    	}

    	if (startIndex == null)
    	{
    		console.log("No spawn point start index mapping found for this file.")
    		return; // No start index found for this file
    	}

    	// Size of each spawn pt entry in file
    	chunkSize = 88;

    	// Size of the spawn pt name chunk
    	nameChunkSize = 64;

        // Data view of the file contents
        var view = new DataView(fileContents);

        // Store the header information
        var header = new Uint8Array(fileContents, 0, this.header().length);

        // Make sure valid file type before full import
        if (!angular.equals(Array.apply([], header), this.header())) {
            return false;
        }

        // Current index of the data being read
        var currentIndex = startIndex;

        // Store the entry count (according the file)
        var count = view.getUint32(currentIndex, true);
        currentIndex += 4;

        // Clear items
        while (items.length > 0) {
            items.pop();
        }

        // Read the entries
        while (currentIndex < (startIndex + (chunkSize * count))) {
            var entry = new SpawnPoint();

            entry.name = String.fromCharCode.apply(null, new Uint8Array(fileContents, currentIndex, nameChunkSize));
            entry.name = entry.name.replace(/\0/g, ''); // Trim nulls
            currentIndex += nameChunkSize;

            entry.location.x = view.getFloat32(currentIndex, true);
            currentIndex += 4;

            entry.location.y = view.getFloat32(currentIndex, true);
            currentIndex += 4;

            entry.location.z = view.getFloat32(currentIndex, true);
            currentIndex += 4;

            entry.id = view.getUint32(currentIndex, true);
            currentIndex += 4;

            // 8 more bytes follow, but are unknown data
            currentIndex += 8;

            console.log(entry);

            items.push(entry);
        }

        $rootScope.$apply(function() {
            $rootScope.spawnsLoaded = true;
        });

        return true;
    }

    // Export a tab seperated value document.
    this.export = function() {
        var seperator = "\t";

        if (items.length == 0) {
            return null;
        }
    }

    // Indicies of start point on scene files
    var startIndicies = [
    	{name: "TutorTH", 	index: 759008},
    	{name: "Z02FV-",	index: 9156710},
    	{name: "Z02FV",		index: 9157014}
    ]
});

app.service('SceneFileReader', function(SpawnService) {

    // Detect the file type and import
    this.read = function(file) {
        var reader = new FileReader();

        // Event for when reader completes
        reader.onloadend = function(evt) {
            if (evt.target.readyState == FileReader.DONE) {
                var fileContents = evt.target.result;

                if (SpawnService.import(file.name, fileContents)) {
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