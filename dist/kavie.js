/*!
    Kavie - knockout observable validator
    Author: Matthew Nitschke
    License: MIT (http://www.opensource.org/licenses/mit-license.php)
    Version: 2.1.1
*/

;(function(ns){
  ns.sections = {};

  ns.reset = function(){
    ns.sections = {};
  }

  ns.isValid = function(properties){

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

      if (promise){ 
          promises = promises.concat(promise);
      }
    }

    var synchronousMethodsValid = ns.isValid(vm);

    return Promise.all(promises).then(function(results){
      return results.every(isTrue) && synchronousMethodsValid;
    });
  }

  ns.deactivate = function(vm){
    var kavieObservables = compileObservables(vm);

    for(var i = 0; i < kavieObservables.length; i ++){
      kavieObservables[i].stopValidation();
    }
  }

  ns.addVariableValidation = function(sectionName, shouldValidate){
    var section = ns.sections[sectionName];
    if (!section){
      ns.sections[sectionName] = new KavieSection();
      section = ns.sections[sectionName];
    }

    section.validate = shouldValidate;
  }

  ns.addSectionChild = function(parentSectionName, childSectionName){
    var parentSection = ns.sections[parentSectionName];
    if (!parentSection) {
      ns.sections[parentSectionName] = new KavieSection();
      parentSection = ns.sections[parentSectionName];
    }

    var childSection = ns.sections[childSectionName];
    if (!childSection){
      ns.sections[childSectionName] = new KavieSection();
      childSection = ns.sections[childSectionName];
    }

    parentSection.children[childSectionName] = childSection;
  }

  var compileObservables = function(data) {
    if (!data) {
      throw "Data must not be null";
    }

    var kavieObservables = [];

    if (Array.isArray(data)){
      for(var i = 0; i < data.length; i ++){
        kavieObservables = kavieObservables.concat(compileObservables(data[i]));
      }

    } else if (typeof data === "string"){
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
      var keys = Object.keys(data);
      for(var i = 0; i < keys.length; i ++) {
        if (isKavieObservable(data[keys[i]])) {
          kavieObservables.push(data[keys[i]]);
        }
      }
    }

    return kavieObservables;
  }

  var isKavieObservable = function(observable) {
    return ko.isObservable(observable) && observable.hasOwnProperty("hasError"); 
  }

  var sectionExsists = function(sectionName) {
    return !(ns.sections[sectionName] === undefined || ns.sections[sectionName] === null);
  }

  var hasValue = function(value) {
     return !(value == null || value.length === 0);
  }

  var isTrue = function(value) {
    return value;
  }

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
        return true; 
      },
      message: "Please enter a value less than or equal to {propVal}"
    },
    minLength:{
      validator: function(propVal, eleVal){
          if (eleVal){
            return eleVal.length >= parseInt(propVal);
          }
          return false; 
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
        if (propVal && hasValue(eleVal)){
            date = eleVal;

            var re = /(\d{2})\/(\d{2})\/((\d{4})|(\d{2}))/;
            if (date.search(re) == -1){
              return false;
            }

            var dt = date.split("/");

            var month = dt[0];
            if (parseInt(month) > 12 || parseInt(month) < 1) {
              return false;
            }

            var year = dt[2];

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
          if (!Kavie.validatorFunctions.date.validator(propVal, eleVal)) {
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

  ns.isSectionValid = function(sectionName) {
    console.warn("isSectionValid is depricated and will be removed in the next release. Please use isValid('sectionName') instead");
    return ns.isValid(sectionName);
  }
  ns.isSectionValidAsync = function(sectionName) {
    console.warn("isSectionValidAsync is depricated and will be removed in the next release. Please use isValidAsync('sectionName') instead");
    return ns.isValidAsync(sectionName);
  }

}(this.Kavie = this.Kavie || {}));

function KavieSection(){
  var self = this;

  self.observables = [];

  self.children = {};

  self.validate = true; 
}


ko.extenders.kavie = function (target, rules){
    target.hasError = ko.observable(); 
    target.errorMessage = ko.observable();

    if (rules.section){
      if (!Kavie.sections[rules.section]){
        Kavie.sections[rules.section] = new KavieSection();
      }

      Kavie.sections[rules.section].observables.push(target);
      rules.section = "";
    }

    target.rules = rules;

    function validate(newValue){
      var rules = target.rules;

      var isObservableValid = true;
      var erroredOutValidator = null; 

      for(key in rules){
        var validatorObject = Kavie.validatorFunctions[key];

        if (validatorObject && !validatorObject.async){ 

          var property = ko.unwrap(rules[key]);
          var isValid = validatorObject.validator(property, newValue);

          if (isObservableValid && !isValid){
            isObservableValid = false;
            validatorObject.property = property; 
            erroredOutValidator = validatorObject;
          }
        }
      }

      setValidationResult(isObservableValid, erroredOutValidator);
    }

    function validateAsync(newValue){
        var rules = target.rules;

        var promises = [];

        for (key in rules){
          var validatorObject = Kavie.validatorFunctions[key];

          if (validatorObject && validatorObject.async) {

            var promise = new Promise(function(callback){

              var property = ko.unwrap(rules[key]); 
              validatorObject.property = property;

              var valObj = validatorObject; 

              validatorObject.validator(property, newValue, function(isValid){
                return callback({
                  isValid: isValid,
                  validatorObject: valObj
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

    function setValidationResult(isValid, validatorObject){
      if (!isValid) {
        if (validatorObject.message){
          var message = validatorObject.message;
          var propertyValue = validatorObject.property; 
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
        target.subscription = target.subscribe(validate); 
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

!function(e){function n(){}function t(e,n){return function(){e.apply(n,arguments)}}function o(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],s(e,this)}function i(e,n){for(;3===e._state;)e=e._value;return 0===e._state?void e._deferreds.push(n):(e._handled=!0,void o._immediateFn(function(){var t=1===e._state?n.onFulfilled:n.onRejected;if(null===t)return void(1===e._state?r:u)(n.promise,e._value);var o;try{o=t(e._value)}catch(i){return void u(n.promise,i)}r(n.promise,o)}))}function r(e,n){try{if(n===e)throw new TypeError("A promise cannot be resolved with itself.");if(n&&("object"==typeof n||"function"==typeof n)){var i=n.then;if(n instanceof o)return e._state=3,e._value=n,void f(e);if("function"==typeof i)return void s(t(i,n),e)}e._state=1,e._value=n,f(e)}catch(r){u(e,r)}}function u(e,n){e._state=2,e._value=n,f(e)}function f(e){2===e._state&&0===e._deferreds.length&&o._immediateFn(function(){e._handled||o._unhandledRejectionFn(e._value)});for(var n=0,t=e._deferreds.length;n<t;n++)i(e,e._deferreds[n]);e._deferreds=null}function c(e,n,t){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof n?n:null,this.promise=t}function s(e,n){var t=!1;try{e(function(e){t||(t=!0,r(n,e))},function(e){t||(t=!0,u(n,e))})}catch(o){if(t)return;t=!0,u(n,o)}}var a=setTimeout;o.prototype["catch"]=function(e){return this.then(null,e)},o.prototype.then=function(e,t){var o=new this.constructor(n);return i(this,new c(e,t,o)),o},o.all=function(e){var n=Array.prototype.slice.call(e);return new o(function(e,t){function o(r,u){try{if(u&&("object"==typeof u||"function"==typeof u)){var f=u.then;if("function"==typeof f)return void f.call(u,function(e){o(r,e)},t)}n[r]=u,0===--i&&e(n)}catch(c){t(c)}}if(0===n.length)return e([]);for(var i=n.length,r=0;r<n.length;r++)o(r,n[r])})},o.resolve=function(e){return e&&"object"==typeof e&&e.constructor===o?e:new o(function(n){n(e)})},o.reject=function(e){return new o(function(n,t){t(e)})},o.race=function(e){return new o(function(n,t){for(var o=0,i=e.length;o<i;o++)e[o].then(n,t)})},o._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){a(e,0)},o._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)},o._setImmediateFn=function(e){o._immediateFn=e},o._setUnhandledRejectionFn=function(e){o._unhandledRejectionFn=e},"undefined"!=typeof module&&module.exports?module.exports=o:e.Promise||(e.Promise=o)}(this);