var ko = require('knockout');
var expect = require('chai').expect;
var Kavie = require('../src/kavie.js')


Kavie.validatorFunctions.asyncBool = {
    async: true,
    validator: function (propVal, eleVal, callback) {
        setTimeout(function () {
            callback(eleVal == "true");
        }, propVal);
    }
}

describe('Library Tests', () => {
    beforeEach(() => {
        Kavie.reset();
    })

    it('should run basic test', () => {
        var vm = {
            v: ko.observable().extend({ kavie: { required: true } })
        }
        expect(Kavie.isValid(vm)).to.be.false;

        vm.v("asdf");
        expect(Kavie.isValid(vm)).to.be.true;

        var singleObservable = ko.observable().extend({ kavie: { required: true } });
        expect(Kavie.isValid(singleObservable)).to.be.false;
        singleObservable("asdf");
        expect(Kavie.isValid(singleObservable)).to.be.true;
    });

    it('should run basic async tests', (done) => {
        // tests a simple async boolean function
        var vm = {
            v: ko.observable().extend({ kavie: { asyncBool: 100 } })
        }

        Kavie.isValidAsync(vm).then(function (isValid) {
            expect(isValid).to.be.false;

            vm.v("true");
            Kavie.isValidAsync(vm).then(function (isValid) {
                expect(isValid).to.be.true;
                done();
            })
        });
    })

    it('should test sections', () => {
        var vm = {
            v: ko.observable("asdf").extend({ kavie: { section: "a", required: true } }),
            v2: ko.observable().extend({ kavie: { section: "b", required: true } })
        }

        expect(Kavie.isValid(vm)).to.be.false;
        expect(Kavie.isValid("a")).to.be.true;
    })

    it('should test async sections', (done) => {
        var vm = {
            v: ko.observable("true").extend({ kavie: { section: "a", asyncBool: 100 } }),
            v2: ko.observable().extend({ kavie: { section: "b", asyncBool: 500 } })
        }

        Promise.all([
            Kavie.isValidAsync(vm).then(function (isValid) {
                expect(isValid).to.be.false;
            }),
            Kavie.isValidAsync("a").then(function (isValid) {
                expect(isValid).to.be.true;
            })
        ]).then(() => done())
    })

    it('should test section children', () => {
        var vm = {
            v: ko.observable("asdf").extend({ kavie: { section: "a", required: true } }),
            v2: ko.observable().extend({ kavie: { section: "b", required: true } })
        }

        Kavie.addSectionChild("a", "b");

        expect(Kavie.isValid("a")).to.be.false;
        vm.v2("asdf");
        expect(Kavie.isValid("a")).to.be.true;
    })

    it('should test section children async', (done) => {
        var vm = {
            v: ko.observable("true").extend({ kavie: { section: "a", asyncBool: 100 } }),
            v2: ko.observable().extend({ kavie: { section: "b", asyncBool: 200 } })
        }

        Kavie.addSectionChild("a", "b");

        Kavie.isValidAsync("a").then(function (isValid) {
            expect(isValid).to.be.false;

            vm.v2("true");
            Kavie.isValidAsync("a").then(function (isValid) {
                expect(isValid).to.be.true;
                done();
            });
        });
    })

    it('should test variable validation', () => {
        var vm = {
            v: ko.observable("asdf").extend({ kavie: { section: "a", required: true } }),
            v2: ko.observable().extend({ kavie: { section: "b", required: true } }),
            validate2: ko.observable(false)
        }

        Kavie.addSectionChild("a", "b");
        Kavie.addVariableValidation("b", vm.validate2);

        expect(Kavie.isValid("a")).to.be.true;
        vm.validate2(true);
        expect(Kavie.isValid("a")).to.be.false;
    })

    it('should test variable validation async', (done) => {
        var vm = {
            v: ko.observable("true").extend({ kavie: { section: "a", asyncBool: 100 } }),
            v2: ko.observable().extend({ kavie: { section: "b", asyncBool: 100 } }),
            validate2: ko.observable(false)
        }

        Kavie.addSectionChild("a", "b");
        Kavie.addVariableValidation("b", vm.validate2);

        Kavie.isValidAsync("a").then(function (isValid) {
            expect(isValid).to.be.true;

            vm.validate2(true);

            Kavie.isValidAsync("a").then(function (isValid) {
                expect(isValid).to.be.false;
                done();
            });
        });
    })

    it('should test async and sync variables', (done) => {
        var vm = {
            v: ko.observable("true").extend({ kavie: { minLength: 10, asyncBool: 100 } })
        }

        expect(Kavie.isValid(vm)).to.be.false;

        Kavie.isValidAsync(vm).then(function (isValid) {
            expect(isValid).to.be.false;
            done();
        })
    })

    it('should test extend chaining', () => {
        var vm = {
            v: ko.observable("asdf").extend({ kavie: { required: true } })
        }

        vm.v.extend({ kavie: { minLength: 5 } });

        expect(Kavie.isValid(vm)).to.be.false;
    })

    it('should test section validator rules', () => {
        var vm = {
            v: ko.observable().extend({ kavie: { section: "test", date: true } })
        }

        Kavie.addSectionValidators("test", {
            required: true
        });

        expect(Kavie.isValid("test")).to.be.false;

        vm.v("01/01/2000");

        expect(Kavie.isValid("test")).to.be.true;
    })
})