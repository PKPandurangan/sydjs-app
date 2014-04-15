var cardTypes = {
	amex: {
		pattern: /^3[47]/,
		length: [15]
	},
	diners_club_carte_blanche: {
		pattern: /^30[0-5]/,
		length: [14]
	},
	diners_club_international: {
		pattern: /^36/,
		length: [14]
	},
	jcb: {
		pattern: /^35(2[89]|[3-8][0-9])/,
		length: [16]
	},
	laser: {
		pattern: /^(6304|630[69]|6771)/,
		length: [16, 17, 18, 19]
	},
	visa_electron: {
		pattern: /^(4026|417500|4508|4844|491(3|7))/,
		length: [16]
	},
	visa: {
		pattern: /^4/,
		length: [16]
	},
	mastercard: {
		pattern: /^5[1-5]/,
		length: [16]
	},
	maestro: {
		pattern: /^(5018|5020|5038|6304|6759|676[1-3])/,
		length: [12, 13, 14, 15, 16, 17, 18, 19]
	},
	discover: {
		pattern: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/,
		length: [16]
	}
};

var getCardType = function(number) {
	
	for (var key in cardTypes) {
		if (number.match(cardTypes[key].pattern)) {
			return key;
		}
	}
	
	return false;
	
};

var luhn = function(number) {
	
	var sum = 0,
		digits = number.split('').reverse().join('');
		
	for (var n = 0; n < digits.length; n++) {
		digit = +digits[n];
		if (n % 2) {
			digit *= 2;
			sum += ((digit < 10) ? digit : digit - 9);
		} else {
			sum += digit;
		}
	}
	
	return sum % 10 === 0;
	
}

var cleanCardNumber = function(number) {
	return (number || '').replace(/\D/g, '');
}

var validateCardNumber = function(number) {
	number = cleanCardNumber(number);
	var type = getCardType(number);
	var luhnIsValid = (type && luhn(number));
	var lengthIsValid = (type && cardTypes[type].length.indexOf(number.length) > -1);
	if (type && luhnIsValid && lengthIsValid) {
		return type;
	} else {
		return false;
	}
}