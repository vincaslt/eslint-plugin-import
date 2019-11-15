'use strict';

var _moduleVisitor = require('eslint-module-utils/moduleVisitor');

var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

var _path = require('path');

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _importType = require('../core/importType');

var _importType2 = _interopRequireDefault(_importType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('no-relative-parent-imports')
    },
    schema: [(0, _moduleVisitor.makeOptionsSchema)()]
  },

  create: function noRelativePackages(context) {
    const myPath = context.getFilename();
    if (myPath === '<text>') return {}; // can't check a non-file

    function checkSourceValue(sourceNode) {
      const depPath = sourceNode.value;

      if ((0, _importType2.default)(depPath, context) === 'external') {
        // ignore packages
        return;
      }

      const absDepPath = (0, _resolve2.default)(depPath, context);

      if (!absDepPath) {
        // unable to resolve path
        return;
      }

      const relDepPath = (0, _path.relative)((0, _path.dirname)(myPath), absDepPath);

      if ((0, _importType2.default)(relDepPath, context) === 'parent') {
        context.report({
          node: sourceNode,
          message: 'Relative imports from parent directories are not allowed. ' + `Please either pass what you're importing through at runtime ` + `(dependency injection), move \`${(0, _path.basename)(myPath)}\` to same ` + `directory as \`${depPath}\` or consider making \`${depPath}\` a package.`
        });
      }
    }

    return (0, _moduleVisitor2.default)(checkSourceValue, context.options[0]);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1yZWxhdGl2ZS1wYXJlbnQtaW1wb3J0cy5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwidXJsIiwic2NoZW1hIiwiY3JlYXRlIiwibm9SZWxhdGl2ZVBhY2thZ2VzIiwiY29udGV4dCIsIm15UGF0aCIsImdldEZpbGVuYW1lIiwiY2hlY2tTb3VyY2VWYWx1ZSIsInNvdXJjZU5vZGUiLCJkZXBQYXRoIiwidmFsdWUiLCJhYnNEZXBQYXRoIiwicmVsRGVwUGF0aCIsInJlcG9ydCIsIm5vZGUiLCJtZXNzYWdlIiwib3B0aW9ucyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFFQTs7Ozs7O0FBRUFBLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKQyxVQUFNLFlBREY7QUFFSkMsVUFBTTtBQUNKQyxXQUFLLHVCQUFRLDRCQUFSO0FBREQsS0FGRjtBQUtKQyxZQUFRLENBQUMsdUNBQUQ7QUFMSixHQURTOztBQVNmQyxVQUFRLFNBQVNDLGtCQUFULENBQTRCQyxPQUE1QixFQUFxQztBQUMzQyxVQUFNQyxTQUFTRCxRQUFRRSxXQUFSLEVBQWY7QUFDQSxRQUFJRCxXQUFXLFFBQWYsRUFBeUIsT0FBTyxFQUFQLENBRmtCLENBRVI7O0FBRW5DLGFBQVNFLGdCQUFULENBQTBCQyxVQUExQixFQUFzQztBQUNwQyxZQUFNQyxVQUFVRCxXQUFXRSxLQUEzQjs7QUFFQSxVQUFJLDBCQUFXRCxPQUFYLEVBQW9CTCxPQUFwQixNQUFpQyxVQUFyQyxFQUFpRDtBQUFFO0FBQ2pEO0FBQ0Q7O0FBRUQsWUFBTU8sYUFBYSx1QkFBUUYsT0FBUixFQUFpQkwsT0FBakIsQ0FBbkI7O0FBRUEsVUFBSSxDQUFDTyxVQUFMLEVBQWlCO0FBQUU7QUFDakI7QUFDRDs7QUFFRCxZQUFNQyxhQUFhLG9CQUFTLG1CQUFRUCxNQUFSLENBQVQsRUFBMEJNLFVBQTFCLENBQW5COztBQUVBLFVBQUksMEJBQVdDLFVBQVgsRUFBdUJSLE9BQXZCLE1BQW9DLFFBQXhDLEVBQWtEO0FBQ2hEQSxnQkFBUVMsTUFBUixDQUFlO0FBQ2JDLGdCQUFNTixVQURPO0FBRWJPLG1CQUFTLCtEQUNOLDhEQURNLEdBRU4sa0NBQWlDLG9CQUFTVixNQUFULENBQWlCLGFBRjVDLEdBR04sa0JBQWlCSSxPQUFRLDJCQUEwQkEsT0FBUTtBQUxqRCxTQUFmO0FBT0Q7QUFDRjs7QUFFRCxXQUFPLDZCQUFjRixnQkFBZCxFQUFnQ0gsUUFBUVksT0FBUixDQUFnQixDQUFoQixDQUFoQyxDQUFQO0FBQ0Q7QUF4Q2MsQ0FBakIiLCJmaWxlIjoibm8tcmVsYXRpdmUtcGFyZW50LWltcG9ydHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9kdWxlVmlzaXRvciwgeyBtYWtlT3B0aW9uc1NjaGVtYSB9IGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvbW9kdWxlVmlzaXRvcidcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCdcclxuaW1wb3J0IHsgYmFzZW5hbWUsIGRpcm5hbWUsIHJlbGF0aXZlIH0gZnJvbSAncGF0aCdcclxuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJ1xyXG5cclxuaW1wb3J0IGltcG9ydFR5cGUgZnJvbSAnLi4vY29yZS9pbXBvcnRUeXBlJ1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3N1Z2dlc3Rpb24nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICB1cmw6IGRvY3NVcmwoJ25vLXJlbGF0aXZlLXBhcmVudC1pbXBvcnRzJyksXHJcbiAgICB9LFxyXG4gICAgc2NoZW1hOiBbbWFrZU9wdGlvbnNTY2hlbWEoKV0sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlOiBmdW5jdGlvbiBub1JlbGF0aXZlUGFja2FnZXMoY29udGV4dCkge1xyXG4gICAgY29uc3QgbXlQYXRoID0gY29udGV4dC5nZXRGaWxlbmFtZSgpXHJcbiAgICBpZiAobXlQYXRoID09PSAnPHRleHQ+JykgcmV0dXJuIHt9IC8vIGNhbid0IGNoZWNrIGEgbm9uLWZpbGVcclxuXHJcbiAgICBmdW5jdGlvbiBjaGVja1NvdXJjZVZhbHVlKHNvdXJjZU5vZGUpIHtcclxuICAgICAgY29uc3QgZGVwUGF0aCA9IHNvdXJjZU5vZGUudmFsdWVcclxuXHJcbiAgICAgIGlmIChpbXBvcnRUeXBlKGRlcFBhdGgsIGNvbnRleHQpID09PSAnZXh0ZXJuYWwnKSB7IC8vIGlnbm9yZSBwYWNrYWdlc1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhYnNEZXBQYXRoID0gcmVzb2x2ZShkZXBQYXRoLCBjb250ZXh0KVxyXG5cclxuICAgICAgaWYgKCFhYnNEZXBQYXRoKSB7IC8vIHVuYWJsZSB0byByZXNvbHZlIHBhdGhcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcmVsRGVwUGF0aCA9IHJlbGF0aXZlKGRpcm5hbWUobXlQYXRoKSwgYWJzRGVwUGF0aClcclxuXHJcbiAgICAgIGlmIChpbXBvcnRUeXBlKHJlbERlcFBhdGgsIGNvbnRleHQpID09PSAncGFyZW50Jykge1xyXG4gICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgIG5vZGU6IHNvdXJjZU5vZGUsXHJcbiAgICAgICAgICBtZXNzYWdlOiAnUmVsYXRpdmUgaW1wb3J0cyBmcm9tIHBhcmVudCBkaXJlY3RvcmllcyBhcmUgbm90IGFsbG93ZWQuICcgK1xyXG4gICAgICAgICAgICBgUGxlYXNlIGVpdGhlciBwYXNzIHdoYXQgeW91J3JlIGltcG9ydGluZyB0aHJvdWdoIGF0IHJ1bnRpbWUgYCArXHJcbiAgICAgICAgICAgIGAoZGVwZW5kZW5jeSBpbmplY3Rpb24pLCBtb3ZlIFxcYCR7YmFzZW5hbWUobXlQYXRoKX1cXGAgdG8gc2FtZSBgICtcclxuICAgICAgICAgICAgYGRpcmVjdG9yeSBhcyBcXGAke2RlcFBhdGh9XFxgIG9yIGNvbnNpZGVyIG1ha2luZyBcXGAke2RlcFBhdGh9XFxgIGEgcGFja2FnZS5gLFxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbW9kdWxlVmlzaXRvcihjaGVja1NvdXJjZVZhbHVlLCBjb250ZXh0Lm9wdGlvbnNbMF0pXHJcbiAgfSxcclxufVxyXG4iXX0=