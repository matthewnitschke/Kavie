function ViewModel(){
  var self = this;

  self.value = ko.observable("Hello").extend({
    kavie: { required: true }
  });

  self.value2 = ko.observable("Hello").extend({
    kavie: { required: true }
  });

  self.validator = new Kavie([
    self.value, self.value2
  ]);

  self.submit = function(){
    if (self.validator.isValid()){
      console.log("All good!");
    }
  }
}

function run(){
  ko.applyBindings(new ViewModel());
}
