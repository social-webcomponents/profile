function createModifiers (lib, applib, templateslib, htmltemplateslib) {
  'use strict';

  require('./changeableelementcreator')(lib, applib, templateslib, htmltemplateslib);
  require('./changeableelementintegratorcreator')(lib, applib);
  require('./editpicturecreator')(lib, applib, templateslib, htmltemplateslib);
  require('./changeablepicturecreator')(lib, applib, templateslib, htmltemplateslib);
  require('./changeablepictureintegratorcreator')(lib, applib);
  //require('./chatwidgetcreator')(lib, applib, templateslib, htmltemplateslib);
}

module.exports = createModifiers;
