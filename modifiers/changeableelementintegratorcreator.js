function createChangeableElementIntegrator (lib, applib) {
  'use strict';

  var BasicModifier = applib.BasicModifier;
  
  function ChangeableElementIntegrator (options) {
    BasicModifier.call(this, options);
    if (!options.profileProperty){
      throw new lib.Error('NO_PROFILE_PROPERTY_SPECIFIED', 'Profile property must be specified for ChangableElementIntegrator');
    }
  }
  lib.inherit(ChangeableElementIntegrator, BasicModifier);
  ChangeableElementIntegrator.prototype.doProcess = function (name, options, links, logic, resources) {
    var profileProperty = this.config.profileProperty, ph;
    ph = {
      source: 'datasource.'+this.config.elementdatasourcename+':data',
      target: 'element.'+this.config.changeableelementcontainername+':' + profileProperty
    };
    links.push(ph);
    logic.push({
      triggers: 'element.'+this.config.changeableelementcontainername+'!submit',
      references: '.>updateProfile',
      handler: function (upfunc, submitdata) {
        upfunc([profileProperty, submitdata[profileProperty]]);
      }
    });
  };
  ChangeableElementIntegrator.prototype.DEFAULT_CONFIG = function () {
    return {};
  }

  applib.registerModifier('SocialProfileChangeableElementIntegrator', ChangeableElementIntegrator);
}

module.exports = createChangeableElementIntegrator;
