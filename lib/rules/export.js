'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _ExportMap = require('../ExportMap');

var _ExportMap2 = _interopRequireDefault(_ExportMap);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

var _arrayIncludes = require('array-includes');

var _arrayIncludes2 = _interopRequireDefault(_arrayIncludes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
Notes on Typescript namespaces aka TSModuleDeclaration:

There are two forms:
- active namespaces: namespace Foo {} / module Foo {}
- ambient modules; declare module "eslint-plugin-import" {}

active namespaces:
- cannot contain a default export
- cannot contain an export all
- cannot contain a multi name export (export { a, b })
- can have active namespaces nested within them

ambient namespaces:
- can only be defined in .d.ts files
- cannot be nested within active namespaces
- have no other restrictions
*/

const rootProgram = 'root';
const tsTypePrefix = 'type:';

/**
 * Detect function overloads like:
 * ```ts
 * export function foo(a: number);
 * export function foo(a: string);
 * export function foo(a: number|string) { return a; }
 * ```
 * @param {Set<Object>} nodes
 * @returns {boolean}
 */
function isTypescriptFunctionOverloads(nodes) {
  const types = new Set(Array.from(nodes, node => node.parent.type));
  return types.size === 2 && types.has('TSDeclareFunction') && types.has('FunctionDeclaration');
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2.default)('export')
    }
  },

  create: function (context) {
    const namespace = new Map([[rootProgram, new Map()]]);

    function addNamed(name, node, parent, isType) {
      if (!namespace.has(parent)) {
        namespace.set(parent, new Map());
      }
      const named = namespace.get(parent);

      const key = isType ? `${tsTypePrefix}${name}` : name;
      let nodes = named.get(key);

      if (nodes == null) {
        nodes = new Set();
        named.set(key, nodes);
      }

      nodes.add(node);
    }

    function getParent(node) {
      if (node.parent && node.parent.type === 'TSModuleBlock') {
        return node.parent.parent;
      }

      // just in case somehow a non-ts namespace export declaration isn't directly
      // parented to the root Program node
      return rootProgram;
    }

    return {
      'ExportDefaultDeclaration': node => addNamed('default', node, getParent(node)),

      'ExportSpecifier': node => addNamed(node.exported.name, node.exported, getParent(node)),

      'ExportNamedDeclaration': function (node) {
        if (node.declaration == null) return;

        const parent = getParent(node);
        // support for old typescript versions
        const isTypeVariableDecl = node.declaration.kind === 'type';

        if (node.declaration.id != null) {
          if ((0, _arrayIncludes2.default)(['TSTypeAliasDeclaration', 'TSInterfaceDeclaration'], node.declaration.type)) {
            addNamed(node.declaration.id.name, node.declaration.id, parent, true);
          } else {
            addNamed(node.declaration.id.name, node.declaration.id, parent, isTypeVariableDecl);
          }
        }

        if (node.declaration.declarations != null) {
          for (let declaration of node.declaration.declarations) {
            (0, _ExportMap.recursivePatternCapture)(declaration.id, v => addNamed(v.name, v, parent, isTypeVariableDecl));
          }
        }
      },

      'ExportAllDeclaration': function (node) {
        if (node.source == null) return; // not sure if this is ever true

        const remoteExports = _ExportMap2.default.get(node.source.value, context);
        if (remoteExports == null) return;

        if (remoteExports.errors.length) {
          remoteExports.reportErrors(context, node);
          return;
        }

        const parent = getParent(node);

        let any = false;
        remoteExports.forEach((v, name) => name !== 'default' && (any = true) && // poor man's filter
        addNamed(name, node, parent));

        if (!any) {
          context.report(node.source, `No named exports found in module '${node.source.value}'.`);
        }
      },

      'Program:exit': function () {
        for (let _ref of namespace) {
          var _ref2 = _slicedToArray(_ref, 2);

          let named = _ref2[1];

          for (let _ref3 of named) {
            var _ref4 = _slicedToArray(_ref3, 2);

            let name = _ref4[0];
            let nodes = _ref4[1];

            if (nodes.size <= 1) continue;

            if (isTypescriptFunctionOverloads(nodes)) continue;

            for (let node of nodes) {
              if (name === 'default') {
                context.report(node, 'Multiple default exports.');
              } else {
                context.report(node, `Multiple exports of name '${name.replace(tsTypePrefix, '')}'.`);
              }
            }
          }
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9leHBvcnQuanMiXSwibmFtZXMiOlsicm9vdFByb2dyYW0iLCJ0c1R5cGVQcmVmaXgiLCJpc1R5cGVzY3JpcHRGdW5jdGlvbk92ZXJsb2FkcyIsIm5vZGVzIiwidHlwZXMiLCJTZXQiLCJBcnJheSIsImZyb20iLCJub2RlIiwicGFyZW50IiwidHlwZSIsInNpemUiLCJoYXMiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsImRvY3MiLCJ1cmwiLCJjcmVhdGUiLCJjb250ZXh0IiwibmFtZXNwYWNlIiwiTWFwIiwiYWRkTmFtZWQiLCJuYW1lIiwiaXNUeXBlIiwic2V0IiwibmFtZWQiLCJnZXQiLCJrZXkiLCJhZGQiLCJnZXRQYXJlbnQiLCJleHBvcnRlZCIsImRlY2xhcmF0aW9uIiwiaXNUeXBlVmFyaWFibGVEZWNsIiwia2luZCIsImlkIiwiZGVjbGFyYXRpb25zIiwidiIsInNvdXJjZSIsInJlbW90ZUV4cG9ydHMiLCJFeHBvcnRNYXAiLCJ2YWx1ZSIsImVycm9ycyIsImxlbmd0aCIsInJlcG9ydEVycm9ycyIsImFueSIsImZvckVhY2giLCJyZXBvcnQiLCJyZXBsYWNlIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQSxNQUFNQSxjQUFjLE1BQXBCO0FBQ0EsTUFBTUMsZUFBZSxPQUFyQjs7QUFFQTs7Ozs7Ozs7OztBQVVBLFNBQVNDLDZCQUFULENBQXVDQyxLQUF2QyxFQUE4QztBQUM1QyxRQUFNQyxRQUFRLElBQUlDLEdBQUosQ0FBUUMsTUFBTUMsSUFBTixDQUFXSixLQUFYLEVBQWtCSyxRQUFRQSxLQUFLQyxNQUFMLENBQVlDLElBQXRDLENBQVIsQ0FBZDtBQUNBLFNBQU9OLE1BQU1PLElBQU4sS0FBZSxDQUFmLElBQW9CUCxNQUFNUSxHQUFOLENBQVUsbUJBQVYsQ0FBcEIsSUFBc0RSLE1BQU1RLEdBQU4sQ0FBVSxxQkFBVixDQUE3RDtB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QkFBOEJDLEtBQTlCLENBQUosRUFBMEM7O0FBRTFDLGlCQUFLLElBQUlLLElBQVQsSUFBaUJMLEtBQWpCLEVBQXdCO0FBQ3RCLGtCQUFJb0IsU0FBUyxTQUFiLEVBQXdCO0FBQ3RCSix3QkFBUTRCLE1BQVIsQ0FBZXZDLElBQWYsRUFBcUIsMkJBQXJCO0FBQ0QsZUFGRCxNQUVPO0FBQ0xXLHdCQUFRNEIsTUFBUixDQUNFdkMsSUFERixFQUVHLDZCQUE0QmUsS0FBS3lCLE9BQUwsQ0FBYS9DLFlBQWIsRUFBMkIsRUFBM0IsQ0FBK0IsSUFGOUQ7QUFJRDtBQUNGO0FBQ0Y7QUFDRjtBQUNGO0FBM0VJLEtBQVA7QUE2RUQ7QUFuSGMsQ0FBakIiLCJmaWxlIjoiZXhwb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV4cG9ydE1hcCwgeyByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZSB9IGZyb20gJy4uL0V4cG9ydE1hcCdcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCdcclxuaW1wb3J0IGluY2x1ZGVzIGZyb20gJ2FycmF5LWluY2x1ZGVzJ1xyXG5cclxuLypcclxuTm90ZXMgb24gVHlwZXNjcmlwdCBuYW1lc3BhY2VzIGFrYSBUU01vZHVsZURlY2xhcmF0aW9uOlxyXG5cclxuVGhlcmUgYXJlIHR3byBmb3JtczpcclxuLSBhY3RpdmUgbmFtZXNwYWNlczogbmFtZXNwYWNlIEZvbyB7fSAvIG1vZHVsZSBGb28ge31cclxuLSBhbWJpZW50IG1vZHVsZXM7IGRlY2xhcmUgbW9kdWxlIFwiZXNsaW50LXBsdWdpbi1pbXBvcnRcIiB7fVxyXG5cclxuYWN0aXZlIG5hbWVzcGFjZXM6XHJcbi0gY2Fubm90IGNvbnRhaW4gYSBkZWZhdWx0IGV4cG9ydFxyXG4tIGNhbm5vdCBjb250YWluIGFuIGV4cG9ydCBhbGxcclxuLSBjYW5ub3QgY29udGFpbiBhIG11bHRpIG5hbWUgZXhwb3J0IChleHBvcnQgeyBhLCBiIH0pXHJcbi0gY2FuIGhhdmUgYWN0aXZlIG5hbWVzcGFjZXMgbmVzdGVkIHdpdGhpbiB0aGVtXHJcblxyXG5hbWJpZW50IG5hbWVzcGFjZXM6XHJcbi0gY2FuIG9ubHkgYmUgZGVmaW5lZCBpbiAuZC50cyBmaWxlc1xyXG4tIGNhbm5vdCBiZSBuZXN0ZWQgd2l0aGluIGFjdGl2ZSBuYW1lc3BhY2VzXHJcbi0gaGF2ZSBubyBvdGhlciByZXN0cmljdGlvbnNcclxuKi9cclxuXHJcbmNvbnN0IHJvb3RQcm9ncmFtID0gJ3Jvb3QnXHJcbmNvbnN0IHRzVHlwZVByZWZpeCA9ICd0eXBlOidcclxuXHJcbi8qKlxyXG4gKiBEZXRlY3QgZnVuY3Rpb24gb3ZlcmxvYWRzIGxpa2U6XHJcbiAqIGBgYHRzXHJcbiAqIGV4cG9ydCBmdW5jdGlvbiBmb28oYTogbnVtYmVyKTtcclxuICogZXhwb3J0IGZ1bmN0aW9uIGZvbyhhOiBzdHJpbmcpO1xyXG4gKiBleHBvcnQgZnVuY3Rpb24gZm9vKGE6IG51bWJlcnxzdHJpbmcpIHsgcmV0dXJuIGE7IH1cclxuICogYGBgXHJcbiAqIEBwYXJhbSB7U2V0PE9iamVjdD59IG5vZGVzXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaXNUeXBlc2NyaXB0RnVuY3Rpb25PdmVybG9hZHMobm9kZXMpIHtcclxuICBjb25zdCB0eXBlcyA9IG5ldyBTZXQoQXJyYXkuZnJvbShub2Rlcywgbm9kZSA9PiBub2RlLnBhcmVudC50eXBlKSlcclxuICByZXR1cm4gdHlwZXMuc2l6ZSA9PT0gMiAmJiB0eXBlcy5oYXMoJ1RTRGVjbGFyZUZ1bmN0aW9uJykgJiYgdHlwZXMuaGFzKCdGdW5jdGlvbkRlY2xhcmF0aW9uJylcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3Byb2JsZW0nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICB1cmw6IGRvY3NVcmwoJ2V4cG9ydCcpLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICBjcmVhdGU6IGZ1bmN0aW9uIChjb250ZXh0KSB7XHJcbiAgICBjb25zdCBuYW1lc3BhY2UgPSBuZXcgTWFwKFtbcm9vdFByb2dyYW0sIG5ldyBNYXAoKV1dKVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZE5hbWVkKG5hbWUsIG5vZGUsIHBhcmVudCwgaXNUeXBlKSB7XHJcbiAgICAgIGlmICghbmFtZXNwYWNlLmhhcyhwYXJlbnQpKSB7XHJcbiAgICAgICAgbmFtZXNwYWNlLnNldChwYXJlbnQsIG5ldyBNYXAoKSlcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBuYW1lZCA9IG5hbWVzcGFjZS5nZXQocGFyZW50KVxyXG5cclxuICAgICAgY29uc3Qga2V5ID0gaXNUeXBlID8gYCR7dHNUeXBlUHJlZml4fSR7bmFtZX1gIDogbmFtZVxyXG4gICAgICBsZXQgbm9kZXMgPSBuYW1lZC5nZXQoa2V5KVxyXG5cclxuICAgICAgaWYgKG5vZGVzID09IG51bGwpIHtcclxuICAgICAgICBub2RlcyA9IG5ldyBTZXQoKVxyXG4gICAgICAgIG5hbWVkLnNldChrZXksIG5vZGVzKVxyXG4gICAgICB9XHJcblxyXG4gICAgICBub2Rlcy5hZGQobm9kZSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRQYXJlbnQobm9kZSkge1xyXG4gICAgICBpZiAobm9kZS5wYXJlbnQgJiYgbm9kZS5wYXJlbnQudHlwZSA9PT0gJ1RTTW9kdWxlQmxvY2snKSB7XHJcbiAgICAgICAgcmV0dXJuIG5vZGUucGFyZW50LnBhcmVudFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBqdXN0IGluIGNhc2Ugc29tZWhvdyBhIG5vbi10cyBuYW1lc3BhY2UgZXhwb3J0IGRlY2xhcmF0aW9uIGlzbid0IGRpcmVjdGx5XHJcbiAgICAgIC8vIHBhcmVudGVkIHRvIHRoZSByb290IFByb2dyYW0gbm9kZVxyXG4gICAgICByZXR1cm4gcm9vdFByb2dyYW1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAnRXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uJzogKG5vZGUpID0+IGFkZE5hbWVkKCdkZWZhdWx0Jywgbm9kZSwgZ2V0UGFyZW50KG5vZGUpKSxcclxuXHJcbiAgICAgICdFeHBvcnRTcGVjaWZpZXInOiAobm9kZSkgPT4gYWRkTmFtZWQobm9kZS5leHBvcnRlZC5uYW1lLCBub2RlLmV4cG9ydGVkLCBnZXRQYXJlbnQobm9kZSkpLFxyXG5cclxuICAgICAgJ0V4cG9ydE5hbWVkRGVjbGFyYXRpb24nOiBmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uID09IG51bGwpIHJldHVyblxyXG5cclxuICAgICAgICBjb25zdCBwYXJlbnQgPSBnZXRQYXJlbnQobm9kZSlcclxuICAgICAgICAvLyBzdXBwb3J0IGZvciBvbGQgdHlwZXNjcmlwdCB2ZXJzaW9uc1xyXG4gICAgICAgIGNvbnN0IGlzVHlwZVZhcmlhYmxlRGVjbCA9IG5vZGUuZGVjbGFyYXRpb24ua2luZCA9PT0gJ3R5cGUnXHJcblxyXG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uLmlkICE9IG51bGwpIHtcclxuICAgICAgICAgIGlmIChpbmNsdWRlcyhbXHJcbiAgICAgICAgICAgICdUU1R5cGVBbGlhc0RlY2xhcmF0aW9uJyxcclxuICAgICAgICAgICAgJ1RTSW50ZXJmYWNlRGVjbGFyYXRpb24nLFxyXG4gICAgICAgICAgXSwgbm9kZS5kZWNsYXJhdGlvbi50eXBlKSkge1xyXG4gICAgICAgICAgICBhZGROYW1lZChub2RlLmRlY2xhcmF0aW9uLmlkLm5hbWUsIG5vZGUuZGVjbGFyYXRpb24uaWQsIHBhcmVudCwgdHJ1ZSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFkZE5hbWVkKG5vZGUuZGVjbGFyYXRpb24uaWQubmFtZSwgbm9kZS5kZWNsYXJhdGlvbi5pZCwgcGFyZW50LCBpc1R5cGVWYXJpYWJsZURlY2wpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobm9kZS5kZWNsYXJhdGlvbi5kZWNsYXJhdGlvbnMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgZm9yIChsZXQgZGVjbGFyYXRpb24gb2Ygbm9kZS5kZWNsYXJhdGlvbi5kZWNsYXJhdGlvbnMpIHtcclxuICAgICAgICAgICAgcmVjdXJzaXZlUGF0dGVybkNhcHR1cmUoZGVjbGFyYXRpb24uaWQsIHYgPT5cclxuICAgICAgICAgICAgICBhZGROYW1lZCh2Lm5hbWUsIHYsIHBhcmVudCwgaXNUeXBlVmFyaWFibGVEZWNsKSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAnRXhwb3J0QWxsRGVjbGFyYXRpb24nOiBmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgIGlmIChub2RlLnNvdXJjZSA9PSBudWxsKSByZXR1cm4gLy8gbm90IHN1cmUgaWYgdGhpcyBpcyBldmVyIHRydWVcclxuXHJcbiAgICAgICAgY29uc3QgcmVtb3RlRXhwb3J0cyA9IEV4cG9ydE1hcC5nZXQobm9kZS5zb3VyY2UudmFsdWUsIGNvbnRleHQpXHJcbiAgICAgICAgaWYgKHJlbW90ZUV4cG9ydHMgPT0gbnVsbCkgcmV0dXJuXHJcblxyXG4gICAgICAgIGlmIChyZW1vdGVFeHBvcnRzLmVycm9ycy5sZW5ndGgpIHtcclxuICAgICAgICAgIHJlbW90ZUV4cG9ydHMucmVwb3J0RXJyb3JzKGNvbnRleHQsIG5vZGUpXHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IGdldFBhcmVudChub2RlKVxyXG5cclxuICAgICAgICBsZXQgYW55ID0gZmFsc2VcclxuICAgICAgICByZW1vdGVFeHBvcnRzLmZvckVhY2goKHYsIG5hbWUpID0+XHJcbiAgICAgICAgICBuYW1lICE9PSAnZGVmYXVsdCcgJiZcclxuICAgICAgICAgIChhbnkgPSB0cnVlKSAmJiAvLyBwb29yIG1hbidzIGZpbHRlclxyXG4gICAgICAgICAgYWRkTmFtZWQobmFtZSwgbm9kZSwgcGFyZW50KSlcclxuXHJcbiAgICAgICAgaWYgKCFhbnkpIHtcclxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KG5vZGUuc291cmNlLFxyXG4gICAgICAgICAgICBgTm8gbmFtZWQgZXhwb3J0cyBmb3VuZCBpbiBtb2R1bGUgJyR7bm9kZS5zb3VyY2UudmFsdWV9Jy5gKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgICdQcm9ncmFtOmV4aXQnOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgWywgbmFtZWRdIG9mIG5hbWVzcGFjZSkge1xyXG4gICAgICAgICAgZm9yIChsZXQgW25hbWUsIG5vZGVzXSBvZiBuYW1lZCkge1xyXG4gICAgICAgICAgICBpZiAobm9kZXMuc2l6ZSA8PSAxKSBjb250aW51ZVxyXG5cclxuICAgICAgICAgICAgaWYgKGlzVHlwZXNjcmlwdEZ1bmN0aW9uT3ZlcmxvYWRzKG5vZGVzKSkgY29udGludWVcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZXMpIHtcclxuICAgICAgICAgICAgICBpZiAobmFtZSA9PT0gJ2RlZmF1bHQnKSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LnJlcG9ydChub2RlLCAnTXVsdGlwbGUgZGVmYXVsdCBleHBvcnRzLicpXHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KFxyXG4gICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgICBgTXVsdGlwbGUgZXhwb3J0cyBvZiBuYW1lICcke25hbWUucmVwbGFjZSh0c1R5cGVQcmVmaXgsICcnKX0nLmBcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9XHJcbiAgfSxcclxufVxyXG4iXX0=