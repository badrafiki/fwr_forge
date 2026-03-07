var app = angular.module('forge.set.services', []);

app.service('SetService', function($rootScope, ArrayExt, StringService) {

    var items = [];

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
            0x73, 0x04, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00
        ]));
    }

    // sort items
    this.sort = function() {
    	items = ArrayExt.sort(items, 'id');
    }

    // create new item, will not add to collection
    this.create = function() {
    	return new Set();
    }

    // add item
    this.add = function(item) {
    	if (item && item.id > 0 && !this.contains(item.id)) {
            items.push(item);
        }
        this.sort();
    }
    
    // remove item
    this.remove = function(item) {
    	var index = items.indexOf(item);
        if (index >= 0) {
            items.splice(index, 1);
        }
    }

    // see if item with this id already exists
    this.contains = function(id) {
    	for (var i = 0, l = items.length; i < l; i++) {
    		if (items[i].id == id) {
    			return true;
    		}
    	}
    	return false;
    }

    // import setitem.bin
    this.import = function(fileContents) {
        // Data view of the file contents
        var view = new DataView(fileContents);

        // Store the header information
        var header = new Uint8Array(fileContents, 0, this.header().length);

        // Make sure valid file type before full import
        if (!angular.equals(Array.apply([], header), this.header())) {
            return false;
        }

        // Current index of the data being read
        var currentIndex = header.length;

        // Store the entry count (according the file)
        var count = view.getUint32(currentIndex, true);
        currentIndex += 4;

        // Clear items
        while (items.length > 0) {
            items.pop();
        }

        // Read the entries
        while (currentIndex < view.byteLength) {
            var entry = new Set();

            entry.id = view.getUint32(currentIndex, true);
            currentIndex += 20;

            var descriptionLength = view.getUint32(currentIndex, true);
            currentIndex += 4;

            for (var i = 0; i < descriptionLength; i++) {
                var descriptionChunk = Array.apply([], new Uint32Array(fileContents, currentIndex, 4));
                entry.description.raw.push(descriptionChunk);
                currentIndex += 16;
            }

            items.push(entry);
        }

        this.sort();

        $rootScope.$apply(function() {
            $rootScope.setsLoaded = true;
        });

        return true;
    }

    // Export a tab seperated value document.
    this.exportTSV = function() {
        var seperator = "\t";

        if (items.length == 0) {
            return null;
        }

        this.parseAllDescriptions();

        // Output
        var blobs = [];

        // Entries
        for (var i = 0, len = items.length; i < len; i++) {            
            blobs.push(
                [
                    items[i].id,
                    items[i].description.readable.join("  ")
                ].join(seperator),
                '\n'
            );
        }

        return new Blob(blobs);
    }

    // export setitem.bin
    this.export = function() {
    	if (items.length == 0) {
    		return null;
    	}

    	this.sort();

    	// Header
    	var header = new Uint8Array(this.header());
    	// Count
    	var count = new Uint32Array([items.length]);
    	// Output
    	var blobs = [];

    	// Entries
    	for (var i = 0, l = items.length; i < l; i++) {
    		blobs.push(new Uint32Array([items[i].id,0,0,0,0,items[i].description.raw.length]));
    		
    		var desc = new Uint32Array(items[i].description.raw.length * 4);
            for (var d = 0, k = 0, dlen = items[i].description.raw.length; d < dlen; d++) {
                desc[k++] = items[i].description.raw[d][0];
                desc[k++] = items[i].description.raw[d][1];
                desc[k++] = items[i].description.raw[d][2];
                desc[k++] = items[i].description.raw[d][3];
            }
            blobs.push(desc);
    	}

    	return new Blob([header, count].concat(blobs));
    }

    // Parse all the descriptions into a cache array on the object
    this.parseAllDescriptions = function() {
        if (StringService.count() > 0) {
            for (var i = 0, li = items.length; i < li; i++) {
                items[i].parseDescription();
            }
        }
    }

    // Set Object
    var Set = function() {
    	// Public vars
        this.id = null;
        this.description = {
            raw: [],
            readable: []
        }
    }

    // Convert raw description to readable of one item
    Set.prototype.parseDescription = function() {
        // clear current readable
        this.description.readable = [];

        // build updated readable description
        for (var i = 0, l = this.description.raw.length; i < l; i++) {
            // Check for empty descriptor
            if (this.description.raw[i][0] == 0) {
                this.description.readable.push("");
                continue;
            }
            // Generate descriptor as readable string
            var str = this.parseDescriptor(this.description.raw[i]);
            this.description.readable.push(str);
        }
    }

    // Convert a descriptor to a string
    Set.prototype.parseDescriptor = function(descriptor) {
        // A description line has 3 pieces: string id and 2 vals
        // Make sure all are numbers
        for (var i = 0; i < 3; i++) {
            descriptor[i] = parseInt(descriptor[i]);
        }
        var gameString = StringService.get(descriptor[0]);
        if (!gameString) {
            return 'undefined';
        }
        // Find params
        var paramValues = []; // Values for string
        for (var i = 0; i < gameString.english.params.length; i++) {
            if (gameString.english.params[i].toLowerCase() == 'VAL'.toLowerCase()) { // Its a raw value
                paramValues.push(descriptor[i + 1]);
            } else { // Its a string
                var valString = descriptor[i + 1];
                if (gameString.english.params[i].toLowerCase() == 'STANCE'.toLowerCase()) {
                    valString += 800; // Stance strings start at 800
                }
                paramValues.push(StringService.get(valString).english.string);
            }
        }
        return StringService.format(gameString.english.string, paramValues);
    }
});
