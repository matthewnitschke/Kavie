function ViewModel(){
  var self = this;

  self.requiredValue = ko.observable().extend({
    kavie: { required: true, addToArray: true }
  });

  self.submit = function(){
    if (Kavie.isValid()){
      console.log("All good!");
    }
  }
}

function run(){
  ko.applyBindings(new ViewModel());
}
