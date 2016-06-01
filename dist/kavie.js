/*!
    Kavie - knockout observable validator
    Author: Matthew Nitschke
    License: MIT (http://www.opensource.org/licenses/mit-license.php)
    Version: 0.3.0
*/

;(function(ns){

  ns.sections = {};

  ns.isValid = function(vm){
    var isValid = true;

    var kavieObservables = compileObservables(vm);

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

  ns.isSectionValid = function(sectionName){
    var section = ns.sections[sectionName];

    var isValid = true;

    if (ko.unwrap(section.validate)){
      isValid = ns.isValid(section.observables);
    } else {
      ns.deactivate(section.observables);
    }


    return isValid;
  }

  ns.deactivate = function(vm){
    var kavieObservables = compileObservables(vm);

    for(var i = 0; i < kavieObservables.length; i ++){
      kavieObservables[i].stopValidation();
    }
  }

  var isKavieObservable = function(observable){
    if (observable.hasOwnProperty("hasError")){ 
      return true;
    } else {
      return false;
    }
  }

  var compileObservables = function(vm){

    var kavieObservables = [];

    if (vm && vm.hasOwnProperty("observables")){
      vm = vm.observables;
    }

    if (vm){
      var keys = Object.keys(vm);
      for(var i = 0; i < keys.length; i ++){
        if (isKavieObservable(vm[keys[i]])){
          kavieObservables.push(vm[keys[i]]);
        }
      }
    }
    return kavieObservables;
  }

  ns.validatorFunctions = {
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
      return true; 
    },
    min: function (propVal, eleVal) {
      if (eleVal){
        return eleVal.length >= propVal;
      }
      return false; 
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
      return false; 
    },
    birthdate: function (propVal, eleVal) {
        if (!Kavie.validatorFunctions.date(propVal, eleVal)) {
            return false;
        }

        var date = new Date(eleVal);

        if (date > new Date()) {
            return false;
        }

        var minDateAllowed = new Date();
        minDateAllowed.setFullYear(minDateAllowed.getFullYear() - 120); 

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

}(this.Kavie = this.Kavie || {}));

function KavieSection(){
  var self = this;

  self.observables = [];

  self.validate = true; 
  self.addVariableValidation = function(validate){
    self.validate = validate;
  }
}


ko.extenders.kavie = function (target, rules) {
    var localRules = JSON.parse(JSON.stringify(rules));

    target.hasError = ko.observable(); 

    if (localRules.section){
      if (!Kavie.sections[localRules.section]){
        Kavie.sections[localRules.section] = new KavieSection();
      }

      Kavie.sections[localRules.section].observables.push(target);

      delete localRules.section;
    }

    target.rules = localRules;

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
        target.subscription = target.subscribe(validate); 
        validate(target());
    }

    target.stopValidation = function () {
      if (target.subscription){
        target.subscription.dispose();
      }
      target.hasError(false);
    }

    return target;
};
