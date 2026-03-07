var app = angular.module('array.services', []);

app.service('ArrayExt', function($rootScope) {
    
    // Sort the array by a specific object key or array of keys
    this.sort = function(array, key) {
    	return array.sort(function(a, b) {
    		if (Array.isArray(key) && key.length > 1) {
    			var ret = a[key[0]] - b[key[0]] || a[key[1]] - b[key[1]];
    			for (var i = 2, l = key.length; i < l; l++) {
    				ret = ret || a[key[i]] - b[key[i]];
    			}
    			return ret;
    		} else {
    			if (Array.isArray(key) && key.length == 1) {
    				key = key[0]; // no longer an array
    			}
    			return ((a[key] < b[key]) ? -1 : ((a[key] > b[key]) ? 1 : 0));
    		}
    	});
    }

    // Binary search an object array by object key, will only work on primary key
    this.binarySearch = function(array, key, val) {
        var lo = 0,
            hi = array.length - 1,
            mid,
            element;
        while (lo <= hi) {
            mid = ((lo + hi) >> 1);
            element = array[mid][key];
            if (element < val) {
                lo = mid + 1;
            } else if (element > val) {
                hi = mid - 1;
            } else {
                return mid;
            }
        }
        return -1;
    }
});
