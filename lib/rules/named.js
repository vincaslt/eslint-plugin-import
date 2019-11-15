'use strict';

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _ExportMap = require('../ExportMap');

var _ExportMap2 = _interopRequireDefault(_ExportMap);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2.default)('named')
    }
  },

  create: function (context) {
    function checkSpecifiers(key, type, node) {
      // ignore local exports and type imports/exports
      if (node.source == null || node.importKind === 'type' || node.importKind === 'typeof' || node.exportKind === 'type') {
        return;
      }

      if (!node.specifiers.some(function (im) {
        return im.type === type;
      })) {
        return; // no named imports/exports
      }

      const imports = _ExportMap2.default.get(node.source.value, context);
      if (imports == null) return;

      if (imports.errors.length) {
        imports.reportErrors(context, node);
        return;
      }

      node.specifiers.forEach(function (im) {
        if (im.type !== type) return;

        // ignore type imports
        if (im.importKind === 'type' || im.importKind === 'typeof') return;

        const deepLookup = imports.hasDeep(im[key].name);

        if (!deepLookup.found) {
          if (deepLookup.path.length > 1) {
            const deepPath = deepLookup.path.map(i => path.relative(path.dirname(context.getFilename()), i.path)).join(' -> ');

            context.report(im[key], `${im[key].name} not found via ${deepPath}`);
          } else {
            context.report(im[key], im[key].name + ' not found in \'' + node.source.value + '\'');
          }
        }
      });
    }

    return {
      'ImportDeclaration': checkSpecifiers.bind(null, 'imported', 'ImportSpecifier'),

      'ExportNamedDeclaration': checkSpecifiers.bind(null, 'local', 'ExportSpecifier')
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uYW1lZC5qcyJdLCJuYW1lcyI6WyJwYXRoIiwibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsInVybCIsImNyZWF0ZSIsImNvbnRleHQiLCJjaGVja1NwZWNpZmllcnMiLCJrZXkiLCJub2RlIiwic291cmNlIiwiaW1wb3J0S2luZCIsImV4cG9ydEtpbmQiLCJzcGVjaWZpZXJzIiwic29tZSIsImltIiwiaW1wb3J0cyIsIkV4cG9ydHMiLCJnZXQiLCJ2YWx1ZSIsImVycm9ycyIsImxlbmd0aCIsInJlcG9ydEVycm9ycyIsImZvckVhY2giLCJkZWVwTG9va3VwIiwiaGFzRGVlcCIsIm5hbWUiLCJmb3VuZCIsImRlZXBQYXRoIiwibWFwIiwiaSIsInJlbGF0aXZlIiwiZGlybmFtZSIsImdldEZpbGVuYW1lIiwiam9pbiIsInJlcG9ydCIsImJpbmQiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0lBQVlBLEk7O0FBQ1o7Ozs7QUFDQTs7Ozs7Ozs7QUFFQUMsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pDLFVBQU0sU0FERjtBQUVKQyxVQUFNO0FBQ0pDLFdBQUssdUJBQVEsT0FBUjtBQUREO0FBRkYsR0FEUzs7QUFRZkMsVUFBUSxVQUFVQyxPQUFWLEVBQW1CO0FBQ3pCLGFBQVNDLGVBQVQsQ0FBeUJDLEdBQXpCLEVBQThCTixJQUE5QixFQUFvQ08sSUFBcEMsRUFBMEM7QUFDeEM7QUFDQSxVQUFJQSxLQUFLQyxNQUFMLElBQWUsSUFBZixJQUF1QkQsS0FBS0UsVUFBTCxLQUFvQixNQUEzQyxJQUNBRixLQUFLRSxVQUFMLEtBQW9CLFFBRHBCLElBQ2lDRixLQUFLRyxVQUFMLEtBQW9CLE1BRHpELEVBQ2lFO0FBQy9EO0FBQ0Q7O0FBRUQsVUFBSSxDQUFDSCxLQUFLSSxVQUFMLENBQ0VDLElBREYsQ0FDTyxVQUFVQyxFQUFWLEVBQWM7QUFBRSxlQUFPQSxHQUFHYixJQUFILEtBQVlBLElBQW5CO0FBQXlCLE9BRGhELENBQUwsRUFDd0Q7QUFDdEQsZUFEc0QsQ0FDL0M7QUFDUjs7QUFFRCxZQUFNYyxVQUFVQyxvQkFBUUMsR0FBUixDQUFZVCxLQUFLQyxNQUFMLENBQVlTLEtBQXhCLEVBQStCYixPQUEvQixDQUFoQjtBQUNBLFVBQUlVLFdBQVcsSUFBZixFQUFxQjs7QUFFckIsVUFBSUEsUUFBUUksTUFBUixDQUFlQyxNQUFuQixFQUEyQjtBQUN6QkwsZ0JBQVFNLFlBQVIsQ0FBcUJoQixPQUFyQixFQUE4QkcsSUFBOUI7QUFDQTtBQUNEOztBQUVEQSxXQUFLSSxVQUFMLENBQWdCVSxPQUFoQixDQUF3QixVQUFVUixFQUFWLEVBQWM7QUFDcEMsWUFBSUEsR0FBR2IsSUFBSCxLQUFZQSxJQUFoQixFQUFzQjs7QUFFdEI7QUFDQSxZQUFJYSxHQUFHSixVQUFILEtBQWtCLE1BQWxCLElBQTRCSSxHQUFHSixVQUFILEtBQWtCLFFBQWxELEVBQTREOztBQUU1RCxjQUFNYSxhQUFhUixRQUFRUyxPQUFSLENBQWdCVixHQUFHUCxHQUFILEVBQVFrQixJQUF4QixDQUFuQjs7QUFFQSxZQUFJLENBQUNGLFdBQVdHLEtBQWhCLEVBQXVCO0FBQ3JCLGNBQUlILFdBQVcxQixJQUFYLENBQWdCdUIsTUFBaEIsR0FBeUIsQ0FBN0IsRUFBZ0M7QUFDOUIsa0JBQU1PLFdBQVdKLFdBQVcxQixJQUFYLENBQ2QrQixHQURjLENBQ1ZDLEtBQUtoQyxLQUFLaUMsUUFBTCxDQUFjakMsS0FBS2tDLE9BQUwsQ0FBYTFCLFFBQVEyQixXQUFSLEVBQWIsQ0FBZCxFQUFtREgsRUFBRWhDLElBQXJELENBREssRUFFZG9DLElBRmMsQ0FFVCxNQUZTLENBQWpCOztBQUlBNUIsb0JBQVE2QixNQUFSLENBQWVwQixHQUFHUCxHQUFILENBQWYsRUFDRyxHQUFFTyxHQUFHUCxHQUFILEVBQVFrQixJQUFLLGtCQUFpQkUsUUFBUyxFQUQ1QztBQUVELFdBUEQsTUFPTztBQUNMdEIsb0JBQVE2QixNQUFSLENBQWVwQixHQUFHUCxHQUFILENBQWYsRUFDRU8sR0FBR1AsR0FBSCxFQUFRa0IsSUFBUixHQUFlLGtCQUFmLEdBQW9DakIsS0FBS0MsTUFBTCxDQUFZUyxLQUFoRCxHQUF3RCxJQUQxRDtBQUVEO0FBQ0Y7QUFDRixPQXJCRDtBQXNCRDs7QUFFRCxXQUFPO0FBQ0wsMkJBQXFCWixnQkFBZ0I2QixJQUFoQixDQUFzQixJQUF0QixFQUNzQixVQUR0QixFQUVzQixpQkFGdEIsQ0FEaEI7O0FBTUwsZ0NBQTBCN0IsZ0JBQWdCNkIsSUFBaEIsQ0FBc0IsSUFBdEIsRUFDc0IsT0FEdEIsRUFFc0IsaUJBRnRCO0FBTnJCLEtBQVA7QUFZRDtBQWpFYyxDQUFqQiIsImZpbGUiOiJuYW1lZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IEV4cG9ydHMgZnJvbSAnLi4vRXhwb3J0TWFwJ1xyXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJ1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3Byb2JsZW0nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICB1cmw6IGRvY3NVcmwoJ25hbWVkJyksXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogZnVuY3Rpb24gKGNvbnRleHQpIHtcclxuICAgIGZ1bmN0aW9uIGNoZWNrU3BlY2lmaWVycyhrZXksIHR5cGUsIG5vZGUpIHtcclxuICAgICAgLy8gaWdub3JlIGxvY2FsIGV4cG9ydHMgYW5kIHR5cGUgaW1wb3J0cy9leHBvcnRzXHJcbiAgICAgIGlmIChub2RlLnNvdXJjZSA9PSBudWxsIHx8IG5vZGUuaW1wb3J0S2luZCA9PT0gJ3R5cGUnIHx8XHJcbiAgICAgICAgICBub2RlLmltcG9ydEtpbmQgPT09ICd0eXBlb2YnICB8fCBub2RlLmV4cG9ydEtpbmQgPT09ICd0eXBlJykge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIW5vZGUuc3BlY2lmaWVyc1xyXG4gICAgICAgICAgICAuc29tZShmdW5jdGlvbiAoaW0pIHsgcmV0dXJuIGltLnR5cGUgPT09IHR5cGUgfSkpIHtcclxuICAgICAgICByZXR1cm4gLy8gbm8gbmFtZWQgaW1wb3J0cy9leHBvcnRzXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGltcG9ydHMgPSBFeHBvcnRzLmdldChub2RlLnNvdXJjZS52YWx1ZSwgY29udGV4dClcclxuICAgICAgaWYgKGltcG9ydHMgPT0gbnVsbCkgcmV0dXJuXHJcblxyXG4gICAgICBpZiAoaW1wb3J0cy5lcnJvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgaW1wb3J0cy5yZXBvcnRFcnJvcnMoY29udGV4dCwgbm9kZSlcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgbm9kZS5zcGVjaWZpZXJzLmZvckVhY2goZnVuY3Rpb24gKGltKSB7XHJcbiAgICAgICAgaWYgKGltLnR5cGUgIT09IHR5cGUpIHJldHVyblxyXG5cclxuICAgICAgICAvLyBpZ25vcmUgdHlwZSBpbXBvcnRzXHJcbiAgICAgICAgaWYgKGltLmltcG9ydEtpbmQgPT09ICd0eXBlJyB8fCBpbS5pbXBvcnRLaW5kID09PSAndHlwZW9mJykgcmV0dXJuXHJcblxyXG4gICAgICAgIGNvbnN0IGRlZXBMb29rdXAgPSBpbXBvcnRzLmhhc0RlZXAoaW1ba2V5XS5uYW1lKVxyXG5cclxuICAgICAgICBpZiAoIWRlZXBMb29rdXAuZm91bmQpIHtcclxuICAgICAgICAgIGlmIChkZWVwTG9va3VwLnBhdGgubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBjb25zdCBkZWVwUGF0aCA9IGRlZXBMb29rdXAucGF0aFxyXG4gICAgICAgICAgICAgIC5tYXAoaSA9PiBwYXRoLnJlbGF0aXZlKHBhdGguZGlybmFtZShjb250ZXh0LmdldEZpbGVuYW1lKCkpLCBpLnBhdGgpKVxyXG4gICAgICAgICAgICAgIC5qb2luKCcgLT4gJylcclxuXHJcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KGltW2tleV0sXHJcbiAgICAgICAgICAgICAgYCR7aW1ba2V5XS5uYW1lfSBub3QgZm91bmQgdmlhICR7ZGVlcFBhdGh9YClcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KGltW2tleV0sXHJcbiAgICAgICAgICAgICAgaW1ba2V5XS5uYW1lICsgJyBub3QgZm91bmQgaW4gXFwnJyArIG5vZGUuc291cmNlLnZhbHVlICsgJ1xcJycpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICdJbXBvcnREZWNsYXJhdGlvbic6IGNoZWNrU3BlY2lmaWVycy5iaW5kKCBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCAnaW1wb3J0ZWQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCAnSW1wb3J0U3BlY2lmaWVyJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXHJcblxyXG4gICAgICAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbic6IGNoZWNrU3BlY2lmaWVycy5iaW5kKCBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsICdsb2NhbCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgJ0V4cG9ydFNwZWNpZmllcidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXHJcbiAgICB9XHJcblxyXG4gIH0sXHJcbn1cclxuIl19