'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _importType = require('../core/importType');

var _importType2 = _interopRequireDefault(_importType);

var _staticRequire = require('../core/staticRequire');

var _staticRequire2 = _interopRequireDefault(_staticRequire);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('no-internal-modules')
    },

    schema: [{
      type: 'object',
      properties: {
        allow: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      },
      additionalProperties: false
    }]
  },

  create: function noReachingInside(context) {
    const options = context.options[0] || {};
    const allowRegexps = (options.allow || []).map(p => _minimatch2.default.makeRe(p));

    // test if reaching to this destination is allowed
    function reachingAllowed(importPath) {
      return allowRegexps.some(re => re.test(importPath));
    }

    // minimatch patterns are expected to use / path separators, like import
    // statements, so normalize paths to use the same
    function normalizeSep(somePath) {
      return somePath.split('\\').join('/');
    }

    // find a directory that is being reached into, but which shouldn't be
    function isReachViolation(importPath) {
      const steps = normalizeSep(importPath).split('/').reduce((acc, step) => {
        if (!step || step === '.') {
          return acc;
        } else if (step === '..') {
          return acc.slice(0, -1);
        } else {
          return acc.concat(step);
        }
      }, []);

      const nonScopeSteps = steps.filter(step => step.indexOf('@') !== 0);
      if (nonScopeSteps.length <= 1) return false;

      // before trying to resolve, see if the raw import (with relative
      // segments resolved) matches an allowed pattern
      const justSteps = steps.join('/');
      if (reachingAllowed(justSteps) || reachingAllowed(`/${justSteps}`)) return false;

      // if the import statement doesn't match directly, try to match the
      // resolved path if the import is resolvable
      const resolved = (0, _resolve2.default)(importPath, context);
      if (!resolved || reachingAllowed(normalizeSep(resolved))) return false;

      // this import was not allowed by the allowed paths, and reaches
      // so it is a violation
      return true;
    }

    function checkImportForReaching(importPath, node) {
      const potentialViolationTypes = ['parent', 'index', 'sibling', 'external', 'internal'];
      if (potentialViolationTypes.indexOf((0, _importType2.default)(importPath, context)) !== -1 && isReachViolation(importPath)) {
        context.report({
          node,
          message: `Reaching to "${importPath}" is not allowed.`
        });
      }
    }

    return {
      ImportDeclaration(node) {
        checkImportForReaching(node.source.value, node.source);
      },
      CallExpression(node) {
        if ((0, _staticRequire2.default)(node)) {
          var _node$arguments = _slicedToArray(node.arguments, 1);

          const firstArgument = _node$arguments[0];

          checkImportForReaching(firstArgument.value, firstArgument);
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1pbnRlcm5hbC1tb2R1bGVzLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJ1cmwiLCJzY2hlbWEiLCJwcm9wZXJ0aWVzIiwiYWxsb3ciLCJpdGVtcyIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwiY3JlYXRlIiwibm9SZWFjaGluZ0luc2lkZSIsImNvbnRleHQiLCJvcHRpb25zIiwiYWxsb3dSZWdleHBzIiwibWFwIiwicCIsIm1pbmltYXRjaCIsIm1ha2VSZSIsInJlYWNoaW5nQWxsb3dlZCIsImltcG9ydFBhdGgiLCJzb21lIiwicmUiLCJ0ZXN0Iiwibm9ybWFsaXplU2VwIiwic29tZVBhdGgiLCJzcGxpdCIsImpvaW4iLCJpc1JlYWNoVmlvbGF0aW9uIiwic3RlcHMiLCJyZWR1Y2UiLCJhY2MiLCJzdGVwIiwic2xpY2UiLCJjb25jYXQiLCJub25TY29wZVN0ZXBzIiwiZmlsdGVyIiwiaW5kZXhPZiIsImxlbmd0aCIsImp1c3RTdGVwcyIsInJlc29sdmVkIiwiY2hlY2tJbXBvcnRGb3JSZWFjaGluZyIsIm5vZGUiLCJwb3RlbnRpYWxWaW9sYXRpb25UeXBlcyIsInJlcG9ydCIsIm1lc3NhZ2UiLCJJbXBvcnREZWNsYXJhdGlvbiIsInNvdXJjZSIsInZhbHVlIiwiQ2FsbEV4cHJlc3Npb24iLCJhcmd1bWVudHMiLCJmaXJzdEFyZ3VtZW50Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUFBLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKQyxVQUFNLFlBREY7QUFFSkMsVUFBTTtBQUNKQyxXQUFLLHVCQUFRLHFCQUFSO0FBREQsS0FGRjs7QUFNSkMsWUFBUSxDQUNOO0FBQ0VILFlBQU0sUUFEUjtBQUVFSSxrQkFBWTtBQUNWQyxlQUFPO0FBQ0xMLGdCQUFNLE9BREQ7QUFFTE0saUJBQU87QUFD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QUEsK0NBQ0NBLEtBQUtRLFNBRE47O0FBQUEsZ0JBQ2pCQyxhQURpQjs7QUFFekJWLGlDQUF1QlUsY0FBY0gsS0FBckMsRUFBNENHLGFBQTVDO0FBQ0Q7QUFDRjtBQVRJLEtBQVA7QUFXRDtBQTdGYyxDQUFqQiIsImZpbGUiOiJuby1pbnRlcm5hbC1tb2R1bGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1pbmltYXRjaCBmcm9tICdtaW5pbWF0Y2gnXHJcblxyXG5pbXBvcnQgcmVzb2x2ZSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL3Jlc29sdmUnXHJcbmltcG9ydCBpbXBvcnRUeXBlIGZyb20gJy4uL2NvcmUvaW1wb3J0VHlwZSdcclxuaW1wb3J0IGlzU3RhdGljUmVxdWlyZSBmcm9tICcuLi9jb3JlL3N0YXRpY1JlcXVpcmUnXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8taW50ZXJuYWwtbW9kdWxlcycpLFxyXG4gICAgfSxcclxuXHJcbiAgICBzY2hlbWE6IFtcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgIGFsbG93OiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICB9LFxyXG5cclxuICBjcmVhdGU6IGZ1bmN0aW9uIG5vUmVhY2hpbmdJbnNpZGUoY29udGV4dCkge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7fVxyXG4gICAgY29uc3QgYWxsb3dSZWdleHBzID0gKG9wdGlvbnMuYWxsb3cgfHwgW10pLm1hcChwID0+IG1pbmltYXRjaC5tYWtlUmUocCkpXHJcblxyXG4gICAgLy8gdGVzdCBpZiByZWFjaGluZyB0byB0aGlzIGRlc3RpbmF0aW9uIGlzIGFsbG93ZWRcclxuICAgIGZ1bmN0aW9uIHJlYWNoaW5nQWxsb3dlZChpbXBvcnRQYXRoKSB7XHJcbiAgICAgIHJldHVybiBhbGxvd1JlZ2V4cHMuc29tZShyZSA9PiByZS50ZXN0KGltcG9ydFBhdGgpKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIG1pbmltYXRjaCBwYXR0ZXJucyBhcmUgZXhwZWN0ZWQgdG8gdXNlIC8gcGF0aCBzZXBhcmF0b3JzLCBsaWtlIGltcG9ydFxyXG4gICAgLy8gc3RhdGVtZW50cywgc28gbm9ybWFsaXplIHBhdGhzIHRvIHVzZSB0aGUgc2FtZVxyXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplU2VwKHNvbWVQYXRoKSB7XHJcbiAgICAgIHJldHVybiBzb21lUGF0aC5zcGxpdCgnXFxcXCcpLmpvaW4oJy8nKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGZpbmQgYSBkaXJlY3RvcnkgdGhhdCBpcyBiZWluZyByZWFjaGVkIGludG8sIGJ1dCB3aGljaCBzaG91bGRuJ3QgYmVcclxuICAgIGZ1bmN0aW9uIGlzUmVhY2hWaW9sYXRpb24oaW1wb3J0UGF0aCkge1xyXG4gICAgICBjb25zdCBzdGVwcyA9IG5vcm1hbGl6ZVNlcChpbXBvcnRQYXRoKVxyXG4gICAgICAgIC5zcGxpdCgnLycpXHJcbiAgICAgICAgLnJlZHVjZSgoYWNjLCBzdGVwKSA9PiB7XHJcbiAgICAgICAgICBpZiAoIXN0ZXAgfHwgc3RlcCA9PT0gJy4nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhY2NcclxuICAgICAgICAgIH0gZWxzZSBpZiAoc3RlcCA9PT0gJy4uJykge1xyXG4gICAgICAgICAgICByZXR1cm4gYWNjLnNsaWNlKDAsIC0xKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFjYy5jb25jYXQoc3RlcClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCBbXSlcclxuXHJcbiAgICAgIGNvbnN0IG5vblNjb3BlU3RlcHMgPSBzdGVwcy5maWx0ZXIoc3RlcCA9PiBzdGVwLmluZGV4T2YoJ0AnKSAhPT0gMClcclxuICAgICAgaWYgKG5vblNjb3BlU3RlcHMubGVuZ3RoIDw9IDEpIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgLy8gYmVmb3JlIHRyeWluZyB0byByZXNvbHZlLCBzZWUgaWYgdGhlIHJhdyBpbXBvcnQgKHdpdGggcmVsYXRpdmVcclxuICAgICAgLy8gc2VnbWVudHMgcmVzb2x2ZWQpIG1hdGNoZXMgYW4gYWxsb3dlZCBwYXR0ZXJuXHJcbiAgICAgIGNvbnN0IGp1c3RTdGVwcyA9IHN0ZXBzLmpvaW4oJy8nKVxyXG4gICAgICBpZiAocmVhY2hpbmdBbGxvd2VkKGp1c3RTdGVwcykgfHwgcmVhY2hpbmdBbGxvd2VkKGAvJHtqdXN0U3RlcHN9YCkpIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgLy8gaWYgdGhlIGltcG9ydCBzdGF0ZW1lbnQgZG9lc24ndCBtYXRjaCBkaXJlY3RseSwgdHJ5IHRvIG1hdGNoIHRoZVxyXG4gICAgICAvLyByZXNvbHZlZCBwYXRoIGlmIHRoZSBpbXBvcnQgaXMgcmVzb2x2YWJsZVxyXG4gICAgICBjb25zdCByZXNvbHZlZCA9IHJlc29sdmUoaW1wb3J0UGF0aCwgY29udGV4dClcclxuICAgICAgaWYgKCFyZXNvbHZlZCB8fCByZWFjaGluZ0FsbG93ZWQobm9ybWFsaXplU2VwKHJlc29sdmVkKSkpIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgLy8gdGhpcyBpbXBvcnQgd2FzIG5vdCBhbGxvd2VkIGJ5IHRoZSBhbGxvd2VkIHBhdGhzLCBhbmQgcmVhY2hlc1xyXG4gICAgICAvLyBzbyBpdCBpcyBhIHZpb2xhdGlvblxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNoZWNrSW1wb3J0Rm9yUmVhY2hpbmcoaW1wb3J0UGF0aCwgbm9kZSkge1xyXG4gICAgICBjb25zdCBwb3RlbnRpYWxWaW9sYXRpb25UeXBlcyA9IFsncGFyZW50JywgJ2luZGV4JywgJ3NpYmxpbmcnLCAnZXh0ZXJuYWwnLCAnaW50ZXJuYWwnXVxyXG4gICAgICBpZiAocG90ZW50aWFsVmlvbGF0aW9uVHlwZXMuaW5kZXhPZihpbXBvcnRUeXBlKGltcG9ydFBhdGgsIGNvbnRleHQpKSAhPT0gLTEgJiZcclxuICAgICAgICBpc1JlYWNoVmlvbGF0aW9uKGltcG9ydFBhdGgpXHJcbiAgICAgICkge1xyXG4gICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICBtZXNzYWdlOiBgUmVhY2hpbmcgdG8gXCIke2ltcG9ydFBhdGh9XCIgaXMgbm90IGFsbG93ZWQuYCxcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgSW1wb3J0RGVjbGFyYXRpb24obm9kZSkge1xyXG4gICAgICAgIGNoZWNrSW1wb3J0Rm9yUmVhY2hpbmcobm9kZS5zb3VyY2UudmFsdWUsIG5vZGUuc291cmNlKVxyXG4gICAgICB9LFxyXG4gICAgICBDYWxsRXhwcmVzc2lvbihub2RlKSB7XHJcbiAgICAgICAgaWYgKGlzU3RhdGljUmVxdWlyZShub2RlKSkge1xyXG4gICAgICAgICAgY29uc3QgWyBmaXJzdEFyZ3VtZW50IF0gPSBub2RlLmFyZ3VtZW50c1xyXG4gICAgICAgICAgY2hlY2tJbXBvcnRGb3JSZWFjaGluZyhmaXJzdEFyZ3VtZW50LnZhbHVlLCBmaXJzdEFyZ3VtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH1cclxuICB9LFxyXG59XHJcbiJdfQ==