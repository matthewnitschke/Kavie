
(function () {
    this.Kavie = function () {
        this.values = arguments[0];
    }

    Kavie.prototype.isValid = function () {
        var isValid = true;
        for (var i = 0; i < this.values.length; i++) {
            this.values[i].startValidation();

            if (isValid) {
                if (this.values[i].hasError()) {
                    isValid = false;
                }
            }
        }
        return isValid;
    }

    Kavie.validatorFunctions = {
        required: function (propVal, eleVal) {
            if (propVal) {
                return (eleVal ? true : false);
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
        }
    }
    // functions to add:
    // numeric, regex pattern

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

    target.startValidation = function () {
        target.subscribe(validate);
        validate(target());
    }

    return target;
};
