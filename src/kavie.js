/*!
    Kavie - knockout observable validator
    Author: Matthew Nitschke
    License: MIT (http://www.opensource.org/licenses/mit-license.php)
    Version: {{versionNumber}}
*/

// This is a singleton pattern for the Kavie object to validate against
;(function(ns){

  // holds out observables and sections
  ns.sections = {};

  ns.reset = function(){
    ns.sections = {};
  }

  // turn validaton on
  ns.isValid = function(properties){
    // propeties can be:
    // self: an object with kavie observables
    // [self, a, foo]: an array of objects with kavie observables
    // "sectionA": a string of the name of a kavie section
    // ["sectionA", "sectionB"]: an array of section names
    // ["sectionA", self, foo, "sectionB"]: an array of a mix of the previous

    // vm can be a viewModel or a Kavie.section
    var isValid = true;

    var kavieObservables = compileObservables(properties);

    for(var i = 0; i < kavieObservables.length; i ++){
      kavieObservables[i].startValidation();

      if (isValid) {
        if (kavieObservables[i].hasError()) {
          isValid = false;
        }
      }
    }

    return isValid;
  }

  ns.isValidAsync = function(vm){
    var kavieObservables = compileObservables(vm);
    var promises = [];

    for(var i = 0; i < kavieObservables.length; i ++){
      var promise = kavieObservables[i].startAsyncValidation();

      if (promise){ // if promise is undefined, then there are no async rules on that observable
          promises = promises.concat(promise);
      }
    }

    return Promise.all(promises).then(function(results){
      // if every element in results is true return true, if any false, return false
      return results.every(isTrue);
    });
  }

  // turns off validation
  ns.deactivate = function(vm){
    var kavieObservables = compileObservables(vm);

    for(var i = 0; i < kavieObservables.length; i ++){
      kavieObservables[i].stopValidation();
    }
  }

  ns.addVariableValidation = function(sectionName, shouldValidate){
    if (!sectionExsists(sectionName)){
      throw "No section found with name: " + sectionName;
    }

    var section = ns.sections[sectionName];
    section.validate = shouldValidate;
  }

  ns.addSectionChild = function(parentSectionName, childSectionName){
    // ensure parentSection exsists
    if (!sectionExsists(parentSection)) {
      throw "No parent section found with name: " + parentSectionName;
    }

    // ensure childSection exsists
    if (!sectionExsists(childSection)){
      throw "No child section found with name: " + childSectionName;
    }

    var parentSection = ns.sections[parentSectionName];
    var childSection = ns.sections[childSectionName];
    parentSection.children[childSectionName] = childSection;
  }

  // returns an array of all kavieObservables found in the data passed in
  var compileObservables = function(data){

    if (!data) {
      throw "Data must not be null";
    }

    var kavieObservables = [];

    if (Array.isArray(data)){
      // if data is an array, recursivlly compile each array item
      for(var i = 0; i < data.length; i ++){
        kavieObservables = kavieObservables.concat(compileObservables(data[i]));
      }

    } else if (typeof data === "string"){
      // if data is a string, data is a sectionName
      var section = ns.sections[data];
      if (!section){
        throw "No section found with this name: " + data;
      }

      if (ko.unwrap(section.validate)){
        var childrenKeys = Object.keys(section.children);

        for(var i = 0; i < childrenKeys.length; i ++){
          kavieObservables = kavieObservables.concat(compileObservables(childrenKeys[i]));
        }

        kavieObservables = kavieObservables.concat(section.observables);

      }

    } else {
      // data is an object
      var keys = Object.keys(data);
      for(var i = 0; i < keys.length; i ++) {
        if (isKavieObservable(data[keys[i]])) {
          kavieObservables.push(data[keys[i]]);
        }
      }
    }

    return kavieObservables;
  }

  // simple helper method to see if an observable has been extended with the kavie extender
  var isKavieObservable = function(observable){
    return ko.isObservable(observable) && observable.hasOwnProperty("hasError"); // when you extend an observable with kavie, it addes hasError.
  }

  var sectionExsists = function(sectionName){
    return !(ns.sections[sectionName] === undefined || ns.sections[sectionName] === null);
  }



  // built in validator functions
  // general rule for these is if empty, return true (if you want it required, you can add the required function)
  ns.validatorFunctions = {
    required: {
      validator: function(propVal, eleVal){
        if (propVal) {
            return hasValue(eleVal);
        } else {
            return true;
        }
      },
      message: "This field is required"
    },
    numeric: {
      validator: function(propVal, eleVal){
        if (propVal && hasValue(eleVal)){
           return !isNaN(parseFloat(eleVal)) && isFinite(eleVal);
        } else {
          return true;
        }
      },
      message: "Please enter a numeric value"
    },
    maxLength: {
      validator: function (propVal, eleVal){
        if (eleVal){
          return eleVal.length <= parseInt(propVal);
        }
        return true; // if no value is found, it doesnt have a length. So thus it is less than the propVal
      },
      message: "Please enter a value less than or equal to {propVal}"
    },
    minLength:{
      validator: function(propVal, eleVal){
          if (eleVal){
            return eleVal.length >= parseInt(propVal);
          }
          return false; // opposite from above
      },
      message: "Please enter a value greater than or equal to {propVal}"
    },
    matches: function(propVal, eleVal){
      if (ko.unwrap(propVal) == ko.unwrap(eleVal)){
        return true;
      }
      return false;
    },
    date: {
      validator: function (propVal, eleVal){
        // change date to accept no preceding 0 on month and day
        if (propVal && hasValue(eleVal)){
            date = eleVal;

            // regex matches the patttern of dd/dd/dddd or dd/dd/dd (where d is a digit)
            var re = /(\d{2})\/(\d{2})\/((\d{4})|(\d{2}))/;
            if (date.search(re) == -1){
              return false;
            }

            var dt = date.split("/");

            // month must be less than 13, greater than 0
            var month = dt[0];
            if (parseInt(month) > 12 || parseInt(month) < 1) {
              return false;
            }

            var year = dt[2];

            // make sure the day inputed is not greater than the mounth day count
            var day = dt[1];
            var daysInMonth = new Date(year, month, 0).getDate();
            if (parseInt(day) > daysInMonth || parseInt(day) < 1){
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
      validator: function (propVal, eleVal){
        if (propVal && hasValue(eleVal)){
          // check to see if it is a valid date
          if (!Kavie.validatorFunctions.date.validator(propVal, eleVal)) {
              return false;
          }

          var date = new Date(eleVal);

          // check to see if the date is in the future
          if (date > new Date()){
              return false;
          }

          // check to see if date is a rational birthdate
          var minDateAllowed = new Date();
          minDateAllowed.setFullYear(minDateAllowed.getFullYear() - 120); // 120 is age of oldest person allowd

          if (date < minDateAllowed){
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
      validator: function (propVal, eleVal){
        if (propVal && hasValue(eleVal)){
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
      validator: function (propVal, eleVal){
        if (propVal && hasValue(eleVal)){
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
    regexPattern: function(propVal, eleVal){
      return eleVal.toString().match(propVal) !== null;
    }
  }

  var hasValue = function(value){
     return !(value == null || value.length === 0);
  }

  // incredebly simple helper function
  // to be used in array.every() processes
  var isTrue = function(value){
    return value;
  }

}(this.Kavie = this.Kavie || {}));

function KavieSection(){
  var self = this;

  self.observables = [];

  self.children = {};

  self.validate = true; // initially always validate
}


// This is the knockout js extender
// simply adds a few things to the observable so we can access these from the kavie object
ko.extenders.kavie = function (target, rules){
    target.hasError = ko.observable(); // tracks whether this observable is valid or not
    target.errorMessage = ko.observable();

    // if section exsists add observable to it
    if (rules.section){
      if (!Kavie.sections[rules.section]){
        Kavie.sections[rules.section] = new KavieSection();
      }

      Kavie.sections[rules.section].observables.push(target);
      rules.section = "";
    }

    // add the passed in rules to the observable
    target.rules = rules;

    // Simply checks each rule attached to this observable and changes hasError variable
    function validate(newValue){
      var rules = target.rules;

      var isObservableValid = true;
      var erroredOutValidator = null; // the validator that was false

      for(key in rules){
        var validatorObject = Kavie.validatorFunctions[key];

        if (validatorObject && !validatorObject.async){ // make sure the validator exsists and isn't async

          var property = ko.unwrap(rules[key]);
          var isValid = validatorObject.validator(property, newValue);

          if (isObservableValid && !isValid){
            isObservableValid = false;
            validatorObject.property = property; // record the property
            erroredOutValidator = validatorObject;
          }
        }
      }

      setValidationResult(isObservableValid, erroredOutValidator);
    }

    // async version of validating
    function validateAsync(newValue){
        var rules = target.rules;

        var promises = [];

        for (key in rules){
          var validatorObject = Kavie.validatorFunctions[key];

          if (validatorObject && validatorObject.async) {

            var promise = new Promise(function(callback){

              var property = ko.unwrap(rules[key]); // unwrap because it could be an observable
              validatorObject.property = property;

              validatorObject.validator(property, newValue, function(isValid, e, r){
                return callback({
                  isValid: isValid,
                  validatorObject: validatorObject
                })
              });
            });

            promises.push(promise);

          }
        }

        return Promise.all(promises).then(function(validatorResults){
          for(var i = 0; i < validatorResults.length; i ++){
            if (!validatorResults[i].isValid){
              setValidationResult(validatorResults[i].isValid, validatorResults[i].validatorObject);
              return false;
            }
          }

          setValidationResult(true, validatorResults.validatorObject);
          return true;
        });
    }

    // Sets the result of the validation, hasError value and errorMessage
    function setValidationResult(isValid, validatorObject){
      if (!isValid) {
        if (validatorObject.message){
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



    target.startValidation = function(){
        target.subscription = target.subscribe(validate); // creates a subscribable to update when value changes
        validate(target());
    }

    target.startAsyncValidation = function(){
      target.subscription = target.subscribe(validateAsync);
      return validateAsync(target());
    }

    target.stopValidation = function(){
      if (target.subscription){
        target.subscription.dispose();
      }
      target.hasError(false);
      target.errorMessage("");
    }

    return target;
};
