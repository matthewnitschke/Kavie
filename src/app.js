function ViewModel(){
  var self = this;

  self.requiredValue = ko.observable().extend({
    kavie: { required: true }
  });

  self.maxValue = ko.observable().extend({
    kavie: { max: 5 }
  });

  self.minValue = ko.observable().extend({
    kavie: { min: 2 }
  });

  self.dateValue = ko.observable().extend({
    kavie: { date: true }
  });

  self.birthdateValue = ko.observable().extend({
    kavie: { birthdate: true }
  });

  self.validator = new Kavie([
    self.requiredValue, self.maxValue, self.minValue
  ]);

  self.validatorTwo = new Kavie([
    self.dateValue, self.birthdateValue
  ])


  self.numericalValue = ko.observable().extend({
    kavie:{
      numeric: true
    }})

  self.validator.addValue(self.numericalValue);

  self.submit = function(){
    if (self.validator.isValid([self.validatorTwo])){
      console.log("All good!");
    }
  }
}

function run(){
  ko.applyBindings(new ViewModel());
}
