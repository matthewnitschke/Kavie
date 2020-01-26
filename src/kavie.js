/*!
    Kavie - knockout observable validator
    Author: Matthew Nitschke
    License: MIT (http://www.opensource.org/licenses/mit-license.php)
    Version: {{versionNumber}}
*/

(function (factory) {
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // CommonJS/Nodejs
        factory(require("knockout"), exports);
    } else if (typeof define === "function" && define["amd"]) {
        // AMD anonymous module with hard-coded dependency on "knockout"
        define(["knockout", "exports"], factory);
    } else {
        // <script> tag: use the global `ko` object, attaching a `mapping` property
        factory(ko, Kavie = {});
    }
}(function (ko, exports) {

    if (typeof (ko) === 'undefined') {
        throw new Error('Please load knockout before Kavie');
    }

    // publicly changeable configuration settings for kavie
    exports.settings = {
        subscriptionValidation: true
    }

    exports.sections = {};

    exports.reset = function () {
        exports.sections = {};
    }

    // turn validation on
    exports.isValid = function (properties) {
        // properties can be:
        // self: an object with kavie observables
        // [self, a, foo]: an array of objects with kavie observables
        // "sectionA": a string of the name of a kavie section
        // ["sectionA", "sectionB"]: an array of section names
        // ["sectionA", self, foo, "sectionB"]: an array of a mix of the previous

        var isValid = true;

        var kavieObservables = compileObservables(properties);

        for (var i = 0; i < kavieObservables.length; i++) {
            kavieObservables[i].startValidation();

            if (isValid) {
                if (kavieObservables[i].hasError()) {
                    isValid = false;
                }
            }
        }

        return isValid;
    }

    exports.isValidAsync = function (vm) {
        var kavieObservables = compileObservables(vm);
        var promises = [];

        for (var i = 0; i < kavieObservables.length; i++) {
            var promise = kavieObservables[i].startAsyncValidation();

            if (promise) { // if promise is undefined, then there are no async rules on that observable
                promises = promises.concat(promise);
            }
        }

        var synchronousMethodsValid = exports.isValid(vm);

        return Promise.all(promises).then(function (results) {
            // if every element in results is true return true, if any false, return false
            return results.every(isTrue) && synchronousMethodsValid;
        });
    }

    // turns off validation
    exports.deactivate = function (vm) {
        var kavieObservables = compileObservables(vm);

        for (var i = 0; i < kavieObservables.length; i++) {
            kavieObservables[i].stopValidation();
        }
    }

    exports.addVariableValidation = function (sectionName, shouldValidate) {
        var section = getSection(sectionName);
        section.validate = shouldValidate;

        if (ko.isObservable(shouldValidate)) {
            // if the variable validation is set to false, we want to deactivate the validation, as this is the functionality that would be expected
            shouldValidate.subscribe(function (newValue) {
                if (!newValue) {
                    ko.utils.arrayMap(section.observables, function (observable) {
                        // we cant use the ns.deactivate method because the validation is set to false and compileObservables() will not return the observables we want
                        // thus we need to stop the validation on the observables directly
                        observable.stopValidation();
                    });
                }
            })
        }
    }

    exports.addSectionChild = function (parentSectionName, childSectionName) {
        var parentSection = getSection(parentSectionName);
        var childSection = getSection(childSectionName);

        parentSection.children[childSectionName] = childSection;
    }

    exports.addSectionValidators = function (sectionName, sectionRules) {
        var section = getSection(sectionName);

        // merge section.validators and sectionValidators objects
        section.rules = ko.utils.extend(section.rules, sectionRules);
    }

    var compileObservables = function (data) {
        // returns an array of all kavieObservables found in the data passed in
        if (!data) {
            throw "Data must not be null";
        }

        var kavieObservables = [];

        if (Array.isArray(data)) {
            // if data is an array, recursively compile each array item
            for (var i = 0; i < data.length; i++) {
                kavieObservables = kavieObservables.concat(compileObservables(data[i]));
            }

        } else if (typeof data === "string") {
            // if data is a string, data is a sectionName
            var section = exports.sections[data];

            if (section) {
                if (ko.unwrap(section.validate)) {
                    var childrenKeys = Object.keys(section.children);

                    for (var i = 0; i < childrenKeys.length; i++) {
                        // recursively compile all children's observables
                        kavieObservables = kavieObservables.concat(compileObservables(childrenKeys[i]));
                    }

                    kavieObservables = kavieObservables.concat(section.observables);

                    // if section contains its own validation rules
                    if (Object.keys(section.rules).length > 0) {
                        kavieObservables = kavieObservables.map(function (observable) {
                            // add section rules to each observable
                            observable.rules = ko.utils.extend(observable.rules, section.rules);
                            return observable;
                        });
                    }
                }
            } else {
                console.warn("Kavie - No section found with the name: " + data);
            }
        } else {
            // data is an object

            // check if data is a singular kavie observable or a object of kavie observables
            if (isKavieObservable(data)) {
                kavieObservables.push(data);
            } else {
                var keys = Object.keys(data);
                for (var i = 0; i < keys.length; i++) {
                    if (isKavieObservable(data[keys[i]])) {
                        kavieObservables.push(data[keys[i]]);
                    }
                }
            }

        }

        return kavieObservables;
    }

    var getSection = function (sectionName) {
        // returns a section, if no section of that name exists, it creates one

        // we create new sections if they don't exists because of observables being
        // added to the sections dynamically, and asynchronously

        var section = exports.sections[sectionName];
        if (!section) {
            exports.sections[sectionName] = new KavieSection();
            section = exports.sections[sectionName];
        }
        return section;
    }

    var isKavieObservable = function (observable) {
        // simple helper method to see if an observable has been extended with the kavie extender
        return ko.isObservable(observable) && observable.hasOwnProperty("hasError"); // when you extend an observable with kavie, it addes hasError.
    }

    var hasValue = function (value) {
        return !(value == null || value.length === 0);
    }

    var isTrue = function (value) {
        // incredibly simple helper function
        // to be used in array.every() processes
        return !!(value);
    }

    // built in validator functions
    // general rule for these is if empty, return true (if you want it required, you can add the required function)
    exports.validatorFunctions = {
        required: {
            validator: function (propVal, eleVal) {
                if (propVal) {
                    return hasValue(eleVal);
                } else {
                    return true;
                }
            },
            message: "This field is required"
        },
        numeric: {
            validator: function (propVal, eleVal) {
                if (propVal && hasValue(eleVal)) {
                    return !isNaN(parseFloat(eleVal)) && isFinite(eleVal);
                } else {
                    return true;
                }
            },
            message: "Please enter a numeric value"
        },
        maxLength: {
            validator: function (propVal, eleVal) {
                if (eleVal) {
                    return eleVal.length <= parseInt(propVal);
                }
                return true; // if no value is found, it doesnt have a length. So thus it is less than the propVal
            },
            message: "Please enter a value less than or equal to {propVal}"
        },
        minLength: {
            validator: function (propVal, eleVal) {
                if (eleVal) {
                    return eleVal.length >= parseInt(propVal);
                }
                return false; // opposite from above
            },
            message: "Please enter a value greater than or equal to {propVal}"
        },
        matches: function (propVal, eleVal) {
            if (ko.unwrap(propVal) == ko.unwrap(eleVal)) {
                return true;
            }
            return false;
        },
        date: {
            validator: function (propVal, eleVal) {
                if (propVal && hasValue(eleVal)) {

                    // regex matches the pattern of dd/dd/dddd or dd/dd/dd (where d is a digit)
                    if (!eleVal.match(/^(\d{2})\/(\d{2})\/((\d{4})|(\d{2}))$/)) {
                        return false;
                    }

                    date = eleVal;
                    var dt = date.split("/");

                    // month must be less than 13, greater than 0
                    var month = dt[0];
                    if (parseInt(month) > 12 || parseInt(month) < 1) {
                        return false;
                    }

                    var year = dt[2];
                    if (parseInt(year) <= 0) {
                        return false;
                    }

                    // make sure the day inputed is not greater than the mounth day count
                    var day = dt[1];
                    var daysInMonth = new Date(year, month, 0).getDate();
                    if (parseInt(day) > daysInMonth || parseInt(day) < 1) {
                        return false;
                    }
                    return true;

                } else {
                    return true;
                }
            },
            message: "Please enter a valid date"
        },
        birthdate: {
            validator: function (propVal, eleVal) {
                if (propVal && hasValue(eleVal)) {
                    // check to see if it is a valid date
                    if (!exports.validatorFunctions.date.validator(propVal, eleVal)) {
                        return false;
                    }

                    var date = new Date(eleVal);

                    // check to see if the date is in the future
                    if (date > new Date()) {
                        return false;
                    }

                    // check to see if date is a rational birthdate
                    var minDateAllowed = new Date();
                    minDateAllowed.setFullYear(minDateAllowed.getFullYear() - 120); // 120 is age of oldest person allowed

                    if (date < minDateAllowed) {
                        return false;
                    }
                    return true;

                } else {
                    return true;
                }
            },
            message: "Please enter a valid birthdate"
        },
        phone: {
            validator: function (propVal, eleVal) {
                if (propVal && hasValue(eleVal)) {
                    if (eleVal.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/)) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            },
            message: "Please enter a valid phone number"
        },
        email: {
            validator: function (propVal, eleVal) {
                if (propVal && hasValue(eleVal)) {
                    if (eleVal.match(/^(?:(?:[\w`~!#$%^&*\-=+;:{}'|,?\/]+(?:(?:\.(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)*"|[\w`~!#$%^&*\-=+;:{}'|,?\/]+))*\.[\w`~!#$%^&*\-=+;:{}'|,?\/]+)?)|(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)+"))@(?:[a-zA-Z\d\-]+(?:\.[a-zA-Z\d\-]+)*|\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])$/)) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            },
            message: "Please enter a valid email address"
        },
        regexPattern: function (propVal, eleVal) {
            return eleVal.toString().match(propVal) !== null;
        }
    }

    // exists for legacy reasons. [3/26/2017]
    exports.isSectionValid = function (sectionName) {
        console.warn("isSectionValid is deprecated and will be removed in the next release. Please use isValid('sectionName') instead");
        return exports.isValid(sectionName);
    }

    exports.isSectionValidAsync = function (sectionName) {
        console.warn("isSectionValidAsync is deprecated and will be removed in the next release. Please use isValidAsync('sectionName') instead");
        return exports.isValidAsync(sectionName);
    }

    function KavieSection() {
        var self = this;

        self.observables = [];
        self.rules = [];
        self.children = {};
        self.validate = true; // initially always validate
    }

    // This is the knockout js extender
    // simply adds a few things to the observable so we can access these from the kavie object
    ko.extenders.kavie = function (target, rules) {
        target.hasError = ko.observable(); // tracks whether this observable is valid or not
        target.errorMessage = ko.observable();

        // if section exists add observable to it
        if (rules.section) {
            if (!exports.sections[rules.section]) {
                exports.sections[rules.section] = new KavieSection();
            }

            exports.sections[rules.section].observables.push(target);
            rules.section = ""; // clear the section in rules after we add the observable
        }

        // if rules already exists merge both rules objects together
        if (target.rules) {
            target.rules = ko.utils.extend(target.rules, rules);
        } else {
            target.rules = rules;
        }

        // Simply checks each rule attached to this observable and changes hasError variable
        function validate(newValue) {
            var rules = target.rules;

            var isObservableValid = true;
            var erroredOutValidator = null; // the validator that was false

            for (key in rules) {
                var validatorObject = exports.validatorFunctions[key];

                if (validatorObject && !validatorObject.async) { // make sure the validator exsists and isn't async

                    var property = ko.unwrap(rules[key]);
                    var isValid = validatorObject.validator(property, newValue);

                    if (isObservableValid && !isValid) {
                        isObservableValid = false;
                        validatorObject.property = property; // record the property
                        erroredOutValidator = validatorObject;
                    }
                }
            }

            setValidationResult(isObservableValid, erroredOutValidator);
        }

        // async version of validating
        function validateAsync(newValue) {
            var rules = target.rules;

            var promises = [];

            for (key in rules) {
                var validatorObject = exports.validatorFunctions[key];

                if (validatorObject && validatorObject.async) {

                    var promise = new Promise(function (callback) {

                        var property = ko.unwrap(rules[key]); // unwrap because it could be an observable
                        validatorObject.property = property;

                        var valObj = validatorObject; // create a version of validator object locally so it can be accessed in the validator callback

                        validatorObject.validator(property, newValue, function (isValid) {
                            return callback({
                                isValid: isValid,
                                validatorObject: valObj
                            })
                        });

                    });

                    promises.push(promise);

                }
            }

            return Promise.all(promises).then(function (validatorResults) {
                for (var i = 0; i < validatorResults.length; i++) {
                    if (!validatorResults[i].isValid) {
                        setValidationResult(validatorResults[i].isValid, validatorResults[i].validatorObject);
                        return false;
                    }
                }

                setValidationResult(true, validatorResults.validatorObject);
                return true;
            });
        }

        // Sets the result of the validation, hasError value and errorMessage
        function setValidationResult(isValid, validatorObject) {
            if (!isValid) {
                if (validatorObject.message) {
                    var message = validatorObject.message;
                    var propertyValue = validatorObject.property; // property populated when validator function returned false
                    target.errorMessage(message.replace("{propVal}", propertyValue));
                } else {
                    target.errorMessage("");
                }
                target.hasError(true);

            } else {
                target.errorMessage("");
                target.hasError(false);
            }
        }

        target.startValidation = function () {
            if (exports.settings.subscriptionValidation) {
                target.subscription = target.subscribe(validate); // creates a subscribable to update when value changes
            }
            validate(target());
        }

        target.startAsyncValidation = function () {
            if (exports.settings.subscriptionValidation) {
                target.subscription = target.subscribe(validateAsync);
            }
            return validateAsync(target());
        }

        target.stopValidation = function () {
            if (target.subscription) {
                target.subscription.dispose();
            }
            target.hasError(false);
            target.errorMessage("");
        }

        return target;
    };
}))