(function (execlib) {
  'use strict';

  var lib = execlib.lib,
    execSuite = execlib.execSuite,
    lR = execSuite.libRegistry,
    applib = lR.get('allex_applib'),
    templateslib = lR.get('allex_templateslitelib'),
    htmltemplateslib = lR.get('allex_htmltemplateslib');

  require('./modifiers')(lib, applib, templateslib, htmltemplateslib);
  require('./prepreprocessors')(lib, applib, templateslib, htmltemplateslib);
})(ALLEX);
