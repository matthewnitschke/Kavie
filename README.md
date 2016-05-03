![kavie-banner](https://cloud.githubusercontent.com/assets/6363089/13166491/cafa75c2-d685-11e5-8be8-3f878a9454f7.png)

## Why Kavie?
Kavie is small (minified ~2kb), easy to use, and it works

## Installation
Simply install from npm
```
npm install kavie
```

Installation is pretty simple. Knockoutjs is the only dependency.
```html
<script src="/path/to/knockout.js"></script>
<script src="node_modules/kavie/dist/kavie.js"></script>
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

#Validation methods
You can specify observables to validate a few different ways

```javascript
// this will validate all of the kavie observables an object you pass in
Kavie.isValid(self); // self being the viewModel

// you can also add observables directly to the Kavie object
Kavie.add(observable);
Kavie.add([observable, observable, ...]);

// then when you call isValid it will validate all added observables
Kavie.isValid();

// and finally, for lazy people, you can tell the extender to add it for you
self.value = ko.observable().extend({
  kavie:{
    required: true,
    addToArray: true // tell Kavie to add this observable to the array
  }
});
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

#Deactivate
You can also deactivate kavie after isValid()

```javascript
Kavie.deactivate(self); // will deactivate the entire viewModel
Kavie.deactivate(Kavie.sections["basicInfo"]) // will deactivate just the basicInfo section
```

#Problems?
Thanks of taking a look at kavie. If you have any problems let me know and I would love to help you out
