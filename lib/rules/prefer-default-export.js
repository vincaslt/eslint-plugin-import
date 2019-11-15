'use strict';

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('prefer-default-export')
    }
  },

  create: function (context) {
    let specifierExportCount = 0;
    let hasDefaultExport = false;
    let hasStarExport = false;
    let namedExportNode = null;

    function captureDeclaration(identifierOrPattern) {
      if (identifierOrPattern.type === 'ObjectPattern') {
        // recursively capture
        identifierOrPattern.properties.forEach(function (property) {
          captureDeclaration(property.value);
        });
      } else {
        // assume it's a single standard identifier
        specifierExportCount++;
      }
    }

    return {
      'ExportDefaultSpecifier': function () {
        hasDefaultExport = true;
      },

      'ExportSpecifier': function (node) {
        if (node.exported.name === 'default') {
          hasDefaultExport = true;
        } else {
          specifierExportCount++;
          namedExportNode = node;
        }
      },

      'ExportNamedDeclaration': function (node) {
        // if there are specifiers, node.declaration should be null
        if (!node.declaration) return;

        // don't warn on single type aliases, declarations, or interfaces
        if (node.exportKind === 'type') return;

        const type = node.declaration.type;


        if (type === 'TSTypeAliasDeclaration' || type === 'TypeAlias' || type === 'TSInterfaceDeclaration' || type === 'InterfaceDeclaration') {
          return;
        }

        if (node.declaration.declarations) {
          node.declaration.declarations.forEach(function (declaration) {
            captureDeclaration(declaration.id);
          });
        } else {
          // captures 'export function foo() {}' syntax
          specifierExportCount++;
        }

        namedExportNode = node;
      },

      'ExportDefaultDeclaration': function () {
        hasDefaultExport = true;
      },

      'ExportAllDeclaration': function () {
        hasStarExport = true;
      },

      'Program:exit': function () {
        if (specifierExportCount === 1 && !hasDefaultExport && !hasStarExport) {
          context.report(namedExportNode, 'Prefer default export.');
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9wcmVmZXItZGVmYXVsdC1leHBvcnQuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsInVybCIsImNyZWF0ZSIsImNvbnRleHQiLCJzcGVjaWZpZXJFeHBvcnRDb3VudCIsImhhc0RlZmF1bHRFeHBvcnQiLCJoYXNTdGFyRXhwb3J0IiwibmFtZWRFeHBvcnROb2RlIiwiY2FwdHVyZURlY2xhcmF0aW9uIiwiaWRlbnRpZmllck9yUGF0dGVybiIsInByb3BlcnRpZXMiLCJmb3JFYWNoIiwicHJvcGVydHkiLCJ2YWx1ZSIsIm5vZGUiLCJleHBvcnRlZCIsIm5hbWUiLCJkZWNsYXJhdGlvbiIsImV4cG9ydEtpbmQiLCJkZWNsYXJhdGlvbnMiLCJpZCIsInJlcG9ydCJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7Ozs7OztBQUVBQSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxZQURGO0FBRUpDLFVBQU07QUFDSkMsV0FBSyx1QkFBUSx1QkFBUjtBQUREO0FBRkYsR0FEUzs7QUFRZkMsVUFBUSxVQUFTQyxPQUFULEVBQWtCO0FBQ3hCLFFBQUlDLHVCQUF1QixDQUEzQjtBQUNBLFFBQUlDLG1CQUFtQixLQUF2QjtBQUNBLFFBQUlDLGdCQUFnQixLQUFwQjtBQUNBLFFBQUlDLGtCQUFrQixJQUF0Qjs7QUFFQSxhQUFTQyxrQkFBVCxDQUE0QkMsbUJBQTVCLEVBQWlEO0FBQy9DLFVBQUlBLG9CQUFvQlYsSUFBcEIsS0FBNkIsZUFBakMsRUFBa0Q7QUFDaEQ7QUFDQVUsNEJBQW9CQyxVQUFwQixDQUNHQyxPQURILENBQ1csVUFBU0MsUUFBVCxFQUFtQjtBQUMxQkosNkJBQW1CSSxTQUFTQyxLQUE1QjtBQUNELFNBSEg7QUFJRCxPQU5ELE1BTU87QUFDUDtBQUNFVDtBQUNEO0FBQ0Y7O0FBRUQsV0FBTztBQUNMLGdDQUEwQixZQUFXO0FBQ25DQywyQkFBbUIsSUFBbkI7QUFDRCxPQUhJOztBQUtMLHlCQUFtQixVQUFTUyxJQUFULEVBQWU7QUFDaEMsWUFBSUEsS0FBS0MsUUFBTCxDQUFjQyxJQUFkLEtBQXVCLFNBQTNCLEVBQXNDO0FBQ3BDWCw2QkFBbUIsSUFBbkI7QUFDRCxTQUZELE1BRU87QUFDTEQ7QUFDQUcsNEJBQWtCTyxJQUFsQjtBQUNEO0FBQ0YsT0FaSTs7QUFjTCxnQ0FBMEIsVUFBU0EsSUFBVCxFQUFlO0FBQ3ZDO0FBQ0EsWUFBSSxDQUFDQSxLQUFLRyxXQUFWLEVBQXVCOztBQUV2QjtBQUNBLFlBQUlILEtBQUtJLFVBQUwsS0FBb0IsTUFBeEIsRUFBZ0M7O0FBTE8sY0FPL0JuQixJQVArQixHQU90QmUsS0FBS0csV0FQaUIsQ0FPL0JsQixJQVArQjs7O0FBU3ZDLFlBQ0VBLFNBQVMsd0JBQVQsSUFDQUEsU0FBUyxXQURULElBRUFBLFNBQVMsd0JBRlQsSUFHQUEsU0FBUyxzQkFKWCxFQUtFO0FBQ0E7QUFDRDs7QUFFRCxZQUFJZSxLQUFLRyxXQUFMLENBQWlCRSxZQUFyQixFQUFtQztBQUNqQ0wsZUFBS0csV0FBTCxDQUFpQkUsWUFBakIsQ0FBOEJSLE9BQTlCLENBQXNDLFVBQVNNLFdBQVQsRUFBc0I7QUFDMURULCtCQUFtQlMsWUFBWUcsRUFBL0I7QUFDRCxXQUZEO0FBR0QsU0FKRCxNQUtLO0FBQ0g7QUFDQWhCO0FBQ0Q7O0FBRURHLDBCQUFrQk8sSUFBbEI7QUFDRCxPQTNDSTs7QUE2Q0wsa0NBQTRCLFlBQVc7QUFDckNULDJCQUFtQixJQUFuQjtBQUNELE9BL0NJOztBQWlETCw4QkFBd0IsWUFBVztBQUNqQ0Msd0JBQWdCLElBQWhCO0FBQ0QsT0FuREk7O0FBcURMLHNCQUFnQixZQUFXO0FBQ3pCLFlBQUlGLHlCQUF5QixDQUF6QixJQUE4QixDQUFDQyxnQkFBL0IsSUFBbUQsQ0FBQ0MsYUFBeEQsRUFBdUU7QUFDckVILGtCQUFRa0IsTUFBUixDQUFlZCxlQUFmLEVBQWdDLHdCQUFoQztBQUNEO0FBQ0Y7QUF6REksS0FBUDtBQTJERDtBQXRGYyxDQUFqQiIsImZpbGUiOiJwcmVmZXItZGVmYXVsdC1leHBvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCdcclxuXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIHVybDogZG9jc1VybCgncHJlZmVyLWRlZmF1bHQtZXhwb3J0JyksXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogZnVuY3Rpb24oY29udGV4dCkge1xyXG4gICAgbGV0IHNwZWNpZmllckV4cG9ydENvdW50ID0gMFxyXG4gICAgbGV0IGhhc0RlZmF1bHRFeHBvcnQgPSBmYWxzZVxyXG4gICAgbGV0IGhhc1N0YXJFeHBvcnQgPSBmYWxzZVxyXG4gICAgbGV0IG5hbWVkRXhwb3J0Tm9kZSA9IG51bGxcclxuXHJcbiAgICBmdW5jdGlvbiBjYXB0dXJlRGVjbGFyYXRpb24oaWRlbnRpZmllck9yUGF0dGVybikge1xyXG4gICAgICBpZiAoaWRlbnRpZmllck9yUGF0dGVybi50eXBlID09PSAnT2JqZWN0UGF0dGVybicpIHtcclxuICAgICAgICAvLyByZWN1cnNpdmVseSBjYXB0dXJlXHJcbiAgICAgICAgaWRlbnRpZmllck9yUGF0dGVybi5wcm9wZXJ0aWVzXHJcbiAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihwcm9wZXJ0eSkge1xyXG4gICAgICAgICAgICBjYXB0dXJlRGVjbGFyYXRpb24ocHJvcGVydHkudmFsdWUpXHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBhc3N1bWUgaXQncyBhIHNpbmdsZSBzdGFuZGFyZCBpZGVudGlmaWVyXHJcbiAgICAgICAgc3BlY2lmaWVyRXhwb3J0Q291bnQrK1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgJ0V4cG9ydERlZmF1bHRTcGVjaWZpZXInOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBoYXNEZWZhdWx0RXhwb3J0ID0gdHJ1ZVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgJ0V4cG9ydFNwZWNpZmllcic6IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgICBpZiAobm9kZS5leHBvcnRlZC5uYW1lID09PSAnZGVmYXVsdCcpIHtcclxuICAgICAgICAgIGhhc0RlZmF1bHRFeHBvcnQgPSB0cnVlXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNwZWNpZmllckV4cG9ydENvdW50KytcclxuICAgICAgICAgIG5hbWVkRXhwb3J0Tm9kZSA9IG5vZGVcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbic6IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgICAvLyBpZiB0aGVyZSBhcmUgc3BlY2lmaWVycywgbm9kZS5kZWNsYXJhdGlvbiBzaG91bGQgYmUgbnVsbFxyXG4gICAgICAgIGlmICghbm9kZS5kZWNsYXJhdGlvbikgcmV0dXJuXHJcblxyXG4gICAgICAgIC8vIGRvbid0IHdhcm4gb24gc2luZ2xlIHR5cGUgYWxpYXNlcywgZGVjbGFyYXRpb25zLCBvciBpbnRlcmZhY2VzXHJcbiAgICAgICAgaWYgKG5vZGUuZXhwb3J0S2luZCA9PT0gJ3R5cGUnKSByZXR1cm5cclxuXHJcbiAgICAgICAgY29uc3QgeyB0eXBlIH0gPSBub2RlLmRlY2xhcmF0aW9uXHJcblxyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgIHR5cGUgPT09ICdUU1R5cGVBbGlhc0RlY2xhcmF0aW9uJyB8fFxyXG4gICAgICAgICAgdHlwZSA9PT0gJ1R5cGVBbGlhcycgfHxcclxuICAgICAgICAgIHR5cGUgPT09ICdUU0ludGVyZmFjZURlY2xhcmF0aW9uJyB8fFxyXG4gICAgICAgICAgdHlwZSA9PT0gJ0ludGVyZmFjZURlY2xhcmF0aW9uJ1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobm9kZS5kZWNsYXJhdGlvbi5kZWNsYXJhdGlvbnMpIHtcclxuICAgICAgICAgIG5vZGUuZGVjbGFyYXRpb24uZGVjbGFyYXRpb25zLmZvckVhY2goZnVuY3Rpb24oZGVjbGFyYXRpb24pIHtcclxuICAgICAgICAgICAgY2FwdHVyZURlY2xhcmF0aW9uKGRlY2xhcmF0aW9uLmlkKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyBjYXB0dXJlcyAnZXhwb3J0IGZ1bmN0aW9uIGZvbygpIHt9JyBzeW50YXhcclxuICAgICAgICAgIHNwZWNpZmllckV4cG9ydENvdW50KytcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG5hbWVkRXhwb3J0Tm9kZSA9IG5vZGVcclxuICAgICAgfSxcclxuXHJcbiAgICAgICdFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24nOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBoYXNEZWZhdWx0RXhwb3J0ID0gdHJ1ZVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgJ0V4cG9ydEFsbERlY2xhcmF0aW9uJzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaGFzU3RhckV4cG9ydCA9IHRydWVcclxuICAgICAgfSxcclxuXHJcbiAgICAgICdQcm9ncmFtOmV4aXQnOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoc3BlY2lmaWVyRXhwb3J0Q291bnQgPT09IDEgJiYgIWhhc0RlZmF1bHRFeHBvcnQgJiYgIWhhc1N0YXJFeHBvcnQpIHtcclxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KG5hbWVkRXhwb3J0Tm9kZSwgJ1ByZWZlciBkZWZhdWx0IGV4cG9ydC4nKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH1cclxuICB9LFxyXG59XHJcbiJdfQ==