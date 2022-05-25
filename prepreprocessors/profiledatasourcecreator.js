function profilizer (item) {
  return 'datasource.profile_'+item+':data';
}

function createProfileDataSourcePrePrerocessor (lib, applib, impossibleString) {
  'use strict';

  function profileUpdater (profdsname, profflds) {
    var env, data;
    env = arguments[2];
    data = Array.prototype.slice.call(arguments, 3);
    env.dataSources.waitFor(profdsname).then(onProfileDS.bind(null, profflds, data));
    profflds = null;
    data = null;
    //ds = env.dataSources ? env.dataSources.get('profile') : null;
  }

  function onProfileDS (profflds, data, ds) {
    var profile, i;
    if (!ds) {
      return;
    }
    profile = {};
    /*
    console.log('profileUpdater!');
    console.log('profile fields', profflds);
    console.log('datasource', ds);
    console.log('data', data);
    */
    for (i=0; i<profflds.length; i++) {
      if (data[i] === profflds[i]+impossibleString) {
        //console.log('no can do', profflds[i]);
        return;
      }
      profile[profflds[i]] = data[i];
    }
    ds.setData(profile);
  }

  var BasicProcessor = applib.BasicProcessor;

  function ProfileDataSourcePrePreprocessor () {
    BasicProcessor.call(this);
  }
  lib.inherit(ProfileDataSourcePrePreprocessor, BasicProcessor);
  ProfileDataSourcePrePreprocessor.prototype.process = function (desc) {
    var _environmentname = this.config.environment;
    var _pflds = this.config.profilefields;
    var _pfdsn = this.config.profiledatasourcename || 'profile';
    desc.preprocessors = desc.preprocessors || {};
    desc.preprocessors.DataSource = desc.preprocessors.DataSource || [];
    desc.preprocessors.DataSource.push({
      environment: _environmentname,
      entity: {
        name: _pfdsn,
        type: 'jsdata',
        options: {
          data: null
        }
      }
    });
    if (lib.isArray(_pflds) && _pflds.length>0) {
      var tstr = _pflds.map(profilizer).join(',');
      console.log('triggers?', tstr);
      desc.logic = desc.logic || [];
      desc.logic.push({
        triggers:tstr,
        references: 'environment.'+_environmentname,
        handler: profileUpdater.bind(null, _pfdsn, _pflds)
      });
    }
    _pfdsn = null;
    _pflds = null;
  };

  applib.registerPrePreprocessor('ProfileDataSource', ProfileDataSourcePrePreprocessor);
}
module.exports = createProfileDataSourcePrePrerocessor;
