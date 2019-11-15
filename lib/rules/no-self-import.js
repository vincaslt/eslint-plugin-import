'use strict';

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _staticRequire = require('../core/staticRequire');

var _staticRequire2 = _interopRequireDefault(_staticRequire);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isImportingSelf(context, node, requireName) {
  const filePath = context.getFilename();

  // If the input is from stdin, this test can't fail
  if (filePath !== '<text>' && filePath === (0, _resolve2.default)(requireName, context)) {
    context.report({
      node,
      message: 'Module imports itself.'
    });
  }
} /**
   * @fileOverview Forbids a module from importing itself
   * @author Gio d'Amelio
   */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid a module from importing itself',
      recommended: true,
      url: (0, _docsUrl2.default)('no-self-import')
    },

    schema: []
  },
  create: function (context) {
    return {
      ImportDeclaration(node) {
        isImportingSelf(context, node, node.source.value);
      },
      CallExpression(node) {
        if ((0, _staticRequire2.default)(node)) {
          isImportingSelf(context, node, node.arguments[0].value);
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1zZWxmLWltcG9ydC5qcyJdLCJuYW1lcyI6WyJpc0ltcG9ydGluZ1NlbGYiLCJjb250ZXh0Iiwibm9kZSIsInJlcXVpcmVOYW1lIiwiZmlsZVBhdGgiLCJnZXRGaWxlbmFtZSIsInJlcG9ydCIsIm1lc3NhZ2UiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwiZGVzY3JpcHRpb24iLCJyZWNvbW1lbmRlZCIsInVybCIsInNjaGVtYSIsImNyZWF0ZSIsIkltcG9ydERlY2xhcmF0aW9uIiwic291cmNlIiwidmFsdWUiLCJDYWxsRXhwcmVzc2lvbiIsImFyZ3VtZW50cyJdLCJtYXBwaW5ncyI6Ijs7QUFLQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLFNBQVNBLGVBQVQsQ0FBeUJDLE9BQXpCLEVBQWtDQyxJQUFsQyxFQUF3Q0MsV0FBeEMsRUFBcUQ7QUFDbkQsUUFBTUMsV0FBV0gsUUFBUUksV0FBUixFQUFqQjs7QUFFQTtBQUNBLE1BQUlELGFBQWEsUUFBYixJQUF5QkEsYUFBYSx1QkFBUUQsV0FBUixFQUFxQkYsT0FBckIsQ0FBMUMsRUFBeUU7QUFDdkVBLFlBQVFLLE1BQVIsQ0FBZTtBQUNYSixVQURXO0FBRVhLLGVBQVM7QUFGRSxLQUFmO0FBSUQ7QUFDRixDLENBbkJEOzs7OztBQXFCQUMsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pDLFVBQU0sU0FERjtBQUVKQyxVQUFNO0FBQ0pDLG1CQUFhLHVDQURUO0FBRUpDLG1CQUFhLElBRlQ7QUFHSkMsV0FBSyx1QkFBUSxnQkFBUjtBQUhELEtBRkY7O0FBUUpDLFlBQVE7QUFSSixHQURTO0FBV2ZDLFVBQVEsVUFBVWhCLE9BQVYsRUFBbUI7QUFDekIsV0FBTztBQUNMaUIsd0JBQWtCaEIsSUFBbEIsRUFBd0I7QUFDdEJGLHdCQUFnQkMsT0FBaEIsRUFBeUJDLElBQXpCLEVBQStCQSxLQUFLaUIsTUFBTCxDQUFZQyxLQUEzQztBQUNELE9BSEk7QUFJTEMscUJBQWVuQixJQUFmLEVBQXFCO0FBQ25CLFlBQUksNkJBQWdCQSxJQUFoQixDQUFKLEVBQTJCO0FBQ3pCRiwwQkFBZ0JDLE9BQWhCLEVBQXlCQyxJQUF6QixFQUErQkEsS0FBS29CLFNBQUwsQ0FBZSxDQUFmLEVBQWtCRixLQUFqRDtBQUNEO0FBQ0Y7QUFSSSxLQUFQO0FBVUQ7QUF0QmMsQ0FBakIiLCJmaWxlIjoibm8tc2VsZi1pbXBvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGZpbGVPdmVydmlldyBGb3JiaWRzIGEgbW9kdWxlIGZyb20gaW1wb3J0aW5nIGl0c2VsZlxyXG4gKiBAYXV0aG9yIEdpbyBkJ0FtZWxpb1xyXG4gKi9cclxuXHJcbmltcG9ydCByZXNvbHZlIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvcmVzb2x2ZSdcclxuaW1wb3J0IGlzU3RhdGljUmVxdWlyZSBmcm9tICcuLi9jb3JlL3N0YXRpY1JlcXVpcmUnXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG5mdW5jdGlvbiBpc0ltcG9ydGluZ1NlbGYoY29udGV4dCwgbm9kZSwgcmVxdWlyZU5hbWUpIHtcclxuICBjb25zdCBmaWxlUGF0aCA9IGNvbnRleHQuZ2V0RmlsZW5hbWUoKVxyXG5cclxuICAvLyBJZiB0aGUgaW5wdXQgaXMgZnJvbSBzdGRpbiwgdGhpcyB0ZXN0IGNhbid0IGZhaWxcclxuICBpZiAoZmlsZVBhdGggIT09ICc8dGV4dD4nICYmIGZpbGVQYXRoID09PSByZXNvbHZlKHJlcXVpcmVOYW1lLCBjb250ZXh0KSkge1xyXG4gICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgIG5vZGUsXHJcbiAgICAgICAgbWVzc2FnZTogJ01vZHVsZSBpbXBvcnRzIGl0c2VsZi4nLFxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdwcm9ibGVtJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgZGVzY3JpcHRpb246ICdGb3JiaWQgYSBtb2R1bGUgZnJvbSBpbXBvcnRpbmcgaXRzZWxmJyxcclxuICAgICAgcmVjb21tZW5kZWQ6IHRydWUsXHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tc2VsZi1pbXBvcnQnKSxcclxuICAgIH0sXHJcblxyXG4gICAgc2NoZW1hOiBbXSxcclxuICB9LFxyXG4gIGNyZWF0ZTogZnVuY3Rpb24gKGNvbnRleHQpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIEltcG9ydERlY2xhcmF0aW9uKG5vZGUpIHtcclxuICAgICAgICBpc0ltcG9ydGluZ1NlbGYoY29udGV4dCwgbm9kZSwgbm9kZS5zb3VyY2UudmFsdWUpXHJcbiAgICAgIH0sXHJcbiAgICAgIENhbGxFeHByZXNzaW9uKG5vZGUpIHtcclxuICAgICAgICBpZiAoaXNTdGF0aWNSZXF1aXJlKG5vZGUpKSB7XHJcbiAgICAgICAgICBpc0ltcG9ydGluZ1NlbGYoY29udGV4dCwgbm9kZSwgbm9kZS5hcmd1bWVudHNbMF0udmFsdWUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfVxyXG4gIH0sXHJcbn1cclxuIl19