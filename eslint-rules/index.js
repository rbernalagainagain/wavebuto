'use strict';

module.exports = {
  rules: {
    'no-network-outside-submit': require('./no-network-outside-submit'),
    'validation-pure-boundary': require('./validation-pure-boundary'),
    'no-offorigin-template-resource': require('./no-offorigin-template-resource'),
    'control-has-label': require('./control-has-label'),
  },
};
