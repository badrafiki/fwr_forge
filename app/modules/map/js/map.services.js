var app = angular.module('forge.map.services', []);

app.service('MapService', function($rootScope, ArrayExt, IconService, StringService) {

    // Collection of all maps
    var maps = [];

    // Last time maps array was changed
    this.lastModified = Date.now();

    // Flags
    this.iconsImported = false; // Have the icons been imported?
    this.descriptionsParsed = false; // Have the descriptions parsed

    // Get all maps
    this.getAll = function() {
        return maps;
    }

    // Get map count
    this.count = function() {
        return maps.length;
    }

    // File header
    this.header = function() {
        return Array.apply([], new Uint8Array([0x47, 0x0F, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00,
            0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02, 0x00,
            0x00, 0x00, 0x03, 0x00, 0x00, 0x00
        ]));
    }

    // Import full icon data from Icon file
    this.importIcons = function() {
        if (!this.iconsImported && IconService.count() > 0) {
            for (var i = 0, l = maps.length; i < l; i++) {
                var icon = IconService.get(maps[i].icon);
                if (icon) {
                    maps[i].icon = icon;
                } else {
                    var id = maps[i].icon;
                    maps[i].icon = IconService.create();
                    maps[i].icon.id = id;
                }
            }
            console.log("Icon mapping complete");
            this.iconsImported = true;
        }
    }

    // Parse all the descriptions into a cache array on the object
    this.parseAllDescriptions = function() {
        if (StringService.count() > 0) {
            for (var i = 0, l = maps.length; i < l; i++) {
                maps[i].parseDescription();
            }
            this.descriptionsParsed = true;
            this.lastModified = Date.now();
            console.log("Description parsing complete");
        }
    }

    // Check if a map is a weapon
    this.isWeapon = function(map) {
        // Must be an item, a primary 4 weapon, or a paired sword weapon
        return ((map.type == 0) && ((map.id >= 720897 && map.id <= 983040) || (map.id >= 1441792 && map.id <= 1572864)));
    }

    // Create a separate map, will not be in list until added
    this.create = function() {
        return new MapItem();
    }

    // Add a map to the list
    this.add = function(newMap) {
        maps.push(newMap);
        maps = ArrayExt.sort(maps, ['type', 'id']);
        this.lastModified = Date.now(); // Last time array was updated
    }

    // Remove a map
    this.remove = function(id) {
        for (var i = 0, l = maps.length; i < l; i++) {
            if (maps[i].id == id) {
                maps.splice(i, 1); // remove it
                break;
            }
        }
        this.lastModified = Date.now(); // Set last modified
    }

    // Import the map.bin file. returns false if invalid file, true on successful import
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
        var currentIndex = this.header().length; // Start after header

        // Store the entry count (according the file)
        var count = view.getUint32(currentIndex, true);
        currentIndex += 4;

        // String entries
        var entries = [];

        // Read the entries
        while (currentIndex < view.byteLength) {
            var entry = new MapItem();
            var stringLength; // Length of current string being parsed

            entry.id = view.getUint32(currentIndex, true);
            currentIndex += 4;

            entry.type = view.getUint32(currentIndex, true);
            currentIndex += 4;

            entry.unknown1 = view.getUint16(currentIndex, true);
            currentIndex += 2;

            entry.unknown2 = view.getUint16(currentIndex, true);
            currentIndex += 2;

            entry.icon = view.getUint32(currentIndex, true);
            currentIndex += 4;

            entry.rarity = view.getUint32(currentIndex, true);
            currentIndex += 4;

            entry.unknown3 = view.getUint32(currentIndex, true);
            currentIndex += 4;

            stringLength = view.getUint16(currentIndex, true);
            currentIndex += 2;
            entry.english.name = String.fromCharCode.apply(null, new Uint16Array(fileContents, currentIndex, stringLength));
            currentIndex += stringLength * 2;
            stringLength = view.getUint16(currentIndex, true);
            currentIndex += 2;
            entry.english.snippet = String.fromCharCode.apply(null, new Uint16Array(fileContents, currentIndex, stringLength));
            currentIndex += stringLength * 2;

            stringLength = view.getUint16(currentIndex, true);
            currentIndex += 2;
            entry.tradChinese.name = String.fromCharCode.apply(null, new Uint16Array(fileContents, currentIndex, stringLength));
            currentIndex += stringLength * 2;
            stringLength = view.getUint16(currentIndex, true);
            currentIndex += 2;
            entry.tradChinese.snippet = String.fromCharCode.apply(null, new Uint16Array(fileContents, currentIndex, stringLength));
            currentIndex += stringLength * 2;

            stringLength = view.getUint16(currentIndex, true);
            currentIndex += 2;
            entry.simpChinese.name = String.fromCharCode.apply(null, new Uint16Array(fileContents, currentIndex, stringLength));
            currentIndex += stringLength * 2;
            stringLength = view.getUint16(currentIndex, true);
            currentIndex += 2;
            entry.simpChinese.snippet = String.fromCharCode.apply(null, new Uint16Array(fileContents, currentIndex, stringLength));
            currentIndex += stringLength * 2;

            stringLength = view.getUint16(currentIndex, true);
            currentIndex += 2;
            entry.malaysian.name = String.fromCharCode.apply(null, new Uint16Array(fileContents, currentIndex, stringLength));
            currentIndex += stringLength * 2;
            stringLength = view.getUint16(currentIndex, true);
            currentIndex += 2;
            entry.malaysian.snippet = String.fromCharCode.apply(null, new Uint16Array(fileContents, currentIndex, stringLength));
            currentIndex += stringLength * 2;

            var descriptionLength = view.getUint16(currentIndex, true);
            currentIndex += 2;

            for (var i = 0; i < descriptionLength; i += 6) {
                var descriptionChunk = Array.apply([], new Uint16Array(fileContents, currentIndex, 3));
                entry.description.raw.push(descriptionChunk);
                currentIndex += 6;
            }

            // Trim description
            entry.trimDescription();

            entries.push(entry);
        }

        maps = ArrayExt.sort(entries, ['type', 'id']);
        this.lastModified = Date.now(); // Last time array was updated
        this.descriptionsParsed = false;
        this.iconsImported = false;

        $rootScope.$apply(function() {
            $rootScope.mapsLoaded = true;
        });

        return true;
    }

    // Export a tab seperated value document.
    // Category options: "items", "powers"
    this.exportTSV = function(category) {
        var categories = { "items": 0, "powers": 2};
        var itemCategory = categories[category];
        var seperator = "\t";

        if (maps.length == 0) {
            return null;
        }

        // Parse item descriptions
        this.parseAllDescriptions();

        // Output
        var blobs = [];

        // Entries
        for (var i = 0, len = maps.length; i < len; i++) {
            if (maps[i].type != itemCategory) {
                continue; // Not the right kind of map
            }

            if (maps[i].type == categories["powers"] && maps[i].id <= 1000) {
                continue; // Only output player powers
            }
            
            blobs.push(
                [
                    maps[i].id, 
                    maps[i].english.name, 
                    maps[i].rarity, 
                    maps[i].description.readable.join("  "), 
                    maps[i].english.snippet
                ].join(seperator),
                '\n'
            );
        }

        return new Blob(blobs);
    }

    // Export a JSON document.
    // Category options: "items", "powers"
    this.exportJSON = function(category) {
        var categories = { "items": 0, "powers": 2};
        var itemCategory = categories[category];

        if (maps.length == 0) {
            return null;
        }

        // Parse item descriptions
        this.parseAllDescriptions();

        // Output
        var blobs = [];

        // Entries
        for (var i = 0, len = maps.length; i < len; i++) {
            if (maps[i].type != itemCategory) {
                continue; // Not the right kind of map
            }

            if (maps[i].type == categories["powers"] && maps[i].id <= 1000) {
                continue; // Only output player powers
            }
            
            blobs.push(maps[i]);
        }

        var json = JSON.stringify(blobs, null, 2);

        return new Blob([json]);
    }

    // Export map.bin file
    this.export = function() {
        if (maps.length == 0) {
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

        // Header
        var header = new Uint8Array(this.header());
        // Count
        var count = new Uint32Array([maps.length]);
        // Output
        var blobs = [];

        // Entries
        for (var i = 0, len = maps.length; i < len; i++) {

            blobs.push(
                new Uint32Array([
                    parseInt(maps[i].id),
                    parseInt(maps[i].type)
                ]),
                new Uint16Array([
                    parseInt(maps[i].unknown1),
                    parseInt(maps[i].unknown2)
                ]),
                new Uint32Array([
                    parseInt(maps[i].icon.id),
                    parseInt(maps[i].rarity),
                    parseInt(maps[i].unknown3)
                ]),
                new Uint16Array([maps[i].english.name.length]),
                str2ab(maps[i].english.name),
                new Uint16Array([maps[i].english.snippet.length]),
                str2ab(maps[i].english.snippet),
                new Uint16Array([maps[i].tradChinese.name.length]),
                str2ab(maps[i].tradChinese.name),
                new Uint16Array([maps[i].tradChinese.snippet.length]),
                str2ab(maps[i].tradChinese.snippet),
                new Uint16Array([maps[i].simpChinese.name.length]),
                str2ab(maps[i].simpChinese.name),
                new Uint16Array([maps[i].simpChinese.snippet.length]),
                str2ab(maps[i].simpChinese.snippet),
                new Uint16Array([maps[i].malaysian.name.length]),
                str2ab(maps[i].malaysian.name),
                new Uint16Array([maps[i].malaysian.snippet.length]),
                str2ab(maps[i].malaysian.snippet),
                new Uint16Array([maps[i].description.raw.length * 6])
            );

            // Trim description
            maps[i].trimDescription();

            var desc = new Uint16Array(maps[i].description.raw.length * 3);
            for (var j = 0, k = 0, jlen = maps[i].description.raw.length; j < jlen; j++) {
                desc[k++] = maps[i].description.raw[j][0];
                desc[k++] = maps[i].description.raw[j][1];
                desc[k++] = maps[i].description.raw[j][2];
            }
            blobs.push(desc);
        }

        return new Blob([header, count].concat(blobs));
    }

    // Map item object constructor
    var MapItem = function() {
        this.id = 0;
        this.type = 0;
        this.unknown1 = 0;
        this.unknown2 = 0;
        this.icon = 0;
        this.rarity = 0;
        this.unknown3 = 0;
        this.english = {
            name: "",
            snippet: ""
        }
        this.tradChinese = {
            name: "",
            snippet: ""
        }
        this.simpChinese = {
            name: "",
            snippet: ""
        }
        this.malaysian = {
            name: "",
            snippet: ""
        }
        this.description = {
            raw: [],
            readable: []
        }
    }

    // Remove all empty descriptors from a description
    MapItem.prototype.trimDescription = function() {
        var i = this.description.raw.length;
        while (i--) {
            if (this.description.raw[i][0] == 0) {
                this.description.raw.splice(i, 1);
            }
        }
    }

    // Convert raw description to readable
    MapItem.prototype.parseDescription = function() {
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
    MapItem.prototype.parseDescriptor = function(descriptor) {
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

    // Service level function for parsing descriptors from outside a mapitem
    this.parseDescriptor = function(descriptor) {
    	var instance = this.create();
    	return instance.parseDescriptor(descriptor);
    }
});
