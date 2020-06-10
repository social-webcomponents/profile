function profilizer (item) {
  return 'datasource.profile_'+item+':data';
}

function createProfileDataSourcePrePrerocessor (lib, applib, impossibleString) {
  'use strict';

  function profileUpdater (profflds) {
    var env, ds, data, profile, i;
    env = arguments[1];
    ds = env.dataSources ? env.dataSources.get('profile') : null;
    if (!ds) {
      return;
    }
    data = Array.prototype.slice.call(arguments, 2);
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
    desc.preprocessors = desc.preprocessors || {};
    desc.preprocessors.DataSource = desc.preprocessors.DataSource || [];
    desc.preprocessors.DataSource.push({
      environment: _environmentname,
      entity: {
        name: 'profile',
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
        handler: profileUpdater.bind(null, _pflds)
      });
    }
  };

  applib.registerPrePreprocessor('ProfileDataSource', ProfileDataSourcePrePreprocessor);
}
module.exports = createProfileDataSourcePrePrerocessor;
