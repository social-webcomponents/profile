function createUpdater (lib, applib) {
  'use strict';

  var BasicModifier = applib.BasicModifier;

  function ProfileUpdaterModifier (options) {
    BasicModifier.call(this, options);
  }
  lib.inherit(ProfileUpdaterModifier, BasicModifier);
  ProfileUpdaterModifier.prototype.doProcess = function (name, options, links, logic, resources) {
    var prefix, triggers;
    if (!this.config) {
      console.warn('No options for ProfileUpdater!');
      return;
    }
    if (!this.config.triggers) {
      console.warn('No triggers for ProfileUpdater!', this.config);
      return;
    }
    prefix = this.config.prefix || '';
    triggers = this.config.triggers;
    if (lib.isArray(triggers)) {
      triggers.forEach(this.processTrigger.bind(this, logic, prefix));
      prefix = null;
      logic = null;
      return;
    }
    this.processTrigger(logic, triggers);
  };
  ProfileUpdaterModifier.prototype.processTrigger = function (logic, prefix, trigger) {
    var propname;
    if (!(trigger && trigger.name && trigger.property)) {
      console.warn('No name and property properties in', trigger);
      return;
    }
    propname = trigger.property;
    logic.push({
      triggers: prefix+trigger.name,
      references: 'datasource.profile, .>updateProfile',
      handler: function (profile, updproffunc, newdata) {
        var profiledata;
        if (!profile) {
          return;
        }
        profiledata = profile.get('data');
        if (!profiledata) {
          return;
        }
        if (lib.isEqual(profiledata[propname], newdata)) {
          return;
        }
        updproffunc([propname, newdata]);
      }
    });
  };

  ProfileUpdaterModifier.prototype.DEFAULT_CONFIG = function () {
    return {};
  };

  applib.registerModifier('ProfileUpdater', ProfileUpdaterModifier);
}
module.exports = createUpdater;
