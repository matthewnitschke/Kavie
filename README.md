![kavie-banner](https://cloud.githubusercontent.com/assets/6363089/13166491/cafa75c2-d685-11e5-8be8-3f878a9454f7.png)

## Why Kavie?
Kavie is small (minified ~2kb), easy to use, and it works

## Installation
Simply copy the kavie.js file in dist into your project and reference it in your project

```html
<script src="/path/to/knockout.js"></script>
<script src="/path/to/kavie.js"></script>
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

#Validation rules
There are a few validation rules build in

```javascript
self.value = ko.observable().extend({
    kavie: {
      required: true, // [boolean] this one is obvious
      max: 3, // [int] max amount of characters: 3
      min: 2, // [int] amount of characters: 2
      date: true, // [boolean] validates dates based on js dates
      birthdate: true, // [boolean] uses date, and must be in past with persons age less than 120
      numeric: true, // [boolean] must be an integer
      regexPattern: /([A-Z])\w+/ // [regex] matches a pattern
    }
});
```

##Custom Rules
Custom rules are added as follows

```javascript
Kavie.validatorFunctions.isYea = function(propVal, eleVal){
  // propVal is the value passed in from the ko.extend()
  // eleVal is the value being passed in from the observable

  if (eleVal == "Yea"){
    return true;
  } else {
    return false
  }
}
```
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
      section: "otherInfo" // assign a kavieObservable to a different section
    }
});

self.isValid(Kavie.sections["basicInfo"]); // validate the first section
self.isValid(Kavie.sections["otherInfo"]); // validate the second section
```

## Variable Validation
Sections have an ability to dynamiclly turn on and off their validation. This can be helpful when validating against optional fileds. In this example the kavie section will only be validated if the boolean observable validate is true

```javascript
self.value = ko.observable().extend({
  kavie:{
    section: "dynamicSection"
  }
});

self.validate = ko.observable(true);
Kavie.sections["dynamicSection"].addVariableValidation(self.validate);

self.submit = function(){
  // note the use of isSectionValid in this example
  // this method must be used if using variable validation
  if (Kavie.isSectionValid("dynamicSection") { 
    console.log("All Good!");
  }
}
```


#Deactivate
You can also deactivate kavie after isValid()

```javascript
Kavie.deactivate(self); // will deactivate the entire viewModel
Kavie.deactivate(Kavie.sections["basicInfo"]) // will deactivate just the basicInfo section
```

#Problems?
Thanks of taking a look at kavie. If you have any problems let me know and I would love to help you out
