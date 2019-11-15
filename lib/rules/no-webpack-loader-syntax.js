'use strict';

var _staticRequire = require('../core/staticRequire');

var _staticRequire2 = _interopRequireDefault(_staticRequire);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function reportIfNonStandard(context, node, name) {
  if (name.indexOf('!') !== -1) {
    context.report(node, `Unexpected '!' in '${name}'. ` + 'Do not use import syntax to configure webpack loaders.');
  }
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2.default)('no-webpack-loader-syntax')
    }
  },

  create: function (context) {
    return {
      ImportDeclaration: function handleImports(node) {
        reportIfNonStandard(context, node, node.source.value);
      },
      CallExpression: function handleRequires(node) {
        if ((0, _staticRequire2.default)(node)) {
          reportIfNonStandard(context, node, node.arguments[0].value);
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby13ZWJwYWNrLWxvYWRlci1zeW50YXguanMiXSwibmFtZXMiOlsicmVwb3J0SWZOb25TdGFuZGFyZCIsImNvbnRleHQiLCJub2RlIiwibmFtZSIsImluZGV4T2YiLCJyZXBvcnQiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwidXJsIiwiY3JlYXRlIiwiSW1wb3J0RGVjbGFyYXRpb24iLCJoYW5kbGVJbXBvcnRzIiwic291cmNlIiwidmFsdWUiLCJDYWxsRXhwcmVzc2lvbiIsImhhbmRsZVJlcXVpcmVzIiwiYXJndW1lbnRzIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7O0FBQ0E7Ozs7OztBQUVBLFNBQVNBLG1CQUFULENBQTZCQyxPQUE3QixFQUFzQ0MsSUFBdEMsRUFBNENDLElBQTVDLEVBQWtEO0FBQ2hELE1BQUlBLEtBQUtDLE9BQUwsQ0FBYSxHQUFiLE1BQXNCLENBQUMsQ0FBM0IsRUFBOEI7QUFDNUJILFlBQVFJLE1BQVIsQ0FBZUgsSUFBZixFQUFzQixzQkFBcUJDLElBQUssS0FBM0IsR0FDbkIsd0RBREY7QUFHRDtBQUNGOztBQUVERyxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxTQURGO0FBRUpDLFVBQU07QUFDSkMsV0FBSyx1QkFBUSwwQkFBUjtBQUREO0FBRkYsR0FEUzs7QUFRZkMsVUFBUSxVQUFVWCxPQUFWLEVBQW1CO0FBQ3pCLFdBQU87QUFDTFkseUJBQW1CLFNBQVNDLGFBQVQsQ0FBdUJaLElBQXZCLEVBQTZCO0FBQzlDRiw0QkFBb0JDLE9BQXBCLEVBQTZCQyxJQUE3QixFQUFtQ0EsS0FBS2EsTUFBTCxDQUFZQyxLQUEvQztBQUNELE9BSEk7QUFJTEMsc0JBQWdCLFNBQVNDLGNBQVQsQ0FBd0JoQixJQUF4QixFQUE4QjtBQUM1QyxZQUFJLDZCQUFnQkEsSUFBaEIsQ0FBSixFQUEyQjtBQUN6QkYsOEJBQW9CQyxPQUFwQixFQUE2QkMsSUFBN0IsRUFBbUNBLEtBQUtpQixTQUFMLENBQWUsQ0FBZixFQUFrQkgsS0FBckQ7QUFDRDtBQUNGO0FBUkksS0FBUDtBQVVEO0FBbkJjLENBQWpCIiwiZmlsZSI6Im5vLXdlYnBhY2stbG9hZGVyLXN5bnRheC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpc1N0YXRpY1JlcXVpcmUgZnJvbSAnLi4vY29yZS9zdGF0aWNSZXF1aXJlJ1xyXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJ1xyXG5cclxuZnVuY3Rpb24gcmVwb3J0SWZOb25TdGFuZGFyZChjb250ZXh0LCBub2RlLCBuYW1lKSB7XHJcbiAgaWYgKG5hbWUuaW5kZXhPZignIScpICE9PSAtMSkge1xyXG4gICAgY29udGV4dC5yZXBvcnQobm9kZSwgYFVuZXhwZWN0ZWQgJyEnIGluICcke25hbWV9Jy4gYCArXHJcbiAgICAgICdEbyBub3QgdXNlIGltcG9ydCBzeW50YXggdG8gY29uZmlndXJlIHdlYnBhY2sgbG9hZGVycy4nXHJcbiAgICApXHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAncHJvYmxlbScsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8td2VicGFjay1sb2FkZXItc3ludGF4JyksXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogZnVuY3Rpb24gKGNvbnRleHQpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIEltcG9ydERlY2xhcmF0aW9uOiBmdW5jdGlvbiBoYW5kbGVJbXBvcnRzKG5vZGUpIHtcclxuICAgICAgICByZXBvcnRJZk5vblN0YW5kYXJkKGNvbnRleHQsIG5vZGUsIG5vZGUuc291cmNlLnZhbHVlKVxyXG4gICAgICB9LFxyXG4gICAgICBDYWxsRXhwcmVzc2lvbjogZnVuY3Rpb24gaGFuZGxlUmVxdWlyZXMobm9kZSkge1xyXG4gICAgICAgIGlmIChpc1N0YXRpY1JlcXVpcmUobm9kZSkpIHtcclxuICAgICAgICAgIHJlcG9ydElmTm9uU3RhbmRhcmQoY29udGV4dCwgbm9kZSwgbm9kZS5hcmd1bWVudHNbMF0udmFsdWUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfVxyXG4gIH0sXHJcbn1cclxuIl19