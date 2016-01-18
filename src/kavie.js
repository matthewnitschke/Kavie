/*
 * Kavie - knockout observable validator
 * Matthew Nitschke - http://pyrtio.com/
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */


(function () {
    this.Kavie = function () {
        this.values = arguments[0];
        this.isActive = false;
    }

    Kavie.prototype.addValue = function(value){
      this.values.push(value);
    }

    Kavie.prototype.isValid = function (otherValidators) {
        var isValid = true;
        for (var i = 0; i < this.values.length; i++) {
            if (this.isKavieObservable(this.values[i])){
                this.values[i].startValidation();

                if (isValid) {
                    if (this.values[i].hasError()) {
                        isValid = false;
                    }
                }
            }
        }

        if (otherValidators){
          for(var i = 0; i < otherValidators.length; i ++){
            var otherValidatorIsValid = otherValidators[i].isValid();

            if (isValid) {
                if (!otherValidatorIsValid) {
                    isValid = false;
                }
            }
          }
        }

        this.isActive = true;
        return isValid;
    }

    Kavie.prototype.isKavieObservable = function(observable){
      if (observable.hasError == null){ // when you extend an observable with kavie, it addes hasError.
        return false;
      } else {
        return true;
      }
    }

    Kavie.prototype.deactivate = function () {
        for (var i = 0; i < this.values.length; i++) {
            this.values[i].stopValidation();
        }
        this.isActive = false;
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
            minDateAllowed.setFullYear(minDateAllowed.getFullYear() - 120); // 120 is age of oldest person allodeewz5454ddeeha

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
}());


ko.extenders.kavie = function (target, rules) {
    target.hasError = ko.observable();

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
