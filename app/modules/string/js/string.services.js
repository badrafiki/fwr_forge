var app = angular.module('forge.string.services', []);

app.service('StringService', function($rootScope, ArrayExt) {

    var strings = []; // Array of our game strings

    this.lastModified = Date.now(); // Last time array was updated

    // Get string array
    this.getAll = function() {
        return strings;
    }

    // Get amount of strings
    this.count = function() {
        return strings.length;
    }

    // Sort Strings by id
    this.sort = function() {
        strings = ArrayExt.sort(strings, 'id');
    }

    // Get file header
    this.header = function() {
        return Array.apply([], new Uint8Array([0x01, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00,
            0x04, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00,
            0x00, 0x00, 0x03, 0x00, 0x00, 0x00
        ]));
    }

    // String object definition
    var GameString = function() {
        this.id = null;
        this.english = {
            string: "",
            params: []
        };
        this.tradChinese = {
            string: "",
            params: []
        };
        this.simpChinese = {
            string: "",
            params: []
        };
        this.malaysian = {
            string: "",
            params: []
        };
    }

    // Get a string by its Id
    this.get = function(id) {
        var i = ArrayExt.binarySearch(strings, 'id', id);
        if (i > -1) return strings[i];
        return undefined;
    }

    // Create and return a new string
    this.create = function() {
        // Create new GameString and get an available string id
        var gs = new GameString();
        var newId = Math.max.apply(Math, strings.map(function(o) {
            return o.id;
        })) + 1;
        gs.id = newId; // Assign a unique new Id to the gameString
        return gs;
    }

    // Add a string
    this.add = function(gameString) {
        if (gameString instanceof GameString) {
            // Make sure Id doesn't already exist
            if (!this.get(gameString.id)) {
                strings.push(gameString);
                this.sort();
                this.lastModified = Date.now(); // Set last modified
            }
        }
    }

    // Remove a string
    this.remove = function(id) {
        for (var i = 0, l = strings.length; i < l; i++) {
            if (strings[i].id == id) {
                strings.splice(i, 1); // remove it
                break;
            }
        }
        this.lastModified = Date.now(); // Set last modified
    }

    // Format the string with params
    this.format = function(string, vals) {
        //%s (string), %u (unsigned), %d (signed), %2 (clock)
        for (var i = 0; i < vals.length; i++) {
            string = string.replace(/%d|%s|%u|%2/, vals[i]);
        }
        string = string.replace(/%%/g, '%'); // Remove the double %'s
        return string;
    }

    // Import string.bin file
    this.import = function(fileContents) {

        // Will extract the game string parameters into an array
        var extractParams = function(string) {
            if (string.charAt(0) == "(") {
                var paramStart = string.indexOf("),");
                if (paramStart > 0) {
                    var split = string.substring(paramStart + 2, string.length).split(',');
                    for (var i = 0; i < split.length; i++) {
                        split[i] = split[i].trim();
                    }
                    return split;
                }
            }
            return [];
        }

        // Will strip the parameters and parentheses from a string
        var stripParams = function(string) {
            if (string.charAt(0) == "(") {
                var paramStart = string.indexOf("),");
                if (paramStart > -1) {
                    return string.substring(1, paramStart);
                }
            }
            return string;
        }

        // Data view of file contents
        var view = new DataView(fileContents);

        // Store the header information
        var header = new Uint8Array(fileContents, 0, this.header().length);

        // Make sure valid file type before full import
        if (!angular.equals(Array.apply([], header), this.header())) {
            return false;
        }

        // Current index of the data being read
        var currentIndex = this.header().length;

        // Store the entry count (according the file)
        var count = view.getUint32(currentIndex, true);
        currentIndex += 4;

        // String entries
        var entries = [];

        // Read the entries
        while (currentIndex < view.byteLength) {
            var entry = new GameString(); // Initialize entry
            var stringLength; // Length of current string being parsed
            var tempString; // Temp place to store string for processing
            // Start parsing
            entry.id = view.getUint32(currentIndex, true);
            currentIndex += 4;

            stringLength = view.getUint16(currentIndex, true);
            currentIndex += 2;
            tempString = String.fromCharCode.apply(null, new Uint16Array(fileContents, currentIndex, stringLength));
            entry.tradChinese.params = extractParams(tempString);
            entry.tradChinese.string = stripParams(tempString);
            currentIndex += stringLength * 2;

            stringLength = view.getUint16(currentIndex, true);
            currentIndex += 2;
            tempString = String.fromCharCode.apply(null, new Uint16Array(fileContents, currentIndex, stringLength));
            entry.english.params = extractParams(tempString);
            entry.english.string = stripParams(tempString);
            currentIndex += stringLength * 2;

            stringLength = view.getUint16(currentIndex, true);
            currentIndex += 2;
            tempString = String.fromCharCode.apply(null, new Uint16Array(fileContents, currentIndex, stringLength));
            entry.simpChinese.params = extractParams(tempString);
            entry.simpChinese.string = stripParams(tempString)
            currentIndex += stringLength * 2;

            stringLength = view.getUint16(currentIndex, true);
            currentIndex += 2;
            tempString = String.fromCharCode.apply(null, new Uint16Array(fileContents, currentIndex, stringLength));
            entry.malaysian.params = extractParams(tempString);
            entry.malaysian.string = stripParams(tempString);
            currentIndex += stringLength * 2;

            entries.push(entry);
        }

        strings = entries;
        this.sort();
        this.lastModified = Date.now(); // Set last modified

        $rootScope.$apply(function() {
            $rootScope.stringsLoaded = true;
        });

        return true;
    }

    // Export a tab seperated value document.
    this.exportTSV = function() {
        var seperator = "\t";

        if (strings.length == 0) {
            return null;
        }

        // Convert string to hex array buffer
        var str2ab = function(str) {
            var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
            var bufView = new Uint16Array(buf);
            for (var i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        }

        // Output
        var blobs = [];

        // Entries
        for (var i = 0, len = strings.length; i < len; i++) {      
            blobs.push(
                [
                    strings[i].id,
                    strings[i].english.string, 
                    strings[i].tradChinese.string, 
                    strings[i].simpChinese.string, 
                    strings[i].malaysian.string, 
                    strings[i].english.params.join(", ")
                ].join(seperator),
                '\n'
            );
        }

        return new Blob(blobs);
    }

    // Export a JSON document.
    this.exportJSON = function() {
        if (strings.length == 0) {
            return null;
        }
        
        var json = JSON.stringify(strings, null, 2);

        return new Blob([json]);
    }

    // Export strings to file
    this.export = function() {

        if (strings.length == 0) {
            return null;
        }

        // Insert params back onto the string
        var insertParams = function(sObj) {
            if (sObj.params.length > 0) {
                return "(" + sObj.string + ")," + sObj.params.join();
            }
            return sObj.string;
        }

        // Convert string to hex array buffer
        var str2ab = function(str) {
            var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
            var bufView = new Uint16Array(buf);
            for (var i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        }

        // Header
        var header = new Uint8Array(this.header());
        // Count
        var count = new Uint32Array([strings.length]);
        // Output
        var blobs = [];

        // Entries
        for (var i = 0, len = strings.length; i < len; i++) {
            var tempString = "";

            var id = new Uint32Array([strings[i].id]);

            tempString = insertParams(strings[i].tradChinese);
            var tcLength = new Uint16Array([tempString.length]);
            var tc = str2ab(tempString);

            tempString = insertParams(strings[i].english);
            var eLength = new Uint16Array([tempString.length]);
            var e = str2ab(tempString);

            tempString = insertParams(strings[i].simpChinese);
            var scLength = new Uint16Array([tempString.length]);
            var sc = str2ab(tempString);

            tempString = insertParams(strings[i].malaysian);
            var mLength = new Uint16Array([tempString.length]);
            var m = str2ab(tempString);

            blobs.push(id, tcLength, tc, eLength, e, scLength, sc, mLength, m);
        }

        return new Blob([header, count].concat(blobs));
    }
});
