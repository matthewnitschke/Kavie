# Kavie
Insanly Basic Knockout validation


I created Kavie when I was frusterated with the current knockout validation libraries


##Usage

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
