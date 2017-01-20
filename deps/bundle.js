module.exports = function(modules) {
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: !1,
            exports: {}
        };
        return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), 
        module.l = !0, module.exports;
    }
    var installedModules = {};
    return __webpack_require__.m = modules, __webpack_require__.c = installedModules, 
    __webpack_require__.i = function(value) {
        return value;
    }, __webpack_require__.d = function(exports, name, getter) {
        __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
            configurable: !1,
            enumerable: !0,
            get: getter
        });
    }, __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? function() {
            return module.default;
        } : function() {
            return module;
        };
        return __webpack_require__.d(getter, "a", getter), getter;
    }, __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    }, __webpack_require__.p = "", __webpack_require__(__webpack_require__.s = 71);
}([ /*!**********************************!*\
  !*** ./~/ast-types/lib/types.js ***!
  \**********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, Ap = Array.prototype, slice = Ap.slice, Op = (Ap.map, Ap.forEach, Object.prototype), objToStr = Op.toString, funObjStr = objToStr.call(function() {}), strObjStr = objToStr.call(""), hasOwn = Op.hasOwnProperty;
    module.exports = function() {
        function Type(check, name) {
            var self = this;
            if (!(self instanceof Type)) throw new Error("Type constructor cannot be invoked without 'new'");
            if (objToStr.call(check) !== funObjStr) throw new Error(check + " is not a function");
            var nameObjStr = objToStr.call(name);
            if (nameObjStr !== funObjStr && nameObjStr !== strObjStr) throw new Error(name + " is neither a function nor a string");
            Object.defineProperties(self, {
                name: {
                    value: name
                },
                check: {
                    value: function(_value, deep) {
                        var result = check.call(self, _value, deep);
                        return !result && deep && objToStr.call(deep) === funObjStr && deep(self, _value), 
                        result;
                    }
                }
            });
        }
        function shallowStringify(value) {
            return isObject.check(value) ? "{" + Object.keys(value).map(function(key) {
                return key + ": " + value[key];
            }).join(", ") + "}" : isArray.check(value) ? "[" + value.map(shallowStringify).join(", ") + "]" : JSON.stringify(value);
        }
        function defBuiltInType(example, name) {
            var objStr = objToStr.call(example), type = new Type(function(value) {
                return objToStr.call(value) === objStr;
            }, name);
            return builtInTypes[name] = type, example && "function" == typeof example.constructor && (builtInCtorFns.push(example.constructor), 
            builtInCtorTypes.push(type)), type;
        }
        function toType(from, name) {
            if (from instanceof Type) return from;
            if (from instanceof Def) return from.type;
            if (isArray.check(from)) return Type.fromArray(from);
            if (isObject.check(from)) return Type.fromObject(from);
            if (isFunction.check(from)) {
                var bicfIndex = builtInCtorFns.indexOf(from);
                return bicfIndex >= 0 ? builtInCtorTypes[bicfIndex] : new Type(from, name);
            }
            return new Type(function(value) {
                return value === from;
            }, isUndefined.check(name) ? function() {
                return from + "";
            } : name);
        }
        function Field(name, type, defaultFn, hidden) {
            var self = this;
            if (!(self instanceof Field)) throw new Error("Field constructor cannot be invoked without 'new'");
            isString.assert(name), type = toType(type);
            var properties = {
                name: {
                    value: name
                },
                type: {
                    value: type
                },
                hidden: {
                    value: !!hidden
                }
            };
            isFunction.check(defaultFn) && (properties.defaultFn = {
                value: defaultFn
            }), Object.defineProperties(self, properties);
        }
        function Def(typeName) {
            var self = this;
            if (!(self instanceof Def)) throw new Error("Def constructor cannot be invoked without 'new'");
            Object.defineProperties(self, {
                typeName: {
                    value: typeName
                },
                baseNames: {
                    value: []
                },
                ownFields: {
                    value: Object.create(null)
                },
                allSupertypes: {
                    value: Object.create(null)
                },
                supertypeList: {
                    value: []
                },
                allFields: {
                    value: Object.create(null)
                },
                fieldNames: {
                    value: []
                },
                type: {
                    value: new Type(function(value, deep) {
                        return self.check(value, deep);
                    }, typeName)
                }
            });
        }
        function getBuilderName(typeName) {
            return typeName.replace(/^[A-Z]+/, function(upperCasePrefix) {
                var len = upperCasePrefix.length;
                switch (len) {
                  case 0:
                    return "";

                  case 1:
                    return upperCasePrefix.toLowerCase();

                  default:
                    return upperCasePrefix.slice(0, len - 1).toLowerCase() + upperCasePrefix.charAt(len - 1);
                }
            });
        }
        function getStatementBuilderName(typeName) {
            return typeName = getBuilderName(typeName), typeName.replace(/(Expression)?$/, "Statement");
        }
        function getFieldNames(object) {
            var d = Def.fromValue(object);
            if (d) return d.fieldNames.slice(0);
            if ("type" in object) throw new Error("did not recognize object of type " + JSON.stringify(object.type));
            return Object.keys(object);
        }
        function getFieldValue(object, fieldName) {
            var d = Def.fromValue(object);
            if (d) {
                var field = d.allFields[fieldName];
                if (field) return field.getValue(object);
            }
            return object && object[fieldName];
        }
        function wrapExpressionBuilderWithStatement(typeName) {
            var wrapperName = getStatementBuilderName(typeName);
            if (!builders[wrapperName]) {
                var wrapped = builders[getBuilderName(typeName)];
                wrapped && (builders[wrapperName] = function() {
                    return builders.expressionStatement(wrapped.apply(builders, arguments));
                });
            }
        }
        function populateSupertypeList(typeName, list) {
            list.length = 0, list.push(typeName);
            for (var lastSeen = Object.create(null), pos = 0; pos < list.length; ++pos) {
                typeName = list[pos];
                var d = defCache[typeName];
                if (d.finalized !== !0) throw new Error("");
                hasOwn.call(lastSeen, typeName) && delete list[lastSeen[typeName]], lastSeen[typeName] = pos, 
                list.push.apply(list, d.baseNames);
            }
            for (var to = 0, from = to, len = list.length; from < len; ++from) hasOwn.call(list, from) && (list[to++] = list[from]);
            list.length = to;
        }
        function extend(into, from) {
            return Object.keys(from).forEach(function(name) {
                into[name] = from[name];
            }), into;
        }
        var exports = {}, Tp = Type.prototype;
        exports.Type = Type, Tp.assert = function(value, deep) {
            if (!this.check(value, deep)) {
                var str = shallowStringify(value);
                throw new Error(str + " does not match type " + this);
            }
            return !0;
        }, Tp.toString = function() {
            var name = this.name;
            return isString.check(name) ? name : isFunction.check(name) ? name.call(this) + "" : name + " type";
        };
        var builtInCtorFns = [], builtInCtorTypes = [], builtInTypes = {};
        exports.builtInTypes = builtInTypes;
        var isString = defBuiltInType("truthy", "string"), isFunction = defBuiltInType(function() {}, "function"), isArray = defBuiltInType([], "array"), isObject = defBuiltInType({}, "object"), isNumber = (defBuiltInType(/./, "RegExp"), 
        defBuiltInType(new Date(), "Date"), defBuiltInType(3, "number")), isUndefined = (defBuiltInType(!0, "boolean"), 
        defBuiltInType(null, "null"), defBuiltInType(void 0, "undefined"));
        Type.or = function() {
            for (var types = [], len = arguments.length, i = 0; i < len; ++i) types.push(toType(arguments[i]));
            return new Type(function(value, deep) {
                for (var i = 0; i < len; ++i) if (types[i].check(value, deep)) return !0;
                return !1;
            }, function() {
                return types.join(" | ");
            });
        }, Type.fromArray = function(arr) {
            if (!isArray.check(arr)) throw new Error("");
            if (1 !== arr.length) throw new Error("only one element type is permitted for typed arrays");
            return toType(arr[0]).arrayOf();
        }, Tp.arrayOf = function() {
            var elemType = this;
            return new Type(function(value, deep) {
                return isArray.check(value) && value.every(function(elem) {
                    return elemType.check(elem, deep);
                });
            }, function() {
                return "[" + elemType + "]";
            });
        }, Type.fromObject = function(obj) {
            var fields = Object.keys(obj).map(function(name) {
                return new Field(name, obj[name]);
            });
            return new Type(function(value, deep) {
                return isObject.check(value) && fields.every(function(field) {
                    return field.type.check(value[field.name], deep);
                });
            }, function() {
                return "{ " + fields.join(", ") + " }";
            });
        };
        var Fp = Field.prototype;
        Fp.toString = function() {
            return JSON.stringify(this.name) + ": " + this.type;
        }, Fp.getValue = function(obj) {
            var value = obj[this.name];
            return isUndefined.check(value) ? (this.defaultFn && (value = this.defaultFn.call(obj)), 
            value) : value;
        }, Type.def = function(typeName) {
            return isString.assert(typeName), hasOwn.call(defCache, typeName) ? defCache[typeName] : defCache[typeName] = new Def(typeName);
        };
        var defCache = Object.create(null);
        Def.fromValue = function(value) {
            if (value && "object" === ("undefined" == typeof value ? "undefined" : _typeof(value))) {
                var type = value.type;
                if ("string" == typeof type && hasOwn.call(defCache, type)) {
                    var d = defCache[type];
                    if (d.finalized) return d;
                }
            }
            return null;
        };
        var Dp = Def.prototype;
        Dp.isSupertypeOf = function(that) {
            if (that instanceof Def) {
                if (this.finalized !== !0 || that.finalized !== !0) throw new Error("");
                return hasOwn.call(that.allSupertypes, this.typeName);
            }
            throw new Error(that + " is not a Def");
        }, exports.getSupertypeNames = function(typeName) {
            if (!hasOwn.call(defCache, typeName)) throw new Error("");
            var d = defCache[typeName];
            if (d.finalized !== !0) throw new Error("");
            return d.supertypeList.slice(1);
        }, exports.computeSupertypeLookupTable = function(candidates) {
            for (var table = {}, typeNames = Object.keys(defCache), typeNameCount = typeNames.length, i = 0; i < typeNameCount; ++i) {
                var typeName = typeNames[i], d = defCache[typeName];
                if (d.finalized !== !0) throw new Error("" + typeName);
                for (var j = 0; j < d.supertypeList.length; ++j) {
                    var superTypeName = d.supertypeList[j];
                    if (hasOwn.call(candidates, superTypeName)) {
                        table[typeName] = superTypeName;
                        break;
                    }
                }
            }
            return table;
        }, Dp.checkAllFields = function(value, deep) {
            function checkFieldByName(name) {
                var field = allFields[name], type = field.type, child = field.getValue(value);
                return type.check(child, deep);
            }
            var allFields = this.allFields;
            if (this.finalized !== !0) throw new Error("" + this.typeName);
            return isObject.check(value) && Object.keys(allFields).every(checkFieldByName);
        }, Dp.check = function(value, deep) {
            if (this.finalized !== !0) throw new Error("prematurely checking unfinalized type " + this.typeName);
            if (!isObject.check(value)) return !1;
            var vDef = Def.fromValue(value);
            return vDef ? deep && vDef === this ? this.checkAllFields(value, deep) : !!this.isSupertypeOf(vDef) && (!deep || vDef.checkAllFields(value, deep) && this.checkAllFields(value, !1)) : ("SourceLocation" === this.typeName || "Position" === this.typeName) && this.checkAllFields(value, deep);
        }, Dp.bases = function() {
            var args = slice.call(arguments), bases = this.baseNames;
            if (this.finalized) {
                if (args.length !== bases.length) throw new Error("");
                for (var i = 0; i < args.length; i++) if (args[i] !== bases[i]) throw new Error("");
                return this;
            }
            return args.forEach(function(baseName) {
                isString.assert(baseName), bases.indexOf(baseName) < 0 && bases.push(baseName);
            }), this;
        }, Object.defineProperty(Dp, "buildable", {
            value: !1
        });
        var builders = {};
        exports.builders = builders;
        var nodePrototype = {};
        exports.defineMethod = function(name, func) {
            var old = nodePrototype[name];
            return isUndefined.check(func) ? delete nodePrototype[name] : (isFunction.assert(func), 
            Object.defineProperty(nodePrototype, name, {
                enumerable: !0,
                configurable: !0,
                value: func
            })), old;
        };
        var isArrayOfString = isString.arrayOf();
        Dp.build = function() {
            var self = this, newBuildParams = slice.call(arguments);
            return isArrayOfString.assert(newBuildParams), Object.defineProperty(self, "buildParams", {
                value: newBuildParams,
                writable: !1,
                enumerable: !1,
                configurable: !0
            }), self.buildable ? self : (self.field("type", String, function() {
                return self.typeName;
            }), Object.defineProperty(self, "buildable", {
                value: !0
            }), Object.defineProperty(builders, getBuilderName(self.typeName), {
                enumerable: !0,
                value: function() {
                    function add(param, i) {
                        if (!hasOwn.call(built, param)) {
                            var all = self.allFields;
                            if (!hasOwn.call(all, param)) throw new Error("" + param);
                            var value, field = all[param], type = field.type;
                            if (isNumber.check(i) && i < argc) value = args[i]; else {
                                if (!field.defaultFn) {
                                    var message = "no value or default function given for field " + JSON.stringify(param) + " of " + self.typeName + "(" + self.buildParams.map(function(name) {
                                        return all[name];
                                    }).join(", ") + ")";
                                    throw new Error(message);
                                }
                                value = field.defaultFn.call(built);
                            }
                            if (!type.check(value)) throw new Error(shallowStringify(value) + " does not match field " + field + " of type " + self.typeName);
                            built[param] = value;
                        }
                    }
                    var args = arguments, argc = args.length, built = Object.create(nodePrototype);
                    if (!self.finalized) throw new Error("attempting to instantiate unfinalized type " + self.typeName);
                    if (self.buildParams.forEach(function(param, i) {
                        add(param, i);
                    }), Object.keys(self.allFields).forEach(function(param) {
                        add(param);
                    }), built.type !== self.typeName) throw new Error("");
                    return built;
                }
            }), self);
        }, exports.getBuilderName = getBuilderName, exports.getStatementBuilderName = getStatementBuilderName, 
        Dp.field = function(name, type, defaultFn, hidden) {
            return this.finalized ? (console.error("Ignoring attempt to redefine field " + JSON.stringify(name) + " of finalized type " + JSON.stringify(this.typeName)), 
            this) : (this.ownFields[name] = new Field(name, type, defaultFn, hidden), this);
        };
        var namedTypes = {};
        return exports.namedTypes = namedTypes, exports.getFieldNames = getFieldNames, exports.getFieldValue = getFieldValue, 
        exports.eachField = function(object, callback, context) {
            getFieldNames(object).forEach(function(name) {
                callback.call(this, name, getFieldValue(object, name));
            }, context);
        }, exports.someField = function(object, callback, context) {
            return getFieldNames(object).some(function(name) {
                return callback.call(this, name, getFieldValue(object, name));
            }, context);
        }, Object.defineProperty(Dp, "finalized", {
            value: !1
        }), Dp.finalize = function() {
            var self = this;
            if (!self.finalized) {
                var allFields = self.allFields, allSupertypes = self.allSupertypes;
                self.baseNames.forEach(function(name) {
                    var def = defCache[name];
                    if (!(def instanceof Def)) {
                        var message = "unknown supertype name " + JSON.stringify(name) + " for subtype " + JSON.stringify(self.typeName);
                        throw new Error(message);
                    }
                    def.finalize(), extend(allFields, def.allFields), extend(allSupertypes, def.allSupertypes);
                }), extend(allFields, self.ownFields), allSupertypes[self.typeName] = self, self.fieldNames.length = 0;
                for (var fieldName in allFields) hasOwn.call(allFields, fieldName) && !allFields[fieldName].hidden && self.fieldNames.push(fieldName);
                Object.defineProperty(namedTypes, self.typeName, {
                    enumerable: !0,
                    value: self.type
                }), Object.defineProperty(self, "finalized", {
                    value: !0
                }), populateSupertypeList(self.typeName, self.supertypeList), self.buildable && self.supertypeList.lastIndexOf("Expression") >= 0 && wrapExpressionBuilderWithStatement(self.typeName);
            }
        }, exports.finalize = function() {
            Object.keys(defCache).forEach(function(name) {
                defCache[name].finalize();
            });
        }, exports;
    };
}, /*!*******************************************!*\
  !*** ./~/recast/~/ast-types/lib/types.js ***!
  \*******************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, Ap = Array.prototype, slice = Ap.slice, Op = (Ap.map, Ap.forEach, Object.prototype), objToStr = Op.toString, funObjStr = objToStr.call(function() {}), strObjStr = objToStr.call(""), hasOwn = Op.hasOwnProperty;
    module.exports = function() {
        function Type(check, name) {
            var self = this;
            if (!(self instanceof Type)) throw new Error("Type constructor cannot be invoked without 'new'");
            if (objToStr.call(check) !== funObjStr) throw new Error(check + " is not a function");
            var nameObjStr = objToStr.call(name);
            if (nameObjStr !== funObjStr && nameObjStr !== strObjStr) throw new Error(name + " is neither a function nor a string");
            Object.defineProperties(self, {
                name: {
                    value: name
                },
                check: {
                    value: function(_value, deep) {
                        var result = check.call(self, _value, deep);
                        return !result && deep && objToStr.call(deep) === funObjStr && deep(self, _value), 
                        result;
                    }
                }
            });
        }
        function shallowStringify(value) {
            return isObject.check(value) ? "{" + Object.keys(value).map(function(key) {
                return key + ": " + value[key];
            }).join(", ") + "}" : isArray.check(value) ? "[" + value.map(shallowStringify).join(", ") + "]" : JSON.stringify(value);
        }
        function defBuiltInType(example, name) {
            var objStr = objToStr.call(example), type = new Type(function(value) {
                return objToStr.call(value) === objStr;
            }, name);
            return builtInTypes[name] = type, example && "function" == typeof example.constructor && (builtInCtorFns.push(example.constructor), 
            builtInCtorTypes.push(type)), type;
        }
        function toType(from, name) {
            if (from instanceof Type) return from;
            if (from instanceof Def) return from.type;
            if (isArray.check(from)) return Type.fromArray(from);
            if (isObject.check(from)) return Type.fromObject(from);
            if (isFunction.check(from)) {
                var bicfIndex = builtInCtorFns.indexOf(from);
                return bicfIndex >= 0 ? builtInCtorTypes[bicfIndex] : new Type(from, name);
            }
            return new Type(function(value) {
                return value === from;
            }, isUndefined.check(name) ? function() {
                return from + "";
            } : name);
        }
        function Field(name, type, defaultFn, hidden) {
            var self = this;
            if (!(self instanceof Field)) throw new Error("Field constructor cannot be invoked without 'new'");
            isString.assert(name), type = toType(type);
            var properties = {
                name: {
                    value: name
                },
                type: {
                    value: type
                },
                hidden: {
                    value: !!hidden
                }
            };
            isFunction.check(defaultFn) && (properties.defaultFn = {
                value: defaultFn
            }), Object.defineProperties(self, properties);
        }
        function Def(typeName) {
            var self = this;
            if (!(self instanceof Def)) throw new Error("Def constructor cannot be invoked without 'new'");
            Object.defineProperties(self, {
                typeName: {
                    value: typeName
                },
                baseNames: {
                    value: []
                },
                ownFields: {
                    value: Object.create(null)
                },
                allSupertypes: {
                    value: Object.create(null)
                },
                supertypeList: {
                    value: []
                },
                allFields: {
                    value: Object.create(null)
                },
                fieldNames: {
                    value: []
                },
                type: {
                    value: new Type(function(value, deep) {
                        return self.check(value, deep);
                    }, typeName)
                }
            });
        }
        function getBuilderName(typeName) {
            return typeName.replace(/^[A-Z]+/, function(upperCasePrefix) {
                var len = upperCasePrefix.length;
                switch (len) {
                  case 0:
                    return "";

                  case 1:
                    return upperCasePrefix.toLowerCase();

                  default:
                    return upperCasePrefix.slice(0, len - 1).toLowerCase() + upperCasePrefix.charAt(len - 1);
                }
            });
        }
        function getStatementBuilderName(typeName) {
            return typeName = getBuilderName(typeName), typeName.replace(/(Expression)?$/, "Statement");
        }
        function getFieldNames(object) {
            var d = Def.fromValue(object);
            if (d) return d.fieldNames.slice(0);
            if ("type" in object) throw new Error("did not recognize object of type " + JSON.stringify(object.type));
            return Object.keys(object);
        }
        function getFieldValue(object, fieldName) {
            var d = Def.fromValue(object);
            if (d) {
                var field = d.allFields[fieldName];
                if (field) return field.getValue(object);
            }
            return object && object[fieldName];
        }
        function wrapExpressionBuilderWithStatement(typeName) {
            var wrapperName = getStatementBuilderName(typeName);
            if (!builders[wrapperName]) {
                var wrapped = builders[getBuilderName(typeName)];
                wrapped && (builders[wrapperName] = function() {
                    return builders.expressionStatement(wrapped.apply(builders, arguments));
                });
            }
        }
        function populateSupertypeList(typeName, list) {
            list.length = 0, list.push(typeName);
            for (var lastSeen = Object.create(null), pos = 0; pos < list.length; ++pos) {
                typeName = list[pos];
                var d = defCache[typeName];
                if (d.finalized !== !0) throw new Error("");
                hasOwn.call(lastSeen, typeName) && delete list[lastSeen[typeName]], lastSeen[typeName] = pos, 
                list.push.apply(list, d.baseNames);
            }
            for (var to = 0, from = to, len = list.length; from < len; ++from) hasOwn.call(list, from) && (list[to++] = list[from]);
            list.length = to;
        }
        function extend(into, from) {
            return Object.keys(from).forEach(function(name) {
                into[name] = from[name];
            }), into;
        }
        var exports = {}, Tp = Type.prototype;
        exports.Type = Type, Tp.assert = function(value, deep) {
            if (!this.check(value, deep)) {
                var str = shallowStringify(value);
                throw new Error(str + " does not match type " + this);
            }
            return !0;
        }, Tp.toString = function() {
            var name = this.name;
            return isString.check(name) ? name : isFunction.check(name) ? name.call(this) + "" : name + " type";
        };
        var builtInCtorFns = [], builtInCtorTypes = [], builtInTypes = {};
        exports.builtInTypes = builtInTypes;
        var isString = defBuiltInType("truthy", "string"), isFunction = defBuiltInType(function() {}, "function"), isArray = defBuiltInType([], "array"), isObject = defBuiltInType({}, "object"), isNumber = (defBuiltInType(/./, "RegExp"), 
        defBuiltInType(new Date(), "Date"), defBuiltInType(3, "number")), isUndefined = (defBuiltInType(!0, "boolean"), 
        defBuiltInType(null, "null"), defBuiltInType(void 0, "undefined"));
        Type.or = function() {
            for (var types = [], len = arguments.length, i = 0; i < len; ++i) types.push(toType(arguments[i]));
            return new Type(function(value, deep) {
                for (var i = 0; i < len; ++i) if (types[i].check(value, deep)) return !0;
                return !1;
            }, function() {
                return types.join(" | ");
            });
        }, Type.fromArray = function(arr) {
            if (!isArray.check(arr)) throw new Error("");
            if (1 !== arr.length) throw new Error("only one element type is permitted for typed arrays");
            return toType(arr[0]).arrayOf();
        }, Tp.arrayOf = function() {
            var elemType = this;
            return new Type(function(value, deep) {
                return isArray.check(value) && value.every(function(elem) {
                    return elemType.check(elem, deep);
                });
            }, function() {
                return "[" + elemType + "]";
            });
        }, Type.fromObject = function(obj) {
            var fields = Object.keys(obj).map(function(name) {
                return new Field(name, obj[name]);
            });
            return new Type(function(value, deep) {
                return isObject.check(value) && fields.every(function(field) {
                    return field.type.check(value[field.name], deep);
                });
            }, function() {
                return "{ " + fields.join(", ") + " }";
            });
        };
        var Fp = Field.prototype;
        Fp.toString = function() {
            return JSON.stringify(this.name) + ": " + this.type;
        }, Fp.getValue = function(obj) {
            var value = obj[this.name];
            return isUndefined.check(value) ? (this.defaultFn && (value = this.defaultFn.call(obj)), 
            value) : value;
        }, Type.def = function(typeName) {
            return isString.assert(typeName), hasOwn.call(defCache, typeName) ? defCache[typeName] : defCache[typeName] = new Def(typeName);
        };
        var defCache = Object.create(null);
        Def.fromValue = function(value) {
            if (value && "object" === ("undefined" == typeof value ? "undefined" : _typeof(value))) {
                var type = value.type;
                if ("string" == typeof type && hasOwn.call(defCache, type)) {
                    var d = defCache[type];
                    if (d.finalized) return d;
                }
            }
            return null;
        };
        var Dp = Def.prototype;
        Dp.isSupertypeOf = function(that) {
            if (that instanceof Def) {
                if (this.finalized !== !0 || that.finalized !== !0) throw new Error("");
                return hasOwn.call(that.allSupertypes, this.typeName);
            }
            throw new Error(that + " is not a Def");
        }, exports.getSupertypeNames = function(typeName) {
            if (!hasOwn.call(defCache, typeName)) throw new Error("");
            var d = defCache[typeName];
            if (d.finalized !== !0) throw new Error("");
            return d.supertypeList.slice(1);
        }, exports.computeSupertypeLookupTable = function(candidates) {
            for (var table = {}, typeNames = Object.keys(defCache), typeNameCount = typeNames.length, i = 0; i < typeNameCount; ++i) {
                var typeName = typeNames[i], d = defCache[typeName];
                if (d.finalized !== !0) throw new Error("" + typeName);
                for (var j = 0; j < d.supertypeList.length; ++j) {
                    var superTypeName = d.supertypeList[j];
                    if (hasOwn.call(candidates, superTypeName)) {
                        table[typeName] = superTypeName;
                        break;
                    }
                }
            }
            return table;
        }, Dp.checkAllFields = function(value, deep) {
            function checkFieldByName(name) {
                var field = allFields[name], type = field.type, child = field.getValue(value);
                return type.check(child, deep);
            }
            var allFields = this.allFields;
            if (this.finalized !== !0) throw new Error("" + this.typeName);
            return isObject.check(value) && Object.keys(allFields).every(checkFieldByName);
        }, Dp.check = function(value, deep) {
            if (this.finalized !== !0) throw new Error("prematurely checking unfinalized type " + this.typeName);
            if (!isObject.check(value)) return !1;
            var vDef = Def.fromValue(value);
            return vDef ? deep && vDef === this ? this.checkAllFields(value, deep) : !!this.isSupertypeOf(vDef) && (!deep || vDef.checkAllFields(value, deep) && this.checkAllFields(value, !1)) : ("SourceLocation" === this.typeName || "Position" === this.typeName) && this.checkAllFields(value, deep);
        }, Dp.bases = function() {
            var args = slice.call(arguments), bases = this.baseNames;
            if (this.finalized) {
                if (args.length !== bases.length) throw new Error("");
                for (var i = 0; i < args.length; i++) if (args[i] !== bases[i]) throw new Error("");
                return this;
            }
            return args.forEach(function(baseName) {
                isString.assert(baseName), bases.indexOf(baseName) < 0 && bases.push(baseName);
            }), this;
        }, Object.defineProperty(Dp, "buildable", {
            value: !1
        });
        var builders = {};
        exports.builders = builders;
        var nodePrototype = {};
        exports.defineMethod = function(name, func) {
            var old = nodePrototype[name];
            return isUndefined.check(func) ? delete nodePrototype[name] : (isFunction.assert(func), 
            Object.defineProperty(nodePrototype, name, {
                enumerable: !0,
                configurable: !0,
                value: func
            })), old;
        };
        var isArrayOfString = isString.arrayOf();
        Dp.build = function() {
            var self = this, newBuildParams = slice.call(arguments);
            return isArrayOfString.assert(newBuildParams), Object.defineProperty(self, "buildParams", {
                value: newBuildParams,
                writable: !1,
                enumerable: !1,
                configurable: !0
            }), self.buildable ? self : (self.field("type", String, function() {
                return self.typeName;
            }), Object.defineProperty(self, "buildable", {
                value: !0
            }), Object.defineProperty(builders, getBuilderName(self.typeName), {
                enumerable: !0,
                value: function() {
                    function add(param, i) {
                        if (!hasOwn.call(built, param)) {
                            var all = self.allFields;
                            if (!hasOwn.call(all, param)) throw new Error("" + param);
                            var value, field = all[param], type = field.type;
                            if (isNumber.check(i) && i < argc) value = args[i]; else {
                                if (!field.defaultFn) {
                                    var message = "no value or default function given for field " + JSON.stringify(param) + " of " + self.typeName + "(" + self.buildParams.map(function(name) {
                                        return all[name];
                                    }).join(", ") + ")";
                                    throw new Error(message);
                                }
                                value = field.defaultFn.call(built);
                            }
                            if (!type.check(value)) throw new Error(shallowStringify(value) + " does not match field " + field + " of type " + self.typeName);
                            built[param] = value;
                        }
                    }
                    var args = arguments, argc = args.length, built = Object.create(nodePrototype);
                    if (!self.finalized) throw new Error("attempting to instantiate unfinalized type " + self.typeName);
                    if (self.buildParams.forEach(function(param, i) {
                        add(param, i);
                    }), Object.keys(self.allFields).forEach(function(param) {
                        add(param);
                    }), built.type !== self.typeName) throw new Error("");
                    return built;
                }
            }), self);
        }, exports.getBuilderName = getBuilderName, exports.getStatementBuilderName = getStatementBuilderName, 
        Dp.field = function(name, type, defaultFn, hidden) {
            return this.finalized ? (console.error("Ignoring attempt to redefine field " + JSON.stringify(name) + " of finalized type " + JSON.stringify(this.typeName)), 
            this) : (this.ownFields[name] = new Field(name, type, defaultFn, hidden), this);
        };
        var namedTypes = {};
        return exports.namedTypes = namedTypes, exports.getFieldNames = getFieldNames, exports.getFieldValue = getFieldValue, 
        exports.eachField = function(object, callback, context) {
            getFieldNames(object).forEach(function(name) {
                callback.call(this, name, getFieldValue(object, name));
            }, context);
        }, exports.someField = function(object, callback, context) {
            return getFieldNames(object).some(function(name) {
                return callback.call(this, name, getFieldValue(object, name));
            }, context);
        }, Object.defineProperty(Dp, "finalized", {
            value: !1
        }), Dp.finalize = function() {
            var self = this;
            if (!self.finalized) {
                var allFields = self.allFields, allSupertypes = self.allSupertypes;
                self.baseNames.forEach(function(name) {
                    var def = defCache[name];
                    if (!(def instanceof Def)) {
                        var message = "unknown supertype name " + JSON.stringify(name) + " for subtype " + JSON.stringify(self.typeName);
                        throw new Error(message);
                    }
                    def.finalize(), extend(allFields, def.allFields), extend(allSupertypes, def.allSupertypes);
                }), extend(allFields, self.ownFields), allSupertypes[self.typeName] = self, self.fieldNames.length = 0;
                for (var fieldName in allFields) hasOwn.call(allFields, fieldName) && !allFields[fieldName].hidden && self.fieldNames.push(fieldName);
                Object.defineProperty(namedTypes, self.typeName, {
                    enumerable: !0,
                    value: self.type
                }), Object.defineProperty(self, "finalized", {
                    value: !0
                }), populateSupertypeList(self.typeName, self.supertypeList), self.buildable && self.supertypeList.lastIndexOf("Expression") >= 0 && wrapExpressionBuilderWithStatement(self.typeName);
            }
        }, exports.finalize = function() {
            Object.keys(defCache).forEach(function(name) {
                defCache[name].finalize();
            });
        }, exports;
    };
}, /*!***********************************!*\
  !*** ./~/ast-types/lib/shared.js ***!
  \***********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    module.exports = function(fork) {
        var exports = {}, types = fork.use(__webpack_require__(/*! ../lib/types */ 0)), Type = types.Type, builtin = types.builtInTypes, isNumber = builtin.number;
        exports.geq = function(than) {
            return new Type(function(value) {
                return isNumber.check(value) && value >= than;
            }, isNumber + " >= " + than);
        }, exports.defaults = {
            null: function() {
                return null;
            },
            emptyArray: function() {
                return [];
            },
            false: function() {
                return !1;
            },
            true: function() {
                return !0;
            },
            undefined: function() {}
        };
        var naiveIsPrimitive = Type.or(builtin.string, builtin.number, builtin.boolean, builtin.null, builtin.undefined);
        return exports.isPrimitive = new Type(function(value) {
            if (null === value) return !0;
            var type = "undefined" == typeof value ? "undefined" : _typeof(value);
            return !("object" === type || "function" === type);
        }, naiveIsPrimitive.toString()), exports;
    };
}, /*!*******************************!*\
  !*** ./~/recast/lib/types.js ***!
  \*******************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = __webpack_require__(/*! ast-types */ 60);
}, /*!********************************************!*\
  !*** ./~/recast/~/ast-types/lib/shared.js ***!
  \********************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    module.exports = function(fork) {
        var exports = {}, types = fork.use(__webpack_require__(/*! ../lib/types */ 1)), Type = types.Type, builtin = types.builtInTypes, isNumber = builtin.number;
        exports.geq = function(than) {
            return new Type(function(value) {
                return isNumber.check(value) && value >= than;
            }, isNumber + " >= " + than);
        }, exports.defaults = {
            null: function() {
                return null;
            },
            emptyArray: function() {
                return [];
            },
            false: function() {
                return !1;
            },
            true: function() {
                return !0;
            },
            undefined: function() {}
        };
        var naiveIsPrimitive = Type.or(builtin.string, builtin.number, builtin.boolean, builtin.null, builtin.undefined);
        return exports.isPrimitive = new Type(function(value) {
            if (null === value) return !0;
            var type = "undefined" == typeof value ? "undefined" : _typeof(value);
            return !("object" === type || "function" === type);
        }, naiveIsPrimitive.toString()), exports;
    };
}, /*!****************************!*\
  !*** ./~/assert/assert.js ***!
  \****************************/
function(module, exports, __webpack_require__) {
    "use strict";
    (function(global) {
        function compare(a, b) {
            if (a === b) return 0;
            for (var x = a.length, y = b.length, i = 0, len = Math.min(x, y); i < len; ++i) if (a[i] !== b[i]) {
                x = a[i], y = b[i];
                break;
            }
            return x < y ? -1 : y < x ? 1 : 0;
        }
        function isBuffer(b) {
            return global.Buffer && "function" == typeof global.Buffer.isBuffer ? global.Buffer.isBuffer(b) : !(null == b || !b._isBuffer);
        }
        function pToString(obj) {
            return Object.prototype.toString.call(obj);
        }
        function isView(arrbuf) {
            return !isBuffer(arrbuf) && ("function" == typeof global.ArrayBuffer && ("function" == typeof ArrayBuffer.isView ? ArrayBuffer.isView(arrbuf) : !!arrbuf && (arrbuf instanceof DataView || !!(arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer))));
        }
        function getName(func) {
            if (util.isFunction(func)) {
                if (functionsHaveNames) return func.name;
                var str = func.toString(), match = str.match(regex);
                return match && match[1];
            }
        }
        function truncate(s, n) {
            return "string" == typeof s ? s.length < n ? s : s.slice(0, n) : s;
        }
        function inspect(something) {
            if (functionsHaveNames || !util.isFunction(something)) return util.inspect(something);
            var rawname = getName(something), name = rawname ? ": " + rawname : "";
            return "[Function" + name + "]";
        }
        function getMessage(self) {
            return truncate(inspect(self.actual), 128) + " " + self.operator + " " + truncate(inspect(self.expected), 128);
        }
        function fail(actual, expected, message, operator, stackStartFunction) {
            throw new assert.AssertionError({
                message: message,
                actual: actual,
                expected: expected,
                operator: operator,
                stackStartFunction: stackStartFunction
            });
        }
        function ok(value, message) {
            value || fail(value, !0, message, "==", assert.ok);
        }
        function _deepEqual(actual, expected, strict, memos) {
            if (actual === expected) return !0;
            if (isBuffer(actual) && isBuffer(expected)) return 0 === compare(actual, expected);
            if (util.isDate(actual) && util.isDate(expected)) return actual.getTime() === expected.getTime();
            if (util.isRegExp(actual) && util.isRegExp(expected)) return actual.source === expected.source && actual.global === expected.global && actual.multiline === expected.multiline && actual.lastIndex === expected.lastIndex && actual.ignoreCase === expected.ignoreCase;
            if (null !== actual && "object" === ("undefined" == typeof actual ? "undefined" : _typeof(actual)) || null !== expected && "object" === ("undefined" == typeof expected ? "undefined" : _typeof(expected))) {
                if (isView(actual) && isView(expected) && pToString(actual) === pToString(expected) && !(actual instanceof Float32Array || actual instanceof Float64Array)) return 0 === compare(new Uint8Array(actual.buffer), new Uint8Array(expected.buffer));
                if (isBuffer(actual) !== isBuffer(expected)) return !1;
                memos = memos || {
                    actual: [],
                    expected: []
                };
                var actualIndex = memos.actual.indexOf(actual);
                return actualIndex !== -1 && actualIndex === memos.expected.indexOf(expected) || (memos.actual.push(actual), 
                memos.expected.push(expected), objEquiv(actual, expected, strict, memos));
            }
            return strict ? actual === expected : actual == expected;
        }
        function isArguments(object) {
            return "[object Arguments]" == Object.prototype.toString.call(object);
        }
        function objEquiv(a, b, strict, actualVisitedObjects) {
            if (null === a || void 0 === a || null === b || void 0 === b) return !1;
            if (util.isPrimitive(a) || util.isPrimitive(b)) return a === b;
            if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return !1;
            var aIsArgs = isArguments(a), bIsArgs = isArguments(b);
            if (aIsArgs && !bIsArgs || !aIsArgs && bIsArgs) return !1;
            if (aIsArgs) return a = pSlice.call(a), b = pSlice.call(b), _deepEqual(a, b, strict);
            var key, i, ka = objectKeys(a), kb = objectKeys(b);
            if (ka.length !== kb.length) return !1;
            for (ka.sort(), kb.sort(), i = ka.length - 1; i >= 0; i--) if (ka[i] !== kb[i]) return !1;
            for (i = ka.length - 1; i >= 0; i--) if (key = ka[i], !_deepEqual(a[key], b[key], strict, actualVisitedObjects)) return !1;
            return !0;
        }
        function notDeepStrictEqual(actual, expected, message) {
            _deepEqual(actual, expected, !0) && fail(actual, expected, message, "notDeepStrictEqual", notDeepStrictEqual);
        }
        function expectedException(actual, expected) {
            if (!actual || !expected) return !1;
            if ("[object RegExp]" == Object.prototype.toString.call(expected)) return expected.test(actual);
            try {
                if (actual instanceof expected) return !0;
            } catch (e) {}
            return !Error.isPrototypeOf(expected) && expected.call({}, actual) === !0;
        }
        function _tryBlock(block) {
            var error;
            try {
                block();
            } catch (e) {
                error = e;
            }
            return error;
        }
        function _throws(shouldThrow, block, expected, message) {
            var actual;
            if ("function" != typeof block) throw new TypeError('"block" argument must be a function');
            "string" == typeof expected && (message = expected, expected = null), actual = _tryBlock(block), 
            message = (expected && expected.name ? " (" + expected.name + ")." : ".") + (message ? " " + message : "."), 
            shouldThrow && !actual && fail(actual, expected, "Missing expected exception" + message);
            var userProvidedMessage = "string" == typeof message, isUnwantedException = !shouldThrow && util.isError(actual), isUnexpectedException = !shouldThrow && actual && !expected;
            if ((isUnwantedException && userProvidedMessage && expectedException(actual, expected) || isUnexpectedException) && fail(actual, expected, "Got unwanted exception" + message), 
            shouldThrow && actual && expected && !expectedException(actual, expected) || !shouldThrow && actual) throw actual;
        }
        /*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
        var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, util = __webpack_require__(/*! util/ */ 68), hasOwn = Object.prototype.hasOwnProperty, pSlice = Array.prototype.slice, functionsHaveNames = function() {
            return "foo" === function() {}.name;
        }(), assert = module.exports = ok, regex = /\s*function\s+([^\(\s]*)\s*/;
        assert.AssertionError = function(options) {
            this.name = "AssertionError", this.actual = options.actual, this.expected = options.expected, 
            this.operator = options.operator, options.message ? (this.message = options.message, 
            this.generatedMessage = !1) : (this.message = getMessage(this), this.generatedMessage = !0);
            var stackStartFunction = options.stackStartFunction || fail;
            if (Error.captureStackTrace) Error.captureStackTrace(this, stackStartFunction); else {
                var err = new Error();
                if (err.stack) {
                    var out = err.stack, fn_name = getName(stackStartFunction), idx = out.indexOf("\n" + fn_name);
                    if (idx >= 0) {
                        var next_line = out.indexOf("\n", idx + 1);
                        out = out.substring(next_line + 1);
                    }
                    this.stack = out;
                }
            }
        }, util.inherits(assert.AssertionError, Error), assert.fail = fail, assert.ok = ok, 
        assert.equal = function(actual, expected, message) {
            actual != expected && fail(actual, expected, message, "==", assert.equal);
        }, assert.notEqual = function(actual, expected, message) {
            actual == expected && fail(actual, expected, message, "!=", assert.notEqual);
        }, assert.deepEqual = function(actual, expected, message) {
            _deepEqual(actual, expected, !1) || fail(actual, expected, message, "deepEqual", assert.deepEqual);
        }, assert.deepStrictEqual = function(actual, expected, message) {
            _deepEqual(actual, expected, !0) || fail(actual, expected, message, "deepStrictEqual", assert.deepStrictEqual);
        }, assert.notDeepEqual = function(actual, expected, message) {
            _deepEqual(actual, expected, !1) && fail(actual, expected, message, "notDeepEqual", assert.notDeepEqual);
        }, assert.notDeepStrictEqual = notDeepStrictEqual, assert.strictEqual = function(actual, expected, message) {
            actual !== expected && fail(actual, expected, message, "===", assert.strictEqual);
        }, assert.notStrictEqual = function(actual, expected, message) {
            actual === expected && fail(actual, expected, message, "!==", assert.notStrictEqual);
        }, assert.throws = function(block, error, message) {
            _throws(!0, block, error, message);
        }, assert.doesNotThrow = function(block, error, message) {
            _throws(!1, block, error, message);
        }, assert.ifError = function(err) {
            if (err) throw err;
        };
        var objectKeys = Object.keys || function(obj) {
            var keys = [];
            for (var key in obj) hasOwn.call(obj, key) && keys.push(key);
            return keys;
        };
    }).call(exports, __webpack_require__(/*! ./../webpack/buildin/global.js */ 33));
}, /*!******************************!*\
  !*** ./~/recast/lib/util.js ***!
  \******************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function getUnionOfKeys() {
        for (var result = {}, argc = arguments.length, i = 0; i < argc; ++i) for (var keys = Object.keys(arguments[i]), keyCount = keys.length, j = 0; j < keyCount; ++j) result[keys[j]] = !0;
        return result;
    }
    function comparePos(pos1, pos2) {
        return pos1.line - pos2.line || pos1.column - pos2.column;
    }
    function copyPos(pos) {
        return {
            line: pos.line,
            column: pos.column
        };
    }
    function expandLoc(parentLoc, childLoc) {
        parentLoc && childLoc && (comparePos(childLoc.start, parentLoc.start) < 0 && (parentLoc.start = childLoc.start), 
        comparePos(parentLoc.end, childLoc.end) < 0 && (parentLoc.end = childLoc.end));
    }
    function fixTemplateLiteral(node, lines) {
        if (assert.strictEqual(node.type, "TemplateLiteral"), 0 !== node.quasis.length) {
            var afterLeftBackTickPos = copyPos(node.loc.start);
            assert.strictEqual(lines.charAt(afterLeftBackTickPos), "`"), assert.ok(lines.nextPos(afterLeftBackTickPos));
            var firstQuasi = node.quasis[0];
            comparePos(firstQuasi.loc.start, afterLeftBackTickPos) < 0 && (firstQuasi.loc.start = afterLeftBackTickPos);
            var rightBackTickPos = copyPos(node.loc.end);
            assert.ok(lines.prevPos(rightBackTickPos)), assert.strictEqual(lines.charAt(rightBackTickPos), "`");
            var lastQuasi = node.quasis[node.quasis.length - 1];
            comparePos(rightBackTickPos, lastQuasi.loc.end) < 0 && (lastQuasi.loc.end = rightBackTickPos), 
            node.expressions.forEach(function(expr, i) {
                var dollarCurlyPos = lines.skipSpaces(expr.loc.start, !0, !1);
                if (lines.prevPos(dollarCurlyPos) && "{" === lines.charAt(dollarCurlyPos) && lines.prevPos(dollarCurlyPos) && "$" === lines.charAt(dollarCurlyPos)) {
                    var quasiBefore = node.quasis[i];
                    comparePos(dollarCurlyPos, quasiBefore.loc.end) < 0 && (quasiBefore.loc.end = dollarCurlyPos);
                }
                var rightCurlyPos = lines.skipSpaces(expr.loc.end, !1, !1);
                if ("}" === lines.charAt(rightCurlyPos)) {
                    assert.ok(lines.nextPos(rightCurlyPos));
                    var quasiAfter = node.quasis[i + 1];
                    comparePos(quasiAfter.loc.start, rightCurlyPos) < 0 && (quasiAfter.loc.start = rightCurlyPos);
                }
            });
        }
    }
    var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, assert = __webpack_require__(/*! assert */ 5), types = __webpack_require__(/*! ./types */ 3), n = (types.getFieldValue, 
    types.namedTypes), sourceMap = __webpack_require__(/*! source-map */ 16), SourceMapConsumer = sourceMap.SourceMapConsumer, SourceMapGenerator = sourceMap.SourceMapGenerator, hasOwn = Object.prototype.hasOwnProperty, util = exports;
    util.getUnionOfKeys = getUnionOfKeys, util.comparePos = comparePos, util.copyPos = copyPos, 
    util.composeSourceMaps = function(formerMap, latterMap) {
        if (!formerMap) return latterMap || null;
        if (!latterMap) return formerMap;
        var smcFormer = new SourceMapConsumer(formerMap), smcLatter = new SourceMapConsumer(latterMap), smg = new SourceMapGenerator({
            file: latterMap.file,
            sourceRoot: latterMap.sourceRoot
        }), sourcesToContents = {};
        return smcLatter.eachMapping(function(mapping) {
            var origPos = smcFormer.originalPositionFor({
                line: mapping.originalLine,
                column: mapping.originalColumn
            }), sourceName = origPos.source;
            if (null !== sourceName) {
                smg.addMapping({
                    source: sourceName,
                    original: copyPos(origPos),
                    generated: {
                        line: mapping.generatedLine,
                        column: mapping.generatedColumn
                    },
                    name: mapping.name
                });
                var sourceContent = smcFormer.sourceContentFor(sourceName);
                sourceContent && !hasOwn.call(sourcesToContents, sourceName) && (sourcesToContents[sourceName] = sourceContent, 
                smg.setSourceContent(sourceName, sourceContent));
            }
        }), smg.toJSON();
    }, util.getTrueLoc = function(node, lines) {
        function include(node) {
            expandLoc(result, node.loc);
        }
        if (!node.loc) return null;
        var result = {
            start: node.loc.start,
            end: node.loc.end
        };
        return node.comments && node.comments.forEach(include), node.declaration && util.isExportDeclaration(node) && node.declaration.decorators && node.declaration.decorators.forEach(include), 
        comparePos(result.start, result.end) < 0 && (result.start = copyPos(result.start), 
        lines.skipSpaces(result.start, !1, !0), comparePos(result.start, result.end) < 0 && (result.end = copyPos(result.end), 
        lines.skipSpaces(result.end, !0, !0))), result;
    }, util.fixFaultyLocations = function(node, lines) {
        var loc = node.loc;
        if (loc && (loc.start.line < 1 && (loc.start.line = 1), loc.end.line < 1 && (loc.end.line = 1)), 
        "TemplateLiteral" === node.type) fixTemplateLiteral(node, lines); else if (loc && node.decorators) node.decorators.forEach(function(decorator) {
            expandLoc(loc, decorator.loc);
        }); else if (node.declaration && util.isExportDeclaration(node)) {
            node.declaration.loc = null;
            var decorators = node.declaration.decorators;
            decorators && decorators.forEach(function(decorator) {
                expandLoc(loc, decorator.loc);
            });
        } else if (n.MethodDefinition && n.MethodDefinition.check(node) || n.Property.check(node) && (node.method || node.shorthand)) node.value.loc = null, 
        n.FunctionExpression.check(node.value) && (node.value.id = null); else if ("ObjectTypeProperty" === node.type) {
            var loc = node.loc, end = loc && loc.end;
            end && (end = copyPos(end), lines.prevPos(end) && "," === lines.charAt(end) && (end = lines.skipSpaces(end, !0, !0)) && (loc.end = end));
        }
    }, util.isExportDeclaration = function(node) {
        if (node) switch (node.type) {
          case "ExportDeclaration":
          case "ExportDefaultDeclaration":
          case "ExportDefaultSpecifier":
          case "DeclareExportDeclaration":
          case "ExportNamedDeclaration":
          case "ExportAllDeclaration":
            return !0;
        }
        return !1;
    }, util.getParentExportDeclaration = function(path) {
        var parentNode = path.getParentNode();
        return "declaration" === path.getName() && util.isExportDeclaration(parentNode) ? parentNode : null;
    }, util.isTrailingCommaEnabled = function(options, context) {
        var trailingComma = options.trailingComma;
        return "object" === ("undefined" == typeof trailingComma ? "undefined" : _typeof(trailingComma)) ? !!trailingComma[context] : !!trailingComma;
    };
}, /*!********************************!*\
  !*** ./~/ast-types/def/es7.js ***!
  \********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./es6 */ 18));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 0)), def = types.Type.def, or = types.Type.or, defaults = (types.builtInTypes, 
        fork.use(__webpack_require__(/*! ../lib/shared */ 2)).defaults);
        def("Function").field("async", Boolean, defaults.false), def("SpreadProperty").bases("Node").build("argument").field("argument", def("Expression")), 
        def("ObjectExpression").field("properties", [ or(def("Property"), def("SpreadProperty")) ]), 
        def("SpreadPropertyPattern").bases("Pattern").build("argument").field("argument", def("Pattern")), 
        def("ObjectPattern").field("properties", [ or(def("Property"), def("PropertyPattern"), def("SpreadPropertyPattern")) ]), 
        def("AwaitExpression").bases("Expression").build("argument", "all").field("argument", or(def("Expression"), null)).field("all", Boolean, defaults.false);
    };
}, /*!*******************************!*\
  !*** ./~/recast/lib/lines.js ***!
  \*******************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function getSecret(lines) {
        return lines[secretKey];
    }
    function Lines(infos, sourceFileName) {
        assert.ok(this instanceof Lines), assert.ok(infos.length > 0), sourceFileName ? isString.assert(sourceFileName) : sourceFileName = null, 
        Object.defineProperty(this, secretKey, {
            value: {
                infos: infos,
                mappings: [],
                name: sourceFileName,
                cachedSourceMap: null
            }
        }), sourceFileName && getSecret(this).mappings.push(new Mapping(this, {
            start: this.firstPos(),
            end: this.lastPos()
        }));
    }
    function copyLineInfo(info) {
        return {
            line: info.line,
            indent: info.indent,
            locked: info.locked,
            sliceStart: info.sliceStart,
            sliceEnd: info.sliceEnd
        };
    }
    function countSpaces(spaces, tabWidth) {
        for (var count = 0, len = spaces.length, i = 0; i < len; ++i) switch (spaces.charCodeAt(i)) {
          case 9:
            assert.strictEqual("undefined" == typeof tabWidth ? "undefined" : _typeof(tabWidth), "number"), 
            assert.ok(tabWidth > 0);
            var next = Math.ceil(count / tabWidth) * tabWidth;
            next === count ? count += tabWidth : count = next;
            break;

          case 11:
          case 12:
          case 13:
          case 65279:
            break;

          case 32:
          default:
            count += 1;
        }
        return count;
    }
    function fromString(string, options) {
        if (string instanceof Lines) return string;
        string += "";
        var tabWidth = options && options.tabWidth, tabless = string.indexOf("\t") < 0, locked = !(!options || !options.locked), cacheable = !options && tabless && string.length <= maxCacheKeyLen;
        if (assert.ok(tabWidth || tabless, "No tab width specified but encountered tabs in string\n" + string), 
        cacheable && hasOwn.call(fromStringCache, string)) return fromStringCache[string];
        var lines = new Lines(string.split(lineTerminatorSeqExp).map(function(line) {
            var spaces = leadingSpaceExp.exec(line)[0];
            return {
                line: line,
                indent: countSpaces(spaces, tabWidth),
                locked: locked,
                sliceStart: spaces.length,
                sliceEnd: line.length
            };
        }), normalizeOptions(options).sourceFileName);
        return cacheable && (fromStringCache[string] = lines), lines;
    }
    function isOnlyWhitespace(string) {
        return !/\S/.test(string);
    }
    function sliceInfo(info, startCol, endCol) {
        var sliceStart = info.sliceStart, sliceEnd = info.sliceEnd, indent = Math.max(info.indent, 0), lineLength = indent + sliceEnd - sliceStart;
        return "undefined" == typeof endCol && (endCol = lineLength), startCol = Math.max(startCol, 0), 
        endCol = Math.min(endCol, lineLength), endCol = Math.max(endCol, startCol), endCol < indent ? (indent = endCol, 
        sliceEnd = sliceStart) : sliceEnd -= lineLength - endCol, lineLength = endCol, lineLength -= startCol, 
        startCol < indent ? indent -= startCol : (startCol -= indent, indent = 0, sliceStart += startCol), 
        assert.ok(indent >= 0), assert.ok(sliceStart <= sliceEnd), assert.strictEqual(lineLength, indent + sliceEnd - sliceStart), 
        info.indent === indent && info.sliceStart === sliceStart && info.sliceEnd === sliceEnd ? info : {
            line: info.line,
            indent: indent,
            locked: !1,
            sliceStart: sliceStart,
            sliceEnd: sliceEnd
        };
    }
    var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, assert = __webpack_require__(/*! assert */ 5), sourceMap = __webpack_require__(/*! source-map */ 16), normalizeOptions = __webpack_require__(/*! ./options */ 14).normalize, secretKey = __webpack_require__(/*! private */ 21).makeUniqueKey(), types = __webpack_require__(/*! ./types */ 3), isString = types.builtInTypes.string, comparePos = __webpack_require__(/*! ./util */ 6).comparePos, Mapping = __webpack_require__(/*! ./mapping */ 48);
    exports.Lines = Lines;
    var Lp = Lines.prototype;
    Object.defineProperties(Lp, {
        length: {
            get: function() {
                return getSecret(this).infos.length;
            }
        },
        name: {
            get: function() {
                return getSecret(this).name;
            }
        }
    });
    var fromStringCache = {}, hasOwn = fromStringCache.hasOwnProperty, maxCacheKeyLen = 10;
    exports.countSpaces = countSpaces;
    var leadingSpaceExp = /^\s*/, lineTerminatorSeqExp = /\u000D\u000A|\u000D(?!\u000A)|\u000A|\u2028|\u2029/;
    exports.fromString = fromString, Lp.toString = function(options) {
        return this.sliceString(this.firstPos(), this.lastPos(), options);
    }, Lp.getSourceMap = function(sourceMapName, sourceRoot) {
        function updateJSON(json) {
            return json = json || {}, isString.assert(sourceMapName), json.file = sourceMapName, 
            sourceRoot && (isString.assert(sourceRoot), json.sourceRoot = sourceRoot), json;
        }
        if (!sourceMapName) return null;
        var targetLines = this, secret = getSecret(targetLines);
        if (secret.cachedSourceMap) return updateJSON(secret.cachedSourceMap.toJSON());
        var smg = new sourceMap.SourceMapGenerator(updateJSON()), sourcesToContents = {};
        return secret.mappings.forEach(function(mapping) {
            for (var sourceCursor = mapping.sourceLines.skipSpaces(mapping.sourceLoc.start) || mapping.sourceLines.lastPos(), targetCursor = targetLines.skipSpaces(mapping.targetLoc.start) || targetLines.lastPos(); comparePos(sourceCursor, mapping.sourceLoc.end) < 0 && comparePos(targetCursor, mapping.targetLoc.end) < 0; ) {
                var sourceChar = mapping.sourceLines.charAt(sourceCursor), targetChar = targetLines.charAt(targetCursor);
                assert.strictEqual(sourceChar, targetChar);
                var sourceName = mapping.sourceLines.name;
                if (smg.addMapping({
                    source: sourceName,
                    original: {
                        line: sourceCursor.line,
                        column: sourceCursor.column
                    },
                    generated: {
                        line: targetCursor.line,
                        column: targetCursor.column
                    }
                }), !hasOwn.call(sourcesToContents, sourceName)) {
                    var sourceContent = mapping.sourceLines.toString();
                    smg.setSourceContent(sourceName, sourceContent), sourcesToContents[sourceName] = sourceContent;
                }
                targetLines.nextPos(targetCursor, !0), mapping.sourceLines.nextPos(sourceCursor, !0);
            }
        }), secret.cachedSourceMap = smg, smg.toJSON();
    }, Lp.bootstrapCharAt = function(pos) {
        assert.strictEqual("undefined" == typeof pos ? "undefined" : _typeof(pos), "object"), 
        assert.strictEqual(_typeof(pos.line), "number"), assert.strictEqual(_typeof(pos.column), "number");
        var line = pos.line, column = pos.column, strings = this.toString().split(lineTerminatorSeqExp), string = strings[line - 1];
        return "undefined" == typeof string ? "" : column === string.length && line < strings.length ? "\n" : column >= string.length ? "" : string.charAt(column);
    }, Lp.charAt = function(pos) {
        assert.strictEqual("undefined" == typeof pos ? "undefined" : _typeof(pos), "object"), 
        assert.strictEqual(_typeof(pos.line), "number"), assert.strictEqual(_typeof(pos.column), "number");
        var line = pos.line, column = pos.column, secret = getSecret(this), infos = secret.infos, info = infos[line - 1], c = column;
        if ("undefined" == typeof info || c < 0) return "";
        var indent = this.getIndentAt(line);
        return c < indent ? " " : (c += info.sliceStart - indent, c === info.sliceEnd && line < this.length ? "\n" : c >= info.sliceEnd ? "" : info.line.charAt(c));
    }, Lp.stripMargin = function(width, skipFirstLine) {
        if (0 === width) return this;
        if (assert.ok(width > 0, "negative margin: " + width), skipFirstLine && 1 === this.length) return this;
        var secret = getSecret(this), lines = new Lines(secret.infos.map(function(info, i) {
            return info.line && (i > 0 || !skipFirstLine) && (info = copyLineInfo(info), info.indent = Math.max(0, info.indent - width)), 
            info;
        }));
        if (secret.mappings.length > 0) {
            var newMappings = getSecret(lines).mappings;
            assert.strictEqual(newMappings.length, 0), secret.mappings.forEach(function(mapping) {
                newMappings.push(mapping.indent(width, skipFirstLine, !0));
            });
        }
        return lines;
    }, Lp.indent = function(by) {
        if (0 === by) return this;
        var secret = getSecret(this), lines = new Lines(secret.infos.map(function(info) {
            return info.line && !info.locked && (info = copyLineInfo(info), info.indent += by), 
            info;
        }));
        if (secret.mappings.length > 0) {
            var newMappings = getSecret(lines).mappings;
            assert.strictEqual(newMappings.length, 0), secret.mappings.forEach(function(mapping) {
                newMappings.push(mapping.indent(by));
            });
        }
        return lines;
    }, Lp.indentTail = function(by) {
        if (0 === by) return this;
        if (this.length < 2) return this;
        var secret = getSecret(this), lines = new Lines(secret.infos.map(function(info, i) {
            return i > 0 && info.line && !info.locked && (info = copyLineInfo(info), info.indent += by), 
            info;
        }));
        if (secret.mappings.length > 0) {
            var newMappings = getSecret(lines).mappings;
            assert.strictEqual(newMappings.length, 0), secret.mappings.forEach(function(mapping) {
                newMappings.push(mapping.indent(by, !0));
            });
        }
        return lines;
    }, Lp.lockIndentTail = function() {
        if (this.length < 2) return this;
        var infos = getSecret(this).infos;
        return new Lines(infos.map(function(info, i) {
            return info = copyLineInfo(info), info.locked = i > 0, info;
        }));
    }, Lp.getIndentAt = function(line) {
        assert.ok(line >= 1, "no line " + line + " (line numbers start from 1)");
        var secret = getSecret(this), info = secret.infos[line - 1];
        return Math.max(info.indent, 0);
    }, Lp.guessTabWidth = function() {
        var secret = getSecret(this);
        if (hasOwn.call(secret, "cachedTabWidth")) return secret.cachedTabWidth;
        for (var counts = [], lastIndent = 0, line = 1, last = this.length; line <= last; ++line) {
            var info = secret.infos[line - 1], sliced = info.line.slice(info.sliceStart, info.sliceEnd);
            if (!isOnlyWhitespace(sliced)) {
                var diff = Math.abs(info.indent - lastIndent);
                counts[diff] = ~~counts[diff] + 1, lastIndent = info.indent;
            }
        }
        for (var maxCount = -1, result = 2, tabWidth = 1; tabWidth < counts.length; tabWidth += 1) hasOwn.call(counts, tabWidth) && counts[tabWidth] > maxCount && (maxCount = counts[tabWidth], 
        result = tabWidth);
        return secret.cachedTabWidth = result;
    }, Lp.isOnlyWhitespace = function() {
        return isOnlyWhitespace(this.toString());
    }, Lp.isPrecededOnlyByWhitespace = function(pos) {
        var secret = getSecret(this), info = secret.infos[pos.line - 1], indent = Math.max(info.indent, 0), diff = pos.column - indent;
        if (diff <= 0) return !0;
        var start = info.sliceStart, end = Math.min(start + diff, info.sliceEnd), prefix = info.line.slice(start, end);
        return isOnlyWhitespace(prefix);
    }, Lp.getLineLength = function(line) {
        var secret = getSecret(this), info = secret.infos[line - 1];
        return this.getIndentAt(line) + info.sliceEnd - info.sliceStart;
    }, Lp.nextPos = function(pos, skipSpaces) {
        var l = Math.max(pos.line, 0), c = Math.max(pos.column, 0);
        return c < this.getLineLength(l) ? (pos.column += 1, !skipSpaces || !!this.skipSpaces(pos, !1, !0)) : l < this.length && (pos.line += 1, 
        pos.column = 0, !skipSpaces || !!this.skipSpaces(pos, !1, !0));
    }, Lp.prevPos = function(pos, skipSpaces) {
        var l = pos.line, c = pos.column;
        if (c < 1) {
            if (l -= 1, l < 1) return !1;
            c = this.getLineLength(l);
        } else c = Math.min(c - 1, this.getLineLength(l));
        return pos.line = l, pos.column = c, !skipSpaces || !!this.skipSpaces(pos, !0, !0);
    }, Lp.firstPos = function() {
        return {
            line: 1,
            column: 0
        };
    }, Lp.lastPos = function() {
        return {
            line: this.length,
            column: this.getLineLength(this.length)
        };
    }, Lp.skipSpaces = function(pos, backward, modifyInPlace) {
        if (pos = pos ? modifyInPlace ? pos : {
            line: pos.line,
            column: pos.column
        } : backward ? this.lastPos() : this.firstPos(), backward) {
            for (;this.prevPos(pos); ) if (!isOnlyWhitespace(this.charAt(pos)) && this.nextPos(pos)) return pos;
            return null;
        }
        for (;isOnlyWhitespace(this.charAt(pos)); ) if (!this.nextPos(pos)) return null;
        return pos;
    }, Lp.trimLeft = function() {
        var pos = this.skipSpaces(this.firstPos(), !1, !0);
        return pos ? this.slice(pos) : emptyLines;
    }, Lp.trimRight = function() {
        var pos = this.skipSpaces(this.lastPos(), !0, !0);
        return pos ? this.slice(this.firstPos(), pos) : emptyLines;
    }, Lp.trim = function() {
        var start = this.skipSpaces(this.firstPos(), !1, !0);
        if (null === start) return emptyLines;
        var end = this.skipSpaces(this.lastPos(), !0, !0);
        return assert.notStrictEqual(end, null), this.slice(start, end);
    }, Lp.eachPos = function(callback, startPos, skipSpaces) {
        var pos = this.firstPos();
        if (startPos && (pos.line = startPos.line, pos.column = startPos.column), !skipSpaces || this.skipSpaces(pos, !1, !0)) do callback.call(this, pos); while (this.nextPos(pos, skipSpaces));
    }, Lp.bootstrapSlice = function(start, end) {
        var strings = this.toString().split(lineTerminatorSeqExp).slice(start.line - 1, end.line);
        return strings.push(strings.pop().slice(0, end.column)), strings[0] = strings[0].slice(start.column), 
        fromString(strings.join("\n"));
    }, Lp.slice = function(start, end) {
        if (!end) {
            if (!start) return this;
            end = this.lastPos();
        }
        var secret = getSecret(this), sliced = secret.infos.slice(start.line - 1, end.line);
        start.line === end.line ? sliced[0] = sliceInfo(sliced[0], start.column, end.column) : (assert.ok(start.line < end.line), 
        sliced[0] = sliceInfo(sliced[0], start.column), sliced.push(sliceInfo(sliced.pop(), 0, end.column)));
        var lines = new Lines(sliced);
        if (secret.mappings.length > 0) {
            var newMappings = getSecret(lines).mappings;
            assert.strictEqual(newMappings.length, 0), secret.mappings.forEach(function(mapping) {
                var sliced = mapping.slice(this, start, end);
                sliced && newMappings.push(sliced);
            }, this);
        }
        return lines;
    }, Lp.bootstrapSliceString = function(start, end, options) {
        return this.slice(start, end).toString(options);
    }, Lp.sliceString = function(start, end, options) {
        if (!end) {
            if (!start) return this;
            end = this.lastPos();
        }
        options = normalizeOptions(options);
        for (var infos = getSecret(this).infos, parts = [], tabWidth = options.tabWidth, line = start.line; line <= end.line; ++line) {
            var info = infos[line - 1];
            line === start.line ? info = line === end.line ? sliceInfo(info, start.column, end.column) : sliceInfo(info, start.column) : line === end.line && (info = sliceInfo(info, 0, end.column));
            var indent = Math.max(info.indent, 0), before = info.line.slice(0, info.sliceStart);
            if (options.reuseWhitespace && isOnlyWhitespace(before) && countSpaces(before, options.tabWidth) === indent) parts.push(info.line.slice(0, info.sliceEnd)); else {
                var tabs = 0, spaces = indent;
                options.useTabs && (tabs = Math.floor(indent / tabWidth), spaces -= tabs * tabWidth);
                var result = "";
                tabs > 0 && (result += new Array(tabs + 1).join("\t")), spaces > 0 && (result += new Array(spaces + 1).join(" ")), 
                result += info.line.slice(info.sliceStart, info.sliceEnd), parts.push(result);
            }
        }
        return parts.join(options.lineTerminator);
    }, Lp.isEmpty = function() {
        return this.length < 2 && this.getLineLength(1) < 1;
    }, Lp.join = function(elements) {
        function appendSecret(secret) {
            if (null !== secret) {
                if (prevInfo) {
                    var info = secret.infos[0], indent = new Array(info.indent + 1).join(" "), prevLine = infos.length, prevColumn = Math.max(prevInfo.indent, 0) + prevInfo.sliceEnd - prevInfo.sliceStart;
                    prevInfo.line = prevInfo.line.slice(0, prevInfo.sliceEnd) + indent + info.line.slice(info.sliceStart, info.sliceEnd), 
                    prevInfo.locked = prevInfo.locked || info.locked, prevInfo.sliceEnd = prevInfo.line.length, 
                    secret.mappings.length > 0 && secret.mappings.forEach(function(mapping) {
                        mappings.push(mapping.add(prevLine, prevColumn));
                    });
                } else secret.mappings.length > 0 && mappings.push.apply(mappings, secret.mappings);
                secret.infos.forEach(function(info, i) {
                    (!prevInfo || i > 0) && (prevInfo = copyLineInfo(info), infos.push(prevInfo));
                });
            }
        }
        function appendWithSeparator(secret, i) {
            i > 0 && appendSecret(separatorSecret), appendSecret(secret);
        }
        var prevInfo, separator = this, separatorSecret = getSecret(separator), infos = [], mappings = [];
        if (elements.map(function(elem) {
            var lines = fromString(elem);
            return lines.isEmpty() ? null : getSecret(lines);
        }).forEach(separator.isEmpty() ? appendSecret : appendWithSeparator), infos.length < 1) return emptyLines;
        var lines = new Lines(infos);
        return getSecret(lines).mappings = mappings, lines;
    }, exports.concat = function(elements) {
        return emptyLines.join(elements);
    }, Lp.concat = function(other) {
        var args = arguments, list = [ this ];
        return list.push.apply(list, args), assert.strictEqual(list.length, args.length + 1), 
        emptyLines.join(list);
    };
    var emptyLines = fromString("");
}, /*!*****************************************!*\
  !*** ./~/recast/~/ast-types/def/es7.js ***!
  \*****************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./es6 */ 27));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 1)), def = types.Type.def, or = types.Type.or, defaults = (types.builtInTypes, 
        fork.use(__webpack_require__(/*! ../lib/shared */ 4)).defaults);
        def("Function").field("async", Boolean, defaults.false), def("SpreadProperty").bases("Node").build("argument").field("argument", def("Expression")), 
        def("ObjectExpression").field("properties", [ or(def("Property"), def("SpreadProperty")) ]), 
        def("SpreadPropertyPattern").bases("Pattern").build("argument").field("argument", def("Pattern")), 
        def("ObjectPattern").field("properties", [ or(def("Property"), def("PropertyPattern"), def("SpreadPropertyPattern")) ]), 
        def("AwaitExpression").bases("Expression").build("argument", "all").field("argument", or(def("Expression"), null)).field("all", Boolean, defaults.false);
    };
}, /*!**********************************!*\
  !*** ./~/source-map/lib/util.js ***!
  \**********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function getArg(aArgs, aName, aDefaultValue) {
        if (aName in aArgs) return aArgs[aName];
        if (3 === arguments.length) return aDefaultValue;
        throw new Error('"' + aName + '" is a required argument.');
    }
    function urlParse(aUrl) {
        var match = aUrl.match(urlRegexp);
        return match ? {
            scheme: match[1],
            auth: match[2],
            host: match[3],
            port: match[4],
            path: match[5]
        } : null;
    }
    function urlGenerate(aParsedUrl) {
        var url = "";
        return aParsedUrl.scheme && (url += aParsedUrl.scheme + ":"), url += "//", aParsedUrl.auth && (url += aParsedUrl.auth + "@"), 
        aParsedUrl.host && (url += aParsedUrl.host), aParsedUrl.port && (url += ":" + aParsedUrl.port), 
        aParsedUrl.path && (url += aParsedUrl.path), url;
    }
    function normalize(aPath) {
        var path = aPath, url = urlParse(aPath);
        if (url) {
            if (!url.path) return aPath;
            path = url.path;
        }
        for (var part, isAbsolute = exports.isAbsolute(path), parts = path.split(/\/+/), up = 0, i = parts.length - 1; i >= 0; i--) part = parts[i], 
        "." === part ? parts.splice(i, 1) : ".." === part ? up++ : up > 0 && ("" === part ? (parts.splice(i + 1, up), 
        up = 0) : (parts.splice(i, 2), up--));
        return path = parts.join("/"), "" === path && (path = isAbsolute ? "/" : "."), url ? (url.path = path, 
        urlGenerate(url)) : path;
    }
    function join(aRoot, aPath) {
        "" === aRoot && (aRoot = "."), "" === aPath && (aPath = ".");
        var aPathUrl = urlParse(aPath), aRootUrl = urlParse(aRoot);
        if (aRootUrl && (aRoot = aRootUrl.path || "/"), aPathUrl && !aPathUrl.scheme) return aRootUrl && (aPathUrl.scheme = aRootUrl.scheme), 
        urlGenerate(aPathUrl);
        if (aPathUrl || aPath.match(dataUrlRegexp)) return aPath;
        if (aRootUrl && !aRootUrl.host && !aRootUrl.path) return aRootUrl.host = aPath, 
        urlGenerate(aRootUrl);
        var joined = "/" === aPath.charAt(0) ? aPath : normalize(aRoot.replace(/\/+$/, "") + "/" + aPath);
        return aRootUrl ? (aRootUrl.path = joined, urlGenerate(aRootUrl)) : joined;
    }
    function relative(aRoot, aPath) {
        "" === aRoot && (aRoot = "."), aRoot = aRoot.replace(/\/$/, "");
        for (var level = 0; 0 !== aPath.indexOf(aRoot + "/"); ) {
            var index = aRoot.lastIndexOf("/");
            if (index < 0) return aPath;
            if (aRoot = aRoot.slice(0, index), aRoot.match(/^([^\/]+:\/)?\/*$/)) return aPath;
            ++level;
        }
        return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
    }
    function identity(s) {
        return s;
    }
    function toSetString(aStr) {
        return isProtoString(aStr) ? "$" + aStr : aStr;
    }
    function fromSetString(aStr) {
        return isProtoString(aStr) ? aStr.slice(1) : aStr;
    }
    function isProtoString(s) {
        if (!s) return !1;
        var length = s.length;
        if (length < 9) return !1;
        if (95 !== s.charCodeAt(length - 1) || 95 !== s.charCodeAt(length - 2) || 111 !== s.charCodeAt(length - 3) || 116 !== s.charCodeAt(length - 4) || 111 !== s.charCodeAt(length - 5) || 114 !== s.charCodeAt(length - 6) || 112 !== s.charCodeAt(length - 7) || 95 !== s.charCodeAt(length - 8) || 95 !== s.charCodeAt(length - 9)) return !1;
        for (var i = length - 10; i >= 0; i--) if (36 !== s.charCodeAt(i)) return !1;
        return !0;
    }
    function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
        var cmp = mappingA.source - mappingB.source;
        return 0 !== cmp ? cmp : (cmp = mappingA.originalLine - mappingB.originalLine, 0 !== cmp ? cmp : (cmp = mappingA.originalColumn - mappingB.originalColumn, 
        0 !== cmp || onlyCompareOriginal ? cmp : (cmp = mappingA.generatedColumn - mappingB.generatedColumn, 
        0 !== cmp ? cmp : (cmp = mappingA.generatedLine - mappingB.generatedLine, 0 !== cmp ? cmp : mappingA.name - mappingB.name))));
    }
    function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
        var cmp = mappingA.generatedLine - mappingB.generatedLine;
        return 0 !== cmp ? cmp : (cmp = mappingA.generatedColumn - mappingB.generatedColumn, 
        0 !== cmp || onlyCompareGenerated ? cmp : (cmp = mappingA.source - mappingB.source, 
        0 !== cmp ? cmp : (cmp = mappingA.originalLine - mappingB.originalLine, 0 !== cmp ? cmp : (cmp = mappingA.originalColumn - mappingB.originalColumn, 
        0 !== cmp ? cmp : mappingA.name - mappingB.name))));
    }
    function strcmp(aStr1, aStr2) {
        return aStr1 === aStr2 ? 0 : aStr1 > aStr2 ? 1 : -1;
    }
    function compareByGeneratedPositionsInflated(mappingA, mappingB) {
        var cmp = mappingA.generatedLine - mappingB.generatedLine;
        return 0 !== cmp ? cmp : (cmp = mappingA.generatedColumn - mappingB.generatedColumn, 
        0 !== cmp ? cmp : (cmp = strcmp(mappingA.source, mappingB.source), 0 !== cmp ? cmp : (cmp = mappingA.originalLine - mappingB.originalLine, 
        0 !== cmp ? cmp : (cmp = mappingA.originalColumn - mappingB.originalColumn, 0 !== cmp ? cmp : strcmp(mappingA.name, mappingB.name)))));
    }
    exports.getArg = getArg;
    var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/, dataUrlRegexp = /^data:.+\,.+$/;
    exports.urlParse = urlParse, exports.urlGenerate = urlGenerate, exports.normalize = normalize, 
    exports.join = join, exports.isAbsolute = function(aPath) {
        return "/" === aPath.charAt(0) || !!aPath.match(urlRegexp);
    }, exports.relative = relative;
    var supportsNullProto = function() {
        var obj = Object.create(null);
        return !("__proto__" in obj);
    }();
    exports.toSetString = supportsNullProto ? identity : toSetString, exports.fromSetString = supportsNullProto ? identity : fromSetString, 
    exports.compareByOriginalPositions = compareByOriginalPositions, exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated, 
    exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
}, /*!*********************************!*\
  !*** ./~/ast-types/def/core.js ***!
  \*********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 0)), Type = types.Type, def = Type.def, or = Type.or, shared = fork.use(__webpack_require__(/*! ../lib/shared */ 2)), defaults = shared.defaults, geq = shared.geq;
        def("Printable").field("loc", or(def("SourceLocation"), null), defaults.null, !0), 
        def("Node").bases("Printable").field("type", String).field("comments", or([ def("Comment") ], null), defaults.null, !0), 
        def("SourceLocation").build("start", "end", "source").field("start", def("Position")).field("end", def("Position")).field("source", or(String, null), defaults.null), 
        def("Position").build("line", "column").field("line", geq(1)).field("column", geq(0)), 
        def("File").bases("Node").build("program").field("program", def("Program")), def("Program").bases("Node").build("body").field("body", [ def("Statement") ]), 
        def("Function").bases("Node").field("id", or(def("Identifier"), null), defaults.null).field("params", [ def("Pattern") ]).field("body", def("BlockStatement")), 
        def("Statement").bases("Node"), def("EmptyStatement").bases("Statement").build(), 
        def("BlockStatement").bases("Statement").build("body").field("body", [ def("Statement") ]), 
        def("ExpressionStatement").bases("Statement").build("expression").field("expression", def("Expression")), 
        def("IfStatement").bases("Statement").build("test", "consequent", "alternate").field("test", def("Expression")).field("consequent", def("Statement")).field("alternate", or(def("Statement"), null), defaults.null), 
        def("LabeledStatement").bases("Statement").build("label", "body").field("label", def("Identifier")).field("body", def("Statement")), 
        def("BreakStatement").bases("Statement").build("label").field("label", or(def("Identifier"), null), defaults.null), 
        def("ContinueStatement").bases("Statement").build("label").field("label", or(def("Identifier"), null), defaults.null), 
        def("WithStatement").bases("Statement").build("object", "body").field("object", def("Expression")).field("body", def("Statement")), 
        def("SwitchStatement").bases("Statement").build("discriminant", "cases", "lexical").field("discriminant", def("Expression")).field("cases", [ def("SwitchCase") ]).field("lexical", Boolean, defaults.false), 
        def("ReturnStatement").bases("Statement").build("argument").field("argument", or(def("Expression"), null)), 
        def("ThrowStatement").bases("Statement").build("argument").field("argument", def("Expression")), 
        def("TryStatement").bases("Statement").build("block", "handler", "finalizer").field("block", def("BlockStatement")).field("handler", or(def("CatchClause"), null), function() {
            return this.handlers && this.handlers[0] || null;
        }).field("handlers", [ def("CatchClause") ], function() {
            return this.handler ? [ this.handler ] : [];
        }, !0).field("guardedHandlers", [ def("CatchClause") ], defaults.emptyArray).field("finalizer", or(def("BlockStatement"), null), defaults.null), 
        def("CatchClause").bases("Node").build("param", "guard", "body").field("param", def("Pattern")).field("guard", or(def("Expression"), null), defaults.null).field("body", def("BlockStatement")), 
        def("WhileStatement").bases("Statement").build("test", "body").field("test", def("Expression")).field("body", def("Statement")), 
        def("DoWhileStatement").bases("Statement").build("body", "test").field("body", def("Statement")).field("test", def("Expression")), 
        def("ForStatement").bases("Statement").build("init", "test", "update", "body").field("init", or(def("VariableDeclaration"), def("Expression"), null)).field("test", or(def("Expression"), null)).field("update", or(def("Expression"), null)).field("body", def("Statement")), 
        def("ForInStatement").bases("Statement").build("left", "right", "body").field("left", or(def("VariableDeclaration"), def("Expression"))).field("right", def("Expression")).field("body", def("Statement")), 
        def("DebuggerStatement").bases("Statement").build(), def("Declaration").bases("Statement"), 
        def("FunctionDeclaration").bases("Function", "Declaration").build("id", "params", "body").field("id", def("Identifier")), 
        def("FunctionExpression").bases("Function", "Expression").build("id", "params", "body"), 
        def("VariableDeclaration").bases("Declaration").build("kind", "declarations").field("kind", or("var", "let", "const")).field("declarations", [ def("VariableDeclarator") ]), 
        def("VariableDeclarator").bases("Node").build("id", "init").field("id", def("Pattern")).field("init", or(def("Expression"), null)), 
        def("Expression").bases("Node", "Pattern"), def("ThisExpression").bases("Expression").build(), 
        def("ArrayExpression").bases("Expression").build("elements").field("elements", [ or(def("Expression"), null) ]), 
        def("ObjectExpression").bases("Expression").build("properties").field("properties", [ def("Property") ]), 
        def("Property").bases("Node").build("kind", "key", "value").field("kind", or("init", "get", "set")).field("key", or(def("Literal"), def("Identifier"))).field("value", def("Expression")), 
        def("SequenceExpression").bases("Expression").build("expressions").field("expressions", [ def("Expression") ]);
        var UnaryOperator = or("-", "+", "!", "~", "typeof", "void", "delete");
        def("UnaryExpression").bases("Expression").build("operator", "argument", "prefix").field("operator", UnaryOperator).field("argument", def("Expression")).field("prefix", Boolean, defaults.true);
        var BinaryOperator = or("==", "!=", "===", "!==", "<", "<=", ">", ">=", "<<", ">>", ">>>", "+", "-", "*", "/", "%", "&", "|", "^", "in", "instanceof", "..");
        def("BinaryExpression").bases("Expression").build("operator", "left", "right").field("operator", BinaryOperator).field("left", def("Expression")).field("right", def("Expression"));
        var AssignmentOperator = or("=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&=");
        def("AssignmentExpression").bases("Expression").build("operator", "left", "right").field("operator", AssignmentOperator).field("left", def("Pattern")).field("right", def("Expression"));
        var UpdateOperator = or("++", "--");
        def("UpdateExpression").bases("Expression").build("operator", "argument", "prefix").field("operator", UpdateOperator).field("argument", def("Expression")).field("prefix", Boolean);
        var LogicalOperator = or("||", "&&");
        def("LogicalExpression").bases("Expression").build("operator", "left", "right").field("operator", LogicalOperator).field("left", def("Expression")).field("right", def("Expression")), 
        def("ConditionalExpression").bases("Expression").build("test", "consequent", "alternate").field("test", def("Expression")).field("consequent", def("Expression")).field("alternate", def("Expression")), 
        def("NewExpression").bases("Expression").build("callee", "arguments").field("callee", def("Expression")).field("arguments", [ def("Expression") ]), 
        def("CallExpression").bases("Expression").build("callee", "arguments").field("callee", def("Expression")).field("arguments", [ def("Expression") ]), 
        def("MemberExpression").bases("Expression").build("object", "property", "computed").field("object", def("Expression")).field("property", or(def("Identifier"), def("Expression"))).field("computed", Boolean, function() {
            var type = this.property.type;
            return "Literal" === type || "MemberExpression" === type || "BinaryExpression" === type;
        }), def("Pattern").bases("Node"), def("SwitchCase").bases("Node").build("test", "consequent").field("test", or(def("Expression"), null)).field("consequent", [ def("Statement") ]), 
        def("Identifier").bases("Node", "Expression", "Pattern").build("name").field("name", String), 
        def("Literal").bases("Node", "Expression").build("value").field("value", or(String, Boolean, null, Number, RegExp)).field("regex", or({
            pattern: String,
            flags: String
        }, null), function() {
            if (this.value instanceof RegExp) {
                var flags = "";
                return this.value.ignoreCase && (flags += "i"), this.value.multiline && (flags += "m"), 
                this.value.global && (flags += "g"), {
                    pattern: this.value.source,
                    flags: flags
                };
            }
            return null;
        }), def("Comment").bases("Printable").field("value", String).field("leading", Boolean, defaults.true).field("trailing", Boolean, defaults.false);
    };
}, /*!******************************************!*\
  !*** ./~/recast/~/ast-types/def/core.js ***!
  \******************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 1)), Type = types.Type, def = Type.def, or = Type.or, shared = fork.use(__webpack_require__(/*! ../lib/shared */ 4)), defaults = shared.defaults, geq = shared.geq;
        def("Printable").field("loc", or(def("SourceLocation"), null), defaults.null, !0), 
        def("Node").bases("Printable").field("type", String).field("comments", or([ def("Comment") ], null), defaults.null, !0), 
        def("SourceLocation").build("start", "end", "source").field("start", def("Position")).field("end", def("Position")).field("source", or(String, null), defaults.null), 
        def("Position").build("line", "column").field("line", geq(1)).field("column", geq(0)), 
        def("File").bases("Node").build("program").field("program", def("Program")), def("Program").bases("Node").build("body").field("body", [ def("Statement") ]), 
        def("Function").bases("Node").field("id", or(def("Identifier"), null), defaults.null).field("params", [ def("Pattern") ]).field("body", def("BlockStatement")), 
        def("Statement").bases("Node"), def("EmptyStatement").bases("Statement").build(), 
        def("BlockStatement").bases("Statement").build("body").field("body", [ def("Statement") ]), 
        def("ExpressionStatement").bases("Statement").build("expression").field("expression", def("Expression")), 
        def("IfStatement").bases("Statement").build("test", "consequent", "alternate").field("test", def("Expression")).field("consequent", def("Statement")).field("alternate", or(def("Statement"), null), defaults.null), 
        def("LabeledStatement").bases("Statement").build("label", "body").field("label", def("Identifier")).field("body", def("Statement")), 
        def("BreakStatement").bases("Statement").build("label").field("label", or(def("Identifier"), null), defaults.null), 
        def("ContinueStatement").bases("Statement").build("label").field("label", or(def("Identifier"), null), defaults.null), 
        def("WithStatement").bases("Statement").build("object", "body").field("object", def("Expression")).field("body", def("Statement")), 
        def("SwitchStatement").bases("Statement").build("discriminant", "cases", "lexical").field("discriminant", def("Expression")).field("cases", [ def("SwitchCase") ]).field("lexical", Boolean, defaults.false), 
        def("ReturnStatement").bases("Statement").build("argument").field("argument", or(def("Expression"), null)), 
        def("ThrowStatement").bases("Statement").build("argument").field("argument", def("Expression")), 
        def("TryStatement").bases("Statement").build("block", "handler", "finalizer").field("block", def("BlockStatement")).field("handler", or(def("CatchClause"), null), function() {
            return this.handlers && this.handlers[0] || null;
        }).field("handlers", [ def("CatchClause") ], function() {
            return this.handler ? [ this.handler ] : [];
        }, !0).field("guardedHandlers", [ def("CatchClause") ], defaults.emptyArray).field("finalizer", or(def("BlockStatement"), null), defaults.null), 
        def("CatchClause").bases("Node").build("param", "guard", "body").field("param", def("Pattern")).field("guard", or(def("Expression"), null), defaults.null).field("body", def("BlockStatement")), 
        def("WhileStatement").bases("Statement").build("test", "body").field("test", def("Expression")).field("body", def("Statement")), 
        def("DoWhileStatement").bases("Statement").build("body", "test").field("body", def("Statement")).field("test", def("Expression")), 
        def("ForStatement").bases("Statement").build("init", "test", "update", "body").field("init", or(def("VariableDeclaration"), def("Expression"), null)).field("test", or(def("Expression"), null)).field("update", or(def("Expression"), null)).field("body", def("Statement")), 
        def("ForInStatement").bases("Statement").build("left", "right", "body").field("left", or(def("VariableDeclaration"), def("Expression"))).field("right", def("Expression")).field("body", def("Statement")), 
        def("DebuggerStatement").bases("Statement").build(), def("Declaration").bases("Statement"), 
        def("FunctionDeclaration").bases("Function", "Declaration").build("id", "params", "body").field("id", def("Identifier")), 
        def("FunctionExpression").bases("Function", "Expression").build("id", "params", "body"), 
        def("VariableDeclaration").bases("Declaration").build("kind", "declarations").field("kind", or("var", "let", "const")).field("declarations", [ def("VariableDeclarator") ]), 
        def("VariableDeclarator").bases("Node").build("id", "init").field("id", def("Pattern")).field("init", or(def("Expression"), null)), 
        def("Expression").bases("Node", "Pattern"), def("ThisExpression").bases("Expression").build(), 
        def("ArrayExpression").bases("Expression").build("elements").field("elements", [ or(def("Expression"), null) ]), 
        def("ObjectExpression").bases("Expression").build("properties").field("properties", [ def("Property") ]), 
        def("Property").bases("Node").build("kind", "key", "value").field("kind", or("init", "get", "set")).field("key", or(def("Literal"), def("Identifier"))).field("value", def("Expression")), 
        def("SequenceExpression").bases("Expression").build("expressions").field("expressions", [ def("Expression") ]);
        var UnaryOperator = or("-", "+", "!", "~", "typeof", "void", "delete");
        def("UnaryExpression").bases("Expression").build("operator", "argument", "prefix").field("operator", UnaryOperator).field("argument", def("Expression")).field("prefix", Boolean, defaults.true);
        var BinaryOperator = or("==", "!=", "===", "!==", "<", "<=", ">", ">=", "<<", ">>", ">>>", "+", "-", "*", "/", "%", "&", "|", "^", "in", "instanceof", "..");
        def("BinaryExpression").bases("Expression").build("operator", "left", "right").field("operator", BinaryOperator).field("left", def("Expression")).field("right", def("Expression"));
        var AssignmentOperator = or("=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&=");
        def("AssignmentExpression").bases("Expression").build("operator", "left", "right").field("operator", AssignmentOperator).field("left", def("Pattern")).field("right", def("Expression"));
        var UpdateOperator = or("++", "--");
        def("UpdateExpression").bases("Expression").build("operator", "argument", "prefix").field("operator", UpdateOperator).field("argument", def("Expression")).field("prefix", Boolean);
        var LogicalOperator = or("||", "&&");
        def("LogicalExpression").bases("Expression").build("operator", "left", "right").field("operator", LogicalOperator).field("left", def("Expression")).field("right", def("Expression")), 
        def("ConditionalExpression").bases("Expression").build("test", "consequent", "alternate").field("test", def("Expression")).field("consequent", def("Expression")).field("alternate", def("Expression")), 
        def("NewExpression").bases("Expression").build("callee", "arguments").field("callee", def("Expression")).field("arguments", [ def("Expression") ]), 
        def("CallExpression").bases("Expression").build("callee", "arguments").field("callee", def("Expression")).field("arguments", [ def("Expression") ]), 
        def("MemberExpression").bases("Expression").build("object", "property", "computed").field("object", def("Expression")).field("property", or(def("Identifier"), def("Expression"))).field("computed", Boolean, function() {
            var type = this.property.type;
            return "Literal" === type || "MemberExpression" === type || "BinaryExpression" === type;
        }), def("Pattern").bases("Node"), def("SwitchCase").bases("Node").build("test", "consequent").field("test", or(def("Expression"), null)).field("consequent", [ def("Statement") ]), 
        def("Identifier").bases("Node", "Expression", "Pattern").build("name").field("name", String), 
        def("Literal").bases("Node", "Expression").build("value").field("value", or(String, Boolean, null, Number, RegExp)).field("regex", or({
            pattern: String,
            flags: String
        }, null), function() {
            if (this.value instanceof RegExp) {
                var flags = "";
                return this.value.ignoreCase && (flags += "i"), this.value.multiline && (flags += "m"), 
                this.value.global && (flags += "g"), {
                    pattern: this.value.source,
                    flags: flags
                };
            }
            return null;
        }), def("Comment").bases("Printable").field("value", String).field("leading", Boolean, defaults.true).field("trailing", Boolean, defaults.false);
    };
}, /*!**************************************!*\
  !*** ./~/ast-types/lib/node-path.js ***!
  \**************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        function NodePath(value, parentPath, name) {
            if (!(this instanceof NodePath)) throw new Error("NodePath constructor cannot be invoked without 'new'");
            Path.call(this, value, parentPath, name);
        }
        function isBinary(node) {
            return n.BinaryExpression.check(node) || n.LogicalExpression.check(node);
        }
        function containsCallExpression(node) {
            return !!n.CallExpression.check(node) || (isArray.check(node) ? node.some(containsCallExpression) : !!n.Node.check(node) && types.someField(node, function(name, child) {
                return containsCallExpression(child);
            }));
        }
        function firstInStatement(path) {
            for (var node, parent; path.parent; path = path.parent) {
                if (node = path.node, parent = path.parent.node, n.BlockStatement.check(parent) && "body" === path.parent.name && 0 === path.name) {
                    if (parent.body[0] !== node) throw new Error("Nodes must be equal");
                    return !0;
                }
                if (n.ExpressionStatement.check(parent) && "expression" === path.name) {
                    if (parent.expression !== node) throw new Error("Nodes must be equal");
                    return !0;
                }
                if (n.SequenceExpression.check(parent) && "expressions" === path.parent.name && 0 === path.name) {
                    if (parent.expressions[0] !== node) throw new Error("Nodes must be equal");
                } else if (n.CallExpression.check(parent) && "callee" === path.name) {
                    if (parent.callee !== node) throw new Error("Nodes must be equal");
                } else if (n.MemberExpression.check(parent) && "object" === path.name) {
                    if (parent.object !== node) throw new Error("Nodes must be equal");
                } else if (n.ConditionalExpression.check(parent) && "test" === path.name) {
                    if (parent.test !== node) throw new Error("Nodes must be equal");
                } else if (isBinary(parent) && "left" === path.name) {
                    if (parent.left !== node) throw new Error("Nodes must be equal");
                } else {
                    if (!n.UnaryExpression.check(parent) || parent.prefix || "argument" !== path.name) return !1;
                    if (parent.argument !== node) throw new Error("Nodes must be equal");
                }
            }
            return !0;
        }
        function cleanUpNodesAfterPrune(remainingNodePath) {
            if (n.VariableDeclaration.check(remainingNodePath.node)) {
                var declarations = remainingNodePath.get("declarations").value;
                if (!declarations || 0 === declarations.length) return remainingNodePath.prune();
            } else if (n.ExpressionStatement.check(remainingNodePath.node)) {
                if (!remainingNodePath.get("expression").value) return remainingNodePath.prune();
            } else n.IfStatement.check(remainingNodePath.node) && cleanUpIfStatementAfterPrune(remainingNodePath);
            return remainingNodePath;
        }
        function cleanUpIfStatementAfterPrune(ifStatement) {
            var testExpression = ifStatement.get("test").value, alternate = ifStatement.get("alternate").value, consequent = ifStatement.get("consequent").value;
            if (consequent || alternate) {
                if (!consequent && alternate) {
                    var negatedTestExpression = b.unaryExpression("!", testExpression, !0);
                    n.UnaryExpression.check(testExpression) && "!" === testExpression.operator && (negatedTestExpression = testExpression.argument), 
                    ifStatement.get("test").replace(negatedTestExpression), ifStatement.get("consequent").replace(alternate), 
                    ifStatement.get("alternate").replace();
                }
            } else {
                var testExpressionStatement = b.expressionStatement(testExpression);
                ifStatement.replace(testExpressionStatement);
            }
        }
        var types = fork.use(__webpack_require__(/*! ./types */ 0)), n = types.namedTypes, b = types.builders, isNumber = types.builtInTypes.number, isArray = types.builtInTypes.array, Path = fork.use(__webpack_require__(/*! ./path */ 20)), Scope = fork.use(__webpack_require__(/*! ./scope */ 44)), NPp = NodePath.prototype = Object.create(Path.prototype, {
            constructor: {
                value: NodePath,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        });
        Object.defineProperties(NPp, {
            node: {
                get: function() {
                    return Object.defineProperty(this, "node", {
                        configurable: !0,
                        value: this._computeNode()
                    }), this.node;
                }
            },
            parent: {
                get: function() {
                    return Object.defineProperty(this, "parent", {
                        configurable: !0,
                        value: this._computeParent()
                    }), this.parent;
                }
            },
            scope: {
                get: function() {
                    return Object.defineProperty(this, "scope", {
                        configurable: !0,
                        value: this._computeScope()
                    }), this.scope;
                }
            }
        }), NPp.replace = function() {
            return delete this.node, delete this.parent, delete this.scope, Path.prototype.replace.apply(this, arguments);
        }, NPp.prune = function() {
            var remainingNodePath = this.parent;
            return this.replace(), cleanUpNodesAfterPrune(remainingNodePath);
        }, NPp._computeNode = function() {
            var value = this.value;
            if (n.Node.check(value)) return value;
            var pp = this.parentPath;
            return pp && pp.node || null;
        }, NPp._computeParent = function() {
            var value = this.value, pp = this.parentPath;
            if (!n.Node.check(value)) {
                for (;pp && !n.Node.check(pp.value); ) pp = pp.parentPath;
                pp && (pp = pp.parentPath);
            }
            for (;pp && !n.Node.check(pp.value); ) pp = pp.parentPath;
            return pp || null;
        }, NPp._computeScope = function() {
            var value = this.value, pp = this.parentPath, scope = pp && pp.scope;
            return n.Node.check(value) && Scope.isEstablishedBy(value) && (scope = new Scope(this, scope)), 
            scope || null;
        }, NPp.getValueProperty = function(name) {
            return types.getFieldValue(this.value, name);
        }, NPp.needsParens = function(assumeExpressionContext) {
            var pp = this.parentPath;
            if (!pp) return !1;
            var node = this.value;
            if (!n.Expression.check(node)) return !1;
            if ("Identifier" === node.type) return !1;
            for (;!n.Node.check(pp.value); ) if (pp = pp.parentPath, !pp) return !1;
            var parent = pp.value;
            switch (node.type) {
              case "UnaryExpression":
              case "SpreadElement":
              case "SpreadProperty":
                return "MemberExpression" === parent.type && "object" === this.name && parent.object === node;

              case "BinaryExpression":
              case "LogicalExpression":
                switch (parent.type) {
                  case "CallExpression":
                    return "callee" === this.name && parent.callee === node;

                  case "UnaryExpression":
                  case "SpreadElement":
                  case "SpreadProperty":
                    return !0;

                  case "MemberExpression":
                    return "object" === this.name && parent.object === node;

                  case "BinaryExpression":
                  case "LogicalExpression":
                    var po = parent.operator, pp = PRECEDENCE[po], no = node.operator, np = PRECEDENCE[no];
                    if (pp > np) return !0;
                    if (pp === np && "right" === this.name) {
                        if (parent.right !== node) throw new Error("Nodes must be equal");
                        return !0;
                    }

                  default:
                    return !1;
                }

              case "SequenceExpression":
                switch (parent.type) {
                  case "ForStatement":
                    return !1;

                  case "ExpressionStatement":
                    return "expression" !== this.name;

                  default:
                    return !0;
                }

              case "YieldExpression":
                switch (parent.type) {
                  case "BinaryExpression":
                  case "LogicalExpression":
                  case "UnaryExpression":
                  case "SpreadElement":
                  case "SpreadProperty":
                  case "CallExpression":
                  case "MemberExpression":
                  case "NewExpression":
                  case "ConditionalExpression":
                  case "YieldExpression":
                    return !0;

                  default:
                    return !1;
                }

              case "Literal":
                return "MemberExpression" === parent.type && isNumber.check(node.value) && "object" === this.name && parent.object === node;

              case "AssignmentExpression":
              case "ConditionalExpression":
                switch (parent.type) {
                  case "UnaryExpression":
                  case "SpreadElement":
                  case "SpreadProperty":
                  case "BinaryExpression":
                  case "LogicalExpression":
                    return !0;

                  case "CallExpression":
                    return "callee" === this.name && parent.callee === node;

                  case "ConditionalExpression":
                    return "test" === this.name && parent.test === node;

                  case "MemberExpression":
                    return "object" === this.name && parent.object === node;

                  default:
                    return !1;
                }

              default:
                if ("NewExpression" === parent.type && "callee" === this.name && parent.callee === node) return containsCallExpression(node);
            }
            return !(assumeExpressionContext === !0 || this.canBeFirstInStatement() || !this.firstInStatement());
        };
        var PRECEDENCE = {};
        return [ [ "||" ], [ "&&" ], [ "|" ], [ "^" ], [ "&" ], [ "==", "===", "!=", "!==" ], [ "<", ">", "<=", ">=", "in", "instanceof" ], [ ">>", "<<", ">>>" ], [ "+", "-" ], [ "*", "/", "%" ] ].forEach(function(tier, i) {
            tier.forEach(function(op) {
                PRECEDENCE[op] = i;
            });
        }), NPp.canBeFirstInStatement = function() {
            var node = this.node;
            return !n.FunctionExpression.check(node) && !n.ObjectExpression.check(node);
        }, NPp.firstInStatement = function() {
            return firstInStatement(this);
        }, NodePath;
    };
}, /*!*********************************!*\
  !*** ./~/recast/lib/options.js ***!
  \*********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    var defaults = {
        parser: __webpack_require__(/*! esprima */ 45),
        tabWidth: 4,
        useTabs: !1,
        reuseWhitespace: !0,
        lineTerminator: __webpack_require__(/*! os */ 47).EOL,
        wrapColumn: 74,
        sourceFileName: null,
        sourceMapName: null,
        sourceRoot: null,
        inputSourceMap: null,
        range: !1,
        tolerant: !0,
        quote: null,
        trailingComma: !1,
        arrayBracketSpacing: !1,
        objectCurlySpacing: !0,
        arrowParensAlways: !1,
        flowObjectCommas: !0
    }, hasOwn = defaults.hasOwnProperty;
    exports.normalize = function(options) {
        function get(key) {
            return hasOwn.call(options, key) ? options[key] : defaults[key];
        }
        return options = options || defaults, {
            tabWidth: +get("tabWidth"),
            useTabs: !!get("useTabs"),
            reuseWhitespace: !!get("reuseWhitespace"),
            lineTerminator: get("lineTerminator"),
            wrapColumn: Math.max(get("wrapColumn"), 0),
            sourceFileName: get("sourceFileName"),
            sourceMapName: get("sourceMapName"),
            sourceRoot: get("sourceRoot"),
            inputSourceMap: get("inputSourceMap"),
            parser: get("esprima") || get("parser"),
            range: get("range"),
            tolerant: get("tolerant"),
            quote: get("quote"),
            trailingComma: get("trailingComma"),
            arrayBracketSpacing: get("arrayBracketSpacing"),
            objectCurlySpacing: get("objectCurlySpacing"),
            arrowParensAlways: get("arrowParensAlways"),
            flowObjectCommas: get("flowObjectCommas")
        };
    };
}, /*!***********************************************!*\
  !*** ./~/recast/~/ast-types/lib/node-path.js ***!
  \***********************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        function NodePath(value, parentPath, name) {
            if (!(this instanceof NodePath)) throw new Error("NodePath constructor cannot be invoked without 'new'");
            Path.call(this, value, parentPath, name);
        }
        function isBinary(node) {
            return n.BinaryExpression.check(node) || n.LogicalExpression.check(node);
        }
        function containsCallExpression(node) {
            return !!n.CallExpression.check(node) || (isArray.check(node) ? node.some(containsCallExpression) : !!n.Node.check(node) && types.someField(node, function(name, child) {
                return containsCallExpression(child);
            }));
        }
        function firstInStatement(path) {
            for (var node, parent; path.parent; path = path.parent) {
                if (node = path.node, parent = path.parent.node, n.BlockStatement.check(parent) && "body" === path.parent.name && 0 === path.name) {
                    if (parent.body[0] !== node) throw new Error("Nodes must be equal");
                    return !0;
                }
                if (n.ExpressionStatement.check(parent) && "expression" === path.name) {
                    if (parent.expression !== node) throw new Error("Nodes must be equal");
                    return !0;
                }
                if (n.SequenceExpression.check(parent) && "expressions" === path.parent.name && 0 === path.name) {
                    if (parent.expressions[0] !== node) throw new Error("Nodes must be equal");
                } else if (n.CallExpression.check(parent) && "callee" === path.name) {
                    if (parent.callee !== node) throw new Error("Nodes must be equal");
                } else if (n.MemberExpression.check(parent) && "object" === path.name) {
                    if (parent.object !== node) throw new Error("Nodes must be equal");
                } else if (n.ConditionalExpression.check(parent) && "test" === path.name) {
                    if (parent.test !== node) throw new Error("Nodes must be equal");
                } else if (isBinary(parent) && "left" === path.name) {
                    if (parent.left !== node) throw new Error("Nodes must be equal");
                } else {
                    if (!n.UnaryExpression.check(parent) || parent.prefix || "argument" !== path.name) return !1;
                    if (parent.argument !== node) throw new Error("Nodes must be equal");
                }
            }
            return !0;
        }
        function cleanUpNodesAfterPrune(remainingNodePath) {
            if (n.VariableDeclaration.check(remainingNodePath.node)) {
                var declarations = remainingNodePath.get("declarations").value;
                if (!declarations || 0 === declarations.length) return remainingNodePath.prune();
            } else if (n.ExpressionStatement.check(remainingNodePath.node)) {
                if (!remainingNodePath.get("expression").value) return remainingNodePath.prune();
            } else n.IfStatement.check(remainingNodePath.node) && cleanUpIfStatementAfterPrune(remainingNodePath);
            return remainingNodePath;
        }
        function cleanUpIfStatementAfterPrune(ifStatement) {
            var testExpression = ifStatement.get("test").value, alternate = ifStatement.get("alternate").value, consequent = ifStatement.get("consequent").value;
            if (consequent || alternate) {
                if (!consequent && alternate) {
                    var negatedTestExpression = b.unaryExpression("!", testExpression, !0);
                    n.UnaryExpression.check(testExpression) && "!" === testExpression.operator && (negatedTestExpression = testExpression.argument), 
                    ifStatement.get("test").replace(negatedTestExpression), ifStatement.get("consequent").replace(alternate), 
                    ifStatement.get("alternate").replace();
                }
            } else {
                var testExpressionStatement = b.expressionStatement(testExpression);
                ifStatement.replace(testExpressionStatement);
            }
        }
        var types = fork.use(__webpack_require__(/*! ./types */ 1)), n = types.namedTypes, b = types.builders, isNumber = types.builtInTypes.number, isArray = types.builtInTypes.array, Path = fork.use(__webpack_require__(/*! ./path */ 29)), Scope = fork.use(__webpack_require__(/*! ./scope */ 59)), NPp = NodePath.prototype = Object.create(Path.prototype, {
            constructor: {
                value: NodePath,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        });
        Object.defineProperties(NPp, {
            node: {
                get: function() {
                    return Object.defineProperty(this, "node", {
                        configurable: !0,
                        value: this._computeNode()
                    }), this.node;
                }
            },
            parent: {
                get: function() {
                    return Object.defineProperty(this, "parent", {
                        configurable: !0,
                        value: this._computeParent()
                    }), this.parent;
                }
            },
            scope: {
                get: function() {
                    return Object.defineProperty(this, "scope", {
                        configurable: !0,
                        value: this._computeScope()
                    }), this.scope;
                }
            }
        }), NPp.replace = function() {
            return delete this.node, delete this.parent, delete this.scope, Path.prototype.replace.apply(this, arguments);
        }, NPp.prune = function() {
            var remainingNodePath = this.parent;
            return this.replace(), cleanUpNodesAfterPrune(remainingNodePath);
        }, NPp._computeNode = function() {
            var value = this.value;
            if (n.Node.check(value)) return value;
            var pp = this.parentPath;
            return pp && pp.node || null;
        }, NPp._computeParent = function() {
            var value = this.value, pp = this.parentPath;
            if (!n.Node.check(value)) {
                for (;pp && !n.Node.check(pp.value); ) pp = pp.parentPath;
                pp && (pp = pp.parentPath);
            }
            for (;pp && !n.Node.check(pp.value); ) pp = pp.parentPath;
            return pp || null;
        }, NPp._computeScope = function() {
            var value = this.value, pp = this.parentPath, scope = pp && pp.scope;
            return n.Node.check(value) && Scope.isEstablishedBy(value) && (scope = new Scope(this, scope)), 
            scope || null;
        }, NPp.getValueProperty = function(name) {
            return types.getFieldValue(this.value, name);
        }, NPp.needsParens = function(assumeExpressionContext) {
            var pp = this.parentPath;
            if (!pp) return !1;
            var node = this.value;
            if (!n.Expression.check(node)) return !1;
            if ("Identifier" === node.type) return !1;
            for (;!n.Node.check(pp.value); ) if (pp = pp.parentPath, !pp) return !1;
            var parent = pp.value;
            switch (node.type) {
              case "UnaryExpression":
              case "SpreadElement":
              case "SpreadProperty":
                return "MemberExpression" === parent.type && "object" === this.name && parent.object === node;

              case "BinaryExpression":
              case "LogicalExpression":
                switch (parent.type) {
                  case "CallExpression":
                    return "callee" === this.name && parent.callee === node;

                  case "UnaryExpression":
                  case "SpreadElement":
                  case "SpreadProperty":
                    return !0;

                  case "MemberExpression":
                    return "object" === this.name && parent.object === node;

                  case "BinaryExpression":
                  case "LogicalExpression":
                    var po = parent.operator, pp = PRECEDENCE[po], no = node.operator, np = PRECEDENCE[no];
                    if (pp > np) return !0;
                    if (pp === np && "right" === this.name) {
                        if (parent.right !== node) throw new Error("Nodes must be equal");
                        return !0;
                    }

                  default:
                    return !1;
                }

              case "SequenceExpression":
                switch (parent.type) {
                  case "ForStatement":
                    return !1;

                  case "ExpressionStatement":
                    return "expression" !== this.name;

                  default:
                    return !0;
                }

              case "YieldExpression":
                switch (parent.type) {
                  case "BinaryExpression":
                  case "LogicalExpression":
                  case "UnaryExpression":
                  case "SpreadElement":
                  case "SpreadProperty":
                  case "CallExpression":
                  case "MemberExpression":
                  case "NewExpression":
                  case "ConditionalExpression":
                  case "YieldExpression":
                    return !0;

                  default:
                    return !1;
                }

              case "Literal":
                return "MemberExpression" === parent.type && isNumber.check(node.value) && "object" === this.name && parent.object === node;

              case "AssignmentExpression":
              case "ConditionalExpression":
                switch (parent.type) {
                  case "UnaryExpression":
                  case "SpreadElement":
                  case "SpreadProperty":
                  case "BinaryExpression":
                  case "LogicalExpression":
                    return !0;

                  case "CallExpression":
                    return "callee" === this.name && parent.callee === node;

                  case "ConditionalExpression":
                    return "test" === this.name && parent.test === node;

                  case "MemberExpression":
                    return "object" === this.name && parent.object === node;

                  default:
                    return !1;
                }

              default:
                if ("NewExpression" === parent.type && "callee" === this.name && parent.callee === node) return containsCallExpression(node);
            }
            return !(assumeExpressionContext === !0 || this.canBeFirstInStatement() || !this.firstInStatement());
        };
        var PRECEDENCE = {};
        return [ [ "||" ], [ "&&" ], [ "|" ], [ "^" ], [ "&" ], [ "==", "===", "!=", "!==" ], [ "<", ">", "<=", ">=", "in", "instanceof" ], [ ">>", "<<", ">>>" ], [ "+", "-" ], [ "*", "/", "%" ] ].forEach(function(tier, i) {
            tier.forEach(function(op) {
                PRECEDENCE[op] = i;
            });
        }), NPp.canBeFirstInStatement = function() {
            var node = this.node;
            return !n.FunctionExpression.check(node) && !n.ObjectExpression.check(node);
        }, NPp.firstInStatement = function() {
            return firstInStatement(this);
        }, NodePath;
    };
}, /*!************************************!*\
  !*** ./~/source-map/source-map.js ***!
  \************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    exports.SourceMapGenerator = __webpack_require__(/*! ./lib/source-map-generator */ 32).SourceMapGenerator, 
    exports.SourceMapConsumer = __webpack_require__(/*! ./lib/source-map-consumer */ 65).SourceMapConsumer, 
    exports.SourceNode = __webpack_require__(/*! ./lib/source-node */ 66).SourceNode;
}, /*!**********************************!*\
  !*** ./~/ast-types/def/babel.js ***!
  \**********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./es7 */ 7));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 0)), defaults = fork.use(__webpack_require__(/*! ../lib/shared */ 2)).defaults, def = types.Type.def, or = types.Type.or;
        def("Noop").bases("Node").build(), def("DoExpression").bases("Expression").build("body").field("body", [ def("Statement") ]), 
        def("Super").bases("Expression").build(), def("BindExpression").bases("Expression").build("object", "callee").field("object", or(def("Expression"), null)).field("callee", def("Expression")), 
        def("Decorator").bases("Node").build("expression").field("expression", def("Expression")), 
        def("Property").field("decorators", or([ def("Decorator") ], null), defaults.null), 
        def("MethodDefinition").field("decorators", or([ def("Decorator") ], null), defaults.null), 
        def("MetaProperty").bases("Expression").build("meta", "property").field("meta", def("Identifier")).field("property", def("Identifier")), 
        def("ParenthesizedExpression").bases("Expression").build("expression").field("expression", def("Expression")), 
        def("ImportSpecifier").bases("ModuleSpecifier").build("imported", "local").field("imported", def("Identifier")), 
        def("ImportDefaultSpecifier").bases("ModuleSpecifier").build("local"), def("ImportNamespaceSpecifier").bases("ModuleSpecifier").build("local"), 
        def("ExportDefaultDeclaration").bases("Declaration").build("declaration").field("declaration", or(def("Declaration"), def("Expression"))), 
        def("ExportNamedDeclaration").bases("Declaration").build("declaration", "specifiers", "source").field("declaration", or(def("Declaration"), null)).field("specifiers", [ def("ExportSpecifier") ], defaults.emptyArray).field("source", or(def("Literal"), null), defaults.null), 
        def("ExportSpecifier").bases("ModuleSpecifier").build("local", "exported").field("exported", def("Identifier")), 
        def("ExportNamespaceSpecifier").bases("Specifier").build("exported").field("exported", def("Identifier")), 
        def("ExportDefaultSpecifier").bases("Specifier").build("exported").field("exported", def("Identifier")), 
        def("ExportAllDeclaration").bases("Declaration").build("exported", "source").field("exported", or(def("Identifier"), null)).field("source", def("Literal")), 
        def("CommentBlock").bases("Comment").build("value", "leading", "trailing"), def("CommentLine").bases("Comment").build("value", "leading", "trailing");
    };
}, /*!********************************!*\
  !*** ./~/ast-types/def/es6.js ***!
  \********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./core */ 11));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 0)), def = types.Type.def, or = types.Type.or, defaults = fork.use(__webpack_require__(/*! ../lib/shared */ 2)).defaults;
        def("Function").field("generator", Boolean, defaults.false).field("expression", Boolean, defaults.false).field("defaults", [ or(def("Expression"), null) ], defaults.emptyArray).field("rest", or(def("Identifier"), null), defaults.null), 
        def("RestElement").bases("Pattern").build("argument").field("argument", def("Pattern")), 
        def("SpreadElementPattern").bases("Pattern").build("argument").field("argument", def("Pattern")), 
        def("FunctionDeclaration").build("id", "params", "body", "generator", "expression"), 
        def("FunctionExpression").build("id", "params", "body", "generator", "expression"), 
        def("ArrowFunctionExpression").bases("Function", "Expression").build("params", "body", "expression").field("id", null, defaults.null).field("body", or(def("BlockStatement"), def("Expression"))).field("generator", !1, defaults.false), 
        def("YieldExpression").bases("Expression").build("argument", "delegate").field("argument", or(def("Expression"), null)).field("delegate", Boolean, defaults.false), 
        def("GeneratorExpression").bases("Expression").build("body", "blocks", "filter").field("body", def("Expression")).field("blocks", [ def("ComprehensionBlock") ]).field("filter", or(def("Expression"), null)), 
        def("ComprehensionExpression").bases("Expression").build("body", "blocks", "filter").field("body", def("Expression")).field("blocks", [ def("ComprehensionBlock") ]).field("filter", or(def("Expression"), null)), 
        def("ComprehensionBlock").bases("Node").build("left", "right", "each").field("left", def("Pattern")).field("right", def("Expression")).field("each", Boolean), 
        def("Property").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("value", or(def("Expression"), def("Pattern"))).field("method", Boolean, defaults.false).field("shorthand", Boolean, defaults.false).field("computed", Boolean, defaults.false), 
        def("PropertyPattern").bases("Pattern").build("key", "pattern").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("pattern", def("Pattern")).field("computed", Boolean, defaults.false), 
        def("ObjectPattern").bases("Pattern").build("properties").field("properties", [ or(def("PropertyPattern"), def("Property")) ]), 
        def("ArrayPattern").bases("Pattern").build("elements").field("elements", [ or(def("Pattern"), null) ]), 
        def("MethodDefinition").bases("Declaration").build("kind", "key", "value", "static").field("kind", or("constructor", "method", "get", "set")).field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("value", def("Function")).field("computed", Boolean, defaults.false).field("static", Boolean, defaults.false), 
        def("SpreadElement").bases("Node").build("argument").field("argument", def("Expression")), 
        def("ArrayExpression").field("elements", [ or(def("Expression"), def("SpreadElement"), def("RestElement"), null) ]), 
        def("NewExpression").field("arguments", [ or(def("Expression"), def("SpreadElement")) ]), 
        def("CallExpression").field("arguments", [ or(def("Expression"), def("SpreadElement")) ]), 
        def("AssignmentPattern").bases("Pattern").build("left", "right").field("left", def("Pattern")).field("right", def("Expression"));
        var ClassBodyElement = or(def("MethodDefinition"), def("VariableDeclarator"), def("ClassPropertyDefinition"), def("ClassProperty"));
        def("ClassProperty").bases("Declaration").build("key").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("computed", Boolean, defaults.false), 
        def("ClassPropertyDefinition").bases("Declaration").build("definition").field("definition", ClassBodyElement), 
        def("ClassBody").bases("Declaration").build("body").field("body", [ ClassBodyElement ]), 
        def("ClassDeclaration").bases("Declaration").build("id", "body", "superClass").field("id", or(def("Identifier"), null)).field("body", def("ClassBody")).field("superClass", or(def("Expression"), null), defaults.null), 
        def("ClassExpression").bases("Expression").build("id", "body", "superClass").field("id", or(def("Identifier"), null), defaults.null).field("body", def("ClassBody")).field("superClass", or(def("Expression"), null), defaults.null).field("implements", [ def("ClassImplements") ], defaults.emptyArray), 
        def("ClassImplements").bases("Node").build("id").field("id", def("Identifier")).field("superClass", or(def("Expression"), null), defaults.null), 
        def("Specifier").bases("Node"), def("ModuleSpecifier").bases("Specifier").field("local", or(def("Identifier"), null), defaults.null).field("id", or(def("Identifier"), null), defaults.null).field("name", or(def("Identifier"), null), defaults.null), 
        def("TaggedTemplateExpression").bases("Expression").build("tag", "quasi").field("tag", def("Expression")).field("quasi", def("TemplateLiteral")), 
        def("TemplateLiteral").bases("Expression").build("quasis", "expressions").field("quasis", [ def("TemplateElement") ]).field("expressions", [ def("Expression") ]), 
        def("TemplateElement").bases("Node").build("value", "tail").field("value", {
            cooked: String,
            raw: String
        }).field("tail", Boolean);
    };
}, /*!*********************************!*\
  !*** ./~/ast-types/def/flow.js ***!
  \*********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./es7 */ 7));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 0)), def = types.Type.def, or = types.Type.or, defaults = fork.use(__webpack_require__(/*! ../lib/shared */ 2)).defaults;
        def("Type").bases("Node"), def("AnyTypeAnnotation").bases("Type").build(), def("EmptyTypeAnnotation").bases("Type").build(), 
        def("MixedTypeAnnotation").bases("Type").build(), def("VoidTypeAnnotation").bases("Type").build(), 
        def("NumberTypeAnnotation").bases("Type").build(), def("NumberLiteralTypeAnnotation").bases("Type").build("value", "raw").field("value", Number).field("raw", String), 
        def("StringTypeAnnotation").bases("Type").build(), def("StringLiteralTypeAnnotation").bases("Type").build("value", "raw").field("value", String).field("raw", String), 
        def("BooleanTypeAnnotation").bases("Type").build(), def("BooleanLiteralTypeAnnotation").bases("Type").build("value", "raw").field("value", Boolean).field("raw", String), 
        def("TypeAnnotation").bases("Node").build("typeAnnotation").field("typeAnnotation", def("Type")), 
        def("NullableTypeAnnotation").bases("Type").build("typeAnnotation").field("typeAnnotation", def("Type")), 
        def("NullLiteralTypeAnnotation").bases("Type").build(), def("NullTypeAnnotation").bases("Type").build(), 
        def("ThisTypeAnnotation").bases("Type").build(), def("ExistsTypeAnnotation").bases("Type").build(), 
        def("ExistentialTypeParam").bases("Type").build(), def("FunctionTypeAnnotation").bases("Type").build("params", "returnType", "rest", "typeParameters").field("params", [ def("FunctionTypeParam") ]).field("returnType", def("Type")).field("rest", or(def("FunctionTypeParam"), null)).field("typeParameters", or(def("TypeParameterDeclaration"), null)), 
        def("FunctionTypeParam").bases("Node").build("name", "typeAnnotation", "optional").field("name", def("Identifier")).field("typeAnnotation", def("Type")).field("optional", Boolean), 
        def("ArrayTypeAnnotation").bases("Type").build("elementType").field("elementType", def("Type")), 
        def("ObjectTypeAnnotation").bases("Type").build("properties", "indexers", "callProperties").field("properties", [ def("ObjectTypeProperty") ]).field("indexers", [ def("ObjectTypeIndexer") ], defaults.emptyArray).field("callProperties", [ def("ObjectTypeCallProperty") ], defaults.emptyArray).field("exact", Boolean, defaults.false), 
        def("ObjectTypeProperty").bases("Node").build("key", "value", "optional").field("key", or(def("Literal"), def("Identifier"))).field("value", def("Type")).field("optional", Boolean).field("variance", or("plus", "minus", null), defaults.null), 
        def("ObjectTypeIndexer").bases("Node").build("id", "key", "value").field("id", def("Identifier")).field("key", def("Type")).field("value", def("Type")).field("variance", or("plus", "minus", null), defaults.null), 
        def("ObjectTypeCallProperty").bases("Node").build("value").field("value", def("FunctionTypeAnnotation")).field("static", Boolean, defaults.false), 
        def("QualifiedTypeIdentifier").bases("Node").build("qualification", "id").field("qualification", or(def("Identifier"), def("QualifiedTypeIdentifier"))).field("id", def("Identifier")), 
        def("GenericTypeAnnotation").bases("Type").build("id", "typeParameters").field("id", or(def("Identifier"), def("QualifiedTypeIdentifier"))).field("typeParameters", or(def("TypeParameterInstantiation"), null)), 
        def("MemberTypeAnnotation").bases("Type").build("object", "property").field("object", def("Identifier")).field("property", or(def("MemberTypeAnnotation"), def("GenericTypeAnnotation"))), 
        def("UnionTypeAnnotation").bases("Type").build("types").field("types", [ def("Type") ]), 
        def("IntersectionTypeAnnotation").bases("Type").build("types").field("types", [ def("Type") ]), 
        def("TypeofTypeAnnotation").bases("Type").build("argument").field("argument", def("Type")), 
        def("Identifier").field("typeAnnotation", or(def("TypeAnnotation"), null), defaults.null), 
        def("TypeParameterDeclaration").bases("Node").build("params").field("params", [ def("TypeParameter") ]), 
        def("TypeParameterInstantiation").bases("Node").build("params").field("params", [ def("Type") ]), 
        def("TypeParameter").bases("Type").build("name", "variance", "bound").field("name", String).field("variance", or("plus", "minus", null), defaults.null).field("bound", or(def("TypeAnnotation"), null), defaults.null), 
        def("Function").field("returnType", or(def("TypeAnnotation"), null), defaults.null).field("typeParameters", or(def("TypeParameterDeclaration"), null), defaults.null), 
        def("ClassProperty").build("key", "value", "typeAnnotation", "static").field("value", or(def("Expression"), null)).field("typeAnnotation", or(def("TypeAnnotation"), null)).field("static", Boolean, defaults.false).field("variance", or("plus", "minus", null), defaults.null), 
        def("ClassImplements").field("typeParameters", or(def("TypeParameterInstantiation"), null), defaults.null), 
        def("InterfaceDeclaration").bases("Declaration").build("id", "body", "extends").field("id", def("Identifier")).field("typeParameters", or(def("TypeParameterDeclaration"), null), defaults.null).field("body", def("ObjectTypeAnnotation")).field("extends", [ def("InterfaceExtends") ]), 
        def("DeclareInterface").bases("InterfaceDeclaration").build("id", "body", "extends"), 
        def("InterfaceExtends").bases("Node").build("id").field("id", def("Identifier")).field("typeParameters", or(def("TypeParameterInstantiation"), null)), 
        def("TypeAlias").bases("Declaration").build("id", "typeParameters", "right").field("id", def("Identifier")).field("typeParameters", or(def("TypeParameterDeclaration"), null)).field("right", def("Type")), 
        def("DeclareTypeAlias").bases("TypeAlias").build("id", "typeParameters", "right"), 
        def("TypeCastExpression").bases("Expression").build("expression", "typeAnnotation").field("expression", def("Expression")).field("typeAnnotation", def("TypeAnnotation")), 
        def("TupleTypeAnnotation").bases("Type").build("types").field("types", [ def("Type") ]), 
        def("DeclareVariable").bases("Statement").build("id").field("id", def("Identifier")), 
        def("DeclareFunction").bases("Statement").build("id").field("id", def("Identifier")), 
        def("DeclareClass").bases("InterfaceDeclaration").build("id"), def("DeclareModule").bases("Statement").build("id", "body").field("id", or(def("Identifier"), def("Literal"))).field("body", def("BlockStatement")), 
        def("DeclareModuleExports").bases("Statement").build("typeAnnotation").field("typeAnnotation", def("Type")), 
        def("DeclareExportDeclaration").bases("Declaration").build("default", "declaration", "specifiers", "source").field("default", Boolean).field("declaration", or(def("DeclareVariable"), def("DeclareFunction"), def("DeclareClass"), def("Type"), null)).field("specifiers", [ or(def("ExportSpecifier"), def("ExportBatchSpecifier")) ], defaults.emptyArray).field("source", or(def("Literal"), null), defaults.null);
    };
}, /*!*********************************!*\
  !*** ./~/ast-types/lib/path.js ***!
  \*********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    var Ap = Array.prototype, Op = (Ap.slice, Ap.map, Object.prototype), hasOwn = Op.hasOwnProperty;
    module.exports = function(fork) {
        function Path(value, parentPath, name) {
            if (!(this instanceof Path)) throw new Error("Path constructor cannot be invoked without 'new'");
            if (parentPath) {
                if (!(parentPath instanceof Path)) throw new Error("");
            } else parentPath = null, name = null;
            this.value = value, this.parentPath = parentPath, this.name = name, this.__childCache = null;
        }
        function getChildCache(path) {
            return path.__childCache || (path.__childCache = Object.create(null));
        }
        function getChildPath(path, name) {
            var cache = getChildCache(path), actualChildValue = path.getValueProperty(name), childPath = cache[name];
            return hasOwn.call(cache, name) && childPath.value === actualChildValue || (childPath = cache[name] = new path.constructor(actualChildValue, path, name)), 
            childPath;
        }
        function emptyMoves() {}
        function getMoves(path, offset, start, end) {
            if (isArray.assert(path.value), 0 === offset) return emptyMoves;
            var length = path.value.length;
            if (length < 1) return emptyMoves;
            var argc = arguments.length;
            2 === argc ? (start = 0, end = length) : 3 === argc ? (start = Math.max(start, 0), 
            end = length) : (start = Math.max(start, 0), end = Math.min(end, length)), isNumber.assert(start), 
            isNumber.assert(end);
            for (var moves = Object.create(null), cache = getChildCache(path), i = start; i < end; ++i) if (hasOwn.call(path.value, i)) {
                var childPath = path.get(i);
                if (childPath.name !== i) throw new Error("");
                var newIndex = i + offset;
                childPath.name = newIndex, moves[newIndex] = childPath, delete cache[i];
            }
            return delete cache.length, function() {
                for (var newIndex in moves) {
                    var childPath = moves[newIndex];
                    if (childPath.name !== +newIndex) throw new Error("");
                    cache[newIndex] = childPath, path.value[newIndex] = childPath.value;
                }
            };
        }
        function repairRelationshipWithParent(path) {
            if (!(path instanceof Path)) throw new Error("");
            var pp = path.parentPath;
            if (!pp) return path;
            var parentValue = pp.value, parentCache = getChildCache(pp);
            if (parentValue[path.name] === path.value) parentCache[path.name] = path; else if (isArray.check(parentValue)) {
                var i = parentValue.indexOf(path.value);
                i >= 0 && (parentCache[path.name = i] = path);
            } else parentValue[path.name] = path.value, parentCache[path.name] = path;
            if (parentValue[path.name] !== path.value) throw new Error("");
            if (path.parentPath.get(path.name) !== path) throw new Error("");
            return path;
        }
        var types = fork.use(__webpack_require__(/*! ./types */ 0)), isArray = types.builtInTypes.array, isNumber = types.builtInTypes.number, Pp = Path.prototype;
        return Pp.getValueProperty = function(name) {
            return this.value[name];
        }, Pp.get = function(name) {
            for (var path = this, names = arguments, count = names.length, i = 0; i < count; ++i) path = getChildPath(path, names[i]);
            return path;
        }, Pp.each = function(callback, context) {
            for (var childPaths = [], len = this.value.length, i = 0, i = 0; i < len; ++i) hasOwn.call(this.value, i) && (childPaths[i] = this.get(i));
            for (context = context || this, i = 0; i < len; ++i) hasOwn.call(childPaths, i) && callback.call(context, childPaths[i]);
        }, Pp.map = function(callback, context) {
            var result = [];
            return this.each(function(childPath) {
                result.push(callback.call(this, childPath));
            }, context), result;
        }, Pp.filter = function(callback, context) {
            var result = [];
            return this.each(function(childPath) {
                callback.call(this, childPath) && result.push(childPath);
            }, context), result;
        }, Pp.shift = function() {
            var move = getMoves(this, -1), result = this.value.shift();
            return move(), result;
        }, Pp.unshift = function(node) {
            var move = getMoves(this, arguments.length), result = this.value.unshift.apply(this.value, arguments);
            return move(), result;
        }, Pp.push = function(node) {
            return isArray.assert(this.value), delete getChildCache(this).length, this.value.push.apply(this.value, arguments);
        }, Pp.pop = function() {
            isArray.assert(this.value);
            var cache = getChildCache(this);
            return delete cache[this.value.length - 1], delete cache.length, this.value.pop();
        }, Pp.insertAt = function(index, node) {
            var argc = arguments.length, move = getMoves(this, argc - 1, index);
            if (move === emptyMoves) return this;
            index = Math.max(index, 0);
            for (var i = 1; i < argc; ++i) this.value[index + i - 1] = arguments[i];
            return move(), this;
        }, Pp.insertBefore = function(node) {
            for (var pp = this.parentPath, argc = arguments.length, insertAtArgs = [ this.name ], i = 0; i < argc; ++i) insertAtArgs.push(arguments[i]);
            return pp.insertAt.apply(pp, insertAtArgs);
        }, Pp.insertAfter = function(node) {
            for (var pp = this.parentPath, argc = arguments.length, insertAtArgs = [ this.name + 1 ], i = 0; i < argc; ++i) insertAtArgs.push(arguments[i]);
            return pp.insertAt.apply(pp, insertAtArgs);
        }, Pp.replace = function(replacement) {
            var results = [], parentValue = this.parentPath.value, parentCache = getChildCache(this.parentPath), count = arguments.length;
            if (repairRelationshipWithParent(this), isArray.check(parentValue)) {
                for (var originalLength = parentValue.length, move = getMoves(this.parentPath, count - 1, this.name + 1), spliceArgs = [ this.name, 1 ], i = 0; i < count; ++i) spliceArgs.push(arguments[i]);
                var splicedOut = parentValue.splice.apply(parentValue, spliceArgs);
                if (splicedOut[0] !== this.value) throw new Error("");
                if (parentValue.length !== originalLength - 1 + count) throw new Error("");
                if (move(), 0 === count) delete this.value, delete parentCache[this.name], this.__childCache = null; else {
                    if (parentValue[this.name] !== replacement) throw new Error("");
                    for (this.value !== replacement && (this.value = replacement, this.__childCache = null), 
                    i = 0; i < count; ++i) results.push(this.parentPath.get(this.name + i));
                    if (results[0] !== this) throw new Error("");
                }
            } else if (1 === count) this.value !== replacement && (this.__childCache = null), 
            this.value = parentValue[this.name] = replacement, results.push(this); else {
                if (0 !== count) throw new Error("Could not replace path");
                delete parentValue[this.name], delete this.value, this.__childCache = null;
            }
            return results;
        }, Path;
    };
}, /*!******************************!*\
  !*** ./~/private/private.js ***!
  \******************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function defProp(obj, name, value) {
        if (originalDefProp) try {
            originalDefProp.call(originalObject, obj, name, {
                value: value
            });
        } catch (definePropertyIsBrokenInIE8) {
            obj[name] = value;
        } else obj[name] = value;
    }
    function makeSafeToCall(fun) {
        return fun && (defProp(fun, "call", fun.call), defProp(fun, "apply", fun.apply)), 
        fun;
    }
    function create(prototype) {
        return originalCreate ? originalCreate.call(originalObject, prototype) : (cloner.prototype = prototype || null, 
        new cloner());
    }
    function makeUniqueKey() {
        do var uniqueKey = internString(strSlice.call(numToStr.call(rand(), 36), 2)); while (hasOwn.call(uniqueKeys, uniqueKey));
        return uniqueKeys[uniqueKey] = uniqueKey;
    }
    function internString(str) {
        var obj = {};
        return obj[str] = !0, Object.keys(obj)[0];
    }
    function defaultCreatorFn(object) {
        return create(null);
    }
    function makeAccessor(secretCreatorFn) {
        function register(object) {
            function vault(key, forget) {
                if (key === passkey) return forget ? secret = null : secret || (secret = secretCreatorFn(object));
            }
            var secret;
            defProp(object, brand, vault);
        }
        function accessor(object) {
            return hasOwn.call(object, brand) || register(object), object[brand](passkey);
        }
        var brand = makeUniqueKey(), passkey = create(null);
        return secretCreatorFn = secretCreatorFn || defaultCreatorFn, accessor.forget = function(object) {
            hasOwn.call(object, brand) && object[brand](passkey, !0);
        }, accessor;
    }
    var originalObject = Object, originalDefProp = Object.defineProperty, originalCreate = Object.create;
    makeSafeToCall(originalDefProp), makeSafeToCall(originalCreate);
    var hasOwn = makeSafeToCall(Object.prototype.hasOwnProperty), numToStr = makeSafeToCall(Number.prototype.toString), strSlice = makeSafeToCall(String.prototype.slice), cloner = function() {}, rand = Math.random, uniqueKeys = create(null);
    defProp(exports, "makeUniqueKey", makeUniqueKey);
    var originalGetOPNs = Object.getOwnPropertyNames;
    Object.getOwnPropertyNames = function(object) {
        for (var names = originalGetOPNs(object), src = 0, dst = 0, len = names.length; src < len; ++src) hasOwn.call(uniqueKeys, names[src]) || (src > dst && (names[dst] = names[src]), 
        ++dst);
        return names.length = dst, names;
    }, defProp(exports, "makeAccessor", makeAccessor);
}, /*!******************************!*\
  !*** ./~/process/browser.js ***!
  \******************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function defaultSetTimout() {
        throw new Error("setTimeout has not been defined");
    }
    function defaultClearTimeout() {
        throw new Error("clearTimeout has not been defined");
    }
    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) return setTimeout(fun, 0);
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) return cachedSetTimeout = setTimeout, 
        setTimeout(fun, 0);
        try {
            return cachedSetTimeout(fun, 0);
        } catch (e) {
            try {
                return cachedSetTimeout.call(null, fun, 0);
            } catch (e) {
                return cachedSetTimeout.call(this, fun, 0);
            }
        }
    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) return clearTimeout(marker);
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) return cachedClearTimeout = clearTimeout, 
        clearTimeout(marker);
        try {
            return cachedClearTimeout(marker);
        } catch (e) {
            try {
                return cachedClearTimeout.call(null, marker);
            } catch (e) {
                return cachedClearTimeout.call(this, marker);
            }
        }
    }
    function cleanUpNextTick() {
        draining && currentQueue && (draining = !1, currentQueue.length ? queue = currentQueue.concat(queue) : queueIndex = -1, 
        queue.length && drainQueue());
    }
    function drainQueue() {
        if (!draining) {
            var timeout = runTimeout(cleanUpNextTick);
            draining = !0;
            for (var len = queue.length; len; ) {
                for (currentQueue = queue, queue = []; ++queueIndex < len; ) currentQueue && currentQueue[queueIndex].run();
                queueIndex = -1, len = queue.length;
            }
            currentQueue = null, draining = !1, runClearTimeout(timeout);
        }
    }
    function Item(fun, array) {
        this.fun = fun, this.array = array;
    }
    function noop() {}
    var cachedSetTimeout, cachedClearTimeout, process = module.exports = {};
    !function() {
        try {
            cachedSetTimeout = "function" == typeof setTimeout ? setTimeout : defaultSetTimout;
        } catch (e) {
            cachedSetTimeout = defaultSetTimout;
        }
        try {
            cachedClearTimeout = "function" == typeof clearTimeout ? clearTimeout : defaultClearTimeout;
        } catch (e) {
            cachedClearTimeout = defaultClearTimeout;
        }
    }();
    var currentQueue, queue = [], draining = !1, queueIndex = -1;
    process.nextTick = function(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) for (var i = 1; i < arguments.length; i++) args[i - 1] = arguments[i];
        queue.push(new Item(fun, args)), 1 !== queue.length || draining || runTimeout(drainQueue);
    }, Item.prototype.run = function() {
        this.fun.apply(null, this.array);
    }, process.title = "browser", process.browser = !0, process.env = {}, process.argv = [], 
    process.version = "", process.versions = {}, process.on = noop, process.addListener = noop, 
    process.once = noop, process.off = noop, process.removeListener = noop, process.removeAllListeners = noop, 
    process.emit = noop, process.binding = function(name) {
        throw new Error("process.binding is not supported");
    }, process.cwd = function() {
        return "/";
    }, process.chdir = function(dir) {
        throw new Error("process.chdir is not supported");
    }, process.umask = function() {
        return 0;
    };
}, /*!**********************************!*\
  !*** ./~/recast/lib/comments.js ***!
  \**********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function getSortedChildNodes(node, lines, resultArray) {
        if (node) {
            if (util.fixFaultyLocations(node, lines), resultArray) {
                if (n.Node.check(node) && n.SourceLocation.check(node.loc)) {
                    for (var i = resultArray.length - 1; i >= 0 && !(comparePos(resultArray[i].loc.end, node.loc.start) <= 0); --i) ;
                    return void resultArray.splice(i + 1, 0, node);
                }
            } else if (node[childNodesCacheKey]) return node[childNodesCacheKey];
            var names;
            if (isArray.check(node)) names = Object.keys(node); else {
                if (!isObject.check(node)) return;
                names = types.getFieldNames(node);
            }
            resultArray || Object.defineProperty(node, childNodesCacheKey, {
                value: resultArray = [],
                enumerable: !1
            });
            for (var i = 0, nameCount = names.length; i < nameCount; ++i) getSortedChildNodes(node[names[i]], lines, resultArray);
            return resultArray;
        }
    }
    function decorateComment(node, comment, lines) {
        for (var childNodes = getSortedChildNodes(node, lines), left = 0, right = childNodes.length; left < right; ) {
            var middle = left + right >> 1, child = childNodes[middle];
            if (comparePos(child.loc.start, comment.loc.start) <= 0 && comparePos(comment.loc.end, child.loc.end) <= 0) return void decorateComment(comment.enclosingNode = child, comment, lines);
            if (comparePos(child.loc.end, comment.loc.start) <= 0) {
                var precedingNode = child;
                left = middle + 1;
            } else {
                if (!(comparePos(comment.loc.end, child.loc.start) <= 0)) throw new Error("Comment location overlaps with node location");
                var followingNode = child;
                right = middle;
            }
        }
        precedingNode && (comment.precedingNode = precedingNode), followingNode && (comment.followingNode = followingNode);
    }
    function breakTies(tiesToBreak, lines) {
        var tieCount = tiesToBreak.length;
        if (0 !== tieCount) {
            for (var pn = tiesToBreak[0].precedingNode, fn = tiesToBreak[0].followingNode, gapEndPos = fn.loc.start, indexOfFirstLeadingComment = tieCount; indexOfFirstLeadingComment > 0; --indexOfFirstLeadingComment) {
                var comment = tiesToBreak[indexOfFirstLeadingComment - 1];
                assert.strictEqual(comment.precedingNode, pn), assert.strictEqual(comment.followingNode, fn);
                var gap = lines.sliceString(comment.loc.end, gapEndPos);
                if (/\S/.test(gap)) break;
                gapEndPos = comment.loc.start;
            }
            for (;indexOfFirstLeadingComment <= tieCount && (comment = tiesToBreak[indexOfFirstLeadingComment]) && ("Line" === comment.type || "CommentLine" === comment.type) && comment.loc.start.column > fn.loc.start.column; ) ++indexOfFirstLeadingComment;
            tiesToBreak.forEach(function(comment, i) {
                i < indexOfFirstLeadingComment ? addTrailingComment(pn, comment) : addLeadingComment(fn, comment);
            }), tiesToBreak.length = 0;
        }
    }
    function addCommentHelper(node, comment) {
        var comments = node.comments || (node.comments = []);
        comments.push(comment);
    }
    function addLeadingComment(node, comment) {
        comment.leading = !0, comment.trailing = !1, addCommentHelper(node, comment);
    }
    function addDanglingComment(node, comment) {
        comment.leading = !1, comment.trailing = !1, addCommentHelper(node, comment);
    }
    function addTrailingComment(node, comment) {
        comment.leading = !1, comment.trailing = !0, addCommentHelper(node, comment);
    }
    function printLeadingComment(commentPath, print) {
        var comment = commentPath.getValue();
        n.Comment.assert(comment);
        var loc = comment.loc, lines = loc && loc.lines, parts = [ print(commentPath) ];
        if (comment.trailing) parts.push("\n"); else if (lines instanceof Lines) {
            var trailingSpace = lines.slice(loc.end, lines.skipSpaces(loc.end));
            1 === trailingSpace.length ? parts.push(trailingSpace) : parts.push(new Array(trailingSpace.length).join("\n"));
        } else parts.push("\n");
        return concat(parts);
    }
    function printTrailingComment(commentPath, print) {
        var comment = commentPath.getValue(commentPath);
        n.Comment.assert(comment);
        var loc = comment.loc, lines = loc && loc.lines, parts = [];
        if (lines instanceof Lines) {
            var fromPos = lines.skipSpaces(loc.start, !0) || lines.firstPos(), leadingSpace = lines.slice(fromPos, loc.start);
            1 === leadingSpace.length ? parts.push(leadingSpace) : parts.push(new Array(leadingSpace.length).join("\n"));
        }
        return parts.push(print(commentPath)), concat(parts);
    }
    var assert = __webpack_require__(/*! assert */ 5), types = __webpack_require__(/*! ./types */ 3), n = types.namedTypes, isArray = types.builtInTypes.array, isObject = types.builtInTypes.object, linesModule = __webpack_require__(/*! ./lines */ 8), Lines = (linesModule.fromString, 
    linesModule.Lines), concat = linesModule.concat, util = __webpack_require__(/*! ./util */ 6), comparePos = util.comparePos, childNodesCacheKey = __webpack_require__(/*! private */ 21).makeUniqueKey();
    exports.attach = function(comments, ast, lines) {
        if (isArray.check(comments)) {
            var tiesToBreak = [];
            comments.forEach(function(comment) {
                comment.loc.lines = lines, decorateComment(ast, comment, lines);
                var pn = comment.precedingNode, en = comment.enclosingNode, fn = comment.followingNode;
                if (pn && fn) {
                    var tieCount = tiesToBreak.length;
                    if (tieCount > 0) {
                        var lastTie = tiesToBreak[tieCount - 1];
                        assert.strictEqual(lastTie.precedingNode === comment.precedingNode, lastTie.followingNode === comment.followingNode), 
                        lastTie.followingNode !== comment.followingNode && breakTies(tiesToBreak, lines);
                    }
                    tiesToBreak.push(comment);
                } else if (pn) breakTies(tiesToBreak, lines), addTrailingComment(pn, comment); else if (fn) breakTies(tiesToBreak, lines), 
                addLeadingComment(fn, comment); else {
                    if (!en) throw new Error("AST contains no nodes at all?");
                    breakTies(tiesToBreak, lines), addDanglingComment(en, comment);
                }
            }), breakTies(tiesToBreak, lines), comments.forEach(function(comment) {
                delete comment.precedingNode, delete comment.enclosingNode, delete comment.followingNode;
            });
        }
    }, exports.printComments = function(path, print) {
        var value = path.getValue(), innerLines = print(path), comments = n.Node.check(value) && types.getFieldValue(value, "comments");
        if (!comments || 0 === comments.length) return innerLines;
        var leadingParts = [], trailingParts = [ innerLines ];
        return path.each(function(commentPath) {
            var comment = commentPath.getValue(), leading = types.getFieldValue(comment, "leading"), trailing = types.getFieldValue(comment, "trailing");
            leading || trailing && !n.Statement.check(value) && "Block" !== comment.type && "CommentBlock" !== comment.type ? leadingParts.push(printLeadingComment(commentPath, print)) : trailing && trailingParts.push(printTrailingComment(commentPath, print));
        }, "comments"), leadingParts.push.apply(leadingParts, trailingParts), concat(leadingParts);
    };
}, /*!***********************************!*\
  !*** ./~/recast/lib/fast-path.js ***!
  \***********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function FastPath(value) {
        assert.ok(this instanceof FastPath), this.stack = [ value ];
    }
    function getNodeHelper(path, count) {
        for (var s = path.stack, i = s.length - 1; i >= 0; i -= 2) {
            var value = s[i];
            if (n.Node.check(value) && --count < 0) return value;
        }
        return null;
    }
    function isBinary(node) {
        return n.BinaryExpression.check(node) || n.LogicalExpression.check(node);
    }
    function containsCallExpression(node) {
        return !!n.CallExpression.check(node) || (isArray.check(node) ? node.some(containsCallExpression) : !!n.Node.check(node) && types.someField(node, function(name, child) {
            return containsCallExpression(child);
        }));
    }
    var assert = __webpack_require__(/*! assert */ 5), types = __webpack_require__(/*! ./types */ 3), n = types.namedTypes, isArray = (n.Node, 
    types.builtInTypes.array), isNumber = types.builtInTypes.number, FPp = FastPath.prototype;
    module.exports = FastPath, FastPath.from = function(obj) {
        if (obj instanceof FastPath) return obj.copy();
        if (obj instanceof types.NodePath) {
            for (var pp, copy = Object.create(FastPath.prototype), stack = [ obj.value ]; pp = obj.parentPath; obj = pp) stack.push(obj.name, pp.value);
            return copy.stack = stack.reverse(), copy;
        }
        return new FastPath(obj);
    }, FPp.copy = function copy() {
        var copy = Object.create(FastPath.prototype);
        return copy.stack = this.stack.slice(0), copy;
    }, FPp.getName = function() {
        var s = this.stack, len = s.length;
        return len > 1 ? s[len - 2] : null;
    }, FPp.getValue = function() {
        var s = this.stack;
        return s[s.length - 1];
    }, FPp.getNode = function(count) {
        return getNodeHelper(this, ~~count);
    }, FPp.getParentNode = function(count) {
        return getNodeHelper(this, ~~count + 1);
    }, FPp.getRootValue = function() {
        var s = this.stack;
        return s.length % 2 === 0 ? s[1] : s[0];
    }, FPp.call = function(callback) {
        for (var s = this.stack, origLen = s.length, value = s[origLen - 1], argc = arguments.length, i = 1; i < argc; ++i) {
            var name = arguments[i];
            value = value[name], s.push(name, value);
        }
        var result = callback(this);
        return s.length = origLen, result;
    }, FPp.each = function(callback) {
        for (var s = this.stack, origLen = s.length, value = s[origLen - 1], argc = arguments.length, i = 1; i < argc; ++i) {
            var name = arguments[i];
            value = value[name], s.push(name, value);
        }
        for (var i = 0; i < value.length; ++i) i in value && (s.push(i, value[i]), callback(this), 
        s.length -= 2);
        s.length = origLen;
    }, FPp.map = function(callback) {
        for (var s = this.stack, origLen = s.length, value = s[origLen - 1], argc = arguments.length, i = 1; i < argc; ++i) {
            var name = arguments[i];
            value = value[name], s.push(name, value);
        }
        for (var result = new Array(value.length), i = 0; i < value.length; ++i) i in value && (s.push(i, value[i]), 
        result[i] = callback(this, i), s.length -= 2);
        return s.length = origLen, result;
    }, FPp.needsParens = function(assumeExpressionContext) {
        var parent = this.getParentNode();
        if (!parent) return !1;
        var name = this.getName(), node = this.getNode();
        if (this.getValue() !== node) return !1;
        if (n.Statement.check(node)) return !1;
        if ("Identifier" === node.type) return !1;
        if ("ParenthesizedExpression" === parent.type) return !1;
        switch (node.type) {
          case "UnaryExpression":
          case "SpreadElement":
          case "SpreadProperty":
            return "MemberExpression" === parent.type && "object" === name && parent.object === node;

          case "BinaryExpression":
          case "LogicalExpression":
            switch (parent.type) {
              case "CallExpression":
                return "callee" === name && parent.callee === node;

              case "UnaryExpression":
              case "SpreadElement":
              case "SpreadProperty":
                return !0;

              case "MemberExpression":
                return "object" === name && parent.object === node;

              case "BinaryExpression":
              case "LogicalExpression":
                var po = parent.operator, pp = PRECEDENCE[po], no = node.operator, np = PRECEDENCE[no];
                if (pp > np) return !0;
                if (pp === np && "right" === name) return assert.strictEqual(parent.right, node), 
                !0;

              default:
                return !1;
            }

          case "SequenceExpression":
            switch (parent.type) {
              case "ReturnStatement":
                return !1;

              case "ForStatement":
                return !1;

              case "ExpressionStatement":
                return "expression" !== name;

              default:
                return !0;
            }

          case "YieldExpression":
            switch (parent.type) {
              case "BinaryExpression":
              case "LogicalExpression":
              case "UnaryExpression":
              case "SpreadElement":
              case "SpreadProperty":
              case "CallExpression":
              case "MemberExpression":
              case "NewExpression":
              case "ConditionalExpression":
              case "YieldExpression":
                return !0;

              default:
                return !1;
            }

          case "IntersectionTypeAnnotation":
          case "UnionTypeAnnotation":
            return "NullableTypeAnnotation" === parent.type;

          case "Literal":
            return "MemberExpression" === parent.type && isNumber.check(node.value) && "object" === name && parent.object === node;

          case "AssignmentExpression":
          case "ConditionalExpression":
            switch (parent.type) {
              case "UnaryExpression":
              case "SpreadElement":
              case "SpreadProperty":
              case "BinaryExpression":
              case "LogicalExpression":
                return !0;

              case "CallExpression":
                return "callee" === name && parent.callee === node;

              case "ConditionalExpression":
                return "test" === name && parent.test === node;

              case "MemberExpression":
                return "object" === name && parent.object === node;

              default:
                return !1;
            }

          case "ArrowFunctionExpression":
            return "CallExpression" === parent.type && "callee" === name || isBinary(parent);

          case "ObjectExpression":
            if ("ArrowFunctionExpression" === parent.type && "body" === name) return !0;

          default:
            if ("NewExpression" === parent.type && "callee" === name && parent.callee === node) return containsCallExpression(node);
        }
        return !(assumeExpressionContext === !0 || this.canBeFirstInStatement() || !this.firstInStatement());
    };
    var PRECEDENCE = {};
    [ [ "||" ], [ "&&" ], [ "|" ], [ "^" ], [ "&" ], [ "==", "===", "!=", "!==" ], [ "<", ">", "<=", ">=", "in", "instanceof" ], [ ">>", "<<", ">>>" ], [ "+", "-" ], [ "*", "/", "%", "**" ] ].forEach(function(tier, i) {
        tier.forEach(function(op) {
            PRECEDENCE[op] = i;
        });
    }), FPp.canBeFirstInStatement = function() {
        var node = this.getNode();
        return !n.FunctionExpression.check(node) && !n.ObjectExpression.check(node);
    }, FPp.firstInStatement = function() {
        for (var parentName, parent, childName, child, s = this.stack, i = s.length - 1; i >= 0; i -= 2) if (n.Node.check(s[i]) && (childName = parentName, 
        child = parent, parentName = s[i - 1], parent = s[i]), parent && child) {
            if (n.BlockStatement.check(parent) && "body" === parentName && 0 === childName) return assert.strictEqual(parent.body[0], child), 
            !0;
            if (n.ExpressionStatement.check(parent) && "expression" === childName) return assert.strictEqual(parent.expression, child), 
            !0;
            if (n.SequenceExpression.check(parent) && "expressions" === parentName && 0 === childName) assert.strictEqual(parent.expressions[0], child); else if (n.CallExpression.check(parent) && "callee" === childName) assert.strictEqual(parent.callee, child); else if (n.MemberExpression.check(parent) && "object" === childName) assert.strictEqual(parent.object, child); else if (n.ConditionalExpression.check(parent) && "test" === childName) assert.strictEqual(parent.test, child); else if (isBinary(parent) && "left" === childName) assert.strictEqual(parent.left, child); else {
                if (!n.UnaryExpression.check(parent) || parent.prefix || "argument" !== childName) return !1;
                assert.strictEqual(parent.argument, child);
            }
        }
        return !0;
    };
}, /*!*********************************!*\
  !*** ./~/recast/lib/patcher.js ***!
  \*********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function Patcher(lines) {
        assert.ok(this instanceof Patcher), assert.ok(lines instanceof linesModule.Lines);
        var self = this, replacements = [];
        self.replace = function(loc, lines) {
            isString.check(lines) && (lines = linesModule.fromString(lines)), replacements.push({
                lines: lines,
                start: loc.start,
                end: loc.end
            });
        }, self.get = function(loc) {
            function pushSlice(from, to) {
                assert.ok(comparePos(from, to) <= 0), toConcat.push(lines.slice(from, to));
            }
            loc = loc || {
                start: {
                    line: 1,
                    column: 0
                },
                end: {
                    line: lines.length,
                    column: lines.getLineLength(lines.length)
                }
            };
            var sliceFrom = loc.start, toConcat = [];
            return replacements.sort(function(a, b) {
                return comparePos(a.start, b.start);
            }).forEach(function(rep) {
                comparePos(sliceFrom, rep.start) > 0 || (pushSlice(sliceFrom, rep.start), toConcat.push(rep.lines), 
                sliceFrom = rep.end);
            }), pushSlice(sliceFrom, loc.end), linesModule.concat(toConcat);
        };
    }
    function getSurroundingComments(node) {
        var result = [];
        return node.comments && node.comments.length > 0 && node.comments.forEach(function(comment) {
            (comment.leading || comment.trailing) && result.push(comment);
        }), result;
    }
    function needsLeadingSpace(oldLines, oldLoc, newLines) {
        var posBeforeOldLoc = util.copyPos(oldLoc.start), charBeforeOldLoc = oldLines.prevPos(posBeforeOldLoc) && oldLines.charAt(posBeforeOldLoc), newFirstChar = newLines.charAt(newLines.firstPos());
        return charBeforeOldLoc && riskyAdjoiningCharExp.test(charBeforeOldLoc) && newFirstChar && riskyAdjoiningCharExp.test(newFirstChar);
    }
    function needsTrailingSpace(oldLines, oldLoc, newLines) {
        var charAfterOldLoc = oldLines.charAt(oldLoc.end), newLastPos = newLines.lastPos(), newLastChar = newLines.prevPos(newLastPos) && newLines.charAt(newLastPos);
        return newLastChar && riskyAdjoiningCharExp.test(newLastChar) && charAfterOldLoc && riskyAdjoiningCharExp.test(charAfterOldLoc);
    }
    function findReprints(newPath, reprints) {
        var newNode = newPath.getValue();
        Printable.assert(newNode);
        var oldNode = newNode.original;
        if (Printable.assert(oldNode), assert.deepEqual(reprints, []), newNode.type !== oldNode.type) return !1;
        var oldPath = new FastPath(oldNode), canReprint = findChildReprints(newPath, oldPath, reprints);
        return canReprint || (reprints.length = 0), canReprint;
    }
    function findAnyReprints(newPath, oldPath, reprints) {
        var newNode = newPath.getValue(), oldNode = oldPath.getValue();
        return newNode === oldNode || (isArray.check(newNode) ? findArrayReprints(newPath, oldPath, reprints) : !!isObject.check(newNode) && findObjectReprints(newPath, oldPath, reprints));
    }
    function findArrayReprints(newPath, oldPath, reprints) {
        var newNode = newPath.getValue(), oldNode = oldPath.getValue();
        isArray.assert(newNode);
        var len = newNode.length;
        if (!isArray.check(oldNode) || oldNode.length !== len) return !1;
        for (var i = 0; i < len; ++i) {
            newPath.stack.push(i, newNode[i]), oldPath.stack.push(i, oldNode[i]);
            var canReprint = findAnyReprints(newPath, oldPath, reprints);
            if (newPath.stack.length -= 2, oldPath.stack.length -= 2, !canReprint) return !1;
        }
        return !0;
    }
    function findObjectReprints(newPath, oldPath, reprints) {
        var newNode = newPath.getValue();
        if (isObject.assert(newNode), null === newNode.original) return !1;
        var oldNode = oldPath.getValue();
        if (!isObject.check(oldNode)) return !1;
        if (Printable.check(newNode)) {
            if (!Printable.check(oldNode)) return !1;
            if (newNode.type === oldNode.type) {
                var childReprints = [];
                if (findChildReprints(newPath, oldPath, childReprints)) reprints.push.apply(reprints, childReprints); else {
                    if (!oldNode.loc) return !1;
                    reprints.push({
                        oldPath: oldPath.copy(),
                        newPath: newPath.copy()
                    });
                }
                return !0;
            }
            return !!(Expression.check(newNode) && Expression.check(oldNode) && oldNode.loc) && (reprints.push({
                oldPath: oldPath.copy(),
                newPath: newPath.copy()
            }), !0);
        }
        return findChildReprints(newPath, oldPath, reprints);
    }
    function hasOpeningParen(oldPath) {
        var oldNode = oldPath.getValue(), loc = oldNode.loc, lines = loc && loc.lines;
        if (lines) {
            var pos = reusablePos;
            for (pos.line = loc.start.line, pos.column = loc.start.column; lines.prevPos(pos); ) {
                var ch = lines.charAt(pos);
                if ("(" === ch) return comparePos(oldPath.getRootValue().loc.start, pos) <= 0;
                if (nonSpaceExp.test(ch)) return !1;
            }
        }
        return !1;
    }
    function hasClosingParen(oldPath) {
        var oldNode = oldPath.getValue(), loc = oldNode.loc, lines = loc && loc.lines;
        if (lines) {
            var pos = reusablePos;
            pos.line = loc.end.line, pos.column = loc.end.column;
            do {
                var ch = lines.charAt(pos);
                if (")" === ch) return comparePos(pos, oldPath.getRootValue().loc.end) <= 0;
                if (nonSpaceExp.test(ch)) return !1;
            } while (lines.nextPos(pos));
        }
        return !1;
    }
    function hasParens(oldPath) {
        return hasOpeningParen(oldPath) && hasClosingParen(oldPath);
    }
    function findChildReprints(newPath, oldPath, reprints) {
        var newNode = newPath.getValue(), oldNode = oldPath.getValue();
        if (isObject.assert(newNode), isObject.assert(oldNode), null === newNode.original) return !1;
        if (!newPath.canBeFirstInStatement() && newPath.firstInStatement() && !hasOpeningParen(oldPath)) return !1;
        if (newPath.needsParens(!0) && !hasParens(oldPath)) return !1;
        for (var k in util.getUnionOfKeys(newNode, oldNode)) if ("loc" !== k) {
            newPath.stack.push(k, types.getFieldValue(newNode, k)), oldPath.stack.push(k, types.getFieldValue(oldNode, k));
            var canReprint = findAnyReprints(newPath, oldPath, reprints);
            if (newPath.stack.length -= 2, oldPath.stack.length -= 2, !canReprint) return !1;
        }
        return !0;
    }
    var assert = __webpack_require__(/*! assert */ 5), linesModule = __webpack_require__(/*! ./lines */ 8), types = __webpack_require__(/*! ./types */ 3), Printable = (types.getFieldValue, 
    types.namedTypes.Printable), Expression = types.namedTypes.Expression, SourceLocation = types.namedTypes.SourceLocation, util = __webpack_require__(/*! ./util */ 6), comparePos = util.comparePos, FastPath = __webpack_require__(/*! ./fast-path */ 24), isObject = types.builtInTypes.object, isArray = types.builtInTypes.array, isString = types.builtInTypes.string, riskyAdjoiningCharExp = /[0-9a-z_$]/i;
    exports.Patcher = Patcher;
    var Pp = Patcher.prototype;
    Pp.tryToReprintComments = function(newNode, oldNode, print) {
        var patcher = this;
        if (!newNode.comments && !oldNode.comments) return !0;
        var newPath = FastPath.from(newNode), oldPath = FastPath.from(oldNode);
        newPath.stack.push("comments", getSurroundingComments(newNode)), oldPath.stack.push("comments", getSurroundingComments(oldNode));
        var reprints = [], ableToReprintComments = findArrayReprints(newPath, oldPath, reprints);
        return ableToReprintComments && reprints.length > 0 && reprints.forEach(function(reprint) {
            var oldComment = reprint.oldPath.getValue();
            assert.ok(oldComment.leading || oldComment.trailing), patcher.replace(oldComment.loc, print(reprint.newPath).indentTail(oldComment.loc.indent));
        }), ableToReprintComments;
    }, Pp.deleteComments = function(node) {
        if (node.comments) {
            var patcher = this;
            node.comments.forEach(function(comment) {
                comment.leading ? patcher.replace({
                    start: comment.loc.start,
                    end: node.loc.lines.skipSpaces(comment.loc.end, !1, !1)
                }, "") : comment.trailing && patcher.replace({
                    start: node.loc.lines.skipSpaces(comment.loc.start, !0, !1),
                    end: comment.loc.end
                }, "");
            });
        }
    }, exports.getReprinter = function(path) {
        assert.ok(path instanceof FastPath);
        var node = path.getValue();
        if (Printable.check(node)) {
            var orig = node.original, origLoc = orig && orig.loc, lines = origLoc && origLoc.lines, reprints = [];
            if (lines && findReprints(path, reprints)) return function(print) {
                var patcher = new Patcher(lines);
                return reprints.forEach(function(reprint) {
                    var newNode = reprint.newPath.getValue(), oldNode = reprint.oldPath.getValue();
                    SourceLocation.assert(oldNode.loc, !0);
                    var needToPrintNewPathWithComments = !patcher.tryToReprintComments(newNode, oldNode, print);
                    needToPrintNewPathWithComments && patcher.deleteComments(oldNode);
                    var newLines = print(reprint.newPath, needToPrintNewPathWithComments).indentTail(oldNode.loc.indent), nls = needsLeadingSpace(lines, oldNode.loc, newLines), nts = needsTrailingSpace(lines, oldNode.loc, newLines);
                    if (nls || nts) {
                        var newParts = [];
                        nls && newParts.push(" "), newParts.push(newLines), nts && newParts.push(" "), newLines = linesModule.concat(newParts);
                    }
                    patcher.replace(oldNode.loc, newLines);
                }), patcher.get(origLoc).indentTail(-orig.loc.indent);
            };
        }
    };
    var reusablePos = {
        line: 1,
        column: 0
    }, nonSpaceExp = /\S/;
}, /*!*******************************************!*\
  !*** ./~/recast/~/ast-types/def/babel.js ***!
  \*******************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./es7 */ 9));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 1)), defaults = fork.use(__webpack_require__(/*! ../lib/shared */ 4)).defaults, def = types.Type.def, or = types.Type.or;
        def("Noop").bases("Node").build(), def("DoExpression").bases("Expression").build("body").field("body", [ def("Statement") ]), 
        def("Super").bases("Expression").build(), def("BindExpression").bases("Expression").build("object", "callee").field("object", or(def("Expression"), null)).field("callee", def("Expression")), 
        def("Decorator").bases("Node").build("expression").field("expression", def("Expression")), 
        def("Property").field("decorators", or([ def("Decorator") ], null), defaults.null), 
        def("MethodDefinition").field("decorators", or([ def("Decorator") ], null), defaults.null), 
        def("MetaProperty").bases("Expression").build("meta", "property").field("meta", def("Identifier")).field("property", def("Identifier")), 
        def("ParenthesizedExpression").bases("Expression").build("expression").field("expression", def("Expression")), 
        def("ImportSpecifier").bases("ModuleSpecifier").build("imported", "local").field("imported", def("Identifier")), 
        def("ImportDefaultSpecifier").bases("ModuleSpecifier").build("local"), def("ImportNamespaceSpecifier").bases("ModuleSpecifier").build("local"), 
        def("ExportDefaultDeclaration").bases("Declaration").build("declaration").field("declaration", or(def("Declaration"), def("Expression"))), 
        def("ExportNamedDeclaration").bases("Declaration").build("declaration", "specifiers", "source").field("declaration", or(def("Declaration"), null)).field("specifiers", [ def("ExportSpecifier") ], defaults.emptyArray).field("source", or(def("Literal"), null), defaults.null), 
        def("ExportSpecifier").bases("ModuleSpecifier").build("local", "exported").field("exported", def("Identifier")), 
        def("ExportNamespaceSpecifier").bases("Specifier").build("exported").field("exported", def("Identifier")), 
        def("ExportDefaultSpecifier").bases("Specifier").build("exported").field("exported", def("Identifier")), 
        def("ExportAllDeclaration").bases("Declaration").build("exported", "source").field("exported", or(def("Identifier"), null)).field("source", def("Literal")), 
        def("CommentBlock").bases("Comment").build("value", "leading", "trailing"), def("CommentLine").bases("Comment").build("value", "leading", "trailing");
    };
}, /*!*****************************************!*\
  !*** ./~/recast/~/ast-types/def/es6.js ***!
  \*****************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./core */ 12));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 1)), def = types.Type.def, or = types.Type.or, defaults = fork.use(__webpack_require__(/*! ../lib/shared */ 4)).defaults;
        def("Function").field("generator", Boolean, defaults.false).field("expression", Boolean, defaults.false).field("defaults", [ or(def("Expression"), null) ], defaults.emptyArray).field("rest", or(def("Identifier"), null), defaults.null), 
        def("RestElement").bases("Pattern").build("argument").field("argument", def("Pattern")), 
        def("SpreadElementPattern").bases("Pattern").build("argument").field("argument", def("Pattern")), 
        def("FunctionDeclaration").build("id", "params", "body", "generator", "expression"), 
        def("FunctionExpression").build("id", "params", "body", "generator", "expression"), 
        def("ArrowFunctionExpression").bases("Function", "Expression").build("params", "body", "expression").field("id", null, defaults.null).field("body", or(def("BlockStatement"), def("Expression"))).field("generator", !1, defaults.false), 
        def("YieldExpression").bases("Expression").build("argument", "delegate").field("argument", or(def("Expression"), null)).field("delegate", Boolean, defaults.false), 
        def("GeneratorExpression").bases("Expression").build("body", "blocks", "filter").field("body", def("Expression")).field("blocks", [ def("ComprehensionBlock") ]).field("filter", or(def("Expression"), null)), 
        def("ComprehensionExpression").bases("Expression").build("body", "blocks", "filter").field("body", def("Expression")).field("blocks", [ def("ComprehensionBlock") ]).field("filter", or(def("Expression"), null)), 
        def("ComprehensionBlock").bases("Node").build("left", "right", "each").field("left", def("Pattern")).field("right", def("Expression")).field("each", Boolean), 
        def("Property").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("value", or(def("Expression"), def("Pattern"))).field("method", Boolean, defaults.false).field("shorthand", Boolean, defaults.false).field("computed", Boolean, defaults.false), 
        def("PropertyPattern").bases("Pattern").build("key", "pattern").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("pattern", def("Pattern")).field("computed", Boolean, defaults.false), 
        def("ObjectPattern").bases("Pattern").build("properties").field("properties", [ or(def("PropertyPattern"), def("Property")) ]), 
        def("ArrayPattern").bases("Pattern").build("elements").field("elements", [ or(def("Pattern"), null) ]), 
        def("MethodDefinition").bases("Declaration").build("kind", "key", "value", "static").field("kind", or("constructor", "method", "get", "set")).field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("value", def("Function")).field("computed", Boolean, defaults.false).field("static", Boolean, defaults.false), 
        def("SpreadElement").bases("Node").build("argument").field("argument", def("Expression")), 
        def("ArrayExpression").field("elements", [ or(def("Expression"), def("SpreadElement"), def("RestElement"), null) ]), 
        def("NewExpression").field("arguments", [ or(def("Expression"), def("SpreadElement")) ]), 
        def("CallExpression").field("arguments", [ or(def("Expression"), def("SpreadElement")) ]), 
        def("AssignmentPattern").bases("Pattern").build("left", "right").field("left", def("Pattern")).field("right", def("Expression"));
        var ClassBodyElement = or(def("MethodDefinition"), def("VariableDeclarator"), def("ClassPropertyDefinition"), def("ClassProperty"));
        def("ClassProperty").bases("Declaration").build("key").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("computed", Boolean, defaults.false), 
        def("ClassPropertyDefinition").bases("Declaration").build("definition").field("definition", ClassBodyElement), 
        def("ClassBody").bases("Declaration").build("body").field("body", [ ClassBodyElement ]), 
        def("ClassDeclaration").bases("Declaration").build("id", "body", "superClass").field("id", or(def("Identifier"), null)).field("body", def("ClassBody")).field("superClass", or(def("Expression"), null), defaults.null), 
        def("ClassExpression").bases("Expression").build("id", "body", "superClass").field("id", or(def("Identifier"), null), defaults.null).field("body", def("ClassBody")).field("superClass", or(def("Expression"), null), defaults.null).field("implements", [ def("ClassImplements") ], defaults.emptyArray), 
        def("ClassImplements").bases("Node").build("id").field("id", def("Identifier")).field("superClass", or(def("Expression"), null), defaults.null), 
        def("Specifier").bases("Node"), def("ModuleSpecifier").bases("Specifier").field("local", or(def("Identifier"), null), defaults.null).field("id", or(def("Identifier"), null), defaults.null).field("name", or(def("Identifier"), null), defaults.null), 
        def("TaggedTemplateExpression").bases("Expression").build("tag", "quasi").field("tag", def("Expression")).field("quasi", def("TemplateLiteral")), 
        def("TemplateLiteral").bases("Expression").build("quasis", "expressions").field("quasis", [ def("TemplateElement") ]).field("expressions", [ def("Expression") ]), 
        def("TemplateElement").bases("Node").build("value", "tail").field("value", {
            cooked: String,
            raw: String
        }).field("tail", Boolean);
    };
}, /*!******************************************!*\
  !*** ./~/recast/~/ast-types/def/flow.js ***!
  \******************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./es7 */ 9));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 1)), def = types.Type.def, or = types.Type.or, defaults = fork.use(__webpack_require__(/*! ../lib/shared */ 4)).defaults;
        def("Type").bases("Node"), def("AnyTypeAnnotation").bases("Type").build(), def("EmptyTypeAnnotation").bases("Type").build(), 
        def("MixedTypeAnnotation").bases("Type").build(), def("VoidTypeAnnotation").bases("Type").build(), 
        def("NumberTypeAnnotation").bases("Type").build(), def("NumberLiteralTypeAnnotation").bases("Type").build("value", "raw").field("value", Number).field("raw", String), 
        def("StringTypeAnnotation").bases("Type").build(), def("StringLiteralTypeAnnotation").bases("Type").build("value", "raw").field("value", String).field("raw", String), 
        def("BooleanTypeAnnotation").bases("Type").build(), def("BooleanLiteralTypeAnnotation").bases("Type").build("value", "raw").field("value", Boolean).field("raw", String), 
        def("TypeAnnotation").bases("Node").build("typeAnnotation").field("typeAnnotation", def("Type")), 
        def("NullableTypeAnnotation").bases("Type").build("typeAnnotation").field("typeAnnotation", def("Type")), 
        def("NullLiteralTypeAnnotation").bases("Type").build(), def("NullTypeAnnotation").bases("Type").build(), 
        def("ThisTypeAnnotation").bases("Type").build(), def("ExistsTypeAnnotation").bases("Type").build(), 
        def("ExistentialTypeParam").bases("Type").build(), def("FunctionTypeAnnotation").bases("Type").build("params", "returnType", "rest", "typeParameters").field("params", [ def("FunctionTypeParam") ]).field("returnType", def("Type")).field("rest", or(def("FunctionTypeParam"), null)).field("typeParameters", or(def("TypeParameterDeclaration"), null)), 
        def("FunctionTypeParam").bases("Node").build("name", "typeAnnotation", "optional").field("name", def("Identifier")).field("typeAnnotation", def("Type")).field("optional", Boolean), 
        def("ArrayTypeAnnotation").bases("Type").build("elementType").field("elementType", def("Type")), 
        def("ObjectTypeAnnotation").bases("Type").build("properties", "indexers", "callProperties").field("properties", [ def("ObjectTypeProperty") ]).field("indexers", [ def("ObjectTypeIndexer") ], defaults.emptyArray).field("callProperties", [ def("ObjectTypeCallProperty") ], defaults.emptyArray).field("exact", Boolean, defaults.false), 
        def("ObjectTypeProperty").bases("Node").build("key", "value", "optional").field("key", or(def("Literal"), def("Identifier"))).field("value", def("Type")).field("optional", Boolean).field("variance", or("plus", "minus", null), defaults.null), 
        def("ObjectTypeIndexer").bases("Node").build("id", "key", "value").field("id", def("Identifier")).field("key", def("Type")).field("value", def("Type")).field("variance", or("plus", "minus", null), defaults.null), 
        def("ObjectTypeCallProperty").bases("Node").build("value").field("value", def("FunctionTypeAnnotation")).field("static", Boolean, defaults.false), 
        def("QualifiedTypeIdentifier").bases("Node").build("qualification", "id").field("qualification", or(def("Identifier"), def("QualifiedTypeIdentifier"))).field("id", def("Identifier")), 
        def("GenericTypeAnnotation").bases("Type").build("id", "typeParameters").field("id", or(def("Identifier"), def("QualifiedTypeIdentifier"))).field("typeParameters", or(def("TypeParameterInstantiation"), null)), 
        def("MemberTypeAnnotation").bases("Type").build("object", "property").field("object", def("Identifier")).field("property", or(def("MemberTypeAnnotation"), def("GenericTypeAnnotation"))), 
        def("UnionTypeAnnotation").bases("Type").build("types").field("types", [ def("Type") ]), 
        def("IntersectionTypeAnnotation").bases("Type").build("types").field("types", [ def("Type") ]), 
        def("TypeofTypeAnnotation").bases("Type").build("argument").field("argument", def("Type")), 
        def("Identifier").field("typeAnnotation", or(def("TypeAnnotation"), null), defaults.null), 
        def("TypeParameterDeclaration").bases("Node").build("params").field("params", [ def("TypeParameter") ]), 
        def("TypeParameterInstantiation").bases("Node").build("params").field("params", [ def("Type") ]), 
        def("TypeParameter").bases("Type").build("name", "variance", "bound").field("name", String).field("variance", or("plus", "minus", null), defaults.null).field("bound", or(def("TypeAnnotation"), null), defaults.null), 
        def("Function").field("returnType", or(def("TypeAnnotation"), null), defaults.null).field("typeParameters", or(def("TypeParameterDeclaration"), null), defaults.null), 
        def("ClassProperty").build("key", "value", "typeAnnotation", "static").field("value", or(def("Expression"), null)).field("typeAnnotation", or(def("TypeAnnotation"), null)).field("static", Boolean, defaults.false).field("variance", or("plus", "minus", null), defaults.null), 
        def("ClassImplements").field("typeParameters", or(def("TypeParameterInstantiation"), null), defaults.null), 
        def("InterfaceDeclaration").bases("Declaration").build("id", "body", "extends").field("id", def("Identifier")).field("typeParameters", or(def("TypeParameterDeclaration"), null), defaults.null).field("body", def("ObjectTypeAnnotation")).field("extends", [ def("InterfaceExtends") ]), 
        def("DeclareInterface").bases("InterfaceDeclaration").build("id", "body", "extends"), 
        def("InterfaceExtends").bases("Node").build("id").field("id", def("Identifier")).field("typeParameters", or(def("TypeParameterInstantiation"), null)), 
        def("TypeAlias").bases("Declaration").build("id", "typeParameters", "right").field("id", def("Identifier")).field("typeParameters", or(def("TypeParameterDeclaration"), null)).field("right", def("Type")), 
        def("DeclareTypeAlias").bases("TypeAlias").build("id", "typeParameters", "right"), 
        def("TypeCastExpression").bases("Expression").build("expression", "typeAnnotation").field("expression", def("Expression")).field("typeAnnotation", def("TypeAnnotation")), 
        def("TupleTypeAnnotation").bases("Type").build("types").field("types", [ def("Type") ]), 
        def("DeclareVariable").bases("Statement").build("id").field("id", def("Identifier")), 
        def("DeclareFunction").bases("Statement").build("id").field("id", def("Identifier")), 
        def("DeclareClass").bases("InterfaceDeclaration").build("id"), def("DeclareModule").bases("Statement").build("id", "body").field("id", or(def("Identifier"), def("Literal"))).field("body", def("BlockStatement")), 
        def("DeclareModuleExports").bases("Statement").build("typeAnnotation").field("typeAnnotation", def("Type")), 
        def("DeclareExportDeclaration").bases("Declaration").build("default", "declaration", "specifiers", "source").field("default", Boolean).field("declaration", or(def("DeclareVariable"), def("DeclareFunction"), def("DeclareClass"), def("Type"), null)).field("specifiers", [ or(def("ExportSpecifier"), def("ExportBatchSpecifier")) ], defaults.emptyArray).field("source", or(def("Literal"), null), defaults.null);
    };
}, /*!******************************************!*\
  !*** ./~/recast/~/ast-types/lib/path.js ***!
  \******************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    var Ap = Array.prototype, Op = (Ap.slice, Ap.map, Object.prototype), hasOwn = Op.hasOwnProperty;
    module.exports = function(fork) {
        function Path(value, parentPath, name) {
            if (!(this instanceof Path)) throw new Error("Path constructor cannot be invoked without 'new'");
            if (parentPath) {
                if (!(parentPath instanceof Path)) throw new Error("");
            } else parentPath = null, name = null;
            this.value = value, this.parentPath = parentPath, this.name = name, this.__childCache = null;
        }
        function getChildCache(path) {
            return path.__childCache || (path.__childCache = Object.create(null));
        }
        function getChildPath(path, name) {
            var cache = getChildCache(path), actualChildValue = path.getValueProperty(name), childPath = cache[name];
            return hasOwn.call(cache, name) && childPath.value === actualChildValue || (childPath = cache[name] = new path.constructor(actualChildValue, path, name)), 
            childPath;
        }
        function emptyMoves() {}
        function getMoves(path, offset, start, end) {
            if (isArray.assert(path.value), 0 === offset) return emptyMoves;
            var length = path.value.length;
            if (length < 1) return emptyMoves;
            var argc = arguments.length;
            2 === argc ? (start = 0, end = length) : 3 === argc ? (start = Math.max(start, 0), 
            end = length) : (start = Math.max(start, 0), end = Math.min(end, length)), isNumber.assert(start), 
            isNumber.assert(end);
            for (var moves = Object.create(null), cache = getChildCache(path), i = start; i < end; ++i) if (hasOwn.call(path.value, i)) {
                var childPath = path.get(i);
                if (childPath.name !== i) throw new Error("");
                var newIndex = i + offset;
                childPath.name = newIndex, moves[newIndex] = childPath, delete cache[i];
            }
            return delete cache.length, function() {
                for (var newIndex in moves) {
                    var childPath = moves[newIndex];
                    if (childPath.name !== +newIndex) throw new Error("");
                    cache[newIndex] = childPath, path.value[newIndex] = childPath.value;
                }
            };
        }
        function repairRelationshipWithParent(path) {
            if (!(path instanceof Path)) throw new Error("");
            var pp = path.parentPath;
            if (!pp) return path;
            var parentValue = pp.value, parentCache = getChildCache(pp);
            if (parentValue[path.name] === path.value) parentCache[path.name] = path; else if (isArray.check(parentValue)) {
                var i = parentValue.indexOf(path.value);
                i >= 0 && (parentCache[path.name = i] = path);
            } else parentValue[path.name] = path.value, parentCache[path.name] = path;
            if (parentValue[path.name] !== path.value) throw new Error("");
            if (path.parentPath.get(path.name) !== path) throw new Error("");
            return path;
        }
        var types = fork.use(__webpack_require__(/*! ./types */ 1)), isArray = types.builtInTypes.array, isNumber = types.builtInTypes.number, Pp = Path.prototype;
        return Pp.getValueProperty = function(name) {
            return this.value[name];
        }, Pp.get = function(name) {
            for (var path = this, names = arguments, count = names.length, i = 0; i < count; ++i) path = getChildPath(path, names[i]);
            return path;
        }, Pp.each = function(callback, context) {
            for (var childPaths = [], len = this.value.length, i = 0, i = 0; i < len; ++i) hasOwn.call(this.value, i) && (childPaths[i] = this.get(i));
            for (context = context || this, i = 0; i < len; ++i) hasOwn.call(childPaths, i) && callback.call(context, childPaths[i]);
        }, Pp.map = function(callback, context) {
            var result = [];
            return this.each(function(childPath) {
                result.push(callback.call(this, childPath));
            }, context), result;
        }, Pp.filter = function(callback, context) {
            var result = [];
            return this.each(function(childPath) {
                callback.call(this, childPath) && result.push(childPath);
            }, context), result;
        }, Pp.shift = function() {
            var move = getMoves(this, -1), result = this.value.shift();
            return move(), result;
        }, Pp.unshift = function(node) {
            var move = getMoves(this, arguments.length), result = this.value.unshift.apply(this.value, arguments);
            return move(), result;
        }, Pp.push = function(node) {
            return isArray.assert(this.value), delete getChildCache(this).length, this.value.push.apply(this.value, arguments);
        }, Pp.pop = function() {
            isArray.assert(this.value);
            var cache = getChildCache(this);
            return delete cache[this.value.length - 1], delete cache.length, this.value.pop();
        }, Pp.insertAt = function(index, node) {
            var argc = arguments.length, move = getMoves(this, argc - 1, index);
            if (move === emptyMoves) return this;
            index = Math.max(index, 0);
            for (var i = 1; i < argc; ++i) this.value[index + i - 1] = arguments[i];
            return move(), this;
        }, Pp.insertBefore = function(node) {
            for (var pp = this.parentPath, argc = arguments.length, insertAtArgs = [ this.name ], i = 0; i < argc; ++i) insertAtArgs.push(arguments[i]);
            return pp.insertAt.apply(pp, insertAtArgs);
        }, Pp.insertAfter = function(node) {
            for (var pp = this.parentPath, argc = arguments.length, insertAtArgs = [ this.name + 1 ], i = 0; i < argc; ++i) insertAtArgs.push(arguments[i]);
            return pp.insertAt.apply(pp, insertAtArgs);
        }, Pp.replace = function(replacement) {
            var results = [], parentValue = this.parentPath.value, parentCache = getChildCache(this.parentPath), count = arguments.length;
            if (repairRelationshipWithParent(this), isArray.check(parentValue)) {
                for (var originalLength = parentValue.length, move = getMoves(this.parentPath, count - 1, this.name + 1), spliceArgs = [ this.name, 1 ], i = 0; i < count; ++i) spliceArgs.push(arguments[i]);
                var splicedOut = parentValue.splice.apply(parentValue, spliceArgs);
                if (splicedOut[0] !== this.value) throw new Error("");
                if (parentValue.length !== originalLength - 1 + count) throw new Error("");
                if (move(), 0 === count) delete this.value, delete parentCache[this.name], this.__childCache = null; else {
                    if (parentValue[this.name] !== replacement) throw new Error("");
                    for (this.value !== replacement && (this.value = replacement, this.__childCache = null), 
                    i = 0; i < count; ++i) results.push(this.parentPath.get(this.name + i));
                    if (results[0] !== this) throw new Error("");
                }
            } else if (1 === count) this.value !== replacement && (this.__childCache = null), 
            this.value = parentValue[this.name] = replacement, results.push(this); else {
                if (0 !== count) throw new Error("Could not replace path");
                delete parentValue[this.name], delete this.value, this.__childCache = null;
            }
            return results;
        }, Path;
    };
}, /*!***************************************!*\
  !*** ./~/source-map/lib/array-set.js ***!
  \***************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function ArraySet() {
        this._array = [], this._set = Object.create(null);
    }
    var util = __webpack_require__(/*! ./util */ 10), has = Object.prototype.hasOwnProperty;
    ArraySet.fromArray = function(aArray, aAllowDuplicates) {
        for (var set = new ArraySet(), i = 0, len = aArray.length; i < len; i++) set.add(aArray[i], aAllowDuplicates);
        return set;
    }, ArraySet.prototype.size = function() {
        return Object.getOwnPropertyNames(this._set).length;
    }, ArraySet.prototype.add = function(aStr, aAllowDuplicates) {
        var sStr = util.toSetString(aStr), isDuplicate = has.call(this._set, sStr), idx = this._array.length;
        isDuplicate && !aAllowDuplicates || this._array.push(aStr), isDuplicate || (this._set[sStr] = idx);
    }, ArraySet.prototype.has = function(aStr) {
        var sStr = util.toSetString(aStr);
        return has.call(this._set, sStr);
    }, ArraySet.prototype.indexOf = function(aStr) {
        var sStr = util.toSetString(aStr);
        if (has.call(this._set, sStr)) return this._set[sStr];
        throw new Error('"' + aStr + '" is not in the set.');
    }, ArraySet.prototype.at = function(aIdx) {
        if (aIdx >= 0 && aIdx < this._array.length) return this._array[aIdx];
        throw new Error("No element indexed by " + aIdx);
    }, ArraySet.prototype.toArray = function() {
        return this._array.slice();
    }, exports.ArraySet = ArraySet;
}, /*!****************************************!*\
  !*** ./~/source-map/lib/base64-vlq.js ***!
  \****************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function toVLQSigned(aValue) {
        return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
    }
    function fromVLQSigned(aValue) {
        var isNegative = 1 === (1 & aValue), shifted = aValue >> 1;
        return isNegative ? -shifted : shifted;
    }
    var base64 = __webpack_require__(/*! ./base64 */ 61), VLQ_BASE_SHIFT = 5, VLQ_BASE = 1 << VLQ_BASE_SHIFT, VLQ_BASE_MASK = VLQ_BASE - 1, VLQ_CONTINUATION_BIT = VLQ_BASE;
    exports.encode = function(aValue) {
        var digit, encoded = "", vlq = toVLQSigned(aValue);
        do digit = vlq & VLQ_BASE_MASK, vlq >>>= VLQ_BASE_SHIFT, vlq > 0 && (digit |= VLQ_CONTINUATION_BIT), 
        encoded += base64.encode(digit); while (vlq > 0);
        return encoded;
    }, exports.decode = function(aStr, aIndex, aOutParam) {
        var continuation, digit, strLen = aStr.length, result = 0, shift = 0;
        do {
            if (aIndex >= strLen) throw new Error("Expected more digits in base 64 VLQ value.");
            if (digit = base64.decode(aStr.charCodeAt(aIndex++)), digit === -1) throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
            continuation = !!(digit & VLQ_CONTINUATION_BIT), digit &= VLQ_BASE_MASK, result += digit << shift, 
            shift += VLQ_BASE_SHIFT;
        } while (continuation);
        aOutParam.value = fromVLQSigned(result), aOutParam.rest = aIndex;
    };
}, /*!**************************************************!*\
  !*** ./~/source-map/lib/source-map-generator.js ***!
  \**************************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function SourceMapGenerator(aArgs) {
        aArgs || (aArgs = {}), this._file = util.getArg(aArgs, "file", null), this._sourceRoot = util.getArg(aArgs, "sourceRoot", null), 
        this._skipValidation = util.getArg(aArgs, "skipValidation", !1), this._sources = new ArraySet(), 
        this._names = new ArraySet(), this._mappings = new MappingList(), this._sourcesContents = null;
    }
    var base64VLQ = __webpack_require__(/*! ./base64-vlq */ 31), util = __webpack_require__(/*! ./util */ 10), ArraySet = __webpack_require__(/*! ./array-set */ 30).ArraySet, MappingList = __webpack_require__(/*! ./mapping-list */ 63).MappingList;
    SourceMapGenerator.prototype._version = 3, SourceMapGenerator.fromSourceMap = function(aSourceMapConsumer) {
        var sourceRoot = aSourceMapConsumer.sourceRoot, generator = new SourceMapGenerator({
            file: aSourceMapConsumer.file,
            sourceRoot: sourceRoot
        });
        return aSourceMapConsumer.eachMapping(function(mapping) {
            var newMapping = {
                generated: {
                    line: mapping.generatedLine,
                    column: mapping.generatedColumn
                }
            };
            null != mapping.source && (newMapping.source = mapping.source, null != sourceRoot && (newMapping.source = util.relative(sourceRoot, newMapping.source)), 
            newMapping.original = {
                line: mapping.originalLine,
                column: mapping.originalColumn
            }, null != mapping.name && (newMapping.name = mapping.name)), generator.addMapping(newMapping);
        }), aSourceMapConsumer.sources.forEach(function(sourceFile) {
            var content = aSourceMapConsumer.sourceContentFor(sourceFile);
            null != content && generator.setSourceContent(sourceFile, content);
        }), generator;
    }, SourceMapGenerator.prototype.addMapping = function(aArgs) {
        var generated = util.getArg(aArgs, "generated"), original = util.getArg(aArgs, "original", null), source = util.getArg(aArgs, "source", null), name = util.getArg(aArgs, "name", null);
        this._skipValidation || this._validateMapping(generated, original, source, name), 
        null != source && (source = String(source), this._sources.has(source) || this._sources.add(source)), 
        null != name && (name = String(name), this._names.has(name) || this._names.add(name)), 
        this._mappings.add({
            generatedLine: generated.line,
            generatedColumn: generated.column,
            originalLine: null != original && original.line,
            originalColumn: null != original && original.column,
            source: source,
            name: name
        });
    }, SourceMapGenerator.prototype.setSourceContent = function(aSourceFile, aSourceContent) {
        var source = aSourceFile;
        null != this._sourceRoot && (source = util.relative(this._sourceRoot, source)), 
        null != aSourceContent ? (this._sourcesContents || (this._sourcesContents = Object.create(null)), 
        this._sourcesContents[util.toSetString(source)] = aSourceContent) : this._sourcesContents && (delete this._sourcesContents[util.toSetString(source)], 
        0 === Object.keys(this._sourcesContents).length && (this._sourcesContents = null));
    }, SourceMapGenerator.prototype.applySourceMap = function(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
        var sourceFile = aSourceFile;
        if (null == aSourceFile) {
            if (null == aSourceMapConsumer.file) throw new Error('SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, or the source map\'s "file" property. Both were omitted.');
            sourceFile = aSourceMapConsumer.file;
        }
        var sourceRoot = this._sourceRoot;
        null != sourceRoot && (sourceFile = util.relative(sourceRoot, sourceFile));
        var newSources = new ArraySet(), newNames = new ArraySet();
        this._mappings.unsortedForEach(function(mapping) {
            if (mapping.source === sourceFile && null != mapping.originalLine) {
                var original = aSourceMapConsumer.originalPositionFor({
                    line: mapping.originalLine,
                    column: mapping.originalColumn
                });
                null != original.source && (mapping.source = original.source, null != aSourceMapPath && (mapping.source = util.join(aSourceMapPath, mapping.source)), 
                null != sourceRoot && (mapping.source = util.relative(sourceRoot, mapping.source)), 
                mapping.originalLine = original.line, mapping.originalColumn = original.column, 
                null != original.name && (mapping.name = original.name));
            }
            var source = mapping.source;
            null == source || newSources.has(source) || newSources.add(source);
            var name = mapping.name;
            null == name || newNames.has(name) || newNames.add(name);
        }, this), this._sources = newSources, this._names = newNames, aSourceMapConsumer.sources.forEach(function(sourceFile) {
            var content = aSourceMapConsumer.sourceContentFor(sourceFile);
            null != content && (null != aSourceMapPath && (sourceFile = util.join(aSourceMapPath, sourceFile)), 
            null != sourceRoot && (sourceFile = util.relative(sourceRoot, sourceFile)), this.setSourceContent(sourceFile, content));
        }, this);
    }, SourceMapGenerator.prototype._validateMapping = function(aGenerated, aOriginal, aSource, aName) {
        if ((!(aGenerated && "line" in aGenerated && "column" in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0) || aOriginal || aSource || aName) && !(aGenerated && "line" in aGenerated && "column" in aGenerated && aOriginal && "line" in aOriginal && "column" in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource)) throw new Error("Invalid mapping: " + JSON.stringify({
            generated: aGenerated,
            source: aSource,
            original: aOriginal,
            name: aName
        }));
    }, SourceMapGenerator.prototype._serializeMappings = function() {
        for (var next, mapping, nameIdx, sourceIdx, previousGeneratedColumn = 0, previousGeneratedLine = 1, previousOriginalColumn = 0, previousOriginalLine = 0, previousName = 0, previousSource = 0, result = "", mappings = this._mappings.toArray(), i = 0, len = mappings.length; i < len; i++) {
            if (mapping = mappings[i], next = "", mapping.generatedLine !== previousGeneratedLine) for (previousGeneratedColumn = 0; mapping.generatedLine !== previousGeneratedLine; ) next += ";", 
            previousGeneratedLine++; else if (i > 0) {
                if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) continue;
                next += ",";
            }
            next += base64VLQ.encode(mapping.generatedColumn - previousGeneratedColumn), previousGeneratedColumn = mapping.generatedColumn, 
            null != mapping.source && (sourceIdx = this._sources.indexOf(mapping.source), next += base64VLQ.encode(sourceIdx - previousSource), 
            previousSource = sourceIdx, next += base64VLQ.encode(mapping.originalLine - 1 - previousOriginalLine), 
            previousOriginalLine = mapping.originalLine - 1, next += base64VLQ.encode(mapping.originalColumn - previousOriginalColumn), 
            previousOriginalColumn = mapping.originalColumn, null != mapping.name && (nameIdx = this._names.indexOf(mapping.name), 
            next += base64VLQ.encode(nameIdx - previousName), previousName = nameIdx)), result += next;
        }
        return result;
    }, SourceMapGenerator.prototype._generateSourcesContent = function(aSources, aSourceRoot) {
        return aSources.map(function(source) {
            if (!this._sourcesContents) return null;
            null != aSourceRoot && (source = util.relative(aSourceRoot, source));
            var key = util.toSetString(source);
            return Object.prototype.hasOwnProperty.call(this._sourcesContents, key) ? this._sourcesContents[key] : null;
        }, this);
    }, SourceMapGenerator.prototype.toJSON = function() {
        var map = {
            version: this._version,
            sources: this._sources.toArray(),
            names: this._names.toArray(),
            mappings: this._serializeMappings()
        };
        return null != this._file && (map.file = this._file), null != this._sourceRoot && (map.sourceRoot = this._sourceRoot), 
        this._sourcesContents && (map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot)), 
        map;
    }, SourceMapGenerator.prototype.toString = function() {
        return JSON.stringify(this.toJSON());
    }, exports.SourceMapGenerator = SourceMapGenerator;
}, /*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    var g, _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    g = function() {
        return this;
    }();
    try {
        g = g || Function("return this")() || (0, eval)("this");
    } catch (e) {
        "object" === ("undefined" == typeof window ? "undefined" : _typeof(window)) && (g = window);
    }
    module.exports = g;
}, /*!*****************************!*\
  !*** ./~/ast-types/main.js ***!
  \*****************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = __webpack_require__(/*! ./fork */ 41)([ __webpack_require__(/*! ./def/core */ 11), __webpack_require__(/*! ./def/es6 */ 18), __webpack_require__(/*! ./def/es7 */ 7), __webpack_require__(/*! ./def/mozilla */ 40), __webpack_require__(/*! ./def/e4x */ 37), __webpack_require__(/*! ./def/jsx */ 39), __webpack_require__(/*! ./def/flow */ 19), __webpack_require__(/*! ./def/esprima */ 38), __webpack_require__(/*! ./def/babel */ 17), __webpack_require__(/*! ./def/babel6 */ 36) ]);
}, /*!**************************!*\
  !*** ./~/recast/main.js ***!
  \**************************/
function(module, exports, __webpack_require__) {
    "use strict";
    (function(process) {
        function print(node, options) {
            return new Printer(options).print(node);
        }
        function prettyPrint(node, options) {
            return new Printer(options).printGenerically(node);
        }
        function run(transformer, options) {
            return runFile(process.argv[2], transformer, options);
        }
        function runFile(path, transformer, options) {
            __webpack_require__(/*! fs */ 70).readFile(path, "utf-8", function(err, code) {
                return err ? void console.error(err) : void runString(code, transformer, options);
            });
        }
        function defaultWriteback(output) {
            process.stdout.write(output);
        }
        function runString(code, transformer, options) {
            var writeback = options && options.writeback || defaultWriteback;
            transformer(parse(code, options), function(node) {
                writeback(print(node, options).code);
            });
        }
        var types = __webpack_require__(/*! ./lib/types */ 3), parse = __webpack_require__(/*! ./lib/parser */ 49).parse, Printer = __webpack_require__(/*! ./lib/printer */ 50).Printer;
        Object.defineProperties(exports, {
            parse: {
                enumerable: !0,
                value: parse
            },
            visit: {
                enumerable: !0,
                value: types.visit
            },
            print: {
                enumerable: !0,
                value: print
            },
            prettyPrint: {
                enumerable: !1,
                value: prettyPrint
            },
            types: {
                enumerable: !1,
                value: types
            },
            run: {
                enumerable: !1,
                value: run
            }
        });
    }).call(exports, __webpack_require__(/*! ./../process/browser.js */ 22));
}, /*!***********************************!*\
  !*** ./~/ast-types/def/babel6.js ***!
  \***********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./babel */ 17)), fork.use(__webpack_require__(/*! ./flow */ 19));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 0)), defaults = fork.use(__webpack_require__(/*! ../lib/shared */ 2)).defaults, def = types.Type.def, or = types.Type.or;
        def("Directive").bases("Node").build("value").field("value", def("DirectiveLiteral")), 
        def("DirectiveLiteral").bases("Node", "Expression").build("value").field("value", String, defaults["use strict"]), 
        def("BlockStatement").bases("Statement").build("body").field("body", [ def("Statement") ]).field("directives", [ def("Directive") ], defaults.emptyArray), 
        def("Program").bases("Node").build("body").field("body", [ def("Statement") ]).field("directives", [ def("Directive") ], defaults.emptyArray), 
        def("StringLiteral").bases("Literal").build("value").field("value", String), def("NumericLiteral").bases("Literal").build("value").field("value", Number), 
        def("NullLiteral").bases("Literal").build(), def("BooleanLiteral").bases("Literal").build("value").field("value", Boolean), 
        def("RegExpLiteral").bases("Literal").build("pattern", "flags").field("pattern", String).field("flags", String);
        var ObjectExpressionProperty = or(def("Property"), def("ObjectMethod"), def("ObjectProperty"), def("SpreadProperty"));
        def("ObjectExpression").bases("Expression").build("properties").field("properties", [ ObjectExpressionProperty ]), 
        def("ObjectMethod").bases("Node", "Function").build("kind", "key", "params", "body", "computed").field("kind", or("method", "get", "set")).field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("params", [ def("Pattern") ]).field("body", def("BlockStatement")).field("computed", Boolean, defaults.false).field("generator", Boolean, defaults.false).field("async", Boolean, defaults.false).field("decorators", or([ def("Decorator") ], null), defaults.null), 
        def("ObjectProperty").bases("Node").build("key", "value").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("value", or(def("Expression"), def("Pattern"))).field("computed", Boolean, defaults.false);
        var ClassBodyElement = or(def("MethodDefinition"), def("VariableDeclarator"), def("ClassPropertyDefinition"), def("ClassProperty"), def("ClassMethod"));
        def("ClassBody").bases("Declaration").build("body").field("body", [ ClassBodyElement ]), 
        def("ClassMethod").bases("Declaration", "Function").build("kind", "key", "params", "body", "computed", "static").field("kind", or("get", "set", "method", "constructor")).field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("params", [ def("Pattern") ]).field("body", def("BlockStatement")).field("computed", Boolean, defaults.false).field("static", Boolean, defaults.false).field("generator", Boolean, defaults.false).field("async", Boolean, defaults.false).field("decorators", or([ def("Decorator") ], null), defaults.null);
        var ObjectPatternProperty = or(def("Property"), def("PropertyPattern"), def("SpreadPropertyPattern"), def("SpreadProperty"), def("ObjectProperty"), def("RestProperty"));
        def("ObjectPattern").bases("Pattern").build("properties").field("properties", [ ObjectPatternProperty ]).field("decorators", or([ def("Decorator") ], null), defaults.null), 
        def("SpreadProperty").bases("Node").build("argument").field("argument", def("Expression")), 
        def("RestProperty").bases("Node").build("argument").field("argument", def("Expression")), 
        def("ForAwaitStatement").bases("Statement").build("left", "right", "body").field("left", or(def("VariableDeclaration"), def("Expression"))).field("right", def("Expression")).field("body", def("Statement"));
    };
}, /*!********************************!*\
  !*** ./~/ast-types/def/e4x.js ***!
  \********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./core */ 11));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 0)), def = types.Type.def, or = types.Type.or;
        def("XMLDefaultDeclaration").bases("Declaration").field("namespace", def("Expression")), 
        def("XMLAnyName").bases("Expression"), def("XMLQualifiedIdentifier").bases("Expression").field("left", or(def("Identifier"), def("XMLAnyName"))).field("right", or(def("Identifier"), def("Expression"))).field("computed", Boolean), 
        def("XMLFunctionQualifiedIdentifier").bases("Expression").field("right", or(def("Identifier"), def("Expression"))).field("computed", Boolean), 
        def("XMLAttributeSelector").bases("Expression").field("attribute", def("Expression")), 
        def("XMLFilterExpression").bases("Expression").field("left", def("Expression")).field("right", def("Expression")), 
        def("XMLElement").bases("XML", "Expression").field("contents", [ def("XML") ]), 
        def("XMLList").bases("XML", "Expression").field("contents", [ def("XML") ]), def("XML").bases("Node"), 
        def("XMLEscape").bases("XML").field("expression", def("Expression")), def("XMLText").bases("XML").field("text", String), 
        def("XMLStartTag").bases("XML").field("contents", [ def("XML") ]), def("XMLEndTag").bases("XML").field("contents", [ def("XML") ]), 
        def("XMLPointTag").bases("XML").field("contents", [ def("XML") ]), def("XMLName").bases("XML").field("contents", or(String, [ def("XML") ])), 
        def("XMLAttribute").bases("XML").field("value", String), def("XMLCdata").bases("XML").field("contents", String), 
        def("XMLComment").bases("XML").field("contents", String), def("XMLProcessingInstruction").bases("XML").field("target", String).field("contents", or(String, null));
    };
}, /*!************************************!*\
  !*** ./~/ast-types/def/esprima.js ***!
  \************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./es7 */ 7));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 0)), defaults = fork.use(__webpack_require__(/*! ../lib/shared */ 2)).defaults, def = types.Type.def, or = types.Type.or;
        def("VariableDeclaration").field("declarations", [ or(def("VariableDeclarator"), def("Identifier")) ]), 
        def("Property").field("value", or(def("Expression"), def("Pattern"))), def("ArrayPattern").field("elements", [ or(def("Pattern"), def("SpreadElement"), null) ]), 
        def("ObjectPattern").field("properties", [ or(def("Property"), def("PropertyPattern"), def("SpreadPropertyPattern"), def("SpreadProperty")) ]), 
        def("ExportSpecifier").bases("ModuleSpecifier").build("id", "name"), def("ExportBatchSpecifier").bases("Specifier").build(), 
        def("ImportSpecifier").bases("ModuleSpecifier").build("id", "name"), def("ImportNamespaceSpecifier").bases("ModuleSpecifier").build("id"), 
        def("ImportDefaultSpecifier").bases("ModuleSpecifier").build("id"), def("ExportDeclaration").bases("Declaration").build("default", "declaration", "specifiers", "source").field("default", Boolean).field("declaration", or(def("Declaration"), def("Expression"), null)).field("specifiers", [ or(def("ExportSpecifier"), def("ExportBatchSpecifier")) ], defaults.emptyArray).field("source", or(def("Literal"), null), defaults.null), 
        def("ImportDeclaration").bases("Declaration").build("specifiers", "source", "importKind").field("specifiers", [ or(def("ImportSpecifier"), def("ImportNamespaceSpecifier"), def("ImportDefaultSpecifier")) ], defaults.emptyArray).field("source", def("Literal")).field("importKind", or("value", "type"), function() {
            return "value";
        }), def("Block").bases("Comment").build("value", "leading", "trailing"), def("Line").bases("Comment").build("value", "leading", "trailing");
    };
}, /*!********************************!*\
  !*** ./~/ast-types/def/jsx.js ***!
  \********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./es7 */ 7));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 0)), def = types.Type.def, or = types.Type.or, defaults = fork.use(__webpack_require__(/*! ../lib/shared */ 2)).defaults;
        def("JSXAttribute").bases("Node").build("name", "value").field("name", or(def("JSXIdentifier"), def("JSXNamespacedName"))).field("value", or(def("Literal"), def("JSXExpressionContainer"), null), defaults.null), 
        def("JSXIdentifier").bases("Identifier").build("name").field("name", String), def("JSXNamespacedName").bases("Node").build("namespace", "name").field("namespace", def("JSXIdentifier")).field("name", def("JSXIdentifier")), 
        def("JSXMemberExpression").bases("MemberExpression").build("object", "property").field("object", or(def("JSXIdentifier"), def("JSXMemberExpression"))).field("property", def("JSXIdentifier")).field("computed", Boolean, defaults.false);
        var JSXElementName = or(def("JSXIdentifier"), def("JSXNamespacedName"), def("JSXMemberExpression"));
        def("JSXSpreadAttribute").bases("Node").build("argument").field("argument", def("Expression"));
        var JSXAttributes = [ or(def("JSXAttribute"), def("JSXSpreadAttribute")) ];
        def("JSXExpressionContainer").bases("Expression").build("expression").field("expression", def("Expression")), 
        def("JSXElement").bases("Expression").build("openingElement", "closingElement", "children").field("openingElement", def("JSXOpeningElement")).field("closingElement", or(def("JSXClosingElement"), null), defaults.null).field("children", [ or(def("JSXElement"), def("JSXExpressionContainer"), def("JSXText"), def("Literal")) ], defaults.emptyArray).field("name", JSXElementName, function() {
            return this.openingElement.name;
        }, !0).field("selfClosing", Boolean, function() {
            return this.openingElement.selfClosing;
        }, !0).field("attributes", JSXAttributes, function() {
            return this.openingElement.attributes;
        }, !0), def("JSXOpeningElement").bases("Node").build("name", "attributes", "selfClosing").field("name", JSXElementName).field("attributes", JSXAttributes, defaults.emptyArray).field("selfClosing", Boolean, defaults.false), 
        def("JSXClosingElement").bases("Node").build("name").field("name", JSXElementName), 
        def("JSXText").bases("Literal").build("value").field("value", String), def("JSXEmptyExpression").bases("Expression").build();
    };
}, /*!************************************!*\
  !*** ./~/ast-types/def/mozilla.js ***!
  \************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./core */ 11));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 0)), def = types.Type.def, or = types.Type.or, shared = fork.use(__webpack_require__(/*! ../lib/shared */ 2)), geq = shared.geq, defaults = shared.defaults;
        def("Function").field("body", or(def("BlockStatement"), def("Expression"))), def("ForInStatement").build("left", "right", "body", "each").field("each", Boolean, defaults.false), 
        def("ForOfStatement").bases("Statement").build("left", "right", "body").field("left", or(def("VariableDeclaration"), def("Expression"))).field("right", def("Expression")).field("body", def("Statement")), 
        def("LetStatement").bases("Statement").build("head", "body").field("head", [ def("VariableDeclarator") ]).field("body", def("Statement")), 
        def("LetExpression").bases("Expression").build("head", "body").field("head", [ def("VariableDeclarator") ]).field("body", def("Expression")), 
        def("GraphExpression").bases("Expression").build("index", "expression").field("index", geq(0)).field("expression", def("Literal")), 
        def("GraphIndexExpression").bases("Expression").build("index").field("index", geq(0));
    };
}, /*!*****************************!*\
  !*** ./~/ast-types/fork.js ***!
  \*****************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(defs) {
        function use(plugin) {
            var idx = used.indexOf(plugin);
            return idx === -1 && (idx = used.length, used.push(plugin), usedResult[idx] = plugin(fork)), 
            usedResult[idx];
        }
        var used = [], usedResult = [], fork = {};
        fork.use = use;
        var types = use(__webpack_require__(/*! ./lib/types */ 0));
        defs.forEach(use), types.finalize();
        var exports = {
            Type: types.Type,
            builtInTypes: types.builtInTypes,
            namedTypes: types.namedTypes,
            builders: types.builders,
            defineMethod: types.defineMethod,
            getFieldNames: types.getFieldNames,
            getFieldValue: types.getFieldValue,
            eachField: types.eachField,
            someField: types.someField,
            getSupertypeNames: types.getSupertypeNames,
            astNodesAreEquivalent: use(__webpack_require__(/*! ./lib/equiv */ 42)),
            finalize: types.finalize,
            Path: use(__webpack_require__(/*! ./lib/path */ 20)),
            NodePath: use(__webpack_require__(/*! ./lib/node-path */ 13)),
            PathVisitor: use(__webpack_require__(/*! ./lib/path-visitor */ 43)),
            use: use
        };
        return exports.visit = exports.PathVisitor.visit, exports;
    };
}, /*!**********************************!*\
  !*** ./~/ast-types/lib/equiv.js ***!
  \**********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        function astNodesAreEquivalent(a, b, problemPath) {
            return isArray.check(problemPath) ? problemPath.length = 0 : problemPath = null, 
            areEquivalent(a, b, problemPath);
        }
        function subscriptForProperty(property) {
            return /[_$a-z][_$a-z0-9]*/i.test(property) ? "." + property : "[" + JSON.stringify(property) + "]";
        }
        function areEquivalent(a, b, problemPath) {
            return a === b || (isArray.check(a) ? arraysAreEquivalent(a, b, problemPath) : isObject.check(a) ? objectsAreEquivalent(a, b, problemPath) : isDate.check(a) ? isDate.check(b) && +a === +b : isRegExp.check(a) ? isRegExp.check(b) && a.source === b.source && a.global === b.global && a.multiline === b.multiline && a.ignoreCase === b.ignoreCase : a == b);
        }
        function arraysAreEquivalent(a, b, problemPath) {
            isArray.assert(a);
            var aLength = a.length;
            if (!isArray.check(b) || b.length !== aLength) return problemPath && problemPath.push("length"), 
            !1;
            for (var i = 0; i < aLength; ++i) {
                if (problemPath && problemPath.push(i), i in a != i in b) return !1;
                if (!areEquivalent(a[i], b[i], problemPath)) return !1;
                if (problemPath) {
                    var problemPathTail = problemPath.pop();
                    if (problemPathTail !== i) throw new Error("" + problemPathTail);
                }
            }
            return !0;
        }
        function objectsAreEquivalent(a, b, problemPath) {
            if (isObject.assert(a), !isObject.check(b)) return !1;
            if (a.type !== b.type) return problemPath && problemPath.push("type"), !1;
            var aNames = getFieldNames(a), aNameCount = aNames.length, bNames = getFieldNames(b), bNameCount = bNames.length;
            if (aNameCount === bNameCount) {
                for (var i = 0; i < aNameCount; ++i) {
                    var name = aNames[i], aChild = getFieldValue(a, name), bChild = getFieldValue(b, name);
                    if (problemPath && problemPath.push(name), !areEquivalent(aChild, bChild, problemPath)) return !1;
                    if (problemPath) {
                        var problemPathTail = problemPath.pop();
                        if (problemPathTail !== name) throw new Error("" + problemPathTail);
                    }
                }
                return !0;
            }
            if (!problemPath) return !1;
            var seenNames = Object.create(null);
            for (i = 0; i < aNameCount; ++i) seenNames[aNames[i]] = !0;
            for (i = 0; i < bNameCount; ++i) {
                if (name = bNames[i], !hasOwn.call(seenNames, name)) return problemPath.push(name), 
                !1;
                delete seenNames[name];
            }
            for (name in seenNames) {
                problemPath.push(name);
                break;
            }
            return !1;
        }
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 0)), getFieldNames = types.getFieldNames, getFieldValue = types.getFieldValue, isArray = types.builtInTypes.array, isObject = types.builtInTypes.object, isDate = types.builtInTypes.Date, isRegExp = types.builtInTypes.RegExp, hasOwn = Object.prototype.hasOwnProperty;
        return astNodesAreEquivalent.assert = function(a, b) {
            var problemPath = [];
            if (!astNodesAreEquivalent(a, b, problemPath)) {
                if (0 !== problemPath.length) throw new Error("Nodes differ in the following path: " + problemPath.map(subscriptForProperty).join(""));
                if (a !== b) throw new Error("Nodes must be equal");
            }
        }, astNodesAreEquivalent;
    };
}, /*!*****************************************!*\
  !*** ./~/ast-types/lib/path-visitor.js ***!
  \*****************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, hasOwn = Object.prototype.hasOwnProperty;
    module.exports = function(fork) {
        function PathVisitor() {
            if (!(this instanceof PathVisitor)) throw new Error("PathVisitor constructor cannot be invoked without 'new'");
            this._reusableContextStack = [], this._methodNameTable = computeMethodNameTable(this), 
            this._shouldVisitComments = hasOwn.call(this._methodNameTable, "Block") || hasOwn.call(this._methodNameTable, "Line"), 
            this.Context = makeContextConstructor(this), this._visiting = !1, this._changeReported = !1;
        }
        function computeMethodNameTable(visitor) {
            var typeNames = Object.create(null);
            for (var methodName in visitor) /^visit[A-Z]/.test(methodName) && (typeNames[methodName.slice("visit".length)] = !0);
            for (var supertypeTable = types.computeSupertypeLookupTable(typeNames), methodNameTable = Object.create(null), typeNames = Object.keys(supertypeTable), typeNameCount = typeNames.length, i = 0; i < typeNameCount; ++i) {
                var typeName = typeNames[i];
                methodName = "visit" + supertypeTable[typeName], isFunction.check(visitor[methodName]) && (methodNameTable[typeName] = methodName);
            }
            return methodNameTable;
        }
        function extend(target, source) {
            for (var property in source) hasOwn.call(source, property) && (target[property] = source[property]);
            return target;
        }
        function visitChildren(path, visitor) {
            if (!(path instanceof NodePath)) throw new Error("");
            if (!(visitor instanceof PathVisitor)) throw new Error("");
            var value = path.value;
            if (isArray.check(value)) path.each(visitor.visitWithoutReset, visitor); else if (isObject.check(value)) {
                var childNames = types.getFieldNames(value);
                visitor._shouldVisitComments && value.comments && childNames.indexOf("comments") < 0 && childNames.push("comments");
                for (var childCount = childNames.length, childPaths = [], i = 0; i < childCount; ++i) {
                    var childName = childNames[i];
                    hasOwn.call(value, childName) || (value[childName] = types.getFieldValue(value, childName)), 
                    childPaths.push(path.get(childName));
                }
                for (var i = 0; i < childCount; ++i) visitor.visitWithoutReset(childPaths[i]);
            } else ;
            return path.value;
        }
        function makeContextConstructor(visitor) {
            function Context(path) {
                if (!(this instanceof Context)) throw new Error("");
                if (!(this instanceof PathVisitor)) throw new Error("");
                if (!(path instanceof NodePath)) throw new Error("");
                Object.defineProperty(this, "visitor", {
                    value: visitor,
                    writable: !1,
                    enumerable: !0,
                    configurable: !1
                }), this.currentPath = path, this.needToCallTraverse = !0, Object.seal(this);
            }
            if (!(visitor instanceof PathVisitor)) throw new Error("");
            var Cp = Context.prototype = Object.create(visitor);
            return Cp.constructor = Context, extend(Cp, sharedContextProtoMethods), Context;
        }
        var undefined, types = fork.use(__webpack_require__(/*! ./types */ 0)), NodePath = fork.use(__webpack_require__(/*! ./node-path */ 13)), isArray = (types.namedTypes.Printable, 
        types.builtInTypes.array), isObject = types.builtInTypes.object, isFunction = types.builtInTypes.function;
        PathVisitor.fromMethodsObject = function(methods) {
            function Visitor() {
                if (!(this instanceof Visitor)) throw new Error("Visitor constructor cannot be invoked without 'new'");
                PathVisitor.call(this);
            }
            if (methods instanceof PathVisitor) return methods;
            if (!isObject.check(methods)) return new PathVisitor();
            var Vp = Visitor.prototype = Object.create(PVp);
            return Vp.constructor = Visitor, extend(Vp, methods), extend(Visitor, PathVisitor), 
            isFunction.assert(Visitor.fromMethodsObject), isFunction.assert(Visitor.visit), 
            new Visitor();
        }, PathVisitor.visit = function(node, methods) {
            return PathVisitor.fromMethodsObject(methods).visit(node);
        };
        var PVp = PathVisitor.prototype;
        PVp.visit = function() {
            if (this._visiting) throw new Error("Recursively calling visitor.visit(path) resets visitor state. Try this.visit(path) or this.traverse(path) instead.");
            this._visiting = !0, this._changeReported = !1, this._abortRequested = !1;
            for (var argc = arguments.length, args = new Array(argc), i = 0; i < argc; ++i) args[i] = arguments[i];
            args[0] instanceof NodePath || (args[0] = new NodePath({
                root: args[0]
            }).get("root")), this.reset.apply(this, args);
            try {
                var root = this.visitWithoutReset(args[0]), didNotThrow = !0;
            } finally {
                if (this._visiting = !1, !didNotThrow && this._abortRequested) return args[0].value;
            }
            return root;
        }, PVp.AbortRequest = function() {}, PVp.abort = function() {
            var visitor = this;
            visitor._abortRequested = !0;
            var request = new visitor.AbortRequest();
            throw request.cancel = function() {
                visitor._abortRequested = !1;
            }, request;
        }, PVp.reset = function(path) {}, PVp.visitWithoutReset = function(path) {
            if (this instanceof this.Context) return this.visitor.visitWithoutReset(path);
            if (!(path instanceof NodePath)) throw new Error("");
            var value = path.value, methodName = value && "object" === ("undefined" == typeof value ? "undefined" : _typeof(value)) && "string" == typeof value.type && this._methodNameTable[value.type];
            if (!methodName) return visitChildren(path, this);
            var context = this.acquireContext(path);
            try {
                return context.invokeVisitorMethod(methodName);
            } finally {
                this.releaseContext(context);
            }
        }, PVp.acquireContext = function(path) {
            return 0 === this._reusableContextStack.length ? new this.Context(path) : this._reusableContextStack.pop().reset(path);
        }, PVp.releaseContext = function(context) {
            if (!(context instanceof this.Context)) throw new Error("");
            this._reusableContextStack.push(context), context.currentPath = null;
        }, PVp.reportChanged = function() {
            this._changeReported = !0;
        }, PVp.wasChangeReported = function() {
            return this._changeReported;
        };
        var sharedContextProtoMethods = Object.create(null);
        return sharedContextProtoMethods.reset = function(path) {
            if (!(this instanceof this.Context)) throw new Error("");
            if (!(path instanceof NodePath)) throw new Error("");
            return this.currentPath = path, this.needToCallTraverse = !0, this;
        }, sharedContextProtoMethods.invokeVisitorMethod = function(methodName) {
            if (!(this instanceof this.Context)) throw new Error("");
            if (!(this.currentPath instanceof NodePath)) throw new Error("");
            var result = this.visitor[methodName].call(this, this.currentPath);
            if (result === !1 ? this.needToCallTraverse = !1 : result !== undefined && (this.currentPath = this.currentPath.replace(result)[0], 
            this.needToCallTraverse && this.traverse(this.currentPath)), this.needToCallTraverse !== !1) throw new Error("Must either call this.traverse or return false in " + methodName);
            var path = this.currentPath;
            return path && path.value;
        }, sharedContextProtoMethods.traverse = function(path, newVisitor) {
            if (!(this instanceof this.Context)) throw new Error("");
            if (!(path instanceof NodePath)) throw new Error("");
            if (!(this.currentPath instanceof NodePath)) throw new Error("");
            return this.needToCallTraverse = !1, visitChildren(path, PathVisitor.fromMethodsObject(newVisitor || this.visitor));
        }, sharedContextProtoMethods.visit = function(path, newVisitor) {
            if (!(this instanceof this.Context)) throw new Error("");
            if (!(path instanceof NodePath)) throw new Error("");
            if (!(this.currentPath instanceof NodePath)) throw new Error("");
            return this.needToCallTraverse = !1, PathVisitor.fromMethodsObject(newVisitor || this.visitor).visitWithoutReset(path);
        }, sharedContextProtoMethods.reportChanged = function() {
            this.visitor.reportChanged();
        }, sharedContextProtoMethods.abort = function() {
            this.needToCallTraverse = !1, this.visitor.abort();
        }, PathVisitor;
    };
}, /*!**********************************!*\
  !*** ./~/ast-types/lib/scope.js ***!
  \**********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    var hasOwn = Object.prototype.hasOwnProperty;
    module.exports = function(fork) {
        function Scope(path, parentScope) {
            if (!(this instanceof Scope)) throw new Error("Scope constructor cannot be invoked without 'new'");
            if (!(path instanceof fork.use(__webpack_require__(/*! ./node-path */ 13)))) throw new Error("");
            ScopeType.assert(path.value);
            var depth;
            if (parentScope) {
                if (!(parentScope instanceof Scope)) throw new Error("");
                depth = parentScope.depth + 1;
            } else parentScope = null, depth = 0;
            Object.defineProperties(this, {
                path: {
                    value: path
                },
                node: {
                    value: path.value
                },
                isGlobal: {
                    value: !parentScope,
                    enumerable: !0
                },
                depth: {
                    value: depth
                },
                parent: {
                    value: parentScope
                },
                bindings: {
                    value: {}
                },
                types: {
                    value: {}
                }
            });
        }
        function scanScope(path, bindings, scopeTypes) {
            var node = path.value;
            ScopeType.assert(node), namedTypes.CatchClause.check(node) ? addPattern(path.get("param"), bindings) : recursiveScanScope(path, bindings, scopeTypes);
        }
        function recursiveScanScope(path, bindings, scopeTypes) {
            var node = path.value;
            path.parent && namedTypes.FunctionExpression.check(path.parent.node) && path.parent.node.id && addPattern(path.parent.get("id"), bindings), 
            node && (isArray.check(node) ? path.each(function(childPath) {
                recursiveScanChild(childPath, bindings, scopeTypes);
            }) : namedTypes.Function.check(node) ? (path.get("params").each(function(paramPath) {
                addPattern(paramPath, bindings);
            }), recursiveScanChild(path.get("body"), bindings, scopeTypes)) : namedTypes.TypeAlias && namedTypes.TypeAlias.check(node) ? addTypePattern(path.get("id"), scopeTypes) : namedTypes.VariableDeclarator.check(node) ? (addPattern(path.get("id"), bindings), 
            recursiveScanChild(path.get("init"), bindings, scopeTypes)) : "ImportSpecifier" === node.type || "ImportNamespaceSpecifier" === node.type || "ImportDefaultSpecifier" === node.type ? addPattern(path.get(node.local ? "local" : node.name ? "name" : "id"), bindings) : Node.check(node) && !Expression.check(node) && types.eachField(node, function(name, child) {
                var childPath = path.get(name);
                if (!pathHasValue(childPath, child)) throw new Error("");
                recursiveScanChild(childPath, bindings, scopeTypes);
            }));
        }
        function pathHasValue(path, value) {
            return path.value === value || !(!Array.isArray(path.value) || 0 !== path.value.length || !Array.isArray(value) || 0 !== value.length);
        }
        function recursiveScanChild(path, bindings, scopeTypes) {
            var node = path.value;
            if (!node || Expression.check(node)) ; else if (namedTypes.FunctionDeclaration.check(node) && null !== node.id) addPattern(path.get("id"), bindings); else if (namedTypes.ClassDeclaration && namedTypes.ClassDeclaration.check(node)) addPattern(path.get("id"), bindings); else if (ScopeType.check(node)) {
                if (namedTypes.CatchClause.check(node)) {
                    var catchParamName = node.param.name, hadBinding = hasOwn.call(bindings, catchParamName);
                    recursiveScanScope(path.get("body"), bindings, scopeTypes), hadBinding || delete bindings[catchParamName];
                }
            } else recursiveScanScope(path, bindings, scopeTypes);
        }
        function addPattern(patternPath, bindings) {
            var pattern = patternPath.value;
            namedTypes.Pattern.assert(pattern), namedTypes.Identifier.check(pattern) ? hasOwn.call(bindings, pattern.name) ? bindings[pattern.name].push(patternPath) : bindings[pattern.name] = [ patternPath ] : namedTypes.ObjectPattern && namedTypes.ObjectPattern.check(pattern) ? patternPath.get("properties").each(function(propertyPath) {
                var property = propertyPath.value;
                namedTypes.Pattern.check(property) ? addPattern(propertyPath, bindings) : namedTypes.Property.check(property) ? addPattern(propertyPath.get("value"), bindings) : namedTypes.SpreadProperty && namedTypes.SpreadProperty.check(property) && addPattern(propertyPath.get("argument"), bindings);
            }) : namedTypes.ArrayPattern && namedTypes.ArrayPattern.check(pattern) ? patternPath.get("elements").each(function(elementPath) {
                var element = elementPath.value;
                namedTypes.Pattern.check(element) ? addPattern(elementPath, bindings) : namedTypes.SpreadElement && namedTypes.SpreadElement.check(element) && addPattern(elementPath.get("argument"), bindings);
            }) : namedTypes.PropertyPattern && namedTypes.PropertyPattern.check(pattern) ? addPattern(patternPath.get("pattern"), bindings) : (namedTypes.SpreadElementPattern && namedTypes.SpreadElementPattern.check(pattern) || namedTypes.SpreadPropertyPattern && namedTypes.SpreadPropertyPattern.check(pattern)) && addPattern(patternPath.get("argument"), bindings);
        }
        function addTypePattern(patternPath, types) {
            var pattern = patternPath.value;
            namedTypes.Pattern.assert(pattern), namedTypes.Identifier.check(pattern) && (hasOwn.call(types, pattern.name) ? types[pattern.name].push(patternPath) : types[pattern.name] = [ patternPath ]);
        }
        var types = fork.use(__webpack_require__(/*! ./types */ 0)), Type = types.Type, namedTypes = types.namedTypes, Node = namedTypes.Node, Expression = namedTypes.Expression, isArray = types.builtInTypes.array, b = types.builders, scopeTypes = [ namedTypes.Program, namedTypes.Function, namedTypes.CatchClause ], ScopeType = Type.or.apply(Type, scopeTypes);
        Scope.isEstablishedBy = function(node) {
            return ScopeType.check(node);
        };
        var Sp = Scope.prototype;
        return Sp.didScan = !1, Sp.declares = function(name) {
            return this.scan(), hasOwn.call(this.bindings, name);
        }, Sp.declaresType = function(name) {
            return this.scan(), hasOwn.call(this.types, name);
        }, Sp.declareTemporary = function(prefix) {
            if (prefix) {
                if (!/^[a-z$_]/i.test(prefix)) throw new Error("");
            } else prefix = "t$";
            prefix += this.depth.toString(36) + "$", this.scan();
            for (var index = 0; this.declares(prefix + index); ) ++index;
            var name = prefix + index;
            return this.bindings[name] = types.builders.identifier(name);
        }, Sp.injectTemporary = function(identifier, init) {
            identifier || (identifier = this.declareTemporary());
            var bodyPath = this.path.get("body");
            return namedTypes.BlockStatement.check(bodyPath.value) && (bodyPath = bodyPath.get("body")), 
            bodyPath.unshift(b.variableDeclaration("var", [ b.variableDeclarator(identifier, init || null) ])), 
            identifier;
        }, Sp.scan = function(force) {
            if (force || !this.didScan) {
                for (var name in this.bindings) delete this.bindings[name];
                scanScope(this.path, this.bindings, this.types), this.didScan = !0;
            }
        }, Sp.getBindings = function() {
            return this.scan(), this.bindings;
        }, Sp.getTypes = function() {
            return this.scan(), this.types;
        }, Sp.lookup = function(name) {
            for (var scope = this; scope && !scope.declares(name); scope = scope.parent) ;
            return scope;
        }, Sp.lookupType = function(name) {
            for (var scope = this; scope && !scope.declaresType(name); scope = scope.parent) ;
            return scope;
        }, Sp.getGlobalScope = function() {
            for (var scope = this; !scope.isGlobal; ) scope = scope.parent;
            return scope;
        }, Scope;
    };
}, /*!***********************************!*\
  !*** ./~/esprima/dist/esprima.js ***!
  \***********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    (function(module) {
        var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__, _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
        !function(root, factory) {
            "object" === _typeof(exports) && "object" === _typeof(module) ? module.exports = factory() : (__WEBPACK_AMD_DEFINE_ARRAY__ = [], 
            __WEBPACK_AMD_DEFINE_FACTORY__ = factory, __WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof __WEBPACK_AMD_DEFINE_FACTORY__ ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, 
            !(void 0 !== __WEBPACK_AMD_DEFINE_RESULT__ && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)));
        }(void 0, function() {
            return function(modules) {
                function __webpack_require__(moduleId) {
                    if (installedModules[moduleId]) return installedModules[moduleId].exports;
                    var module = installedModules[moduleId] = {
                        exports: {},
                        id: moduleId,
                        loaded: !1
                    };
                    return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), 
                    module.loaded = !0, module.exports;
                }
                var installedModules = {};
                return __webpack_require__.m = modules, __webpack_require__.c = installedModules, 
                __webpack_require__.p = "", __webpack_require__(0);
            }([ function(module, exports, __webpack_require__) {
                function parse(code, options, delegate) {
                    var commentHandler = null, proxyDelegate = function(node, metadata) {
                        delegate && delegate(node, metadata), commentHandler && commentHandler.visit(node, metadata);
                    }, parserDelegate = "function" == typeof delegate ? proxyDelegate : null, collectComment = !1;
                    if (options) {
                        collectComment = "boolean" == typeof options.comment && options.comment;
                        var attachComment = "boolean" == typeof options.attachComment && options.attachComment;
                        (collectComment || attachComment) && (commentHandler = new comment_handler_1.CommentHandler(), 
                        commentHandler.attach = attachComment, options.comment = !0, parserDelegate = proxyDelegate);
                    }
                    var parser;
                    parser = options && "boolean" == typeof options.jsx && options.jsx ? new jsx_parser_1.JSXParser(code, options, parserDelegate) : new parser_1.Parser(code, options, parserDelegate);
                    var ast = parser.parseProgram();
                    return collectComment && (ast.comments = commentHandler.comments), parser.config.tokens && (ast.tokens = parser.tokens), 
                    parser.config.tolerant && (ast.errors = parser.errorHandler.errors), ast;
                }
                function tokenize(code, options, delegate) {
                    var tokens, tokenizer = new tokenizer_1.Tokenizer(code, options);
                    tokens = [];
                    try {
                        for (;;) {
                            var token = tokenizer.getNextToken();
                            if (!token) break;
                            delegate && (token = delegate(token)), tokens.push(token);
                        }
                    } catch (e) {
                        tokenizer.errorHandler.tolerate(e);
                    }
                    return tokenizer.errorHandler.tolerant && (tokens.errors = tokenizer.errors()), 
                    tokens;
                }
                var comment_handler_1 = __webpack_require__(1), parser_1 = __webpack_require__(3), jsx_parser_1 = __webpack_require__(11), tokenizer_1 = __webpack_require__(15);
                exports.parse = parse, exports.tokenize = tokenize;
                var syntax_1 = __webpack_require__(2);
                exports.Syntax = syntax_1.Syntax, exports.version = "3.1.2";
            }, function(module, exports, __webpack_require__) {
                var syntax_1 = __webpack_require__(2), CommentHandler = function() {
                    function CommentHandler() {
                        this.attach = !1, this.comments = [], this.stack = [], this.leading = [], this.trailing = [];
                    }
                    return CommentHandler.prototype.insertInnerComments = function(node, metadata) {
                        if (node.type === syntax_1.Syntax.BlockStatement && 0 === node.body.length) {
                            for (var innerComments = [], i = this.leading.length - 1; i >= 0; --i) {
                                var entry = this.leading[i];
                                metadata.end.offset >= entry.start && (innerComments.unshift(entry.comment), this.leading.splice(i, 1), 
                                this.trailing.splice(i, 1));
                            }
                            innerComments.length && (node.innerComments = innerComments);
                        }
                    }, CommentHandler.prototype.findTrailingComments = function(node, metadata) {
                        var trailingComments = [];
                        if (this.trailing.length > 0) {
                            for (var i = this.trailing.length - 1; i >= 0; --i) {
                                var entry_1 = this.trailing[i];
                                entry_1.start >= metadata.end.offset && trailingComments.unshift(entry_1.comment);
                            }
                            return this.trailing.length = 0, trailingComments;
                        }
                        var entry = this.stack[this.stack.length - 1];
                        if (entry && entry.node.trailingComments) {
                            var firstComment = entry.node.trailingComments[0];
                            firstComment && firstComment.range[0] >= metadata.end.offset && (trailingComments = entry.node.trailingComments, 
                            delete entry.node.trailingComments);
                        }
                        return trailingComments;
                    }, CommentHandler.prototype.findLeadingComments = function(node, metadata) {
                        for (var target, leadingComments = []; this.stack.length > 0; ) {
                            var entry = this.stack[this.stack.length - 1];
                            if (!(entry && entry.start >= metadata.start.offset)) break;
                            target = this.stack.pop().node;
                        }
                        if (target) {
                            for (var count = target.leadingComments ? target.leadingComments.length : 0, i = count - 1; i >= 0; --i) {
                                var comment = target.leadingComments[i];
                                comment.range[1] <= metadata.start.offset && (leadingComments.unshift(comment), 
                                target.leadingComments.splice(i, 1));
                            }
                            return target.leadingComments && 0 === target.leadingComments.length && delete target.leadingComments, 
                            leadingComments;
                        }
                        for (var i = this.leading.length - 1; i >= 0; --i) {
                            var entry = this.leading[i];
                            entry.start <= metadata.start.offset && (leadingComments.unshift(entry.comment), 
                            this.leading.splice(i, 1));
                        }
                        return leadingComments;
                    }, CommentHandler.prototype.visitNode = function(node, metadata) {
                        if (!(node.type === syntax_1.Syntax.Program && node.body.length > 0)) {
                            this.insertInnerComments(node, metadata);
                            var trailingComments = this.findTrailingComments(node, metadata), leadingComments = this.findLeadingComments(node, metadata);
                            leadingComments.length > 0 && (node.leadingComments = leadingComments), trailingComments.length > 0 && (node.trailingComments = trailingComments), 
                            this.stack.push({
                                node: node,
                                start: metadata.start.offset
                            });
                        }
                    }, CommentHandler.prototype.visitComment = function(node, metadata) {
                        var type = "L" === node.type[0] ? "Line" : "Block", comment = {
                            type: type,
                            value: node.value
                        };
                        if (node.range && (comment.range = node.range), node.loc && (comment.loc = node.loc), 
                        this.comments.push(comment), this.attach) {
                            var entry = {
                                comment: {
                                    type: type,
                                    value: node.value,
                                    range: [ metadata.start.offset, metadata.end.offset ]
                                },
                                start: metadata.start.offset
                            };
                            node.loc && (entry.comment.loc = node.loc), node.type = type, this.leading.push(entry), 
                            this.trailing.push(entry);
                        }
                    }, CommentHandler.prototype.visit = function(node, metadata) {
                        "LineComment" === node.type ? this.visitComment(node, metadata) : "BlockComment" === node.type ? this.visitComment(node, metadata) : this.attach && this.visitNode(node, metadata);
                    }, CommentHandler;
                }();
                exports.CommentHandler = CommentHandler;
            }, function(module, exports) {
                exports.Syntax = {
                    AssignmentExpression: "AssignmentExpression",
                    AssignmentPattern: "AssignmentPattern",
                    ArrayExpression: "ArrayExpression",
                    ArrayPattern: "ArrayPattern",
                    ArrowFunctionExpression: "ArrowFunctionExpression",
                    BlockStatement: "BlockStatement",
                    BinaryExpression: "BinaryExpression",
                    BreakStatement: "BreakStatement",
                    CallExpression: "CallExpression",
                    CatchClause: "CatchClause",
                    ClassBody: "ClassBody",
                    ClassDeclaration: "ClassDeclaration",
                    ClassExpression: "ClassExpression",
                    ConditionalExpression: "ConditionalExpression",
                    ContinueStatement: "ContinueStatement",
                    DoWhileStatement: "DoWhileStatement",
                    DebuggerStatement: "DebuggerStatement",
                    EmptyStatement: "EmptyStatement",
                    ExportAllDeclaration: "ExportAllDeclaration",
                    ExportDefaultDeclaration: "ExportDefaultDeclaration",
                    ExportNamedDeclaration: "ExportNamedDeclaration",
                    ExportSpecifier: "ExportSpecifier",
                    ExpressionStatement: "ExpressionStatement",
                    ForStatement: "ForStatement",
                    ForOfStatement: "ForOfStatement",
                    ForInStatement: "ForInStatement",
                    FunctionDeclaration: "FunctionDeclaration",
                    FunctionExpression: "FunctionExpression",
                    Identifier: "Identifier",
                    IfStatement: "IfStatement",
                    ImportDeclaration: "ImportDeclaration",
                    ImportDefaultSpecifier: "ImportDefaultSpecifier",
                    ImportNamespaceSpecifier: "ImportNamespaceSpecifier",
                    ImportSpecifier: "ImportSpecifier",
                    Literal: "Literal",
                    LabeledStatement: "LabeledStatement",
                    LogicalExpression: "LogicalExpression",
                    MemberExpression: "MemberExpression",
                    MetaProperty: "MetaProperty",
                    MethodDefinition: "MethodDefinition",
                    NewExpression: "NewExpression",
                    ObjectExpression: "ObjectExpression",
                    ObjectPattern: "ObjectPattern",
                    Program: "Program",
                    Property: "Property",
                    RestElement: "RestElement",
                    ReturnStatement: "ReturnStatement",
                    SequenceExpression: "SequenceExpression",
                    SpreadElement: "SpreadElement",
                    Super: "Super",
                    SwitchCase: "SwitchCase",
                    SwitchStatement: "SwitchStatement",
                    TaggedTemplateExpression: "TaggedTemplateExpression",
                    TemplateElement: "TemplateElement",
                    TemplateLiteral: "TemplateLiteral",
                    ThisExpression: "ThisExpression",
                    ThrowStatement: "ThrowStatement",
                    TryStatement: "TryStatement",
                    UnaryExpression: "UnaryExpression",
                    UpdateExpression: "UpdateExpression",
                    VariableDeclaration: "VariableDeclaration",
                    VariableDeclarator: "VariableDeclarator",
                    WhileStatement: "WhileStatement",
                    WithStatement: "WithStatement",
                    YieldExpression: "YieldExpression"
                };
            }, function(module, exports, __webpack_require__) {
                var assert_1 = __webpack_require__(4), messages_1 = __webpack_require__(5), error_handler_1 = __webpack_require__(6), token_1 = __webpack_require__(7), scanner_1 = __webpack_require__(8), syntax_1 = __webpack_require__(2), Node = __webpack_require__(10), ArrowParameterPlaceHolder = "ArrowParameterPlaceHolder", Parser = function() {
                    function Parser(code, options, delegate) {
                        void 0 === options && (options = {}), this.config = {
                            range: "boolean" == typeof options.range && options.range,
                            loc: "boolean" == typeof options.loc && options.loc,
                            source: null,
                            tokens: "boolean" == typeof options.tokens && options.tokens,
                            comment: "boolean" == typeof options.comment && options.comment,
                            tolerant: "boolean" == typeof options.tolerant && options.tolerant
                        }, this.config.loc && options.source && null !== options.source && (this.config.source = String(options.source)), 
                        this.delegate = delegate, this.errorHandler = new error_handler_1.ErrorHandler(), 
                        this.errorHandler.tolerant = this.config.tolerant, this.scanner = new scanner_1.Scanner(code, this.errorHandler), 
                        this.scanner.trackComment = this.config.comment, this.operatorPrecedence = {
                            ")": 0,
                            ";": 0,
                            ",": 0,
                            "=": 0,
                            "]": 0,
                            "||": 1,
                            "&&": 2,
                            "|": 3,
                            "^": 4,
                            "&": 5,
                            "==": 6,
                            "!=": 6,
                            "===": 6,
                            "!==": 6,
                            "<": 7,
                            ">": 7,
                            "<=": 7,
                            ">=": 7,
                            "<<": 8,
                            ">>": 8,
                            ">>>": 8,
                            "+": 9,
                            "-": 9,
                            "*": 11,
                            "/": 11,
                            "%": 11
                        }, this.sourceType = options && "module" === options.sourceType ? "module" : "script", 
                        this.lookahead = null, this.hasLineTerminator = !1, this.context = {
                            allowIn: !0,
                            allowYield: !0,
                            firstCoverInitializedNameError: null,
                            isAssignmentTarget: !1,
                            isBindingElement: !1,
                            inFunctionBody: !1,
                            inIteration: !1,
                            inSwitch: !1,
                            labelSet: {},
                            strict: "module" === this.sourceType
                        }, this.tokens = [], this.startMarker = {
                            index: 0,
                            lineNumber: this.scanner.lineNumber,
                            lineStart: 0
                        }, this.lastMarker = {
                            index: 0,
                            lineNumber: this.scanner.lineNumber,
                            lineStart: 0
                        }, this.nextToken(), this.lastMarker = {
                            index: this.scanner.index,
                            lineNumber: this.scanner.lineNumber,
                            lineStart: this.scanner.lineStart
                        };
                    }
                    return Parser.prototype.throwError = function(messageFormat) {
                        for (var values = [], _i = 1; _i < arguments.length; _i++) values[_i - 1] = arguments[_i];
                        var args = Array.prototype.slice.call(arguments, 1), msg = messageFormat.replace(/%(\d)/g, function(whole, idx) {
                            return assert_1.assert(idx < args.length, "Message reference must be in range"), 
                            args[idx];
                        }), index = this.lastMarker.index, line = this.lastMarker.lineNumber, column = this.lastMarker.index - this.lastMarker.lineStart + 1;
                        throw this.errorHandler.createError(index, line, column, msg);
                    }, Parser.prototype.tolerateError = function(messageFormat) {
                        for (var values = [], _i = 1; _i < arguments.length; _i++) values[_i - 1] = arguments[_i];
                        var args = Array.prototype.slice.call(arguments, 1), msg = messageFormat.replace(/%(\d)/g, function(whole, idx) {
                            return assert_1.assert(idx < args.length, "Message reference must be in range"), 
                            args[idx];
                        }), index = this.lastMarker.index, line = this.scanner.lineNumber, column = this.lastMarker.index - this.lastMarker.lineStart + 1;
                        this.errorHandler.tolerateError(index, line, column, msg);
                    }, Parser.prototype.unexpectedTokenError = function(token, message) {
                        var value, msg = message || messages_1.Messages.UnexpectedToken;
                        if (token ? (message || (msg = token.type === token_1.Token.EOF ? messages_1.Messages.UnexpectedEOS : token.type === token_1.Token.Identifier ? messages_1.Messages.UnexpectedIdentifier : token.type === token_1.Token.NumericLiteral ? messages_1.Messages.UnexpectedNumber : token.type === token_1.Token.StringLiteral ? messages_1.Messages.UnexpectedString : token.type === token_1.Token.Template ? messages_1.Messages.UnexpectedTemplate : messages_1.Messages.UnexpectedToken, 
                        token.type === token_1.Token.Keyword && (this.scanner.isFutureReservedWord(token.value) ? msg = messages_1.Messages.UnexpectedReserved : this.context.strict && this.scanner.isStrictModeReservedWord(token.value) && (msg = messages_1.Messages.StrictReservedWord))), 
                        value = token.type === token_1.Token.Template ? token.value.raw : token.value) : value = "ILLEGAL", 
                        msg = msg.replace("%0", value), token && "number" == typeof token.lineNumber) {
                            var index = token.start, line = token.lineNumber, column = token.start - this.lastMarker.lineStart + 1;
                            return this.errorHandler.createError(index, line, column, msg);
                        }
                        var index = this.lastMarker.index, line = this.lastMarker.lineNumber, column = index - this.lastMarker.lineStart + 1;
                        return this.errorHandler.createError(index, line, column, msg);
                    }, Parser.prototype.throwUnexpectedToken = function(token, message) {
                        throw this.unexpectedTokenError(token, message);
                    }, Parser.prototype.tolerateUnexpectedToken = function(token, message) {
                        this.errorHandler.tolerate(this.unexpectedTokenError(token, message));
                    }, Parser.prototype.collectComments = function() {
                        if (this.config.comment) {
                            var comments = this.scanner.scanComments();
                            if (comments.length > 0 && this.delegate) for (var i = 0; i < comments.length; ++i) {
                                var e = comments[i], node = void 0;
                                node = {
                                    type: e.multiLine ? "BlockComment" : "LineComment",
                                    value: this.scanner.source.slice(e.slice[0], e.slice[1])
                                }, this.config.range && (node.range = e.range), this.config.loc && (node.loc = e.loc);
                                var metadata = {
                                    start: {
                                        line: e.loc.start.line,
                                        column: e.loc.start.column,
                                        offset: e.range[0]
                                    },
                                    end: {
                                        line: e.loc.end.line,
                                        column: e.loc.end.column,
                                        offset: e.range[1]
                                    }
                                };
                                this.delegate(node, metadata);
                            }
                        } else this.scanner.scanComments();
                    }, Parser.prototype.getTokenRaw = function(token) {
                        return this.scanner.source.slice(token.start, token.end);
                    }, Parser.prototype.convertToken = function(token) {
                        var t;
                        return t = {
                            type: token_1.TokenName[token.type],
                            value: this.getTokenRaw(token)
                        }, this.config.range && (t.range = [ token.start, token.end ]), this.config.loc && (t.loc = {
                            start: {
                                line: this.startMarker.lineNumber,
                                column: this.startMarker.index - this.startMarker.lineStart
                            },
                            end: {
                                line: this.scanner.lineNumber,
                                column: this.scanner.index - this.scanner.lineStart
                            }
                        }), token.regex && (t.regex = token.regex), t;
                    }, Parser.prototype.nextToken = function() {
                        var token = this.lookahead;
                        this.lastMarker.index = this.scanner.index, this.lastMarker.lineNumber = this.scanner.lineNumber, 
                        this.lastMarker.lineStart = this.scanner.lineStart, this.collectComments(), this.startMarker.index = this.scanner.index, 
                        this.startMarker.lineNumber = this.scanner.lineNumber, this.startMarker.lineStart = this.scanner.lineStart;
                        var next;
                        return next = this.scanner.lex(), this.hasLineTerminator = !(!token || !next) && token.lineNumber !== next.lineNumber, 
                        next && this.context.strict && next.type === token_1.Token.Identifier && this.scanner.isStrictModeReservedWord(next.value) && (next.type = token_1.Token.Keyword), 
                        this.lookahead = next, this.config.tokens && next.type !== token_1.Token.EOF && this.tokens.push(this.convertToken(next)), 
                        token;
                    }, Parser.prototype.nextRegexToken = function() {
                        this.collectComments();
                        var token = this.scanner.scanRegExp();
                        return this.config.tokens && (this.tokens.pop(), this.tokens.push(this.convertToken(token))), 
                        this.lookahead = token, this.nextToken(), token;
                    }, Parser.prototype.createNode = function() {
                        return {
                            index: this.startMarker.index,
                            line: this.startMarker.lineNumber,
                            column: this.startMarker.index - this.startMarker.lineStart
                        };
                    }, Parser.prototype.startNode = function(token) {
                        return {
                            index: token.start,
                            line: token.lineNumber,
                            column: token.start - token.lineStart
                        };
                    }, Parser.prototype.finalize = function(meta, node) {
                        if (this.config.range && (node.range = [ meta.index, this.lastMarker.index ]), this.config.loc && (node.loc = {
                            start: {
                                line: meta.line,
                                column: meta.column
                            },
                            end: {
                                line: this.lastMarker.lineNumber,
                                column: this.lastMarker.index - this.lastMarker.lineStart
                            }
                        }, this.config.source && (node.loc.source = this.config.source)), this.delegate) {
                            var metadata = {
                                start: {
                                    line: meta.line,
                                    column: meta.column,
                                    offset: meta.index
                                },
                                end: {
                                    line: this.lastMarker.lineNumber,
                                    column: this.lastMarker.index - this.lastMarker.lineStart,
                                    offset: this.lastMarker.index
                                }
                            };
                            this.delegate(node, metadata);
                        }
                        return node;
                    }, Parser.prototype.expect = function(value) {
                        var token = this.nextToken();
                        token.type === token_1.Token.Punctuator && token.value === value || this.throwUnexpectedToken(token);
                    }, Parser.prototype.expectCommaSeparator = function() {
                        if (this.config.tolerant) {
                            var token = this.lookahead;
                            token.type === token_1.Token.Punctuator && "," === token.value ? this.nextToken() : token.type === token_1.Token.Punctuator && ";" === token.value ? (this.nextToken(), 
                            this.tolerateUnexpectedToken(token)) : this.tolerateUnexpectedToken(token, messages_1.Messages.UnexpectedToken);
                        } else this.expect(",");
                    }, Parser.prototype.expectKeyword = function(keyword) {
                        var token = this.nextToken();
                        token.type === token_1.Token.Keyword && token.value === keyword || this.throwUnexpectedToken(token);
                    }, Parser.prototype.match = function(value) {
                        return this.lookahead.type === token_1.Token.Punctuator && this.lookahead.value === value;
                    }, Parser.prototype.matchKeyword = function(keyword) {
                        return this.lookahead.type === token_1.Token.Keyword && this.lookahead.value === keyword;
                    }, Parser.prototype.matchContextualKeyword = function(keyword) {
                        return this.lookahead.type === token_1.Token.Identifier && this.lookahead.value === keyword;
                    }, Parser.prototype.matchAssign = function() {
                        if (this.lookahead.type !== token_1.Token.Punctuator) return !1;
                        var op = this.lookahead.value;
                        return "=" === op || "*=" === op || "**=" === op || "/=" === op || "%=" === op || "+=" === op || "-=" === op || "<<=" === op || ">>=" === op || ">>>=" === op || "&=" === op || "^=" === op || "|=" === op;
                    }, Parser.prototype.isolateCoverGrammar = function(parseFunction) {
                        var previousIsBindingElement = this.context.isBindingElement, previousIsAssignmentTarget = this.context.isAssignmentTarget, previousFirstCoverInitializedNameError = this.context.firstCoverInitializedNameError;
                        this.context.isBindingElement = !0, this.context.isAssignmentTarget = !0, this.context.firstCoverInitializedNameError = null;
                        var result = parseFunction.call(this);
                        return null !== this.context.firstCoverInitializedNameError && this.throwUnexpectedToken(this.context.firstCoverInitializedNameError), 
                        this.context.isBindingElement = previousIsBindingElement, this.context.isAssignmentTarget = previousIsAssignmentTarget, 
                        this.context.firstCoverInitializedNameError = previousFirstCoverInitializedNameError, 
                        result;
                    }, Parser.prototype.inheritCoverGrammar = function(parseFunction) {
                        var previousIsBindingElement = this.context.isBindingElement, previousIsAssignmentTarget = this.context.isAssignmentTarget, previousFirstCoverInitializedNameError = this.context.firstCoverInitializedNameError;
                        this.context.isBindingElement = !0, this.context.isAssignmentTarget = !0, this.context.firstCoverInitializedNameError = null;
                        var result = parseFunction.call(this);
                        return this.context.isBindingElement = this.context.isBindingElement && previousIsBindingElement, 
                        this.context.isAssignmentTarget = this.context.isAssignmentTarget && previousIsAssignmentTarget, 
                        this.context.firstCoverInitializedNameError = previousFirstCoverInitializedNameError || this.context.firstCoverInitializedNameError, 
                        result;
                    }, Parser.prototype.consumeSemicolon = function() {
                        this.match(";") ? this.nextToken() : this.hasLineTerminator || (this.lookahead.type === token_1.Token.EOF || this.match("}") || this.throwUnexpectedToken(this.lookahead), 
                        this.lastMarker.index = this.startMarker.index, this.lastMarker.lineNumber = this.startMarker.lineNumber, 
                        this.lastMarker.lineStart = this.startMarker.lineStart);
                    }, Parser.prototype.parsePrimaryExpression = function() {
                        var expr, value, token, raw, node = this.createNode();
                        switch (this.lookahead.type) {
                          case token_1.Token.Identifier:
                            "module" === this.sourceType && "await" === this.lookahead.value && this.tolerateUnexpectedToken(this.lookahead), 
                            expr = this.finalize(node, new Node.Identifier(this.nextToken().value));
                            break;

                          case token_1.Token.NumericLiteral:
                          case token_1.Token.StringLiteral:
                            this.context.strict && this.lookahead.octal && this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.StrictOctalLiteral), 
                            this.context.isAssignmentTarget = !1, this.context.isBindingElement = !1, token = this.nextToken(), 
                            raw = this.getTokenRaw(token), expr = this.finalize(node, new Node.Literal(token.value, raw));
                            break;

                          case token_1.Token.BooleanLiteral:
                            this.context.isAssignmentTarget = !1, this.context.isBindingElement = !1, token = this.nextToken(), 
                            token.value = "true" === token.value, raw = this.getTokenRaw(token), expr = this.finalize(node, new Node.Literal(token.value, raw));
                            break;

                          case token_1.Token.NullLiteral:
                            this.context.isAssignmentTarget = !1, this.context.isBindingElement = !1, token = this.nextToken(), 
                            token.value = null, raw = this.getTokenRaw(token), expr = this.finalize(node, new Node.Literal(token.value, raw));
                            break;

                          case token_1.Token.Template:
                            expr = this.parseTemplateLiteral();
                            break;

                          case token_1.Token.Punctuator:
                            switch (value = this.lookahead.value) {
                              case "(":
                                this.context.isBindingElement = !1, expr = this.inheritCoverGrammar(this.parseGroupExpression);
                                break;

                              case "[":
                                expr = this.inheritCoverGrammar(this.parseArrayInitializer);
                                break;

                              case "{":
                                expr = this.inheritCoverGrammar(this.parseObjectInitializer);
                                break;

                              case "/":
                              case "/=":
                                this.context.isAssignmentTarget = !1, this.context.isBindingElement = !1, this.scanner.index = this.startMarker.index, 
                                token = this.nextRegexToken(), raw = this.getTokenRaw(token), expr = this.finalize(node, new Node.RegexLiteral(token.value, raw, token.regex));
                                break;

                              default:
                                this.throwUnexpectedToken(this.nextToken());
                            }
                            break;

                          case token_1.Token.Keyword:
                            !this.context.strict && this.context.allowYield && this.matchKeyword("yield") ? expr = this.parseIdentifierName() : !this.context.strict && this.matchKeyword("let") ? expr = this.finalize(node, new Node.Identifier(this.nextToken().value)) : (this.context.isAssignmentTarget = !1, 
                            this.context.isBindingElement = !1, this.matchKeyword("function") ? expr = this.parseFunctionExpression() : this.matchKeyword("this") ? (this.nextToken(), 
                            expr = this.finalize(node, new Node.ThisExpression())) : this.matchKeyword("class") ? expr = this.parseClassExpression() : this.throwUnexpectedToken(this.nextToken()));
                            break;

                          default:
                            this.throwUnexpectedToken(this.nextToken());
                        }
                        return expr;
                    }, Parser.prototype.parseSpreadElement = function() {
                        var node = this.createNode();
                        this.expect("...");
                        var arg = this.inheritCoverGrammar(this.parseAssignmentExpression);
                        return this.finalize(node, new Node.SpreadElement(arg));
                    }, Parser.prototype.parseArrayInitializer = function() {
                        var node = this.createNode(), elements = [];
                        for (this.expect("["); !this.match("]"); ) if (this.match(",")) this.nextToken(), 
                        elements.push(null); else if (this.match("...")) {
                            var element = this.parseSpreadElement();
                            this.match("]") || (this.context.isAssignmentTarget = !1, this.context.isBindingElement = !1, 
                            this.expect(",")), elements.push(element);
                        } else elements.push(this.inheritCoverGrammar(this.parseAssignmentExpression)), 
                        this.match("]") || this.expect(",");
                        return this.expect("]"), this.finalize(node, new Node.ArrayExpression(elements));
                    }, Parser.prototype.parsePropertyMethod = function(params) {
                        this.context.isAssignmentTarget = !1, this.context.isBindingElement = !1;
                        var previousStrict = this.context.strict, body = this.isolateCoverGrammar(this.parseFunctionSourceElements);
                        return this.context.strict && params.firstRestricted && this.tolerateUnexpectedToken(params.firstRestricted, params.message), 
                        this.context.strict && params.stricted && this.tolerateUnexpectedToken(params.stricted, params.message), 
                        this.context.strict = previousStrict, body;
                    }, Parser.prototype.parsePropertyMethodFunction = function() {
                        var isGenerator = !1, node = this.createNode(), previousAllowYield = this.context.allowYield;
                        this.context.allowYield = !1;
                        var params = this.parseFormalParameters(), method = this.parsePropertyMethod(params);
                        return this.context.allowYield = previousAllowYield, this.finalize(node, new Node.FunctionExpression(null, params.params, method, isGenerator));
                    }, Parser.prototype.parseObjectPropertyKey = function() {
                        var node = this.createNode(), token = this.nextToken(), key = null;
                        switch (token.type) {
                          case token_1.Token.StringLiteral:
                          case token_1.Token.NumericLiteral:
                            this.context.strict && token.octal && this.tolerateUnexpectedToken(token, messages_1.Messages.StrictOctalLiteral);
                            var raw = this.getTokenRaw(token);
                            key = this.finalize(node, new Node.Literal(token.value, raw));
                            break;

                          case token_1.Token.Identifier:
                          case token_1.Token.BooleanLiteral:
                          case token_1.Token.NullLiteral:
                          case token_1.Token.Keyword:
                            key = this.finalize(node, new Node.Identifier(token.value));
                            break;

                          case token_1.Token.Punctuator:
                            "[" === token.value ? (key = this.isolateCoverGrammar(this.parseAssignmentExpression), 
                            this.expect("]")) : this.throwUnexpectedToken(token);
                            break;

                          default:
                            this.throwUnexpectedToken(token);
                        }
                        return key;
                    }, Parser.prototype.isPropertyKey = function(key, value) {
                        return key.type === syntax_1.Syntax.Identifier && key.name === value || key.type === syntax_1.Syntax.Literal && key.value === value;
                    }, Parser.prototype.parseObjectProperty = function(hasProto) {
                        var kind, key, value, node = this.createNode(), token = this.lookahead, computed = !1, method = !1, shorthand = !1;
                        token.type === token_1.Token.Identifier ? (this.nextToken(), key = this.finalize(node, new Node.Identifier(token.value))) : this.match("*") ? this.nextToken() : (computed = this.match("["), 
                        key = this.parseObjectPropertyKey());
                        var lookaheadPropertyKey = this.qualifiedPropertyName(this.lookahead);
                        if (token.type === token_1.Token.Identifier && "get" === token.value && lookaheadPropertyKey) kind = "get", 
                        computed = this.match("["), key = this.parseObjectPropertyKey(), this.context.allowYield = !1, 
                        value = this.parseGetterMethod(); else if (token.type === token_1.Token.Identifier && "set" === token.value && lookaheadPropertyKey) kind = "set", 
                        computed = this.match("["), key = this.parseObjectPropertyKey(), value = this.parseSetterMethod(); else if (token.type === token_1.Token.Punctuator && "*" === token.value && lookaheadPropertyKey) kind = "init", 
                        computed = this.match("["), key = this.parseObjectPropertyKey(), value = this.parseGeneratorMethod(), 
                        method = !0; else if (key || this.throwUnexpectedToken(this.lookahead), kind = "init", 
                        this.match(":")) !computed && this.isPropertyKey(key, "__proto__") && (hasProto.value && this.tolerateError(messages_1.Messages.DuplicateProtoProperty), 
                        hasProto.value = !0), this.nextToken(), value = this.inheritCoverGrammar(this.parseAssignmentExpression); else if (this.match("(")) value = this.parsePropertyMethodFunction(), 
                        method = !0; else if (token.type === token_1.Token.Identifier) {
                            var id = this.finalize(node, new Node.Identifier(token.value));
                            if (this.match("=")) {
                                this.context.firstCoverInitializedNameError = this.lookahead, this.nextToken(), 
                                shorthand = !0;
                                var init = this.isolateCoverGrammar(this.parseAssignmentExpression);
                                value = this.finalize(node, new Node.AssignmentPattern(id, init));
                            } else shorthand = !0, value = id;
                        } else this.throwUnexpectedToken(this.nextToken());
                        return this.finalize(node, new Node.Property(kind, key, computed, value, method, shorthand));
                    }, Parser.prototype.parseObjectInitializer = function() {
                        var node = this.createNode();
                        this.expect("{");
                        for (var properties = [], hasProto = {
                            value: !1
                        }; !this.match("}"); ) properties.push(this.parseObjectProperty(hasProto)), this.match("}") || this.expectCommaSeparator();
                        return this.expect("}"), this.finalize(node, new Node.ObjectExpression(properties));
                    }, Parser.prototype.parseTemplateHead = function() {
                        assert_1.assert(this.lookahead.head, "Template literal must start with a template head");
                        var node = this.createNode(), token = this.nextToken(), value = {
                            raw: token.value.raw,
                            cooked: token.value.cooked
                        };
                        return this.finalize(node, new Node.TemplateElement(value, token.tail));
                    }, Parser.prototype.parseTemplateElement = function() {
                        this.lookahead.type !== token_1.Token.Template && this.throwUnexpectedToken();
                        var node = this.createNode(), token = this.nextToken(), value = {
                            raw: token.value.raw,
                            cooked: token.value.cooked
                        };
                        return this.finalize(node, new Node.TemplateElement(value, token.tail));
                    }, Parser.prototype.parseTemplateLiteral = function() {
                        var node = this.createNode(), expressions = [], quasis = [], quasi = this.parseTemplateHead();
                        for (quasis.push(quasi); !quasi.tail; ) expressions.push(this.parseExpression()), 
                        quasi = this.parseTemplateElement(), quasis.push(quasi);
                        return this.finalize(node, new Node.TemplateLiteral(quasis, expressions));
                    }, Parser.prototype.reinterpretExpressionAsPattern = function(expr) {
                        switch (expr.type) {
                          case syntax_1.Syntax.Identifier:
                          case syntax_1.Syntax.MemberExpression:
                          case syntax_1.Syntax.RestElement:
                          case syntax_1.Syntax.AssignmentPattern:
                            break;

                          case syntax_1.Syntax.SpreadElement:
                            expr.type = syntax_1.Syntax.RestElement, this.reinterpretExpressionAsPattern(expr.argument);
                            break;

                          case syntax_1.Syntax.ArrayExpression:
                            expr.type = syntax_1.Syntax.ArrayPattern;
                            for (var i = 0; i < expr.elements.length; i++) null !== expr.elements[i] && this.reinterpretExpressionAsPattern(expr.elements[i]);
                            break;

                          case syntax_1.Syntax.ObjectExpression:
                            expr.type = syntax_1.Syntax.ObjectPattern;
                            for (var i = 0; i < expr.properties.length; i++) this.reinterpretExpressionAsPattern(expr.properties[i].value);
                            break;

                          case syntax_1.Syntax.AssignmentExpression:
                            expr.type = syntax_1.Syntax.AssignmentPattern, delete expr.operator, this.reinterpretExpressionAsPattern(expr.left);
                        }
                    }, Parser.prototype.parseGroupExpression = function() {
                        var expr;
                        if (this.expect("("), this.match(")")) this.nextToken(), this.match("=>") || this.expect("=>"), 
                        expr = {
                            type: ArrowParameterPlaceHolder,
                            params: []
                        }; else {
                            var startToken = this.lookahead, params = [];
                            if (this.match("...")) expr = this.parseRestElement(params), this.expect(")"), this.match("=>") || this.expect("=>"), 
                            expr = {
                                type: ArrowParameterPlaceHolder,
                                params: [ expr ]
                            }; else {
                                var arrow = !1;
                                if (this.context.isBindingElement = !0, expr = this.inheritCoverGrammar(this.parseAssignmentExpression), 
                                this.match(",")) {
                                    var expressions = [];
                                    for (this.context.isAssignmentTarget = !1, expressions.push(expr); this.startMarker.index < this.scanner.length && this.match(","); ) {
                                        if (this.nextToken(), this.match("...")) {
                                            this.context.isBindingElement || this.throwUnexpectedToken(this.lookahead), expressions.push(this.parseRestElement(params)), 
                                            this.expect(")"), this.match("=>") || this.expect("=>"), this.context.isBindingElement = !1;
                                            for (var i = 0; i < expressions.length; i++) this.reinterpretExpressionAsPattern(expressions[i]);
                                            arrow = !0, expr = {
                                                type: ArrowParameterPlaceHolder,
                                                params: expressions
                                            };
                                        } else expressions.push(this.inheritCoverGrammar(this.parseAssignmentExpression));
                                        if (arrow) break;
                                    }
                                    arrow || (expr = this.finalize(this.startNode(startToken), new Node.SequenceExpression(expressions)));
                                }
                                if (!arrow) {
                                    if (this.expect(")"), this.match("=>") && (expr.type === syntax_1.Syntax.Identifier && "yield" === expr.name && (arrow = !0, 
                                    expr = {
                                        type: ArrowParameterPlaceHolder,
                                        params: [ expr ]
                                    }), !arrow)) {
                                        if (this.context.isBindingElement || this.throwUnexpectedToken(this.lookahead), 
                                        expr.type === syntax_1.Syntax.SequenceExpression) for (var i = 0; i < expr.expressions.length; i++) this.reinterpretExpressionAsPattern(expr.expressions[i]); else this.reinterpretExpressionAsPattern(expr);
                                        var params_1 = expr.type === syntax_1.Syntax.SequenceExpression ? expr.expressions : [ expr ];
                                        expr = {
                                            type: ArrowParameterPlaceHolder,
                                            params: params_1
                                        };
                                    }
                                    this.context.isBindingElement = !1;
                                }
                            }
                        }
                        return expr;
                    }, Parser.prototype.parseArguments = function() {
                        this.expect("(");
                        var args = [];
                        if (!this.match(")")) for (;;) {
                            var expr = this.match("...") ? this.parseSpreadElement() : this.isolateCoverGrammar(this.parseAssignmentExpression);
                            if (args.push(expr), this.match(")")) break;
                            this.expectCommaSeparator();
                        }
                        return this.expect(")"), args;
                    }, Parser.prototype.isIdentifierName = function(token) {
                        return token.type === token_1.Token.Identifier || token.type === token_1.Token.Keyword || token.type === token_1.Token.BooleanLiteral || token.type === token_1.Token.NullLiteral;
                    }, Parser.prototype.parseIdentifierName = function() {
                        var node = this.createNode(), token = this.nextToken();
                        return this.isIdentifierName(token) || this.throwUnexpectedToken(token), this.finalize(node, new Node.Identifier(token.value));
                    }, Parser.prototype.parseNewExpression = function() {
                        var node = this.createNode(), id = this.parseIdentifierName();
                        assert_1.assert("new" === id.name, "New expression must start with `new`");
                        var expr;
                        if (this.match(".")) if (this.nextToken(), this.lookahead.type === token_1.Token.Identifier && this.context.inFunctionBody && "target" === this.lookahead.value) {
                            var property = this.parseIdentifierName();
                            expr = new Node.MetaProperty(id, property);
                        } else this.throwUnexpectedToken(this.lookahead); else {
                            var callee = this.isolateCoverGrammar(this.parseLeftHandSideExpression), args = this.match("(") ? this.parseArguments() : [];
                            expr = new Node.NewExpression(callee, args), this.context.isAssignmentTarget = !1, 
                            this.context.isBindingElement = !1;
                        }
                        return this.finalize(node, expr);
                    }, Parser.prototype.parseLeftHandSideExpressionAllowCall = function() {
                        var startToken = this.lookahead, previousAllowIn = this.context.allowIn;
                        this.context.allowIn = !0;
                        var expr;
                        for (this.matchKeyword("super") && this.context.inFunctionBody ? (expr = this.createNode(), 
                        this.nextToken(), expr = this.finalize(expr, new Node.Super()), this.match("(") || this.match(".") || this.match("[") || this.throwUnexpectedToken(this.lookahead)) : expr = this.inheritCoverGrammar(this.matchKeyword("new") ? this.parseNewExpression : this.parsePrimaryExpression); ;) if (this.match(".")) {
                            this.context.isBindingElement = !1, this.context.isAssignmentTarget = !0, this.expect(".");
                            var property = this.parseIdentifierName();
                            expr = this.finalize(this.startNode(startToken), new Node.StaticMemberExpression(expr, property));
                        } else if (this.match("(")) {
                            this.context.isBindingElement = !1, this.context.isAssignmentTarget = !1;
                            var args = this.parseArguments();
                            expr = this.finalize(this.startNode(startToken), new Node.CallExpression(expr, args));
                        } else if (this.match("[")) {
                            this.context.isBindingElement = !1, this.context.isAssignmentTarget = !0, this.expect("[");
                            var property = this.isolateCoverGrammar(this.parseExpression);
                            this.expect("]"), expr = this.finalize(this.startNode(startToken), new Node.ComputedMemberExpression(expr, property));
                        } else {
                            if (this.lookahead.type !== token_1.Token.Template || !this.lookahead.head) break;
                            var quasi = this.parseTemplateLiteral();
                            expr = this.finalize(this.startNode(startToken), new Node.TaggedTemplateExpression(expr, quasi));
                        }
                        return this.context.allowIn = previousAllowIn, expr;
                    }, Parser.prototype.parseSuper = function() {
                        var node = this.createNode();
                        return this.expectKeyword("super"), this.match("[") || this.match(".") || this.throwUnexpectedToken(this.lookahead), 
                        this.finalize(node, new Node.Super());
                    }, Parser.prototype.parseLeftHandSideExpression = function() {
                        assert_1.assert(this.context.allowIn, "callee of new expression always allow in keyword.");
                        for (var node = this.startNode(this.lookahead), expr = this.matchKeyword("super") && this.context.inFunctionBody ? this.parseSuper() : this.inheritCoverGrammar(this.matchKeyword("new") ? this.parseNewExpression : this.parsePrimaryExpression); ;) if (this.match("[")) {
                            this.context.isBindingElement = !1, this.context.isAssignmentTarget = !0, this.expect("[");
                            var property = this.isolateCoverGrammar(this.parseExpression);
                            this.expect("]"), expr = this.finalize(node, new Node.ComputedMemberExpression(expr, property));
                        } else if (this.match(".")) {
                            this.context.isBindingElement = !1, this.context.isAssignmentTarget = !0, this.expect(".");
                            var property = this.parseIdentifierName();
                            expr = this.finalize(node, new Node.StaticMemberExpression(expr, property));
                        } else {
                            if (this.lookahead.type !== token_1.Token.Template || !this.lookahead.head) break;
                            var quasi = this.parseTemplateLiteral();
                            expr = this.finalize(node, new Node.TaggedTemplateExpression(expr, quasi));
                        }
                        return expr;
                    }, Parser.prototype.parseUpdateExpression = function() {
                        var expr, startToken = this.lookahead;
                        if (this.match("++") || this.match("--")) {
                            var node = this.startNode(startToken), token = this.nextToken();
                            expr = this.inheritCoverGrammar(this.parseUnaryExpression), this.context.strict && expr.type === syntax_1.Syntax.Identifier && this.scanner.isRestrictedWord(expr.name) && this.tolerateError(messages_1.Messages.StrictLHSPrefix), 
                            this.context.isAssignmentTarget || this.tolerateError(messages_1.Messages.InvalidLHSInAssignment);
                            var prefix = !0;
                            expr = this.finalize(node, new Node.UpdateExpression(token.value, expr, prefix)), 
                            this.context.isAssignmentTarget = !1, this.context.isBindingElement = !1;
                        } else if (expr = this.inheritCoverGrammar(this.parseLeftHandSideExpressionAllowCall), 
                        !this.hasLineTerminator && this.lookahead.type === token_1.Token.Punctuator && (this.match("++") || this.match("--"))) {
                            this.context.strict && expr.type === syntax_1.Syntax.Identifier && this.scanner.isRestrictedWord(expr.name) && this.tolerateError(messages_1.Messages.StrictLHSPostfix), 
                            this.context.isAssignmentTarget || this.tolerateError(messages_1.Messages.InvalidLHSInAssignment), 
                            this.context.isAssignmentTarget = !1, this.context.isBindingElement = !1;
                            var operator = this.nextToken().value, prefix = !1;
                            expr = this.finalize(this.startNode(startToken), new Node.UpdateExpression(operator, expr, prefix));
                        }
                        return expr;
                    }, Parser.prototype.parseUnaryExpression = function() {
                        var expr;
                        if (this.match("+") || this.match("-") || this.match("~") || this.match("!") || this.matchKeyword("delete") || this.matchKeyword("void") || this.matchKeyword("typeof")) {
                            var node = this.startNode(this.lookahead), token = this.nextToken();
                            expr = this.inheritCoverGrammar(this.parseUnaryExpression), expr = this.finalize(node, new Node.UnaryExpression(token.value, expr)), 
                            this.context.strict && "delete" === expr.operator && expr.argument.type === syntax_1.Syntax.Identifier && this.tolerateError(messages_1.Messages.StrictDelete), 
                            this.context.isAssignmentTarget = !1, this.context.isBindingElement = !1;
                        } else expr = this.parseUpdateExpression();
                        return expr;
                    }, Parser.prototype.parseExponentiationExpression = function() {
                        var startToken = this.lookahead, expr = this.inheritCoverGrammar(this.parseUnaryExpression);
                        if (expr.type !== syntax_1.Syntax.UnaryExpression && this.match("**")) {
                            this.nextToken(), this.context.isAssignmentTarget = !1, this.context.isBindingElement = !1;
                            var left = expr, right = this.isolateCoverGrammar(this.parseExponentiationExpression);
                            expr = this.finalize(this.startNode(startToken), new Node.BinaryExpression("**", left, right));
                        }
                        return expr;
                    }, Parser.prototype.binaryPrecedence = function(token) {
                        var precedence, op = token.value;
                        return precedence = token.type === token_1.Token.Punctuator ? this.operatorPrecedence[op] || 0 : token.type === token_1.Token.Keyword && ("instanceof" === op || this.context.allowIn && "in" === op) ? 7 : 0;
                    }, Parser.prototype.parseBinaryExpression = function() {
                        var startToken = this.lookahead, expr = this.inheritCoverGrammar(this.parseExponentiationExpression), token = this.lookahead, prec = this.binaryPrecedence(token);
                        if (prec > 0) {
                            this.nextToken(), token.prec = prec, this.context.isAssignmentTarget = !1, this.context.isBindingElement = !1;
                            for (var markers = [ startToken, this.lookahead ], left = expr, right = this.isolateCoverGrammar(this.parseExponentiationExpression), stack = [ left, token, right ]; ;) {
                                if (prec = this.binaryPrecedence(this.lookahead), prec <= 0) break;
                                for (;stack.length > 2 && prec <= stack[stack.length - 2].prec; ) {
                                    right = stack.pop();
                                    var operator = stack.pop().value;
                                    left = stack.pop(), markers.pop();
                                    var node = this.startNode(markers[markers.length - 1]);
                                    stack.push(this.finalize(node, new Node.BinaryExpression(operator, left, right)));
                                }
                                token = this.nextToken(), token.prec = prec, stack.push(token), markers.push(this.lookahead), 
                                stack.push(this.isolateCoverGrammar(this.parseExponentiationExpression));
                            }
                            var i = stack.length - 1;
                            for (expr = stack[i], markers.pop(); i > 1; ) {
                                var node = this.startNode(markers.pop());
                                expr = this.finalize(node, new Node.BinaryExpression(stack[i - 1].value, stack[i - 2], expr)), 
                                i -= 2;
                            }
                        }
                        return expr;
                    }, Parser.prototype.parseConditionalExpression = function() {
                        var startToken = this.lookahead, expr = this.inheritCoverGrammar(this.parseBinaryExpression);
                        if (this.match("?")) {
                            this.nextToken();
                            var previousAllowIn = this.context.allowIn;
                            this.context.allowIn = !0;
                            var consequent = this.isolateCoverGrammar(this.parseAssignmentExpression);
                            this.context.allowIn = previousAllowIn, this.expect(":");
                            var alternate = this.isolateCoverGrammar(this.parseAssignmentExpression);
                            expr = this.finalize(this.startNode(startToken), new Node.ConditionalExpression(expr, consequent, alternate)), 
                            this.context.isAssignmentTarget = !1, this.context.isBindingElement = !1;
                        }
                        return expr;
                    }, Parser.prototype.checkPatternParam = function(options, param) {
                        switch (param.type) {
                          case syntax_1.Syntax.Identifier:
                            this.validateParam(options, param, param.name);
                            break;

                          case syntax_1.Syntax.RestElement:
                            this.checkPatternParam(options, param.argument);
                            break;

                          case syntax_1.Syntax.AssignmentPattern:
                            this.checkPatternParam(options, param.left);
                            break;

                          case syntax_1.Syntax.ArrayPattern:
                            for (var i = 0; i < param.elements.length; i++) null !== param.elements[i] && this.checkPatternParam(options, param.elements[i]);
                            break;

                          case syntax_1.Syntax.YieldExpression:
                            break;

                          default:
                            assert_1.assert(param.type === syntax_1.Syntax.ObjectPattern, "Invalid type");
                            for (var i = 0; i < param.properties.length; i++) this.checkPatternParam(options, param.properties[i].value);
                        }
                    }, Parser.prototype.reinterpretAsCoverFormalsList = function(expr) {
                        var options, params = [ expr ];
                        switch (expr.type) {
                          case syntax_1.Syntax.Identifier:
                            break;

                          case ArrowParameterPlaceHolder:
                            params = expr.params;
                            break;

                          default:
                            return null;
                        }
                        options = {
                            paramSet: {}
                        };
                        for (var i = 0; i < params.length; ++i) {
                            var param = params[i];
                            param.type === syntax_1.Syntax.AssignmentPattern && param.right.type === syntax_1.Syntax.YieldExpression && (param.right.argument && this.throwUnexpectedToken(this.lookahead), 
                            param.right.type = syntax_1.Syntax.Identifier, param.right.name = "yield", delete param.right.argument, 
                            delete param.right.delegate), this.checkPatternParam(options, param), params[i] = param;
                        }
                        if (this.context.strict || !this.context.allowYield) for (var i = 0; i < params.length; ++i) {
                            var param = params[i];
                            param.type === syntax_1.Syntax.YieldExpression && this.throwUnexpectedToken(this.lookahead);
                        }
                        if (options.message === messages_1.Messages.StrictParamDupe) {
                            var token = this.context.strict ? options.stricted : options.firstRestricted;
                            this.throwUnexpectedToken(token, options.message);
                        }
                        return {
                            params: params,
                            stricted: options.stricted,
                            firstRestricted: options.firstRestricted,
                            message: options.message
                        };
                    }, Parser.prototype.parseAssignmentExpression = function() {
                        var expr;
                        if (!this.context.allowYield && this.matchKeyword("yield")) expr = this.parseYieldExpression(); else {
                            var startToken = this.lookahead, token = startToken;
                            if (expr = this.parseConditionalExpression(), expr.type === ArrowParameterPlaceHolder || this.match("=>")) {
                                this.context.isAssignmentTarget = !1, this.context.isBindingElement = !1;
                                var list = this.reinterpretAsCoverFormalsList(expr);
                                if (list) {
                                    this.hasLineTerminator && this.tolerateUnexpectedToken(this.lookahead), this.context.firstCoverInitializedNameError = null;
                                    var previousStrict = this.context.strict, previousAllowYield = this.context.allowYield;
                                    this.context.allowYield = !0;
                                    var node = this.startNode(startToken);
                                    this.expect("=>");
                                    var body = this.match("{") ? this.parseFunctionSourceElements() : this.isolateCoverGrammar(this.parseAssignmentExpression), expression = body.type !== syntax_1.Syntax.BlockStatement;
                                    this.context.strict && list.firstRestricted && this.throwUnexpectedToken(list.firstRestricted, list.message), 
                                    this.context.strict && list.stricted && this.tolerateUnexpectedToken(list.stricted, list.message), 
                                    expr = this.finalize(node, new Node.ArrowFunctionExpression(list.params, body, expression)), 
                                    this.context.strict = previousStrict, this.context.allowYield = previousAllowYield;
                                }
                            } else if (this.matchAssign()) {
                                if (this.context.isAssignmentTarget || this.tolerateError(messages_1.Messages.InvalidLHSInAssignment), 
                                this.context.strict && expr.type === syntax_1.Syntax.Identifier) {
                                    var id = expr;
                                    this.scanner.isRestrictedWord(id.name) && this.tolerateUnexpectedToken(token, messages_1.Messages.StrictLHSAssignment), 
                                    this.scanner.isStrictModeReservedWord(id.name) && this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord);
                                }
                                this.match("=") ? this.reinterpretExpressionAsPattern(expr) : (this.context.isAssignmentTarget = !1, 
                                this.context.isBindingElement = !1), token = this.nextToken();
                                var right = this.isolateCoverGrammar(this.parseAssignmentExpression);
                                expr = this.finalize(this.startNode(startToken), new Node.AssignmentExpression(token.value, expr, right)), 
                                this.context.firstCoverInitializedNameError = null;
                            }
                        }
                        return expr;
                    }, Parser.prototype.parseExpression = function() {
                        var startToken = this.lookahead, expr = this.isolateCoverGrammar(this.parseAssignmentExpression);
                        if (this.match(",")) {
                            var expressions = [];
                            for (expressions.push(expr); this.startMarker.index < this.scanner.length && this.match(","); ) this.nextToken(), 
                            expressions.push(this.isolateCoverGrammar(this.parseAssignmentExpression));
                            expr = this.finalize(this.startNode(startToken), new Node.SequenceExpression(expressions));
                        }
                        return expr;
                    }, Parser.prototype.parseStatementListItem = function() {
                        var statement = null;
                        if (this.context.isAssignmentTarget = !0, this.context.isBindingElement = !0, this.lookahead.type === token_1.Token.Keyword) switch (this.lookahead.value) {
                          case "export":
                            "module" !== this.sourceType && this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.IllegalExportDeclaration), 
                            statement = this.parseExportDeclaration();
                            break;

                          case "import":
                            "module" !== this.sourceType && this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.IllegalImportDeclaration), 
                            statement = this.parseImportDeclaration();
                            break;

                          case "const":
                            statement = this.parseLexicalDeclaration({
                                inFor: !1
                            });
                            break;

                          case "function":
                            statement = this.parseFunctionDeclaration();
                            break;

                          case "class":
                            statement = this.parseClassDeclaration();
                            break;

                          case "let":
                            statement = this.isLexicalDeclaration() ? this.parseLexicalDeclaration({
                                inFor: !1
                            }) : this.parseStatement();
                            break;

                          default:
                            statement = this.parseStatement();
                        } else statement = this.parseStatement();
                        return statement;
                    }, Parser.prototype.parseBlock = function() {
                        var node = this.createNode();
                        this.expect("{");
                        for (var block = []; ;) {
                            if (this.match("}")) break;
                            block.push(this.parseStatementListItem());
                        }
                        return this.expect("}"), this.finalize(node, new Node.BlockStatement(block));
                    }, Parser.prototype.parseLexicalBinding = function(kind, options) {
                        var node = this.createNode(), params = [], id = this.parsePattern(params, kind);
                        this.context.strict && id.type === syntax_1.Syntax.Identifier && this.scanner.isRestrictedWord(id.name) && this.tolerateError(messages_1.Messages.StrictVarName);
                        var init = null;
                        return "const" === kind ? this.matchKeyword("in") || this.matchContextualKeyword("of") || (this.expect("="), 
                        init = this.isolateCoverGrammar(this.parseAssignmentExpression)) : (!options.inFor && id.type !== syntax_1.Syntax.Identifier || this.match("=")) && (this.expect("="), 
                        init = this.isolateCoverGrammar(this.parseAssignmentExpression)), this.finalize(node, new Node.VariableDeclarator(id, init));
                    }, Parser.prototype.parseBindingList = function(kind, options) {
                        for (var list = [ this.parseLexicalBinding(kind, options) ]; this.match(","); ) this.nextToken(), 
                        list.push(this.parseLexicalBinding(kind, options));
                        return list;
                    }, Parser.prototype.isLexicalDeclaration = function() {
                        var previousIndex = this.scanner.index, previousLineNumber = this.scanner.lineNumber, previousLineStart = this.scanner.lineStart;
                        this.collectComments();
                        var next = this.scanner.lex();
                        return this.scanner.index = previousIndex, this.scanner.lineNumber = previousLineNumber, 
                        this.scanner.lineStart = previousLineStart, next.type === token_1.Token.Identifier || next.type === token_1.Token.Punctuator && "[" === next.value || next.type === token_1.Token.Punctuator && "{" === next.value || next.type === token_1.Token.Keyword && "let" === next.value || next.type === token_1.Token.Keyword && "yield" === next.value;
                    }, Parser.prototype.parseLexicalDeclaration = function(options) {
                        var node = this.createNode(), kind = this.nextToken().value;
                        assert_1.assert("let" === kind || "const" === kind, "Lexical declaration must be either let or const");
                        var declarations = this.parseBindingList(kind, options);
                        return this.consumeSemicolon(), this.finalize(node, new Node.VariableDeclaration(declarations, kind));
                    }, Parser.prototype.parseBindingRestElement = function(params, kind) {
                        var node = this.createNode();
                        this.expect("..."), params.push(this.lookahead);
                        var arg = this.parseVariableIdentifier(kind);
                        return this.finalize(node, new Node.RestElement(arg));
                    }, Parser.prototype.parseArrayPattern = function(params, kind) {
                        var node = this.createNode();
                        this.expect("[");
                        for (var elements = []; !this.match("]"); ) if (this.match(",")) this.nextToken(), 
                        elements.push(null); else {
                            if (this.match("...")) {
                                elements.push(this.parseBindingRestElement(params, kind));
                                break;
                            }
                            elements.push(this.parsePatternWithDefault(params, kind)), this.match("]") || this.expect(",");
                        }
                        return this.expect("]"), this.finalize(node, new Node.ArrayPattern(elements));
                    }, Parser.prototype.parsePropertyPattern = function(params, kind) {
                        var key, value, node = this.createNode(), computed = !1, shorthand = !1, method = !1;
                        if (this.lookahead.type === token_1.Token.Identifier) {
                            var keyToken = this.lookahead;
                            key = this.parseVariableIdentifier();
                            var init = this.finalize(node, new Node.Identifier(keyToken.value));
                            if (this.match("=")) {
                                params.push(keyToken), shorthand = !0, this.nextToken();
                                var expr = this.parseAssignmentExpression();
                                value = this.finalize(this.startNode(keyToken), new Node.AssignmentPattern(init, expr));
                            } else this.match(":") ? (this.expect(":"), value = this.parsePatternWithDefault(params, kind)) : (params.push(keyToken), 
                            shorthand = !0, value = init);
                        } else computed = this.match("["), key = this.parseObjectPropertyKey(), this.expect(":"), 
                        value = this.parsePatternWithDefault(params, kind);
                        return this.finalize(node, new Node.Property("init", key, computed, value, method, shorthand));
                    }, Parser.prototype.parseObjectPattern = function(params, kind) {
                        var node = this.createNode(), properties = [];
                        for (this.expect("{"); !this.match("}"); ) properties.push(this.parsePropertyPattern(params, kind)), 
                        this.match("}") || this.expect(",");
                        return this.expect("}"), this.finalize(node, new Node.ObjectPattern(properties));
                    }, Parser.prototype.parsePattern = function(params, kind) {
                        var pattern;
                        return this.match("[") ? pattern = this.parseArrayPattern(params, kind) : this.match("{") ? pattern = this.parseObjectPattern(params, kind) : (!this.matchKeyword("let") || "const" !== kind && "let" !== kind || this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.UnexpectedToken), 
                        params.push(this.lookahead), pattern = this.parseVariableIdentifier(kind)), pattern;
                    }, Parser.prototype.parsePatternWithDefault = function(params, kind) {
                        var startToken = this.lookahead, pattern = this.parsePattern(params, kind);
                        if (this.match("=")) {
                            this.nextToken();
                            var previousAllowYield = this.context.allowYield;
                            this.context.allowYield = !0;
                            var right = this.isolateCoverGrammar(this.parseAssignmentExpression);
                            this.context.allowYield = previousAllowYield, pattern = this.finalize(this.startNode(startToken), new Node.AssignmentPattern(pattern, right));
                        }
                        return pattern;
                    }, Parser.prototype.parseVariableIdentifier = function(kind) {
                        var node = this.createNode(), token = this.nextToken();
                        return token.type === token_1.Token.Keyword && "yield" === token.value ? (this.context.strict && this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord), 
                        this.context.allowYield || this.throwUnexpectedToken(token)) : token.type !== token_1.Token.Identifier ? this.context.strict && token.type === token_1.Token.Keyword && this.scanner.isStrictModeReservedWord(token.value) ? this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord) : (this.context.strict || "let" !== token.value || "var" !== kind) && this.throwUnexpectedToken(token) : "module" === this.sourceType && token.type === token_1.Token.Identifier && "await" === token.value && this.tolerateUnexpectedToken(token), 
                        this.finalize(node, new Node.Identifier(token.value));
                    }, Parser.prototype.parseVariableDeclaration = function(options) {
                        var node = this.createNode(), params = [], id = this.parsePattern(params, "var");
                        this.context.strict && id.type === syntax_1.Syntax.Identifier && this.scanner.isRestrictedWord(id.name) && this.tolerateError(messages_1.Messages.StrictVarName);
                        var init = null;
                        return this.match("=") ? (this.nextToken(), init = this.isolateCoverGrammar(this.parseAssignmentExpression)) : id.type === syntax_1.Syntax.Identifier || options.inFor || this.expect("="), 
                        this.finalize(node, new Node.VariableDeclarator(id, init));
                    }, Parser.prototype.parseVariableDeclarationList = function(options) {
                        var opt = {
                            inFor: options.inFor
                        }, list = [];
                        for (list.push(this.parseVariableDeclaration(opt)); this.match(","); ) this.nextToken(), 
                        list.push(this.parseVariableDeclaration(opt));
                        return list;
                    }, Parser.prototype.parseVariableStatement = function() {
                        var node = this.createNode();
                        this.expectKeyword("var");
                        var declarations = this.parseVariableDeclarationList({
                            inFor: !1
                        });
                        return this.consumeSemicolon(), this.finalize(node, new Node.VariableDeclaration(declarations, "var"));
                    }, Parser.prototype.parseEmptyStatement = function() {
                        var node = this.createNode();
                        return this.expect(";"), this.finalize(node, new Node.EmptyStatement());
                    }, Parser.prototype.parseExpressionStatement = function() {
                        var node = this.createNode(), expr = this.parseExpression();
                        return this.consumeSemicolon(), this.finalize(node, new Node.ExpressionStatement(expr));
                    }, Parser.prototype.parseIfStatement = function() {
                        var consequent, node = this.createNode(), alternate = null;
                        this.expectKeyword("if"), this.expect("(");
                        var test = this.parseExpression();
                        return !this.match(")") && this.config.tolerant ? (this.tolerateUnexpectedToken(this.nextToken()), 
                        consequent = this.finalize(this.createNode(), new Node.EmptyStatement())) : (this.expect(")"), 
                        consequent = this.parseStatement(), this.matchKeyword("else") && (this.nextToken(), 
                        alternate = this.parseStatement())), this.finalize(node, new Node.IfStatement(test, consequent, alternate));
                    }, Parser.prototype.parseDoWhileStatement = function() {
                        var node = this.createNode();
                        this.expectKeyword("do");
                        var previousInIteration = this.context.inIteration;
                        this.context.inIteration = !0;
                        var body = this.parseStatement();
                        this.context.inIteration = previousInIteration, this.expectKeyword("while"), this.expect("(");
                        var test = this.parseExpression();
                        return this.expect(")"), this.match(";") && this.nextToken(), this.finalize(node, new Node.DoWhileStatement(body, test));
                    }, Parser.prototype.parseWhileStatement = function() {
                        var body, node = this.createNode();
                        this.expectKeyword("while"), this.expect("(");
                        var test = this.parseExpression();
                        if (!this.match(")") && this.config.tolerant) this.tolerateUnexpectedToken(this.nextToken()), 
                        body = this.finalize(this.createNode(), new Node.EmptyStatement()); else {
                            this.expect(")");
                            var previousInIteration = this.context.inIteration;
                            this.context.inIteration = !0, body = this.parseStatement(), this.context.inIteration = previousInIteration;
                        }
                        return this.finalize(node, new Node.WhileStatement(test, body));
                    }, Parser.prototype.parseForStatement = function() {
                        var left, right, init = null, test = null, update = null, forIn = !0, node = this.createNode();
                        if (this.expectKeyword("for"), this.expect("("), this.match(";")) this.nextToken(); else if (this.matchKeyword("var")) {
                            init = this.createNode(), this.nextToken();
                            var previousAllowIn = this.context.allowIn;
                            this.context.allowIn = !1;
                            var declarations = this.parseVariableDeclarationList({
                                inFor: !0
                            });
                            if (this.context.allowIn = previousAllowIn, 1 === declarations.length && this.matchKeyword("in")) {
                                var decl = declarations[0];
                                decl.init && (decl.id.type === syntax_1.Syntax.ArrayPattern || decl.id.type === syntax_1.Syntax.ObjectPattern || this.context.strict) && this.tolerateError(messages_1.Messages.ForInOfLoopInitializer, "for-in"), 
                                init = this.finalize(init, new Node.VariableDeclaration(declarations, "var")), this.nextToken(), 
                                left = init, right = this.parseExpression(), init = null;
                            } else 1 === declarations.length && null === declarations[0].init && this.matchContextualKeyword("of") ? (init = this.finalize(init, new Node.VariableDeclaration(declarations, "var")), 
                            this.nextToken(), left = init, right = this.parseAssignmentExpression(), init = null, 
                            forIn = !1) : (init = this.finalize(init, new Node.VariableDeclaration(declarations, "var")), 
                            this.expect(";"));
                        } else if (this.matchKeyword("const") || this.matchKeyword("let")) {
                            init = this.createNode();
                            var kind = this.nextToken().value;
                            if (this.context.strict || "in" !== this.lookahead.value) {
                                var previousAllowIn = this.context.allowIn;
                                this.context.allowIn = !1;
                                var declarations = this.parseBindingList(kind, {
                                    inFor: !0
                                });
                                this.context.allowIn = previousAllowIn, 1 === declarations.length && null === declarations[0].init && this.matchKeyword("in") ? (init = this.finalize(init, new Node.VariableDeclaration(declarations, kind)), 
                                this.nextToken(), left = init, right = this.parseExpression(), init = null) : 1 === declarations.length && null === declarations[0].init && this.matchContextualKeyword("of") ? (init = this.finalize(init, new Node.VariableDeclaration(declarations, kind)), 
                                this.nextToken(), left = init, right = this.parseAssignmentExpression(), init = null, 
                                forIn = !1) : (this.consumeSemicolon(), init = this.finalize(init, new Node.VariableDeclaration(declarations, kind)));
                            } else init = this.finalize(init, new Node.Identifier(kind)), this.nextToken(), 
                            left = init, right = this.parseExpression(), init = null;
                        } else {
                            var initStartToken = this.lookahead, previousAllowIn = this.context.allowIn;
                            if (this.context.allowIn = !1, init = this.inheritCoverGrammar(this.parseAssignmentExpression), 
                            this.context.allowIn = previousAllowIn, this.matchKeyword("in")) this.context.isAssignmentTarget && init.type !== syntax_1.Syntax.AssignmentExpression || this.tolerateError(messages_1.Messages.InvalidLHSInForIn), 
                            this.nextToken(), this.reinterpretExpressionAsPattern(init), left = init, right = this.parseExpression(), 
                            init = null; else if (this.matchContextualKeyword("of")) this.context.isAssignmentTarget && init.type !== syntax_1.Syntax.AssignmentExpression || this.tolerateError(messages_1.Messages.InvalidLHSInForLoop), 
                            this.nextToken(), this.reinterpretExpressionAsPattern(init), left = init, right = this.parseAssignmentExpression(), 
                            init = null, forIn = !1; else {
                                if (this.match(",")) {
                                    for (var initSeq = [ init ]; this.match(","); ) this.nextToken(), initSeq.push(this.isolateCoverGrammar(this.parseAssignmentExpression));
                                    init = this.finalize(this.startNode(initStartToken), new Node.SequenceExpression(initSeq));
                                }
                                this.expect(";");
                            }
                        }
                        "undefined" == typeof left && (this.match(";") || (test = this.parseExpression()), 
                        this.expect(";"), this.match(")") || (update = this.parseExpression()));
                        var body;
                        if (!this.match(")") && this.config.tolerant) this.tolerateUnexpectedToken(this.nextToken()), 
                        body = this.finalize(this.createNode(), new Node.EmptyStatement()); else {
                            this.expect(")");
                            var previousInIteration = this.context.inIteration;
                            this.context.inIteration = !0, body = this.isolateCoverGrammar(this.parseStatement), 
                            this.context.inIteration = previousInIteration;
                        }
                        return "undefined" == typeof left ? this.finalize(node, new Node.ForStatement(init, test, update, body)) : forIn ? this.finalize(node, new Node.ForInStatement(left, right, body)) : this.finalize(node, new Node.ForOfStatement(left, right, body));
                    }, Parser.prototype.parseContinueStatement = function() {
                        var node = this.createNode();
                        this.expectKeyword("continue");
                        var label = null;
                        if (this.lookahead.type === token_1.Token.Identifier && !this.hasLineTerminator) {
                            label = this.parseVariableIdentifier();
                            var key = "$" + label.name;
                            Object.prototype.hasOwnProperty.call(this.context.labelSet, key) || this.throwError(messages_1.Messages.UnknownLabel, label.name);
                        }
                        return this.consumeSemicolon(), null !== label || this.context.inIteration || this.throwError(messages_1.Messages.IllegalContinue), 
                        this.finalize(node, new Node.ContinueStatement(label));
                    }, Parser.prototype.parseBreakStatement = function() {
                        var node = this.createNode();
                        this.expectKeyword("break");
                        var label = null;
                        if (this.lookahead.type === token_1.Token.Identifier && !this.hasLineTerminator) {
                            label = this.parseVariableIdentifier();
                            var key = "$" + label.name;
                            Object.prototype.hasOwnProperty.call(this.context.labelSet, key) || this.throwError(messages_1.Messages.UnknownLabel, label.name);
                        }
                        return this.consumeSemicolon(), null !== label || this.context.inIteration || this.context.inSwitch || this.throwError(messages_1.Messages.IllegalBreak), 
                        this.finalize(node, new Node.BreakStatement(label));
                    }, Parser.prototype.parseReturnStatement = function() {
                        this.context.inFunctionBody || this.tolerateError(messages_1.Messages.IllegalReturn);
                        var node = this.createNode();
                        this.expectKeyword("return");
                        var hasArgument = !this.match(";") && !this.match("}") && !this.hasLineTerminator && this.lookahead.type !== token_1.Token.EOF, argument = hasArgument ? this.parseExpression() : null;
                        return this.consumeSemicolon(), this.finalize(node, new Node.ReturnStatement(argument));
                    }, Parser.prototype.parseWithStatement = function() {
                        this.context.strict && this.tolerateError(messages_1.Messages.StrictModeWith);
                        var node = this.createNode();
                        this.expectKeyword("with"), this.expect("(");
                        var object = this.parseExpression();
                        this.expect(")");
                        var body = this.parseStatement();
                        return this.finalize(node, new Node.WithStatement(object, body));
                    }, Parser.prototype.parseSwitchCase = function() {
                        var test, node = this.createNode();
                        this.matchKeyword("default") ? (this.nextToken(), test = null) : (this.expectKeyword("case"), 
                        test = this.parseExpression()), this.expect(":");
                        for (var consequent = []; ;) {
                            if (this.match("}") || this.matchKeyword("default") || this.matchKeyword("case")) break;
                            consequent.push(this.parseStatementListItem());
                        }
                        return this.finalize(node, new Node.SwitchCase(test, consequent));
                    }, Parser.prototype.parseSwitchStatement = function() {
                        var node = this.createNode();
                        this.expectKeyword("switch"), this.expect("(");
                        var discriminant = this.parseExpression();
                        this.expect(")");
                        var previousInSwitch = this.context.inSwitch;
                        this.context.inSwitch = !0;
                        var cases = [], defaultFound = !1;
                        for (this.expect("{"); ;) {
                            if (this.match("}")) break;
                            var clause = this.parseSwitchCase();
                            null === clause.test && (defaultFound && this.throwError(messages_1.Messages.MultipleDefaultsInSwitch), 
                            defaultFound = !0), cases.push(clause);
                        }
                        return this.expect("}"), this.context.inSwitch = previousInSwitch, this.finalize(node, new Node.SwitchStatement(discriminant, cases));
                    }, Parser.prototype.parseLabelledStatement = function() {
                        var statement, node = this.createNode(), expr = this.parseExpression();
                        if (expr.type === syntax_1.Syntax.Identifier && this.match(":")) {
                            this.nextToken();
                            var id = expr, key = "$" + id.name;
                            Object.prototype.hasOwnProperty.call(this.context.labelSet, key) && this.throwError(messages_1.Messages.Redeclaration, "Label", id.name), 
                            this.context.labelSet[key] = !0;
                            var labeledBody = this.parseStatement();
                            delete this.context.labelSet[key], statement = new Node.LabeledStatement(id, labeledBody);
                        } else this.consumeSemicolon(), statement = new Node.ExpressionStatement(expr);
                        return this.finalize(node, statement);
                    }, Parser.prototype.parseThrowStatement = function() {
                        var node = this.createNode();
                        this.expectKeyword("throw"), this.hasLineTerminator && this.throwError(messages_1.Messages.NewlineAfterThrow);
                        var argument = this.parseExpression();
                        return this.consumeSemicolon(), this.finalize(node, new Node.ThrowStatement(argument));
                    }, Parser.prototype.parseCatchClause = function() {
                        var node = this.createNode();
                        this.expectKeyword("catch"), this.expect("("), this.match(")") && this.throwUnexpectedToken(this.lookahead);
                        for (var params = [], param = this.parsePattern(params), paramMap = {}, i = 0; i < params.length; i++) {
                            var key = "$" + params[i].value;
                            Object.prototype.hasOwnProperty.call(paramMap, key) && this.tolerateError(messages_1.Messages.DuplicateBinding, params[i].value), 
                            paramMap[key] = !0;
                        }
                        this.context.strict && param.type === syntax_1.Syntax.Identifier && this.scanner.isRestrictedWord(param.name) && this.tolerateError(messages_1.Messages.StrictCatchVariable), 
                        this.expect(")");
                        var body = this.parseBlock();
                        return this.finalize(node, new Node.CatchClause(param, body));
                    }, Parser.prototype.parseFinallyClause = function() {
                        return this.expectKeyword("finally"), this.parseBlock();
                    }, Parser.prototype.parseTryStatement = function() {
                        var node = this.createNode();
                        this.expectKeyword("try");
                        var block = this.parseBlock(), handler = this.matchKeyword("catch") ? this.parseCatchClause() : null, finalizer = this.matchKeyword("finally") ? this.parseFinallyClause() : null;
                        return handler || finalizer || this.throwError(messages_1.Messages.NoCatchOrFinally), 
                        this.finalize(node, new Node.TryStatement(block, handler, finalizer));
                    }, Parser.prototype.parseDebuggerStatement = function() {
                        var node = this.createNode();
                        return this.expectKeyword("debugger"), this.consumeSemicolon(), this.finalize(node, new Node.DebuggerStatement());
                    }, Parser.prototype.parseStatement = function() {
                        var statement = null;
                        switch (this.lookahead.type) {
                          case token_1.Token.BooleanLiteral:
                          case token_1.Token.NullLiteral:
                          case token_1.Token.NumericLiteral:
                          case token_1.Token.StringLiteral:
                          case token_1.Token.Template:
                          case token_1.Token.RegularExpression:
                            statement = this.parseExpressionStatement();
                            break;

                          case token_1.Token.Punctuator:
                            var value = this.lookahead.value;
                            statement = "{" === value ? this.parseBlock() : "(" === value ? this.parseExpressionStatement() : ";" === value ? this.parseEmptyStatement() : this.parseExpressionStatement();
                            break;

                          case token_1.Token.Identifier:
                            statement = this.parseLabelledStatement();
                            break;

                          case token_1.Token.Keyword:
                            switch (this.lookahead.value) {
                              case "break":
                                statement = this.parseBreakStatement();
                                break;

                              case "continue":
                                statement = this.parseContinueStatement();
                                break;

                              case "debugger":
                                statement = this.parseDebuggerStatement();
                                break;

                              case "do":
                                statement = this.parseDoWhileStatement();
                                break;

                              case "for":
                                statement = this.parseForStatement();
                                break;

                              case "function":
                                statement = this.parseFunctionDeclaration();
                                break;

                              case "if":
                                statement = this.parseIfStatement();
                                break;

                              case "return":
                                statement = this.parseReturnStatement();
                                break;

                              case "switch":
                                statement = this.parseSwitchStatement();
                                break;

                              case "throw":
                                statement = this.parseThrowStatement();
                                break;

                              case "try":
                                statement = this.parseTryStatement();
                                break;

                              case "var":
                                statement = this.parseVariableStatement();
                                break;

                              case "while":
                                statement = this.parseWhileStatement();
                                break;

                              case "with":
                                statement = this.parseWithStatement();
                                break;

                              default:
                                statement = this.parseExpressionStatement();
                            }
                            break;

                          default:
                            this.throwUnexpectedToken(this.lookahead);
                        }
                        return statement;
                    }, Parser.prototype.parseFunctionSourceElements = function() {
                        var node = this.createNode();
                        this.expect("{");
                        var body = this.parseDirectivePrologues(), previousLabelSet = this.context.labelSet, previousInIteration = this.context.inIteration, previousInSwitch = this.context.inSwitch, previousInFunctionBody = this.context.inFunctionBody;
                        for (this.context.labelSet = {}, this.context.inIteration = !1, this.context.inSwitch = !1, 
                        this.context.inFunctionBody = !0; this.startMarker.index < this.scanner.length && !this.match("}"); ) body.push(this.parseStatementListItem());
                        return this.expect("}"), this.context.labelSet = previousLabelSet, this.context.inIteration = previousInIteration, 
                        this.context.inSwitch = previousInSwitch, this.context.inFunctionBody = previousInFunctionBody, 
                        this.finalize(node, new Node.BlockStatement(body));
                    }, Parser.prototype.validateParam = function(options, param, name) {
                        var key = "$" + name;
                        this.context.strict ? (this.scanner.isRestrictedWord(name) && (options.stricted = param, 
                        options.message = messages_1.Messages.StrictParamName), Object.prototype.hasOwnProperty.call(options.paramSet, key) && (options.stricted = param, 
                        options.message = messages_1.Messages.StrictParamDupe)) : options.firstRestricted || (this.scanner.isRestrictedWord(name) ? (options.firstRestricted = param, 
                        options.message = messages_1.Messages.StrictParamName) : this.scanner.isStrictModeReservedWord(name) ? (options.firstRestricted = param, 
                        options.message = messages_1.Messages.StrictReservedWord) : Object.prototype.hasOwnProperty.call(options.paramSet, key) && (options.stricted = param, 
                        options.message = messages_1.Messages.StrictParamDupe)), "function" == typeof Object.defineProperty ? Object.defineProperty(options.paramSet, key, {
                            value: !0,
                            enumerable: !0,
                            writable: !0,
                            configurable: !0
                        }) : options.paramSet[key] = !0;
                    }, Parser.prototype.parseRestElement = function(params) {
                        var node = this.createNode();
                        this.nextToken(), this.match("{") && this.throwError(messages_1.Messages.ObjectPatternAsRestParameter), 
                        params.push(this.lookahead);
                        var param = this.parseVariableIdentifier();
                        return this.match("=") && this.throwError(messages_1.Messages.DefaultRestParameter), 
                        this.match(")") || this.throwError(messages_1.Messages.ParameterAfterRestParameter), 
                        this.finalize(node, new Node.RestElement(param));
                    }, Parser.prototype.parseFormalParameter = function(options) {
                        var param, params = [], token = this.lookahead;
                        if ("..." === token.value) return param = this.parseRestElement(params), this.validateParam(options, param.argument, param.argument.name), 
                        options.params.push(param), !1;
                        param = this.parsePatternWithDefault(params);
                        for (var i = 0; i < params.length; i++) this.validateParam(options, params[i], params[i].value);
                        return options.params.push(param), !this.match(")");
                    }, Parser.prototype.parseFormalParameters = function(firstRestricted) {
                        var options;
                        if (options = {
                            params: [],
                            firstRestricted: firstRestricted
                        }, this.expect("("), !this.match(")")) for (options.paramSet = {}; this.startMarker.index < this.scanner.length && this.parseFormalParameter(options); ) this.expect(",");
                        return this.expect(")"), {
                            params: options.params,
                            stricted: options.stricted,
                            firstRestricted: options.firstRestricted,
                            message: options.message
                        };
                    }, Parser.prototype.parseFunctionDeclaration = function(identifierIsOptional) {
                        var node = this.createNode();
                        this.expectKeyword("function");
                        var isGenerator = this.match("*");
                        isGenerator && this.nextToken();
                        var message, id = null, firstRestricted = null;
                        if (!identifierIsOptional || !this.match("(")) {
                            var token = this.lookahead;
                            id = this.parseVariableIdentifier(), this.context.strict ? this.scanner.isRestrictedWord(token.value) && this.tolerateUnexpectedToken(token, messages_1.Messages.StrictFunctionName) : this.scanner.isRestrictedWord(token.value) ? (firstRestricted = token, 
                            message = messages_1.Messages.StrictFunctionName) : this.scanner.isStrictModeReservedWord(token.value) && (firstRestricted = token, 
                            message = messages_1.Messages.StrictReservedWord);
                        }
                        var previousAllowYield = this.context.allowYield;
                        this.context.allowYield = !isGenerator;
                        var formalParameters = this.parseFormalParameters(firstRestricted), params = formalParameters.params, stricted = formalParameters.stricted;
                        firstRestricted = formalParameters.firstRestricted, formalParameters.message && (message = formalParameters.message);
                        var previousStrict = this.context.strict, body = this.parseFunctionSourceElements();
                        return this.context.strict && firstRestricted && this.throwUnexpectedToken(firstRestricted, message), 
                        this.context.strict && stricted && this.tolerateUnexpectedToken(stricted, message), 
                        this.context.strict = previousStrict, this.context.allowYield = previousAllowYield, 
                        this.finalize(node, new Node.FunctionDeclaration(id, params, body, isGenerator));
                    }, Parser.prototype.parseFunctionExpression = function() {
                        var node = this.createNode();
                        this.expectKeyword("function");
                        var isGenerator = this.match("*");
                        isGenerator && this.nextToken();
                        var message, firstRestricted, id = null, previousAllowYield = this.context.allowYield;
                        if (this.context.allowYield = !isGenerator, !this.match("(")) {
                            var token = this.lookahead;
                            id = this.context.strict || isGenerator || !this.matchKeyword("yield") ? this.parseVariableIdentifier() : this.parseIdentifierName(), 
                            this.context.strict ? this.scanner.isRestrictedWord(token.value) && this.tolerateUnexpectedToken(token, messages_1.Messages.StrictFunctionName) : this.scanner.isRestrictedWord(token.value) ? (firstRestricted = token, 
                            message = messages_1.Messages.StrictFunctionName) : this.scanner.isStrictModeReservedWord(token.value) && (firstRestricted = token, 
                            message = messages_1.Messages.StrictReservedWord);
                        }
                        var formalParameters = this.parseFormalParameters(firstRestricted), params = formalParameters.params, stricted = formalParameters.stricted;
                        firstRestricted = formalParameters.firstRestricted, formalParameters.message && (message = formalParameters.message);
                        var previousStrict = this.context.strict, body = this.parseFunctionSourceElements();
                        return this.context.strict && firstRestricted && this.throwUnexpectedToken(firstRestricted, message), 
                        this.context.strict && stricted && this.tolerateUnexpectedToken(stricted, message), 
                        this.context.strict = previousStrict, this.context.allowYield = previousAllowYield, 
                        this.finalize(node, new Node.FunctionExpression(id, params, body, isGenerator));
                    }, Parser.prototype.parseDirective = function() {
                        var token = this.lookahead, directive = null, node = this.createNode(), expr = this.parseExpression();
                        return expr.type === syntax_1.Syntax.Literal && (directive = this.getTokenRaw(token).slice(1, -1)), 
                        this.consumeSemicolon(), this.finalize(node, directive ? new Node.Directive(expr, directive) : new Node.ExpressionStatement(expr));
                    }, Parser.prototype.parseDirectivePrologues = function() {
                        for (var firstRestricted = null, body = []; ;) {
                            var token = this.lookahead;
                            if (token.type !== token_1.Token.StringLiteral) break;
                            var statement = this.parseDirective();
                            body.push(statement);
                            var directive = statement.directive;
                            if ("string" != typeof directive) break;
                            "use strict" === directive ? (this.context.strict = !0, firstRestricted && this.tolerateUnexpectedToken(firstRestricted, messages_1.Messages.StrictOctalLiteral)) : !firstRestricted && token.octal && (firstRestricted = token);
                        }
                        return body;
                    }, Parser.prototype.qualifiedPropertyName = function(token) {
                        switch (token.type) {
                          case token_1.Token.Identifier:
                          case token_1.Token.StringLiteral:
                          case token_1.Token.BooleanLiteral:
                          case token_1.Token.NullLiteral:
                          case token_1.Token.NumericLiteral:
                          case token_1.Token.Keyword:
                            return !0;

                          case token_1.Token.Punctuator:
                            return "[" === token.value;
                        }
                        return !1;
                    }, Parser.prototype.parseGetterMethod = function() {
                        var node = this.createNode();
                        this.expect("("), this.expect(")");
                        var isGenerator = !1, params = {
                            params: [],
                            stricted: null,
                            firstRestricted: null,
                            message: null
                        }, previousAllowYield = this.context.allowYield;
                        this.context.allowYield = !1;
                        var method = this.parsePropertyMethod(params);
                        return this.context.allowYield = previousAllowYield, this.finalize(node, new Node.FunctionExpression(null, params.params, method, isGenerator));
                    }, Parser.prototype.parseSetterMethod = function() {
                        var node = this.createNode(), options = {
                            params: [],
                            firstRestricted: null,
                            paramSet: {}
                        }, isGenerator = !1, previousAllowYield = this.context.allowYield;
                        this.context.allowYield = !1, this.expect("("), this.match(")") ? this.tolerateUnexpectedToken(this.lookahead) : this.parseFormalParameter(options), 
                        this.expect(")");
                        var method = this.parsePropertyMethod(options);
                        return this.context.allowYield = previousAllowYield, this.finalize(node, new Node.FunctionExpression(null, options.params, method, isGenerator));
                    }, Parser.prototype.parseGeneratorMethod = function() {
                        var node = this.createNode(), isGenerator = !0, previousAllowYield = this.context.allowYield;
                        this.context.allowYield = !0;
                        var params = this.parseFormalParameters();
                        this.context.allowYield = !1;
                        var method = this.parsePropertyMethod(params);
                        return this.context.allowYield = previousAllowYield, this.finalize(node, new Node.FunctionExpression(null, params.params, method, isGenerator));
                    }, Parser.prototype.parseYieldExpression = function() {
                        var node = this.createNode();
                        this.expectKeyword("yield");
                        var argument = null, delegate = !1;
                        if (!this.hasLineTerminator) {
                            var previousAllowYield = this.context.allowYield;
                            this.context.allowYield = !1, delegate = this.match("*"), delegate ? (this.nextToken(), 
                            argument = this.parseAssignmentExpression()) : this.match(";") || this.match("}") || this.match(")") || this.lookahead.type === token_1.Token.EOF || (argument = this.parseAssignmentExpression()), 
                            this.context.allowYield = previousAllowYield;
                        }
                        return this.finalize(node, new Node.YieldExpression(argument, delegate));
                    }, Parser.prototype.parseClassElement = function(hasConstructor) {
                        var kind, key, value, token = this.lookahead, node = this.createNode(), computed = !1, method = !1, isStatic = !1;
                        if (this.match("*")) this.nextToken(); else {
                            computed = this.match("["), key = this.parseObjectPropertyKey();
                            var id = key;
                            "static" === id.name && (this.qualifiedPropertyName(this.lookahead) || this.match("*")) && (token = this.lookahead, 
                            isStatic = !0, computed = this.match("["), this.match("*") ? this.nextToken() : key = this.parseObjectPropertyKey());
                        }
                        var lookaheadPropertyKey = this.qualifiedPropertyName(this.lookahead);
                        return token.type === token_1.Token.Identifier ? "get" === token.value && lookaheadPropertyKey ? (kind = "get", 
                        computed = this.match("["), key = this.parseObjectPropertyKey(), this.context.allowYield = !1, 
                        value = this.parseGetterMethod()) : "set" === token.value && lookaheadPropertyKey && (kind = "set", 
                        computed = this.match("["), key = this.parseObjectPropertyKey(), value = this.parseSetterMethod()) : token.type === token_1.Token.Punctuator && "*" === token.value && lookaheadPropertyKey && (kind = "init", 
                        computed = this.match("["), key = this.parseObjectPropertyKey(), value = this.parseGeneratorMethod(), 
                        method = !0), !kind && key && this.match("(") && (kind = "init", value = this.parsePropertyMethodFunction(), 
                        method = !0), kind || this.throwUnexpectedToken(this.lookahead), "init" === kind && (kind = "method"), 
                        computed || (isStatic && this.isPropertyKey(key, "prototype") && this.throwUnexpectedToken(token, messages_1.Messages.StaticPrototype), 
                        !isStatic && this.isPropertyKey(key, "constructor") && ("method" === kind && method && !value.generator || this.throwUnexpectedToken(token, messages_1.Messages.ConstructorSpecialMethod), 
                        hasConstructor.value ? this.throwUnexpectedToken(token, messages_1.Messages.DuplicateConstructor) : hasConstructor.value = !0, 
                        kind = "constructor")), this.finalize(node, new Node.MethodDefinition(key, computed, value, kind, isStatic));
                    }, Parser.prototype.parseClassElementList = function() {
                        var body = [], hasConstructor = {
                            value: !1
                        };
                        for (this.expect("{"); !this.match("}"); ) this.match(";") ? this.nextToken() : body.push(this.parseClassElement(hasConstructor));
                        return this.expect("}"), body;
                    }, Parser.prototype.parseClassBody = function() {
                        var node = this.createNode(), elementList = this.parseClassElementList();
                        return this.finalize(node, new Node.ClassBody(elementList));
                    }, Parser.prototype.parseClassDeclaration = function(identifierIsOptional) {
                        var node = this.createNode(), previousStrict = this.context.strict;
                        this.context.strict = !0, this.expectKeyword("class");
                        var id = identifierIsOptional && this.lookahead.type !== token_1.Token.Identifier ? null : this.parseVariableIdentifier(), superClass = null;
                        this.matchKeyword("extends") && (this.nextToken(), superClass = this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall));
                        var classBody = this.parseClassBody();
                        return this.context.strict = previousStrict, this.finalize(node, new Node.ClassDeclaration(id, superClass, classBody));
                    }, Parser.prototype.parseClassExpression = function() {
                        var node = this.createNode(), previousStrict = this.context.strict;
                        this.context.strict = !0, this.expectKeyword("class");
                        var id = this.lookahead.type === token_1.Token.Identifier ? this.parseVariableIdentifier() : null, superClass = null;
                        this.matchKeyword("extends") && (this.nextToken(), superClass = this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall));
                        var classBody = this.parseClassBody();
                        return this.context.strict = previousStrict, this.finalize(node, new Node.ClassExpression(id, superClass, classBody));
                    }, Parser.prototype.parseProgram = function() {
                        for (var node = this.createNode(), body = this.parseDirectivePrologues(); this.startMarker.index < this.scanner.length; ) body.push(this.parseStatementListItem());
                        return this.finalize(node, new Node.Program(body, this.sourceType));
                    }, Parser.prototype.parseModuleSpecifier = function() {
                        var node = this.createNode();
                        this.lookahead.type !== token_1.Token.StringLiteral && this.throwError(messages_1.Messages.InvalidModuleSpecifier);
                        var token = this.nextToken(), raw = this.getTokenRaw(token);
                        return this.finalize(node, new Node.Literal(token.value, raw));
                    }, Parser.prototype.parseImportSpecifier = function() {
                        var imported, local, node = this.createNode();
                        return this.lookahead.type === token_1.Token.Identifier ? (imported = this.parseVariableIdentifier(), 
                        local = imported, this.matchContextualKeyword("as") && (this.nextToken(), local = this.parseVariableIdentifier())) : (imported = this.parseIdentifierName(), 
                        local = imported, this.matchContextualKeyword("as") ? (this.nextToken(), local = this.parseVariableIdentifier()) : this.throwUnexpectedToken(this.nextToken())), 
                        this.finalize(node, new Node.ImportSpecifier(local, imported));
                    }, Parser.prototype.parseNamedImports = function() {
                        this.expect("{");
                        for (var specifiers = []; !this.match("}"); ) specifiers.push(this.parseImportSpecifier()), 
                        this.match("}") || this.expect(",");
                        return this.expect("}"), specifiers;
                    }, Parser.prototype.parseImportDefaultSpecifier = function() {
                        var node = this.createNode(), local = this.parseIdentifierName();
                        return this.finalize(node, new Node.ImportDefaultSpecifier(local));
                    }, Parser.prototype.parseImportNamespaceSpecifier = function() {
                        var node = this.createNode();
                        this.expect("*"), this.matchContextualKeyword("as") || this.throwError(messages_1.Messages.NoAsAfterImportNamespace), 
                        this.nextToken();
                        var local = this.parseIdentifierName();
                        return this.finalize(node, new Node.ImportNamespaceSpecifier(local));
                    }, Parser.prototype.parseImportDeclaration = function() {
                        this.context.inFunctionBody && this.throwError(messages_1.Messages.IllegalImportDeclaration);
                        var node = this.createNode();
                        this.expectKeyword("import");
                        var src, specifiers = [];
                        if (this.lookahead.type === token_1.Token.StringLiteral) src = this.parseModuleSpecifier(); else {
                            if (this.match("{") ? specifiers = specifiers.concat(this.parseNamedImports()) : this.match("*") ? specifiers.push(this.parseImportNamespaceSpecifier()) : this.isIdentifierName(this.lookahead) && !this.matchKeyword("default") ? (specifiers.push(this.parseImportDefaultSpecifier()), 
                            this.match(",") && (this.nextToken(), this.match("*") ? specifiers.push(this.parseImportNamespaceSpecifier()) : this.match("{") ? specifiers = specifiers.concat(this.parseNamedImports()) : this.throwUnexpectedToken(this.lookahead))) : this.throwUnexpectedToken(this.nextToken()), 
                            !this.matchContextualKeyword("from")) {
                                var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
                                this.throwError(message, this.lookahead.value);
                            }
                            this.nextToken(), src = this.parseModuleSpecifier();
                        }
                        return this.consumeSemicolon(), this.finalize(node, new Node.ImportDeclaration(specifiers, src));
                    }, Parser.prototype.parseExportSpecifier = function() {
                        var node = this.createNode(), local = this.parseIdentifierName(), exported = local;
                        return this.matchContextualKeyword("as") && (this.nextToken(), exported = this.parseIdentifierName()), 
                        this.finalize(node, new Node.ExportSpecifier(local, exported));
                    }, Parser.prototype.parseExportDeclaration = function() {
                        this.context.inFunctionBody && this.throwError(messages_1.Messages.IllegalExportDeclaration);
                        var node = this.createNode();
                        this.expectKeyword("export");
                        var exportDeclaration;
                        if (this.matchKeyword("default")) if (this.nextToken(), this.matchKeyword("function")) {
                            var declaration = this.parseFunctionDeclaration(!0);
                            exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
                        } else if (this.matchKeyword("class")) {
                            var declaration = this.parseClassDeclaration(!0);
                            exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
                        } else {
                            this.matchContextualKeyword("from") && this.throwError(messages_1.Messages.UnexpectedToken, this.lookahead.value);
                            var declaration = this.match("{") ? this.parseObjectInitializer() : this.match("[") ? this.parseArrayInitializer() : this.parseAssignmentExpression();
                            this.consumeSemicolon(), exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
                        } else if (this.match("*")) {
                            if (this.nextToken(), !this.matchContextualKeyword("from")) {
                                var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
                                this.throwError(message, this.lookahead.value);
                            }
                            this.nextToken();
                            var src = this.parseModuleSpecifier();
                            this.consumeSemicolon(), exportDeclaration = this.finalize(node, new Node.ExportAllDeclaration(src));
                        } else if (this.lookahead.type === token_1.Token.Keyword) {
                            var declaration = void 0;
                            switch (this.lookahead.value) {
                              case "let":
                              case "const":
                                declaration = this.parseLexicalDeclaration({
                                    inFor: !1
                                });
                                break;

                              case "var":
                              case "class":
                              case "function":
                                declaration = this.parseStatementListItem();
                                break;

                              default:
                                this.throwUnexpectedToken(this.lookahead);
                            }
                            exportDeclaration = this.finalize(node, new Node.ExportNamedDeclaration(declaration, [], null));
                        } else {
                            var specifiers = [], source = null, isExportFromIdentifier = !1;
                            for (this.expect("{"); !this.match("}"); ) isExportFromIdentifier = isExportFromIdentifier || this.matchKeyword("default"), 
                            specifiers.push(this.parseExportSpecifier()), this.match("}") || this.expect(",");
                            if (this.expect("}"), this.matchContextualKeyword("from")) this.nextToken(), source = this.parseModuleSpecifier(), 
                            this.consumeSemicolon(); else if (isExportFromIdentifier) {
                                var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
                                this.throwError(message, this.lookahead.value);
                            } else this.consumeSemicolon();
                            exportDeclaration = this.finalize(node, new Node.ExportNamedDeclaration(null, specifiers, source));
                        }
                        return exportDeclaration;
                    }, Parser;
                }();
                exports.Parser = Parser;
            }, function(module, exports) {
                function assert(condition, message) {
                    if (!condition) throw new Error("ASSERT: " + message);
                }
                exports.assert = assert;
            }, function(module, exports) {
                exports.Messages = {
                    UnexpectedToken: "Unexpected token %0",
                    UnexpectedTokenIllegal: "Unexpected token ILLEGAL",
                    UnexpectedNumber: "Unexpected number",
                    UnexpectedString: "Unexpected string",
                    UnexpectedIdentifier: "Unexpected identifier",
                    UnexpectedReserved: "Unexpected reserved word",
                    UnexpectedTemplate: "Unexpected quasi %0",
                    UnexpectedEOS: "Unexpected end of input",
                    NewlineAfterThrow: "Illegal newline after throw",
                    InvalidRegExp: "Invalid regular expression",
                    UnterminatedRegExp: "Invalid regular expression: missing /",
                    InvalidLHSInAssignment: "Invalid left-hand side in assignment",
                    InvalidLHSInForIn: "Invalid left-hand side in for-in",
                    InvalidLHSInForLoop: "Invalid left-hand side in for-loop",
                    MultipleDefaultsInSwitch: "More than one default clause in switch statement",
                    NoCatchOrFinally: "Missing catch or finally after try",
                    UnknownLabel: "Undefined label '%0'",
                    Redeclaration: "%0 '%1' has already been declared",
                    IllegalContinue: "Illegal continue statement",
                    IllegalBreak: "Illegal break statement",
                    IllegalReturn: "Illegal return statement",
                    StrictModeWith: "Strict mode code may not include a with statement",
                    StrictCatchVariable: "Catch variable may not be eval or arguments in strict mode",
                    StrictVarName: "Variable name may not be eval or arguments in strict mode",
                    StrictParamName: "Parameter name eval or arguments is not allowed in strict mode",
                    StrictParamDupe: "Strict mode function may not have duplicate parameter names",
                    StrictFunctionName: "Function name may not be eval or arguments in strict mode",
                    StrictOctalLiteral: "Octal literals are not allowed in strict mode.",
                    StrictDelete: "Delete of an unqualified identifier in strict mode.",
                    StrictLHSAssignment: "Assignment to eval or arguments is not allowed in strict mode",
                    StrictLHSPostfix: "Postfix increment/decrement may not have eval or arguments operand in strict mode",
                    StrictLHSPrefix: "Prefix increment/decrement may not have eval or arguments operand in strict mode",
                    StrictReservedWord: "Use of future reserved word in strict mode",
                    TemplateOctalLiteral: "Octal literals are not allowed in template strings.",
                    ParameterAfterRestParameter: "Rest parameter must be last formal parameter",
                    DefaultRestParameter: "Unexpected token =",
                    ObjectPatternAsRestParameter: "Unexpected token {",
                    DuplicateProtoProperty: "Duplicate __proto__ fields are not allowed in object literals",
                    ConstructorSpecialMethod: "Class constructor may not be an accessor",
                    DuplicateConstructor: "A class may only have one constructor",
                    StaticPrototype: "Classes may not have static property named prototype",
                    MissingFromClause: "Unexpected token",
                    NoAsAfterImportNamespace: "Unexpected token",
                    InvalidModuleSpecifier: "Unexpected token",
                    IllegalImportDeclaration: "Unexpected token",
                    IllegalExportDeclaration: "Unexpected token",
                    DuplicateBinding: "Duplicate binding %0",
                    ForInOfLoopInitializer: "%0 loop variable declaration may not have an initializer"
                };
            }, function(module, exports) {
                var ErrorHandler = function() {
                    function ErrorHandler() {
                        this.errors = [], this.tolerant = !1;
                    }
                    return ErrorHandler.prototype.recordError = function(error) {
                        this.errors.push(error);
                    }, ErrorHandler.prototype.tolerate = function(error) {
                        if (!this.tolerant) throw error;
                        this.recordError(error);
                    }, ErrorHandler.prototype.constructError = function(msg, column) {
                        var error = new Error(msg);
                        try {
                            throw error;
                        } catch (base) {
                            Object.create && Object.defineProperty && (error = Object.create(base), Object.defineProperty(error, "column", {
                                value: column
                            }));
                        } finally {
                            return error;
                        }
                    }, ErrorHandler.prototype.createError = function(index, line, col, description) {
                        var msg = "Line " + line + ": " + description, error = this.constructError(msg, col);
                        return error.index = index, error.lineNumber = line, error.description = description, 
                        error;
                    }, ErrorHandler.prototype.throwError = function(index, line, col, description) {
                        throw this.createError(index, line, col, description);
                    }, ErrorHandler.prototype.tolerateError = function(index, line, col, description) {
                        var error = this.createError(index, line, col, description);
                        if (!this.tolerant) throw error;
                        this.recordError(error);
                    }, ErrorHandler;
                }();
                exports.ErrorHandler = ErrorHandler;
            }, function(module, exports) {
                !function(Token) {
                    Token[Token.BooleanLiteral = 1] = "BooleanLiteral", Token[Token.EOF = 2] = "EOF", 
                    Token[Token.Identifier = 3] = "Identifier", Token[Token.Keyword = 4] = "Keyword", 
                    Token[Token.NullLiteral = 5] = "NullLiteral", Token[Token.NumericLiteral = 6] = "NumericLiteral", 
                    Token[Token.Punctuator = 7] = "Punctuator", Token[Token.StringLiteral = 8] = "StringLiteral", 
                    Token[Token.RegularExpression = 9] = "RegularExpression", Token[Token.Template = 10] = "Template";
                }(exports.Token || (exports.Token = {}));
                var Token = exports.Token;
                exports.TokenName = {}, exports.TokenName[Token.BooleanLiteral] = "Boolean", exports.TokenName[Token.EOF] = "<end>", 
                exports.TokenName[Token.Identifier] = "Identifier", exports.TokenName[Token.Keyword] = "Keyword", 
                exports.TokenName[Token.NullLiteral] = "Null", exports.TokenName[Token.NumericLiteral] = "Numeric", 
                exports.TokenName[Token.Punctuator] = "Punctuator", exports.TokenName[Token.StringLiteral] = "String", 
                exports.TokenName[Token.RegularExpression] = "RegularExpression", exports.TokenName[Token.Template] = "Template";
            }, function(module, exports, __webpack_require__) {
                function hexValue(ch) {
                    return "0123456789abcdef".indexOf(ch.toLowerCase());
                }
                function octalValue(ch) {
                    return "01234567".indexOf(ch);
                }
                var assert_1 = __webpack_require__(4), messages_1 = __webpack_require__(5), character_1 = __webpack_require__(9), token_1 = __webpack_require__(7), Scanner = function() {
                    function Scanner(code, handler) {
                        this.source = code, this.errorHandler = handler, this.trackComment = !1, this.length = code.length, 
                        this.index = 0, this.lineNumber = code.length > 0 ? 1 : 0, this.lineStart = 0, this.curlyStack = [];
                    }
                    return Scanner.prototype.eof = function() {
                        return this.index >= this.length;
                    }, Scanner.prototype.throwUnexpectedToken = function(message) {
                        void 0 === message && (message = messages_1.Messages.UnexpectedTokenIllegal), this.errorHandler.throwError(this.index, this.lineNumber, this.index - this.lineStart + 1, message);
                    }, Scanner.prototype.tolerateUnexpectedToken = function() {
                        this.errorHandler.tolerateError(this.index, this.lineNumber, this.index - this.lineStart + 1, messages_1.Messages.UnexpectedTokenIllegal);
                    }, Scanner.prototype.skipSingleLineComment = function(offset) {
                        var comments, start, loc;
                        for (this.trackComment && (comments = [], start = this.index - offset, loc = {
                            start: {
                                line: this.lineNumber,
                                column: this.index - this.lineStart - offset
                            },
                            end: {}
                        }); !this.eof(); ) {
                            var ch = this.source.charCodeAt(this.index);
                            if (++this.index, character_1.Character.isLineTerminator(ch)) {
                                if (this.trackComment) {
                                    loc.end = {
                                        line: this.lineNumber,
                                        column: this.index - this.lineStart - 1
                                    };
                                    var entry = {
                                        multiLine: !1,
                                        slice: [ start + offset, this.index - 1 ],
                                        range: [ start, this.index - 1 ],
                                        loc: loc
                                    };
                                    comments.push(entry);
                                }
                                return 13 === ch && 10 === this.source.charCodeAt(this.index) && ++this.index, ++this.lineNumber, 
                                this.lineStart = this.index, comments;
                            }
                        }
                        if (this.trackComment) {
                            loc.end = {
                                line: this.lineNumber,
                                column: this.index - this.lineStart
                            };
                            var entry = {
                                multiLine: !1,
                                slice: [ start + offset, this.index ],
                                range: [ start, this.index ],
                                loc: loc
                            };
                            comments.push(entry);
                        }
                        return comments;
                    }, Scanner.prototype.skipMultiLineComment = function() {
                        var comments, start, loc;
                        for (this.trackComment && (comments = [], start = this.index - 2, loc = {
                            start: {
                                line: this.lineNumber,
                                column: this.index - this.lineStart - 2
                            },
                            end: {}
                        }); !this.eof(); ) {
                            var ch = this.source.charCodeAt(this.index);
                            if (character_1.Character.isLineTerminator(ch)) 13 === ch && 10 === this.source.charCodeAt(this.index + 1) && ++this.index, 
                            ++this.lineNumber, ++this.index, this.lineStart = this.index; else if (42 === ch) {
                                if (47 === this.source.charCodeAt(this.index + 1)) {
                                    if (this.index += 2, this.trackComment) {
                                        loc.end = {
                                            line: this.lineNumber,
                                            column: this.index - this.lineStart
                                        };
                                        var entry = {
                                            multiLine: !0,
                                            slice: [ start + 2, this.index - 2 ],
                                            range: [ start, this.index ],
                                            loc: loc
                                        };
                                        comments.push(entry);
                                    }
                                    return comments;
                                }
                                ++this.index;
                            } else ++this.index;
                        }
                        if (this.trackComment) {
                            loc.end = {
                                line: this.lineNumber,
                                column: this.index - this.lineStart
                            };
                            var entry = {
                                multiLine: !0,
                                slice: [ start + 2, this.index ],
                                range: [ start, this.index ],
                                loc: loc
                            };
                            comments.push(entry);
                        }
                        return this.tolerateUnexpectedToken(), comments;
                    }, Scanner.prototype.scanComments = function() {
                        var comments;
                        this.trackComment && (comments = []);
                        for (var start = 0 === this.index; !this.eof(); ) {
                            var ch = this.source.charCodeAt(this.index);
                            if (character_1.Character.isWhiteSpace(ch)) ++this.index; else if (character_1.Character.isLineTerminator(ch)) ++this.index, 
                            13 === ch && 10 === this.source.charCodeAt(this.index) && ++this.index, ++this.lineNumber, 
                            this.lineStart = this.index, start = !0; else if (47 === ch) if (ch = this.source.charCodeAt(this.index + 1), 
                            47 === ch) {
                                this.index += 2;
                                var comment = this.skipSingleLineComment(2);
                                this.trackComment && (comments = comments.concat(comment)), start = !0;
                            } else {
                                if (42 !== ch) break;
                                this.index += 2;
                                var comment = this.skipMultiLineComment();
                                this.trackComment && (comments = comments.concat(comment));
                            } else if (start && 45 === ch) {
                                if (45 !== this.source.charCodeAt(this.index + 1) || 62 !== this.source.charCodeAt(this.index + 2)) break;
                                this.index += 3;
                                var comment = this.skipSingleLineComment(3);
                                this.trackComment && (comments = comments.concat(comment));
                            } else {
                                if (60 !== ch) break;
                                if ("!--" !== this.source.slice(this.index + 1, this.index + 4)) break;
                                this.index += 4;
                                var comment = this.skipSingleLineComment(4);
                                this.trackComment && (comments = comments.concat(comment));
                            }
                        }
                        return comments;
                    }, Scanner.prototype.isFutureReservedWord = function(id) {
                        switch (id) {
                          case "enum":
                          case "export":
                          case "import":
                          case "super":
                            return !0;

                          default:
                            return !1;
                        }
                    }, Scanner.prototype.isStrictModeReservedWord = function(id) {
                        switch (id) {
                          case "implements":
                          case "interface":
                          case "package":
                          case "private":
                          case "protected":
                          case "public":
                          case "static":
                          case "yield":
                          case "let":
                            return !0;

                          default:
                            return !1;
                        }
                    }, Scanner.prototype.isRestrictedWord = function(id) {
                        return "eval" === id || "arguments" === id;
                    }, Scanner.prototype.isKeyword = function(id) {
                        switch (id.length) {
                          case 2:
                            return "if" === id || "in" === id || "do" === id;

                          case 3:
                            return "var" === id || "for" === id || "new" === id || "try" === id || "let" === id;

                          case 4:
                            return "this" === id || "else" === id || "case" === id || "void" === id || "with" === id || "enum" === id;

                          case 5:
                            return "while" === id || "break" === id || "catch" === id || "throw" === id || "const" === id || "yield" === id || "class" === id || "super" === id;

                          case 6:
                            return "return" === id || "typeof" === id || "delete" === id || "switch" === id || "export" === id || "import" === id;

                          case 7:
                            return "default" === id || "finally" === id || "extends" === id;

                          case 8:
                            return "function" === id || "continue" === id || "debugger" === id;

                          case 10:
                            return "instanceof" === id;

                          default:
                            return !1;
                        }
                    }, Scanner.prototype.codePointAt = function(i) {
                        var cp = this.source.charCodeAt(i);
                        if (cp >= 55296 && cp <= 56319) {
                            var second = this.source.charCodeAt(i + 1);
                            if (second >= 56320 && second <= 57343) {
                                var first = cp;
                                cp = 1024 * (first - 55296) + second - 56320 + 65536;
                            }
                        }
                        return cp;
                    }, Scanner.prototype.scanHexEscape = function(prefix) {
                        for (var len = "u" === prefix ? 4 : 2, code = 0, i = 0; i < len; ++i) {
                            if (this.eof() || !character_1.Character.isHexDigit(this.source.charCodeAt(this.index))) return "";
                            code = 16 * code + hexValue(this.source[this.index++]);
                        }
                        return String.fromCharCode(code);
                    }, Scanner.prototype.scanUnicodeCodePointEscape = function() {
                        var ch = this.source[this.index], code = 0;
                        for ("}" === ch && this.throwUnexpectedToken(); !this.eof() && (ch = this.source[this.index++], 
                        character_1.Character.isHexDigit(ch.charCodeAt(0))); ) code = 16 * code + hexValue(ch);
                        return (code > 1114111 || "}" !== ch) && this.throwUnexpectedToken(), character_1.Character.fromCodePoint(code);
                    }, Scanner.prototype.getIdentifier = function() {
                        for (var start = this.index++; !this.eof(); ) {
                            var ch = this.source.charCodeAt(this.index);
                            if (92 === ch) return this.index = start, this.getComplexIdentifier();
                            if (ch >= 55296 && ch < 57343) return this.index = start, this.getComplexIdentifier();
                            if (!character_1.Character.isIdentifierPart(ch)) break;
                            ++this.index;
                        }
                        return this.source.slice(start, this.index);
                    }, Scanner.prototype.getComplexIdentifier = function() {
                        var cp = this.codePointAt(this.index), id = character_1.Character.fromCodePoint(cp);
                        this.index += id.length;
                        var ch;
                        for (92 === cp && (117 !== this.source.charCodeAt(this.index) && this.throwUnexpectedToken(), 
                        ++this.index, "{" === this.source[this.index] ? (++this.index, ch = this.scanUnicodeCodePointEscape()) : (ch = this.scanHexEscape("u"), 
                        cp = ch.charCodeAt(0), ch && "\\" !== ch && character_1.Character.isIdentifierStart(cp) || this.throwUnexpectedToken()), 
                        id = ch); !this.eof() && (cp = this.codePointAt(this.index), character_1.Character.isIdentifierPart(cp)); ) ch = character_1.Character.fromCodePoint(cp), 
                        id += ch, this.index += ch.length, 92 === cp && (id = id.substr(0, id.length - 1), 
                        117 !== this.source.charCodeAt(this.index) && this.throwUnexpectedToken(), ++this.index, 
                        "{" === this.source[this.index] ? (++this.index, ch = this.scanUnicodeCodePointEscape()) : (ch = this.scanHexEscape("u"), 
                        cp = ch.charCodeAt(0), ch && "\\" !== ch && character_1.Character.isIdentifierPart(cp) || this.throwUnexpectedToken()), 
                        id += ch);
                        return id;
                    }, Scanner.prototype.octalToDecimal = function(ch) {
                        var octal = "0" !== ch, code = octalValue(ch);
                        return !this.eof() && character_1.Character.isOctalDigit(this.source.charCodeAt(this.index)) && (octal = !0, 
                        code = 8 * code + octalValue(this.source[this.index++]), "0123".indexOf(ch) >= 0 && !this.eof() && character_1.Character.isOctalDigit(this.source.charCodeAt(this.index)) && (code = 8 * code + octalValue(this.source[this.index++]))), 
                        {
                            code: code,
                            octal: octal
                        };
                    }, Scanner.prototype.scanIdentifier = function() {
                        var type, start = this.index, id = 92 === this.source.charCodeAt(start) ? this.getComplexIdentifier() : this.getIdentifier();
                        return type = 1 === id.length ? token_1.Token.Identifier : this.isKeyword(id) ? token_1.Token.Keyword : "null" === id ? token_1.Token.NullLiteral : "true" === id || "false" === id ? token_1.Token.BooleanLiteral : token_1.Token.Identifier, 
                        {
                            type: type,
                            value: id,
                            lineNumber: this.lineNumber,
                            lineStart: this.lineStart,
                            start: start,
                            end: this.index
                        };
                    }, Scanner.prototype.scanPunctuator = function() {
                        var token = {
                            type: token_1.Token.Punctuator,
                            value: "",
                            lineNumber: this.lineNumber,
                            lineStart: this.lineStart,
                            start: this.index,
                            end: this.index
                        }, str = this.source[this.index];
                        switch (str) {
                          case "(":
                          case "{":
                            "{" === str && this.curlyStack.push("{"), ++this.index;
                            break;

                          case ".":
                            ++this.index, "." === this.source[this.index] && "." === this.source[this.index + 1] && (this.index += 2, 
                            str = "...");
                            break;

                          case "}":
                            ++this.index, this.curlyStack.pop();
                            break;

                          case ")":
                          case ";":
                          case ",":
                          case "[":
                          case "]":
                          case ":":
                          case "?":
                          case "~":
                            ++this.index;
                            break;

                          default:
                            str = this.source.substr(this.index, 4), ">>>=" === str ? this.index += 4 : (str = str.substr(0, 3), 
                            "===" === str || "!==" === str || ">>>" === str || "<<=" === str || ">>=" === str || "**=" === str ? this.index += 3 : (str = str.substr(0, 2), 
                            "&&" === str || "||" === str || "==" === str || "!=" === str || "+=" === str || "-=" === str || "*=" === str || "/=" === str || "++" === str || "--" === str || "<<" === str || ">>" === str || "&=" === str || "|=" === str || "^=" === str || "%=" === str || "<=" === str || ">=" === str || "=>" === str || "**" === str ? this.index += 2 : (str = this.source[this.index], 
                            "<>=!+-*%&|^/".indexOf(str) >= 0 && ++this.index)));
                        }
                        return this.index === token.start && this.throwUnexpectedToken(), token.end = this.index, 
                        token.value = str, token;
                    }, Scanner.prototype.scanHexLiteral = function(start) {
                        for (var number = ""; !this.eof() && character_1.Character.isHexDigit(this.source.charCodeAt(this.index)); ) number += this.source[this.index++];
                        return 0 === number.length && this.throwUnexpectedToken(), character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index)) && this.throwUnexpectedToken(), 
                        {
                            type: token_1.Token.NumericLiteral,
                            value: parseInt("0x" + number, 16),
                            lineNumber: this.lineNumber,
                            lineStart: this.lineStart,
                            start: start,
                            end: this.index
                        };
                    }, Scanner.prototype.scanBinaryLiteral = function(start) {
                        for (var ch, number = ""; !this.eof() && (ch = this.source[this.index], "0" === ch || "1" === ch); ) number += this.source[this.index++];
                        return 0 === number.length && this.throwUnexpectedToken(), this.eof() || (ch = this.source.charCodeAt(this.index), 
                        (character_1.Character.isIdentifierStart(ch) || character_1.Character.isDecimalDigit(ch)) && this.throwUnexpectedToken()), 
                        {
                            type: token_1.Token.NumericLiteral,
                            value: parseInt(number, 2),
                            lineNumber: this.lineNumber,
                            lineStart: this.lineStart,
                            start: start,
                            end: this.index
                        };
                    }, Scanner.prototype.scanOctalLiteral = function(prefix, start) {
                        var number = "", octal = !1;
                        for (character_1.Character.isOctalDigit(prefix.charCodeAt(0)) ? (octal = !0, number = "0" + this.source[this.index++]) : ++this.index; !this.eof() && character_1.Character.isOctalDigit(this.source.charCodeAt(this.index)); ) number += this.source[this.index++];
                        return octal || 0 !== number.length || this.throwUnexpectedToken(), (character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index)) || character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) && this.throwUnexpectedToken(), 
                        {
                            type: token_1.Token.NumericLiteral,
                            value: parseInt(number, 8),
                            octal: octal,
                            lineNumber: this.lineNumber,
                            lineStart: this.lineStart,
                            start: start,
                            end: this.index
                        };
                    }, Scanner.prototype.isImplicitOctalLiteral = function() {
                        for (var i = this.index + 1; i < this.length; ++i) {
                            var ch = this.source[i];
                            if ("8" === ch || "9" === ch) return !1;
                            if (!character_1.Character.isOctalDigit(ch.charCodeAt(0))) return !0;
                        }
                        return !0;
                    }, Scanner.prototype.scanNumericLiteral = function() {
                        var start = this.index, ch = this.source[start];
                        assert_1.assert(character_1.Character.isDecimalDigit(ch.charCodeAt(0)) || "." === ch, "Numeric literal must start with a decimal digit or a decimal point");
                        var number = "";
                        if ("." !== ch) {
                            if (number = this.source[this.index++], ch = this.source[this.index], "0" === number) {
                                if ("x" === ch || "X" === ch) return ++this.index, this.scanHexLiteral(start);
                                if ("b" === ch || "B" === ch) return ++this.index, this.scanBinaryLiteral(start);
                                if ("o" === ch || "O" === ch) return this.scanOctalLiteral(ch, start);
                                if (ch && character_1.Character.isOctalDigit(ch.charCodeAt(0)) && this.isImplicitOctalLiteral()) return this.scanOctalLiteral(ch, start);
                            }
                            for (;character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index)); ) number += this.source[this.index++];
                            ch = this.source[this.index];
                        }
                        if ("." === ch) {
                            for (number += this.source[this.index++]; character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index)); ) number += this.source[this.index++];
                            ch = this.source[this.index];
                        }
                        if ("e" === ch || "E" === ch) if (number += this.source[this.index++], ch = this.source[this.index], 
                        "+" !== ch && "-" !== ch || (number += this.source[this.index++]), character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) for (;character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index)); ) number += this.source[this.index++]; else this.throwUnexpectedToken();
                        return character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index)) && this.throwUnexpectedToken(), 
                        {
                            type: token_1.Token.NumericLiteral,
                            value: parseFloat(number),
                            lineNumber: this.lineNumber,
                            lineStart: this.lineStart,
                            start: start,
                            end: this.index
                        };
                    }, Scanner.prototype.scanStringLiteral = function() {
                        var start = this.index, quote = this.source[start];
                        assert_1.assert("'" === quote || '"' === quote, "String literal must starts with a quote"), 
                        ++this.index;
                        for (var octal = !1, str = ""; !this.eof(); ) {
                            var ch = this.source[this.index++];
                            if (ch === quote) {
                                quote = "";
                                break;
                            }
                            if ("\\" === ch) if (ch = this.source[this.index++], ch && character_1.Character.isLineTerminator(ch.charCodeAt(0))) ++this.lineNumber, 
                            "\r" === ch && "\n" === this.source[this.index] && ++this.index, this.lineStart = this.index; else switch (ch) {
                              case "u":
                              case "x":
                                if ("{" === this.source[this.index]) ++this.index, str += this.scanUnicodeCodePointEscape(); else {
                                    var unescaped = this.scanHexEscape(ch);
                                    unescaped || this.throwUnexpectedToken(), str += unescaped;
                                }
                                break;

                              case "n":
                                str += "\n";
                                break;

                              case "r":
                                str += "\r";
                                break;

                              case "t":
                                str += "\t";
                                break;

                              case "b":
                                str += "\b";
                                break;

                              case "f":
                                str += "\f";
                                break;

                              case "v":
                                str += "\v";
                                break;

                              case "8":
                              case "9":
                                str += ch, this.tolerateUnexpectedToken();
                                break;

                              default:
                                if (ch && character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
                                    var octToDec = this.octalToDecimal(ch);
                                    octal = octToDec.octal || octal, str += String.fromCharCode(octToDec.code);
                                } else str += ch;
                            } else {
                                if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) break;
                                str += ch;
                            }
                        }
                        return "" !== quote && (this.index = start, this.throwUnexpectedToken()), {
                            type: token_1.Token.StringLiteral,
                            value: str,
                            octal: octal,
                            lineNumber: this.lineNumber,
                            lineStart: this.lineStart,
                            start: start,
                            end: this.index
                        };
                    }, Scanner.prototype.scanTemplate = function() {
                        var cooked = "", terminated = !1, start = this.index, head = "`" === this.source[start], tail = !1, rawOffset = 2;
                        for (++this.index; !this.eof(); ) {
                            var ch = this.source[this.index++];
                            if ("`" === ch) {
                                rawOffset = 1, tail = !0, terminated = !0;
                                break;
                            }
                            if ("$" === ch) {
                                if ("{" === this.source[this.index]) {
                                    this.curlyStack.push("${"), ++this.index, terminated = !0;
                                    break;
                                }
                                cooked += ch;
                            } else if ("\\" === ch) if (ch = this.source[this.index++], character_1.Character.isLineTerminator(ch.charCodeAt(0))) ++this.lineNumber, 
                            "\r" === ch && "\n" === this.source[this.index] && ++this.index, this.lineStart = this.index; else switch (ch) {
                              case "n":
                                cooked += "\n";
                                break;

                              case "r":
                                cooked += "\r";
                                break;

                              case "t":
                                cooked += "\t";
                                break;

                              case "u":
                              case "x":
                                if ("{" === this.source[this.index]) ++this.index, cooked += this.scanUnicodeCodePointEscape(); else {
                                    var restore = this.index, unescaped = this.scanHexEscape(ch);
                                    unescaped ? cooked += unescaped : (this.index = restore, cooked += ch);
                                }
                                break;

                              case "b":
                                cooked += "\b";
                                break;

                              case "f":
                                cooked += "\f";
                                break;

                              case "v":
                                cooked += "\v";
                                break;

                              default:
                                "0" === ch ? (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index)) && this.throwUnexpectedToken(messages_1.Messages.TemplateOctalLiteral), 
                                cooked += "\0") : character_1.Character.isOctalDigit(ch.charCodeAt(0)) ? this.throwUnexpectedToken(messages_1.Messages.TemplateOctalLiteral) : cooked += ch;
                            } else character_1.Character.isLineTerminator(ch.charCodeAt(0)) ? (++this.lineNumber, 
                            "\r" === ch && "\n" === this.source[this.index] && ++this.index, this.lineStart = this.index, 
                            cooked += "\n") : cooked += ch;
                        }
                        return terminated || this.throwUnexpectedToken(), head || this.curlyStack.pop(), 
                        {
                            type: token_1.Token.Template,
                            value: {
                                cooked: cooked,
                                raw: this.source.slice(start + 1, this.index - rawOffset)
                            },
                            head: head,
                            tail: tail,
                            lineNumber: this.lineNumber,
                            lineStart: this.lineStart,
                            start: start,
                            end: this.index
                        };
                    }, Scanner.prototype.testRegExp = function(pattern, flags) {
                        var astralSubstitute = "￿", tmp = pattern, self = this;
                        flags.indexOf("u") >= 0 && (tmp = tmp.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([a-fA-F0-9]{4})/g, function($0, $1, $2) {
                            var codePoint = parseInt($1 || $2, 16);
                            return codePoint > 1114111 && self.throwUnexpectedToken(messages_1.Messages.InvalidRegExp), 
                            codePoint <= 65535 ? String.fromCharCode(codePoint) : astralSubstitute;
                        }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, astralSubstitute));
                        try {
                            RegExp(tmp);
                        } catch (e) {
                            this.throwUnexpectedToken(messages_1.Messages.InvalidRegExp);
                        }
                        try {
                            return new RegExp(pattern, flags);
                        } catch (exception) {
                            return null;
                        }
                    }, Scanner.prototype.scanRegExpBody = function() {
                        var ch = this.source[this.index];
                        assert_1.assert("/" === ch, "Regular expression literal must start with a slash");
                        for (var str = this.source[this.index++], classMarker = !1, terminated = !1; !this.eof(); ) if (ch = this.source[this.index++], 
                        str += ch, "\\" === ch) ch = this.source[this.index++], character_1.Character.isLineTerminator(ch.charCodeAt(0)) && this.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp), 
                        str += ch; else if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) this.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp); else if (classMarker) "]" === ch && (classMarker = !1); else {
                            if ("/" === ch) {
                                terminated = !0;
                                break;
                            }
                            "[" === ch && (classMarker = !0);
                        }
                        terminated || this.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp);
                        var body = str.substr(1, str.length - 2);
                        return {
                            value: body,
                            literal: str
                        };
                    }, Scanner.prototype.scanRegExpFlags = function() {
                        for (var str = "", flags = ""; !this.eof(); ) {
                            var ch = this.source[this.index];
                            if (!character_1.Character.isIdentifierPart(ch.charCodeAt(0))) break;
                            if (++this.index, "\\" !== ch || this.eof()) flags += ch, str += ch; else if (ch = this.source[this.index], 
                            "u" === ch) {
                                ++this.index;
                                var restore = this.index;
                                if (ch = this.scanHexEscape("u")) for (flags += ch, str += "\\u"; restore < this.index; ++restore) str += this.source[restore]; else this.index = restore, 
                                flags += "u", str += "\\u";
                                this.tolerateUnexpectedToken();
                            } else str += "\\", this.tolerateUnexpectedToken();
                        }
                        return {
                            value: flags,
                            literal: str
                        };
                    }, Scanner.prototype.scanRegExp = function() {
                        var start = this.index, body = this.scanRegExpBody(), flags = this.scanRegExpFlags(), value = this.testRegExp(body.value, flags.value);
                        return {
                            type: token_1.Token.RegularExpression,
                            value: value,
                            literal: body.literal + flags.literal,
                            regex: {
                                pattern: body.value,
                                flags: flags.value
                            },
                            lineNumber: this.lineNumber,
                            lineStart: this.lineStart,
                            start: start,
                            end: this.index
                        };
                    }, Scanner.prototype.lex = function() {
                        if (this.eof()) return {
                            type: token_1.Token.EOF,
                            lineNumber: this.lineNumber,
                            lineStart: this.lineStart,
                            start: this.index,
                            end: this.index
                        };
                        var cp = this.source.charCodeAt(this.index);
                        return character_1.Character.isIdentifierStart(cp) ? this.scanIdentifier() : 40 === cp || 41 === cp || 59 === cp ? this.scanPunctuator() : 39 === cp || 34 === cp ? this.scanStringLiteral() : 46 === cp ? character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index + 1)) ? this.scanNumericLiteral() : this.scanPunctuator() : character_1.Character.isDecimalDigit(cp) ? this.scanNumericLiteral() : 96 === cp || 125 === cp && "${" === this.curlyStack[this.curlyStack.length - 1] ? this.scanTemplate() : cp >= 55296 && cp < 57343 && character_1.Character.isIdentifierStart(this.codePointAt(this.index)) ? this.scanIdentifier() : this.scanPunctuator();
                    }, Scanner;
                }();
                exports.Scanner = Scanner;
            }, function(module, exports) {
                var Regex = {
                    NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/,
                    NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
                };
                exports.Character = {
                    fromCodePoint: function(cp) {
                        return cp < 65536 ? String.fromCharCode(cp) : String.fromCharCode(55296 + (cp - 65536 >> 10)) + String.fromCharCode(56320 + (cp - 65536 & 1023));
                    },
                    isWhiteSpace: function(cp) {
                        return 32 === cp || 9 === cp || 11 === cp || 12 === cp || 160 === cp || cp >= 5760 && [ 5760, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8239, 8287, 12288, 65279 ].indexOf(cp) >= 0;
                    },
                    isLineTerminator: function(cp) {
                        return 10 === cp || 13 === cp || 8232 === cp || 8233 === cp;
                    },
                    isIdentifierStart: function(cp) {
                        return 36 === cp || 95 === cp || cp >= 65 && cp <= 90 || cp >= 97 && cp <= 122 || 92 === cp || cp >= 128 && Regex.NonAsciiIdentifierStart.test(exports.Character.fromCodePoint(cp));
                    },
                    isIdentifierPart: function(cp) {
                        return 36 === cp || 95 === cp || cp >= 65 && cp <= 90 || cp >= 97 && cp <= 122 || cp >= 48 && cp <= 57 || 92 === cp || cp >= 128 && Regex.NonAsciiIdentifierPart.test(exports.Character.fromCodePoint(cp));
                    },
                    isDecimalDigit: function(cp) {
                        return cp >= 48 && cp <= 57;
                    },
                    isHexDigit: function(cp) {
                        return cp >= 48 && cp <= 57 || cp >= 65 && cp <= 70 || cp >= 97 && cp <= 102;
                    },
                    isOctalDigit: function(cp) {
                        return cp >= 48 && cp <= 55;
                    }
                };
            }, function(module, exports, __webpack_require__) {
                var syntax_1 = __webpack_require__(2), ArrayExpression = function() {
                    function ArrayExpression(elements) {
                        this.type = syntax_1.Syntax.ArrayExpression, this.elements = elements;
                    }
                    return ArrayExpression;
                }();
                exports.ArrayExpression = ArrayExpression;
                var ArrayPattern = function() {
                    function ArrayPattern(elements) {
                        this.type = syntax_1.Syntax.ArrayPattern, this.elements = elements;
                    }
                    return ArrayPattern;
                }();
                exports.ArrayPattern = ArrayPattern;
                var ArrowFunctionExpression = function() {
                    function ArrowFunctionExpression(params, body, expression) {
                        this.type = syntax_1.Syntax.ArrowFunctionExpression, this.id = null, this.params = params, 
                        this.body = body, this.generator = !1, this.expression = expression;
                    }
                    return ArrowFunctionExpression;
                }();
                exports.ArrowFunctionExpression = ArrowFunctionExpression;
                var AssignmentExpression = function() {
                    function AssignmentExpression(operator, left, right) {
                        this.type = syntax_1.Syntax.AssignmentExpression, this.operator = operator, this.left = left, 
                        this.right = right;
                    }
                    return AssignmentExpression;
                }();
                exports.AssignmentExpression = AssignmentExpression;
                var AssignmentPattern = function() {
                    function AssignmentPattern(left, right) {
                        this.type = syntax_1.Syntax.AssignmentPattern, this.left = left, this.right = right;
                    }
                    return AssignmentPattern;
                }();
                exports.AssignmentPattern = AssignmentPattern;
                var BinaryExpression = function() {
                    function BinaryExpression(operator, left, right) {
                        var logical = "||" === operator || "&&" === operator;
                        this.type = logical ? syntax_1.Syntax.LogicalExpression : syntax_1.Syntax.BinaryExpression, 
                        this.operator = operator, this.left = left, this.right = right;
                    }
                    return BinaryExpression;
                }();
                exports.BinaryExpression = BinaryExpression;
                var BlockStatement = function() {
                    function BlockStatement(body) {
                        this.type = syntax_1.Syntax.BlockStatement, this.body = body;
                    }
                    return BlockStatement;
                }();
                exports.BlockStatement = BlockStatement;
                var BreakStatement = function() {
                    function BreakStatement(label) {
                        this.type = syntax_1.Syntax.BreakStatement, this.label = label;
                    }
                    return BreakStatement;
                }();
                exports.BreakStatement = BreakStatement;
                var CallExpression = function() {
                    function CallExpression(callee, args) {
                        this.type = syntax_1.Syntax.CallExpression, this.callee = callee, this.arguments = args;
                    }
                    return CallExpression;
                }();
                exports.CallExpression = CallExpression;
                var CatchClause = function() {
                    function CatchClause(param, body) {
                        this.type = syntax_1.Syntax.CatchClause, this.param = param, this.body = body;
                    }
                    return CatchClause;
                }();
                exports.CatchClause = CatchClause;
                var ClassBody = function() {
                    function ClassBody(body) {
                        this.type = syntax_1.Syntax.ClassBody, this.body = body;
                    }
                    return ClassBody;
                }();
                exports.ClassBody = ClassBody;
                var ClassDeclaration = function() {
                    function ClassDeclaration(id, superClass, body) {
                        this.type = syntax_1.Syntax.ClassDeclaration, this.id = id, this.superClass = superClass, 
                        this.body = body;
                    }
                    return ClassDeclaration;
                }();
                exports.ClassDeclaration = ClassDeclaration;
                var ClassExpression = function() {
                    function ClassExpression(id, superClass, body) {
                        this.type = syntax_1.Syntax.ClassExpression, this.id = id, this.superClass = superClass, 
                        this.body = body;
                    }
                    return ClassExpression;
                }();
                exports.ClassExpression = ClassExpression;
                var ComputedMemberExpression = function() {
                    function ComputedMemberExpression(object, property) {
                        this.type = syntax_1.Syntax.MemberExpression, this.computed = !0, this.object = object, 
                        this.property = property;
                    }
                    return ComputedMemberExpression;
                }();
                exports.ComputedMemberExpression = ComputedMemberExpression;
                var ConditionalExpression = function() {
                    function ConditionalExpression(test, consequent, alternate) {
                        this.type = syntax_1.Syntax.ConditionalExpression, this.test = test, this.consequent = consequent, 
                        this.alternate = alternate;
                    }
                    return ConditionalExpression;
                }();
                exports.ConditionalExpression = ConditionalExpression;
                var ContinueStatement = function() {
                    function ContinueStatement(label) {
                        this.type = syntax_1.Syntax.ContinueStatement, this.label = label;
                    }
                    return ContinueStatement;
                }();
                exports.ContinueStatement = ContinueStatement;
                var DebuggerStatement = function() {
                    function DebuggerStatement() {
                        this.type = syntax_1.Syntax.DebuggerStatement;
                    }
                    return DebuggerStatement;
                }();
                exports.DebuggerStatement = DebuggerStatement;
                var Directive = function() {
                    function Directive(expression, directive) {
                        this.type = syntax_1.Syntax.ExpressionStatement, this.expression = expression, this.directive = directive;
                    }
                    return Directive;
                }();
                exports.Directive = Directive;
                var DoWhileStatement = function() {
                    function DoWhileStatement(body, test) {
                        this.type = syntax_1.Syntax.DoWhileStatement, this.body = body, this.test = test;
                    }
                    return DoWhileStatement;
                }();
                exports.DoWhileStatement = DoWhileStatement;
                var EmptyStatement = function() {
                    function EmptyStatement() {
                        this.type = syntax_1.Syntax.EmptyStatement;
                    }
                    return EmptyStatement;
                }();
                exports.EmptyStatement = EmptyStatement;
                var ExportAllDeclaration = function() {
                    function ExportAllDeclaration(source) {
                        this.type = syntax_1.Syntax.ExportAllDeclaration, this.source = source;
                    }
                    return ExportAllDeclaration;
                }();
                exports.ExportAllDeclaration = ExportAllDeclaration;
                var ExportDefaultDeclaration = function() {
                    function ExportDefaultDeclaration(declaration) {
                        this.type = syntax_1.Syntax.ExportDefaultDeclaration, this.declaration = declaration;
                    }
                    return ExportDefaultDeclaration;
                }();
                exports.ExportDefaultDeclaration = ExportDefaultDeclaration;
                var ExportNamedDeclaration = function() {
                    function ExportNamedDeclaration(declaration, specifiers, source) {
                        this.type = syntax_1.Syntax.ExportNamedDeclaration, this.declaration = declaration, 
                        this.specifiers = specifiers, this.source = source;
                    }
                    return ExportNamedDeclaration;
                }();
                exports.ExportNamedDeclaration = ExportNamedDeclaration;
                var ExportSpecifier = function() {
                    function ExportSpecifier(local, exported) {
                        this.type = syntax_1.Syntax.ExportSpecifier, this.exported = exported, this.local = local;
                    }
                    return ExportSpecifier;
                }();
                exports.ExportSpecifier = ExportSpecifier;
                var ExpressionStatement = function() {
                    function ExpressionStatement(expression) {
                        this.type = syntax_1.Syntax.ExpressionStatement, this.expression = expression;
                    }
                    return ExpressionStatement;
                }();
                exports.ExpressionStatement = ExpressionStatement;
                var ForInStatement = function() {
                    function ForInStatement(left, right, body) {
                        this.type = syntax_1.Syntax.ForInStatement, this.left = left, this.right = right, 
                        this.body = body, this.each = !1;
                    }
                    return ForInStatement;
                }();
                exports.ForInStatement = ForInStatement;
                var ForOfStatement = function() {
                    function ForOfStatement(left, right, body) {
                        this.type = syntax_1.Syntax.ForOfStatement, this.left = left, this.right = right, 
                        this.body = body;
                    }
                    return ForOfStatement;
                }();
                exports.ForOfStatement = ForOfStatement;
                var ForStatement = function() {
                    function ForStatement(init, test, update, body) {
                        this.type = syntax_1.Syntax.ForStatement, this.init = init, this.test = test, this.update = update, 
                        this.body = body;
                    }
                    return ForStatement;
                }();
                exports.ForStatement = ForStatement;
                var FunctionDeclaration = function() {
                    function FunctionDeclaration(id, params, body, generator) {
                        this.type = syntax_1.Syntax.FunctionDeclaration, this.id = id, this.params = params, 
                        this.body = body, this.generator = generator, this.expression = !1;
                    }
                    return FunctionDeclaration;
                }();
                exports.FunctionDeclaration = FunctionDeclaration;
                var FunctionExpression = function() {
                    function FunctionExpression(id, params, body, generator) {
                        this.type = syntax_1.Syntax.FunctionExpression, this.id = id, this.params = params, 
                        this.body = body, this.generator = generator, this.expression = !1;
                    }
                    return FunctionExpression;
                }();
                exports.FunctionExpression = FunctionExpression;
                var Identifier = function() {
                    function Identifier(name) {
                        this.type = syntax_1.Syntax.Identifier, this.name = name;
                    }
                    return Identifier;
                }();
                exports.Identifier = Identifier;
                var IfStatement = function() {
                    function IfStatement(test, consequent, alternate) {
                        this.type = syntax_1.Syntax.IfStatement, this.test = test, this.consequent = consequent, 
                        this.alternate = alternate;
                    }
                    return IfStatement;
                }();
                exports.IfStatement = IfStatement;
                var ImportDeclaration = function() {
                    function ImportDeclaration(specifiers, source) {
                        this.type = syntax_1.Syntax.ImportDeclaration, this.specifiers = specifiers, this.source = source;
                    }
                    return ImportDeclaration;
                }();
                exports.ImportDeclaration = ImportDeclaration;
                var ImportDefaultSpecifier = function() {
                    function ImportDefaultSpecifier(local) {
                        this.type = syntax_1.Syntax.ImportDefaultSpecifier, this.local = local;
                    }
                    return ImportDefaultSpecifier;
                }();
                exports.ImportDefaultSpecifier = ImportDefaultSpecifier;
                var ImportNamespaceSpecifier = function() {
                    function ImportNamespaceSpecifier(local) {
                        this.type = syntax_1.Syntax.ImportNamespaceSpecifier, this.local = local;
                    }
                    return ImportNamespaceSpecifier;
                }();
                exports.ImportNamespaceSpecifier = ImportNamespaceSpecifier;
                var ImportSpecifier = function() {
                    function ImportSpecifier(local, imported) {
                        this.type = syntax_1.Syntax.ImportSpecifier, this.local = local, this.imported = imported;
                    }
                    return ImportSpecifier;
                }();
                exports.ImportSpecifier = ImportSpecifier;
                var LabeledStatement = function() {
                    function LabeledStatement(label, body) {
                        this.type = syntax_1.Syntax.LabeledStatement, this.label = label, this.body = body;
                    }
                    return LabeledStatement;
                }();
                exports.LabeledStatement = LabeledStatement;
                var Literal = function() {
                    function Literal(value, raw) {
                        this.type = syntax_1.Syntax.Literal, this.value = value, this.raw = raw;
                    }
                    return Literal;
                }();
                exports.Literal = Literal;
                var MetaProperty = function() {
                    function MetaProperty(meta, property) {
                        this.type = syntax_1.Syntax.MetaProperty, this.meta = meta, this.property = property;
                    }
                    return MetaProperty;
                }();
                exports.MetaProperty = MetaProperty;
                var MethodDefinition = function() {
                    function MethodDefinition(key, computed, value, kind, isStatic) {
                        this.type = syntax_1.Syntax.MethodDefinition, this.key = key, this.computed = computed, 
                        this.value = value, this.kind = kind, this.static = isStatic;
                    }
                    return MethodDefinition;
                }();
                exports.MethodDefinition = MethodDefinition;
                var NewExpression = function() {
                    function NewExpression(callee, args) {
                        this.type = syntax_1.Syntax.NewExpression, this.callee = callee, this.arguments = args;
                    }
                    return NewExpression;
                }();
                exports.NewExpression = NewExpression;
                var ObjectExpression = function() {
                    function ObjectExpression(properties) {
                        this.type = syntax_1.Syntax.ObjectExpression, this.properties = properties;
                    }
                    return ObjectExpression;
                }();
                exports.ObjectExpression = ObjectExpression;
                var ObjectPattern = function() {
                    function ObjectPattern(properties) {
                        this.type = syntax_1.Syntax.ObjectPattern, this.properties = properties;
                    }
                    return ObjectPattern;
                }();
                exports.ObjectPattern = ObjectPattern;
                var Program = function() {
                    function Program(body, sourceType) {
                        this.type = syntax_1.Syntax.Program, this.body = body, this.sourceType = sourceType;
                    }
                    return Program;
                }();
                exports.Program = Program;
                var Property = function() {
                    function Property(kind, key, computed, value, method, shorthand) {
                        this.type = syntax_1.Syntax.Property, this.key = key, this.computed = computed, 
                        this.value = value, this.kind = kind, this.method = method, this.shorthand = shorthand;
                    }
                    return Property;
                }();
                exports.Property = Property;
                var RegexLiteral = function() {
                    function RegexLiteral(value, raw, regex) {
                        this.type = syntax_1.Syntax.Literal, this.value = value, this.raw = raw, this.regex = regex;
                    }
                    return RegexLiteral;
                }();
                exports.RegexLiteral = RegexLiteral;
                var RestElement = function() {
                    function RestElement(argument) {
                        this.type = syntax_1.Syntax.RestElement, this.argument = argument;
                    }
                    return RestElement;
                }();
                exports.RestElement = RestElement;
                var ReturnStatement = function() {
                    function ReturnStatement(argument) {
                        this.type = syntax_1.Syntax.ReturnStatement, this.argument = argument;
                    }
                    return ReturnStatement;
                }();
                exports.ReturnStatement = ReturnStatement;
                var SequenceExpression = function() {
                    function SequenceExpression(expressions) {
                        this.type = syntax_1.Syntax.SequenceExpression, this.expressions = expressions;
                    }
                    return SequenceExpression;
                }();
                exports.SequenceExpression = SequenceExpression;
                var SpreadElement = function() {
                    function SpreadElement(argument) {
                        this.type = syntax_1.Syntax.SpreadElement, this.argument = argument;
                    }
                    return SpreadElement;
                }();
                exports.SpreadElement = SpreadElement;
                var StaticMemberExpression = function() {
                    function StaticMemberExpression(object, property) {
                        this.type = syntax_1.Syntax.MemberExpression, this.computed = !1, this.object = object, 
                        this.property = property;
                    }
                    return StaticMemberExpression;
                }();
                exports.StaticMemberExpression = StaticMemberExpression;
                var Super = function() {
                    function Super() {
                        this.type = syntax_1.Syntax.Super;
                    }
                    return Super;
                }();
                exports.Super = Super;
                var SwitchCase = function() {
                    function SwitchCase(test, consequent) {
                        this.type = syntax_1.Syntax.SwitchCase, this.test = test, this.consequent = consequent;
                    }
                    return SwitchCase;
                }();
                exports.SwitchCase = SwitchCase;
                var SwitchStatement = function() {
                    function SwitchStatement(discriminant, cases) {
                        this.type = syntax_1.Syntax.SwitchStatement, this.discriminant = discriminant, this.cases = cases;
                    }
                    return SwitchStatement;
                }();
                exports.SwitchStatement = SwitchStatement;
                var TaggedTemplateExpression = function() {
                    function TaggedTemplateExpression(tag, quasi) {
                        this.type = syntax_1.Syntax.TaggedTemplateExpression, this.tag = tag, this.quasi = quasi;
                    }
                    return TaggedTemplateExpression;
                }();
                exports.TaggedTemplateExpression = TaggedTemplateExpression;
                var TemplateElement = function() {
                    function TemplateElement(value, tail) {
                        this.type = syntax_1.Syntax.TemplateElement, this.value = value, this.tail = tail;
                    }
                    return TemplateElement;
                }();
                exports.TemplateElement = TemplateElement;
                var TemplateLiteral = function() {
                    function TemplateLiteral(quasis, expressions) {
                        this.type = syntax_1.Syntax.TemplateLiteral, this.quasis = quasis, this.expressions = expressions;
                    }
                    return TemplateLiteral;
                }();
                exports.TemplateLiteral = TemplateLiteral;
                var ThisExpression = function() {
                    function ThisExpression() {
                        this.type = syntax_1.Syntax.ThisExpression;
                    }
                    return ThisExpression;
                }();
                exports.ThisExpression = ThisExpression;
                var ThrowStatement = function() {
                    function ThrowStatement(argument) {
                        this.type = syntax_1.Syntax.ThrowStatement, this.argument = argument;
                    }
                    return ThrowStatement;
                }();
                exports.ThrowStatement = ThrowStatement;
                var TryStatement = function() {
                    function TryStatement(block, handler, finalizer) {
                        this.type = syntax_1.Syntax.TryStatement, this.block = block, this.handler = handler, 
                        this.finalizer = finalizer;
                    }
                    return TryStatement;
                }();
                exports.TryStatement = TryStatement;
                var UnaryExpression = function() {
                    function UnaryExpression(operator, argument) {
                        this.type = syntax_1.Syntax.UnaryExpression, this.operator = operator, this.argument = argument, 
                        this.prefix = !0;
                    }
                    return UnaryExpression;
                }();
                exports.UnaryExpression = UnaryExpression;
                var UpdateExpression = function() {
                    function UpdateExpression(operator, argument, prefix) {
                        this.type = syntax_1.Syntax.UpdateExpression, this.operator = operator, this.argument = argument, 
                        this.prefix = prefix;
                    }
                    return UpdateExpression;
                }();
                exports.UpdateExpression = UpdateExpression;
                var VariableDeclaration = function() {
                    function VariableDeclaration(declarations, kind) {
                        this.type = syntax_1.Syntax.VariableDeclaration, this.declarations = declarations, 
                        this.kind = kind;
                    }
                    return VariableDeclaration;
                }();
                exports.VariableDeclaration = VariableDeclaration;
                var VariableDeclarator = function() {
                    function VariableDeclarator(id, init) {
                        this.type = syntax_1.Syntax.VariableDeclarator, this.id = id, this.init = init;
                    }
                    return VariableDeclarator;
                }();
                exports.VariableDeclarator = VariableDeclarator;
                var WhileStatement = function() {
                    function WhileStatement(test, body) {
                        this.type = syntax_1.Syntax.WhileStatement, this.test = test, this.body = body;
                    }
                    return WhileStatement;
                }();
                exports.WhileStatement = WhileStatement;
                var WithStatement = function() {
                    function WithStatement(object, body) {
                        this.type = syntax_1.Syntax.WithStatement, this.object = object, this.body = body;
                    }
                    return WithStatement;
                }();
                exports.WithStatement = WithStatement;
                var YieldExpression = function() {
                    function YieldExpression(argument, delegate) {
                        this.type = syntax_1.Syntax.YieldExpression, this.argument = argument, this.delegate = delegate;
                    }
                    return YieldExpression;
                }();
                exports.YieldExpression = YieldExpression;
            }, function(module, exports, __webpack_require__) {
                function getQualifiedElementName(elementName) {
                    var qualifiedName;
                    switch (elementName.type) {
                      case jsx_syntax_1.JSXSyntax.JSXIdentifier:
                        var id = elementName;
                        qualifiedName = id.name;
                        break;

                      case jsx_syntax_1.JSXSyntax.JSXNamespacedName:
                        var ns = elementName;
                        qualifiedName = getQualifiedElementName(ns.namespace) + ":" + getQualifiedElementName(ns.name);
                        break;

                      case jsx_syntax_1.JSXSyntax.JSXMemberExpression:
                        var expr = elementName;
                        qualifiedName = getQualifiedElementName(expr.object) + "." + getQualifiedElementName(expr.property);
                    }
                    return qualifiedName;
                }
                var JSXToken, __extends = this && this.__extends || function(d, b) {
                    function __() {
                        this.constructor = d;
                    }
                    for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
                    d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
                }, character_1 = __webpack_require__(9), token_1 = __webpack_require__(7), parser_1 = __webpack_require__(3), xhtml_entities_1 = __webpack_require__(12), jsx_syntax_1 = __webpack_require__(13), Node = __webpack_require__(10), JSXNode = __webpack_require__(14);
                !function(JSXToken) {
                    JSXToken[JSXToken.Identifier = 100] = "Identifier", JSXToken[JSXToken.Text = 101] = "Text";
                }(JSXToken || (JSXToken = {})), token_1.TokenName[JSXToken.Identifier] = "JSXIdentifier", 
                token_1.TokenName[JSXToken.Text] = "JSXText";
                var JSXParser = function(_super) {
                    function JSXParser(code, options, delegate) {
                        _super.call(this, code, options, delegate);
                    }
                    return __extends(JSXParser, _super), JSXParser.prototype.parsePrimaryExpression = function() {
                        return this.match("<") ? this.parseJSXRoot() : _super.prototype.parsePrimaryExpression.call(this);
                    }, JSXParser.prototype.startJSX = function() {
                        this.scanner.index = this.startMarker.index, this.scanner.lineNumber = this.startMarker.lineNumber, 
                        this.scanner.lineStart = this.startMarker.lineStart;
                    }, JSXParser.prototype.finishJSX = function() {
                        this.nextToken();
                    }, JSXParser.prototype.reenterJSX = function() {
                        this.startJSX(), this.expectJSX("}"), this.config.tokens && this.tokens.pop();
                    }, JSXParser.prototype.createJSXNode = function() {
                        return this.collectComments(), {
                            index: this.scanner.index,
                            line: this.scanner.lineNumber,
                            column: this.scanner.index - this.scanner.lineStart
                        };
                    }, JSXParser.prototype.createJSXChildNode = function() {
                        return {
                            index: this.scanner.index,
                            line: this.scanner.lineNumber,
                            column: this.scanner.index - this.scanner.lineStart
                        };
                    }, JSXParser.prototype.scanXHTMLEntity = function(quote) {
                        for (var result = "&", valid = !0, terminated = !1, numeric = !1, hex = !1; !this.scanner.eof() && valid && !terminated; ) {
                            var ch = this.scanner.source[this.scanner.index];
                            if (ch === quote) break;
                            if (terminated = ";" === ch, result += ch, ++this.scanner.index, !terminated) switch (result.length) {
                              case 2:
                                numeric = "#" === ch;
                                break;

                              case 3:
                                numeric && (hex = "x" === ch, valid = hex || character_1.Character.isDecimalDigit(ch.charCodeAt(0)), 
                                numeric = numeric && !hex);
                                break;

                              default:
                                valid = valid && !(numeric && !character_1.Character.isDecimalDigit(ch.charCodeAt(0))), 
                                valid = valid && !(hex && !character_1.Character.isHexDigit(ch.charCodeAt(0)));
                            }
                        }
                        if (valid && terminated && result.length > 2) {
                            var str = result.substr(1, result.length - 2);
                            numeric && str.length > 1 ? result = String.fromCharCode(parseInt(str.substr(1), 10)) : hex && str.length > 2 ? result = String.fromCharCode(parseInt("0" + str.substr(1), 16)) : numeric || hex || !xhtml_entities_1.XHTMLEntities[str] || (result = xhtml_entities_1.XHTMLEntities[str]);
                        }
                        return result;
                    }, JSXParser.prototype.lexJSX = function() {
                        var cp = this.scanner.source.charCodeAt(this.scanner.index);
                        if (60 === cp || 62 === cp || 47 === cp || 58 === cp || 61 === cp || 123 === cp || 125 === cp) {
                            var value = this.scanner.source[this.scanner.index++];
                            return {
                                type: token_1.Token.Punctuator,
                                value: value,
                                lineNumber: this.scanner.lineNumber,
                                lineStart: this.scanner.lineStart,
                                start: this.scanner.index - 1,
                                end: this.scanner.index
                            };
                        }
                        if (34 === cp || 39 === cp) {
                            for (var start = this.scanner.index, quote = this.scanner.source[this.scanner.index++], str = ""; !this.scanner.eof(); ) {
                                var ch = this.scanner.source[this.scanner.index++];
                                if (ch === quote) break;
                                str += "&" === ch ? this.scanXHTMLEntity(quote) : ch;
                            }
                            return {
                                type: token_1.Token.StringLiteral,
                                value: str,
                                lineNumber: this.scanner.lineNumber,
                                lineStart: this.scanner.lineStart,
                                start: start,
                                end: this.scanner.index
                            };
                        }
                        if (46 === cp) {
                            var n1 = this.scanner.source.charCodeAt(this.scanner.index + 1), n2 = this.scanner.source.charCodeAt(this.scanner.index + 2), value = 46 === n1 && 46 === n2 ? "..." : ".", start = this.scanner.index;
                            return this.scanner.index += value.length, {
                                type: token_1.Token.Punctuator,
                                value: value,
                                lineNumber: this.scanner.lineNumber,
                                lineStart: this.scanner.lineStart,
                                start: start,
                                end: this.scanner.index
                            };
                        }
                        if (96 === cp) return {
                            type: token_1.Token.Template,
                            lineNumber: this.scanner.lineNumber,
                            lineStart: this.scanner.lineStart,
                            start: this.scanner.index,
                            end: this.scanner.index
                        };
                        if (character_1.Character.isIdentifierStart(cp) && 92 !== cp) {
                            var start = this.scanner.index;
                            for (++this.scanner.index; !this.scanner.eof(); ) {
                                var ch = this.scanner.source.charCodeAt(this.scanner.index);
                                if (character_1.Character.isIdentifierPart(ch) && 92 !== ch) ++this.scanner.index; else {
                                    if (45 !== ch) break;
                                    ++this.scanner.index;
                                }
                            }
                            var id = this.scanner.source.slice(start, this.scanner.index);
                            return {
                                type: JSXToken.Identifier,
                                value: id,
                                lineNumber: this.scanner.lineNumber,
                                lineStart: this.scanner.lineStart,
                                start: start,
                                end: this.scanner.index
                            };
                        }
                        this.scanner.throwUnexpectedToken();
                    }, JSXParser.prototype.nextJSXToken = function() {
                        this.collectComments(), this.startMarker.index = this.scanner.index, this.startMarker.lineNumber = this.scanner.lineNumber, 
                        this.startMarker.lineStart = this.scanner.lineStart;
                        var token = this.lexJSX();
                        return this.lastMarker.index = this.scanner.index, this.lastMarker.lineNumber = this.scanner.lineNumber, 
                        this.lastMarker.lineStart = this.scanner.lineStart, this.config.tokens && this.tokens.push(this.convertToken(token)), 
                        token;
                    }, JSXParser.prototype.nextJSXText = function() {
                        this.startMarker.index = this.scanner.index, this.startMarker.lineNumber = this.scanner.lineNumber, 
                        this.startMarker.lineStart = this.scanner.lineStart;
                        for (var start = this.scanner.index, text = ""; !this.scanner.eof(); ) {
                            var ch = this.scanner.source[this.scanner.index];
                            if ("{" === ch || "<" === ch) break;
                            ++this.scanner.index, text += ch, character_1.Character.isLineTerminator(ch.charCodeAt(0)) && (++this.scanner.lineNumber, 
                            "\r" === ch && "\n" === this.scanner.source[this.scanner.index] && ++this.scanner.index, 
                            this.scanner.lineStart = this.scanner.index);
                        }
                        this.lastMarker.index = this.scanner.index, this.lastMarker.lineNumber = this.scanner.lineNumber, 
                        this.lastMarker.lineStart = this.scanner.lineStart;
                        var token = {
                            type: JSXToken.Text,
                            value: text,
                            lineNumber: this.scanner.lineNumber,
                            lineStart: this.scanner.lineStart,
                            start: start,
                            end: this.scanner.index
                        };
                        return text.length > 0 && this.config.tokens && this.tokens.push(this.convertToken(token)), 
                        token;
                    }, JSXParser.prototype.peekJSXToken = function() {
                        var previousIndex = this.scanner.index, previousLineNumber = this.scanner.lineNumber, previousLineStart = this.scanner.lineStart;
                        this.scanner.scanComments();
                        var next = this.lexJSX();
                        return this.scanner.index = previousIndex, this.scanner.lineNumber = previousLineNumber, 
                        this.scanner.lineStart = previousLineStart, next;
                    }, JSXParser.prototype.expectJSX = function(value) {
                        var token = this.nextJSXToken();
                        token.type === token_1.Token.Punctuator && token.value === value || this.throwUnexpectedToken(token);
                    }, JSXParser.prototype.matchJSX = function(value) {
                        var next = this.peekJSXToken();
                        return next.type === token_1.Token.Punctuator && next.value === value;
                    }, JSXParser.prototype.parseJSXIdentifier = function() {
                        var node = this.createJSXNode(), token = this.nextJSXToken();
                        return token.type !== JSXToken.Identifier && this.throwUnexpectedToken(token), this.finalize(node, new JSXNode.JSXIdentifier(token.value));
                    }, JSXParser.prototype.parseJSXElementName = function() {
                        var node = this.createJSXNode(), elementName = this.parseJSXIdentifier();
                        if (this.matchJSX(":")) {
                            var namespace = elementName;
                            this.expectJSX(":");
                            var name_1 = this.parseJSXIdentifier();
                            elementName = this.finalize(node, new JSXNode.JSXNamespacedName(namespace, name_1));
                        } else if (this.matchJSX(".")) for (;this.matchJSX("."); ) {
                            var object = elementName;
                            this.expectJSX(".");
                            var property = this.parseJSXIdentifier();
                            elementName = this.finalize(node, new JSXNode.JSXMemberExpression(object, property));
                        }
                        return elementName;
                    }, JSXParser.prototype.parseJSXAttributeName = function() {
                        var attributeName, node = this.createJSXNode(), identifier = this.parseJSXIdentifier();
                        if (this.matchJSX(":")) {
                            var namespace = identifier;
                            this.expectJSX(":");
                            var name_2 = this.parseJSXIdentifier();
                            attributeName = this.finalize(node, new JSXNode.JSXNamespacedName(namespace, name_2));
                        } else attributeName = identifier;
                        return attributeName;
                    }, JSXParser.prototype.parseJSXStringLiteralAttribute = function() {
                        var node = this.createJSXNode(), token = this.nextJSXToken();
                        token.type !== token_1.Token.StringLiteral && this.throwUnexpectedToken(token);
                        var raw = this.getTokenRaw(token);
                        return this.finalize(node, new Node.Literal(token.value, raw));
                    }, JSXParser.prototype.parseJSXExpressionAttribute = function() {
                        var node = this.createJSXNode();
                        this.expectJSX("{"), this.finishJSX(), this.match("}") && this.tolerateError("JSX attributes must only be assigned a non-empty expression");
                        var expression = this.parseAssignmentExpression();
                        return this.reenterJSX(), this.finalize(node, new JSXNode.JSXExpressionContainer(expression));
                    }, JSXParser.prototype.parseJSXAttributeValue = function() {
                        return this.matchJSX("{") ? this.parseJSXExpressionAttribute() : this.matchJSX("<") ? this.parseJSXElement() : this.parseJSXStringLiteralAttribute();
                    }, JSXParser.prototype.parseJSXNameValueAttribute = function() {
                        var node = this.createJSXNode(), name = this.parseJSXAttributeName(), value = null;
                        return this.matchJSX("=") && (this.expectJSX("="), value = this.parseJSXAttributeValue()), 
                        this.finalize(node, new JSXNode.JSXAttribute(name, value));
                    }, JSXParser.prototype.parseJSXSpreadAttribute = function() {
                        var node = this.createJSXNode();
                        this.expectJSX("{"), this.expectJSX("..."), this.finishJSX();
                        var argument = this.parseAssignmentExpression();
                        return this.reenterJSX(), this.finalize(node, new JSXNode.JSXSpreadAttribute(argument));
                    }, JSXParser.prototype.parseJSXAttributes = function() {
                        for (var attributes = []; !this.matchJSX("/") && !this.matchJSX(">"); ) {
                            var attribute = this.matchJSX("{") ? this.parseJSXSpreadAttribute() : this.parseJSXNameValueAttribute();
                            attributes.push(attribute);
                        }
                        return attributes;
                    }, JSXParser.prototype.parseJSXOpeningElement = function() {
                        var node = this.createJSXNode();
                        this.expectJSX("<");
                        var name = this.parseJSXElementName(), attributes = this.parseJSXAttributes(), selfClosing = this.matchJSX("/");
                        return selfClosing && this.expectJSX("/"), this.expectJSX(">"), this.finalize(node, new JSXNode.JSXOpeningElement(name, selfClosing, attributes));
                    }, JSXParser.prototype.parseJSXBoundaryElement = function() {
                        var node = this.createJSXNode();
                        if (this.expectJSX("<"), this.matchJSX("/")) {
                            this.expectJSX("/");
                            var name_3 = this.parseJSXElementName();
                            return this.expectJSX(">"), this.finalize(node, new JSXNode.JSXClosingElement(name_3));
                        }
                        var name = this.parseJSXElementName(), attributes = this.parseJSXAttributes(), selfClosing = this.matchJSX("/");
                        return selfClosing && this.expectJSX("/"), this.expectJSX(">"), this.finalize(node, new JSXNode.JSXOpeningElement(name, selfClosing, attributes));
                    }, JSXParser.prototype.parseJSXEmptyExpression = function() {
                        var node = this.createJSXChildNode();
                        return this.collectComments(), this.lastMarker.index = this.scanner.index, this.lastMarker.lineNumber = this.scanner.lineNumber, 
                        this.lastMarker.lineStart = this.scanner.lineStart, this.finalize(node, new JSXNode.JSXEmptyExpression());
                    }, JSXParser.prototype.parseJSXExpressionContainer = function() {
                        var node = this.createJSXNode();
                        this.expectJSX("{");
                        var expression;
                        return this.matchJSX("}") ? (expression = this.parseJSXEmptyExpression(), this.expectJSX("}")) : (this.finishJSX(), 
                        expression = this.parseAssignmentExpression(), this.reenterJSX()), this.finalize(node, new JSXNode.JSXExpressionContainer(expression));
                    }, JSXParser.prototype.parseJSXChildren = function() {
                        for (var children = []; !this.scanner.eof(); ) {
                            var node = this.createJSXChildNode(), token = this.nextJSXText();
                            if (token.start < token.end) {
                                var raw = this.getTokenRaw(token), child = this.finalize(node, new JSXNode.JSXText(token.value, raw));
                                children.push(child);
                            }
                            if ("{" !== this.scanner.source[this.scanner.index]) break;
                            var container = this.parseJSXExpressionContainer();
                            children.push(container);
                        }
                        return children;
                    }, JSXParser.prototype.parseComplexJSXElement = function(el) {
                        for (var stack = []; !this.scanner.eof(); ) {
                            el.children = el.children.concat(this.parseJSXChildren());
                            var node = this.createJSXChildNode(), element = this.parseJSXBoundaryElement();
                            if (element.type === jsx_syntax_1.JSXSyntax.JSXOpeningElement) {
                                var opening = element;
                                if (opening.selfClosing) {
                                    var child = this.finalize(node, new JSXNode.JSXElement(opening, [], null));
                                    el.children.push(child);
                                } else stack.push(el), el = {
                                    node: node,
                                    opening: opening,
                                    closing: null,
                                    children: []
                                };
                            }
                            if (element.type === jsx_syntax_1.JSXSyntax.JSXClosingElement) {
                                el.closing = element;
                                var open_1 = getQualifiedElementName(el.opening.name), close_1 = getQualifiedElementName(el.closing.name);
                                if (open_1 !== close_1 && this.tolerateError("Expected corresponding JSX closing tag for %0", open_1), 
                                !(stack.length > 0)) break;
                                var child = this.finalize(el.node, new JSXNode.JSXElement(el.opening, el.children, el.closing));
                                el = stack.pop(), el.children.push(child);
                            }
                        }
                        return el;
                    }, JSXParser.prototype.parseJSXElement = function() {
                        var node = this.createJSXNode(), opening = this.parseJSXOpeningElement(), children = [], closing = null;
                        if (!opening.selfClosing) {
                            var el = this.parseComplexJSXElement({
                                node: node,
                                opening: opening,
                                closing: closing,
                                children: children
                            });
                            children = el.children, closing = el.closing;
                        }
                        return this.finalize(node, new JSXNode.JSXElement(opening, children, closing));
                    }, JSXParser.prototype.parseJSXRoot = function() {
                        this.config.tokens && this.tokens.pop(), this.startJSX();
                        var element = this.parseJSXElement();
                        return this.finishJSX(), element;
                    }, JSXParser;
                }(parser_1.Parser);
                exports.JSXParser = JSXParser;
            }, function(module, exports) {
                exports.XHTMLEntities = {
                    quot: '"',
                    amp: "&",
                    apos: "'",
                    gt: ">",
                    nbsp: " ",
                    iexcl: "¡",
                    cent: "¢",
                    pound: "£",
                    curren: "¤",
                    yen: "¥",
                    brvbar: "¦",
                    sect: "§",
                    uml: "¨",
                    copy: "©",
                    ordf: "ª",
                    laquo: "«",
                    not: "¬",
                    shy: "­",
                    reg: "®",
                    macr: "¯",
                    deg: "°",
                    plusmn: "±",
                    sup2: "²",
                    sup3: "³",
                    acute: "´",
                    micro: "µ",
                    para: "¶",
                    middot: "·",
                    cedil: "¸",
                    sup1: "¹",
                    ordm: "º",
                    raquo: "»",
                    frac14: "¼",
                    frac12: "½",
                    frac34: "¾",
                    iquest: "¿",
                    Agrave: "À",
                    Aacute: "Á",
                    Acirc: "Â",
                    Atilde: "Ã",
                    Auml: "Ä",
                    Aring: "Å",
                    AElig: "Æ",
                    Ccedil: "Ç",
                    Egrave: "È",
                    Eacute: "É",
                    Ecirc: "Ê",
                    Euml: "Ë",
                    Igrave: "Ì",
                    Iacute: "Í",
                    Icirc: "Î",
                    Iuml: "Ï",
                    ETH: "Ð",
                    Ntilde: "Ñ",
                    Ograve: "Ò",
                    Oacute: "Ó",
                    Ocirc: "Ô",
                    Otilde: "Õ",
                    Ouml: "Ö",
                    times: "×",
                    Oslash: "Ø",
                    Ugrave: "Ù",
                    Uacute: "Ú",
                    Ucirc: "Û",
                    Uuml: "Ü",
                    Yacute: "Ý",
                    THORN: "Þ",
                    szlig: "ß",
                    agrave: "à",
                    aacute: "á",
                    acirc: "â",
                    atilde: "ã",
                    auml: "ä",
                    aring: "å",
                    aelig: "æ",
                    ccedil: "ç",
                    egrave: "è",
                    eacute: "é",
                    ecirc: "ê",
                    euml: "ë",
                    igrave: "ì",
                    iacute: "í",
                    icirc: "î",
                    iuml: "ï",
                    eth: "ð",
                    ntilde: "ñ",
                    ograve: "ò",
                    oacute: "ó",
                    ocirc: "ô",
                    otilde: "õ",
                    ouml: "ö",
                    divide: "÷",
                    oslash: "ø",
                    ugrave: "ù",
                    uacute: "ú",
                    ucirc: "û",
                    uuml: "ü",
                    yacute: "ý",
                    thorn: "þ",
                    yuml: "ÿ",
                    OElig: "Œ",
                    oelig: "œ",
                    Scaron: "Š",
                    scaron: "š",
                    Yuml: "Ÿ",
                    fnof: "ƒ",
                    circ: "ˆ",
                    tilde: "˜",
                    Alpha: "Α",
                    Beta: "Β",
                    Gamma: "Γ",
                    Delta: "Δ",
                    Epsilon: "Ε",
                    Zeta: "Ζ",
                    Eta: "Η",
                    Theta: "Θ",
                    Iota: "Ι",
                    Kappa: "Κ",
                    Lambda: "Λ",
                    Mu: "Μ",
                    Nu: "Ν",
                    Xi: "Ξ",
                    Omicron: "Ο",
                    Pi: "Π",
                    Rho: "Ρ",
                    Sigma: "Σ",
                    Tau: "Τ",
                    Upsilon: "Υ",
                    Phi: "Φ",
                    Chi: "Χ",
                    Psi: "Ψ",
                    Omega: "Ω",
                    alpha: "α",
                    beta: "β",
                    gamma: "γ",
                    delta: "δ",
                    epsilon: "ε",
                    zeta: "ζ",
                    eta: "η",
                    theta: "θ",
                    iota: "ι",
                    kappa: "κ",
                    lambda: "λ",
                    mu: "μ",
                    nu: "ν",
                    xi: "ξ",
                    omicron: "ο",
                    pi: "π",
                    rho: "ρ",
                    sigmaf: "ς",
                    sigma: "σ",
                    tau: "τ",
                    upsilon: "υ",
                    phi: "φ",
                    chi: "χ",
                    psi: "ψ",
                    omega: "ω",
                    thetasym: "ϑ",
                    upsih: "ϒ",
                    piv: "ϖ",
                    ensp: " ",
                    emsp: " ",
                    thinsp: " ",
                    zwnj: "‌",
                    zwj: "‍",
                    lrm: "‎",
                    rlm: "‏",
                    ndash: "–",
                    mdash: "—",
                    lsquo: "‘",
                    rsquo: "’",
                    sbquo: "‚",
                    ldquo: "“",
                    rdquo: "”",
                    bdquo: "„",
                    dagger: "†",
                    Dagger: "‡",
                    bull: "•",
                    hellip: "…",
                    permil: "‰",
                    prime: "′",
                    Prime: "″",
                    lsaquo: "‹",
                    rsaquo: "›",
                    oline: "‾",
                    frasl: "⁄",
                    euro: "€",
                    image: "ℑ",
                    weierp: "℘",
                    real: "ℜ",
                    trade: "™",
                    alefsym: "ℵ",
                    larr: "←",
                    uarr: "↑",
                    rarr: "→",
                    darr: "↓",
                    harr: "↔",
                    crarr: "↵",
                    lArr: "⇐",
                    uArr: "⇑",
                    rArr: "⇒",
                    dArr: "⇓",
                    hArr: "⇔",
                    forall: "∀",
                    part: "∂",
                    exist: "∃",
                    empty: "∅",
                    nabla: "∇",
                    isin: "∈",
                    notin: "∉",
                    ni: "∋",
                    prod: "∏",
                    sum: "∑",
                    minus: "−",
                    lowast: "∗",
                    radic: "√",
                    prop: "∝",
                    infin: "∞",
                    ang: "∠",
                    and: "∧",
                    or: "∨",
                    cap: "∩",
                    cup: "∪",
                    int: "∫",
                    there4: "∴",
                    sim: "∼",
                    cong: "≅",
                    asymp: "≈",
                    ne: "≠",
                    equiv: "≡",
                    le: "≤",
                    ge: "≥",
                    sub: "⊂",
                    sup: "⊃",
                    nsub: "⊄",
                    sube: "⊆",
                    supe: "⊇",
                    oplus: "⊕",
                    otimes: "⊗",
                    perp: "⊥",
                    sdot: "⋅",
                    lceil: "⌈",
                    rceil: "⌉",
                    lfloor: "⌊",
                    rfloor: "⌋",
                    loz: "◊",
                    spades: "♠",
                    clubs: "♣",
                    hearts: "♥",
                    diams: "♦",
                    lang: "⟨",
                    rang: "⟩"
                };
            }, function(module, exports) {
                exports.JSXSyntax = {
                    JSXAttribute: "JSXAttribute",
                    JSXClosingElement: "JSXClosingElement",
                    JSXElement: "JSXElement",
                    JSXEmptyExpression: "JSXEmptyExpression",
                    JSXExpressionContainer: "JSXExpressionContainer",
                    JSXIdentifier: "JSXIdentifier",
                    JSXMemberExpression: "JSXMemberExpression",
                    JSXNamespacedName: "JSXNamespacedName",
                    JSXOpeningElement: "JSXOpeningElement",
                    JSXSpreadAttribute: "JSXSpreadAttribute",
                    JSXText: "JSXText"
                };
            }, function(module, exports, __webpack_require__) {
                var jsx_syntax_1 = __webpack_require__(13), JSXClosingElement = function() {
                    function JSXClosingElement(name) {
                        this.type = jsx_syntax_1.JSXSyntax.JSXClosingElement, this.name = name;
                    }
                    return JSXClosingElement;
                }();
                exports.JSXClosingElement = JSXClosingElement;
                var JSXElement = function() {
                    function JSXElement(openingElement, children, closingElement) {
                        this.type = jsx_syntax_1.JSXSyntax.JSXElement, this.openingElement = openingElement, 
                        this.children = children, this.closingElement = closingElement;
                    }
                    return JSXElement;
                }();
                exports.JSXElement = JSXElement;
                var JSXEmptyExpression = function() {
                    function JSXEmptyExpression() {
                        this.type = jsx_syntax_1.JSXSyntax.JSXEmptyExpression;
                    }
                    return JSXEmptyExpression;
                }();
                exports.JSXEmptyExpression = JSXEmptyExpression;
                var JSXExpressionContainer = function() {
                    function JSXExpressionContainer(expression) {
                        this.type = jsx_syntax_1.JSXSyntax.JSXExpressionContainer, this.expression = expression;
                    }
                    return JSXExpressionContainer;
                }();
                exports.JSXExpressionContainer = JSXExpressionContainer;
                var JSXIdentifier = function() {
                    function JSXIdentifier(name) {
                        this.type = jsx_syntax_1.JSXSyntax.JSXIdentifier, this.name = name;
                    }
                    return JSXIdentifier;
                }();
                exports.JSXIdentifier = JSXIdentifier;
                var JSXMemberExpression = function() {
                    function JSXMemberExpression(object, property) {
                        this.type = jsx_syntax_1.JSXSyntax.JSXMemberExpression, this.object = object, this.property = property;
                    }
                    return JSXMemberExpression;
                }();
                exports.JSXMemberExpression = JSXMemberExpression;
                var JSXAttribute = function() {
                    function JSXAttribute(name, value) {
                        this.type = jsx_syntax_1.JSXSyntax.JSXAttribute, this.name = name, this.value = value;
                    }
                    return JSXAttribute;
                }();
                exports.JSXAttribute = JSXAttribute;
                var JSXNamespacedName = function() {
                    function JSXNamespacedName(namespace, name) {
                        this.type = jsx_syntax_1.JSXSyntax.JSXNamespacedName, this.namespace = namespace, 
                        this.name = name;
                    }
                    return JSXNamespacedName;
                }();
                exports.JSXNamespacedName = JSXNamespacedName;
                var JSXOpeningElement = function() {
                    function JSXOpeningElement(name, selfClosing, attributes) {
                        this.type = jsx_syntax_1.JSXSyntax.JSXOpeningElement, this.name = name, this.selfClosing = selfClosing, 
                        this.attributes = attributes;
                    }
                    return JSXOpeningElement;
                }();
                exports.JSXOpeningElement = JSXOpeningElement;
                var JSXSpreadAttribute = function() {
                    function JSXSpreadAttribute(argument) {
                        this.type = jsx_syntax_1.JSXSyntax.JSXSpreadAttribute, this.argument = argument;
                    }
                    return JSXSpreadAttribute;
                }();
                exports.JSXSpreadAttribute = JSXSpreadAttribute;
                var JSXText = function() {
                    function JSXText(value, raw) {
                        this.type = jsx_syntax_1.JSXSyntax.JSXText, this.value = value, this.raw = raw;
                    }
                    return JSXText;
                }();
                exports.JSXText = JSXText;
            }, function(module, exports, __webpack_require__) {
                var scanner_1 = __webpack_require__(8), error_handler_1 = __webpack_require__(6), token_1 = __webpack_require__(7), Reader = function() {
                    function Reader() {
                        this.values = [], this.curly = this.paren = -1;
                    }
                    return Reader.prototype.beforeFunctionExpression = function(t) {
                        return [ "(", "{", "[", "in", "typeof", "instanceof", "new", "return", "case", "delete", "throw", "void", "=", "+=", "-=", "*=", "**=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ",", "+", "-", "*", "**", "/", "%", "++", "--", "<<", ">>", ">>>", "&", "|", "^", "!", "~", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==" ].indexOf(t) >= 0;
                    }, Reader.prototype.isRegexStart = function() {
                        var previous = this.values[this.values.length - 1], regex = null !== previous;
                        switch (previous) {
                          case "this":
                          case "]":
                            regex = !1;
                            break;

                          case ")":
                            var check = this.values[this.paren - 1];
                            regex = "if" === check || "while" === check || "for" === check || "with" === check;
                            break;

                          case "}":
                            if (regex = !1, "function" === this.values[this.curly - 3]) {
                                var check_1 = this.values[this.curly - 4];
                                regex = !!check_1 && !this.beforeFunctionExpression(check_1);
                            } else if ("function" === this.values[this.curly - 4]) {
                                var check_2 = this.values[this.curly - 5];
                                regex = !check_2 || !this.beforeFunctionExpression(check_2);
                            }
                        }
                        return regex;
                    }, Reader.prototype.push = function(token) {
                        token.type === token_1.Token.Punctuator || token.type === token_1.Token.Keyword ? ("{" === token.value ? this.curly = this.values.length : "(" === token.value && (this.paren = this.values.length), 
                        this.values.push(token.value)) : this.values.push(null);
                    }, Reader;
                }(), Tokenizer = function() {
                    function Tokenizer(code, config) {
                        this.errorHandler = new error_handler_1.ErrorHandler(), this.errorHandler.tolerant = !!config && ("boolean" == typeof config.tolerant && config.tolerant), 
                        this.scanner = new scanner_1.Scanner(code, this.errorHandler), this.scanner.trackComment = !!config && ("boolean" == typeof config.comment && config.comment), 
                        this.trackRange = !!config && ("boolean" == typeof config.range && config.range), 
                        this.trackLoc = !!config && ("boolean" == typeof config.loc && config.loc), this.buffer = [], 
                        this.reader = new Reader();
                    }
                    return Tokenizer.prototype.errors = function() {
                        return this.errorHandler.errors;
                    }, Tokenizer.prototype.getNextToken = function() {
                        if (0 === this.buffer.length) {
                            var comments = this.scanner.scanComments();
                            if (this.scanner.trackComment) for (var i = 0; i < comments.length; ++i) {
                                var e = comments[i], comment = void 0, value = this.scanner.source.slice(e.slice[0], e.slice[1]);
                                comment = {
                                    type: e.multiLine ? "BlockComment" : "LineComment",
                                    value: value
                                }, this.trackRange && (comment.range = e.range), this.trackLoc && (comment.loc = e.loc), 
                                this.buffer.push(comment);
                            }
                            if (!this.scanner.eof()) {
                                var loc = void 0;
                                this.trackLoc && (loc = {
                                    start: {
                                        line: this.scanner.lineNumber,
                                        column: this.scanner.index - this.scanner.lineStart
                                    },
                                    end: {}
                                });
                                var token = void 0;
                                token = "/" === this.scanner.source[this.scanner.index] ? this.reader.isRegexStart() ? this.scanner.scanRegExp() : this.scanner.scanPunctuator() : this.scanner.lex(), 
                                this.reader.push(token);
                                var entry = void 0;
                                entry = {
                                    type: token_1.TokenName[token.type],
                                    value: this.scanner.source.slice(token.start, token.end)
                                }, this.trackRange && (entry.range = [ token.start, token.end ]), this.trackLoc && (loc.end = {
                                    line: this.scanner.lineNumber,
                                    column: this.scanner.index - this.scanner.lineStart
                                }, entry.loc = loc), token.regex && (entry.regex = token.regex), this.buffer.push(entry);
                            }
                        }
                        return this.buffer.shift();
                    }, Tokenizer;
                }();
                exports.Tokenizer = Tokenizer;
            } ]);
        });
    }).call(exports, __webpack_require__(/*! ./../../webpack/buildin/module.js */ 69)(module));
}, /*!****************************************!*\
  !*** ./~/inherits/inherits_browser.js ***!
  \****************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    "function" == typeof Object.create ? module.exports = function(ctor, superCtor) {
        ctor.super_ = superCtor, ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        });
    } : module.exports = function(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {};
        TempCtor.prototype = superCtor.prototype, ctor.prototype = new TempCtor(), ctor.prototype.constructor = ctor;
    };
}, /*!************************************!*\
  !*** ./~/os-browserify/browser.js ***!
  \************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    exports.endianness = function() {
        return "LE";
    }, exports.hostname = function() {
        return "undefined" != typeof location ? location.hostname : "";
    }, exports.loadavg = function() {
        return [];
    }, exports.uptime = function() {
        return 0;
    }, exports.freemem = function() {
        return Number.MAX_VALUE;
    }, exports.totalmem = function() {
        return Number.MAX_VALUE;
    }, exports.cpus = function() {
        return [];
    }, exports.type = function() {
        return "Browser";
    }, exports.release = function() {
        return "undefined" != typeof navigator ? navigator.appVersion : "";
    }, exports.networkInterfaces = exports.getNetworkInterfaces = function() {
        return {};
    }, exports.arch = function() {
        return "javascript";
    }, exports.platform = function() {
        return "browser";
    }, exports.tmpdir = exports.tmpDir = function() {
        return "/tmp";
    }, exports.EOL = "\n";
}, /*!*********************************!*\
  !*** ./~/recast/lib/mapping.js ***!
  \*********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function Mapping(sourceLines, sourceLoc, targetLoc) {
        assert.ok(this instanceof Mapping), assert.ok(sourceLines instanceof linesModule.Lines), 
        SourceLocation.assert(sourceLoc), targetLoc ? assert.ok(isNumber.check(targetLoc.start.line) && isNumber.check(targetLoc.start.column) && isNumber.check(targetLoc.end.line) && isNumber.check(targetLoc.end.column)) : targetLoc = sourceLoc, 
        Object.defineProperties(this, {
            sourceLines: {
                value: sourceLines
            },
            sourceLoc: {
                value: sourceLoc
            },
            targetLoc: {
                value: targetLoc
            }
        });
    }
    function addPos(toPos, line, column) {
        return {
            line: toPos.line + line - 1,
            column: 1 === toPos.line ? toPos.column + column : toPos.column
        };
    }
    function subtractPos(fromPos, line, column) {
        return {
            line: fromPos.line - line + 1,
            column: fromPos.line === line ? fromPos.column - column : fromPos.column
        };
    }
    function skipChars(sourceLines, sourceFromPos, targetLines, targetFromPos, targetToPos) {
        assert.ok(sourceLines instanceof linesModule.Lines), assert.ok(targetLines instanceof linesModule.Lines), 
        Position.assert(sourceFromPos), Position.assert(targetFromPos), Position.assert(targetToPos);
        var targetComparison = comparePos(targetFromPos, targetToPos);
        if (0 === targetComparison) return sourceFromPos;
        if (targetComparison < 0) {
            var sourceCursor = sourceLines.skipSpaces(sourceFromPos), targetCursor = targetLines.skipSpaces(targetFromPos), lineDiff = targetToPos.line - targetCursor.line;
            for (sourceCursor.line += lineDiff, targetCursor.line += lineDiff, lineDiff > 0 ? (sourceCursor.column = 0, 
            targetCursor.column = 0) : assert.strictEqual(lineDiff, 0); comparePos(targetCursor, targetToPos) < 0 && targetLines.nextPos(targetCursor, !0); ) assert.ok(sourceLines.nextPos(sourceCursor, !0)), 
            assert.strictEqual(sourceLines.charAt(sourceCursor), targetLines.charAt(targetCursor));
        } else {
            var sourceCursor = sourceLines.skipSpaces(sourceFromPos, !0), targetCursor = targetLines.skipSpaces(targetFromPos, !0), lineDiff = targetToPos.line - targetCursor.line;
            for (sourceCursor.line += lineDiff, targetCursor.line += lineDiff, lineDiff < 0 ? (sourceCursor.column = sourceLines.getLineLength(sourceCursor.line), 
            targetCursor.column = targetLines.getLineLength(targetCursor.line)) : assert.strictEqual(lineDiff, 0); comparePos(targetToPos, targetCursor) < 0 && targetLines.prevPos(targetCursor, !0); ) assert.ok(sourceLines.prevPos(sourceCursor, !0)), 
            assert.strictEqual(sourceLines.charAt(sourceCursor), targetLines.charAt(targetCursor));
        }
        return sourceCursor;
    }
    var assert = __webpack_require__(/*! assert */ 5), types = __webpack_require__(/*! ./types */ 3), isNumber = (types.builtInTypes.string, 
    types.builtInTypes.number), SourceLocation = types.namedTypes.SourceLocation, Position = types.namedTypes.Position, linesModule = __webpack_require__(/*! ./lines */ 8), comparePos = __webpack_require__(/*! ./util */ 6).comparePos, Mp = Mapping.prototype;
    module.exports = Mapping, Mp.slice = function(lines, start, end) {
        function skip(name) {
            var sourceFromPos = sourceLoc[name], targetFromPos = targetLoc[name], targetToPos = start;
            return "end" === name ? targetToPos = end : assert.strictEqual(name, "start"), skipChars(sourceLines, sourceFromPos, lines, targetFromPos, targetToPos);
        }
        assert.ok(lines instanceof linesModule.Lines), Position.assert(start), end ? Position.assert(end) : end = lines.lastPos();
        var sourceLines = this.sourceLines, sourceLoc = this.sourceLoc, targetLoc = this.targetLoc;
        if (comparePos(start, targetLoc.start) <= 0) if (comparePos(targetLoc.end, end) <= 0) targetLoc = {
            start: subtractPos(targetLoc.start, start.line, start.column),
            end: subtractPos(targetLoc.end, start.line, start.column)
        }; else {
            if (comparePos(end, targetLoc.start) <= 0) return null;
            sourceLoc = {
                start: sourceLoc.start,
                end: skip("end")
            }, targetLoc = {
                start: subtractPos(targetLoc.start, start.line, start.column),
                end: subtractPos(end, start.line, start.column)
            };
        } else {
            if (comparePos(targetLoc.end, start) <= 0) return null;
            comparePos(targetLoc.end, end) <= 0 ? (sourceLoc = {
                start: skip("start"),
                end: sourceLoc.end
            }, targetLoc = {
                start: {
                    line: 1,
                    column: 0
                },
                end: subtractPos(targetLoc.end, start.line, start.column)
            }) : (sourceLoc = {
                start: skip("start"),
                end: skip("end")
            }, targetLoc = {
                start: {
                    line: 1,
                    column: 0
                },
                end: subtractPos(end, start.line, start.column)
            });
        }
        return new Mapping(this.sourceLines, sourceLoc, targetLoc);
    }, Mp.add = function(line, column) {
        return new Mapping(this.sourceLines, this.sourceLoc, {
            start: addPos(this.targetLoc.start, line, column),
            end: addPos(this.targetLoc.end, line, column)
        });
    }, Mp.subtract = function(line, column) {
        return new Mapping(this.sourceLines, this.sourceLoc, {
            start: subtractPos(this.targetLoc.start, line, column),
            end: subtractPos(this.targetLoc.end, line, column)
        });
    }, Mp.indent = function(by, skipFirstLine, noNegativeColumns) {
        if (0 === by) return this;
        var targetLoc = this.targetLoc, startLine = targetLoc.start.line, endLine = targetLoc.end.line;
        if (skipFirstLine && 1 === startLine && 1 === endLine) return this;
        if (targetLoc = {
            start: targetLoc.start,
            end: targetLoc.end
        }, !skipFirstLine || startLine > 1) {
            var startColumn = targetLoc.start.column + by;
            targetLoc.start = {
                line: startLine,
                column: noNegativeColumns ? Math.max(0, startColumn) : startColumn
            };
        }
        if (!skipFirstLine || endLine > 1) {
            var endColumn = targetLoc.end.column + by;
            targetLoc.end = {
                line: endLine,
                column: noNegativeColumns ? Math.max(0, endColumn) : endColumn
            };
        }
        return new Mapping(this.sourceLines, this.sourceLoc, targetLoc);
    };
}, /*!********************************!*\
  !*** ./~/recast/lib/parser.js ***!
  \********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function TreeCopier(lines) {
        assert.ok(this instanceof TreeCopier), this.lines = lines, this.indent = 0;
    }
    var assert = __webpack_require__(/*! assert */ 5), types = __webpack_require__(/*! ./types */ 3), b = (types.namedTypes, 
    types.builders), isObject = types.builtInTypes.object, isArray = types.builtInTypes.array, normalizeOptions = (types.builtInTypes.function, 
    __webpack_require__(/*! ./patcher */ 25).Patcher, __webpack_require__(/*! ./options */ 14).normalize), fromString = __webpack_require__(/*! ./lines */ 8).fromString, attachComments = __webpack_require__(/*! ./comments */ 23).attach, util = __webpack_require__(/*! ./util */ 6);
    exports.parse = function(source, options) {
        options = normalizeOptions(options);
        var lines = fromString(source, options), sourceWithoutTabs = lines.toString({
            tabWidth: options.tabWidth,
            reuseWhitespace: !1,
            useTabs: !1
        }), comments = [], program = options.parser.parse(sourceWithoutTabs, {
            jsx: !0,
            loc: !0,
            locations: !0,
            range: options.range,
            comment: !0,
            onComment: comments,
            tolerant: options.tolerant,
            ecmaVersion: 6,
            sourceType: "module"
        });
        util.fixFaultyLocations(program, lines), program.loc = program.loc || {
            start: lines.firstPos(),
            end: lines.lastPos()
        }, program.loc.lines = lines, program.loc.indent = 0;
        var trueProgramLoc = util.getTrueLoc(program, lines);
        program.loc.start = trueProgramLoc.start, program.loc.end = trueProgramLoc.end, 
        program.comments && (comments = program.comments, delete program.comments);
        var file = program;
        if ("Program" === file.type) {
            var file = b.file(program);
            file.loc = {
                lines: lines,
                indent: 0,
                start: lines.firstPos(),
                end: lines.lastPos()
            };
        } else "File" === file.type && (program = file.program);
        return attachComments(comments, program.body.length ? file.program : file, lines), 
        new TreeCopier(lines).copy(file);
    };
    var TCp = TreeCopier.prototype;
    TCp.copy = function(node) {
        if (isArray.check(node)) return node.map(this.copy, this);
        if (!isObject.check(node)) return node;
        util.fixFaultyLocations(node, this.lines);
        var copy = Object.create(Object.getPrototypeOf(node), {
            original: {
                value: node,
                configurable: !1,
                enumerable: !1,
                writable: !0
            }
        }), loc = node.loc, oldIndent = this.indent, newIndent = oldIndent;
        loc && (("Block" === node.type || "Line" === node.type || "CommentBlock" === node.type || "CommentLine" === node.type || this.lines.isPrecededOnlyByWhitespace(loc.start)) && (newIndent = this.indent = loc.start.column), 
        loc.lines = this.lines, loc.indent = newIndent);
        for (var keys = Object.keys(node), keyCount = keys.length, i = 0; i < keyCount; ++i) {
            var key = keys[i];
            "loc" === key ? copy[key] = node[key] : copy[key] = this.copy(node[key]);
        }
        return this.indent = oldIndent, copy;
    };
}, /*!*********************************!*\
  !*** ./~/recast/lib/printer.js ***!
  \*********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function PrintResult(code, sourceMap) {
        assert.ok(this instanceof PrintResult), isString.assert(code), this.code = code, 
        sourceMap && (isObject.assert(sourceMap), this.map = sourceMap);
    }
    function Printer(originalOptions) {
        function printWithComments(path) {
            return assert.ok(path instanceof FastPath), printComments(path, print);
        }
        function print(path, includeComments) {
            if (includeComments) return printWithComments(path);
            if (assert.ok(path instanceof FastPath), !explicitTabWidth) {
                var oldTabWidth = options.tabWidth, loc = path.getNode().loc;
                if (loc && loc.lines && loc.lines.guessTabWidth) {
                    options.tabWidth = loc.lines.guessTabWidth();
                    var lines = maybeReprint(path);
                    return options.tabWidth = oldTabWidth, lines;
                }
            }
            return maybeReprint(path);
        }
        function maybeReprint(path) {
            var reprinter = getReprinter(path);
            return reprinter ? maybeAddParens(path, reprinter(print)) : printRootGenerically(path);
        }
        function printRootGenerically(path, includeComments) {
            return includeComments ? printComments(path, printRootGenerically) : genericPrint(path, options, printWithComments);
        }
        function printGenerically(path) {
            return genericPrint(path, options, printGenerically);
        }
        assert.ok(this instanceof Printer);
        var explicitTabWidth = originalOptions && originalOptions.tabWidth, options = normalizeOptions(originalOptions);
        assert.notStrictEqual(options, originalOptions), options.sourceFileName = null, 
        this.print = function(ast) {
            if (!ast) return emptyPrintResult;
            var lines = print(FastPath.from(ast), !0);
            return new PrintResult(lines.toString(options), util.composeSourceMaps(options.inputSourceMap, lines.getSourceMap(options.sourceMapName, options.sourceRoot)));
        }, this.printGenerically = function(ast) {
            if (!ast) return emptyPrintResult;
            var path = FastPath.from(ast), oldReuseWhitespace = options.reuseWhitespace;
            options.reuseWhitespace = !1;
            var pr = new PrintResult(printGenerically(path).toString(options));
            return options.reuseWhitespace = oldReuseWhitespace, pr;
        };
    }
    function maybeAddParens(path, lines) {
        return path.needsParens() ? concat([ "(", lines, ")" ]) : lines;
    }
    function genericPrint(path, options, printPath) {
        assert.ok(path instanceof FastPath);
        var node = path.getValue(), parts = [], needsParens = !1, linesWithoutParens = genericPrintNoParens(path, options, printPath);
        return !node || linesWithoutParens.isEmpty() ? linesWithoutParens : (node.decorators && node.decorators.length > 0 && !util.getParentExportDeclaration(path) ? path.each(function(decoratorPath) {
            parts.push(printPath(decoratorPath), "\n");
        }, "decorators") : util.isExportDeclaration(node) && node.declaration && node.declaration.decorators ? path.each(function(decoratorPath) {
            parts.push(printPath(decoratorPath), "\n");
        }, "declaration", "decorators") : needsParens = path.needsParens(), needsParens && parts.unshift("("), 
        parts.push(linesWithoutParens), needsParens && parts.push(")"), concat(parts));
    }
    function genericPrintNoParens(path, options, print) {
        var n = path.getValue();
        if (!n) return fromString("");
        if ("string" == typeof n) return fromString(n, options);
        namedTypes.Printable.assert(n);
        var parts = [];
        switch (n.type) {
          case "File":
            return path.call(print, "program");

          case "Program":
            return n.directives && path.each(function(childPath) {
                parts.push(print(childPath), ";\n");
            }, "directives"), parts.push(path.call(function(bodyPath) {
                return printStatementSequence(bodyPath, options, print);
            }, "body")), concat(parts);

          case "Noop":
          case "EmptyStatement":
            return fromString("");

          case "ExpressionStatement":
            return concat([ path.call(print, "expression"), ";" ]);

          case "ParenthesizedExpression":
            return concat([ "(", path.call(print, "expression"), ")" ]);

          case "BinaryExpression":
          case "LogicalExpression":
          case "AssignmentExpression":
            return fromString(" ").join([ path.call(print, "left"), n.operator, path.call(print, "right") ]);

          case "AssignmentPattern":
            return concat([ path.call(print, "left"), " = ", path.call(print, "right") ]);

          case "MemberExpression":
            parts.push(path.call(print, "object"));
            var property = path.call(print, "property");
            return n.computed ? parts.push("[", property, "]") : parts.push(".", property), 
            concat(parts);

          case "MetaProperty":
            return concat([ path.call(print, "meta"), ".", path.call(print, "property") ]);

          case "BindExpression":
            return n.object && parts.push(path.call(print, "object")), parts.push("::", path.call(print, "callee")), 
            concat(parts);

          case "Path":
            return fromString(".").join(n.body);

          case "Identifier":
            return concat([ fromString(n.name, options), path.call(print, "typeAnnotation") ]);

          case "SpreadElement":
          case "SpreadElementPattern":
          case "RestProperty":
          case "SpreadProperty":
          case "SpreadPropertyPattern":
          case "RestElement":
            return concat([ "...", path.call(print, "argument") ]);

          case "FunctionDeclaration":
          case "FunctionExpression":
            return n.async && parts.push("async "), parts.push("function"), n.generator && parts.push("*"), 
            n.id && parts.push(" ", path.call(print, "id"), path.call(print, "typeParameters")), 
            parts.push("(", printFunctionParams(path, options, print), ")", path.call(print, "returnType"), " ", path.call(print, "body")), 
            concat(parts);

          case "ArrowFunctionExpression":
            return n.async && parts.push("async "), n.typeParameters && parts.push(path.call(print, "typeParameters")), 
            options.arrowParensAlways || 1 !== n.params.length || n.rest || "Identifier" !== n.params[0].type || n.params[0].typeAnnotation || n.returnType ? parts.push("(", printFunctionParams(path, options, print), ")", path.call(print, "returnType")) : parts.push(path.call(print, "params", 0)), 
            parts.push(" => ", path.call(print, "body")), concat(parts);

          case "MethodDefinition":
            return n.static && parts.push("static "), parts.push(printMethod(path, options, print)), 
            concat(parts);

          case "YieldExpression":
            return parts.push("yield"), n.delegate && parts.push("*"), n.argument && parts.push(" ", path.call(print, "argument")), 
            concat(parts);

          case "AwaitExpression":
            return parts.push("await"), n.all && parts.push("*"), n.argument && parts.push(" ", path.call(print, "argument")), 
            concat(parts);

          case "ModuleDeclaration":
            return parts.push("module", path.call(print, "id")), n.source ? (assert.ok(!n.body), 
            parts.push("from", path.call(print, "source"))) : parts.push(path.call(print, "body")), 
            fromString(" ").join(parts);

          case "ImportSpecifier":
            return n.imported ? (parts.push(path.call(print, "imported")), n.local && n.local.name !== n.imported.name && parts.push(" as ", path.call(print, "local"))) : n.id && (parts.push(path.call(print, "id")), 
            n.name && parts.push(" as ", path.call(print, "name"))), concat(parts);

          case "ExportSpecifier":
            return n.local ? (parts.push(path.call(print, "local")), n.exported && n.exported.name !== n.local.name && parts.push(" as ", path.call(print, "exported"))) : n.id && (parts.push(path.call(print, "id")), 
            n.name && parts.push(" as ", path.call(print, "name"))), concat(parts);

          case "ExportBatchSpecifier":
            return fromString("*");

          case "ImportNamespaceSpecifier":
            return parts.push("* as "), n.local ? parts.push(path.call(print, "local")) : n.id && parts.push(path.call(print, "id")), 
            concat(parts);

          case "ImportDefaultSpecifier":
            return n.local ? path.call(print, "local") : path.call(print, "id");

          case "ExportDeclaration":
          case "ExportDefaultDeclaration":
          case "ExportNamedDeclaration":
            return printExportDeclaration(path, options, print);

          case "ExportAllDeclaration":
            return parts.push("export *"), n.exported && parts.push(" as ", path.call(print, "exported")), 
            parts.push(" from ", path.call(print, "source")), concat(parts);

          case "ExportNamespaceSpecifier":
            return concat([ "* as ", path.call(print, "exported") ]);

          case "ExportDefaultSpecifier":
            return path.call(print, "exported");

          case "ImportDeclaration":
            if (parts.push("import "), n.importKind && "value" !== n.importKind && parts.push(n.importKind + " "), 
            n.specifiers && n.specifiers.length > 0) {
                var foundImportSpecifier = !1;
                path.each(function(specifierPath) {
                    var i = specifierPath.getName();
                    i > 0 && parts.push(", ");
                    var value = specifierPath.getValue();
                    namedTypes.ImportDefaultSpecifier.check(value) || namedTypes.ImportNamespaceSpecifier.check(value) ? assert.strictEqual(foundImportSpecifier, !1) : (namedTypes.ImportSpecifier.assert(value), 
                    foundImportSpecifier || (foundImportSpecifier = !0, parts.push(options.objectCurlySpacing ? "{ " : "{"))), 
                    parts.push(print(specifierPath));
                }, "specifiers"), foundImportSpecifier && parts.push(options.objectCurlySpacing ? " }" : "}"), 
                parts.push(" from ");
            }
            return parts.push(path.call(print, "source"), ";"), concat(parts);

          case "BlockStatement":
            var naked = path.call(function(bodyPath) {
                return printStatementSequence(bodyPath, options, print);
            }, "body");
            return !naked.isEmpty() || n.directives && 0 !== n.directives.length ? (parts.push("{\n"), 
            n.directives && path.each(function(childPath) {
                parts.push(print(childPath).indent(options.tabWidth), ";", n.directives.length > 1 || !naked.isEmpty() ? "\n" : "");
            }, "directives"), parts.push(naked.indent(options.tabWidth)), parts.push("\n}"), 
            concat(parts)) : fromString("{}");

          case "ReturnStatement":
            if (parts.push("return"), n.argument) {
                var argLines = path.call(print, "argument");
                argLines.length > 1 && namedTypes.JSXElement && namedTypes.JSXElement.check(n.argument) ? parts.push(" (\n", argLines.indent(options.tabWidth), "\n)") : parts.push(" ", argLines);
            }
            return parts.push(";"), concat(parts);

          case "CallExpression":
            return concat([ path.call(print, "callee"), printArgumentsList(path, options, print) ]);

          case "ObjectExpression":
          case "ObjectPattern":
          case "ObjectTypeAnnotation":
            var allowBreak = !1, isTypeAnnotation = "ObjectTypeAnnotation" === n.type, separator = options.flowObjectCommas ? "," : isTypeAnnotation ? ";" : ",", fields = [];
            isTypeAnnotation && fields.push("indexers", "callProperties"), fields.push("properties");
            var len = 0;
            fields.forEach(function(field) {
                len += n[field].length;
            });
            var oneLine = isTypeAnnotation && 1 === len || 0 === len, leftBrace = n.exact ? "{|" : "{", rightBrace = n.exact ? "|}" : "}";
            parts.push(oneLine ? leftBrace : leftBrace + "\n");
            var leftBraceIndex = parts.length - 1, i = 0;
            return fields.forEach(function(field) {
                path.each(function(childPath) {
                    var lines = print(childPath);
                    oneLine || (lines = lines.indent(options.tabWidth));
                    var multiLine = !isTypeAnnotation && lines.length > 1;
                    multiLine && allowBreak && parts.push("\n"), parts.push(lines), i < len - 1 ? (parts.push(separator + (multiLine ? "\n\n" : "\n")), 
                    allowBreak = !multiLine) : 1 !== len && isTypeAnnotation ? parts.push(separator) : !oneLine && util.isTrailingCommaEnabled(options, "objects") && parts.push(separator), 
                    i++;
                }, field);
            }), parts.push(oneLine ? rightBrace : "\n" + rightBrace), 0 !== i && oneLine && options.objectCurlySpacing && (parts[leftBraceIndex] = leftBrace + " ", 
            parts[parts.length - 1] = " " + rightBrace), concat(parts);

          case "PropertyPattern":
            return concat([ path.call(print, "key"), ": ", path.call(print, "pattern") ]);

          case "ObjectProperty":
          case "Property":
            if (n.method || "get" === n.kind || "set" === n.kind) return printMethod(path, options, print);
            var key = path.call(print, "key");
            return n.computed ? parts.push("[", key, "]") : parts.push(key), n.shorthand || parts.push(": ", path.call(print, "value")), 
            concat(parts);

          case "ClassMethod":
            return n.static && parts.push("static "), concat([ parts, printObjectMethod(path, options, print) ]);

          case "ObjectMethod":
            return printObjectMethod(path, options, print);

          case "Decorator":
            return concat([ "@", path.call(print, "expression") ]);

          case "ArrayExpression":
          case "ArrayPattern":
            var elems = n.elements, len = elems.length, printed = path.map(print, "elements"), joined = fromString(", ").join(printed), oneLine = joined.getLineLength(1) <= options.wrapColumn;
            return oneLine ? options.arrayBracketSpacing ? parts.push("[ ") : parts.push("[") : parts.push("[\n"), 
            path.each(function(elemPath) {
                var i = elemPath.getName(), elem = elemPath.getValue();
                if (elem) {
                    var lines = printed[i];
                    oneLine ? i > 0 && parts.push(" ") : lines = lines.indent(options.tabWidth), parts.push(lines), 
                    (i < len - 1 || !oneLine && util.isTrailingCommaEnabled(options, "arrays")) && parts.push(","), 
                    oneLine || parts.push("\n");
                } else parts.push(",");
            }, "elements"), oneLine && options.arrayBracketSpacing ? parts.push(" ]") : parts.push("]"), 
            concat(parts);

          case "SequenceExpression":
            return fromString(", ").join(path.map(print, "expressions"));

          case "ThisExpression":
            return fromString("this");

          case "Super":
            return fromString("super");

          case "NullLiteral":
            return fromString("null");

          case "RegExpLiteral":
            return fromString(n.extra.raw);

          case "BooleanLiteral":
          case "NumericLiteral":
          case "StringLiteral":
          case "Literal":
            return "string" != typeof n.value ? fromString(n.value, options) : fromString(nodeStr(n.value, options), options);

          case "Directive":
            return path.call(print, "value");

          case "DirectiveLiteral":
            return fromString(nodeStr(n.value, options));

          case "ModuleSpecifier":
            if (n.local) throw new Error("The ESTree ModuleSpecifier type should be abstract");
            return fromString(nodeStr(n.value, options), options);

          case "UnaryExpression":
            return parts.push(n.operator), /[a-z]$/.test(n.operator) && parts.push(" "), parts.push(path.call(print, "argument")), 
            concat(parts);

          case "UpdateExpression":
            return parts.push(path.call(print, "argument"), n.operator), n.prefix && parts.reverse(), 
            concat(parts);

          case "ConditionalExpression":
            return concat([ "(", path.call(print, "test"), " ? ", path.call(print, "consequent"), " : ", path.call(print, "alternate"), ")" ]);

          case "NewExpression":
            parts.push("new ", path.call(print, "callee"));
            var args = n.arguments;
            return args && parts.push(printArgumentsList(path, options, print)), concat(parts);

          case "VariableDeclaration":
            parts.push(n.kind, " ");
            var maxLen = 0, printed = path.map(function(childPath) {
                var lines = print(childPath);
                return maxLen = Math.max(lines.length, maxLen), lines;
            }, "declarations");
            1 === maxLen ? parts.push(fromString(", ").join(printed)) : printed.length > 1 ? parts.push(fromString(",\n").join(printed).indentTail(n.kind.length + 1)) : parts.push(printed[0]);
            var parentNode = path.getParentNode();
            return namedTypes.ForStatement.check(parentNode) || namedTypes.ForInStatement.check(parentNode) || namedTypes.ForOfStatement && namedTypes.ForOfStatement.check(parentNode) || namedTypes.ForAwaitStatement && namedTypes.ForAwaitStatement.check(parentNode) || parts.push(";"), 
            concat(parts);

          case "VariableDeclarator":
            return n.init ? fromString(" = ").join([ path.call(print, "id"), path.call(print, "init") ]) : path.call(print, "id");

          case "WithStatement":
            return concat([ "with (", path.call(print, "object"), ") ", path.call(print, "body") ]);

          case "IfStatement":
            var con = adjustClause(path.call(print, "consequent"), options), parts = [ "if (", path.call(print, "test"), ")", con ];
            return n.alternate && parts.push(endsWithBrace(con) ? " else" : "\nelse", adjustClause(path.call(print, "alternate"), options)), 
            concat(parts);

          case "ForStatement":
            var init = path.call(print, "init"), sep = init.length > 1 ? ";\n" : "; ", forParen = "for (", indented = fromString(sep).join([ init, path.call(print, "test"), path.call(print, "update") ]).indentTail(forParen.length), head = concat([ forParen, indented, ")" ]), clause = adjustClause(path.call(print, "body"), options), parts = [ head ];
            return head.length > 1 && (parts.push("\n"), clause = clause.trimLeft()), parts.push(clause), 
            concat(parts);

          case "WhileStatement":
            return concat([ "while (", path.call(print, "test"), ")", adjustClause(path.call(print, "body"), options) ]);

          case "ForInStatement":
            return concat([ n.each ? "for each (" : "for (", path.call(print, "left"), " in ", path.call(print, "right"), ")", adjustClause(path.call(print, "body"), options) ]);

          case "ForOfStatement":
            return concat([ "for (", path.call(print, "left"), " of ", path.call(print, "right"), ")", adjustClause(path.call(print, "body"), options) ]);

          case "ForAwaitStatement":
            return concat([ "for await (", path.call(print, "left"), " of ", path.call(print, "right"), ")", adjustClause(path.call(print, "body"), options) ]);

          case "DoWhileStatement":
            var doBody = concat([ "do", adjustClause(path.call(print, "body"), options) ]), parts = [ doBody ];
            return endsWithBrace(doBody) ? parts.push(" while") : parts.push("\nwhile"), parts.push(" (", path.call(print, "test"), ");"), 
            concat(parts);

          case "DoExpression":
            var statements = path.call(function(bodyPath) {
                return printStatementSequence(bodyPath, options, print);
            }, "body");
            return concat([ "do {\n", statements.indent(options.tabWidth), "\n}" ]);

          case "BreakStatement":
            return parts.push("break"), n.label && parts.push(" ", path.call(print, "label")), 
            parts.push(";"), concat(parts);

          case "ContinueStatement":
            return parts.push("continue"), n.label && parts.push(" ", path.call(print, "label")), 
            parts.push(";"), concat(parts);

          case "LabeledStatement":
            return concat([ path.call(print, "label"), ":\n", path.call(print, "body") ]);

          case "TryStatement":
            return parts.push("try ", path.call(print, "block")), n.handler ? parts.push(" ", path.call(print, "handler")) : n.handlers && path.each(function(handlerPath) {
                parts.push(" ", print(handlerPath));
            }, "handlers"), n.finalizer && parts.push(" finally ", path.call(print, "finalizer")), 
            concat(parts);

          case "CatchClause":
            return parts.push("catch (", path.call(print, "param")), n.guard && parts.push(" if ", path.call(print, "guard")), 
            parts.push(") ", path.call(print, "body")), concat(parts);

          case "ThrowStatement":
            return concat([ "throw ", path.call(print, "argument"), ";" ]);

          case "SwitchStatement":
            return concat([ "switch (", path.call(print, "discriminant"), ") {\n", fromString("\n").join(path.map(print, "cases")), "\n}" ]);

          case "SwitchCase":
            return n.test ? parts.push("case ", path.call(print, "test"), ":") : parts.push("default:"), 
            n.consequent.length > 0 && parts.push("\n", path.call(function(consequentPath) {
                return printStatementSequence(consequentPath, options, print);
            }, "consequent").indent(options.tabWidth)), concat(parts);

          case "DebuggerStatement":
            return fromString("debugger;");

          case "JSXAttribute":
            return parts.push(path.call(print, "name")), n.value && parts.push("=", path.call(print, "value")), 
            concat(parts);

          case "JSXIdentifier":
            return fromString(n.name, options);

          case "JSXNamespacedName":
            return fromString(":").join([ path.call(print, "namespace"), path.call(print, "name") ]);

          case "JSXMemberExpression":
            return fromString(".").join([ path.call(print, "object"), path.call(print, "property") ]);

          case "JSXSpreadAttribute":
            return concat([ "{...", path.call(print, "argument"), "}" ]);

          case "JSXExpressionContainer":
            return concat([ "{", path.call(print, "expression"), "}" ]);

          case "JSXElement":
            var openingLines = path.call(print, "openingElement");
            if (n.openingElement.selfClosing) return assert.ok(!n.closingElement), openingLines;
            var childLines = concat(path.map(function(childPath) {
                var child = childPath.getValue();
                if (namedTypes.Literal.check(child) && "string" == typeof child.value) {
                    if (/\S/.test(child.value)) return child.value.replace(/^\s+|\s+$/g, "");
                    if (/\n/.test(child.value)) return "\n";
                }
                return print(childPath);
            }, "children")).indentTail(options.tabWidth), closingLines = path.call(print, "closingElement");
            return concat([ openingLines, childLines, closingLines ]);

          case "JSXOpeningElement":
            parts.push("<", path.call(print, "name"));
            var attrParts = [];
            path.each(function(attrPath) {
                attrParts.push(" ", print(attrPath));
            }, "attributes");
            var attrLines = concat(attrParts), needLineWrap = attrLines.length > 1 || attrLines.getLineLength(1) > options.wrapColumn;
            return needLineWrap && (attrParts.forEach(function(part, i) {
                " " === part && (assert.strictEqual(i % 2, 0), attrParts[i] = "\n");
            }), attrLines = concat(attrParts).indentTail(options.tabWidth)), parts.push(attrLines, n.selfClosing ? " />" : ">"), 
            concat(parts);

          case "JSXClosingElement":
            return concat([ "</", path.call(print, "name"), ">" ]);

          case "JSXText":
            return fromString(n.value, options);

          case "JSXEmptyExpression":
            return fromString("");

          case "TypeAnnotatedIdentifier":
            return concat([ path.call(print, "annotation"), " ", path.call(print, "identifier") ]);

          case "ClassBody":
            return 0 === n.body.length ? fromString("{}") : concat([ "{\n", path.call(function(bodyPath) {
                return printStatementSequence(bodyPath, options, print);
            }, "body").indent(options.tabWidth), "\n}" ]);

          case "ClassPropertyDefinition":
            return parts.push("static ", path.call(print, "definition")), namedTypes.MethodDefinition.check(n.definition) || parts.push(";"), 
            concat(parts);

          case "ClassProperty":
            n.static && parts.push("static ");
            var key = path.call(print, "key");
            return n.computed ? key = concat([ "[", key, "]" ]) : "plus" === n.variance ? key = concat([ "+", key ]) : "minus" === n.variance && (key = concat([ "-", key ])), 
            parts.push(key), n.typeAnnotation && parts.push(path.call(print, "typeAnnotation")), 
            n.value && parts.push(" = ", path.call(print, "value")), parts.push(";"), concat(parts);

          case "ClassDeclaration":
          case "ClassExpression":
            return parts.push("class"), n.id && parts.push(" ", path.call(print, "id"), path.call(print, "typeParameters")), 
            n.superClass && parts.push(" extends ", path.call(print, "superClass"), path.call(print, "superTypeParameters")), 
            n.implements && n.implements.length > 0 && parts.push(" implements ", fromString(", ").join(path.map(print, "implements"))), 
            parts.push(" ", path.call(print, "body")), concat(parts);

          case "TemplateElement":
            return fromString(n.value.raw, options).lockIndentTail();

          case "TemplateLiteral":
            var expressions = path.map(print, "expressions");
            return parts.push("`"), path.each(function(childPath) {
                var i = childPath.getName();
                parts.push(print(childPath)), i < expressions.length && parts.push("${", expressions[i], "}");
            }, "quasis"), parts.push("`"), concat(parts).lockIndentTail();

          case "TaggedTemplateExpression":
            return concat([ path.call(print, "tag"), path.call(print, "quasi") ]);

          case "Node":
          case "Printable":
          case "SourceLocation":
          case "Position":
          case "Statement":
          case "Function":
          case "Pattern":
          case "Expression":
          case "Declaration":
          case "Specifier":
          case "NamedSpecifier":
          case "Comment":
          case "MemberTypeAnnotation":
          case "TupleTypeAnnotation":
          case "Type":
            throw new Error("unprintable type: " + JSON.stringify(n.type));

          case "CommentBlock":
          case "Block":
            return concat([ "/*", fromString(n.value, options), "*/" ]);

          case "CommentLine":
          case "Line":
            return concat([ "//", fromString(n.value, options) ]);

          case "TypeAnnotation":
            return n.typeAnnotation ? ("FunctionTypeAnnotation" !== n.typeAnnotation.type && parts.push(": "), 
            parts.push(path.call(print, "typeAnnotation")), concat(parts)) : fromString("");

          case "ExistentialTypeParam":
          case "ExistsTypeAnnotation":
            return fromString("*", options);

          case "EmptyTypeAnnotation":
            return fromString("empty", options);

          case "AnyTypeAnnotation":
            return fromString("any", options);

          case "MixedTypeAnnotation":
            return fromString("mixed", options);

          case "ArrayTypeAnnotation":
            return concat([ path.call(print, "elementType"), "[]" ]);

          case "BooleanTypeAnnotation":
            return fromString("boolean", options);

          case "BooleanLiteralTypeAnnotation":
            return assert.strictEqual(_typeof(n.value), "boolean"), fromString("" + n.value, options);

          case "DeclareClass":
            return printFlowDeclaration(path, [ "class ", path.call(print, "id"), " ", path.call(print, "body") ]);

          case "DeclareFunction":
            return printFlowDeclaration(path, [ "function ", path.call(print, "id"), ";" ]);

          case "DeclareModule":
            return printFlowDeclaration(path, [ "module ", path.call(print, "id"), " ", path.call(print, "body") ]);

          case "DeclareModuleExports":
            return printFlowDeclaration(path, [ "module.exports", path.call(print, "typeAnnotation") ]);

          case "DeclareVariable":
            return printFlowDeclaration(path, [ "var ", path.call(print, "id"), ";" ]);

          case "DeclareExportDeclaration":
            return concat([ "declare ", printExportDeclaration(path, options, print) ]);

          case "FunctionTypeAnnotation":
            var parent = path.getParentNode(0), isArrowFunctionTypeAnnotation = !(namedTypes.ObjectTypeCallProperty.check(parent) || namedTypes.DeclareFunction.check(path.getParentNode(2))), needsColon = isArrowFunctionTypeAnnotation && !namedTypes.FunctionTypeParam.check(parent);
            return needsColon && parts.push(": "), parts.push("(", fromString(", ").join(path.map(print, "params")), ")"), 
            n.returnType && parts.push(isArrowFunctionTypeAnnotation ? " => " : ": ", path.call(print, "returnType")), 
            concat(parts);

          case "FunctionTypeParam":
            return concat([ path.call(print, "name"), n.optional ? "?" : "", ": ", path.call(print, "typeAnnotation") ]);

          case "GenericTypeAnnotation":
            return concat([ path.call(print, "id"), path.call(print, "typeParameters") ]);

          case "DeclareInterface":
            parts.push("declare ");

          case "InterfaceDeclaration":
            return parts.push(fromString("interface ", options), path.call(print, "id"), path.call(print, "typeParameters"), " "), 
            n.extends && parts.push("extends ", fromString(", ").join(path.map(print, "extends"))), 
            parts.push(" ", path.call(print, "body")), concat(parts);

          case "ClassImplements":
          case "InterfaceExtends":
            return concat([ path.call(print, "id"), path.call(print, "typeParameters") ]);

          case "IntersectionTypeAnnotation":
            return fromString(" & ").join(path.map(print, "types"));

          case "NullableTypeAnnotation":
            return concat([ "?", path.call(print, "typeAnnotation") ]);

          case "NullLiteralTypeAnnotation":
            return fromString("null", options);

          case "ThisTypeAnnotation":
            return fromString("this", options);

          case "NumberTypeAnnotation":
            return fromString("number", options);

          case "ObjectTypeCallProperty":
            return path.call(print, "value");

          case "ObjectTypeIndexer":
            var variance = "plus" === n.variance ? "+" : "minus" === n.variance ? "-" : "";
            return concat([ variance, "[", path.call(print, "id"), ": ", path.call(print, "key"), "]: ", path.call(print, "value") ]);

          case "ObjectTypeProperty":
            var variance = "plus" === n.variance ? "+" : "minus" === n.variance ? "-" : "";
            return concat([ variance, path.call(print, "key"), n.optional ? "?" : "", ": ", path.call(print, "value") ]);

          case "QualifiedTypeIdentifier":
            return concat([ path.call(print, "qualification"), ".", path.call(print, "id") ]);

          case "StringLiteralTypeAnnotation":
            return fromString(nodeStr(n.value, options), options);

          case "NumberLiteralTypeAnnotation":
            return assert.strictEqual(_typeof(n.value), "number"), fromString("" + n.value, options);

          case "StringTypeAnnotation":
            return fromString("string", options);

          case "DeclareTypeAlias":
            parts.push("declare ");

          case "TypeAlias":
            return concat([ "type ", path.call(print, "id"), path.call(print, "typeParameters"), " = ", path.call(print, "right"), ";" ]);

          case "TypeCastExpression":
            return concat([ "(", path.call(print, "expression"), path.call(print, "typeAnnotation"), ")" ]);

          case "TypeParameterDeclaration":
          case "TypeParameterInstantiation":
            return concat([ "<", fromString(", ").join(path.map(print, "params")), ">" ]);

          case "TypeParameter":
            switch (n.variance) {
              case "plus":
                parts.push("+");
                break;

              case "minus":
                parts.push("-");
            }
            return parts.push(path.call(print, "name")), n.bound && parts.push(path.call(print, "bound")), 
            n.default && parts.push("=", path.call(print, "default")), concat(parts);

          case "TypeofTypeAnnotation":
            return concat([ fromString("typeof ", options), path.call(print, "argument") ]);

          case "UnionTypeAnnotation":
            return fromString(" | ").join(path.map(print, "types"));

          case "VoidTypeAnnotation":
            return fromString("void", options);

          case "NullTypeAnnotation":
            return fromString("null", options);

          case "ClassHeritage":
          case "ComprehensionBlock":
          case "ComprehensionExpression":
          case "Glob":
          case "GeneratorExpression":
          case "LetStatement":
          case "LetExpression":
          case "GraphExpression":
          case "GraphIndexExpression":
          case "XMLDefaultDeclaration":
          case "XMLAnyName":
          case "XMLQualifiedIdentifier":
          case "XMLFunctionQualifiedIdentifier":
          case "XMLAttributeSelector":
          case "XMLFilterExpression":
          case "XML":
          case "XMLElement":
          case "XMLList":
          case "XMLEscape":
          case "XMLText":
          case "XMLStartTag":
          case "XMLEndTag":
          case "XMLPointTag":
          case "XMLName":
          case "XMLAttribute":
          case "XMLCdata":
          case "XMLComment":
          case "XMLProcessingInstruction":
          default:
            throw new Error("unknown type: " + JSON.stringify(n.type));
        }
        return p;
    }
    function printStatementSequence(path, options, print) {
        var filtered = (namedTypes.ClassBody && namedTypes.ClassBody.check(path.getParentNode()), 
        []), sawComment = !1, sawStatement = !1;
        path.each(function(stmtPath) {
            var stmt = (stmtPath.getName(), stmtPath.getValue());
            stmt && "EmptyStatement" !== stmt.type && (namedTypes.Comment.check(stmt) ? sawComment = !0 : namedTypes.Statement.check(stmt) ? sawStatement = !0 : isString.assert(stmt), 
            filtered.push({
                node: stmt,
                printed: print(stmtPath)
            }));
        }), sawComment && assert.strictEqual(sawStatement, !1, "Comments may appear as statements in otherwise empty statement lists, but may not coexist with non-Comment nodes.");
        var prevTrailingSpace = null, len = filtered.length, parts = [];
        return filtered.forEach(function(info, i) {
            var leadingSpace, trailingSpace, printed = info.printed, stmt = info.node, multiLine = printed.length > 1, notFirst = i > 0, notLast = i < len - 1, lines = stmt && stmt.loc && stmt.loc.lines, trueLoc = lines && options.reuseWhitespace && util.getTrueLoc(stmt, lines);
            if (notFirst) if (trueLoc) {
                var beforeStart = lines.skipSpaces(trueLoc.start, !0), beforeStartLine = beforeStart ? beforeStart.line : 1, leadingGap = trueLoc.start.line - beforeStartLine;
                leadingSpace = Array(leadingGap + 1).join("\n");
            } else leadingSpace = multiLine ? "\n\n" : "\n"; else leadingSpace = "";
            if (notLast) if (trueLoc) {
                var afterEnd = lines.skipSpaces(trueLoc.end), afterEndLine = afterEnd ? afterEnd.line : lines.length, trailingGap = afterEndLine - trueLoc.end.line;
                trailingSpace = Array(trailingGap + 1).join("\n");
            } else trailingSpace = multiLine ? "\n\n" : "\n"; else trailingSpace = "";
            parts.push(maxSpace(prevTrailingSpace, leadingSpace), printed), notLast ? prevTrailingSpace = trailingSpace : trailingSpace && parts.push(trailingSpace);
        }), concat(parts);
    }
    function maxSpace(s1, s2) {
        if (!s1 && !s2) return fromString("");
        if (!s1) return fromString(s2);
        if (!s2) return fromString(s1);
        var spaceLines1 = fromString(s1), spaceLines2 = fromString(s2);
        return spaceLines2.length > spaceLines1.length ? spaceLines2 : spaceLines1;
    }
    function printMethod(path, options, print) {
        var node = path.getNode(), kind = node.kind, parts = [];
        "ObjectMethod" === node.type || "ClassMethod" === node.type ? node.value = node : namedTypes.FunctionExpression.assert(node.value), 
        node.value.async && parts.push("async "), kind && "init" !== kind && "method" !== kind && "constructor" !== kind ? (assert.ok("get" === kind || "set" === kind), 
        parts.push(kind, " ")) : node.value.generator && parts.push("*");
        var key = path.call(print, "key");
        return node.computed && (key = concat([ "[", key, "]" ])), parts.push(key, path.call(print, "value", "typeParameters"), "(", path.call(function(valuePath) {
            return printFunctionParams(valuePath, options, print);
        }, "value"), ")", path.call(print, "value", "returnType"), " ", path.call(print, "value", "body")), 
        concat(parts);
    }
    function printArgumentsList(path, options, print) {
        var printed = path.map(print, "arguments"), trailingComma = util.isTrailingCommaEnabled(options, "parameters"), joined = fromString(", ").join(printed);
        return joined.getLineLength(1) > options.wrapColumn ? (joined = fromString(",\n").join(printed), 
        concat([ "(\n", joined.indent(options.tabWidth), trailingComma ? ",\n)" : "\n)" ])) : concat([ "(", joined, ")" ]);
    }
    function printFunctionParams(path, options, print) {
        var fun = path.getValue();
        namedTypes.Function.assert(fun);
        var printed = path.map(print, "params");
        fun.defaults && path.each(function(defExprPath) {
            var i = defExprPath.getName(), p = printed[i];
            p && defExprPath.getValue() && (printed[i] = concat([ p, " = ", print(defExprPath) ]));
        }, "defaults"), fun.rest && printed.push(concat([ "...", path.call(print, "rest") ]));
        var joined = fromString(", ").join(printed);
        return joined.length > 1 || joined.getLineLength(1) > options.wrapColumn ? (joined = fromString(",\n").join(printed), 
        joined = concat(util.isTrailingCommaEnabled(options, "parameters") && !fun.rest && "RestElement" !== fun.params[fun.params.length - 1].type ? [ joined, ",\n" ] : [ joined, "\n" ]), 
        concat([ "\n", joined.indent(options.tabWidth) ])) : joined;
    }
    function printObjectMethod(path, options, print) {
        var objMethod = path.getValue(), parts = [];
        if (objMethod.async && parts.push("async "), objMethod.generator && parts.push("*"), 
        objMethod.method || "get" === objMethod.kind || "set" === objMethod.kind) return printMethod(path, options, print);
        var key = path.call(print, "key");
        return objMethod.computed ? parts.push("[", key, "]") : parts.push(key), parts.push("(", printFunctionParams(path, options, print), ")", path.call(print, "returnType"), " ", path.call(print, "body")), 
        concat(parts);
    }
    function printExportDeclaration(path, options, print) {
        var decl = path.getValue(), parts = [ "export " ], shouldPrintSpaces = options.objectCurlySpacing;
        namedTypes.Declaration.assert(decl), (decl.default || "ExportDefaultDeclaration" === decl.type) && parts.push("default "), 
        decl.declaration ? parts.push(path.call(print, "declaration")) : decl.specifiers && decl.specifiers.length > 0 && (1 === decl.specifiers.length && "ExportBatchSpecifier" === decl.specifiers[0].type ? parts.push("*") : parts.push(shouldPrintSpaces ? "{ " : "{", fromString(", ").join(path.map(print, "specifiers")), shouldPrintSpaces ? " }" : "}"), 
        decl.source && parts.push(" from ", path.call(print, "source")));
        var lines = concat(parts);
        return ";" === lastNonSpaceCharacter(lines) || decl.declaration && ("FunctionDeclaration" === decl.declaration.type || "ClassDeclaration" === decl.declaration.type) || (lines = concat([ lines, ";" ])), 
        lines;
    }
    function printFlowDeclaration(path, parts) {
        var parentExportDecl = util.getParentExportDeclaration(path);
        return parentExportDecl ? assert.strictEqual(parentExportDecl.type, "DeclareExportDeclaration") : parts.unshift("declare "), 
        concat(parts);
    }
    function adjustClause(clause, options) {
        return concat(clause.length > 1 ? [ " ", clause ] : [ "\n", maybeAddSemicolon(clause).indent(options.tabWidth) ]);
    }
    function lastNonSpaceCharacter(lines) {
        var pos = lines.lastPos();
        do {
            var ch = lines.charAt(pos);
            if (/\S/.test(ch)) return ch;
        } while (lines.prevPos(pos));
    }
    function endsWithBrace(lines) {
        return "}" === lastNonSpaceCharacter(lines);
    }
    function swapQuotes(str) {
        return str.replace(/['"]/g, function(m) {
            return '"' === m ? "'" : '"';
        });
    }
    function nodeStr(str, options) {
        switch (isString.assert(str), options.quote) {
          case "auto":
            var double = JSON.stringify(str), single = swapQuotes(JSON.stringify(swapQuotes(str)));
            return double.length > single.length ? single : double;

          case "single":
            return swapQuotes(JSON.stringify(swapQuotes(str)));

          case "double":
          default:
            return JSON.stringify(str);
        }
    }
    function maybeAddSemicolon(lines) {
        var eoc = lastNonSpaceCharacter(lines);
        return !eoc || "\n};".indexOf(eoc) < 0 ? concat([ lines, ";" ]) : lines;
    }
    var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, assert = __webpack_require__(/*! assert */ 5), printComments = (__webpack_require__(/*! source-map */ 16), 
    __webpack_require__(/*! ./comments */ 23).printComments), linesModule = __webpack_require__(/*! ./lines */ 8), fromString = linesModule.fromString, concat = linesModule.concat, normalizeOptions = __webpack_require__(/*! ./options */ 14).normalize, getReprinter = __webpack_require__(/*! ./patcher */ 25).getReprinter, types = __webpack_require__(/*! ./types */ 3), namedTypes = types.namedTypes, isString = types.builtInTypes.string, isObject = types.builtInTypes.object, FastPath = __webpack_require__(/*! ./fast-path */ 24), util = __webpack_require__(/*! ./util */ 6), PRp = PrintResult.prototype, warnedAboutToString = !1;
    PRp.toString = function() {
        return warnedAboutToString || (console.warn("Deprecation warning: recast.print now returns an object with a .code property. You appear to be treating the object as a string, which might still work but is strongly discouraged."), 
        warnedAboutToString = !0), this.code;
    };
    var emptyPrintResult = new PrintResult("");
    exports.Printer = Printer;
}, /*!********************************************!*\
  !*** ./~/recast/~/ast-types/def/babel6.js ***!
  \********************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./babel */ 26)), fork.use(__webpack_require__(/*! ./flow */ 28));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 1)), defaults = fork.use(__webpack_require__(/*! ../lib/shared */ 4)).defaults, def = types.Type.def, or = types.Type.or;
        def("Directive").bases("Node").build("value").field("value", def("DirectiveLiteral")), 
        def("DirectiveLiteral").bases("Node", "Expression").build("value").field("value", String, defaults["use strict"]), 
        def("BlockStatement").bases("Statement").build("body").field("body", [ def("Statement") ]).field("directives", [ def("Directive") ], defaults.emptyArray), 
        def("Program").bases("Node").build("body").field("body", [ def("Statement") ]).field("directives", [ def("Directive") ], defaults.emptyArray), 
        def("StringLiteral").bases("Literal").build("value").field("value", String), def("NumericLiteral").bases("Literal").build("value").field("value", Number), 
        def("NullLiteral").bases("Literal").build(), def("BooleanLiteral").bases("Literal").build("value").field("value", Boolean), 
        def("RegExpLiteral").bases("Literal").build("pattern", "flags").field("pattern", String).field("flags", String);
        var ObjectExpressionProperty = or(def("Property"), def("ObjectMethod"), def("ObjectProperty"), def("SpreadProperty"));
        def("ObjectExpression").bases("Expression").build("properties").field("properties", [ ObjectExpressionProperty ]), 
        def("ObjectMethod").bases("Node", "Function").build("kind", "key", "params", "body", "computed").field("kind", or("method", "get", "set")).field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("params", [ def("Pattern") ]).field("body", def("BlockStatement")).field("computed", Boolean, defaults.false).field("generator", Boolean, defaults.false).field("async", Boolean, defaults.false).field("decorators", or([ def("Decorator") ], null), defaults.null), 
        def("ObjectProperty").bases("Node").build("key", "value").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("value", or(def("Expression"), def("Pattern"))).field("computed", Boolean, defaults.false);
        var ClassBodyElement = or(def("MethodDefinition"), def("VariableDeclarator"), def("ClassPropertyDefinition"), def("ClassProperty"), def("ClassMethod"));
        def("ClassBody").bases("Declaration").build("body").field("body", [ ClassBodyElement ]), 
        def("ClassMethod").bases("Declaration", "Function").build("kind", "key", "params", "body", "computed", "static").field("kind", or("get", "set", "method", "constructor")).field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("params", [ def("Pattern") ]).field("body", def("BlockStatement")).field("computed", Boolean, defaults.false).field("static", Boolean, defaults.false).field("generator", Boolean, defaults.false).field("async", Boolean, defaults.false).field("decorators", or([ def("Decorator") ], null), defaults.null);
        var ObjectPatternProperty = or(def("Property"), def("PropertyPattern"), def("SpreadPropertyPattern"), def("SpreadProperty"), def("ObjectProperty"), def("RestProperty"));
        def("ObjectPattern").bases("Pattern").build("properties").field("properties", [ ObjectPatternProperty ]).field("decorators", or([ def("Decorator") ], null), defaults.null), 
        def("SpreadProperty").bases("Node").build("argument").field("argument", def("Expression")), 
        def("RestProperty").bases("Node").build("argument").field("argument", def("Expression")), 
        def("ForAwaitStatement").bases("Statement").build("left", "right", "body").field("left", or(def("VariableDeclaration"), def("Expression"))).field("right", def("Expression")).field("body", def("Statement"));
    };
}, /*!*****************************************!*\
  !*** ./~/recast/~/ast-types/def/e4x.js ***!
  \*****************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./core */ 12));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 1)), def = types.Type.def, or = types.Type.or;
        def("XMLDefaultDeclaration").bases("Declaration").field("namespace", def("Expression")), 
        def("XMLAnyName").bases("Expression"), def("XMLQualifiedIdentifier").bases("Expression").field("left", or(def("Identifier"), def("XMLAnyName"))).field("right", or(def("Identifier"), def("Expression"))).field("computed", Boolean), 
        def("XMLFunctionQualifiedIdentifier").bases("Expression").field("right", or(def("Identifier"), def("Expression"))).field("computed", Boolean), 
        def("XMLAttributeSelector").bases("Expression").field("attribute", def("Expression")), 
        def("XMLFilterExpression").bases("Expression").field("left", def("Expression")).field("right", def("Expression")), 
        def("XMLElement").bases("XML", "Expression").field("contents", [ def("XML") ]), 
        def("XMLList").bases("XML", "Expression").field("contents", [ def("XML") ]), def("XML").bases("Node"), 
        def("XMLEscape").bases("XML").field("expression", def("Expression")), def("XMLText").bases("XML").field("text", String), 
        def("XMLStartTag").bases("XML").field("contents", [ def("XML") ]), def("XMLEndTag").bases("XML").field("contents", [ def("XML") ]), 
        def("XMLPointTag").bases("XML").field("contents", [ def("XML") ]), def("XMLName").bases("XML").field("contents", or(String, [ def("XML") ])), 
        def("XMLAttribute").bases("XML").field("value", String), def("XMLCdata").bases("XML").field("contents", String), 
        def("XMLComment").bases("XML").field("contents", String), def("XMLProcessingInstruction").bases("XML").field("target", String).field("contents", or(String, null));
    };
}, /*!*********************************************!*\
  !*** ./~/recast/~/ast-types/def/esprima.js ***!
  \*********************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./es7 */ 9));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 1)), defaults = fork.use(__webpack_require__(/*! ../lib/shared */ 4)).defaults, def = types.Type.def, or = types.Type.or;
        def("VariableDeclaration").field("declarations", [ or(def("VariableDeclarator"), def("Identifier")) ]), 
        def("Property").field("value", or(def("Expression"), def("Pattern"))), def("ArrayPattern").field("elements", [ or(def("Pattern"), def("SpreadElement"), null) ]), 
        def("ObjectPattern").field("properties", [ or(def("Property"), def("PropertyPattern"), def("SpreadPropertyPattern"), def("SpreadProperty")) ]), 
        def("ExportSpecifier").bases("ModuleSpecifier").build("id", "name"), def("ExportBatchSpecifier").bases("Specifier").build(), 
        def("ImportSpecifier").bases("ModuleSpecifier").build("id", "name"), def("ImportNamespaceSpecifier").bases("ModuleSpecifier").build("id"), 
        def("ImportDefaultSpecifier").bases("ModuleSpecifier").build("id"), def("ExportDeclaration").bases("Declaration").build("default", "declaration", "specifiers", "source").field("default", Boolean).field("declaration", or(def("Declaration"), def("Expression"), null)).field("specifiers", [ or(def("ExportSpecifier"), def("ExportBatchSpecifier")) ], defaults.emptyArray).field("source", or(def("Literal"), null), defaults.null), 
        def("ImportDeclaration").bases("Declaration").build("specifiers", "source").field("specifiers", [ or(def("ImportSpecifier"), def("ImportNamespaceSpecifier"), def("ImportDefaultSpecifier")) ], defaults.emptyArray).field("source", def("Literal")), 
        def("Block").bases("Comment").build("value", "leading", "trailing"), def("Line").bases("Comment").build("value", "leading", "trailing");
    };
}, /*!*****************************************!*\
  !*** ./~/recast/~/ast-types/def/jsx.js ***!
  \*****************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./es7 */ 9));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 1)), def = types.Type.def, or = types.Type.or, defaults = fork.use(__webpack_require__(/*! ../lib/shared */ 4)).defaults;
        def("JSXAttribute").bases("Node").build("name", "value").field("name", or(def("JSXIdentifier"), def("JSXNamespacedName"))).field("value", or(def("Literal"), def("JSXExpressionContainer"), null), defaults.null), 
        def("JSXIdentifier").bases("Identifier").build("name").field("name", String), def("JSXNamespacedName").bases("Node").build("namespace", "name").field("namespace", def("JSXIdentifier")).field("name", def("JSXIdentifier")), 
        def("JSXMemberExpression").bases("MemberExpression").build("object", "property").field("object", or(def("JSXIdentifier"), def("JSXMemberExpression"))).field("property", def("JSXIdentifier")).field("computed", Boolean, defaults.false);
        var JSXElementName = or(def("JSXIdentifier"), def("JSXNamespacedName"), def("JSXMemberExpression"));
        def("JSXSpreadAttribute").bases("Node").build("argument").field("argument", def("Expression"));
        var JSXAttributes = [ or(def("JSXAttribute"), def("JSXSpreadAttribute")) ];
        def("JSXExpressionContainer").bases("Expression").build("expression").field("expression", def("Expression")), 
        def("JSXElement").bases("Expression").build("openingElement", "closingElement", "children").field("openingElement", def("JSXOpeningElement")).field("closingElement", or(def("JSXClosingElement"), null), defaults.null).field("children", [ or(def("JSXElement"), def("JSXExpressionContainer"), def("JSXText"), def("Literal")) ], defaults.emptyArray).field("name", JSXElementName, function() {
            return this.openingElement.name;
        }, !0).field("selfClosing", Boolean, function() {
            return this.openingElement.selfClosing;
        }, !0).field("attributes", JSXAttributes, function() {
            return this.openingElement.attributes;
        }, !0), def("JSXOpeningElement").bases("Node").build("name", "attributes", "selfClosing").field("name", JSXElementName).field("attributes", JSXAttributes, defaults.emptyArray).field("selfClosing", Boolean, defaults.false), 
        def("JSXClosingElement").bases("Node").build("name").field("name", JSXElementName), 
        def("JSXText").bases("Literal").build("value").field("value", String), def("JSXEmptyExpression").bases("Expression").build();
    };
}, /*!*********************************************!*\
  !*** ./~/recast/~/ast-types/def/mozilla.js ***!
  \*********************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        fork.use(__webpack_require__(/*! ./core */ 12));
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 1)), def = types.Type.def, or = types.Type.or, shared = fork.use(__webpack_require__(/*! ../lib/shared */ 4)), geq = shared.geq, defaults = shared.defaults;
        def("Function").field("body", or(def("BlockStatement"), def("Expression"))), def("ForInStatement").build("left", "right", "body", "each").field("each", Boolean, defaults.false), 
        def("ForOfStatement").bases("Statement").build("left", "right", "body").field("left", or(def("VariableDeclaration"), def("Expression"))).field("right", def("Expression")).field("body", def("Statement")), 
        def("LetStatement").bases("Statement").build("head", "body").field("head", [ def("VariableDeclarator") ]).field("body", def("Statement")), 
        def("LetExpression").bases("Expression").build("head", "body").field("head", [ def("VariableDeclarator") ]).field("body", def("Expression")), 
        def("GraphExpression").bases("Expression").build("index", "expression").field("index", geq(0)).field("expression", def("Literal")), 
        def("GraphIndexExpression").bases("Expression").build("index").field("index", geq(0));
    };
}, /*!**************************************!*\
  !*** ./~/recast/~/ast-types/fork.js ***!
  \**************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(defs) {
        function use(plugin) {
            var idx = used.indexOf(plugin);
            return idx === -1 && (idx = used.length, used.push(plugin), usedResult[idx] = plugin(fork)), 
            usedResult[idx];
        }
        var used = [], usedResult = [], fork = {};
        fork.use = use;
        var types = use(__webpack_require__(/*! ./lib/types */ 1));
        defs.forEach(use), types.finalize();
        var exports = {
            Type: types.Type,
            builtInTypes: types.builtInTypes,
            namedTypes: types.namedTypes,
            builders: types.builders,
            defineMethod: types.defineMethod,
            getFieldNames: types.getFieldNames,
            getFieldValue: types.getFieldValue,
            eachField: types.eachField,
            someField: types.someField,
            getSupertypeNames: types.getSupertypeNames,
            astNodesAreEquivalent: use(__webpack_require__(/*! ./lib/equiv */ 57)),
            finalize: types.finalize,
            Path: use(__webpack_require__(/*! ./lib/path */ 29)),
            NodePath: use(__webpack_require__(/*! ./lib/node-path */ 15)),
            PathVisitor: use(__webpack_require__(/*! ./lib/path-visitor */ 58)),
            use: use
        };
        return exports.visit = exports.PathVisitor.visit, exports;
    };
}, /*!*******************************************!*\
  !*** ./~/recast/~/ast-types/lib/equiv.js ***!
  \*******************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(fork) {
        function astNodesAreEquivalent(a, b, problemPath) {
            return isArray.check(problemPath) ? problemPath.length = 0 : problemPath = null, 
            areEquivalent(a, b, problemPath);
        }
        function subscriptForProperty(property) {
            return /[_$a-z][_$a-z0-9]*/i.test(property) ? "." + property : "[" + JSON.stringify(property) + "]";
        }
        function areEquivalent(a, b, problemPath) {
            return a === b || (isArray.check(a) ? arraysAreEquivalent(a, b, problemPath) : isObject.check(a) ? objectsAreEquivalent(a, b, problemPath) : isDate.check(a) ? isDate.check(b) && +a === +b : isRegExp.check(a) ? isRegExp.check(b) && a.source === b.source && a.global === b.global && a.multiline === b.multiline && a.ignoreCase === b.ignoreCase : a == b);
        }
        function arraysAreEquivalent(a, b, problemPath) {
            isArray.assert(a);
            var aLength = a.length;
            if (!isArray.check(b) || b.length !== aLength) return problemPath && problemPath.push("length"), 
            !1;
            for (var i = 0; i < aLength; ++i) {
                if (problemPath && problemPath.push(i), i in a != i in b) return !1;
                if (!areEquivalent(a[i], b[i], problemPath)) return !1;
                if (problemPath) {
                    var problemPathTail = problemPath.pop();
                    if (problemPathTail !== i) throw new Error("" + problemPathTail);
                }
            }
            return !0;
        }
        function objectsAreEquivalent(a, b, problemPath) {
            if (isObject.assert(a), !isObject.check(b)) return !1;
            if (a.type !== b.type) return problemPath && problemPath.push("type"), !1;
            var aNames = getFieldNames(a), aNameCount = aNames.length, bNames = getFieldNames(b), bNameCount = bNames.length;
            if (aNameCount === bNameCount) {
                for (var i = 0; i < aNameCount; ++i) {
                    var name = aNames[i], aChild = getFieldValue(a, name), bChild = getFieldValue(b, name);
                    if (problemPath && problemPath.push(name), !areEquivalent(aChild, bChild, problemPath)) return !1;
                    if (problemPath) {
                        var problemPathTail = problemPath.pop();
                        if (problemPathTail !== name) throw new Error("" + problemPathTail);
                    }
                }
                return !0;
            }
            if (!problemPath) return !1;
            var seenNames = Object.create(null);
            for (i = 0; i < aNameCount; ++i) seenNames[aNames[i]] = !0;
            for (i = 0; i < bNameCount; ++i) {
                if (name = bNames[i], !hasOwn.call(seenNames, name)) return problemPath.push(name), 
                !1;
                delete seenNames[name];
            }
            for (name in seenNames) {
                problemPath.push(name);
                break;
            }
            return !1;
        }
        var types = fork.use(__webpack_require__(/*! ../lib/types */ 1)), getFieldNames = types.getFieldNames, getFieldValue = types.getFieldValue, isArray = types.builtInTypes.array, isObject = types.builtInTypes.object, isDate = types.builtInTypes.Date, isRegExp = types.builtInTypes.RegExp, hasOwn = Object.prototype.hasOwnProperty;
        return astNodesAreEquivalent.assert = function(a, b) {
            var problemPath = [];
            if (!astNodesAreEquivalent(a, b, problemPath)) {
                if (0 !== problemPath.length) throw new Error("Nodes differ in the following path: " + problemPath.map(subscriptForProperty).join(""));
                if (a !== b) throw new Error("Nodes must be equal");
            }
        }, astNodesAreEquivalent;
    };
}, /*!**************************************************!*\
  !*** ./~/recast/~/ast-types/lib/path-visitor.js ***!
  \**************************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, hasOwn = Object.prototype.hasOwnProperty;
    module.exports = function(fork) {
        function PathVisitor() {
            if (!(this instanceof PathVisitor)) throw new Error("PathVisitor constructor cannot be invoked without 'new'");
            this._reusableContextStack = [], this._methodNameTable = computeMethodNameTable(this), 
            this._shouldVisitComments = hasOwn.call(this._methodNameTable, "Block") || hasOwn.call(this._methodNameTable, "Line"), 
            this.Context = makeContextConstructor(this), this._visiting = !1, this._changeReported = !1;
        }
        function computeMethodNameTable(visitor) {
            var typeNames = Object.create(null);
            for (var methodName in visitor) /^visit[A-Z]/.test(methodName) && (typeNames[methodName.slice("visit".length)] = !0);
            for (var supertypeTable = types.computeSupertypeLookupTable(typeNames), methodNameTable = Object.create(null), typeNames = Object.keys(supertypeTable), typeNameCount = typeNames.length, i = 0; i < typeNameCount; ++i) {
                var typeName = typeNames[i];
                methodName = "visit" + supertypeTable[typeName], isFunction.check(visitor[methodName]) && (methodNameTable[typeName] = methodName);
            }
            return methodNameTable;
        }
        function extend(target, source) {
            for (var property in source) hasOwn.call(source, property) && (target[property] = source[property]);
            return target;
        }
        function visitChildren(path, visitor) {
            if (!(path instanceof NodePath)) throw new Error("");
            if (!(visitor instanceof PathVisitor)) throw new Error("");
            var value = path.value;
            if (isArray.check(value)) path.each(visitor.visitWithoutReset, visitor); else if (isObject.check(value)) {
                var childNames = types.getFieldNames(value);
                visitor._shouldVisitComments && value.comments && childNames.indexOf("comments") < 0 && childNames.push("comments");
                for (var childCount = childNames.length, childPaths = [], i = 0; i < childCount; ++i) {
                    var childName = childNames[i];
                    hasOwn.call(value, childName) || (value[childName] = types.getFieldValue(value, childName)), 
                    childPaths.push(path.get(childName));
                }
                for (var i = 0; i < childCount; ++i) visitor.visitWithoutReset(childPaths[i]);
            } else ;
            return path.value;
        }
        function makeContextConstructor(visitor) {
            function Context(path) {
                if (!(this instanceof Context)) throw new Error("");
                if (!(this instanceof PathVisitor)) throw new Error("");
                if (!(path instanceof NodePath)) throw new Error("");
                Object.defineProperty(this, "visitor", {
                    value: visitor,
                    writable: !1,
                    enumerable: !0,
                    configurable: !1
                }), this.currentPath = path, this.needToCallTraverse = !0, Object.seal(this);
            }
            if (!(visitor instanceof PathVisitor)) throw new Error("");
            var Cp = Context.prototype = Object.create(visitor);
            return Cp.constructor = Context, extend(Cp, sharedContextProtoMethods), Context;
        }
        var undefined, types = fork.use(__webpack_require__(/*! ./types */ 1)), NodePath = fork.use(__webpack_require__(/*! ./node-path */ 15)), isArray = (types.namedTypes.Printable, 
        types.builtInTypes.array), isObject = types.builtInTypes.object, isFunction = types.builtInTypes.function;
        PathVisitor.fromMethodsObject = function(methods) {
            function Visitor() {
                if (!(this instanceof Visitor)) throw new Error("Visitor constructor cannot be invoked without 'new'");
                PathVisitor.call(this);
            }
            if (methods instanceof PathVisitor) return methods;
            if (!isObject.check(methods)) return new PathVisitor();
            var Vp = Visitor.prototype = Object.create(PVp);
            return Vp.constructor = Visitor, extend(Vp, methods), extend(Visitor, PathVisitor), 
            isFunction.assert(Visitor.fromMethodsObject), isFunction.assert(Visitor.visit), 
            new Visitor();
        }, PathVisitor.visit = function(node, methods) {
            return PathVisitor.fromMethodsObject(methods).visit(node);
        };
        var PVp = PathVisitor.prototype;
        PVp.visit = function() {
            if (this._visiting) throw new Error("Recursively calling visitor.visit(path) resets visitor state. Try this.visit(path) or this.traverse(path) instead.");
            this._visiting = !0, this._changeReported = !1, this._abortRequested = !1;
            for (var argc = arguments.length, args = new Array(argc), i = 0; i < argc; ++i) args[i] = arguments[i];
            args[0] instanceof NodePath || (args[0] = new NodePath({
                root: args[0]
            }).get("root")), this.reset.apply(this, args);
            try {
                var root = this.visitWithoutReset(args[0]), didNotThrow = !0;
            } finally {
                if (this._visiting = !1, !didNotThrow && this._abortRequested) return args[0].value;
            }
            return root;
        }, PVp.AbortRequest = function() {}, PVp.abort = function() {
            var visitor = this;
            visitor._abortRequested = !0;
            var request = new visitor.AbortRequest();
            throw request.cancel = function() {
                visitor._abortRequested = !1;
            }, request;
        }, PVp.reset = function(path) {}, PVp.visitWithoutReset = function(path) {
            if (this instanceof this.Context) return this.visitor.visitWithoutReset(path);
            if (!(path instanceof NodePath)) throw new Error("");
            var value = path.value, methodName = value && "object" === ("undefined" == typeof value ? "undefined" : _typeof(value)) && "string" == typeof value.type && this._methodNameTable[value.type];
            if (!methodName) return visitChildren(path, this);
            var context = this.acquireContext(path);
            try {
                return context.invokeVisitorMethod(methodName);
            } finally {
                this.releaseContext(context);
            }
        }, PVp.acquireContext = function(path) {
            return 0 === this._reusableContextStack.length ? new this.Context(path) : this._reusableContextStack.pop().reset(path);
        }, PVp.releaseContext = function(context) {
            if (!(context instanceof this.Context)) throw new Error("");
            this._reusableContextStack.push(context), context.currentPath = null;
        }, PVp.reportChanged = function() {
            this._changeReported = !0;
        }, PVp.wasChangeReported = function() {
            return this._changeReported;
        };
        var sharedContextProtoMethods = Object.create(null);
        return sharedContextProtoMethods.reset = function(path) {
            if (!(this instanceof this.Context)) throw new Error("");
            if (!(path instanceof NodePath)) throw new Error("");
            return this.currentPath = path, this.needToCallTraverse = !0, this;
        }, sharedContextProtoMethods.invokeVisitorMethod = function(methodName) {
            if (!(this instanceof this.Context)) throw new Error("");
            if (!(this.currentPath instanceof NodePath)) throw new Error("");
            var result = this.visitor[methodName].call(this, this.currentPath);
            if (result === !1 ? this.needToCallTraverse = !1 : result !== undefined && (this.currentPath = this.currentPath.replace(result)[0], 
            this.needToCallTraverse && this.traverse(this.currentPath)), this.needToCallTraverse !== !1) throw new Error("Must either call this.traverse or return false in " + methodName);
            var path = this.currentPath;
            return path && path.value;
        }, sharedContextProtoMethods.traverse = function(path, newVisitor) {
            if (!(this instanceof this.Context)) throw new Error("");
            if (!(path instanceof NodePath)) throw new Error("");
            if (!(this.currentPath instanceof NodePath)) throw new Error("");
            return this.needToCallTraverse = !1, visitChildren(path, PathVisitor.fromMethodsObject(newVisitor || this.visitor));
        }, sharedContextProtoMethods.visit = function(path, newVisitor) {
            if (!(this instanceof this.Context)) throw new Error("");
            if (!(path instanceof NodePath)) throw new Error("");
            if (!(this.currentPath instanceof NodePath)) throw new Error("");
            return this.needToCallTraverse = !1, PathVisitor.fromMethodsObject(newVisitor || this.visitor).visitWithoutReset(path);
        }, sharedContextProtoMethods.reportChanged = function() {
            this.visitor.reportChanged();
        }, sharedContextProtoMethods.abort = function() {
            this.needToCallTraverse = !1, this.visitor.abort();
        }, PathVisitor;
    };
}, /*!*******************************************!*\
  !*** ./~/recast/~/ast-types/lib/scope.js ***!
  \*******************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    var hasOwn = Object.prototype.hasOwnProperty;
    module.exports = function(fork) {
        function Scope(path, parentScope) {
            if (!(this instanceof Scope)) throw new Error("Scope constructor cannot be invoked without 'new'");
            if (!(path instanceof fork.use(__webpack_require__(/*! ./node-path */ 15)))) throw new Error("");
            ScopeType.assert(path.value);
            var depth;
            if (parentScope) {
                if (!(parentScope instanceof Scope)) throw new Error("");
                depth = parentScope.depth + 1;
            } else parentScope = null, depth = 0;
            Object.defineProperties(this, {
                path: {
                    value: path
                },
                node: {
                    value: path.value
                },
                isGlobal: {
                    value: !parentScope,
                    enumerable: !0
                },
                depth: {
                    value: depth
                },
                parent: {
                    value: parentScope
                },
                bindings: {
                    value: {}
                },
                types: {
                    value: {}
                }
            });
        }
        function scanScope(path, bindings, scopeTypes) {
            var node = path.value;
            ScopeType.assert(node), namedTypes.CatchClause.check(node) ? addPattern(path.get("param"), bindings) : recursiveScanScope(path, bindings, scopeTypes);
        }
        function recursiveScanScope(path, bindings, scopeTypes) {
            var node = path.value;
            path.parent && namedTypes.FunctionExpression.check(path.parent.node) && path.parent.node.id && addPattern(path.parent.get("id"), bindings), 
            node && (isArray.check(node) ? path.each(function(childPath) {
                recursiveScanChild(childPath, bindings, scopeTypes);
            }) : namedTypes.Function.check(node) ? (path.get("params").each(function(paramPath) {
                addPattern(paramPath, bindings);
            }), recursiveScanChild(path.get("body"), bindings, scopeTypes)) : namedTypes.TypeAlias && namedTypes.TypeAlias.check(node) ? addTypePattern(path.get("id"), scopeTypes) : namedTypes.VariableDeclarator.check(node) ? (addPattern(path.get("id"), bindings), 
            recursiveScanChild(path.get("init"), bindings, scopeTypes)) : "ImportSpecifier" === node.type || "ImportNamespaceSpecifier" === node.type || "ImportDefaultSpecifier" === node.type ? addPattern(path.get(node.local ? "local" : node.name ? "name" : "id"), bindings) : Node.check(node) && !Expression.check(node) && types.eachField(node, function(name, child) {
                var childPath = path.get(name);
                if (!pathHasValue(childPath, child)) throw new Error("");
                recursiveScanChild(childPath, bindings, scopeTypes);
            }));
        }
        function pathHasValue(path, value) {
            return path.value === value || !(!Array.isArray(path.value) || 0 !== path.value.length || !Array.isArray(value) || 0 !== value.length);
        }
        function recursiveScanChild(path, bindings, scopeTypes) {
            var node = path.value;
            if (!node || Expression.check(node)) ; else if (namedTypes.FunctionDeclaration.check(node) && null !== node.id) addPattern(path.get("id"), bindings); else if (namedTypes.ClassDeclaration && namedTypes.ClassDeclaration.check(node)) addPattern(path.get("id"), bindings); else if (ScopeType.check(node)) {
                if (namedTypes.CatchClause.check(node)) {
                    var catchParamName = node.param.name, hadBinding = hasOwn.call(bindings, catchParamName);
                    recursiveScanScope(path.get("body"), bindings, scopeTypes), hadBinding || delete bindings[catchParamName];
                }
            } else recursiveScanScope(path, bindings, scopeTypes);
        }
        function addPattern(patternPath, bindings) {
            var pattern = patternPath.value;
            namedTypes.Pattern.assert(pattern), namedTypes.Identifier.check(pattern) ? hasOwn.call(bindings, pattern.name) ? bindings[pattern.name].push(patternPath) : bindings[pattern.name] = [ patternPath ] : namedTypes.ObjectPattern && namedTypes.ObjectPattern.check(pattern) ? patternPath.get("properties").each(function(propertyPath) {
                var property = propertyPath.value;
                namedTypes.Pattern.check(property) ? addPattern(propertyPath, bindings) : namedTypes.Property.check(property) ? addPattern(propertyPath.get("value"), bindings) : namedTypes.SpreadProperty && namedTypes.SpreadProperty.check(property) && addPattern(propertyPath.get("argument"), bindings);
            }) : namedTypes.ArrayPattern && namedTypes.ArrayPattern.check(pattern) ? patternPath.get("elements").each(function(elementPath) {
                var element = elementPath.value;
                namedTypes.Pattern.check(element) ? addPattern(elementPath, bindings) : namedTypes.SpreadElement && namedTypes.SpreadElement.check(element) && addPattern(elementPath.get("argument"), bindings);
            }) : namedTypes.PropertyPattern && namedTypes.PropertyPattern.check(pattern) ? addPattern(patternPath.get("pattern"), bindings) : (namedTypes.SpreadElementPattern && namedTypes.SpreadElementPattern.check(pattern) || namedTypes.SpreadPropertyPattern && namedTypes.SpreadPropertyPattern.check(pattern)) && addPattern(patternPath.get("argument"), bindings);
        }
        function addTypePattern(patternPath, types) {
            var pattern = patternPath.value;
            namedTypes.Pattern.assert(pattern), namedTypes.Identifier.check(pattern) && (hasOwn.call(types, pattern.name) ? types[pattern.name].push(patternPath) : types[pattern.name] = [ patternPath ]);
        }
        var types = fork.use(__webpack_require__(/*! ./types */ 1)), Type = types.Type, namedTypes = types.namedTypes, Node = namedTypes.Node, Expression = namedTypes.Expression, isArray = types.builtInTypes.array, b = types.builders, scopeTypes = [ namedTypes.Program, namedTypes.Function, namedTypes.CatchClause ], ScopeType = Type.or.apply(Type, scopeTypes);
        Scope.isEstablishedBy = function(node) {
            return ScopeType.check(node);
        };
        var Sp = Scope.prototype;
        return Sp.didScan = !1, Sp.declares = function(name) {
            return this.scan(), hasOwn.call(this.bindings, name);
        }, Sp.declaresType = function(name) {
            return this.scan(), hasOwn.call(this.types, name);
        }, Sp.declareTemporary = function(prefix) {
            if (prefix) {
                if (!/^[a-z$_]/i.test(prefix)) throw new Error("");
            } else prefix = "t$";
            prefix += this.depth.toString(36) + "$", this.scan();
            for (var index = 0; this.declares(prefix + index); ) ++index;
            var name = prefix + index;
            return this.bindings[name] = types.builders.identifier(name);
        }, Sp.injectTemporary = function(identifier, init) {
            identifier || (identifier = this.declareTemporary());
            var bodyPath = this.path.get("body");
            return namedTypes.BlockStatement.check(bodyPath.value) && (bodyPath = bodyPath.get("body")), 
            bodyPath.unshift(b.variableDeclaration("var", [ b.variableDeclarator(identifier, init || null) ])), 
            identifier;
        }, Sp.scan = function(force) {
            if (force || !this.didScan) {
                for (var name in this.bindings) delete this.bindings[name];
                scanScope(this.path, this.bindings, this.types), this.didScan = !0;
            }
        }, Sp.getBindings = function() {
            return this.scan(), this.bindings;
        }, Sp.getTypes = function() {
            return this.scan(), this.types;
        }, Sp.lookup = function(name) {
            for (var scope = this; scope && !scope.declares(name); scope = scope.parent) ;
            return scope;
        }, Sp.lookupType = function(name) {
            for (var scope = this; scope && !scope.declaresType(name); scope = scope.parent) ;
            return scope;
        }, Sp.getGlobalScope = function() {
            for (var scope = this; !scope.isGlobal; ) scope = scope.parent;
            return scope;
        }, Scope;
    };
}, /*!**************************************!*\
  !*** ./~/recast/~/ast-types/main.js ***!
  \**************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = __webpack_require__(/*! ./fork */ 56)([ __webpack_require__(/*! ./def/core */ 12), __webpack_require__(/*! ./def/es6 */ 27), __webpack_require__(/*! ./def/es7 */ 9), __webpack_require__(/*! ./def/mozilla */ 55), __webpack_require__(/*! ./def/e4x */ 52), __webpack_require__(/*! ./def/jsx */ 54), __webpack_require__(/*! ./def/flow */ 28), __webpack_require__(/*! ./def/esprima */ 53), __webpack_require__(/*! ./def/babel */ 26), __webpack_require__(/*! ./def/babel6 */ 51) ]);
}, /*!************************************!*\
  !*** ./~/source-map/lib/base64.js ***!
  \************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    var intToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    exports.encode = function(number) {
        if (0 <= number && number < intToCharMap.length) return intToCharMap[number];
        throw new TypeError("Must be between 0 and 63: " + number);
    }, exports.decode = function(charCode) {
        var bigA = 65, bigZ = 90, littleA = 97, littleZ = 122, zero = 48, nine = 57, plus = 43, slash = 47, littleOffset = 26, numberOffset = 52;
        return bigA <= charCode && charCode <= bigZ ? charCode - bigA : littleA <= charCode && charCode <= littleZ ? charCode - littleA + littleOffset : zero <= charCode && charCode <= nine ? charCode - zero + numberOffset : charCode == plus ? 62 : charCode == slash ? 63 : -1;
    };
}, /*!*******************************************!*\
  !*** ./~/source-map/lib/binary-search.js ***!
  \*******************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
        var mid = Math.floor((aHigh - aLow) / 2) + aLow, cmp = aCompare(aNeedle, aHaystack[mid], !0);
        return 0 === cmp ? mid : cmp > 0 ? aHigh - mid > 1 ? recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias) : aBias == exports.LEAST_UPPER_BOUND ? aHigh < aHaystack.length ? aHigh : -1 : mid : mid - aLow > 1 ? recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias) : aBias == exports.LEAST_UPPER_BOUND ? mid : aLow < 0 ? -1 : aLow;
    }
    exports.GREATEST_LOWER_BOUND = 1, exports.LEAST_UPPER_BOUND = 2, exports.search = function(aNeedle, aHaystack, aCompare, aBias) {
        if (0 === aHaystack.length) return -1;
        var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare, aBias || exports.GREATEST_LOWER_BOUND);
        if (index < 0) return -1;
        for (;index - 1 >= 0 && 0 === aCompare(aHaystack[index], aHaystack[index - 1], !0); ) --index;
        return index;
    };
}, /*!******************************************!*\
  !*** ./~/source-map/lib/mapping-list.js ***!
  \******************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function generatedPositionAfter(mappingA, mappingB) {
        var lineA = mappingA.generatedLine, lineB = mappingB.generatedLine, columnA = mappingA.generatedColumn, columnB = mappingB.generatedColumn;
        return lineB > lineA || lineB == lineA && columnB >= columnA || util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
    }
    function MappingList() {
        this._array = [], this._sorted = !0, this._last = {
            generatedLine: -1,
            generatedColumn: 0
        };
    }
    var util = __webpack_require__(/*! ./util */ 10);
    MappingList.prototype.unsortedForEach = function(aCallback, aThisArg) {
        this._array.forEach(aCallback, aThisArg);
    }, MappingList.prototype.add = function(aMapping) {
        generatedPositionAfter(this._last, aMapping) ? (this._last = aMapping, this._array.push(aMapping)) : (this._sorted = !1, 
        this._array.push(aMapping));
    }, MappingList.prototype.toArray = function() {
        return this._sorted || (this._array.sort(util.compareByGeneratedPositionsInflated), 
        this._sorted = !0), this._array;
    }, exports.MappingList = MappingList;
}, /*!****************************************!*\
  !*** ./~/source-map/lib/quick-sort.js ***!
  \****************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function swap(ary, x, y) {
        var temp = ary[x];
        ary[x] = ary[y], ary[y] = temp;
    }
    function randomIntInRange(low, high) {
        return Math.round(low + Math.random() * (high - low));
    }
    function doQuickSort(ary, comparator, p, r) {
        if (p < r) {
            var pivotIndex = randomIntInRange(p, r), i = p - 1;
            swap(ary, pivotIndex, r);
            for (var pivot = ary[r], j = p; j < r; j++) comparator(ary[j], pivot) <= 0 && (i += 1, 
            swap(ary, i, j));
            swap(ary, i + 1, j);
            var q = i + 1;
            doQuickSort(ary, comparator, p, q - 1), doQuickSort(ary, comparator, q + 1, r);
        }
    }
    exports.quickSort = function(ary, comparator) {
        doQuickSort(ary, comparator, 0, ary.length - 1);
    };
}, /*!*************************************************!*\
  !*** ./~/source-map/lib/source-map-consumer.js ***!
  \*************************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function SourceMapConsumer(aSourceMap) {
        var sourceMap = aSourceMap;
        return "string" == typeof aSourceMap && (sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ""))), 
        null != sourceMap.sections ? new IndexedSourceMapConsumer(sourceMap) : new BasicSourceMapConsumer(sourceMap);
    }
    function BasicSourceMapConsumer(aSourceMap) {
        var sourceMap = aSourceMap;
        "string" == typeof aSourceMap && (sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, "")));
        var version = util.getArg(sourceMap, "version"), sources = util.getArg(sourceMap, "sources"), names = util.getArg(sourceMap, "names", []), sourceRoot = util.getArg(sourceMap, "sourceRoot", null), sourcesContent = util.getArg(sourceMap, "sourcesContent", null), mappings = util.getArg(sourceMap, "mappings"), file = util.getArg(sourceMap, "file", null);
        if (version != this._version) throw new Error("Unsupported version: " + version);
        sources = sources.map(String).map(util.normalize).map(function(source) {
            return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source) ? util.relative(sourceRoot, source) : source;
        }), this._names = ArraySet.fromArray(names.map(String), !0), this._sources = ArraySet.fromArray(sources, !0), 
        this.sourceRoot = sourceRoot, this.sourcesContent = sourcesContent, this._mappings = mappings, 
        this.file = file;
    }
    function Mapping() {
        this.generatedLine = 0, this.generatedColumn = 0, this.source = null, this.originalLine = null, 
        this.originalColumn = null, this.name = null;
    }
    function IndexedSourceMapConsumer(aSourceMap) {
        var sourceMap = aSourceMap;
        "string" == typeof aSourceMap && (sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, "")));
        var version = util.getArg(sourceMap, "version"), sections = util.getArg(sourceMap, "sections");
        if (version != this._version) throw new Error("Unsupported version: " + version);
        this._sources = new ArraySet(), this._names = new ArraySet();
        var lastOffset = {
            line: -1,
            column: 0
        };
        this._sections = sections.map(function(s) {
            if (s.url) throw new Error("Support for url field in sections not implemented.");
            var offset = util.getArg(s, "offset"), offsetLine = util.getArg(offset, "line"), offsetColumn = util.getArg(offset, "column");
            if (offsetLine < lastOffset.line || offsetLine === lastOffset.line && offsetColumn < lastOffset.column) throw new Error("Section offsets must be ordered and non-overlapping.");
            return lastOffset = offset, {
                generatedOffset: {
                    generatedLine: offsetLine + 1,
                    generatedColumn: offsetColumn + 1
                },
                consumer: new SourceMapConsumer(util.getArg(s, "map"))
            };
        });
    }
    var util = __webpack_require__(/*! ./util */ 10), binarySearch = __webpack_require__(/*! ./binary-search */ 62), ArraySet = __webpack_require__(/*! ./array-set */ 30).ArraySet, base64VLQ = __webpack_require__(/*! ./base64-vlq */ 31), quickSort = __webpack_require__(/*! ./quick-sort */ 64).quickSort;
    SourceMapConsumer.fromSourceMap = function(aSourceMap) {
        return BasicSourceMapConsumer.fromSourceMap(aSourceMap);
    }, SourceMapConsumer.prototype._version = 3, SourceMapConsumer.prototype.__generatedMappings = null, 
    Object.defineProperty(SourceMapConsumer.prototype, "_generatedMappings", {
        get: function() {
            return this.__generatedMappings || this._parseMappings(this._mappings, this.sourceRoot), 
            this.__generatedMappings;
        }
    }), SourceMapConsumer.prototype.__originalMappings = null, Object.defineProperty(SourceMapConsumer.prototype, "_originalMappings", {
        get: function() {
            return this.__originalMappings || this._parseMappings(this._mappings, this.sourceRoot), 
            this.__originalMappings;
        }
    }), SourceMapConsumer.prototype._charIsMappingSeparator = function(aStr, index) {
        var c = aStr.charAt(index);
        return ";" === c || "," === c;
    }, SourceMapConsumer.prototype._parseMappings = function(aStr, aSourceRoot) {
        throw new Error("Subclasses must implement _parseMappings");
    }, SourceMapConsumer.GENERATED_ORDER = 1, SourceMapConsumer.ORIGINAL_ORDER = 2, 
    SourceMapConsumer.GREATEST_LOWER_BOUND = 1, SourceMapConsumer.LEAST_UPPER_BOUND = 2, 
    SourceMapConsumer.prototype.eachMapping = function(aCallback, aContext, aOrder) {
        var mappings, context = aContext || null, order = aOrder || SourceMapConsumer.GENERATED_ORDER;
        switch (order) {
          case SourceMapConsumer.GENERATED_ORDER:
            mappings = this._generatedMappings;
            break;

          case SourceMapConsumer.ORIGINAL_ORDER:
            mappings = this._originalMappings;
            break;

          default:
            throw new Error("Unknown order of iteration.");
        }
        var sourceRoot = this.sourceRoot;
        mappings.map(function(mapping) {
            var source = null === mapping.source ? null : this._sources.at(mapping.source);
            return null != source && null != sourceRoot && (source = util.join(sourceRoot, source)), 
            {
                source: source,
                generatedLine: mapping.generatedLine,
                generatedColumn: mapping.generatedColumn,
                originalLine: mapping.originalLine,
                originalColumn: mapping.originalColumn,
                name: null === mapping.name ? null : this._names.at(mapping.name)
            };
        }, this).forEach(aCallback, context);
    }, SourceMapConsumer.prototype.allGeneratedPositionsFor = function(aArgs) {
        var line = util.getArg(aArgs, "line"), needle = {
            source: util.getArg(aArgs, "source"),
            originalLine: line,
            originalColumn: util.getArg(aArgs, "column", 0)
        };
        if (null != this.sourceRoot && (needle.source = util.relative(this.sourceRoot, needle.source)), 
        !this._sources.has(needle.source)) return [];
        needle.source = this._sources.indexOf(needle.source);
        var mappings = [], index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, binarySearch.LEAST_UPPER_BOUND);
        if (index >= 0) {
            var mapping = this._originalMappings[index];
            if (void 0 === aArgs.column) for (var originalLine = mapping.originalLine; mapping && mapping.originalLine === originalLine; ) mappings.push({
                line: util.getArg(mapping, "generatedLine", null),
                column: util.getArg(mapping, "generatedColumn", null),
                lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
            }), mapping = this._originalMappings[++index]; else for (var originalColumn = mapping.originalColumn; mapping && mapping.originalLine === line && mapping.originalColumn == originalColumn; ) mappings.push({
                line: util.getArg(mapping, "generatedLine", null),
                column: util.getArg(mapping, "generatedColumn", null),
                lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
            }), mapping = this._originalMappings[++index];
        }
        return mappings;
    }, exports.SourceMapConsumer = SourceMapConsumer, BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype), 
    BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer, BasicSourceMapConsumer.fromSourceMap = function(aSourceMap) {
        var smc = Object.create(BasicSourceMapConsumer.prototype), names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), !0), sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), !0);
        smc.sourceRoot = aSourceMap._sourceRoot, smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(), smc.sourceRoot), 
        smc.file = aSourceMap._file;
        for (var generatedMappings = aSourceMap._mappings.toArray().slice(), destGeneratedMappings = smc.__generatedMappings = [], destOriginalMappings = smc.__originalMappings = [], i = 0, length = generatedMappings.length; i < length; i++) {
            var srcMapping = generatedMappings[i], destMapping = new Mapping();
            destMapping.generatedLine = srcMapping.generatedLine, destMapping.generatedColumn = srcMapping.generatedColumn, 
            srcMapping.source && (destMapping.source = sources.indexOf(srcMapping.source), destMapping.originalLine = srcMapping.originalLine, 
            destMapping.originalColumn = srcMapping.originalColumn, srcMapping.name && (destMapping.name = names.indexOf(srcMapping.name)), 
            destOriginalMappings.push(destMapping)), destGeneratedMappings.push(destMapping);
        }
        return quickSort(smc.__originalMappings, util.compareByOriginalPositions), smc;
    }, BasicSourceMapConsumer.prototype._version = 3, Object.defineProperty(BasicSourceMapConsumer.prototype, "sources", {
        get: function() {
            return this._sources.toArray().map(function(s) {
                return null != this.sourceRoot ? util.join(this.sourceRoot, s) : s;
            }, this);
        }
    }), BasicSourceMapConsumer.prototype._parseMappings = function(aStr, aSourceRoot) {
        for (var mapping, str, segment, end, value, generatedLine = 1, previousGeneratedColumn = 0, previousOriginalLine = 0, previousOriginalColumn = 0, previousSource = 0, previousName = 0, length = aStr.length, index = 0, cachedSegments = {}, temp = {}, originalMappings = [], generatedMappings = []; index < length; ) if (";" === aStr.charAt(index)) generatedLine++, 
        index++, previousGeneratedColumn = 0; else if ("," === aStr.charAt(index)) index++; else {
            for (mapping = new Mapping(), mapping.generatedLine = generatedLine, end = index; end < length && !this._charIsMappingSeparator(aStr, end); end++) ;
            if (str = aStr.slice(index, end), segment = cachedSegments[str]) index += str.length; else {
                for (segment = []; index < end; ) base64VLQ.decode(aStr, index, temp), value = temp.value, 
                index = temp.rest, segment.push(value);
                if (2 === segment.length) throw new Error("Found a source, but no line and column");
                if (3 === segment.length) throw new Error("Found a source and line, but no column");
                cachedSegments[str] = segment;
            }
            mapping.generatedColumn = previousGeneratedColumn + segment[0], previousGeneratedColumn = mapping.generatedColumn, 
            segment.length > 1 && (mapping.source = previousSource + segment[1], previousSource += segment[1], 
            mapping.originalLine = previousOriginalLine + segment[2], previousOriginalLine = mapping.originalLine, 
            mapping.originalLine += 1, mapping.originalColumn = previousOriginalColumn + segment[3], 
            previousOriginalColumn = mapping.originalColumn, segment.length > 4 && (mapping.name = previousName + segment[4], 
            previousName += segment[4])), generatedMappings.push(mapping), "number" == typeof mapping.originalLine && originalMappings.push(mapping);
        }
        quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated), this.__generatedMappings = generatedMappings, 
        quickSort(originalMappings, util.compareByOriginalPositions), this.__originalMappings = originalMappings;
    }, BasicSourceMapConsumer.prototype._findMapping = function(aNeedle, aMappings, aLineName, aColumnName, aComparator, aBias) {
        if (aNeedle[aLineName] <= 0) throw new TypeError("Line must be greater than or equal to 1, got " + aNeedle[aLineName]);
        if (aNeedle[aColumnName] < 0) throw new TypeError("Column must be greater than or equal to 0, got " + aNeedle[aColumnName]);
        return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
    }, BasicSourceMapConsumer.prototype.computeColumnSpans = function() {
        for (var index = 0; index < this._generatedMappings.length; ++index) {
            var mapping = this._generatedMappings[index];
            if (index + 1 < this._generatedMappings.length) {
                var nextMapping = this._generatedMappings[index + 1];
                if (mapping.generatedLine === nextMapping.generatedLine) {
                    mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
                    continue;
                }
            }
            mapping.lastGeneratedColumn = 1 / 0;
        }
    }, BasicSourceMapConsumer.prototype.originalPositionFor = function(aArgs) {
        var needle = {
            generatedLine: util.getArg(aArgs, "line"),
            generatedColumn: util.getArg(aArgs, "column")
        }, index = this._findMapping(needle, this._generatedMappings, "generatedLine", "generatedColumn", util.compareByGeneratedPositionsDeflated, util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND));
        if (index >= 0) {
            var mapping = this._generatedMappings[index];
            if (mapping.generatedLine === needle.generatedLine) {
                var source = util.getArg(mapping, "source", null);
                null !== source && (source = this._sources.at(source), null != this.sourceRoot && (source = util.join(this.sourceRoot, source)));
                var name = util.getArg(mapping, "name", null);
                return null !== name && (name = this._names.at(name)), {
                    source: source,
                    line: util.getArg(mapping, "originalLine", null),
                    column: util.getArg(mapping, "originalColumn", null),
                    name: name
                };
            }
        }
        return {
            source: null,
            line: null,
            column: null,
            name: null
        };
    }, BasicSourceMapConsumer.prototype.hasContentsOfAllSources = function() {
        return !!this.sourcesContent && (this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function(sc) {
            return null == sc;
        }));
    }, BasicSourceMapConsumer.prototype.sourceContentFor = function(aSource, nullOnMissing) {
        if (!this.sourcesContent) return null;
        if (null != this.sourceRoot && (aSource = util.relative(this.sourceRoot, aSource)), 
        this._sources.has(aSource)) return this.sourcesContent[this._sources.indexOf(aSource)];
        var url;
        if (null != this.sourceRoot && (url = util.urlParse(this.sourceRoot))) {
            var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
            if ("file" == url.scheme && this._sources.has(fileUriAbsPath)) return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
            if ((!url.path || "/" == url.path) && this._sources.has("/" + aSource)) return this.sourcesContent[this._sources.indexOf("/" + aSource)];
        }
        if (nullOnMissing) return null;
        throw new Error('"' + aSource + '" is not in the SourceMap.');
    }, BasicSourceMapConsumer.prototype.generatedPositionFor = function(aArgs) {
        var source = util.getArg(aArgs, "source");
        if (null != this.sourceRoot && (source = util.relative(this.sourceRoot, source)), 
        !this._sources.has(source)) return {
            line: null,
            column: null,
            lastColumn: null
        };
        source = this._sources.indexOf(source);
        var needle = {
            source: source,
            originalLine: util.getArg(aArgs, "line"),
            originalColumn: util.getArg(aArgs, "column")
        }, index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND));
        if (index >= 0) {
            var mapping = this._originalMappings[index];
            if (mapping.source === needle.source) return {
                line: util.getArg(mapping, "generatedLine", null),
                column: util.getArg(mapping, "generatedColumn", null),
                lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
            };
        }
        return {
            line: null,
            column: null,
            lastColumn: null
        };
    }, exports.BasicSourceMapConsumer = BasicSourceMapConsumer, IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype), 
    IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer, IndexedSourceMapConsumer.prototype._version = 3, 
    Object.defineProperty(IndexedSourceMapConsumer.prototype, "sources", {
        get: function() {
            for (var sources = [], i = 0; i < this._sections.length; i++) for (var j = 0; j < this._sections[i].consumer.sources.length; j++) sources.push(this._sections[i].consumer.sources[j]);
            return sources;
        }
    }), IndexedSourceMapConsumer.prototype.originalPositionFor = function(aArgs) {
        var needle = {
            generatedLine: util.getArg(aArgs, "line"),
            generatedColumn: util.getArg(aArgs, "column")
        }, sectionIndex = binarySearch.search(needle, this._sections, function(needle, section) {
            var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
            return cmp ? cmp : needle.generatedColumn - section.generatedOffset.generatedColumn;
        }), section = this._sections[sectionIndex];
        return section ? section.consumer.originalPositionFor({
            line: needle.generatedLine - (section.generatedOffset.generatedLine - 1),
            column: needle.generatedColumn - (section.generatedOffset.generatedLine === needle.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
            bias: aArgs.bias
        }) : {
            source: null,
            line: null,
            column: null,
            name: null
        };
    }, IndexedSourceMapConsumer.prototype.hasContentsOfAllSources = function() {
        return this._sections.every(function(s) {
            return s.consumer.hasContentsOfAllSources();
        });
    }, IndexedSourceMapConsumer.prototype.sourceContentFor = function(aSource, nullOnMissing) {
        for (var i = 0; i < this._sections.length; i++) {
            var section = this._sections[i], content = section.consumer.sourceContentFor(aSource, !0);
            if (content) return content;
        }
        if (nullOnMissing) return null;
        throw new Error('"' + aSource + '" is not in the SourceMap.');
    }, IndexedSourceMapConsumer.prototype.generatedPositionFor = function(aArgs) {
        for (var i = 0; i < this._sections.length; i++) {
            var section = this._sections[i];
            if (section.consumer.sources.indexOf(util.getArg(aArgs, "source")) !== -1) {
                var generatedPosition = section.consumer.generatedPositionFor(aArgs);
                if (generatedPosition) {
                    var ret = {
                        line: generatedPosition.line + (section.generatedOffset.generatedLine - 1),
                        column: generatedPosition.column + (section.generatedOffset.generatedLine === generatedPosition.line ? section.generatedOffset.generatedColumn - 1 : 0)
                    };
                    return ret;
                }
            }
        }
        return {
            line: null,
            column: null
        };
    }, IndexedSourceMapConsumer.prototype._parseMappings = function(aStr, aSourceRoot) {
        this.__generatedMappings = [], this.__originalMappings = [];
        for (var i = 0; i < this._sections.length; i++) for (var section = this._sections[i], sectionMappings = section.consumer._generatedMappings, j = 0; j < sectionMappings.length; j++) {
            var mapping = sectionMappings[j], source = section.consumer._sources.at(mapping.source);
            null !== section.consumer.sourceRoot && (source = util.join(section.consumer.sourceRoot, source)), 
            this._sources.add(source), source = this._sources.indexOf(source);
            var name = section.consumer._names.at(mapping.name);
            this._names.add(name), name = this._names.indexOf(name);
            var adjustedMapping = {
                source: source,
                generatedLine: mapping.generatedLine + (section.generatedOffset.generatedLine - 1),
                generatedColumn: mapping.generatedColumn + (section.generatedOffset.generatedLine === mapping.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
                originalLine: mapping.originalLine,
                originalColumn: mapping.originalColumn,
                name: name
            };
            this.__generatedMappings.push(adjustedMapping), "number" == typeof adjustedMapping.originalLine && this.__originalMappings.push(adjustedMapping);
        }
        quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated), quickSort(this.__originalMappings, util.compareByOriginalPositions);
    }, exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;
}, /*!*****************************************!*\
  !*** ./~/source-map/lib/source-node.js ***!
  \*****************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
        this.children = [], this.sourceContents = {}, this.line = null == aLine ? null : aLine, 
        this.column = null == aColumn ? null : aColumn, this.source = null == aSource ? null : aSource, 
        this.name = null == aName ? null : aName, this[isSourceNode] = !0, null != aChunks && this.add(aChunks);
    }
    var SourceMapGenerator = __webpack_require__(/*! ./source-map-generator */ 32).SourceMapGenerator, util = __webpack_require__(/*! ./util */ 10), REGEX_NEWLINE = /(\r?\n)/, NEWLINE_CODE = 10, isSourceNode = "$$$isSourceNode$$$";
    SourceNode.fromStringWithSourceMap = function(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
        function addMappingWithCode(mapping, code) {
            if (null === mapping || void 0 === mapping.source) node.add(code); else {
                var source = aRelativePath ? util.join(aRelativePath, mapping.source) : mapping.source;
                node.add(new SourceNode(mapping.originalLine, mapping.originalColumn, source, code, mapping.name));
            }
        }
        var node = new SourceNode(), remainingLines = aGeneratedCode.split(REGEX_NEWLINE), shiftNextLine = function() {
            var lineContents = remainingLines.shift(), newLine = remainingLines.shift() || "";
            return lineContents + newLine;
        }, lastGeneratedLine = 1, lastGeneratedColumn = 0, lastMapping = null;
        return aSourceMapConsumer.eachMapping(function(mapping) {
            if (null !== lastMapping) {
                if (!(lastGeneratedLine < mapping.generatedLine)) {
                    var nextLine = remainingLines[0], code = nextLine.substr(0, mapping.generatedColumn - lastGeneratedColumn);
                    return remainingLines[0] = nextLine.substr(mapping.generatedColumn - lastGeneratedColumn), 
                    lastGeneratedColumn = mapping.generatedColumn, addMappingWithCode(lastMapping, code), 
                    void (lastMapping = mapping);
                }
                addMappingWithCode(lastMapping, shiftNextLine()), lastGeneratedLine++, lastGeneratedColumn = 0;
            }
            for (;lastGeneratedLine < mapping.generatedLine; ) node.add(shiftNextLine()), lastGeneratedLine++;
            if (lastGeneratedColumn < mapping.generatedColumn) {
                var nextLine = remainingLines[0];
                node.add(nextLine.substr(0, mapping.generatedColumn)), remainingLines[0] = nextLine.substr(mapping.generatedColumn), 
                lastGeneratedColumn = mapping.generatedColumn;
            }
            lastMapping = mapping;
        }, this), remainingLines.length > 0 && (lastMapping && addMappingWithCode(lastMapping, shiftNextLine()), 
        node.add(remainingLines.join(""))), aSourceMapConsumer.sources.forEach(function(sourceFile) {
            var content = aSourceMapConsumer.sourceContentFor(sourceFile);
            null != content && (null != aRelativePath && (sourceFile = util.join(aRelativePath, sourceFile)), 
            node.setSourceContent(sourceFile, content));
        }), node;
    }, SourceNode.prototype.add = function(aChunk) {
        if (Array.isArray(aChunk)) aChunk.forEach(function(chunk) {
            this.add(chunk);
        }, this); else {
            if (!aChunk[isSourceNode] && "string" != typeof aChunk) throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
            aChunk && this.children.push(aChunk);
        }
        return this;
    }, SourceNode.prototype.prepend = function(aChunk) {
        if (Array.isArray(aChunk)) for (var i = aChunk.length - 1; i >= 0; i--) this.prepend(aChunk[i]); else {
            if (!aChunk[isSourceNode] && "string" != typeof aChunk) throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
            this.children.unshift(aChunk);
        }
        return this;
    }, SourceNode.prototype.walk = function(aFn) {
        for (var chunk, i = 0, len = this.children.length; i < len; i++) chunk = this.children[i], 
        chunk[isSourceNode] ? chunk.walk(aFn) : "" !== chunk && aFn(chunk, {
            source: this.source,
            line: this.line,
            column: this.column,
            name: this.name
        });
    }, SourceNode.prototype.join = function(aSep) {
        var newChildren, i, len = this.children.length;
        if (len > 0) {
            for (newChildren = [], i = 0; i < len - 1; i++) newChildren.push(this.children[i]), 
            newChildren.push(aSep);
            newChildren.push(this.children[i]), this.children = newChildren;
        }
        return this;
    }, SourceNode.prototype.replaceRight = function(aPattern, aReplacement) {
        var lastChild = this.children[this.children.length - 1];
        return lastChild[isSourceNode] ? lastChild.replaceRight(aPattern, aReplacement) : "string" == typeof lastChild ? this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement) : this.children.push("".replace(aPattern, aReplacement)), 
        this;
    }, SourceNode.prototype.setSourceContent = function(aSourceFile, aSourceContent) {
        this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
    }, SourceNode.prototype.walkSourceContents = function(aFn) {
        for (var i = 0, len = this.children.length; i < len; i++) this.children[i][isSourceNode] && this.children[i].walkSourceContents(aFn);
        for (var sources = Object.keys(this.sourceContents), i = 0, len = sources.length; i < len; i++) aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }, SourceNode.prototype.toString = function() {
        var str = "";
        return this.walk(function(chunk) {
            str += chunk;
        }), str;
    }, SourceNode.prototype.toStringWithSourceMap = function(aArgs) {
        var generated = {
            code: "",
            line: 1,
            column: 0
        }, map = new SourceMapGenerator(aArgs), sourceMappingActive = !1, lastOriginalSource = null, lastOriginalLine = null, lastOriginalColumn = null, lastOriginalName = null;
        return this.walk(function(chunk, original) {
            generated.code += chunk, null !== original.source && null !== original.line && null !== original.column ? (lastOriginalSource === original.source && lastOriginalLine === original.line && lastOriginalColumn === original.column && lastOriginalName === original.name || map.addMapping({
                source: original.source,
                original: {
                    line: original.line,
                    column: original.column
                },
                generated: {
                    line: generated.line,
                    column: generated.column
                },
                name: original.name
            }), lastOriginalSource = original.source, lastOriginalLine = original.line, lastOriginalColumn = original.column, 
            lastOriginalName = original.name, sourceMappingActive = !0) : sourceMappingActive && (map.addMapping({
                generated: {
                    line: generated.line,
                    column: generated.column
                }
            }), lastOriginalSource = null, sourceMappingActive = !1);
            for (var idx = 0, length = chunk.length; idx < length; idx++) chunk.charCodeAt(idx) === NEWLINE_CODE ? (generated.line++, 
            generated.column = 0, idx + 1 === length ? (lastOriginalSource = null, sourceMappingActive = !1) : sourceMappingActive && map.addMapping({
                source: original.source,
                original: {
                    line: original.line,
                    column: original.column
                },
                generated: {
                    line: generated.line,
                    column: generated.column
                },
                name: original.name
            })) : generated.column++;
        }), this.walkSourceContents(function(sourceFile, sourceContent) {
            map.setSourceContent(sourceFile, sourceContent);
        }), {
            code: generated.code,
            map: map
        };
    }, exports.SourceNode = SourceNode;
}, /*!*******************************************!*\
  !*** ./~/util/support/isBufferBrowser.js ***!
  \*******************************************/
function(module, exports, __webpack_require__) {
    "use strict";
    var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    module.exports = function(arg) {
        return arg && "object" === ("undefined" == typeof arg ? "undefined" : _typeof(arg)) && "function" == typeof arg.copy && "function" == typeof arg.fill && "function" == typeof arg.readUInt8;
    };
}, /*!************************!*\
  !*** ./~/util/util.js ***!
  \************************/
function(module, exports, __webpack_require__) {
    "use strict";
    (function(global, process) {
        function inspect(obj, opts) {
            var ctx = {
                seen: [],
                stylize: stylizeNoColor
            };
            return arguments.length >= 3 && (ctx.depth = arguments[2]), arguments.length >= 4 && (ctx.colors = arguments[3]), 
            isBoolean(opts) ? ctx.showHidden = opts : opts && exports._extend(ctx, opts), isUndefined(ctx.showHidden) && (ctx.showHidden = !1), 
            isUndefined(ctx.depth) && (ctx.depth = 2), isUndefined(ctx.colors) && (ctx.colors = !1), 
            isUndefined(ctx.customInspect) && (ctx.customInspect = !0), ctx.colors && (ctx.stylize = stylizeWithColor), 
            formatValue(ctx, obj, ctx.depth);
        }
        function stylizeWithColor(str, styleType) {
            var style = inspect.styles[styleType];
            return style ? "[" + inspect.colors[style][0] + "m" + str + "[" + inspect.colors[style][1] + "m" : str;
        }
        function stylizeNoColor(str, styleType) {
            return str;
        }
        function arrayToHash(array) {
            var hash = {};
            return array.forEach(function(val, idx) {
                hash[val] = !0;
            }), hash;
        }
        function formatValue(ctx, value, recurseTimes) {
            if (ctx.customInspect && value && isFunction(value.inspect) && value.inspect !== exports.inspect && (!value.constructor || value.constructor.prototype !== value)) {
                var ret = value.inspect(recurseTimes, ctx);
                return isString(ret) || (ret = formatValue(ctx, ret, recurseTimes)), ret;
            }
            var primitive = formatPrimitive(ctx, value);
            if (primitive) return primitive;
            var keys = Object.keys(value), visibleKeys = arrayToHash(keys);
            if (ctx.showHidden && (keys = Object.getOwnPropertyNames(value)), isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) return formatError(value);
            if (0 === keys.length) {
                if (isFunction(value)) {
                    var name = value.name ? ": " + value.name : "";
                    return ctx.stylize("[Function" + name + "]", "special");
                }
                if (isRegExp(value)) return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
                if (isDate(value)) return ctx.stylize(Date.prototype.toString.call(value), "date");
                if (isError(value)) return formatError(value);
            }
            var base = "", array = !1, braces = [ "{", "}" ];
            if (isArray(value) && (array = !0, braces = [ "[", "]" ]), isFunction(value)) {
                var n = value.name ? ": " + value.name : "";
                base = " [Function" + n + "]";
            }
            if (isRegExp(value) && (base = " " + RegExp.prototype.toString.call(value)), isDate(value) && (base = " " + Date.prototype.toUTCString.call(value)), 
            isError(value) && (base = " " + formatError(value)), 0 === keys.length && (!array || 0 == value.length)) return braces[0] + base + braces[1];
            if (recurseTimes < 0) return isRegExp(value) ? ctx.stylize(RegExp.prototype.toString.call(value), "regexp") : ctx.stylize("[Object]", "special");
            ctx.seen.push(value);
            var output;
            return output = array ? formatArray(ctx, value, recurseTimes, visibleKeys, keys) : keys.map(function(key) {
                return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
            }), ctx.seen.pop(), reduceToSingleString(output, base, braces);
        }
        function formatPrimitive(ctx, value) {
            if (isUndefined(value)) return ctx.stylize("undefined", "undefined");
            if (isString(value)) {
                var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                return ctx.stylize(simple, "string");
            }
            return isNumber(value) ? ctx.stylize("" + value, "number") : isBoolean(value) ? ctx.stylize("" + value, "boolean") : isNull(value) ? ctx.stylize("null", "null") : void 0;
        }
        function formatError(value) {
            return "[" + Error.prototype.toString.call(value) + "]";
        }
        function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
            for (var output = [], i = 0, l = value.length; i < l; ++i) hasOwnProperty(value, String(i)) ? output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), !0)) : output.push("");
            return keys.forEach(function(key) {
                key.match(/^\d+$/) || output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, !0));
            }), output;
        }
        function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
            var name, str, desc;
            if (desc = Object.getOwnPropertyDescriptor(value, key) || {
                value: value[key]
            }, desc.get ? str = desc.set ? ctx.stylize("[Getter/Setter]", "special") : ctx.stylize("[Getter]", "special") : desc.set && (str = ctx.stylize("[Setter]", "special")), 
            hasOwnProperty(visibleKeys, key) || (name = "[" + key + "]"), str || (ctx.seen.indexOf(desc.value) < 0 ? (str = isNull(recurseTimes) ? formatValue(ctx, desc.value, null) : formatValue(ctx, desc.value, recurseTimes - 1), 
            str.indexOf("\n") > -1 && (str = array ? str.split("\n").map(function(line) {
                return "  " + line;
            }).join("\n").substr(2) : "\n" + str.split("\n").map(function(line) {
                return "   " + line;
            }).join("\n"))) : str = ctx.stylize("[Circular]", "special")), isUndefined(name)) {
                if (array && key.match(/^\d+$/)) return str;
                name = JSON.stringify("" + key), name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (name = name.substr(1, name.length - 2), 
                name = ctx.stylize(name, "name")) : (name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), 
                name = ctx.stylize(name, "string"));
            }
            return name + ": " + str;
        }
        function reduceToSingleString(output, base, braces) {
            var numLinesEst = 0, length = output.reduce(function(prev, cur) {
                return numLinesEst++, cur.indexOf("\n") >= 0 && numLinesEst++, prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
            }, 0);
            return length > 60 ? braces[0] + ("" === base ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1] : braces[0] + base + " " + output.join(", ") + " " + braces[1];
        }
        function isArray(ar) {
            return Array.isArray(ar);
        }
        function isBoolean(arg) {
            return "boolean" == typeof arg;
        }
        function isNull(arg) {
            return null === arg;
        }
        function isNullOrUndefined(arg) {
            return null == arg;
        }
        function isNumber(arg) {
            return "number" == typeof arg;
        }
        function isString(arg) {
            return "string" == typeof arg;
        }
        function isSymbol(arg) {
            return "symbol" === ("undefined" == typeof arg ? "undefined" : _typeof(arg));
        }
        function isUndefined(arg) {
            return void 0 === arg;
        }
        function isRegExp(re) {
            return isObject(re) && "[object RegExp]" === objectToString(re);
        }
        function isObject(arg) {
            return "object" === ("undefined" == typeof arg ? "undefined" : _typeof(arg)) && null !== arg;
        }
        function isDate(d) {
            return isObject(d) && "[object Date]" === objectToString(d);
        }
        function isError(e) {
            return isObject(e) && ("[object Error]" === objectToString(e) || e instanceof Error);
        }
        function isFunction(arg) {
            return "function" == typeof arg;
        }
        function isPrimitive(arg) {
            return null === arg || "boolean" == typeof arg || "number" == typeof arg || "string" == typeof arg || "symbol" === ("undefined" == typeof arg ? "undefined" : _typeof(arg)) || "undefined" == typeof arg;
        }
        function objectToString(o) {
            return Object.prototype.toString.call(o);
        }
        function pad(n) {
            return n < 10 ? "0" + n.toString(10) : n.toString(10);
        }
        function timestamp() {
            var d = new Date(), time = [ pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds()) ].join(":");
            return [ d.getDate(), months[d.getMonth()], time ].join(" ");
        }
        function hasOwnProperty(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        }
        var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, formatRegExp = /%[sdj%]/g;
        exports.format = function(f) {
            if (!isString(f)) {
                for (var objects = [], i = 0; i < arguments.length; i++) objects.push(inspect(arguments[i]));
                return objects.join(" ");
            }
            for (var i = 1, args = arguments, len = args.length, str = String(f).replace(formatRegExp, function(x) {
                if ("%%" === x) return "%";
                if (i >= len) return x;
                switch (x) {
                  case "%s":
                    return String(args[i++]);

                  case "%d":
                    return Number(args[i++]);

                  case "%j":
                    try {
                        return JSON.stringify(args[i++]);
                    } catch (_) {
                        return "[Circular]";
                    }

                  default:
                    return x;
                }
            }), x = args[i]; i < len; x = args[++i]) str += isNull(x) || !isObject(x) ? " " + x : " " + inspect(x);
            return str;
        }, exports.deprecate = function(fn, msg) {
            function deprecated() {
                if (!warned) {
                    if (process.throwDeprecation) throw new Error(msg);
                    process.traceDeprecation ? console.trace(msg) : console.error(msg), warned = !0;
                }
                return fn.apply(this, arguments);
            }
            if (isUndefined(global.process)) return function() {
                return exports.deprecate(fn, msg).apply(this, arguments);
            };
            if (process.noDeprecation === !0) return fn;
            var warned = !1;
            return deprecated;
        };
        var debugEnviron, debugs = {};
        exports.debuglog = function(set) {
            if (isUndefined(debugEnviron) && (debugEnviron = process.env.NODE_DEBUG || ""), 
            set = set.toUpperCase(), !debugs[set]) if (new RegExp("\\b" + set + "\\b", "i").test(debugEnviron)) {
                var pid = process.pid;
                debugs[set] = function() {
                    var msg = exports.format.apply(exports, arguments);
                    console.error("%s %d: %s", set, pid, msg);
                };
            } else debugs[set] = function() {};
            return debugs[set];
        }, exports.inspect = inspect, inspect.colors = {
            bold: [ 1, 22 ],
            italic: [ 3, 23 ],
            underline: [ 4, 24 ],
            inverse: [ 7, 27 ],
            white: [ 37, 39 ],
            grey: [ 90, 39 ],
            black: [ 30, 39 ],
            blue: [ 34, 39 ],
            cyan: [ 36, 39 ],
            green: [ 32, 39 ],
            magenta: [ 35, 39 ],
            red: [ 31, 39 ],
            yellow: [ 33, 39 ]
        }, inspect.styles = {
            special: "cyan",
            number: "yellow",
            boolean: "yellow",
            undefined: "grey",
            null: "bold",
            string: "green",
            date: "magenta",
            regexp: "red"
        }, exports.isArray = isArray, exports.isBoolean = isBoolean, exports.isNull = isNull, 
        exports.isNullOrUndefined = isNullOrUndefined, exports.isNumber = isNumber, exports.isString = isString, 
        exports.isSymbol = isSymbol, exports.isUndefined = isUndefined, exports.isRegExp = isRegExp, 
        exports.isObject = isObject, exports.isDate = isDate, exports.isError = isError, 
        exports.isFunction = isFunction, exports.isPrimitive = isPrimitive, exports.isBuffer = __webpack_require__(/*! ./support/isBuffer */ 67);
        var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        exports.log = function() {
            console.log("%s - %s", timestamp(), exports.format.apply(exports, arguments));
        }, exports.inherits = __webpack_require__(/*! inherits */ 46), exports._extend = function(origin, add) {
            if (!add || !isObject(add)) return origin;
            for (var keys = Object.keys(add), i = keys.length; i--; ) origin[keys[i]] = add[keys[i]];
            return origin;
        };
    }).call(exports, __webpack_require__(/*! ./../webpack/buildin/global.js */ 33), __webpack_require__(/*! ./../process/browser.js */ 22));
}, /*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(module) {
        return module.webpackPolyfill || (module.deprecate = function() {}, module.paths = [], 
        module.children || (module.children = []), Object.defineProperty(module, "loaded", {
            enumerable: !0,
            configurable: !1,
            get: function() {
                return module.l;
            }
        }), Object.defineProperty(module, "id", {
            enumerable: !0,
            configurable: !1,
            get: function() {
                return module.i;
            }
        }), module.webpackPolyfill = 1), module;
    };
}, /*!********************!*\
  !*** fs (ignored) ***!
  \********************/
function(module, exports) {}, /*!******************!*\
  !*** ./index.js ***!
  \******************/
function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = {
        ast: __webpack_require__(/*! ast-types */ 34),
        recast: __webpack_require__(/*! recast */ 35)
    };
} ]);