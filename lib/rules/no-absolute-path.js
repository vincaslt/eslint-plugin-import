'use strict';

var _moduleVisitor = require('eslint-module-utils/moduleVisitor');

var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);

var _importType = require('../core/importType');

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('no-absolute-path')
    },
    schema: [(0, _moduleVisitor.makeOptionsSchema)()]
  },

  create: function (context) {
    function reportIfAbsolute(source) {
      if ((0, _importType.isAbsolute)(source.value)) {
        context.report(source, 'Do not import modules using an absolute path');
      }
    }

    const options = Object.assign({ esmodule: true, commonjs: true }, context.options[0]);
    return (0, _moduleVisitor2.default)(reportIfAbsolute, options);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1hYnNvbHV0ZS1wYXRoLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJ1cmwiLCJzY2hlbWEiLCJjcmVhdGUiLCJjb250ZXh0IiwicmVwb3J0SWZBYnNvbHV0ZSIsInNvdXJjZSIsInZhbHVlIiwicmVwb3J0Iiwib3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsImVzbW9kdWxlIiwiY29tbW9uanMiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7Ozs7O0FBRUFBLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKQyxVQUFNLFlBREY7QUFFSkMsVUFBTTtBQUNKQyxXQUFLLHVCQUFRLGtCQUFSO0FBREQsS0FGRjtBQUtKQyxZQUFRLENBQUUsdUNBQUY7QUFMSixHQURTOztBQVNmQyxVQUFRLFVBQVVDLE9BQVYsRUFBbUI7QUFDekIsYUFBU0MsZ0JBQVQsQ0FBMEJDLE1BQTFCLEVBQWtDO0FBQ2hDLFVBQUksNEJBQVdBLE9BQU9DLEtBQWxCLENBQUosRUFBOEI7QUFDNUJILGdCQUFRSSxNQUFSLENBQWVGLE1BQWYsRUFBdUIsOENBQXZCO0FBQ0Q7QUFDRjs7QUFFRCxVQUFNRyxVQUFVQyxPQUFPQyxNQUFQLENBQWMsRUFBRUMsVUFBVSxJQUFaLEVBQWtCQyxVQUFVLElBQTVCLEVBQWQsRUFBa0RULFFBQVFLLE9BQVIsQ0FBZ0IsQ0FBaEIsQ0FBbEQsQ0FBaEI7QUFDQSxXQUFPLDZCQUFjSixnQkFBZCxFQUFnQ0ksT0FBaEMsQ0FBUDtBQUNEO0FBbEJjLENBQWpCIiwiZmlsZSI6Im5vLWFic29sdXRlLXBhdGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9kdWxlVmlzaXRvciwgeyBtYWtlT3B0aW9uc1NjaGVtYSB9IGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvbW9kdWxlVmlzaXRvcidcclxuaW1wb3J0IHsgaXNBYnNvbHV0ZSB9IGZyb20gJy4uL2NvcmUvaW1wb3J0VHlwZSdcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCdcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgdXJsOiBkb2NzVXJsKCduby1hYnNvbHV0ZS1wYXRoJyksXHJcbiAgICB9LFxyXG4gICAgc2NoZW1hOiBbIG1ha2VPcHRpb25zU2NoZW1hKCkgXSxcclxuICB9LFxyXG5cclxuICBjcmVhdGU6IGZ1bmN0aW9uIChjb250ZXh0KSB7XHJcbiAgICBmdW5jdGlvbiByZXBvcnRJZkFic29sdXRlKHNvdXJjZSkge1xyXG4gICAgICBpZiAoaXNBYnNvbHV0ZShzb3VyY2UudmFsdWUpKSB7XHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQoc291cmNlLCAnRG8gbm90IGltcG9ydCBtb2R1bGVzIHVzaW5nIGFuIGFic29sdXRlIHBhdGgnKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oeyBlc21vZHVsZTogdHJ1ZSwgY29tbW9uanM6IHRydWUgfSwgY29udGV4dC5vcHRpb25zWzBdKVxyXG4gICAgcmV0dXJuIG1vZHVsZVZpc2l0b3IocmVwb3J0SWZBYnNvbHV0ZSwgb3B0aW9ucylcclxuICB9LFxyXG59XHJcbiJdfQ==