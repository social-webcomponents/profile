function createPrePreprocessors (lib, applib, templateslib, htmltemplateslib) {
  'use strict';

  var impossibleString = '';
  for (var i=0; i<32; i++) {
    impossibleString+=(Date.now()+Math.random());
  }

  require('./initcreator')(lib, applib, impossibleString);
  require('./profiledatasourcecreator')(lib, applib, impossibleString);
}

module.exports = createPrePreprocessors;
