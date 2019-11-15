'use strict';

var _ExportMap = require('../ExportMap');

var _ExportMap2 = _interopRequireDefault(_ExportMap);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2.default)('default')
    }
  },

  create: function (context) {

    function checkDefault(specifierType, node) {

      const defaultSpecifier = node.specifiers.find(specifier => specifier.type === specifierType);

      if (!defaultSpecifier) return;
      var imports = _ExportMap2.default.get(node.source.value, context);
      if (imports == null) return;

      if (imports.errors.length) {
        imports.reportErrors(context, node);
      } else if (imports.get('default') === undefined) {
        context.report({
          node: defaultSpecifier,
          message: `No default export found in imported module "${node.source.value}".`
        });
      }
    }

    return {
      'ImportDeclaration': checkDefault.bind(null, 'ImportDefaultSpecifier'),
      'ExportNamedDeclaration': checkDefault.bind(null, 'ExportDefaultSpecifier')
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9kZWZhdWx0LmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJ1cmwiLCJjcmVhdGUiLCJjb250ZXh0IiwiY2hlY2tEZWZhdWx0Iiwic3BlY2lmaWVyVHlwZSIsIm5vZGUiLCJkZWZhdWx0U3BlY2lmaWVyIiwic3BlY2lmaWVycyIsImZpbmQiLCJzcGVjaWZpZXIiLCJpbXBvcnRzIiwiRXhwb3J0cyIsImdldCIsInNvdXJjZSIsInZhbHVlIiwiZXJyb3JzIiwibGVuZ3RoIiwicmVwb3J0RXJyb3JzIiwidW5kZWZpbmVkIiwicmVwb3J0IiwibWVzc2FnZSIsImJpbmQiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7QUFDQTs7Ozs7O0FBRUFBLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKQyxVQUFNLFNBREY7QUFFSkMsVUFBTTtBQUNKQyxXQUFLLHVCQUFRLFNBQVI7QUFERDtBQUZGLEdBRFM7O0FBUWZDLFVBQVEsVUFBVUMsT0FBVixFQUFtQjs7QUFFekIsYUFBU0MsWUFBVCxDQUFzQkMsYUFBdEIsRUFBcUNDLElBQXJDLEVBQTJDOztBQUV6QyxZQUFNQyxtQkFBbUJELEtBQUtFLFVBQUwsQ0FBZ0JDLElBQWhCLENBQ3ZCQyxhQUFhQSxVQUFVWCxJQUFWLEtBQW1CTSxhQURULENBQXpCOztBQUlBLFVBQUksQ0FBQ0UsZ0JBQUwsRUFBdUI7QUFDdkIsVUFBSUksVUFBVUMsb0JBQVFDLEdBQVIsQ0FBWVAsS0FBS1EsTUFBTCxDQUFZQyxLQUF4QixFQUErQlosT0FBL0IsQ0FBZDtBQUNBLFVBQUlRLFdBQVcsSUFBZixFQUFxQjs7QUFFckIsVUFBSUEsUUFBUUssTUFBUixDQUFlQyxNQUFuQixFQUEyQjtBQUN6Qk4sZ0JBQVFPLFlBQVIsQ0FBcUJmLE9BQXJCLEVBQThCRyxJQUE5QjtBQUNELE9BRkQsTUFFTyxJQUFJSyxRQUFRRSxHQUFSLENBQVksU0FBWixNQUEyQk0sU0FBL0IsRUFBMEM7QUFDL0NoQixnQkFBUWlCLE1BQVIsQ0FBZTtBQUNiZCxnQkFBTUMsZ0JBRE87QUFFYmMsbUJBQVUsK0NBQThDZixLQUFLUSxNQUFMLENBQVlDLEtBQU07QUFGN0QsU0FBZjtBQUlEO0FBQ0Y7O0FBRUQsV0FBTztBQUNMLDJCQUFxQlgsYUFBYWtCLElBQWIsQ0FBa0IsSUFBbEIsRUFBd0Isd0JBQXhCLENBRGhCO0FBRUwsZ0NBQTBCbEIsYUFBYWtCLElBQWIsQ0FBa0IsSUFBbEIsRUFBd0Isd0JBQXhCO0FBRnJCLEtBQVA7QUFJRDtBQWxDYyxDQUFqQiIsImZpbGUiOiJkZWZhdWx0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV4cG9ydHMgZnJvbSAnLi4vRXhwb3J0TWFwJ1xyXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJ1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3Byb2JsZW0nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICB1cmw6IGRvY3NVcmwoJ2RlZmF1bHQnKSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlOiBmdW5jdGlvbiAoY29udGV4dCkge1xyXG5cclxuICAgIGZ1bmN0aW9uIGNoZWNrRGVmYXVsdChzcGVjaWZpZXJUeXBlLCBub2RlKSB7XHJcblxyXG4gICAgICBjb25zdCBkZWZhdWx0U3BlY2lmaWVyID0gbm9kZS5zcGVjaWZpZXJzLmZpbmQoXHJcbiAgICAgICAgc3BlY2lmaWVyID0+IHNwZWNpZmllci50eXBlID09PSBzcGVjaWZpZXJUeXBlXHJcbiAgICAgIClcclxuXHJcbiAgICAgIGlmICghZGVmYXVsdFNwZWNpZmllcikgcmV0dXJuXHJcbiAgICAgIHZhciBpbXBvcnRzID0gRXhwb3J0cy5nZXQobm9kZS5zb3VyY2UudmFsdWUsIGNvbnRleHQpXHJcbiAgICAgIGlmIChpbXBvcnRzID09IG51bGwpIHJldHVyblxyXG5cclxuICAgICAgaWYgKGltcG9ydHMuZXJyb3JzLmxlbmd0aCkge1xyXG4gICAgICAgIGltcG9ydHMucmVwb3J0RXJyb3JzKGNvbnRleHQsIG5vZGUpXHJcbiAgICAgIH0gZWxzZSBpZiAoaW1wb3J0cy5nZXQoJ2RlZmF1bHQnKSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgbm9kZTogZGVmYXVsdFNwZWNpZmllcixcclxuICAgICAgICAgIG1lc3NhZ2U6IGBObyBkZWZhdWx0IGV4cG9ydCBmb3VuZCBpbiBpbXBvcnRlZCBtb2R1bGUgXCIke25vZGUuc291cmNlLnZhbHVlfVwiLmAsXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICdJbXBvcnREZWNsYXJhdGlvbic6IGNoZWNrRGVmYXVsdC5iaW5kKG51bGwsICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJyksXHJcbiAgICAgICdFeHBvcnROYW1lZERlY2xhcmF0aW9uJzogY2hlY2tEZWZhdWx0LmJpbmQobnVsbCwgJ0V4cG9ydERlZmF1bHRTcGVjaWZpZXInKSxcclxuICAgIH1cclxuICB9LFxyXG59XHJcbiJdfQ==