'use strict';

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isNonExportStatement(_ref) {
  let type = _ref.type;

  return type !== 'ExportDefaultDeclaration' && type !== 'ExportNamedDeclaration' && type !== 'ExportAllDeclaration';
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('exports-last')
    }
  },

  create: function (context) {
    return {
      Program: function (_ref2) {
        let body = _ref2.body;

        const lastNonExportStatementIndex = body.reduce(function findLastIndex(acc, item, index) {
          if (isNonExportStatement(item)) {
            return index;
          }
          return acc;
        }, -1);

        if (lastNonExportStatementIndex !== -1) {
          body.slice(0, lastNonExportStatementIndex).forEach(function checkNonExport(node) {
            if (!isNonExportStatement(node)) {
              context.report({
                node,
                message: 'Export statements should appear at the end of the file'
              });
            }
          });
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9leHBvcnRzLWxhc3QuanMiXSwibmFtZXMiOlsiaXNOb25FeHBvcnRTdGF0ZW1lbnQiLCJ0eXBlIiwibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJkb2NzIiwidXJsIiwiY3JlYXRlIiwiY29udGV4dCIsIlByb2dyYW0iLCJib2R5IiwibGFzdE5vbkV4cG9ydFN0YXRlbWVudEluZGV4IiwicmVkdWNlIiwiZmluZExhc3RJbmRleCIsImFjYyIsIml0ZW0iLCJpbmRleCIsInNsaWNlIiwiZm9yRWFjaCIsImNoZWNrTm9uRXhwb3J0Iiwibm9kZSIsInJlcG9ydCIsIm1lc3NhZ2UiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztBQUVBLFNBQVNBLG9CQUFULE9BQXdDO0FBQUEsTUFBUkMsSUFBUSxRQUFSQSxJQUFROztBQUN0QyxTQUFPQSxTQUFTLDBCQUFULElBQ0xBLFNBQVMsd0JBREosSUFFTEEsU0FBUyxzQkFGWDtBQUdEOztBQUVEQyxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkgsVUFBTSxZQURGO0FBRUpJLFVBQU07QUFDSkMsV0FBSyx1QkFBUSxjQUFSO0FBREQ7QUFGRixHQURTOztBQVFmQyxVQUFRLFVBQVVDLE9BQVYsRUFBbUI7QUFDekIsV0FBTztBQUNMQyxlQUFTLGlCQUFvQjtBQUFBLFlBQVJDLElBQVEsU0FBUkEsSUFBUTs7QUFDM0IsY0FBTUMsOEJBQThCRCxLQUFLRSxNQUFMLENBQVksU0FBU0MsYUFBVCxDQUF1QkMsR0FBdkIsRUFBNEJDLElBQTVCLEVBQWtDQyxLQUFsQyxFQUF5QztBQUN2RixjQUFJaEIscUJBQXFCZSxJQUFyQixDQUFKLEVBQWdDO0FBQzlCLG1CQUFPQyxLQUFQO0FBQ0Q7QUFDRCxpQkFBT0YsR0FBUDtBQUNELFNBTG1DLEVBS2pDLENBQUMsQ0FMZ0MsQ0FBcEM7O0FBT0EsWUFBSUgsZ0NBQWdDLENBQUMsQ0FBckMsRUFBd0M7QUFDdENELGVBQUtPLEtBQUwsQ0FBVyxDQUFYLEVBQWNOLDJCQUFkLEVBQTJDTyxPQUEzQyxDQUFtRCxTQUFTQyxjQUFULENBQXdCQyxJQUF4QixFQUE4QjtBQUMvRSxnQkFBSSxDQUFDcEIscUJBQXFCb0IsSUFBckIsQ0FBTCxFQUFpQztBQUMvQlosc0JBQVFhLE1BQVIsQ0FBZTtBQUNiRCxvQkFEYTtBQUViRSx5QkFBUztBQUZJLGVBQWY7QUFJRDtBQUNGLFdBUEQ7QUFRRDtBQUNGO0FBbkJJLEtBQVA7QUFxQkQ7QUE5QmMsQ0FBakIiLCJmaWxlIjoiZXhwb3J0cy1sYXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCdcclxuXHJcbmZ1bmN0aW9uIGlzTm9uRXhwb3J0U3RhdGVtZW50KHsgdHlwZSB9KSB7XHJcbiAgcmV0dXJuIHR5cGUgIT09ICdFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24nICYmXHJcbiAgICB0eXBlICE9PSAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbicgJiZcclxuICAgIHR5cGUgIT09ICdFeHBvcnRBbGxEZWNsYXJhdGlvbidcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3N1Z2dlc3Rpb24nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICB1cmw6IGRvY3NVcmwoJ2V4cG9ydHMtbGFzdCcpLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICBjcmVhdGU6IGZ1bmN0aW9uIChjb250ZXh0KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBQcm9ncmFtOiBmdW5jdGlvbiAoeyBib2R5IH0pIHtcclxuICAgICAgICBjb25zdCBsYXN0Tm9uRXhwb3J0U3RhdGVtZW50SW5kZXggPSBib2R5LnJlZHVjZShmdW5jdGlvbiBmaW5kTGFzdEluZGV4KGFjYywgaXRlbSwgaW5kZXgpIHtcclxuICAgICAgICAgIGlmIChpc05vbkV4cG9ydFN0YXRlbWVudChpdGVtKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5kZXhcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBhY2NcclxuICAgICAgICB9LCAtMSlcclxuXHJcbiAgICAgICAgaWYgKGxhc3ROb25FeHBvcnRTdGF0ZW1lbnRJbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgIGJvZHkuc2xpY2UoMCwgbGFzdE5vbkV4cG9ydFN0YXRlbWVudEluZGV4KS5mb3JFYWNoKGZ1bmN0aW9uIGNoZWNrTm9uRXhwb3J0KG5vZGUpIHtcclxuICAgICAgICAgICAgaWYgKCFpc05vbkV4cG9ydFN0YXRlbWVudChub2RlKSkge1xyXG4gICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnRXhwb3J0IHN0YXRlbWVudHMgc2hvdWxkIGFwcGVhciBhdCB0aGUgZW5kIG9mIHRoZSBmaWxlJyxcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH1cclxuICB9LFxyXG59XHJcbiJdfQ==