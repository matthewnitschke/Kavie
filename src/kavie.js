/*!
    Kavie - knockout observable validator
    Author: Matthew Nitschke
    License: MIT (http://www.opensource.org/licenses/mit-license.php)
    Version: 0.4.2
*/

// This is a singleton pattern for the Kavie object to validate against
;(function(ns){

  // holds out observables and sections
  ns.sections = {};

  // turn validaton on
  ns.isValid = function(vm){
    // vm can be a viewModel or a Kavie.section
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

    var children = Object.keys(section.children);

    for(var i = 0; i < children.length; i ++){
      ns.isSectionValid(children[i], section.validate); // recursivlly go through all sections
    }

    if (ko.unwrap(section.validate)){
      isValid = ns.isValid(section.observables);
    } else {
      ns.deactivate(section.observables);
    }

    // else isValid stays true

    return isValid;
  }

  // turns off validation
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
      ns.deactivateSection(children[i]); // recursivlly go through all the section's children
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
    if (!parentSection){
      parentSection = ns.sections[parentSectionName] = new KavieSection();
    }

    parentSection.children[childSectionName] = new KavieSection();
  }

  // simple helper method to see if an observable has been extended with the kavie extender
  var isKavieObservable = function(observable){
    if (observable.hasOwnProperty("hasError")){ // when you extend an observable with kavie, it addes hasError.
      return true;
    } else {
      return false;
    }
  }

  // returns an array of all kavieObservables found in the viewModel potentially passed in,
  // and attached to the Kavie object it's self
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

  // built in validator functions
  ns.validatorFunctions = {
    required: function (propVal, eleVal) {
        if (propVal) {
            return !(eleVal == null || eleVal === '');
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

}(this.Kavie = this.Kavie || {}));

function KavieSection(){
  var self = this;

  self.observables = [];

  self.children = {};

  self.validate = true; // initially always validate
}


// This is the knockout js extender
// simply adds a few things to the observable so we can access these from the kavie object
ko.extenders.kavie = function (target, rules) {
    // make a copy of rules because we delete from it, and that would delete the key from the object that is passed in
    var localRules = JSON.parse(JSON.stringify(rules));

    target.hasError = ko.observable(); // tracks whether this observable is valid or not

    // if section exsists add observable to it
    if (localRules.section){
      if (!Kavie.sections[localRules.section]){
        Kavie.sections[localRules.section] = new KavieSection();
      }

      Kavie.sections[localRules.section].observables.push(target);

      delete localRules.section;
    }

    // add the passed in rules to the observable
    target.rules = localRules;

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
      if (target.subscription){
        target.subscription.dispose();
      }
      target.hasError(false);
    }

    return target;
};
