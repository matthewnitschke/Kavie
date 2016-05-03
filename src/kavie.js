/*
 * Kavie - knockout observable validator
 * Author: Matthew Nitschke
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

// This is the knockout js extender
// simply adds a few things to the observable so we can access these from the kavie object
ko.extenders.kavie = function (target, rules) {
    target.hasError = ko.observable(); // tracks whether this observable is valid or not

    // if contains addToArray, add this observable to the global Kavie object
    // (not sure if i like this)
    if (rules.addToArray){
      Kavie.add(target);
      delete rules.addToArray;
    }

    // if section exsists add observable to it
    if (rules.section){
      if (!Kavie.sections[rules.section]){
        Kavie.sections[rules.section] = [];
      }

      Kavie.sections[rules.section].push(target);

      delete rules.section;
    }

    // add the passed in rules to the observable
    target.rules = rules;

    // Simply checks each rule attached to this observable and changes hasError variable
    function validate(newValue) {
        var rules = target.rules;

        for (key in rules) {
            for (funcKey in Kavie.validatorFunctions) {
                if (key == funcKey) {
                    var isValid = Kavie.validatorFunctions[funcKey](rules[key], newValue);
                    if (!isValid) {
                        target.hasError(true);
                        return;
                    }
                }
            }
        }

        target.hasError(false);
    }


    target.startValidation = function () {
        target.subscription = target.subscribe(validate); // creates a subscribable to update when value changes
        validate(target());
    }

    target.stopValidation = function () {
        target.subscription.dispose();
        target.hasError(false);
    }

    return target;
};


var Kavie = function(){} // the global kavie object
Kavie.observables = [];
Kavie.sections = [];

// a simple helper function to check if observables have been extended with the kavie extender
Kavie.isKavieObservable = function(observable){
  if (observable.hasOwnProperty("hasError")){ // when you extend an observable with kavie, it addes hasError.
    return true;
  } else {
    return false;
  }
}

// adds a kavie observable to the global kavie object
Kavie.add = function(obs){
  if (this.isKavieObservable(obs)){
    this.observables = this.observables.concat(obs);
  }
}

// returs a list of all the kavie observables
// pulls from the global object, and a viewModel or section that can be passed in
Kavie.compileObservables = function(vm){
  var kavieObservables = [];

  if (this.observables.length > 0){
    kavieObservables = kavieObservables.concat(this.observables);
  }
  if (vm){
    var keys = Object.keys(vm);
    for(var i = 0; i < keys.length; i ++){
      if (this.isKavieObservable(vm[keys[i]])){
        kavieObservables.push(vm[keys[i]]);
      }
    }
  }
  return kavieObservables;
}

// the main is valid function run to see if observables are valid
Kavie.isValid = function(vm){
  var isValid = true;

  var kavieObservables = Kavie.compileObservables(vm);

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

// simply deactivates all observables
Kavie.deactivate = function(vm){
  var kavieObservables = Kavie.compileObservables(vm);

  for(var i = 0; i < kavieObservables.length; i ++){
    kavieObservables[i].stopValidation();
  }
}

// built in validator functions
Kavie.validatorFunctions = {
    required: function (propVal, eleVal) {
        if (propVal) {
            return (eleVal ? true : false);
        } else {
            return true;
        }
    },
    numeric: function(propVal, eleVal){
      if (propVal){
         return !isNaN(parseFloat(eleVal)) && isFinite(eleVal);
      } else {
        return true;
      }

    },
    max: function (propVal, eleVal) {
      if (eleVal){
        return eleVal.length <= propVal;
      }
      return true; // if no value is found, it doesnt have a length. So thus it is less than the propVal
    },
    min: function (propVal, eleVal) {
      if (eleVal){
        return eleVal.length >= propVal;
      }
      return false; // opposite from above
    },
    date: function (propVal, eleVal) {
      if (eleVal){
        if (eleVal.length == 10) {
            if (new Date(eleVal) == "Invalid Date") {
                return false;
            }
            return true;
        }
        return false;
      }
      return false; // noting is an invalid date
    },
    birthdate: function (propVal, eleVal) {
        // check to see if it is a valid date
        if (!Kavie.validatorFunctions.date(propVal, eleVal)) {
            return false;
        }

        var date = new Date(eleVal);

        // check to see if the date is in the future
        if (date > new Date()) {
            return false;
        }

        // check to see if date is a rational birthdate
        var minDateAllowed = new Date();
        minDateAllowed.setFullYear(minDateAllowed.getFullYear() - 120); // 120 is age of oldest person allowd

        if (date < minDateAllowed) {
            return false;
        }

        return true;
    },
    regexPattern: function(propVal, eleVal){
      if (eleVal){
        return eleVal.toString().match(propVal) !== null;
      } else {
        return false;
      }
    }
}
