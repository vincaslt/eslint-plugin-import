'use strict';

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

var _object = require('object.values');

var _object2 = _interopRequireDefault(_object);

var _arrayPrototype = require('array.prototype.flat');

var _arrayPrototype2 = _interopRequireDefault(_arrayPrototype);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const meta = {
  type: 'suggestion',
  docs: {
    url: (0, _docsUrl2.default)('group-exports')
  }
  /* eslint-disable max-len */
};const errors = {
  ExportNamedDeclaration: 'Multiple named export declarations; consolidate all named exports into a single export declaration',
  AssignmentExpression: 'Multiple CommonJS exports; consolidate all exports into a single assignment to `module.exports`'
  /* eslint-enable max-len */

  /**
   * Returns an array with names of the properties in the accessor chain for MemberExpression nodes
   *
   * Example:
   *
   * `module.exports = {}` => ['module', 'exports']
   * `module.exports.property = true` => ['module', 'exports', 'property']
   *
   * @param     {Node}    node    AST Node (MemberExpression)
   * @return    {Array}           Array with the property names in the chain
   * @private
   */
};function accessorChain(node) {
  const chain = [];

  do {
    chain.unshift(node.property.name);

    if (node.object.type === 'Identifier') {
      chain.unshift(node.object.name);
      break;
    }

    node = node.object;
  } while (node.type === 'MemberExpression');

  return chain;
}

function create(context) {
  const nodes = {
    modules: new Set(),
    commonjs: new Set(),
    sources: {}
  };

  return {
    ExportNamedDeclaration(node) {
      if (!node.source) {
        nodes.modules.add(node);
      } else if (Array.isArray(nodes.sources[node.source.value])) {
        nodes.sources[node.source.value].push(node);
      } else {
        nodes.sources[node.source.value] = [node];
      }
    },

    AssignmentExpression(node) {
      if (node.left.type !== 'MemberExpression') {
        return;
      }

      const chain = accessorChain(node.left);

      // Assignments to module.exports
      // Deeper assignments are ignored since they just modify what's already being exported
      // (ie. module.exports.exported.prop = true is ignored)
      if (chain[0] === 'module' && chain[1] === 'exports' && chain.length <= 3) {
        nodes.commonjs.add(node);
        return;
      }

      // Assignments to exports (exports.* = *)
      if (chain[0] === 'exports' && chain.length === 2) {
        nodes.commonjs.add(node);
        return;
      }
    },

    'Program:exit': function onExit() {
      // Report multiple `export` declarations (ES2015 modules)
      if (nodes.modules.size > 1) {
        nodes.modules.forEach(node => {
          context.report({
            node,
            message: errors[node.type]
          });
        });
      }

      // Report multiple `aggregated exports` from the same module (ES2015 modules)
      (0, _arrayPrototype2.default)((0, _object2.default)(nodes.sources).filter(nodesWithSource => Array.isArray(nodesWithSource) && nodesWithSource.length > 1)).forEach(node => {
        context.report({
          node,
          message: errors[node.type]
        });
      });

      // Report multiple `module.exports` assignments (CommonJS)
      if (nodes.commonjs.size > 1) {
        nodes.commonjs.forEach(node => {
          context.report({
            node,
            message: errors[node.type]
          });
        });
      }
    }
  };
}

module.exports = {
  meta,
  create
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9ncm91cC1leHBvcnRzLmpzIl0sIm5hbWVzIjpbIm1ldGEiLCJ0eXBlIiwiZG9jcyIsInVybCIsImVycm9ycyIsIkV4cG9ydE5hbWVkRGVjbGFyYXRpb24iLCJBc3NpZ25tZW50RXhwcmVzc2lvbiIsImFjY2Vzc29yQ2hhaW4iLCJub2RlIiwiY2hhaW4iLCJ1bnNoaWZ0IiwicHJvcGVydHkiLCJuYW1lIiwib2JqZWN0IiwiY3JlYXRlIiwiY29udGV4dCIsIm5vZGVzIiwibW9kdWxlcyIsIlNldCIsImNvbW1vbmpzIiwic291cmNlcyIsInNvdXJjZSIsImFkZCIsIkFycmF5IiwiaXNBcnJheSIsInZhbHVlIiwicHVzaCIsImxlZnQiLCJsZW5ndGgiLCJvbkV4aXQiLCJzaXplIiwiZm9yRWFjaCIsInJlcG9ydCIsIm1lc3NhZ2UiLCJmaWx0ZXIiLCJub2Rlc1dpdGhTb3VyY2UiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsTUFBTUEsT0FBTztBQUNYQyxRQUFNLFlBREs7QUFFWEMsUUFBTTtBQUNKQyxTQUFLLHVCQUFRLGVBQVI7QUFERDtBQUlSO0FBTmEsQ0FBYixDQU9BLE1BQU1DLFNBQVM7QUFDYkMsMEJBQXdCLG9HQURYO0FBRWJDLHdCQUFzQjtBQUV4Qjs7QUFFQTs7Ozs7Ozs7Ozs7O0FBTmUsQ0FBZixDQWtCQSxTQUFTQyxhQUFULENBQXVCQyxJQUF2QixFQUE2QjtBQUMzQixRQUFNQyxRQUFRLEVBQWQ7O0FBRUEsS0FBRztBQUNEQSxVQUFNQyxPQUFOLENBQWNGLEtBQUtHLFFBQUwsQ0FBY0MsSUFBNUI7O0FBRUEsUUFBSUosS0FBS0ssTUFBTCxDQUFZWixJQUFaLEtBQXFCLFlBQXpCLEVBQXVDO0FBQ3JDUSxZQUFNQyxPQUFOLENBQWNGLEtBQUtLLE1BQUwsQ0FBWUQsSUFBMUI7QUFDQTtBQUNEOztBQUVESixXQUFPQSxLQUFLSyxNQUFaO0FBQ0Qs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ICcuLi9kb2NzVXJsJ1xyXG5pbXBvcnQgdmFsdWVzIGZyb20gJ29iamVjdC52YWx1ZXMnXHJcbmltcG9ydCBmbGF0IGZyb20gJ2FycmF5LnByb3RvdHlwZS5mbGF0J1xyXG5cclxuY29uc3QgbWV0YSA9IHtcclxuICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgZG9jczoge1xyXG4gICAgdXJsOiBkb2NzVXJsKCdncm91cC1leHBvcnRzJyksXHJcbiAgfSxcclxufVxyXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXHJcbmNvbnN0IGVycm9ycyA9IHtcclxuICBFeHBvcnROYW1lZERlY2xhcmF0aW9uOiAnTXVsdGlwbGUgbmFtZWQgZXhwb3J0IGRlY2xhcmF0aW9uczsgY29uc29saWRhdGUgYWxsIG5hbWVkIGV4cG9ydHMgaW50byBhIHNpbmdsZSBleHBvcnQgZGVjbGFyYXRpb24nLFxyXG4gIEFzc2lnbm1lbnRFeHByZXNzaW9uOiAnTXVsdGlwbGUgQ29tbW9uSlMgZXhwb3J0czsgY29uc29saWRhdGUgYWxsIGV4cG9ydHMgaW50byBhIHNpbmdsZSBhc3NpZ25tZW50IHRvIGBtb2R1bGUuZXhwb3J0c2AnLFxyXG59XHJcbi8qIGVzbGludC1lbmFibGUgbWF4LWxlbiAqL1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYW4gYXJyYXkgd2l0aCBuYW1lcyBvZiB0aGUgcHJvcGVydGllcyBpbiB0aGUgYWNjZXNzb3IgY2hhaW4gZm9yIE1lbWJlckV4cHJlc3Npb24gbm9kZXNcclxuICpcclxuICogRXhhbXBsZTpcclxuICpcclxuICogYG1vZHVsZS5leHBvcnRzID0ge31gID0+IFsnbW9kdWxlJywgJ2V4cG9ydHMnXVxyXG4gKiBgbW9kdWxlLmV4cG9ydHMucHJvcGVydHkgPSB0cnVlYCA9PiBbJ21vZHVsZScsICdleHBvcnRzJywgJ3Byb3BlcnR5J11cclxuICpcclxuICogQHBhcmFtICAgICB7Tm9kZX0gICAgbm9kZSAgICBBU1QgTm9kZSAoTWVtYmVyRXhwcmVzc2lvbilcclxuICogQHJldHVybiAgICB7QXJyYXl9ICAgICAgICAgICBBcnJheSB3aXRoIHRoZSBwcm9wZXJ0eSBuYW1lcyBpbiB0aGUgY2hhaW5cclxuICogQHByaXZhdGVcclxuICovXHJcbmZ1bmN0aW9uIGFjY2Vzc29yQ2hhaW4obm9kZSkge1xyXG4gIGNvbnN0IGNoYWluID0gW11cclxuXHJcbiAgZG8ge1xyXG4gICAgY2hhaW4udW5zaGlmdChub2RlLnByb3BlcnR5Lm5hbWUpXHJcblxyXG4gICAgaWYgKG5vZGUub2JqZWN0LnR5cGUgPT09ICdJZGVudGlmaWVyJykge1xyXG4gICAgICBjaGFpbi51bnNoaWZ0KG5vZGUub2JqZWN0Lm5hbWUpXHJcbiAgICAgIGJyZWFrXHJcbiAgICB9XHJcblxyXG4gICAgbm9kZSA9IG5vZGUub2JqZWN0XHJcbiAgfSB3aGlsZSAobm9kZS50eXBlID09PSAnTWVtYmVyRXhwcmVzc2lvbicpXHJcblxyXG4gIHJldHVybiBjaGFpblxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGUoY29udGV4dCkge1xyXG4gIGNvbnN0IG5vZGVzID0ge1xyXG4gICAgbW9kdWxlczogbmV3IFNldCgpLFxyXG4gICAgY29tbW9uanM6IG5ldyBTZXQoKSxcclxuICAgIHNvdXJjZXM6IHt9LFxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIEV4cG9ydE5hbWVkRGVjbGFyYXRpb24obm9kZSkge1xyXG4gICAgICBpZiAoIW5vZGUuc291cmNlKSB7XHJcbiAgICAgICAgbm9kZXMubW9kdWxlcy5hZGQobm9kZSlcclxuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG5vZGVzLnNvdXJjZXNbbm9kZS5zb3VyY2UudmFsdWVdKSkge1xyXG4gICAgICAgIG5vZGVzLnNvdXJjZXNbbm9kZS5zb3VyY2UudmFsdWVdLnB1c2gobm9kZSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBub2Rlcy5zb3VyY2VzW25vZGUuc291cmNlLnZhbHVlXSA9IFtub2RlXVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIEFzc2lnbm1lbnRFeHByZXNzaW9uKG5vZGUpIHtcclxuICAgICAgaWYgKG5vZGUubGVmdC50eXBlICE9PSAnTWVtYmVyRXhwcmVzc2lvbicpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgY2hhaW4gPSBhY2Nlc3NvckNoYWluKG5vZGUubGVmdClcclxuXHJcbiAgICAgIC8vIEFzc2lnbm1lbnRzIHRvIG1vZHVsZS5leHBvcnRzXHJcbiAgICAgIC8vIERlZXBlciBhc3NpZ25tZW50cyBhcmUgaWdub3JlZCBzaW5jZSB0aGV5IGp1c3QgbW9kaWZ5IHdoYXQncyBhbHJlYWR5IGJlaW5nIGV4cG9ydGVkXHJcbiAgICAgIC8vIChpZS4gbW9kdWxlLmV4cG9ydHMuZXhwb3J0ZWQucHJvcCA9IHRydWUgaXMgaWdub3JlZClcclxuICAgICAgaWYgKGNoYWluWzBdID09PSAnbW9kdWxlJyAmJiBjaGFpblsxXSA9PT0gJ2V4cG9ydHMnICYmIGNoYWluLmxlbmd0aCA8PSAzKSB7XHJcbiAgICAgICAgbm9kZXMuY29tbW9uanMuYWRkKG5vZGUpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFzc2lnbm1lbnRzIHRvIGV4cG9ydHMgKGV4cG9ydHMuKiA9ICopXHJcbiAgICAgIGlmIChjaGFpblswXSA9PT0gJ2V4cG9ydHMnICYmIGNoYWluLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgIG5vZGVzLmNvbW1vbmpzLmFkZChub2RlKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgICdQcm9ncmFtOmV4aXQnOiBmdW5jdGlvbiBvbkV4aXQoKSB7XHJcbiAgICAgIC8vIFJlcG9ydCBtdWx0aXBsZSBgZXhwb3J0YCBkZWNsYXJhdGlvbnMgKEVTMjAxNSBtb2R1bGVzKVxyXG4gICAgICBpZiAobm9kZXMubW9kdWxlcy5zaXplID4gMSkge1xyXG4gICAgICAgIG5vZGVzLm1vZHVsZXMuZm9yRWFjaChub2RlID0+IHtcclxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JzW25vZGUudHlwZV0sXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlcG9ydCBtdWx0aXBsZSBgYWdncmVnYXRlZCBleHBvcnRzYCBmcm9tIHRoZSBzYW1lIG1vZHVsZSAoRVMyMDE1IG1vZHVsZXMpXHJcbiAgICAgIGZsYXQodmFsdWVzKG5vZGVzLnNvdXJjZXMpXHJcbiAgICAgICAgLmZpbHRlcihub2Rlc1dpdGhTb3VyY2UgPT4gQXJyYXkuaXNBcnJheShub2Rlc1dpdGhTb3VyY2UpICYmIG5vZGVzV2l0aFNvdXJjZS5sZW5ndGggPiAxKSlcclxuICAgICAgICAuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvcnNbbm9kZS50eXBlXSxcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgIC8vIFJlcG9ydCBtdWx0aXBsZSBgbW9kdWxlLmV4cG9ydHNgIGFzc2lnbm1lbnRzIChDb21tb25KUylcclxuICAgICAgaWYgKG5vZGVzLmNvbW1vbmpzLnNpemUgPiAxKSB7XHJcbiAgICAgICAgbm9kZXMuY29tbW9uanMuZm9yRWFjaChub2RlID0+IHtcclxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JzW25vZGUudHlwZV0sXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhLFxyXG4gIGNyZWF0ZSxcclxufVxyXG4iXX0=