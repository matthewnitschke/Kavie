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
