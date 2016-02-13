# Kavie
Insanly Basic Knockout validation


##Why Kavie?
Kavie is small (minified ~2kb), easy to use, and it works

## Basic Usage

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
## Documentation
Extensive documentation at
http://pyrtio.com/opensource/kavie
