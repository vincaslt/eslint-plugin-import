'use strict';

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('no-mutable-exports')
    }
  },

  create: function (context) {
    function checkDeclaration(node) {
      const kind = node.kind;

      if (kind === 'var' || kind === 'let') {
        context.report(node, `Exporting mutable '${kind}' binding, use 'const' instead.`);
      }
    }

    function checkDeclarationsInScope(_ref, name) {
      let variables = _ref.variables;

      for (let variable of variables) {
        if (variable.name === name) {
          for (let def of variable.defs) {
            if (def.type === 'Variable' && def.parent) {
              checkDeclaration(def.parent);
            }
          }
        }
      }
    }

    function handleExportDefault(node) {
      const scope = context.getScope();

      if (node.declaration.name) {
        checkDeclarationsInScope(scope, node.declaration.name);
      }
    }

    function handleExportNamed(node) {
      const scope = context.getScope();

      if (node.declaration) {
        checkDeclaration(node.declaration);
      } else if (!node.source) {
        for (let specifier of node.specifiers) {
          checkDeclarationsInScope(scope, specifier.local.name);
        }
      }
    }

    return {
      'ExportDefaultDeclaration': handleExportDefault,
      'ExportNamedDeclaration': handleExportNamed
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1tdXRhYmxlLWV4cG9ydHMuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsInVybCIsImNyZWF0ZSIsImNvbnRleHQiLCJjaGVja0RlY2xhcmF0aW9uIiwibm9kZSIsImtpbmQiLCJyZXBvcnQiLCJjaGVja0RlY2xhcmF0aW9uc0luU2NvcGUiLCJuYW1lIiwidmFyaWFibGVzIiwidmFyaWFibGUiLCJkZWYiLCJkZWZzIiwicGFyZW50IiwiaGFuZGxlRXhwb3J0RGVmYXVsdCIsInNjb3BlIiwiZ2V0U2NvcGUiLCJkZWNsYXJhdGlvbiIsImhhbmRsZUV4cG9ydE5hbWVkIiwic291cmNlIiwic3BlY2lmaWVyIiwic3BlY2lmaWVycyIsImxvY2FsIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7QUFFQUEsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pDLFVBQU0sWUFERjtBQUVKQyxVQUFNO0FBQ0pDLFdBQUssdUJBQVEsb0JBQVI7QUFERDtBQUZGLEdBRFM7O0FBUWZDLFVBQVEsVUFBVUMsT0FBVixFQUFtQjtBQUN6QixhQUFTQyxnQkFBVCxDQUEwQkMsSUFBMUIsRUFBZ0M7QUFBQSxZQUN2QkMsSUFEdUIsR0FDZkQsSUFEZSxDQUN2QkMsSUFEdUI7O0FBRTlCLFVBQUlBLFNBQVMsS0FBVCxJQUFrQkEsU0FBUyxLQUEvQixFQUFzQztBQUNwQ0gsZ0JBQVFJLE1BQVIsQ0FBZUYsSUFBZixFQUFzQixzQkFBcUJDLElBQUssaUNBQWhEO0FBQ0Q7QUFDRjs7QUFFRCxhQUFTRSx3QkFBVCxPQUErQ0MsSUFBL0MsRUFBcUQ7QUFBQSxVQUFsQkMsU0FBa0IsUUFBbEJBLFNBQWtCOztBQUNuRCxXQUFLLElBQUlDLFFBQVQsSUFBcUJELFNBQXJCLEVBQWdDO0FBQzlCLFlBQUlDLFNBQVNGLElBQVQsS0FBa0JBLElBQXRCLEVBQTRCO0FBQzFCLGVBQUssSUFBSUcsR0FBVCxJQUFnQkQsU0FBU0UsSUFBekIsRUFBK0I7QUFDN0IsZ0JBQUlELElBQUliLElBQUosS0FBYSxVQUFiLElBQTJCYSxJQUFJRSxNQUFuQyxFQUEyQztBQUN6Q1YsK0JBQWlCUSxJQUFJRSxNQUFyQjtBQUNEO0FBQ0Y7QUFDRjtBQUNGO0FBQ0Y7O0FBRUQsYUFBU0MsbUJBQVQsQ0FBNkJWLElBQTdCLEVBQW1DO0FBQ2pDLFlBQU1XLFFBQVFiLFFBQVFjLFFBQVIsRUFBZDs7QUFFQSxVQUFJWixLQUFLYSxXQUFMLENBQWlCVCxJQUFyQixFQUEyQjtBQUN6QkQsaUNBQXlCUSxLQUF6QixFQUFnQ1gsS0FBS2EsV0FBTCxDQUFpQlQsSUFBakQ7QUFDRDtBQUNGOztBQUVELGFBQVNVLGlCQUFULENBQTJCZCxJQUEzQixFQUFpQztBQUMvQixZQUFNVyxRQUFRYixRQUFRYyxRQUFSLEVBQWQ7O0FBRUEsVUFBSVosS0FBS2EsV0FBVCxFQUF1QjtBQUNyQmQseUJBQWlCQyxLQUFLYSxXQUF0QjtBQUNELE9BRkQsTUFFTyxJQUFJLENBQUNiLEtBQUtlLE1BQVYsRUFBa0I7QUFDdkIsYUFBSyxJQUFJQyxTQUFULElBQXNCaEIsS0FBS2lCLFVBQTNCLEVBQXVDO0FBQ3JDZCxtQ0FBeUJRLEtBQXpCLEVBQWdDSyxVQUFVRSxLQUFWLENBQWdCZCxJQUFoRDtBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxXQUFPO0FBQ0wsa0NBQTRCTSxtQkFEdkI7QUFFTCxnQ0FBMEJJO0FBRnJCLEtBQVA7QUFJRDtBQXBEYyxDQUFqQiIsImZpbGUiOiJuby1tdXRhYmxlLWV4cG9ydHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJ1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3N1Z2dlc3Rpb24nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICB1cmw6IGRvY3NVcmwoJ25vLW11dGFibGUtZXhwb3J0cycpLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICBjcmVhdGU6IGZ1bmN0aW9uIChjb250ZXh0KSB7XHJcbiAgICBmdW5jdGlvbiBjaGVja0RlY2xhcmF0aW9uKG5vZGUpIHtcclxuICAgICAgY29uc3Qge2tpbmR9ID0gbm9kZVxyXG4gICAgICBpZiAoa2luZCA9PT0gJ3ZhcicgfHwga2luZCA9PT0gJ2xldCcpIHtcclxuICAgICAgICBjb250ZXh0LnJlcG9ydChub2RlLCBgRXhwb3J0aW5nIG11dGFibGUgJyR7a2luZH0nIGJpbmRpbmcsIHVzZSAnY29uc3QnIGluc3RlYWQuYClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNoZWNrRGVjbGFyYXRpb25zSW5TY29wZSh7dmFyaWFibGVzfSwgbmFtZSkge1xyXG4gICAgICBmb3IgKGxldCB2YXJpYWJsZSBvZiB2YXJpYWJsZXMpIHtcclxuICAgICAgICBpZiAodmFyaWFibGUubmFtZSA9PT0gbmFtZSkge1xyXG4gICAgICAgICAgZm9yIChsZXQgZGVmIG9mIHZhcmlhYmxlLmRlZnMpIHtcclxuICAgICAgICAgICAgaWYgKGRlZi50eXBlID09PSAnVmFyaWFibGUnICYmIGRlZi5wYXJlbnQpIHtcclxuICAgICAgICAgICAgICBjaGVja0RlY2xhcmF0aW9uKGRlZi5wYXJlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBoYW5kbGVFeHBvcnREZWZhdWx0KG5vZGUpIHtcclxuICAgICAgY29uc3Qgc2NvcGUgPSBjb250ZXh0LmdldFNjb3BlKClcclxuXHJcbiAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uLm5hbWUpIHtcclxuICAgICAgICBjaGVja0RlY2xhcmF0aW9uc0luU2NvcGUoc2NvcGUsIG5vZGUuZGVjbGFyYXRpb24ubmFtZSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZUV4cG9ydE5hbWVkKG5vZGUpIHtcclxuICAgICAgY29uc3Qgc2NvcGUgPSBjb250ZXh0LmdldFNjb3BlKClcclxuXHJcbiAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uKSAge1xyXG4gICAgICAgIGNoZWNrRGVjbGFyYXRpb24obm9kZS5kZWNsYXJhdGlvbilcclxuICAgICAgfSBlbHNlIGlmICghbm9kZS5zb3VyY2UpIHtcclxuICAgICAgICBmb3IgKGxldCBzcGVjaWZpZXIgb2Ygbm9kZS5zcGVjaWZpZXJzKSB7XHJcbiAgICAgICAgICBjaGVja0RlY2xhcmF0aW9uc0luU2NvcGUoc2NvcGUsIHNwZWNpZmllci5sb2NhbC5uYW1lKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICdFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24nOiBoYW5kbGVFeHBvcnREZWZhdWx0LFxyXG4gICAgICAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbic6IGhhbmRsZUV4cG9ydE5hbWVkLFxyXG4gICAgfVxyXG4gIH0sXHJcbn1cclxuIl19