function createModifiers (lib, applib, templateslib, htmltemplateslib) {
  'use strict';

  require('./updatercreator')(lib, applib);
  //require('./changeableelementcreator')(lib, applib, templateslib, htmltemplateslib);
  //require('./changeableelementintegratorcreator')(lib, applib);
  require('./editpicturecreator')(lib, applib, templateslib, htmltemplateslib);
  require('./changeablepicturecreator')(lib, applib, templateslib, htmltemplateslib);
  require('./changeablepictureintegratorcreator')(lib, applib);
}

module.exports = createModifiers;
