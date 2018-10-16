(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Argent = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var assign = make_assign();
  var create = make_create();
  var trim = make_trim();
  var Global = (typeof window !== 'undefined' ? window : commonjsGlobal);

  var util = {
  	assign: assign,
  	create: create,
  	trim: trim,
  	bind: bind,
  	slice: slice,
  	each: each,
  	map: map,
  	pluck: pluck,
  	isList: isList,
  	isFunction: isFunction,
  	isObject: isObject,
  	Global: Global
  };

  function make_assign() {
  	if (Object.assign) {
  		return Object.assign
  	} else {
  		return function shimAssign(obj, props1, props2, etc) {
  			for (var i = 1; i < arguments.length; i++) {
  				each(Object(arguments[i]), function(val, key) {
  					obj[key] = val;
  				});
  			}			
  			return obj
  		}
  	}
  }

  function make_create() {
  	if (Object.create) {
  		return function create(obj, assignProps1, assignProps2, etc) {
  			var assignArgsList = slice(arguments, 1);
  			return assign.apply(this, [Object.create(obj)].concat(assignArgsList))
  		}
  	} else {
  		function F() {} // eslint-disable-line no-inner-declarations
  		return function create(obj, assignProps1, assignProps2, etc) {
  			var assignArgsList = slice(arguments, 1);
  			F.prototype = obj;
  			return assign.apply(this, [new F()].concat(assignArgsList))
  		}
  	}
  }

  function make_trim() {
  	if (String.prototype.trim) {
  		return function trim(str) {
  			return String.prototype.trim.call(str)
  		}
  	} else {
  		return function trim(str) {
  			return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
  		}
  	}
  }

  function bind(obj, fn) {
  	return function() {
  		return fn.apply(obj, Array.prototype.slice.call(arguments, 0))
  	}
  }

  function slice(arr, index) {
  	return Array.prototype.slice.call(arr, index || 0)
  }

  function each(obj, fn) {
  	pluck(obj, function(val, key) {
  		fn(val, key);
  		return false
  	});
  }

  function map(obj, fn) {
  	var res = (isList(obj) ? [] : {});
  	pluck(obj, function(v, k) {
  		res[k] = fn(v, k);
  		return false
  	});
  	return res
  }

  function pluck(obj, fn) {
  	if (isList(obj)) {
  		for (var i=0; i<obj.length; i++) {
  			if (fn(obj[i], i)) {
  				return obj[i]
  			}
  		}
  	} else {
  		for (var key in obj) {
  			if (obj.hasOwnProperty(key)) {
  				if (fn(obj[key], key)) {
  					return obj[key]
  				}
  			}
  		}
  	}
  }

  function isList(val) {
  	return (val != null && typeof val != 'function' && typeof val.length == 'number')
  }

  function isFunction(val) {
  	return val && {}.toString.call(val) === '[object Function]'
  }

  function isObject(val) {
  	return val && {}.toString.call(val) === '[object Object]'
  }

  var slice$1 = util.slice;
  var pluck$1 = util.pluck;
  var each$1 = util.each;
  var bind$1 = util.bind;
  var create$1 = util.create;
  var isList$1 = util.isList;
  var isFunction$1 = util.isFunction;
  var isObject$1 = util.isObject;

  var storeEngine = {
  	createStore: createStore
  };

  var storeAPI = {
  	version: '2.0.12',
  	enabled: false,
  	
  	// get returns the value of the given key. If that value
  	// is undefined, it returns optionalDefaultValue instead.
  	get: function(key, optionalDefaultValue) {
  		var data = this.storage.read(this._namespacePrefix + key);
  		return this._deserialize(data, optionalDefaultValue)
  	},

  	// set will store the given value at key and returns value.
  	// Calling set with value === undefined is equivalent to calling remove.
  	set: function(key, value) {
  		if (value === undefined) {
  			return this.remove(key)
  		}
  		this.storage.write(this._namespacePrefix + key, this._serialize(value));
  		return value
  	},

  	// remove deletes the key and value stored at the given key.
  	remove: function(key) {
  		this.storage.remove(this._namespacePrefix + key);
  	},

  	// each will call the given callback once for each key-value pair
  	// in this store.
  	each: function(callback) {
  		var self = this;
  		this.storage.each(function(val, namespacedKey) {
  			callback.call(self, self._deserialize(val), (namespacedKey || '').replace(self._namespaceRegexp, ''));
  		});
  	},

  	// clearAll will remove all the stored key-value pairs in this store.
  	clearAll: function() {
  		this.storage.clearAll();
  	},

  	// additional functionality that can't live in plugins
  	// ---------------------------------------------------

  	// hasNamespace returns true if this store instance has the given namespace.
  	hasNamespace: function(namespace) {
  		return (this._namespacePrefix == '__storejs_'+namespace+'_')
  	},

  	// createStore creates a store.js instance with the first
  	// functioning storage in the list of storage candidates,
  	// and applies the the given mixins to the instance.
  	createStore: function() {
  		return createStore.apply(this, arguments)
  	},
  	
  	addPlugin: function(plugin) {
  		this._addPlugin(plugin);
  	},
  	
  	namespace: function(namespace) {
  		return createStore(this.storage, this.plugins, namespace)
  	}
  };

  function _warn() {
  	var _console = (typeof console == 'undefined' ? null : console);
  	if (!_console) { return }
  	var fn = (_console.warn ? _console.warn : _console.log);
  	fn.apply(_console, arguments);
  }

  function createStore(storages, plugins, namespace) {
  	if (!namespace) {
  		namespace = '';
  	}
  	if (storages && !isList$1(storages)) {
  		storages = [storages];
  	}
  	if (plugins && !isList$1(plugins)) {
  		plugins = [plugins];
  	}

  	var namespacePrefix = (namespace ? '__storejs_'+namespace+'_' : '');
  	var namespaceRegexp = (namespace ? new RegExp('^'+namespacePrefix) : null);
  	var legalNamespaces = /^[a-zA-Z0-9_\-]*$/; // alpha-numeric + underscore and dash
  	if (!legalNamespaces.test(namespace)) {
  		throw new Error('store.js namespaces can only have alphanumerics + underscores and dashes')
  	}
  	
  	var _privateStoreProps = {
  		_namespacePrefix: namespacePrefix,
  		_namespaceRegexp: namespaceRegexp,

  		_testStorage: function(storage) {
  			try {
  				var testStr = '__storejs__test__';
  				storage.write(testStr, testStr);
  				var ok = (storage.read(testStr) === testStr);
  				storage.remove(testStr);
  				return ok
  			} catch(e) {
  				return false
  			}
  		},

  		_assignPluginFnProp: function(pluginFnProp, propName) {
  			var oldFn = this[propName];
  			this[propName] = function pluginFn() {
  				var args = slice$1(arguments, 0);
  				var self = this;

  				// super_fn calls the old function which was overwritten by
  				// this mixin.
  				function super_fn() {
  					if (!oldFn) { return }
  					each$1(arguments, function(arg, i) {
  						args[i] = arg;
  					});
  					return oldFn.apply(self, args)
  				}

  				// Give mixing function access to super_fn by prefixing all mixin function
  				// arguments with super_fn.
  				var newFnArgs = [super_fn].concat(args);

  				return pluginFnProp.apply(self, newFnArgs)
  			};
  		},

  		_serialize: function(obj) {
  			return JSON.stringify(obj)
  		},

  		_deserialize: function(strVal, defaultVal) {
  			if (!strVal) { return defaultVal }
  			// It is possible that a raw string value has been previously stored
  			// in a storage without using store.js, meaning it will be a raw
  			// string value instead of a JSON serialized string. By defaulting
  			// to the raw string value in case of a JSON parse error, we allow
  			// for past stored values to be forwards-compatible with store.js
  			var val = '';
  			try { val = JSON.parse(strVal); }
  			catch(e) { val = strVal; }

  			return (val !== undefined ? val : defaultVal)
  		},
  		
  		_addStorage: function(storage) {
  			if (this.enabled) { return }
  			if (this._testStorage(storage)) {
  				this.storage = storage;
  				this.enabled = true;
  			}
  		},

  		_addPlugin: function(plugin) {
  			var self = this;

  			// If the plugin is an array, then add all plugins in the array.
  			// This allows for a plugin to depend on other plugins.
  			if (isList$1(plugin)) {
  				each$1(plugin, function(plugin) {
  					self._addPlugin(plugin);
  				});
  				return
  			}

  			// Keep track of all plugins we've seen so far, so that we
  			// don't add any of them twice.
  			var seenPlugin = pluck$1(this.plugins, function(seenPlugin) {
  				return (plugin === seenPlugin)
  			});
  			if (seenPlugin) {
  				return
  			}
  			this.plugins.push(plugin);

  			// Check that the plugin is properly formed
  			if (!isFunction$1(plugin)) {
  				throw new Error('Plugins must be function values that return objects')
  			}

  			var pluginProperties = plugin.call(this);
  			if (!isObject$1(pluginProperties)) {
  				throw new Error('Plugins must return an object of function properties')
  			}

  			// Add the plugin function properties to this store instance.
  			each$1(pluginProperties, function(pluginFnProp, propName) {
  				if (!isFunction$1(pluginFnProp)) {
  					throw new Error('Bad plugin property: '+propName+' from plugin '+plugin.name+'. Plugins should only return functions.')
  				}
  				self._assignPluginFnProp(pluginFnProp, propName);
  			});
  		},
  		
  		// Put deprecated properties in the private API, so as to not expose it to accidential
  		// discovery through inspection of the store object.
  		
  		// Deprecated: addStorage
  		addStorage: function(storage) {
  			_warn('store.addStorage(storage) is deprecated. Use createStore([storages])');
  			this._addStorage(storage);
  		}
  	};

  	var store = create$1(_privateStoreProps, storeAPI, {
  		plugins: []
  	});
  	store.raw = {};
  	each$1(store, function(prop, propName) {
  		if (isFunction$1(prop)) {
  			store.raw[propName] = bind$1(store, prop);			
  		}
  	});
  	each$1(storages, function(storage) {
  		store._addStorage(storage);
  	});
  	each$1(plugins, function(plugin) {
  		store._addPlugin(plugin);
  	});
  	return store
  }

  var Global$1 = util.Global;

  var localStorage_1 = {
  	name: 'localStorage',
  	read: read,
  	write: write,
  	each: each$2,
  	remove: remove,
  	clearAll: clearAll,
  };

  function localStorage() {
  	return Global$1.localStorage
  }

  function read(key) {
  	return localStorage().getItem(key)
  }

  function write(key, data) {
  	return localStorage().setItem(key, data)
  }

  function each$2(fn) {
  	for (var i = localStorage().length - 1; i >= 0; i--) {
  		var key = localStorage().key(i);
  		fn(read(key), key);
  	}
  }

  function remove(key) {
  	return localStorage().removeItem(key)
  }

  function clearAll() {
  	return localStorage().clear()
  }

  // oldFF-globalStorage provides storage for Firefox
  // versions 6 and 7, where no localStorage, etc
  // is available.


  var Global$2 = util.Global;

  var oldFFGlobalStorage = {
  	name: 'oldFF-globalStorage',
  	read: read$1,
  	write: write$1,
  	each: each$3,
  	remove: remove$1,
  	clearAll: clearAll$1,
  };

  var globalStorage = Global$2.globalStorage;

  function read$1(key) {
  	return globalStorage[key]
  }

  function write$1(key, data) {
  	globalStorage[key] = data;
  }

  function each$3(fn) {
  	for (var i = globalStorage.length - 1; i >= 0; i--) {
  		var key = globalStorage.key(i);
  		fn(globalStorage[key], key);
  	}
  }

  function remove$1(key) {
  	return globalStorage.removeItem(key)
  }

  function clearAll$1() {
  	each$3(function(key, _) {
  		delete globalStorage[key];
  	});
  }

  // oldIE-userDataStorage provides storage for Internet Explorer
  // versions 6 and 7, where no localStorage, sessionStorage, etc
  // is available.


  var Global$3 = util.Global;

  var oldIEUserDataStorage = {
  	name: 'oldIE-userDataStorage',
  	write: write$2,
  	read: read$2,
  	each: each$4,
  	remove: remove$2,
  	clearAll: clearAll$2,
  };

  var storageName = 'storejs';
  var doc = Global$3.document;
  var _withStorageEl = _makeIEStorageElFunction();
  var disable = (Global$3.navigator ? Global$3.navigator.userAgent : '').match(/ (MSIE 8|MSIE 9|MSIE 10)\./); // MSIE 9.x, MSIE 10.x

  function write$2(unfixedKey, data) {
  	if (disable) { return }
  	var fixedKey = fixKey(unfixedKey);
  	_withStorageEl(function(storageEl) {
  		storageEl.setAttribute(fixedKey, data);
  		storageEl.save(storageName);
  	});
  }

  function read$2(unfixedKey) {
  	if (disable) { return }
  	var fixedKey = fixKey(unfixedKey);
  	var res = null;
  	_withStorageEl(function(storageEl) {
  		res = storageEl.getAttribute(fixedKey);
  	});
  	return res
  }

  function each$4(callback) {
  	_withStorageEl(function(storageEl) {
  		var attributes = storageEl.XMLDocument.documentElement.attributes;
  		for (var i=attributes.length-1; i>=0; i--) {
  			var attr = attributes[i];
  			callback(storageEl.getAttribute(attr.name), attr.name);
  		}
  	});
  }

  function remove$2(unfixedKey) {
  	var fixedKey = fixKey(unfixedKey);
  	_withStorageEl(function(storageEl) {
  		storageEl.removeAttribute(fixedKey);
  		storageEl.save(storageName);
  	});
  }

  function clearAll$2() {
  	_withStorageEl(function(storageEl) {
  		var attributes = storageEl.XMLDocument.documentElement.attributes;
  		storageEl.load(storageName);
  		for (var i=attributes.length-1; i>=0; i--) {
  			storageEl.removeAttribute(attributes[i].name);
  		}
  		storageEl.save(storageName);
  	});
  }

  // Helpers
  //////////

  // In IE7, keys cannot start with a digit or contain certain chars.
  // See https://github.com/marcuswestin/store.js/issues/40
  // See https://github.com/marcuswestin/store.js/issues/83
  var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
  function fixKey(key) {
  	return key.replace(/^\d/, '___$&').replace(forbiddenCharsRegex, '___')
  }

  function _makeIEStorageElFunction() {
  	if (!doc || !doc.documentElement || !doc.documentElement.addBehavior) {
  		return null
  	}
  	var scriptTag = 'script',
  		storageOwner,
  		storageContainer,
  		storageEl;

  	// Since #userData storage applies only to specific paths, we need to
  	// somehow link our data to a specific path.  We choose /favicon.ico
  	// as a pretty safe option, since all browsers already make a request to
  	// this URL anyway and being a 404 will not hurt us here.  We wrap an
  	// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
  	// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
  	// since the iframe access rules appear to allow direct access and
  	// manipulation of the document element, even for a 404 page.  This
  	// document can be used instead of the current document (which would
  	// have been limited to the current path) to perform #userData storage.
  	try {
  		/* global ActiveXObject */
  		storageContainer = new ActiveXObject('htmlfile');
  		storageContainer.open();
  		storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>');
  		storageContainer.close();
  		storageOwner = storageContainer.w.frames[0].document;
  		storageEl = storageOwner.createElement('div');
  	} catch(e) {
  		// somehow ActiveXObject instantiation failed (perhaps some special
  		// security settings or otherwse), fall back to per-path storage
  		storageEl = doc.createElement('div');
  		storageOwner = doc.body;
  	}

  	return function(storeFunction) {
  		var args = [].slice.call(arguments, 0);
  		args.unshift(storageEl);
  		// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
  		// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
  		storageOwner.appendChild(storageEl);
  		storageEl.addBehavior('#default#userData');
  		storageEl.load(storageName);
  		storeFunction.apply(this, args);
  		storageOwner.removeChild(storageEl);
  		return
  	}
  }

  // cookieStorage is useful Safari private browser mode, where localStorage
  // doesn't work but cookies do. This implementation is adopted from
  // https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage


  var Global$4 = util.Global;
  var trim$1 = util.trim;

  var cookieStorage = {
  	name: 'cookieStorage',
  	read: read$3,
  	write: write$3,
  	each: each$5,
  	remove: remove$3,
  	clearAll: clearAll$3,
  };

  var doc$1 = Global$4.document;

  function read$3(key) {
  	if (!key || !_has(key)) { return null }
  	var regexpStr = "(?:^|.*;\\s*)" +
  		escape(key).replace(/[\-\.\+\*]/g, "\\$&") +
  		"\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*";
  	return unescape(doc$1.cookie.replace(new RegExp(regexpStr), "$1"))
  }

  function each$5(callback) {
  	var cookies = doc$1.cookie.split(/; ?/g);
  	for (var i = cookies.length - 1; i >= 0; i--) {
  		if (!trim$1(cookies[i])) {
  			continue
  		}
  		var kvp = cookies[i].split('=');
  		var key = unescape(kvp[0]);
  		var val = unescape(kvp[1]);
  		callback(val, key);
  	}
  }

  function write$3(key, data) {
  	if(!key) { return }
  	doc$1.cookie = escape(key) + "=" + escape(data) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
  }

  function remove$3(key) {
  	if (!key || !_has(key)) {
  		return
  	}
  	doc$1.cookie = escape(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  }

  function clearAll$3() {
  	each$5(function(_, key) {
  		remove$3(key);
  	});
  }

  function _has(key) {
  	return (new RegExp("(?:^|;\\s*)" + escape(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(doc$1.cookie)
  }

  var Global$5 = util.Global;

  var sessionStorage_1 = {
  	name: 'sessionStorage',
  	read: read$4,
  	write: write$4,
  	each: each$6,
  	remove: remove$4,
  	clearAll: clearAll$4
  };

  function sessionStorage() {
  	return Global$5.sessionStorage
  }

  function read$4(key) {
  	return sessionStorage().getItem(key)
  }

  function write$4(key, data) {
  	return sessionStorage().setItem(key, data)
  }

  function each$6(fn) {
  	for (var i = sessionStorage().length - 1; i >= 0; i--) {
  		var key = sessionStorage().key(i);
  		fn(read$4(key), key);
  	}
  }

  function remove$4(key) {
  	return sessionStorage().removeItem(key)
  }

  function clearAll$4() {
  	return sessionStorage().clear()
  }

  // memoryStorage is a useful last fallback to ensure that the store
  // is functions (meaning store.get(), store.set(), etc will all function).
  // However, stored values will not persist when the browser navigates to
  // a new page or reloads the current page.

  var memoryStorage_1 = {
  	name: 'memoryStorage',
  	read: read$5,
  	write: write$5,
  	each: each$7,
  	remove: remove$5,
  	clearAll: clearAll$5,
  };

  var memoryStorage = {};

  function read$5(key) {
  	return memoryStorage[key]
  }

  function write$5(key, data) {
  	memoryStorage[key] = data;
  }

  function each$7(callback) {
  	for (var key in memoryStorage) {
  		if (memoryStorage.hasOwnProperty(key)) {
  			callback(memoryStorage[key], key);
  		}
  	}
  }

  function remove$5(key) {
  	delete memoryStorage[key];
  }

  function clearAll$5(key) {
  	memoryStorage = {};
  }

  var all = [
  	// Listed in order of usage preference
  	localStorage_1,
  	oldFFGlobalStorage,
  	oldIEUserDataStorage,
  	cookieStorage,
  	sessionStorage_1,
  	memoryStorage_1
  ];

  /* eslint-disable */

  //  json2.js
  //  2016-10-28
  //  Public Domain.
  //  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
  //  See http://www.JSON.org/js.html
  //  This code should be minified before deployment.
  //  See http://javascript.crockford.com/jsmin.html

  //  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
  //  NOT CONTROL.

  //  This file creates a global JSON object containing two methods: stringify
  //  and parse. This file provides the ES5 JSON capability to ES3 systems.
  //  If a project might run on IE8 or earlier, then this file should be included.
  //  This file does nothing on ES5 systems.

  //      JSON.stringify(value, replacer, space)
  //          value       any JavaScript value, usually an object or array.
  //          replacer    an optional parameter that determines how object
  //                      values are stringified for objects. It can be a
  //                      function or an array of strings.
  //          space       an optional parameter that specifies the indentation
  //                      of nested structures. If it is omitted, the text will
  //                      be packed without extra whitespace. If it is a number,
  //                      it will specify the number of spaces to indent at each
  //                      level. If it is a string (such as "\t" or "&nbsp;"),
  //                      it contains the characters used to indent at each level.
  //          This method produces a JSON text from a JavaScript value.
  //          When an object value is found, if the object contains a toJSON
  //          method, its toJSON method will be called and the result will be
  //          stringified. A toJSON method does not serialize: it returns the
  //          value represented by the name/value pair that should be serialized,
  //          or undefined if nothing should be serialized. The toJSON method
  //          will be passed the key associated with the value, and this will be
  //          bound to the value.

  //          For example, this would serialize Dates as ISO strings.

  //              Date.prototype.toJSON = function (key) {
  //                  function f(n) {
  //                      // Format integers to have at least two digits.
  //                      return (n < 10)
  //                          ? "0" + n
  //                          : n;
  //                  }
  //                  return this.getUTCFullYear()   + "-" +
  //                       f(this.getUTCMonth() + 1) + "-" +
  //                       f(this.getUTCDate())      + "T" +
  //                       f(this.getUTCHours())     + ":" +
  //                       f(this.getUTCMinutes())   + ":" +
  //                       f(this.getUTCSeconds())   + "Z";
  //              };

  //          You can provide an optional replacer method. It will be passed the
  //          key and value of each member, with this bound to the containing
  //          object. The value that is returned from your method will be
  //          serialized. If your method returns undefined, then the member will
  //          be excluded from the serialization.

  //          If the replacer parameter is an array of strings, then it will be
  //          used to select the members to be serialized. It filters the results
  //          such that only members with keys listed in the replacer array are
  //          stringified.

  //          Values that do not have JSON representations, such as undefined or
  //          functions, will not be serialized. Such values in objects will be
  //          dropped; in arrays they will be replaced with null. You can use
  //          a replacer function to replace those with JSON values.

  //          JSON.stringify(undefined) returns undefined.

  //          The optional space parameter produces a stringification of the
  //          value that is filled with line breaks and indentation to make it
  //          easier to read.

  //          If the space parameter is a non-empty string, then that string will
  //          be used for indentation. If the space parameter is a number, then
  //          the indentation will be that many spaces.

  //          Example:

  //          text = JSON.stringify(["e", {pluribus: "unum"}]);
  //          // text is '["e",{"pluribus":"unum"}]'

  //          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
  //          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

  //          text = JSON.stringify([new Date()], function (key, value) {
  //              return this[key] instanceof Date
  //                  ? "Date(" + this[key] + ")"
  //                  : value;
  //          });
  //          // text is '["Date(---current time---)"]'

  //      JSON.parse(text, reviver)
  //          This method parses a JSON text to produce an object or array.
  //          It can throw a SyntaxError exception.

  //          The optional reviver parameter is a function that can filter and
  //          transform the results. It receives each of the keys and values,
  //          and its return value is used instead of the original value.
  //          If it returns what it received, then the structure is not modified.
  //          If it returns undefined then the member is deleted.

  //          Example:

  //          // Parse the text. Values that look like ISO date strings will
  //          // be converted to Date objects.

  //          myData = JSON.parse(text, function (key, value) {
  //              var a;
  //              if (typeof value === "string") {
  //                  a =
  //   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
  //                  if (a) {
  //                      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
  //                          +a[5], +a[6]));
  //                  }
  //              }
  //              return value;
  //          });

  //          myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
  //              var d;
  //              if (typeof value === "string" &&
  //                      value.slice(0, 5) === "Date(" &&
  //                      value.slice(-1) === ")") {
  //                  d = new Date(value.slice(5, -1));
  //                  if (d) {
  //                      return d;
  //                  }
  //              }
  //              return value;
  //          });

  //  This is a reference implementation. You are free to copy, modify, or
  //  redistribute.

  /*jslint
      eval, for, this
  */

  /*property
      JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
      getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
      lastIndex, length, parse, prototype, push, replace, slice, stringify,
      test, toJSON, toString, valueOf
  */


  // Create a JSON object only if one does not already exist. We create the
  // methods in a closure to avoid creating global variables.

  if (typeof JSON !== "object") {
      JSON = {};
  }

  (function () {

      var rx_one = /^[\],:{}\s]*$/;
      var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
      var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
      var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
      var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
      var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

      function f(n) {
          // Format integers to have at least two digits.
          return n < 10
              ? "0" + n
              : n;
      }

      function this_value() {
          return this.valueOf();
      }

      if (typeof Date.prototype.toJSON !== "function") {

          Date.prototype.toJSON = function () {

              return isFinite(this.valueOf())
                  ? this.getUTCFullYear() + "-" +
                          f(this.getUTCMonth() + 1) + "-" +
                          f(this.getUTCDate()) + "T" +
                          f(this.getUTCHours()) + ":" +
                          f(this.getUTCMinutes()) + ":" +
                          f(this.getUTCSeconds()) + "Z"
                  : null;
          };

          Boolean.prototype.toJSON = this_value;
          Number.prototype.toJSON = this_value;
          String.prototype.toJSON = this_value;
      }

      var gap;
      var indent;
      var meta;
      var rep;


      function quote(string) {

  // If the string contains no control characters, no quote characters, and no
  // backslash characters, then we can safely slap some quotes around it.
  // Otherwise we must also replace the offending characters with safe escape
  // sequences.

          rx_escapable.lastIndex = 0;
          return rx_escapable.test(string)
              ? "\"" + string.replace(rx_escapable, function (a) {
                  var c = meta[a];
                  return typeof c === "string"
                      ? c
                      : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
              }) + "\""
              : "\"" + string + "\"";
      }


      function str(key, holder) {

  // Produce a string from holder[key].

          var i;          // The loop counter.
          var k;          // The member key.
          var v;          // The member value.
          var length;
          var mind = gap;
          var partial;
          var value = holder[key];

  // If the value has a toJSON method, call it to obtain a replacement value.

          if (value && typeof value === "object" &&
                  typeof value.toJSON === "function") {
              value = value.toJSON(key);
          }

  // If we were called with a replacer function, then call the replacer to
  // obtain a replacement value.

          if (typeof rep === "function") {
              value = rep.call(holder, key, value);
          }

  // What happens next depends on the value's type.

          switch (typeof value) {
          case "string":
              return quote(value);

          case "number":

  // JSON numbers must be finite. Encode non-finite numbers as null.

              return isFinite(value)
                  ? String(value)
                  : "null";

          case "boolean":
          case "null":

  // If the value is a boolean or null, convert it to a string. Note:
  // typeof null does not produce "null". The case is included here in
  // the remote chance that this gets fixed someday.

              return String(value);

  // If the type is "object", we might be dealing with an object or an array or
  // null.

          case "object":

  // Due to a specification blunder in ECMAScript, typeof null is "object",
  // so watch out for that case.

              if (!value) {
                  return "null";
              }

  // Make an array to hold the partial results of stringifying this object value.

              gap += indent;
              partial = [];

  // Is the value an array?

              if (Object.prototype.toString.apply(value) === "[object Array]") {

  // The value is an array. Stringify every element. Use null as a placeholder
  // for non-JSON values.

                  length = value.length;
                  for (i = 0; i < length; i += 1) {
                      partial[i] = str(i, value) || "null";
                  }

  // Join all of the elements together, separated with commas, and wrap them in
  // brackets.

                  v = partial.length === 0
                      ? "[]"
                      : gap
                          ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                          : "[" + partial.join(",") + "]";
                  gap = mind;
                  return v;
              }

  // If the replacer is an array, use it to select the members to be stringified.

              if (rep && typeof rep === "object") {
                  length = rep.length;
                  for (i = 0; i < length; i += 1) {
                      if (typeof rep[i] === "string") {
                          k = rep[i];
                          v = str(k, value);
                          if (v) {
                              partial.push(quote(k) + (
                                  gap
                                      ? ": "
                                      : ":"
                              ) + v);
                          }
                      }
                  }
              } else {

  // Otherwise, iterate through all of the keys in the object.

                  for (k in value) {
                      if (Object.prototype.hasOwnProperty.call(value, k)) {
                          v = str(k, value);
                          if (v) {
                              partial.push(quote(k) + (
                                  gap
                                      ? ": "
                                      : ":"
                              ) + v);
                          }
                      }
                  }
              }

  // Join all of the member texts together, separated with commas,
  // and wrap them in braces.

              v = partial.length === 0
                  ? "{}"
                  : gap
                      ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                      : "{" + partial.join(",") + "}";
              gap = mind;
              return v;
          }
      }

  // If the JSON object does not yet have a stringify method, give it one.

      if (typeof JSON.stringify !== "function") {
          meta = {    // table of character substitutions
              "\b": "\\b",
              "\t": "\\t",
              "\n": "\\n",
              "\f": "\\f",
              "\r": "\\r",
              "\"": "\\\"",
              "\\": "\\\\"
          };
          JSON.stringify = function (value, replacer, space) {

  // The stringify method takes a value and an optional replacer, and an optional
  // space parameter, and returns a JSON text. The replacer can be a function
  // that can replace values, or an array of strings that will select the keys.
  // A default replacer method can be provided. Use of the space parameter can
  // produce text that is more easily readable.

              var i;
              gap = "";
              indent = "";

  // If the space parameter is a number, make an indent string containing that
  // many spaces.

              if (typeof space === "number") {
                  for (i = 0; i < space; i += 1) {
                      indent += " ";
                  }

  // If the space parameter is a string, it will be used as the indent string.

              } else if (typeof space === "string") {
                  indent = space;
              }

  // If there is a replacer, it must be a function or an array.
  // Otherwise, throw an error.

              rep = replacer;
              if (replacer && typeof replacer !== "function" &&
                      (typeof replacer !== "object" ||
                      typeof replacer.length !== "number")) {
                  throw new Error("JSON.stringify");
              }

  // Make a fake root object containing our value under the key of "".
  // Return the result of stringifying the value.

              return str("", {"": value});
          };
      }


  // If the JSON object does not yet have a parse method, give it one.

      if (typeof JSON.parse !== "function") {
          JSON.parse = function (text, reviver) {

  // The parse method takes a text and an optional reviver function, and returns
  // a JavaScript value if the text is a valid JSON text.

              var j;

              function walk(holder, key) {

  // The walk method is used to recursively walk the resulting structure so
  // that modifications can be made.

                  var k;
                  var v;
                  var value = holder[key];
                  if (value && typeof value === "object") {
                      for (k in value) {
                          if (Object.prototype.hasOwnProperty.call(value, k)) {
                              v = walk(value, k);
                              if (v !== undefined) {
                                  value[k] = v;
                              } else {
                                  delete value[k];
                              }
                          }
                      }
                  }
                  return reviver.call(holder, key, value);
              }


  // Parsing happens in four stages. In the first stage, we replace certain
  // Unicode characters with escape sequences. JavaScript handles many characters
  // incorrectly, either silently deleting them, or treating them as line endings.

              text = String(text);
              rx_dangerous.lastIndex = 0;
              if (rx_dangerous.test(text)) {
                  text = text.replace(rx_dangerous, function (a) {
                      return "\\u" +
                              ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                  });
              }

  // In the second stage, we run the text against regular expressions that look
  // for non-JSON patterns. We are especially concerned with "()" and "new"
  // because they can cause invocation, and "=" because it can cause mutation.
  // But just to be safe, we want to reject all unexpected forms.

  // We split the second stage into 4 regexp operations in order to work around
  // crippling inefficiencies in IE's and Safari's regexp engines. First we
  // replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
  // replace all simple value tokens with "]" characters. Third, we delete all
  // open brackets that follow a colon or comma or that begin the text. Finally,
  // we look to see that the remaining characters are only whitespace or "]" or
  // "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

              if (
                  rx_one.test(
                      text
                          .replace(rx_two, "@")
                          .replace(rx_three, "]")
                          .replace(rx_four, "")
                  )
              ) {

  // In the third stage we use the eval function to compile the text into a
  // JavaScript structure. The "{" operator is subject to a syntactic ambiguity
  // in JavaScript: it can begin a block or an object literal. We wrap the text
  // in parens to eliminate the ambiguity.

                  j = eval("(" + text + ")");

  // In the optional fourth stage, we recursively walk the new structure, passing
  // each name/value pair to a reviver function for possible transformation.

                  return (typeof reviver === "function")
                      ? walk({"": j}, "")
                      : j;
              }

  // If the text is not JSON parseable, then a SyntaxError is thrown.

              throw new SyntaxError("JSON.parse");
          };
      }
  }());

  var json2 = json2Plugin;

  function json2Plugin() {
  	
  	return {}
  }

  var plugins = [json2];

  var store_legacy = storeEngine.createStore(all, plugins);

  var numeral = createCommonjsModule(function (module) {
  /*! @preserve
   * numeral.js
   * version : 2.0.6
   * author : Adam Draper
   * license : MIT
   * http://adamwdraper.github.com/Numeral-js/
   */

  (function (global, factory) {
      if (module.exports) {
          module.exports = factory();
      } else {
          global.numeral = factory();
      }
  }(commonjsGlobal, function () {
      /************************************
          Variables
      ************************************/

      var numeral,
          _,
          VERSION = '2.0.6',
          formats = {},
          locales = {},
          defaults = {
              currentLocale: 'en',
              zeroFormat: null,
              nullFormat: null,
              defaultFormat: '0,0',
              scalePercentBy100: true
          },
          options = {
              currentLocale: defaults.currentLocale,
              zeroFormat: defaults.zeroFormat,
              nullFormat: defaults.nullFormat,
              defaultFormat: defaults.defaultFormat,
              scalePercentBy100: defaults.scalePercentBy100
          };


      /************************************
          Constructors
      ************************************/

      // Numeral prototype object
      function Numeral(input, number) {
          this._input = input;

          this._value = number;
      }

      numeral = function(input) {
          var value,
              kind,
              unformatFunction,
              regexp;

          if (numeral.isNumeral(input)) {
              value = input.value();
          } else if (input === 0 || typeof input === 'undefined') {
              value = 0;
          } else if (input === null || _.isNaN(input)) {
              value = null;
          } else if (typeof input === 'string') {
              if (options.zeroFormat && input === options.zeroFormat) {
                  value = 0;
              } else if (options.nullFormat && input === options.nullFormat || !input.replace(/[^0-9]+/g, '').length) {
                  value = null;
              } else {
                  for (kind in formats) {
                      regexp = typeof formats[kind].regexps.unformat === 'function' ? formats[kind].regexps.unformat() : formats[kind].regexps.unformat;

                      if (regexp && input.match(regexp)) {
                          unformatFunction = formats[kind].unformat;

                          break;
                      }
                  }

                  unformatFunction = unformatFunction || numeral._.stringToNumber;

                  value = unformatFunction(input);
              }
          } else {
              value = Number(input)|| null;
          }

          return new Numeral(input, value);
      };

      // version number
      numeral.version = VERSION;

      // compare numeral object
      numeral.isNumeral = function(obj) {
          return obj instanceof Numeral;
      };

      // helper functions
      numeral._ = _ = {
          // formats numbers separators, decimals places, signs, abbreviations
          numberToFormat: function(value, format, roundingFunction) {
              var locale = locales[numeral.options.currentLocale],
                  negP = false,
                  optDec = false,
                  leadingCount = 0,
                  abbr = '',
                  trillion = 1000000000000,
                  billion = 1000000000,
                  million = 1000000,
                  thousand = 1000,
                  decimal = '',
                  neg = false,
                  abbrForce, // force abbreviation
                  abs,
                  int,
                  precision,
                  signed,
                  thousands,
                  output;

              // make sure we never format a null value
              value = value || 0;

              abs = Math.abs(value);

              // see if we should use parentheses for negative number or if we should prefix with a sign
              // if both are present we default to parentheses
              if (numeral._.includes(format, '(')) {
                  negP = true;
                  format = format.replace(/[\(|\)]/g, '');
              } else if (numeral._.includes(format, '+') || numeral._.includes(format, '-')) {
                  signed = numeral._.includes(format, '+') ? format.indexOf('+') : value < 0 ? format.indexOf('-') : -1;
                  format = format.replace(/[\+|\-]/g, '');
              }

              // see if abbreviation is wanted
              if (numeral._.includes(format, 'a')) {
                  abbrForce = format.match(/a(k|m|b|t)?/);

                  abbrForce = abbrForce ? abbrForce[1] : false;

                  // check for space before abbreviation
                  if (numeral._.includes(format, ' a')) {
                      abbr = ' ';
                  }

                  format = format.replace(new RegExp(abbr + 'a[kmbt]?'), '');

                  if (abs >= trillion && !abbrForce || abbrForce === 't') {
                      // trillion
                      abbr += locale.abbreviations.trillion;
                      value = value / trillion;
                  } else if (abs < trillion && abs >= billion && !abbrForce || abbrForce === 'b') {
                      // billion
                      abbr += locale.abbreviations.billion;
                      value = value / billion;
                  } else if (abs < billion && abs >= million && !abbrForce || abbrForce === 'm') {
                      // million
                      abbr += locale.abbreviations.million;
                      value = value / million;
                  } else if (abs < million && abs >= thousand && !abbrForce || abbrForce === 'k') {
                      // thousand
                      abbr += locale.abbreviations.thousand;
                      value = value / thousand;
                  }
              }

              // check for optional decimals
              if (numeral._.includes(format, '[.]')) {
                  optDec = true;
                  format = format.replace('[.]', '.');
              }

              // break number and format
              int = value.toString().split('.')[0];
              precision = format.split('.')[1];
              thousands = format.indexOf(',');
              leadingCount = (format.split('.')[0].split(',')[0].match(/0/g) || []).length;

              if (precision) {
                  if (numeral._.includes(precision, '[')) {
                      precision = precision.replace(']', '');
                      precision = precision.split('[');
                      decimal = numeral._.toFixed(value, (precision[0].length + precision[1].length), roundingFunction, precision[1].length);
                  } else {
                      decimal = numeral._.toFixed(value, precision.length, roundingFunction);
                  }

                  int = decimal.split('.')[0];

                  if (numeral._.includes(decimal, '.')) {
                      decimal = locale.delimiters.decimal + decimal.split('.')[1];
                  } else {
                      decimal = '';
                  }

                  if (optDec && Number(decimal.slice(1)) === 0) {
                      decimal = '';
                  }
              } else {
                  int = numeral._.toFixed(value, 0, roundingFunction);
              }

              // check abbreviation again after rounding
              if (abbr && !abbrForce && Number(int) >= 1000 && abbr !== locale.abbreviations.trillion) {
                  int = String(Number(int) / 1000);

                  switch (abbr) {
                      case locale.abbreviations.thousand:
                          abbr = locale.abbreviations.million;
                          break;
                      case locale.abbreviations.million:
                          abbr = locale.abbreviations.billion;
                          break;
                      case locale.abbreviations.billion:
                          abbr = locale.abbreviations.trillion;
                          break;
                  }
              }


              // format number
              if (numeral._.includes(int, '-')) {
                  int = int.slice(1);
                  neg = true;
              }

              if (int.length < leadingCount) {
                  for (var i = leadingCount - int.length; i > 0; i--) {
                      int = '0' + int;
                  }
              }

              if (thousands > -1) {
                  int = int.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + locale.delimiters.thousands);
              }

              if (format.indexOf('.') === 0) {
                  int = '';
              }

              output = int + decimal + (abbr ? abbr : '');

              if (negP) {
                  output = (negP && neg ? '(' : '') + output + (negP && neg ? ')' : '');
              } else {
                  if (signed >= 0) {
                      output = signed === 0 ? (neg ? '-' : '+') + output : output + (neg ? '-' : '+');
                  } else if (neg) {
                      output = '-' + output;
                  }
              }

              return output;
          },
          // unformats numbers separators, decimals places, signs, abbreviations
          stringToNumber: function(string) {
              var locale = locales[options.currentLocale],
                  stringOriginal = string,
                  abbreviations = {
                      thousand: 3,
                      million: 6,
                      billion: 9,
                      trillion: 12
                  },
                  abbreviation,
                  value,
                  regexp;

              if (options.zeroFormat && string === options.zeroFormat) {
                  value = 0;
              } else if (options.nullFormat && string === options.nullFormat || !string.replace(/[^0-9]+/g, '').length) {
                  value = null;
              } else {
                  value = 1;

                  if (locale.delimiters.decimal !== '.') {
                      string = string.replace(/\./g, '').replace(locale.delimiters.decimal, '.');
                  }

                  for (abbreviation in abbreviations) {
                      regexp = new RegExp('[^a-zA-Z]' + locale.abbreviations[abbreviation] + '(?:\\)|(\\' + locale.currency.symbol + ')?(?:\\))?)?$');

                      if (stringOriginal.match(regexp)) {
                          value *= Math.pow(10, abbreviations[abbreviation]);
                          break;
                      }
                  }

                  // check for negative number
                  value *= (string.split('-').length + Math.min(string.split('(').length - 1, string.split(')').length - 1)) % 2 ? 1 : -1;

                  // remove non numbers
                  string = string.replace(/[^0-9\.]+/g, '');

                  value *= Number(string);
              }

              return value;
          },
          isNaN: function(value) {
              return typeof value === 'number' && isNaN(value);
          },
          includes: function(string, search) {
              return string.indexOf(search) !== -1;
          },
          insert: function(string, subString, start) {
              return string.slice(0, start) + subString + string.slice(start);
          },
          reduce: function(array, callback /*, initialValue*/) {
              if (this === null) {
                  throw new TypeError('Array.prototype.reduce called on null or undefined');
              }

              if (typeof callback !== 'function') {
                  throw new TypeError(callback + ' is not a function');
              }

              var t = Object(array),
                  len = t.length >>> 0,
                  k = 0,
                  value;

              if (arguments.length === 3) {
                  value = arguments[2];
              } else {
                  while (k < len && !(k in t)) {
                      k++;
                  }

                  if (k >= len) {
                      throw new TypeError('Reduce of empty array with no initial value');
                  }

                  value = t[k++];
              }
              for (; k < len; k++) {
                  if (k in t) {
                      value = callback(value, t[k], k, t);
                  }
              }
              return value;
          },
          /**
           * Computes the multiplier necessary to make x >= 1,
           * effectively eliminating miscalculations caused by
           * finite precision.
           */
          multiplier: function (x) {
              var parts = x.toString().split('.');

              return parts.length < 2 ? 1 : Math.pow(10, parts[1].length);
          },
          /**
           * Given a variable number of arguments, returns the maximum
           * multiplier that must be used to normalize an operation involving
           * all of them.
           */
          correctionFactor: function () {
              var args = Array.prototype.slice.call(arguments);

              return args.reduce(function(accum, next) {
                  var mn = _.multiplier(next);
                  return accum > mn ? accum : mn;
              }, 1);
          },
          /**
           * Implementation of toFixed() that treats floats more like decimals
           *
           * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
           * problems for accounting- and finance-related software.
           */
          toFixed: function(value, maxDecimals, roundingFunction, optionals) {
              var splitValue = value.toString().split('.'),
                  minDecimals = maxDecimals - (optionals || 0),
                  boundedPrecision,
                  optionalsRegExp,
                  power,
                  output;

              // Use the smallest precision value possible to avoid errors from floating point representation
              if (splitValue.length === 2) {
                boundedPrecision = Math.min(Math.max(splitValue[1].length, minDecimals), maxDecimals);
              } else {
                boundedPrecision = minDecimals;
              }

              power = Math.pow(10, boundedPrecision);

              // Multiply up by precision, round accurately, then divide and use native toFixed():
              output = (roundingFunction(value + 'e+' + boundedPrecision) / power).toFixed(boundedPrecision);

              if (optionals > maxDecimals - boundedPrecision) {
                  optionalsRegExp = new RegExp('\\.?0{1,' + (optionals - (maxDecimals - boundedPrecision)) + '}$');
                  output = output.replace(optionalsRegExp, '');
              }

              return output;
          }
      };

      // avaliable options
      numeral.options = options;

      // avaliable formats
      numeral.formats = formats;

      // avaliable formats
      numeral.locales = locales;

      // This function sets the current locale.  If
      // no arguments are passed in, it will simply return the current global
      // locale key.
      numeral.locale = function(key) {
          if (key) {
              options.currentLocale = key.toLowerCase();
          }

          return options.currentLocale;
      };

      // This function provides access to the loaded locale data.  If
      // no arguments are passed in, it will simply return the current
      // global locale object.
      numeral.localeData = function(key) {
          if (!key) {
              return locales[options.currentLocale];
          }

          key = key.toLowerCase();

          if (!locales[key]) {
              throw new Error('Unknown locale : ' + key);
          }

          return locales[key];
      };

      numeral.reset = function() {
          for (var property in defaults) {
              options[property] = defaults[property];
          }
      };

      numeral.zeroFormat = function(format) {
          options.zeroFormat = typeof(format) === 'string' ? format : null;
      };

      numeral.nullFormat = function (format) {
          options.nullFormat = typeof(format) === 'string' ? format : null;
      };

      numeral.defaultFormat = function(format) {
          options.defaultFormat = typeof(format) === 'string' ? format : '0.0';
      };

      numeral.register = function(type, name, format) {
          name = name.toLowerCase();

          if (this[type + 's'][name]) {
              throw new TypeError(name + ' ' + type + ' already registered.');
          }

          this[type + 's'][name] = format;

          return format;
      };


      numeral.validate = function(val, culture) {
          var _decimalSep,
              _thousandSep,
              _currSymbol,
              _valArray,
              _abbrObj,
              _thousandRegEx,
              localeData,
              temp;

          //coerce val to string
          if (typeof val !== 'string') {
              val += '';

              if (console.warn) {
                  console.warn('Numeral.js: Value is not string. It has been co-erced to: ', val);
              }
          }

          //trim whitespaces from either sides
          val = val.trim();

          //if val is just digits return true
          if (!!val.match(/^\d+$/)) {
              return true;
          }

          //if val is empty return false
          if (val === '') {
              return false;
          }

          //get the decimal and thousands separator from numeral.localeData
          try {
              //check if the culture is understood by numeral. if not, default it to current locale
              localeData = numeral.localeData(culture);
          } catch (e) {
              localeData = numeral.localeData(numeral.locale());
          }

          //setup the delimiters and currency symbol based on culture/locale
          _currSymbol = localeData.currency.symbol;
          _abbrObj = localeData.abbreviations;
          _decimalSep = localeData.delimiters.decimal;
          if (localeData.delimiters.thousands === '.') {
              _thousandSep = '\\.';
          } else {
              _thousandSep = localeData.delimiters.thousands;
          }

          // validating currency symbol
          temp = val.match(/^[^\d]+/);
          if (temp !== null) {
              val = val.substr(1);
              if (temp[0] !== _currSymbol) {
                  return false;
              }
          }

          //validating abbreviation symbol
          temp = val.match(/[^\d]+$/);
          if (temp !== null) {
              val = val.slice(0, -1);
              if (temp[0] !== _abbrObj.thousand && temp[0] !== _abbrObj.million && temp[0] !== _abbrObj.billion && temp[0] !== _abbrObj.trillion) {
                  return false;
              }
          }

          _thousandRegEx = new RegExp(_thousandSep + '{2}');

          if (!val.match(/[^\d.,]/g)) {
              _valArray = val.split(_decimalSep);
              if (_valArray.length > 2) {
                  return false;
              } else {
                  if (_valArray.length < 2) {
                      return ( !! _valArray[0].match(/^\d+.*\d$/) && !_valArray[0].match(_thousandRegEx));
                  } else {
                      if (_valArray[0].length === 1) {
                          return ( !! _valArray[0].match(/^\d+$/) && !_valArray[0].match(_thousandRegEx) && !! _valArray[1].match(/^\d+$/));
                      } else {
                          return ( !! _valArray[0].match(/^\d+.*\d$/) && !_valArray[0].match(_thousandRegEx) && !! _valArray[1].match(/^\d+$/));
                      }
                  }
              }
          }

          return false;
      };


      /************************************
          Numeral Prototype
      ************************************/

      numeral.fn = Numeral.prototype = {
          clone: function() {
              return numeral(this);
          },
          format: function(inputString, roundingFunction) {
              var value = this._value,
                  format = inputString || options.defaultFormat,
                  kind,
                  output,
                  formatFunction;

              // make sure we have a roundingFunction
              roundingFunction = roundingFunction || Math.round;

              // format based on value
              if (value === 0 && options.zeroFormat !== null) {
                  output = options.zeroFormat;
              } else if (value === null && options.nullFormat !== null) {
                  output = options.nullFormat;
              } else {
                  for (kind in formats) {
                      if (format.match(formats[kind].regexps.format)) {
                          formatFunction = formats[kind].format;

                          break;
                      }
                  }

                  formatFunction = formatFunction || numeral._.numberToFormat;

                  output = formatFunction(value, format, roundingFunction);
              }

              return output;
          },
          value: function() {
              return this._value;
          },
          input: function() {
              return this._input;
          },
          set: function(value) {
              this._value = Number(value);

              return this;
          },
          add: function(value) {
              var corrFactor = _.correctionFactor.call(null, this._value, value);

              function cback(accum, curr, currI, O) {
                  return accum + Math.round(corrFactor * curr);
              }

              this._value = _.reduce([this._value, value], cback, 0) / corrFactor;

              return this;
          },
          subtract: function(value) {
              var corrFactor = _.correctionFactor.call(null, this._value, value);

              function cback(accum, curr, currI, O) {
                  return accum - Math.round(corrFactor * curr);
              }

              this._value = _.reduce([value], cback, Math.round(this._value * corrFactor)) / corrFactor;

              return this;
          },
          multiply: function(value) {
              function cback(accum, curr, currI, O) {
                  var corrFactor = _.correctionFactor(accum, curr);
                  return Math.round(accum * corrFactor) * Math.round(curr * corrFactor) / Math.round(corrFactor * corrFactor);
              }

              this._value = _.reduce([this._value, value], cback, 1);

              return this;
          },
          divide: function(value) {
              function cback(accum, curr, currI, O) {
                  var corrFactor = _.correctionFactor(accum, curr);
                  return Math.round(accum * corrFactor) / Math.round(curr * corrFactor);
              }

              this._value = _.reduce([this._value, value], cback);

              return this;
          },
          difference: function(value) {
              return Math.abs(numeral(this._value).subtract(value).value());
          }
      };

      /************************************
          Default Locale && Format
      ************************************/

      numeral.register('locale', 'en', {
          delimiters: {
              thousands: ',',
              decimal: '.'
          },
          abbreviations: {
              thousand: 'k',
              million: 'm',
              billion: 'b',
              trillion: 't'
          },
          ordinal: function(number) {
              var b = number % 10;
              return (~~(number % 100 / 10) === 1) ? 'th' :
                  (b === 1) ? 'st' :
                  (b === 2) ? 'nd' :
                  (b === 3) ? 'rd' : 'th';
          },
          currency: {
              symbol: '$'
          }
      });

      

  (function() {
          numeral.register('format', 'bps', {
              regexps: {
                  format: /(BPS)/,
                  unformat: /(BPS)/
              },
              format: function(value, format, roundingFunction) {
                  var space = numeral._.includes(format, ' BPS') ? ' ' : '',
                      output;

                  value = value * 10000;

                  // check for space before BPS
                  format = format.replace(/\s?BPS/, '');

                  output = numeral._.numberToFormat(value, format, roundingFunction);

                  if (numeral._.includes(output, ')')) {
                      output = output.split('');

                      output.splice(-1, 0, space + 'BPS');

                      output = output.join('');
                  } else {
                      output = output + space + 'BPS';
                  }

                  return output;
              },
              unformat: function(string) {
                  return +(numeral._.stringToNumber(string) * 0.0001).toFixed(15);
              }
          });
  })();


  (function() {
          var decimal = {
              base: 1000,
              suffixes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
          },
          binary = {
              base: 1024,
              suffixes: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
          };

      var allSuffixes =  decimal.suffixes.concat(binary.suffixes.filter(function (item) {
              return decimal.suffixes.indexOf(item) < 0;
          }));
          var unformatRegex = allSuffixes.join('|');
          // Allow support for BPS (http://www.investopedia.com/terms/b/basispoint.asp)
          unformatRegex = '(' + unformatRegex.replace('B', 'B(?!PS)') + ')';

      numeral.register('format', 'bytes', {
          regexps: {
              format: /([0\s]i?b)/,
              unformat: new RegExp(unformatRegex)
          },
          format: function(value, format, roundingFunction) {
              var output,
                  bytes = numeral._.includes(format, 'ib') ? binary : decimal,
                  suffix = numeral._.includes(format, ' b') || numeral._.includes(format, ' ib') ? ' ' : '',
                  power,
                  min,
                  max;

              // check for space before
              format = format.replace(/\s?i?b/, '');

              for (power = 0; power <= bytes.suffixes.length; power++) {
                  min = Math.pow(bytes.base, power);
                  max = Math.pow(bytes.base, power + 1);

                  if (value === null || value === 0 || value >= min && value < max) {
                      suffix += bytes.suffixes[power];

                      if (min > 0) {
                          value = value / min;
                      }

                      break;
                  }
              }

              output = numeral._.numberToFormat(value, format, roundingFunction);

              return output + suffix;
          },
          unformat: function(string) {
              var value = numeral._.stringToNumber(string),
                  power,
                  bytesMultiplier;

              if (value) {
                  for (power = decimal.suffixes.length - 1; power >= 0; power--) {
                      if (numeral._.includes(string, decimal.suffixes[power])) {
                          bytesMultiplier = Math.pow(decimal.base, power);

                          break;
                      }

                      if (numeral._.includes(string, binary.suffixes[power])) {
                          bytesMultiplier = Math.pow(binary.base, power);

                          break;
                      }
                  }

                  value *= (bytesMultiplier || 1);
              }

              return value;
          }
      });
  })();


  (function() {
          numeral.register('format', 'currency', {
          regexps: {
              format: /(\$)/
          },
          format: function(value, format, roundingFunction) {
              var locale = numeral.locales[numeral.options.currentLocale],
                  symbols = {
                      before: format.match(/^([\+|\-|\(|\s|\$]*)/)[0],
                      after: format.match(/([\+|\-|\)|\s|\$]*)$/)[0]
                  },
                  output,
                  symbol,
                  i;

              // strip format of spaces and $
              format = format.replace(/\s?\$\s?/, '');

              // format the number
              output = numeral._.numberToFormat(value, format, roundingFunction);

              // update the before and after based on value
              if (value >= 0) {
                  symbols.before = symbols.before.replace(/[\-\(]/, '');
                  symbols.after = symbols.after.replace(/[\-\)]/, '');
              } else if (value < 0 && (!numeral._.includes(symbols.before, '-') && !numeral._.includes(symbols.before, '('))) {
                  symbols.before = '-' + symbols.before;
              }

              // loop through each before symbol
              for (i = 0; i < symbols.before.length; i++) {
                  symbol = symbols.before[i];

                  switch (symbol) {
                      case '$':
                          output = numeral._.insert(output, locale.currency.symbol, i);
                          break;
                      case ' ':
                          output = numeral._.insert(output, ' ', i + locale.currency.symbol.length - 1);
                          break;
                  }
              }

              // loop through each after symbol
              for (i = symbols.after.length - 1; i >= 0; i--) {
                  symbol = symbols.after[i];

                  switch (symbol) {
                      case '$':
                          output = i === symbols.after.length - 1 ? output + locale.currency.symbol : numeral._.insert(output, locale.currency.symbol, -(symbols.after.length - (1 + i)));
                          break;
                      case ' ':
                          output = i === symbols.after.length - 1 ? output + ' ' : numeral._.insert(output, ' ', -(symbols.after.length - (1 + i) + locale.currency.symbol.length - 1));
                          break;
                  }
              }


              return output;
          }
      });
  })();


  (function() {
          numeral.register('format', 'exponential', {
          regexps: {
              format: /(e\+|e-)/,
              unformat: /(e\+|e-)/
          },
          format: function(value, format, roundingFunction) {
              var output,
                  exponential = typeof value === 'number' && !numeral._.isNaN(value) ? value.toExponential() : '0e+0',
                  parts = exponential.split('e');

              format = format.replace(/e[\+|\-]{1}0/, '');

              output = numeral._.numberToFormat(Number(parts[0]), format, roundingFunction);

              return output + 'e' + parts[1];
          },
          unformat: function(string) {
              var parts = numeral._.includes(string, 'e+') ? string.split('e+') : string.split('e-'),
                  value = Number(parts[0]),
                  power = Number(parts[1]);

              power = numeral._.includes(string, 'e-') ? power *= -1 : power;

              function cback(accum, curr, currI, O) {
                  var corrFactor = numeral._.correctionFactor(accum, curr),
                      num = (accum * corrFactor) * (curr * corrFactor) / (corrFactor * corrFactor);
                  return num;
              }

              return numeral._.reduce([value, Math.pow(10, power)], cback, 1);
          }
      });
  })();


  (function() {
          numeral.register('format', 'ordinal', {
          regexps: {
              format: /(o)/
          },
          format: function(value, format, roundingFunction) {
              var locale = numeral.locales[numeral.options.currentLocale],
                  output,
                  ordinal = numeral._.includes(format, ' o') ? ' ' : '';

              // check for space before
              format = format.replace(/\s?o/, '');

              ordinal += locale.ordinal(value);

              output = numeral._.numberToFormat(value, format, roundingFunction);

              return output + ordinal;
          }
      });
  })();


  (function() {
          numeral.register('format', 'percentage', {
          regexps: {
              format: /(%)/,
              unformat: /(%)/
          },
          format: function(value, format, roundingFunction) {
              var space = numeral._.includes(format, ' %') ? ' ' : '',
                  output;

              if (numeral.options.scalePercentBy100) {
                  value = value * 100;
              }

              // check for space before %
              format = format.replace(/\s?\%/, '');

              output = numeral._.numberToFormat(value, format, roundingFunction);

              if (numeral._.includes(output, ')')) {
                  output = output.split('');

                  output.splice(-1, 0, space + '%');

                  output = output.join('');
              } else {
                  output = output + space + '%';
              }

              return output;
          },
          unformat: function(string) {
              var number = numeral._.stringToNumber(string);
              if (numeral.options.scalePercentBy100) {
                  return number * 0.01;
              }
              return number;
          }
      });
  })();


  (function() {
          numeral.register('format', 'time', {
          regexps: {
              format: /(:)/,
              unformat: /(:)/
          },
          format: function(value, format, roundingFunction) {
              var hours = Math.floor(value / 60 / 60),
                  minutes = Math.floor((value - (hours * 60 * 60)) / 60),
                  seconds = Math.round(value - (hours * 60 * 60) - (minutes * 60));

              return hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
          },
          unformat: function(string) {
              var timeArray = string.split(':'),
                  seconds = 0;

              // turn hours and minutes into seconds and add them all up
              if (timeArray.length === 3) {
                  // hours
                  seconds = seconds + (Number(timeArray[0]) * 60 * 60);
                  // minutes
                  seconds = seconds + (Number(timeArray[1]) * 60);
                  // seconds
                  seconds = seconds + Number(timeArray[2]);
              } else if (timeArray.length === 2) {
                  // minutes
                  seconds = seconds + (Number(timeArray[0]) * 60);
                  // seconds
                  seconds = seconds + Number(timeArray[1]);
              }
              return Number(seconds);
          }
      });
  })();

  return numeral;
  }));
  });

  /**
   *
   *
   * @author Jerry Bendy <jerry@icewingcc.com>
   * @licence MIT
   *
   */

  (function(self) {

      var nativeURLSearchParams = self.URLSearchParams ? self.URLSearchParams : null,
          isSupportObjectConstructor = nativeURLSearchParams && (new nativeURLSearchParams({a: 1})).toString() === 'a=1',
          // There is a bug in safari 10.1 (and earlier) that incorrectly decodes `%2B` as an empty space and not a plus.
          decodesPlusesCorrectly = nativeURLSearchParams && (new nativeURLSearchParams('s=%2B').get('s') === '+'),
          __URLSearchParams__ = "__URLSearchParams__",
          // Fix bug in Edge which cannot encode ' &' correctly
          encodesAmpersandsCorrectly = nativeURLSearchParams ? (function() {
              var ampersandTest = new nativeURLSearchParams();
              ampersandTest.append('s', ' &');
              return ampersandTest.toString() === 's=+%26';
          })() : true,
          prototype = URLSearchParamsPolyfill.prototype,
          iterable = !!(self.Symbol && self.Symbol.iterator);

      if (nativeURLSearchParams && isSupportObjectConstructor && decodesPlusesCorrectly && encodesAmpersandsCorrectly) {
          return;
      }


      /**
       * Make a URLSearchParams instance
       *
       * @param {object|string|URLSearchParams} search
       * @constructor
       */
      function URLSearchParamsPolyfill(search) {
          search = search || "";

          // support construct object with another URLSearchParams instance
          if (search instanceof URLSearchParams || search instanceof URLSearchParamsPolyfill) {
              search = search.toString();
          }
          this [__URLSearchParams__] = parseToDict(search);
      }


      /**
       * Appends a specified key/value pair as a new search parameter.
       *
       * @param {string} name
       * @param {string} value
       */
      prototype.append = function(name, value) {
          appendTo(this [__URLSearchParams__], name, value);
      };

      /**
       * Deletes the given search parameter, and its associated value,
       * from the list of all search parameters.
       *
       * @param {string} name
       */
      prototype.delete = function(name) {
          delete this [__URLSearchParams__] [name];
      };

      /**
       * Returns the first value associated to the given search parameter.
       *
       * @param {string} name
       * @returns {string|null}
       */
      prototype.get = function(name) {
          var dict = this [__URLSearchParams__];
          return name in dict ? dict[name][0] : null;
      };

      /**
       * Returns all the values association with a given search parameter.
       *
       * @param {string} name
       * @returns {Array}
       */
      prototype.getAll = function(name) {
          var dict = this [__URLSearchParams__];
          return name in dict ? dict [name].slice(0) : [];
      };

      /**
       * Returns a Boolean indicating if such a search parameter exists.
       *
       * @param {string} name
       * @returns {boolean}
       */
      prototype.has = function(name) {
          return name in this [__URLSearchParams__];
      };

      /**
       * Sets the value associated to a given search parameter to
       * the given value. If there were several values, delete the
       * others.
       *
       * @param {string} name
       * @param {string} value
       */
      prototype.set = function set(name, value) {
          this [__URLSearchParams__][name] = ['' + value];
      };

      /**
       * Returns a string containg a query string suitable for use in a URL.
       *
       * @returns {string}
       */
      prototype.toString = function() {
          var dict = this[__URLSearchParams__], query = [], i, key, name, value;
          for (key in dict) {
              name = encode(key);
              for (i = 0, value = dict[key]; i < value.length; i++) {
                  query.push(name + '=' + encode(value[i]));
              }
          }
          return query.join('&');
      };

      // There is a bug in Safari 10.1 and `Proxy`ing it is not enough.
      var forSureUsePolyfill = !decodesPlusesCorrectly;
      var useProxy = (!forSureUsePolyfill && nativeURLSearchParams && !isSupportObjectConstructor && self.Proxy);
      /*
       * Apply polifill to global object and append other prototype into it
       */
      self.URLSearchParams = useProxy ?
          // Safari 10.0 doesn't support Proxy, so it won't extend URLSearchParams on safari 10.0
          new Proxy(nativeURLSearchParams, {
              construct: function(target, args) {
                  return new target((new URLSearchParamsPolyfill(args[0]).toString()));
              }
          }) :
          URLSearchParamsPolyfill;


      var USPProto = self.URLSearchParams.prototype;

      USPProto.polyfill = true;

      /**
       *
       * @param {function} callback
       * @param {object} thisArg
       */
      USPProto.forEach = USPProto.forEach || function(callback, thisArg) {
          var dict = parseToDict(this.toString());
          Object.getOwnPropertyNames(dict).forEach(function(name) {
              dict[name].forEach(function(value) {
                  callback.call(thisArg, value, name, this);
              }, this);
          }, this);
      };

      /**
       * Sort all name-value pairs
       */
      USPProto.sort = USPProto.sort || function() {
          var dict = parseToDict(this.toString()), keys = [], k, i, j;
          for (k in dict) {
              keys.push(k);
          }
          keys.sort();

          for (i = 0; i < keys.length; i++) {
              this.delete(keys[i]);
          }
          for (i = 0; i < keys.length; i++) {
              var key = keys[i], values = dict[key];
              for (j = 0; j < values.length; j++) {
                  this.append(key, values[j]);
              }
          }
      };

      /**
       * Returns an iterator allowing to go through all keys of
       * the key/value pairs contained in this object.
       *
       * @returns {function}
       */
      USPProto.keys = USPProto.keys || function() {
          var items = [];
          this.forEach(function(item, name) {
              items.push(name);
          });
          return makeIterator(items);
      };

      /**
       * Returns an iterator allowing to go through all values of
       * the key/value pairs contained in this object.
       *
       * @returns {function}
       */
      USPProto.values = USPProto.values || function() {
          var items = [];
          this.forEach(function(item) {
              items.push(item);
          });
          return makeIterator(items);
      };

      /**
       * Returns an iterator allowing to go through all key/value
       * pairs contained in this object.
       *
       * @returns {function}
       */
      USPProto.entries = USPProto.entries || function() {
          var items = [];
          this.forEach(function(item, name) {
              items.push([name, item]);
          });
          return makeIterator(items);
      };


      if (iterable) {
          USPProto[self.Symbol.iterator] = USPProto[self.Symbol.iterator] || USPProto.entries;
      }


      function encode(str) {
          var replace = {
              '!': '%21',
              "'": '%27',
              '(': '%28',
              ')': '%29',
              '~': '%7E',
              '%20': '+',
              '%00': '\x00'
          };
          return encodeURIComponent(str).replace(/[!'\(\)~]|%20|%00/g, function(match) {
              return replace[match];
          });
      }

      function decode(str) {
          return decodeURIComponent(str.replace(/\+/g, ' '));
      }

      function makeIterator(arr) {
          var iterator = {
              next: function() {
                  var value = arr.shift();
                  return {done: value === undefined, value: value};
              }
          };

          if (iterable) {
              iterator[self.Symbol.iterator] = function() {
                  return iterator;
              };
          }

          return iterator;
      }

      function parseToDict(search) {
          var dict = {};

          if (typeof search === "object") {
              for (var key in search) {
                  if (search.hasOwnProperty(key)) {
                      appendTo(dict, key, search[key]);
                  }
              }

          } else {
              // remove first '?'
              if (search.indexOf("?") === 0) {
                  search = search.slice(1);
              }

              var pairs = search.split("&");
              for (var j = 0; j < pairs.length; j++) {
                  var value = pairs [j],
                      index = value.indexOf('=');

                  if (-1 < index) {
                      appendTo(dict, decode(value.slice(0, index)), decode(value.slice(index + 1)));

                  } else {
                      if (value) {
                          appendTo(dict, decode(value), '');
                      }
                  }
              }
          }

          return dict;
      }

      function appendTo(dict, name, value) {
          var val = typeof value === 'string' ? value : (
              value !== null && value !== undefined && typeof value.toString === 'function' ? value.toString() : JSON.stringify(value)
          );

          if (name in dict) {
              dict[name].push(val);
          } else {
              dict[name] = [val];
          }
      }

  })(typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : (typeof window !== 'undefined' ? window : commonjsGlobal));

  var Argent =
  /*#__PURE__*/
  function () {
    /**
     * Construct a new instance of Argent.
     *
     * options.rates
     *   Object containing rates e.g. { USD: 1, GBP: 1.30749 }
     *
     * options.formats
     *   Optional object containing formatting rules
     *
     * options.baseCurrency
     *   Base currency to convert from
     *
     * options.defaultCurrency
     *   Default currency to convert to (defaults to baseCurrency)
     *
     * options.baseFormat
     *   Numeral format string for amounts in base currency
     *
     * options.convertedFormat
     *   Numeral format string for amounts in converted currency
     *
     * options.hideCodeForBase
     *   Hide currency code (e.g. AUD) suffix for the base currency
     *
     * @param  {Object}  options
     */
    function Argent(options) {
      _classCallCheck(this, Argent);

      this.rates = options.rates;

      if (!this.rates) {
        throw new Error("You must set rates when instantiating Argent");
      }

      this.baseCurrency = options.baseCurrency;
      this.hideCodeForBase = options.hideCodeForBase;

      if (!this.baseCurrency) {
        throw new Error("You must set baseCurrency when instantiating Argent");
      }

      this.defaultCurrency = options.defaultCurrency ? options.defaultCurrency : options.baseCurrency;
      this.baseFormat = options.baseFormat ? options.defaultBaseFormat : "0,0.00";
      this.convertedFormat = options.convertedFormat ? options.convertedFormat : "0,0";
      this.formats = this.defaultFormats();

      if (options.formats) {
        this.formats = _objectSpread({}, this.formats, options.formats);
      }

      this.currency = this.checkCurrency(this.resolveCurrency());
    }
    /**
     * Return an object containing default currency formats.
     *
     * @return  {object}
     */


    _createClass(Argent, [{
      key: "defaultFormats",
      value: function defaultFormats() {
        return {
          AUD: {
            symbol: "$",
            code: "AUD"
          },
          USD: {
            symbol: "$",
            code: "USD"
          },
          GBP: {
            symbol: "£",
            code: "GBP"
          },
          EUR: {
            symbol: "€",
            code: "EUR"
          },
          CAD: {
            symbol: "$",
            code: "CAD"
          }
        };
      }
      /**
       * Resolve currency from local storage or URL parameter.
       *
       * @return  {stirng}
       */

    }, {
      key: "resolveCurrency",
      value: function resolveCurrency() {
        var urlCurrency = new URLSearchParams(window.location.search).get("currency");

        if (urlCurrency) {
          store_legacy.set("currency", urlCurrency);
          return urlCurrency;
        }

        var storedCurrency = store_legacy.get("currency");

        if (storedCurrency) {
          return storedCurrency;
        }

        return this.defaultCurrency;
      }
      /**
       * Throw error and clear store if currency not supported.
       *
       * @param  {string}  currency
       * @return {string}
       */

    }, {
      key: "checkCurrency",
      value: function checkCurrency(currency) {
        if (!this.rates[currency] || !this.formats[currency]) {
          store_legacy.remove("currency");
          throw new Error("No rate and/or format provided for selected currency ".concat(currency));
        }

        return currency;
      }
      /**
       * Parse the given string to a Numeral instance.
       *
       * @param  {string}  formattedString
       * @return {Numeral} Parsed Numeral instance
       */

    }, {
      key: "parse",
      value: function parse(formattedString) {
        return numeral(formattedString);
      }
      /**
       * Convert Numeral instance between currencies.
       *
       * @param  {Numeral}  amount  Amount as a Numeral instance
       * @param  {string}  from  ISO currency string to convert from
       * @param  {String}  to  ISO currency string to convert to
       * @return {Numeral}  Converted numeral instance
       */

    }, {
      key: "convert",
      value: function convert(amount, from, to) {
        return amount.clone().multiply(this.rates[from]).divide(this.rates[to]);
      }
      /**
       * Format the given Numeral amount in the given currency.
       *
       * @param  {Numeral}  amount
       * @return {string}  ISO currency code
       */

    }, {
      key: "format",
      value: function format(amount, currency) {
        var format = this.formats[currency];

        if (!format) {
          throw new Error("Format ".concat(format, " not available for currency conversion."));
        }

        var formattedAmount = amount.format(currency === this.baseCurrency ? this.baseFormat : this.convertedFormat);

        if (format.symbol) {
          formattedAmount = format.symbol + formattedAmount;
        }

        if (this.hideCodeForBase && currency == this.baseCurrency) {
          formattedAmount = "".concat(formattedAmount);
        } else {
          formattedAmount = "".concat(formattedAmount, " ").concat(format.code);
        }

        return formattedAmount;
      }
      /**
       * Return the currently selected currency.
       *
       * @return {string}
       */

    }, {
      key: "getCurrency",
      value: function getCurrency() {
        return this.currency;
      }
      /**
       * Set the targetted currency.
       *
       * @param  {string}  currency
       * @param  {boolean}  refresh  Whether or not a page refresh will be triggered
       * @return {Argent}
       */

    }, {
      key: "setCurrency",
      value: function setCurrency(currency, refresh) {
        this.checkCurrency(currency);
        this.currency = currency;
        store_legacy.set("currency", this.currency);
        var urlParams = new URLSearchParams(window.location.search);

        if (urlParams.get("currency")) {
          urlParams.delete("currency");
        }

        if (false !== refresh) {
          window.location.href = [window.location.protocol, "//", window.location.host, window.location.pathname, urlParams.toString() ? "?" + urlParams.toString() : null].join("");
        }

        return this;
      }
      /**
       * Convert a formatted string between currencies.
       *
       * @param  {string}  formattedString
       * @param  {string}  fromCurrency
       * @param  {string}  toCurrency
       * @return {string}
       */

    }, {
      key: "convertFormatted",
      value: function convertFormatted(formattedString, fromCurrency, toCurrency) {
        if (!fromCurrency) fromCurrency = this.baseCurrency;
        if (!toCurrency) toCurrency = this.currency;
        return this.format(this.convert(this.parse(formattedString), fromCurrency, toCurrency), toCurrency);
      }
      /**
       * Convert all nodes matching given DOMString to the target currency.
       *
       * @param  {string}  selector  DOMString
       * @param  {string}  fromCurrency
       * @param  {string}  toCurrency
       * @return {Argent}
       */

    }, {
      key: "convertFormattedNodes",
      value: function convertFormattedNodes(selector, fromCurrency, toCurrency) {
        var _this = this;

        if (!fromCurrency) fromCurrency = this.baseCurrency;
        if (!toCurrency) toCurrency = this.currency; // Polyfill NodeList.forEach for IE

        if (window.NodeList && !NodeList.prototype.forEach) {
          NodeList.prototype.forEach = Array.prototype.forEach;
        }

        document.querySelectorAll(selector).forEach(function (currentValue) {
          var baseAmount = _this.parse(currentValue.dataset.amount ? currentValue.dataset.amount : currentValue.innerText);

          var convertedAmount = _this.convert(baseAmount, _this.defaultCurrency, _this.currency);

          currentValue.dataset.currency = _this.currency;
          currentValue.dataset.amount = baseAmount.value();
          currentValue.innerText = _this.format(convertedAmount, _this.currency);
        });
        return this;
      }
      /**
       * Register events on currency selector to trigger updates.
       *
       * @param  {string}  selector  DOMString
       * @return {Argent}
       */

    }, {
      key: "registerCurrencySelector",
      value: function registerCurrencySelector(selector) {
        var _this2 = this;

        var nodes = document.querySelectorAll(selector);

        if (!nodes) {
          throw new Error("Node with selector \"".concat(selector, "\" not found, could not register currency selector"));
        }

        for (var i = 0; i < nodes.length; ++i) {
          nodes[i].addEventListener("change", function (event) {
            return _this2.setCurrency(event.target.value);
          });
          nodes[i].value = this.currency;
        }

        return this;
      }
    }]);

    return Argent;
  }();

  return Argent;

})));
