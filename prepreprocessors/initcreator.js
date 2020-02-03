function createInitPrePreprocessor (lib, applib) {
  'use strict';
  var BasicProcessor = applib.BasicProcessor;

  function ProfileInitPrePreprocessor () {
    BasicProcessor.call(this);
  }
  lib.inherit(ProfileInitPrePreprocessor, BasicProcessor);
  ProfileInitPrePreprocessor.prototype.process = function (desc) {
    var _environmentname, _profilefields;
    
    _environmentname = this.config.environment;
    desc.preprocessors = desc.preprocessors || [];
    desc.preprocessors.Command = desc.preprocessors.Command || [];
    desc.preprocessors.Command.push({
      environment: _environmentname,
      entity: {
        name: 'updateProfile',
        options: {
          sink: '.',
          name: 'updateProfile'
        }
      }
    },{
      environment: _environmentname,
      entity: {
        name: 'updateProfileFromHash',
        options: {
          sink: '.',
          name: 'updateProfileFromHash'
        }
      }
    });

    _profilefields = this.config.profilefields;
    if (lib.isArray(_profilefields)) {
      desc.preprocessors.DataSource = desc.preprocessors.DataSource || [];
      desc.preprocessors.DataSource.push.apply(desc.preprocessors.DataSource, _profilefields.map(datasourcer.bind(null, _environmentname)));
    }

    this.firePrePreprocessor('ProfileDataSource', this.config, desc);

    _environmentname = null;
  };

  function datasourcer (_environmentname, profilefieldname) {
    var pn = 'profile_'+profilefieldname;
    return {
      environment: _environmentname,
      entity: {
        name: pn,
        type: 'allexstate',
        options: {
          path: pn,
          sink: '.'
        }
      }
    }
  }

  applib.registerPrePreprocessor('SocialProfileInit', ProfileInitPrePreprocessor);
}
module.exports = createInitPrePreprocessor;
