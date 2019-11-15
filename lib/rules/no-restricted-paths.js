'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _containsPath = require('contains-path');

var _containsPath2 = _interopRequireDefault(_containsPath);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _staticRequire = require('../core/staticRequire');

var _staticRequire2 = _interopRequireDefault(_staticRequire);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2.default)('no-restricted-paths')
    },

    schema: [{
      type: 'object',
      properties: {
        zones: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              target: { type: 'string' },
              from: { type: 'string' }
            },
            additionalProperties: false
          }
        },
        basePath: { type: 'string' }
      },
      additionalProperties: false
    }]
  },

  create: function noRestrictedPaths(context) {
    const options = context.options[0] || {};
    const restrictedPaths = options.zones || [];
    const basePath = options.basePath || process.cwd();
    const currentFilename = context.getFilename();
    const matchingZones = restrictedPaths.filter(zone => {
      const targetPath = _path2.default.resolve(basePath, zone.target);

      return (0, _containsPath2.default)(currentFilename, targetPath);
    });

    function checkForRestrictedImportPath(importPath, node) {
      const absoluteImportPath = (0, _resolve2.default)(importPath, context);

      if (!absoluteImportPath) {
        return;
      }

      matchingZones.forEach(zone => {
        const absoluteFrom = _path2.default.resolve(basePath, zone.from);

        if ((0, _containsPath2.default)(absoluteImportPath, absoluteFrom)) {
          context.report({
            node,
            message: `Unexpected path "${importPath}" imported in restricted zone.`
          });
        }
      });
    }

    return {
      ImportDeclaration(node) {
        checkForRestrictedImportPath(node.source.value, node.source);
      },
      CallExpression(node) {
        if ((0, _staticRequire2.default)(node)) {
          var _node$arguments = _slicedToArray(node.arguments, 1);

          const firstArgument = _node$arguments[0];


          checkForRestrictedImportPath(firstArgument.value, firstArgument);
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1yZXN0cmljdGVkLXBhdGhzLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJ1cmwiLCJzY2hlbWEiLCJwcm9wZXJ0aWVzIiwiem9uZXMiLCJtaW5JdGVtcyIsIml0ZW1zIiwidGFyZ2V0IiwiZnJvbSIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwiYmFzZVBhdGgiLCJjcmVhdGUiLCJub1Jlc3RyaWN0ZWRQYXRocyIsImNvbnRleHQiLCJvcHRpb25zIiwicmVzdHJpY3RlZFBhdGhzIiwicHJvY2VzcyIsImN3ZCIsImN1cnJlbnRGaWxlbmFtZSIsImdldEZpbGVuYW1lIiwibWF0Y2hpbmdab25lcyIsImZpbHRlciIsInpvbmUiLCJ0YXJnZXRQYXRoIiwicGF0aCIsInJlc29sdmUiLCJjaGVja0ZvclJlc3RyaWN0ZWRJbXBvcnRQYXRoIiwiaW1wb3J0UGF0aCIsIm5vZGUiLCJhYnNvbHV0ZUltcG9ydFBhdGgiLCJmb3JFYWNoIiwiYWJzb2x1dGVGcm9tIiwicmVwb3J0IiwibWVzc2FnZSIsIkltcG9ydERlY2xhcmF0aW9uIiwic291cmNlIiwidmFsdWUiLCJDYWxsRXhwcmVzc2lvbiIsImFyZ3VtZW50cyIsImZpcnN0QXJndW1lbnQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQUEsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pDLFVBQU0sU0FERjtBQUVKQyxVQUFNO0FBQ0pDLFdBQUssdUJBQVEscUJBQVI7QUFERCxLQUZGOztBQU1KQyxZQUFRLENBQ047QUFDRUgsWUFBTSxRQURSO0FBRUVJLGtCQUFZO0FBQ1ZDLGVBQU87QUFDTEwsZ0JBQU0sT0FERDtBQUVMTSxvQkFBVSxDQUZMO0FBR0xDLGlCQUFPO0FBQ0xQLGtCQUFNLFFBREQ7QUFFTEksd0JBQVk7QUFDVkksc0JBQVEsRUFBRVIsTUFBTSxRQUFSLEVBREU7QUFFVlMsb0JBQU0sRUFBRVQsTUFBTSxRQUFSO0FBRkksYUFGUDtBQU1MVSxrQ0FBc0I7QUFOakI7QUFIRixTQURHO0FBYVZDLGtCQUFVLEVBQUVYLE1BQU0sUUFBUjtBQWJBLE9BRmQ7QUFpQkVVLDRCQUFzQjtBQWpCeEIsS0FETTtBQU5KLEdBRFM7O0FBOEJmRSxVQUFRLFNBQVNDLGlCQUFULENBQTJCQyxPQUEzQixFQUFvQztBQUMxQyxVQUFNQyxVQUFVRCxRQUFRQyxPQUFSLENBQWdCLENBQWhCLEtBQXNCLEVBQXRDO0FBQ0EsVUFBTUMsa0JBQWtCRCxRQUFRVixLQUFSLElBQWlCLEVBQXpDO0FBQ0EsVUFBTU0sV0FBV0ksUUFBUUosUUFBUixJQUFvQk0sUUFBUUMsR0FBUixFQUFyQztBQUNBLFVBQU1DLGtCQUFrQkwsUUFBUU0sV0FBUixFQUF4QjtBQUNBLFVBQU1DLGdCQUFnQkwsZ0JBQWdCTSxNQUFoQixDQUF3QkMsSUFBRCxJQUFVO0FBQ3JELFlBQU1DLGFBQWFDLGVBQUtDLE9BQUwsQ0FBYWYsUUFBYixFQUF1QlksS0FBS2YsTUFBNUIsQ0FBbkI7O0FBRUEsYUFBTyw0QkFBYVcsZUFBYixFQUE4QkssVUFBOUIsQ0FBUDtBQUNELEtBSnFCLENBQXRCOztBQU1BLGFBQVNHLDRCQUFULENBQXNDQyxVQUF0QyxFQUFrREMsSUFBbEQsRUFBd0Q7QUFDcEQsWUFBTUMscUJBQXFCLHVCQUFRRixVQUFSLEVBQW9CZCxPQUFwQixDQUEzQjs7QUFFQSxVQUFJLENBQUNnQixrQkFBTCxFQUF5QjtBQUN2QjtBQUNEOztBQUVEVCxvQkFBY1UsT0FBZCxDQUF1QlIsSUFBRCxJQUFVO0FBQzlCLGNBQU1TLGVBQWVQLGVBQUtDLE9BQUwsQ0FBYWYsUUFBYixFQUF1QlksS0FBS2QsSUFBNUIsQ0FBckI7O0FBRUEsWUFBSSw0QkFBYXFCLGtCQUFiLEVBQWlDRSxZQUFqQyxDQUFKLEVBQW9EO0FBQ2xEbEIsa0JBQVFtQixNQUFSLENBQWU7QUFDYkosZ0JBRGE7QUFFYksscUJBQVUsb0JBQW1CTixVQUFXO0FBRjNCLFdBQWY7QUFJRDtBQUNGLE9BVEQ7QUFVSDs7QUFFRCxXQUFPO0FBQ0xPLHdCQUFrQk4sSUFBbEIsRUFBd0I7QUFDdEJGLHFDQUE2QkUsS0FBS08sTUFBTCxDQUFZQyxLQUF6QyxFQUFnRFIsS0FBS08sTUFBckQ7QUFDRCxPQUhJO0FBSUxFLHFCQUFlVCxJQUFmLEVBQXFCO0FBQ25CLFlBQUksNkJBQWdCQSxJQUFoQixDQUFKLEVBQTJCO0FBQUEsK0NBQ0NBLEtBQUtVLFNBRE47O0FBQUEsZ0JBQ2pCQyxhQURpQjs7O0FBR3pCYix1Q0FBNkJhLGNBQWNILEtBQTNDLEVBQWtERyxhQUFsRDtBQUNEO0FBQ0Y7QUFWSSxLQUFQO0FBWUQ7QUF4RWMsQ0FBakIiLCJmaWxlIjoibm8tcmVzdHJpY3RlZC1wYXRocy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjb250YWluc1BhdGggZnJvbSAnY29udGFpbnMtcGF0aCdcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuXHJcbmltcG9ydCByZXNvbHZlIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvcmVzb2x2ZSdcclxuaW1wb3J0IGlzU3RhdGljUmVxdWlyZSBmcm9tICcuLi9jb3JlL3N0YXRpY1JlcXVpcmUnXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAncHJvYmxlbScsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tcmVzdHJpY3RlZC1wYXRocycpLFxyXG4gICAgfSxcclxuXHJcbiAgICBzY2hlbWE6IFtcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgIHpvbmVzOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgICAgIG1pbkl0ZW1zOiAxLFxyXG4gICAgICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogeyB0eXBlOiAnc3RyaW5nJyB9LFxyXG4gICAgICAgICAgICAgICAgZnJvbTogeyB0eXBlOiAnc3RyaW5nJyB9LFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGJhc2VQYXRoOiB7IHR5cGU6ICdzdHJpbmcnIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogZnVuY3Rpb24gbm9SZXN0cmljdGVkUGF0aHMoY29udGV4dCkge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7fVxyXG4gICAgY29uc3QgcmVzdHJpY3RlZFBhdGhzID0gb3B0aW9ucy56b25lcyB8fCBbXVxyXG4gICAgY29uc3QgYmFzZVBhdGggPSBvcHRpb25zLmJhc2VQYXRoIHx8IHByb2Nlc3MuY3dkKClcclxuICAgIGNvbnN0IGN1cnJlbnRGaWxlbmFtZSA9IGNvbnRleHQuZ2V0RmlsZW5hbWUoKVxyXG4gICAgY29uc3QgbWF0Y2hpbmdab25lcyA9IHJlc3RyaWN0ZWRQYXRocy5maWx0ZXIoKHpvbmUpID0+IHtcclxuICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IHBhdGgucmVzb2x2ZShiYXNlUGF0aCwgem9uZS50YXJnZXQpXHJcblxyXG4gICAgICByZXR1cm4gY29udGFpbnNQYXRoKGN1cnJlbnRGaWxlbmFtZSwgdGFyZ2V0UGF0aClcclxuICAgIH0pXHJcblxyXG4gICAgZnVuY3Rpb24gY2hlY2tGb3JSZXN0cmljdGVkSW1wb3J0UGF0aChpbXBvcnRQYXRoLCBub2RlKSB7XHJcbiAgICAgICAgY29uc3QgYWJzb2x1dGVJbXBvcnRQYXRoID0gcmVzb2x2ZShpbXBvcnRQYXRoLCBjb250ZXh0KVxyXG5cclxuICAgICAgICBpZiAoIWFic29sdXRlSW1wb3J0UGF0aCkge1xyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtYXRjaGluZ1pvbmVzLmZvckVhY2goKHpvbmUpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGFic29sdXRlRnJvbSA9IHBhdGgucmVzb2x2ZShiYXNlUGF0aCwgem9uZS5mcm9tKVxyXG5cclxuICAgICAgICAgIGlmIChjb250YWluc1BhdGgoYWJzb2x1dGVJbXBvcnRQYXRoLCBhYnNvbHV0ZUZyb20pKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgIG1lc3NhZ2U6IGBVbmV4cGVjdGVkIHBhdGggXCIke2ltcG9ydFBhdGh9XCIgaW1wb3J0ZWQgaW4gcmVzdHJpY3RlZCB6b25lLmAsXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBJbXBvcnREZWNsYXJhdGlvbihub2RlKSB7XHJcbiAgICAgICAgY2hlY2tGb3JSZXN0cmljdGVkSW1wb3J0UGF0aChub2RlLnNvdXJjZS52YWx1ZSwgbm9kZS5zb3VyY2UpXHJcbiAgICAgIH0sXHJcbiAgICAgIENhbGxFeHByZXNzaW9uKG5vZGUpIHtcclxuICAgICAgICBpZiAoaXNTdGF0aWNSZXF1aXJlKG5vZGUpKSB7XHJcbiAgICAgICAgICBjb25zdCBbIGZpcnN0QXJndW1lbnQgXSA9IG5vZGUuYXJndW1lbnRzXHJcblxyXG4gICAgICAgICAgY2hlY2tGb3JSZXN0cmljdGVkSW1wb3J0UGF0aChmaXJzdEFyZ3VtZW50LnZhbHVlLCBmaXJzdEFyZ3VtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH1cclxuICB9LFxyXG59XHJcbiJdfQ==