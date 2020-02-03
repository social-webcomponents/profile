function createPrePreprocessors (lib, applib, templateslib, htmltemplateslib) {
  'use strict';

  require('./initcreator')(lib, applib);
  require('./profiledatasourcecreator')(lib, applib);
}

module.exports = createPrePreprocessors;
