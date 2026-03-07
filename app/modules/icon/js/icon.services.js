var app = angular.module('forge.icon.services', []);

app.service('IconService', function($rootScope, ArrayExt) {

    var icons = [];

    // Get all the icons
    this.getAll = function() {
        return icons;
    }

    // Get the number of items in collection
    this.count = function() {
        return icons.length;
    }

    // File name. This file has no header, so must do a name match
    this.filename = function() {
        return "viconlist.dat";
    }

    // Game Icon object definition
    var GameIcon = function() {
        this.id = 0;
        this.layers = [];
    }

    // Create a new icon
    this.create = function() {
        return new GameIcon();
    }

    // Get an icon, Returns undefined if not found
    this.get = function(id) {
        var index = ArrayExt.binarySearch(icons, 'id', id);
        if (index > -1)
            return icons[index];
        return undefined;
    }

    // Import the icon file
    this.import = function(filename, fileContents) {
        
        // Validate file
        if (filename !== this.filename()) {
            return false;
        }

        // Convert to string so we can parse it with string manipulation
        fileContents = String.fromCharCode.apply(null, new Uint8Array(fileContents));

        // Start parsing the file
        var entries = []; // All icon entries
        var lines = fileContents.split('\r\n'); // Split file contents into lines
        var totalLines = parseInt(lines[0].slice(0, lines[0].indexOf(" "))); // Total lines as specified in file
        var currentId = 1; // Current Id for assignment

        // Start parsing the file
        for (var i = 1, l = lines.length; i < l; i++) {
            // Check for empty line
            if (lines[i] === "") continue;
            
            // Parse entry
            var entry = new GameIcon(); // Current icon entry
            entry.id = currentId++; // Id of icon
            entry.layers = []; // Array of layers with icon id
            var eol = lines[i].search("\s");
            if (eol == -1) eol = lines[i].length;
            var numLayers = parseInt(lines[i].slice(0, eol));
            for (j = 0; j < numLayers; j++) {
                i++;
                var eol = lines[i].search("\s");
                if (eol == -1) eol = lines[i].length;
                entry.layers.push(parseInt(lines[i].slice(0, eol)));
            }

            // Add entry to collection
            entries.push(entry);
        }

        icons = ArrayExt.sort(entries, 'id');

        // Tell scope we are done
        $rootScope.$apply(function() {
            $rootScope.iconsLoaded = true;
        });

        return true;
    }
});
