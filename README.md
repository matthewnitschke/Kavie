![kavie-banner](https://cloud.githubusercontent.com/assets/6363089/13166491/cafa75c2-d685-11e5-8be8-3f878a9454f7.png)

## Why Kavie?
Kavie is small, easy to use, and it works

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

# More Features
Please see the [wiki](https://github.com/matthewnitschke/Kavie/wiki) for advanced features

##Problems?
Thanks of taking a look at kavie. If you have any problems let me know and I would love to help you out
