function ViewModel(){
  var self = this;

  self.value = ko.observable("Hello").extend({
    kavie: { birthdate: true }
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

function run(){
  ko.applyBindings(new ViewModel());
}
