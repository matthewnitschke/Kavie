![kavie-banner](https://cloud.githubusercontent.com/assets/6363089/13166491/cafa75c2-d685-11e5-8be8-3f878a9454f7.png)

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
