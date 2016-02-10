/*
 * Kavie - knockout observable validator
 * Matthew Nitschke - http://pyrtio.com/
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

ko.extenders.kavie = function (target, rules) {
    target.hasError = ko.observable();

    if (rules.addToArray){
      Kavie.add(target);
      delete rules.addToArray;
    }

    target.rules = rules;

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

    target.subscription;

    target.startValidation = function () {
        target.subscription = target.subscribe(validate);
        validate(target());
    }

    target.stopValidation = function () {
        target.subscription.dispose();
        target.hasError(false);
    }

    return target;
};


var Kavie = function(){}
Kavie.observables = [];

Kavie.isKavieObservable = function(observable){
  if (observable.hasOwnProperty("hasError")){ // when you extend an observable with kavie, it addes hasError.
    return true;
  } else {
    return false;
  }
}

Kavie.add = function(obs){
  if (this.isKavieObservable(obs)){
    this.observables = this.observables.concat(obs);
  }
}

Kavie.isValid = function(vm){
  var isValid = true;

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

Kavie.deactivate = function(vm){
  var keys = Object.keys(vm);
  for(var i = 0; i < keys.length; i ++){
    var key = vm[keys[i]];
    if (this.isKavieObservable(key)){
      key.stopValidation();
    }
  }
}

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
