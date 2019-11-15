'use strict';

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  meta: {
    type: 'suggestion',
    docs: { url: (0, _docsUrl2.default)('no-named-export') }
  },

  create(context) {
    // ignore non-modules
    if (context.parserOptions.sourceType !== 'module') {
      return {};
    }

    const message = 'Named exports are not allowed.';

    return {
      ExportAllDeclaration(node) {
        context.report({ node, message });
      },

      ExportNamedDeclaration(node) {
        if (node.specifiers.length === 0) {
          return context.report({ node, message });
        }

        const someNamed = node.specifiers.some(specifier => specifier.exported.name !== 'default');
        if (someNamed) {
          context.report({ node, message });
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1uYW1lZC1leHBvcnQuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsInVybCIsImNyZWF0ZSIsImNvbnRleHQiLCJwYXJzZXJPcHRpb25zIiwic291cmNlVHlwZSIsIm1lc3NhZ2UiLCJFeHBvcnRBbGxEZWNsYXJhdGlvbiIsIm5vZGUiLCJyZXBvcnQiLCJFeHBvcnROYW1lZERlY2xhcmF0aW9uIiwic3BlY2lmaWVycyIsImxlbmd0aCIsInNvbWVOYW1lZCIsInNvbWUiLCJzcGVjaWZpZXIiLCJleHBvcnRlZCIsIm5hbWUiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztBQUVBQSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxZQURGO0FBRUpDLFVBQU0sRUFBRUMsS0FBSyx1QkFBUSxpQkFBUixDQUFQO0FBRkYsR0FEUzs7QUFNZkMsU0FBT0MsT0FBUCxFQUFnQjtBQUNkO0FBQ0EsUUFBSUEsUUFBUUMsYUFBUixDQUFzQkMsVUFBdEIsS0FBcUMsUUFBekMsRUFBbUQ7QUFDakQsYUFBTyxFQUFQO0FBQ0Q7O0FBRUQsVUFBTUMsVUFBVSxnQ0FBaEI7O0FBRUEsV0FBTztBQUNMQywyQkFBcUJDLElBQXJCLEVBQTJCO0FBQ3pCTCxnQkFBUU0sTUFBUixDQUFlLEVBQUNELElBQUQsRUFBT0YsT0FBUCxFQUFmO0FBQ0QsT0FISTs7QUFLTEksNkJBQXVCRixJQUF2QixFQUE2QjtBQUMzQixZQUFJQSxLQUFLRyxVQUFMLENBQWdCQyxNQUFoQixLQUEyQixDQUEvQixFQUFrQztBQUNoQyxpQkFBT1QsUUFBUU0sTUFBUixDQUFlLEVBQUNELElBQUQsRUFBT0YsT0FBUCxFQUFmLENBQVA7QUFDRDs7QUFFRCxjQUFNTyxZQUFZTCxLQUFLRyxVQUFMLENBQWdCRyxJQUFoQixDQUFxQkMsYUFBYUEsVUFBVUMsUUFBVixDQUFtQkMsSUFBbkIsS0FBNEIsU0FBOUQsQ0FBbEI7QUFDQSxZQUFJSixTQUFKLEVBQWU7QUFDYlYsa0JBQVFNLE1BQVIsQ0FBZSxFQUFDRCxJQUFELEVBQU9GLE9BQVAsRUFBZjtBQUNEO0FBQ0Y7QUFkSSxLQUFQO0FBZ0JEO0FBOUJjLENBQWpCIiwiZmlsZSI6Im5vLW5hbWVkLWV4cG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7IHVybDogZG9jc1VybCgnbm8tbmFtZWQtZXhwb3J0JykgfSxcclxuICB9LFxyXG5cclxuICBjcmVhdGUoY29udGV4dCkge1xyXG4gICAgLy8gaWdub3JlIG5vbi1tb2R1bGVzXHJcbiAgICBpZiAoY29udGV4dC5wYXJzZXJPcHRpb25zLnNvdXJjZVR5cGUgIT09ICdtb2R1bGUnKSB7XHJcbiAgICAgIHJldHVybiB7fVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1lc3NhZ2UgPSAnTmFtZWQgZXhwb3J0cyBhcmUgbm90IGFsbG93ZWQuJ1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIEV4cG9ydEFsbERlY2xhcmF0aW9uKG5vZGUpIHtcclxuICAgICAgICBjb250ZXh0LnJlcG9ydCh7bm9kZSwgbWVzc2FnZX0pXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBFeHBvcnROYW1lZERlY2xhcmF0aW9uKG5vZGUpIHtcclxuICAgICAgICBpZiAobm9kZS5zcGVjaWZpZXJzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIGNvbnRleHQucmVwb3J0KHtub2RlLCBtZXNzYWdlfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNvbWVOYW1lZCA9IG5vZGUuc3BlY2lmaWVycy5zb21lKHNwZWNpZmllciA9PiBzcGVjaWZpZXIuZXhwb3J0ZWQubmFtZSAhPT0gJ2RlZmF1bHQnKVxyXG4gICAgICAgIGlmIChzb21lTmFtZWQpIHtcclxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtub2RlLCBtZXNzYWdlfSlcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9XHJcbiAgfSxcclxufVxyXG4iXX0=