'use strict';

var _ExportMap = require('../ExportMap');

var _ExportMap2 = _interopRequireDefault(_ExportMap);

var _importDeclaration = require('../importDeclaration');

var _importDeclaration2 = _interopRequireDefault(_importDeclaration);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2.default)('no-named-as-default')
    }
  },

  create: function (context) {
    function checkDefault(nameKey, defaultSpecifier) {
      // #566: default is a valid specifier
      if (defaultSpecifier[nameKey].name === 'default') return;

      var declaration = (0, _importDeclaration2.default)(context);

      var imports = _ExportMap2.default.get(declaration.source.value, context);
      if (imports == null) return;

      if (imports.errors.length) {
        imports.reportErrors(context, declaration);
        return;
      }

      if (imports.has('default') && imports.has(defaultSpecifier[nameKey].name)) {

        context.report(defaultSpecifier, 'Using exported name \'' + defaultSpecifier[nameKey].name + '\' as identifier for default export.');
      }
    }
    return {
      'ImportDefaultSpecifier': checkDefault.bind(null, 'local'),
      'ExportDefaultSpecifier': checkDefault.bind(null, 'exported')
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1uYW1lZC1hcy1kZWZhdWx0LmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJ1cmwiLCJjcmVhdGUiLCJjb250ZXh0IiwiY2hlY2tEZWZhdWx0IiwibmFtZUtleSIsImRlZmF1bHRTcGVjaWZpZXIiLCJuYW1lIiwiZGVjbGFyYXRpb24iLCJpbXBvcnRzIiwiRXhwb3J0cyIsImdldCIsInNvdXJjZSIsInZhbHVlIiwiZXJyb3JzIiwibGVuZ3RoIiwicmVwb3J0RXJyb3JzIiwiaGFzIiwicmVwb3J0IiwiYmluZCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBQSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxTQURGO0FBRUpDLFVBQU07QUFDSkMsV0FBSyx1QkFBUSxxQkFBUjtBQUREO0FBRkYsR0FEUzs7QUFRZkMsVUFBUSxVQUFVQyxPQUFWLEVBQW1CO0FBQ3pCLGFBQVNDLFlBQVQsQ0FBc0JDLE9BQXRCLEVBQStCQyxnQkFBL0IsRUFBaUQ7QUFDL0M7QUFDQSxVQUFJQSxpQkFBaUJELE9BQWpCLEVBQTBCRSxJQUExQixLQUFtQyxTQUF2QyxFQUFrRDs7QUFFbEQsVUFBSUMsY0FBYyxpQ0FBa0JMLE9BQWxCLENBQWxCOztBQUVBLFVBQUlNLFVBQVVDLG9CQUFRQyxHQUFSLENBQVlILFlBQVlJLE1BQVosQ0FBbUJDLEtBQS9CLEVBQXNDVixPQUF0QyxDQUFkO0FBQ0EsVUFBSU0sV0FBVyxJQUFmLEVBQXFCOztBQUVyQixVQUFJQSxRQUFRSyxNQUFSLENBQWVDLE1BQW5CLEVBQTJCO0FBQ3pCTixnQkFBUU8sWUFBUixDQUFxQmIsT0FBckIsRUFBOEJLLFdBQTlCO0FBQ0E7QUFDRDs7QUFFRCxVQUFJQyxRQUFRUSxHQUFSLENBQVksU0FBWixLQUNBUixRQUFRUSxHQUFSLENBQVlYLGlCQUFpQkQsT0FBakIsRUFBMEJFLElBQXRDLENBREosRUFDaUQ7O0FBRS9DSixnQkFBUWUsTUFBUixDQUFlWixnQkFBZixFQUNFLDJCQUEyQkEsaUJBQWlCRCxPQUFqQixFQUEwQkUsSUFBckQsR0FDQSxzQ0FGRjtBQUlEO0FBQ0Y7QUFDRCxXQUFPO0FBQ0wsZ0NBQTBCSCxhQUFhZSxJQUFiLENBQWtCLElBQWxCLEVBQXdCLE9BQXhCLENBRHJCO0FBRUwsZ0NBQTBCZixhQUFhZSxJQUFiLENBQWtCLElBQWxCLEVBQXdCLFVBQXhCO0FBRnJCLEtBQVA7QUFJRDtBQXBDYyxDQUFqQiIsImZpbGUiOiJuby1uYW1lZC1hcy1kZWZhdWx0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV4cG9ydHMgZnJvbSAnLi4vRXhwb3J0TWFwJ1xyXG5pbXBvcnQgaW1wb3J0RGVjbGFyYXRpb24gZnJvbSAnLi4vaW1wb3J0RGVjbGFyYXRpb24nXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAncHJvYmxlbScsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tbmFtZWQtYXMtZGVmYXVsdCcpLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICBjcmVhdGU6IGZ1bmN0aW9uIChjb250ZXh0KSB7XHJcbiAgICBmdW5jdGlvbiBjaGVja0RlZmF1bHQobmFtZUtleSwgZGVmYXVsdFNwZWNpZmllcikge1xyXG4gICAgICAvLyAjNTY2OiBkZWZhdWx0IGlzIGEgdmFsaWQgc3BlY2lmaWVyXHJcbiAgICAgIGlmIChkZWZhdWx0U3BlY2lmaWVyW25hbWVLZXldLm5hbWUgPT09ICdkZWZhdWx0JykgcmV0dXJuXHJcblxyXG4gICAgICB2YXIgZGVjbGFyYXRpb24gPSBpbXBvcnREZWNsYXJhdGlvbihjb250ZXh0KVxyXG5cclxuICAgICAgdmFyIGltcG9ydHMgPSBFeHBvcnRzLmdldChkZWNsYXJhdGlvbi5zb3VyY2UudmFsdWUsIGNvbnRleHQpXHJcbiAgICAgIGlmIChpbXBvcnRzID09IG51bGwpIHJldHVyblxyXG5cclxuICAgICAgaWYgKGltcG9ydHMuZXJyb3JzLmxlbmd0aCkge1xyXG4gICAgICAgIGltcG9ydHMucmVwb3J0RXJyb3JzKGNvbnRleHQsIGRlY2xhcmF0aW9uKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaW1wb3J0cy5oYXMoJ2RlZmF1bHQnKSAmJlxyXG4gICAgICAgICAgaW1wb3J0cy5oYXMoZGVmYXVsdFNwZWNpZmllcltuYW1lS2V5XS5uYW1lKSkge1xyXG5cclxuICAgICAgICBjb250ZXh0LnJlcG9ydChkZWZhdWx0U3BlY2lmaWVyLFxyXG4gICAgICAgICAgJ1VzaW5nIGV4cG9ydGVkIG5hbWUgXFwnJyArIGRlZmF1bHRTcGVjaWZpZXJbbmFtZUtleV0ubmFtZSArXHJcbiAgICAgICAgICAnXFwnIGFzIGlkZW50aWZpZXIgZm9yIGRlZmF1bHQgZXhwb3J0LicpXHJcblxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAnSW1wb3J0RGVmYXVsdFNwZWNpZmllcic6IGNoZWNrRGVmYXVsdC5iaW5kKG51bGwsICdsb2NhbCcpLFxyXG4gICAgICAnRXhwb3J0RGVmYXVsdFNwZWNpZmllcic6IGNoZWNrRGVmYXVsdC5iaW5kKG51bGwsICdleHBvcnRlZCcpLFxyXG4gICAgfVxyXG4gIH0sXHJcbn1cclxuIl19