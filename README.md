# Kavie
Insanly Basic Knockout validation


I created Kavie when I was frusterated with the current knockout validation libraries


##Basic Usage
####Javascript
```javascript
function ViewModel(){
  var self = this;

  self.value = ko.observable("Hello").extend({
    kavie: { required: true }
  });

  self.validator = new Kavie([
    self.value
  ]);

  self.submit = function(){
    if (self.validator.isValid()){
      console.log("All good!");
    }

  }
}
```
####Html
```html
<input type="text" data-bind="textInput: value, css:{'validation-error': value.hasError}/>
```

##Methods
```javascript
var validator = new Kavie([observable, observable, ...]);

validator.isValid(); // checks to see if all observables are valid
validator.isValid([kavieObject, kavieObject, ...]); // checks this and array of kavie observables
validator.addValue(kavieObservable); // adds a kavieObservable after instantiateing Kavie
validator.isKavieObservable(observable); // simple method to see if a knockout observable has been extended with kavie
validator.deactivate(); // turns off validation on each kavieObservable

```


###Adding Custom Validation Functions
```javascript
Kavie.validatorFunctions.customValidator = function(propVal, eleVal){
  // propVal is the value passed in from the ko.extend()
  // eleVal is the value being passed in from the observable
  
  if (eleVal == "yea!"){
    return true;
  } else {
    return false
  }
}
```

###Pre-made Validator Functions
Name | Properties | Notes
-----|------------|------
required | true/false |
max | int |
min | int |
date | true/false |
birthdate | true/false | Checks for valid date, if date is after current date, and if birthdate age is less than 120
numeric | true/false | Is input fully numeric
regexPattern | regex | matches a regex pattern
