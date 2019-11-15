'use strict';

var _unambiguous = require('eslint-module-utils/unambiguous');

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @fileOverview Report modules that could parse incorrectly as scripts.
 * @author Ben Mosher
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('unambiguous')
    }
  },

  create: function (context) {
    // ignore non-modules
    if (context.parserOptions.sourceType !== 'module') {
      return {};
    }

    return {
      Program: function (ast) {
        if (!(0, _unambiguous.isModule)(ast)) {
          context.report({
            node: ast,
            message: 'This module could be parsed as a valid script.'
          });
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy91bmFtYmlndW91cy5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwidXJsIiwiY3JlYXRlIiwiY29udGV4dCIsInBhcnNlck9wdGlvbnMiLCJzb3VyY2VUeXBlIiwiUHJvZ3JhbSIsImFzdCIsInJlcG9ydCIsIm5vZGUiLCJtZXNzYWdlIl0sIm1hcHBpbmdzIjoiOztBQUtBOztBQUNBOzs7Ozs7QUFOQTs7Ozs7QUFRQUEsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pDLFVBQU0sWUFERjtBQUVKQyxVQUFNO0FBQ0pDLFdBQUssdUJBQVEsYUFBUjtBQUREO0FBRkYsR0FEUzs7QUFRZkMsVUFBUSxVQUFVQyxPQUFWLEVBQW1CO0FBQ3pCO0FBQ0EsUUFBSUEsUUFBUUMsYUFBUixDQUFzQkMsVUFBdEIsS0FBcUMsUUFBekMsRUFBbUQ7QUFDakQsYUFBTyxFQUFQO0FBQ0Q7O0FBRUQsV0FBTztBQUNMQyxlQUFTLFVBQVVDLEdBQVYsRUFBZTtBQUN0QixZQUFJLENBQUMsMkJBQVNBLEdBQVQsQ0FBTCxFQUFvQjtBQUNsQkosa0JBQVFLLE1BQVIsQ0FBZTtBQUNiQyxrQkFBTUYsR0FETztBQUViRyxxQkFBUztBQUZJLFdBQWY7QUFJRDtBQUNGO0FBUkksS0FBUDtBQVdEO0FBekJjLENBQWpCIiwiZmlsZSI6InVuYW1iaWd1b3VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBmaWxlT3ZlcnZpZXcgUmVwb3J0IG1vZHVsZXMgdGhhdCBjb3VsZCBwYXJzZSBpbmNvcnJlY3RseSBhcyBzY3JpcHRzLlxyXG4gKiBAYXV0aG9yIEJlbiBNb3NoZXJcclxuICovXHJcblxyXG5pbXBvcnQgeyBpc01vZHVsZSB9IGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvdW5hbWJpZ3VvdXMnXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIHVybDogZG9jc1VybCgndW5hbWJpZ3VvdXMnKSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlOiBmdW5jdGlvbiAoY29udGV4dCkge1xyXG4gICAgLy8gaWdub3JlIG5vbi1tb2R1bGVzXHJcbiAgICBpZiAoY29udGV4dC5wYXJzZXJPcHRpb25zLnNvdXJjZVR5cGUgIT09ICdtb2R1bGUnKSB7XHJcbiAgICAgIHJldHVybiB7fVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIFByb2dyYW06IGZ1bmN0aW9uIChhc3QpIHtcclxuICAgICAgICBpZiAoIWlzTW9kdWxlKGFzdCkpIHtcclxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgbm9kZTogYXN0LFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnVGhpcyBtb2R1bGUgY291bGQgYmUgcGFyc2VkIGFzIGEgdmFsaWQgc2NyaXB0LicsXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH1cclxuXHJcbiAgfSxcclxufVxyXG4iXX0=