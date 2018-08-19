var ko = require('knockout');
var expect = require('chai').expect;
var Kavie = require('../src/kavie.js')

describe('Rule Tests', () => {
    it('required validator', () => {
        var required = Kavie.validatorFunctions.required.validator;

        // false checks
        expect(required(true, "")).to.be.false;
        expect(required(true, undefined)).to.be.false;
        expect(required(true, null)).to.be.false;

        // true checks
        expect(required(true, "asdf")).to.be.true;
        expect(required(true, "0")).to.be.true;
        expect(required(true, "false")).to.be.true;
        expect(required(true, false)).to.be.true;
        expect(required(true, true)).to.be.true;
    })

    it('numeric validator', () => {
        var numeric = Kavie.validatorFunctions.numeric.validator;

        // false checks
        expect(numeric(true, "a")).to.be.false;
        expect(numeric(true, "!")).to.be.false;
        expect(numeric(true, "~")).to.be.false;

        // true checks
        expect(numeric(true, "")).to.be.true;
        expect(numeric(true, "1")).to.be.true;
        expect(numeric(true, "123")).to.be.true;
    })

    it('max length validator', () => {
        var maxLength = Kavie.validatorFunctions.maxLength.validator;

        // false checks
        expect(maxLength(1, "aa")).to.be.false;
        expect(maxLength(2, "123")).to.be.false;
        expect(maxLength(3, "!@#$")).to.be.false;

        // true checks
        expect(maxLength(1, "a")).to.be.true;
        expect(maxLength(2, "12")).to.be.true;
        expect(maxLength(3, "!@#")).to.be.true;

        // msc
        expect(maxLength(1, "")).to.be.true;
        expect(maxLength(2, undefined)).to.be.true;
        expect(maxLength(3, null)).to.be.true;
    })

    it('min length validator', () => {
        var minLength = Kavie.validatorFunctions.minLength.validator;

        // false checks
        expect(minLength(3, "12")).to.be.false;
        expect(minLength(3, "as")).to.be.false;
        expect(minLength(3, "!@")).to.be.false;

        // true checks
        expect(minLength(4, "123456")).to.be.true;
        expect(minLength(4, "asdf")).to.be.true;
        expect(minLength(2, "!@#")).to.be.true;
    })

    it('matches validator', () => {
        var matches = Kavie.validatorFunctions.matches;

        // false checks
        expect(matches("asdf", "erg")).to.be.false;

        // true checks
        expect(matches("hula", "hula")).to.be.true;
    })

    it('date validator', () => {
        var date = Kavie.validatorFunctions.date.validator;

        // false checks
        expect(date(true, "ha")).to.be.false;
        expect(date(true, "97/03/2012")).to.be.false;
        expect(date(true, "1/60/2012")).to.be.false;
        expect(date(true, "1/60/23")).to.be.false;


        // tests from bugs found in pr12
        expect(date(true, "04/23/19999")).to.be.false;
        expect(date(true, "504/23/1999")).to.be.false;

        // tests from bugs found in pr13
        expect(date(true, "1/04/0000")).to.be.false;
        expect(date(true, "1/04/00")).to.be.false;


        // true checkss
        expect(date(true, "04/03/1997")).to.be.true;
        expect(date(true, "4/3/1997")).to.be.false;
        expect(date(true, "06/12/3030")).to.be.true;

        // msc
        expect(date(true, "")).to.be.true;
    })

    it('birthdate validator', () => {
        var birthdate = Kavie.validatorFunctions.birthdate.validator;

        // false checks
        expect(birthdate(true, "ha")).to.be.false;
        expect(birthdate(true, "13/03/2012")).to.be.false;
        expect(birthdate(true, "1/60/2012")).to.be.false;
        expect(birthdate(true, "1/60/23")).to.be.false;

        expect(birthdate(true, "6/12/3030")).to.be.false;
        expect(birthdate(true, "6/12/1800")).to.be.false;

        // true checkss
        expect(birthdate(true, "04/03/1997")).to.be.true;
        expect(birthdate(true, "4/3/1997")).to.be.false;

        // msc
        expect(birthdate(true, "")).to.be.true;
    })

    it('phone validator', () => {
        var phone = Kavie.validatorFunctions.phone.validator;

        // false checks
        expect(phone(true, "asd")).to.be.false;

        // true checks
        expect(phone(true, "406-999-9999")).to.be.true;

        // msc
        expect(phone(true, "")).to.be.true;
    })

    it('email validator', () => {
        var email = Kavie.validatorFunctions.email.validator;

        // false checkes
        expect(email(true, "asdf")).to.be.false;

        // true checks
        expect(email(true, "test@test.com")).to.be.true;

        // msc
        expect(email(true, "")).to.be.true;
    })

    it('regexPattern validator', () => {
        var regex = Kavie.validatorFunctions.regexPattern;

        expect(regex(/([A-Z])\w+/, "")).to.be.false;

        expect(regex(/([A-Z])\w+/, "Welcome")).to.be.true;
    })
})