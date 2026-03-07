var app = angular.module('forge.fileloc.services', []);

app.service('FileLocService', function($rootScope) {

    var fileLocs = [];

    // Get the fileloc array
    this.getAll = function() {
        return fileLocs;
    }

    // Get size of array
    this.count = function() {
        return fileLocs.length;
    }

    // fileloc.dir file header
    this.header = function() {
        return Array.apply([], new Uint8Array([
            0x56, 0x44, 0x49, 0x52, 0x64, 0x00, 0x00, 0x00
        ]));
    }

    // sort filelocs
    this.sort = function() {    
        fileLocs.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
    }

    // remove duplicates, need to do it in-place to keep ref to array
    this.distinct = function() {
        var duplicates = fileLocs.filter(function(elem, pos) {
            return fileLocs.indexOf(elem) != pos; // get duplicates
        });
        // Remove them
        for (var i = 0; i < duplicates.length; i++) {
        	this.remove(duplicates[i]);
        }
    }

    // build tree
    this.buildTree = function() {

        var paths = fileLocs.map(function(path) {
            return path.split('\\');
        });

        var structurize = function(paths) {
            var items = [];
            for (var i = 0, l = paths.length; i < l; i++) {
                var path = paths[i];
                var label = path[0];
                var rest = path.slice(1);
                var item = null;
                for (var j = 0, m = items.length; j < m; j++) {
                    if (items[j].label === label) {
                        item = items[j];
                        break;
                    }
                }
                if (item === null) {
                    item = {
                        label: label,
                        children: []
                    };
                    items.push(item);
                }
                if (rest.length > 0) {
                    item.children.push(rest);
                }
            }
            for (i = 0, l = items.length; i < l; i++) {
                item = items[i];
                item.children = structurize(item.children);
            }
            return items;
        }

        return structurize(paths);
    }

    // Add fileloc, // Don't add duplicate
    this.add = function(file) {
        if (file && fileLocs.indexOf(file) == -1) {
            fileLocs.push(file.trim());
        }
    }

    // Remove a fileloc
    this.remove = function(file) {
        var index = fileLocs.indexOf(file);
        if (index >= 0) {
            fileLocs.splice(index, 1);
        }
    }

    // Import the fileloc file
    this.import = function(fileContents) {
        // Data view of file contents
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

        // Clear fileLocs
        while (fileLocs.length > 0) {
            fileLocs.pop();
        }

        // Read the entries
        while (currentIndex < view.byteLength) {
            var dirLength = view.getUint32(currentIndex, true);
            currentIndex += 4;

            var path = String.fromCharCode.apply(null, new Uint8Array(fileContents, currentIndex, 256)).replace(/\0/g, '');
            currentIndex += 256;

            fileLocs.push(path);
        }

        // Sort and make distinct        
        this.sort();
        //this.distinct();

        $rootScope.$apply(function() {
            $rootScope.fileLocsLoaded = true;
        });

        return true;
    }

    // Export the fileloc file
    this.export = function() {
        if (fileLocs.length == 0) {
            return null;
        }

        // Convert string to hex array buffer
        var str2ab = function(str) {
            var buf = new ArrayBuffer(str.length); // 2 bytes for each char
            var bufView = new Uint8Array(buf);
            for (var i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        }

        // Sort and make distinct
        this.sort();
        this.distinct();

        // Header
        var header = new Uint8Array(this.header());
        // Count
        var count = new Uint32Array([fileLocs.length]);
        // Output
        var blobs = [];

        // Entries
        for (var i = 0, len = fileLocs.length; i < len; i++) {
            var full = fileLocs[i];
            var tokens = fileLocs[i].split("\\");
            var filename = tokens.pop();
            var path = tokens.join("\\") + "\\";

            blobs.push(
                new Uint32Array([path.length]),
                str2ab(full),
                new Uint8Array(256 - full.length)
            );
        }

        return new Blob([header, count].concat(blobs));
    }
});
