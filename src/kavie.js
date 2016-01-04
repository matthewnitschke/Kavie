
(function(){
  this.Kavie = function(){
    this.values = arguments[0];
  }

  Kavie.prototype.isValid = function(){
    var isValid = true;
    for(var i = 0; i < this.values.length; i ++){
      this.values[i].startValidation();

      if (isValid){
        if (this.values[i].hasError()){
          isValid = false;
        }
      }
    }
    return isValid;
  }

  Kavie.validatorFunctions = {
    required: function(propVal, eleVal){
      if (propVal){
        return (eleVal ? true : false);
      } else {
        return true;
      }
    },
    max: function(propVal, eleVal){
      return (eleVal.length <= propVal ? true : false);
    },
    min: function(propVal, eleVal){
      return (eleVal.length >= propVal ? true : false);
    },
    date: function(propVal, eleVal){
      if (eleVal.length == 10) {
        if(new Date(eleVal) == "Invalid Date"){
          return false;
        }
        return true;
      }
      return false;
    },
    birthdate: function(propVal, eleVal){
      // check to see if it is a valid date
      if (!Kavie.validatorFunctions.date(propVal, eleVal)){
        return false;
      }

      var date = new Date(eleVal);

      // check to see if the date is in the future
      if (!date.isBefore(new Date())){
        return false;
      }

      // check to see if date is a rational birthdate
      var minDateAllowed = new Date();
      minDateAllowed.setYear(minDateAllowed.getYear() - 120); // 120 is age of oldest person allowd

      if (!date.isBefore(minDateAllowed)){
        return false;
      }

      return true;
    }
  }

}());

Date.prototype.isBefore = function(date){ // used in the birthdate validatorFunction
  if (this.getYear() < date.getYear()){
    return true;
  } else if (this.getMonth() < date.getMonth()){
    return true;
  } else if (this.getDay() < date.getDay()){
    return true;
  }
  return false;
}

ko.extenders.kavie = function(target, rules) {
    target.hasError = ko.observable();

    target.rules = rules;
 
    function validate(newValue) {
      var rules = target.rules;

      for (key in rules){
        for(funcKey in Kavie.validatorFunctions){
          if (key == funcKey){
            var isValid = Kavie.validatorFunctions[funcKey](rules[key], newValue);
            if (!isValid){
              target.hasError(true);
              return;
            }
          }
        }
      }

      target.hasError(false);
    }

    target.startValidation = function(){
      target.subscribe(validate);
      validate(target());
    }
 
    return target;
};
