![kavie-banner](https://cloud.githubusercontent.com/assets/6363089/13166491/cafa75c2-d685-11e5-8be8-3f878a9454f7.png)

## Why Kavie?
Kavie is small (minified ~3kb), easy to use, and it works

## Installation
You can download kavie from npm
```
npm install kavie
```

Then include it in your project after knockout js
```html
<script src="/path/to/knockout.js"></script>
<script src="/node_modules/kavie/dist/kavie.js"></script>
```

# Usage

```javascript
function ViewModel(){
  var self = this;
  
  self.value = ko.observable().extend({
    kavie: {
      required: true
    }
  });
  
  self.submit = function(){
    if (Kavie.isValid(self)){
      console.log("All Good!");
    }
  }
}
```
## Html Side
Kavie works by adding a hasError variable to the observable. This gives the flexibility to add color changing to any element you want

```html
<input type="text" data-bind="textInput: value, css:{'error': value.hasError}"/>
<span data-bind="visible: value.hasError">Uh Oh! There was an error!</span>
```

#Validation Messages
You can use a validation message to display to the user if the validation failed

```html
<input data-bind="textInput: value">
<div data-bind="text: value.errorMessage"></div>
```
These validation messages are stored on the validators see the Custom Rules section for more information

#Validation rules
There are a few validation rules build in

```javascript
self.value = ko.observable().extend({
    kavie: {
      required: true, // [boolean] this one is obvious
      maxLength: 3, // [int] max amount of characters: 3
      minLength: 2, // [int] min amount of characters: 2
      date: true, // [boolean] validates dates based on js dates
      birthdate: true, // [boolean] uses date, and must be in past with persons age less than 120
      phone: true, // [boolean] uses regex to validate a valid 10 digit phone number
      email: true, // [boolean] uses regex to validate a valid email
      numeric: true, // [boolean] must be an integer
      regexPattern: /([A-Z])\w+/ // [regex] matches a pattern
    }
});
```
It is important to note that on the date, birthdate, phone, email, and numeric validators, if the users input is null, undefined, or empty they will return true. This is so you can still have optional values and use these validators. If you want them required, add the required validator.

##Custom Rules
Custom rules are added as follows

```javascript
Kavie.validatorFunctions.isYea = {
  validator: function(propVal, eleVal){
    // propVal is the value passed in from the ko.extend()
    // eleVal is the value being passed in from the observable
  
    if (eleVal == "Yea"){
      return true;
    } else {
      return false
    }
  },
  // an (optional) message that can be displayed to the user if validation fails
  message: "Your text is not isYea {propVal}" 
}
```
All Kavie validatorFunctions are top down when it comes to priority. Meaning validator functions added before others will have their messages displayed first

#Sections
Sections in kavie are ways to validate different parts of a view model.

```javascript
self.value = ko.observable().extend({
  kavie:{
    required: true,
    section: "basicInfo" // assign a kavieObservable to a section
  }
});

self.valueTwo = ko.observable().extend({
    kavie: {
      required: true,
      section: "basicInfo" // assign a kavieObservable to the same section
    }
});

// some other observable in the same viewmodel
self.otherValue = ko.observable().extend({
  kavie: {
    required: true
  }
})

// validates all observables in the basicInfo section
// it will not validate the "otherValue" observable as it is not in the basicInfo section
self.isSectionValid("basicInfo"); 
```

## Variable Validation
Sections have an ability to dynamiclly turn on and off their validation. This can be helpful when validating against optional areas of a form but when enabled still want the entire form to be filled out. In this example the kavie section will only be validated if the boolean observable validate is true

```javascript
self.value = ko.observable().extend({
  kavie:{
    section: "dynamicSection"
  }
});

self.validate = ko.observable(true);
Kavie.addVariableValidation("dynamicSection", self.validate);

self.submit = function(){
  // note the use of isSectionValid in this example
  // this method must be used if using variable validation
  if (Kavie.isSectionValid("dynamicSection") { 
    console.log("All Good!");
  }
}
```
## Section Children
If you want to chain sections together you can do that as well

```javascript
self.value = ko.observalbe().extend({
  kavie: {
    section: "parent"
  }
});

self.value2 = ko.observalbe().extend({
  kavie: {
    section: "child"
  }
});

Kavie.addSectionChild("parent", "child");

self.submit = function(){
  if (Kavie.isSectionValid("parent") { 
    // both parent and child are valid
    console.log("All Good!");
  }
}
```

#Deactivate
You can also deactivate kavie after isValid()

```javascript
Kavie.deactivate(self); // will deactivate the entire viewModel
Kavie.deactivateSection("basicInfo"); // will deactivate just the basicInfo section
```

#Problems?
Thanks of taking a look at kavie. If you have any problems let me know and I would love to help you out


## Changelog
### 0.6
Revamp of the validation messages system

### 0.5
Added validation messages, added unit test for validation rules, made majority of validation rules return true if empty, renamed min and max to minLength and maxLength 

### 0.4
More new advanced features. Added section children which give you the ability to chain sections together

### 0.3
New advanced features. Validation variables allow you to dynamiclly turn off validation on different kavie sections

Removed old unused features: Kavie.add method removed, addToArray kavie property removed

### 0.2
Full rewrite of application, moved to a singelton pattern. Added sections which gave the ability to validate different areas of observalbes

### 0.1
First version. Basic implementation of ideas, bad execution
