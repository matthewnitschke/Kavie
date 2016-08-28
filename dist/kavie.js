/*!
    Kavie - knockout observable validator
    Author: Matthew Nitschke
    License: MIT (http://www.opensource.org/licenses/mit-license.php)
    Version: 0.5.0
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

    if (ko.unwrap(section.validate)) {

      var children = Object.keys(section.children);
      for (var i = 0; i < children.length; i++) {
        var childValid = ns.isSectionValid(children[i]); 

        if (!childValid) { 
          isValid = false;
        }
      }

      var sectionObsValid = ns.isValid(section.observables);

      if (!sectionObsValid){
        isValid = false;
      }

    } else {
      ns.deactivateSection(sectionName);
    }

    return isValid;
  }

  ns.deactivate = function(vm){
    var kavieObservables = compileObservables(vm);

    for(var i = 0; i < kavieObservables.length; i ++){
      kavieObservables[i].stopValidation();
    }
  }

  ns.deactivateSection = function(sectionName){
    var section = ns.sections[sectionName];

    var children = Object.keys(section.children);
    for(var i = 0; i < children.length; i ++){
      ns.deactivateSection(children[i]); 
    }

    ns.deactivate(section.observables);
  }

  ns.addVariableValidation = function(sectionName, shouldValidate){
    var section = ns.sections[sectionName];
    if (!section){
      section = ns.sections[sectionName] = new KavieSection();
    }

    section.validate = shouldValidate;
  }

  ns.addSectionChild = function(parentSectionName, childSectionName){
    var parentSection = ns.sections[parentSectionName];
    if (!parentSection) {
      parentSection = ns.sections[parentSectionName] = new KavieSection();
    }

    parentSection.children[childSectionName] = new KavieSection();
  }

  var isKavieObservable = function(observable){
    return observable.hasOwnProperty("hasError"); 
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
    required: function (propVal, eleVal){
        if (propVal) {
            return hasValue(eleVal);
        } else {
            return true;
        }
    },
    numeric: function(propVal, eleVal){
      if (propVal && hasValue(eleVal)){
         return !isNaN(parseFloat(eleVal)) && isFinite(eleVal);
      } else {
        return true;
      }

    },
    maxLength: function (propVal, eleVal){
      if (eleVal){
        return eleVal.length <= propVal;
      }
      return true; 
    },
    minLength: function (propVal, eleVal){
      if (eleVal){
        return eleVal.length >= propVal;
      }
      return false; 
    },
    matches: function(propVal, eleVal){
      if (ko.unwrap(propVal) == ko.unwrap(eleVal)){
        return true;
      }
      return false;
    },
    date: function (propVal, eleVal){
      if (propVal && hasValue(eleVal)){
        if (eleVal.length >= 8 && eleVal.length <= 10) {
            if (new Date(eleVal) == "Invalid Date") {
                return false;
            }
            return true;
        }
        return false;
      } else {
        return true;
      }
    },
    birthdate: function (propVal, eleVal){
      if (propVal && hasValue(eleVal)){
        if (!Kavie.validatorFunctions.date(propVal, eleVal)) {
            return false;
        }

        var date = new Date(eleVal);

        if (date > new Date()){
            return false;
        }

        var minDateAllowed = new Date();
        minDateAllowed.setFullYear(minDateAllowed.getFullYear() - 120); 

        if (date < minDateAllowed){
            return false;
        }
        return true;

      } else {
        return true;
      }


    },
    phone: function (propVal, eleVal){
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
    email: function (propVal, eleVal){
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
    regexPattern: function(propVal, eleVal){
      return eleVal.toString().match(propVal) !== null;
    }
  }

  var hasValue = function(value){
     return !(value == null || value.length === 0);
  }

}(this.Kavie = this.Kavie || {}));

function KavieSection(){
  var self = this;

  self.observables = [];

  self.children = {};

  self.validate = true; 
}


ko.extenders.kavie = function (target, rules){
    var localRules = rules;

    target.hasError = ko.observable(); 

    if (localRules.section){
      if (!Kavie.sections[localRules.section]){
        Kavie.sections[localRules.section] = new KavieSection();
      }

      Kavie.sections[localRules.section].observables.push(target);
      localRules.section = "";
    }

    target.rules = localRules;

    function validate(newValue){
        var rules = target.rules;

        for (key in rules){
            for (funcKey in Kavie.validatorFunctions){
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


    target.startValidation = function(){
        target.subscription = target.subscribe(validate); 
        validate(target());
    }

    target.stopValidation = function(){
      if (target.subscription){
        target.subscription.dispose();
      }
      target.hasError(false);
    }

    return target;
};
