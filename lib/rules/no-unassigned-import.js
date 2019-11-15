'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _staticRequire = require('../core/staticRequire');

var _staticRequire2 = _interopRequireDefault(_staticRequire);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function report(context, node) {
  context.report({
    node,
    message: 'Imported module should be assigned'
  });
}

function testIsAllow(globs, filename, source) {
  if (!Array.isArray(globs)) {
    return false; // default doesn't allow any patterns
  }

  let filePath;

  if (source[0] !== '.' && source[0] !== '/') {
    // a node module
    filePath = source;
  } else {
    filePath = _path2.default.resolve(_path2.default.dirname(filename), source); // get source absolute path
  }

  return globs.find(glob => (0, _minimatch2.default)(filePath, glob) || (0, _minimatch2.default)(filePath, _path2.default.join(process.cwd(), glob))) !== undefined;
}

function create(context) {
  const options = context.options[0] || {};
  const filename = context.getFilename();
  const isAllow = source => testIsAllow(options.allow, filename, source);

  return {
    ImportDeclaration(node) {
      if (node.specifiers.length === 0 && !isAllow(node.source.value)) {
        report(context, node);
      }
    },
    ExpressionStatement(node) {
      if (node.expression.type === 'CallExpression' && (0, _staticRequire2.default)(node.expression) && !isAllow(node.expression.arguments[0].value)) {
        report(context, node.expression);
      }
    }
  };
}

module.exports = {
  create,
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('no-unassigned-import')
    },
    schema: [{
      'type': 'object',
      'properties': {
        'devDependencies': { 'type': ['boolean', 'array'] },
        'optionalDependencies': { 'type': ['boolean', 'array'] },
        'peerDependencies': { 'type': ['boolean', 'array'] },
        'allow': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        }
      },
      'additionalProperties': false
    }]
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby11bmFzc2lnbmVkLWltcG9ydC5qcyJdLCJuYW1lcyI6WyJyZXBvcnQiLCJjb250ZXh0Iiwibm9kZSIsIm1lc3NhZ2UiLCJ0ZXN0SXNBbGxvdyIsImdsb2JzIiwiZmlsZW5hbWUiLCJzb3VyY2UiLCJBcnJheSIsImlzQXJyYXkiLCJmaWxlUGF0aCIsInBhdGgiLCJyZXNvbHZlIiwiZGlybmFtZSIsImZpbmQiLCJnbG9iIiwiam9pbiIsInByb2Nlc3MiLCJjd2QiLCJ1bmRlZmluZWQiLCJjcmVhdGUiLCJvcHRpb25zIiwiZ2V0RmlsZW5hbWUiLCJpc0FsbG93IiwiYWxsb3ciLCJJbXBvcnREZWNsYXJhdGlvbiIsInNwZWNpZmllcnMiLCJsZW5ndGgiLCJ2YWx1ZSIsIkV4cHJlc3Npb25TdGF0ZW1lbnQiLCJleHByZXNzaW9uIiwidHlwZSIsImFyZ3VtZW50cyIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwiZG9jcyIsInVybCIsInNjaGVtYSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7Ozs7O0FBRUEsU0FBU0EsTUFBVCxDQUFnQkMsT0FBaEIsRUFBeUJDLElBQXpCLEVBQStCO0FBQzdCRCxVQUFRRCxNQUFSLENBQWU7QUFDYkUsUUFEYTtBQUViQyxhQUFTO0FBRkksR0FBZjtBQUlEOztBQUVELFNBQVNDLFdBQVQsQ0FBcUJDLEtBQXJCLEVBQTRCQyxRQUE1QixFQUFzQ0MsTUFBdEMsRUFBOEM7QUFDNUMsTUFBSSxDQUFDQyxNQUFNQyxPQUFOLENBQWNKLEtBQWQsQ0FBTCxFQUEyQjtBQUN6QixXQUFPLEtBQVAsQ0FEeUIsQ0FDWjtBQUNkOztBQUVELE1BQUlLLFFBQUo7O0FBRUEsTUFBSUgsT0FBTyxDQUFQLE1BQWMsR0FBZCxJQUFxQkEsT0FBTyxDQUFQLE1BQWMsR0FBdkMsRUFBNEM7QUFBRTtBQUM1Q0csZUFBV0gsTUFBWDtBQUNELEdBRkQsTUFFTztBQUNMRyxlQUFXQyxlQUFLQyxPQUFMLENBQWFELGVBQUtFLE9BQUwsQ0FBYVAsUUFBYixDQUFiLEVBQXFDQyxNQUFyQyxDQUFYLENBREssQ0FDbUQ7QUFDekQ7O0FBRUQsU0FBT0YsTUFBTVMsSUFBTixDQUFXQyxRQUNoQix5QkFBVUwsUUFBVixFQUFvQkssSUFBcEIsS0FDQSx5QkFBVUwsUUFBVixFQUFvQkMsZUFBS0ssSUFBTCxDQUFVQyxRQUFRQyxHQUFSLEVBQVYsRUFBeUJILElBQXpCLENBQXBCLENBRkssTUFHQUksU0FIUDtBQUlEOztBQUVELFNBQVNDLE1BQVQsQ0FBZ0JuQixPQUFoQixFQUF5QjtBQUN2QixRQUFNb0IsVUFBVXBCLFFBQVFvQixPQUFSLENBQWdCLENBQWhCLEtBQXNCLEVBQXRDO0FBQ0EsUUFBTWYsV0FBV0wsUUFBUXFCLFdBQVIsRUFBakI7QUFDQSxRQUFNQyxVQUFVaEIsVUFBVUgsWUFBWWlCLFFBQVFHLEtBQXBCLEVBQTJCbEIsUUFBM0IsRUFBcUNDLE1BQXJDLENBQTFCOztBQUVBLFNBQU87QUFDTGtCLHNCQUFrQnZCLElBQWxCLEVBQXdCO0FBQ3RCLFVBQUlBLEtBQUt3QixVQUFMLENBQWdCQyxNQUFoQixLQUEyQixDQUEzQixJQUFnQyxDQUFDSixRQUFRckIsS0FBS0ssTUFBTCxDQUFZcUIsS0FBcEIsQ0FBckMsRUFBaUU7QUFDL0Q1QixlQUFPQyxPQUFQLEVBQWdCQyxJQUFoQjtBQUNEO0FBQ0YsS0FMSTtBQU1MMkIsd0JBQW9CM0IsSUFBcEIsRUFBMEI7QUFDeEIsVUFBSUEsS0FBSzRCLFVBQUwsQ0FBZ0JDLElBQWhCLEtBQXlCLGdCQUF6QixJQUNGLDZCQUFnQjdCLEtBQUs0QixVQUFyQixDQURFLElBRUYsQ0FBQ1AsUUFBUXJCLEtBQUs0QixVQUFMLENBQWdCRSxTQUFoQixDQUEwQixDQUExQixFQUE2QkosS0FBckMsQ0FGSCxFQUVnRDtBQUM5QzVCLGVBQU9DLE9BQVAsRUFBZ0JDLEtBQUs0QixVQUFyQjtBQUNEO0FBQ0Y7QUFaSSxHQUFQO0FBY0Q7O0FBRURHLE9BQU9DLE9BQVAsR0FBaUI7QUFDZmQsUUFEZTtBQUVmZSxRQUFNO0FBQ0pKLFVBQU0sWUFERjtBQUVKSyxVQUFNO0FBQ0pDLFdBQUssdUJBQVEsc0JBQVI7QUFERCxLQUZGO0FBS0pDLFlBQVEsQ0FDTjtBQUNFLGNBQVEsUUFEVjtBQUVFLG9CQUFjO0FBQ1osMkJBQW1CLEVBQUUsUUFBUSxDQUFDLFNBQUQsRUFBWSxPQUFaLENBQVYsRUFEUDtBQUVaLGdDQUF3QixFQUFFLFFBQVEsQ0FBQyxTQUFELEVBQVksT0FBWixDQUFWLEVBRlo7QUFHWiw0QkFBb0IsRUFBRSxRQUFRLENBQUMsU0FBRCxFQUFZLE9BQVosQ0FBVixFQUhSO0FBSVosaUJBQVM7QUFDUCxrQkFBUSxPQUREO0FBRVAsbUJBQVM7QUFDUCxvQkFBUTtBQUREO0FBRkY7QUFKRyxPQUZoQjtBQWFFLDhCQUF3QjtBQWIxQixLQURNO0FBTEo7QUFGUyxDQUFqQiIsImZpbGUiOiJuby11bmFzc2lnbmVkLWltcG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCBtaW5pbWF0Y2ggZnJvbSAnbWluaW1hdGNoJ1xyXG5cclxuaW1wb3J0IGlzU3RhdGljUmVxdWlyZSBmcm9tICcuLi9jb3JlL3N0YXRpY1JlcXVpcmUnXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG5mdW5jdGlvbiByZXBvcnQoY29udGV4dCwgbm9kZSkge1xyXG4gIGNvbnRleHQucmVwb3J0KHtcclxuICAgIG5vZGUsXHJcbiAgICBtZXNzYWdlOiAnSW1wb3J0ZWQgbW9kdWxlIHNob3VsZCBiZSBhc3NpZ25lZCcsXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gdGVzdElzQWxsb3coZ2xvYnMsIGZpbGVuYW1lLCBzb3VyY2UpIHtcclxuICBpZiAoIUFycmF5LmlzQXJyYXkoZ2xvYnMpKSB7XHJcbiAgICByZXR1cm4gZmFsc2UgLy8gZGVmYXVsdCBkb2Vzbid0IGFsbG93IGFueSBwYXR0ZXJuc1xyXG4gIH1cclxuXHJcbiAgbGV0IGZpbGVQYXRoXHJcblxyXG4gIGlmIChzb3VyY2VbMF0gIT09ICcuJyAmJiBzb3VyY2VbMF0gIT09ICcvJykgeyAvLyBhIG5vZGUgbW9kdWxlXHJcbiAgICBmaWxlUGF0aCA9IHNvdXJjZVxyXG4gIH0gZWxzZSB7XHJcbiAgICBmaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShwYXRoLmRpcm5hbWUoZmlsZW5hbWUpLCBzb3VyY2UpIC8vIGdldCBzb3VyY2UgYWJzb2x1dGUgcGF0aFxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGdsb2JzLmZpbmQoZ2xvYiA9PiAoXHJcbiAgICBtaW5pbWF0Y2goZmlsZVBhdGgsIGdsb2IpIHx8XHJcbiAgICBtaW5pbWF0Y2goZmlsZVBhdGgsIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBnbG9iKSlcclxuICApKSAhPT0gdW5kZWZpbmVkXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZShjb250ZXh0KSB7XHJcbiAgY29uc3Qgb3B0aW9ucyA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7fVxyXG4gIGNvbnN0IGZpbGVuYW1lID0gY29udGV4dC5nZXRGaWxlbmFtZSgpXHJcbiAgY29uc3QgaXNBbGxvdyA9IHNvdXJjZSA9PiB0ZXN0SXNBbGxvdyhvcHRpb25zLmFsbG93LCBmaWxlbmFtZSwgc291cmNlKVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgSW1wb3J0RGVjbGFyYXRpb24obm9kZSkge1xyXG4gICAgICBpZiAobm9kZS5zcGVjaWZpZXJzLmxlbmd0aCA9PT0gMCAmJiAhaXNBbGxvdyhub2RlLnNvdXJjZS52YWx1ZSkpIHtcclxuICAgICAgICByZXBvcnQoY29udGV4dCwgbm9kZSlcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIEV4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSkge1xyXG4gICAgICBpZiAobm9kZS5leHByZXNzaW9uLnR5cGUgPT09ICdDYWxsRXhwcmVzc2lvbicgJiZcclxuICAgICAgICBpc1N0YXRpY1JlcXVpcmUobm9kZS5leHByZXNzaW9uKSAmJlxyXG4gICAgICAgICFpc0FsbG93KG5vZGUuZXhwcmVzc2lvbi5hcmd1bWVudHNbMF0udmFsdWUpKSB7XHJcbiAgICAgICAgcmVwb3J0KGNvbnRleHQsIG5vZGUuZXhwcmVzc2lvbilcclxuICAgICAgfVxyXG4gICAgfSxcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGNyZWF0ZSxcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tdW5hc3NpZ25lZC1pbXBvcnQnKSxcclxuICAgIH0sXHJcbiAgICBzY2hlbWE6IFtcclxuICAgICAge1xyXG4gICAgICAgICd0eXBlJzogJ29iamVjdCcsXHJcbiAgICAgICAgJ3Byb3BlcnRpZXMnOiB7XHJcbiAgICAgICAgICAnZGV2RGVwZW5kZW5jaWVzJzogeyAndHlwZSc6IFsnYm9vbGVhbicsICdhcnJheSddIH0sXHJcbiAgICAgICAgICAnb3B0aW9uYWxEZXBlbmRlbmNpZXMnOiB7ICd0eXBlJzogWydib29sZWFuJywgJ2FycmF5J10gfSxcclxuICAgICAgICAgICdwZWVyRGVwZW5kZW5jaWVzJzogeyAndHlwZSc6IFsnYm9vbGVhbicsICdhcnJheSddIH0sXHJcbiAgICAgICAgICAnYWxsb3cnOiB7XHJcbiAgICAgICAgICAgICd0eXBlJzogJ2FycmF5JyxcclxuICAgICAgICAgICAgJ2l0ZW1zJzoge1xyXG4gICAgICAgICAgICAgICd0eXBlJzogJ3N0cmluZycsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJzogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH0sXHJcbn1cclxuIl19