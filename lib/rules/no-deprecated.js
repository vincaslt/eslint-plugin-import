'use strict';

var _declaredScope = require('eslint-module-utils/declaredScope');

var _declaredScope2 = _interopRequireDefault(_declaredScope);

var _ExportMap = require('../ExportMap');

var _ExportMap2 = _interopRequireDefault(_ExportMap);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function message(deprecation) {
  return 'Deprecated' + (deprecation.description ? ': ' + deprecation.description : '.');
}

function getDeprecation(metadata) {
  if (!metadata || !metadata.doc) return;

  let deprecation;
  if (metadata.doc.tags.some(t => t.title === 'deprecated' && (deprecation = t))) {
    return deprecation;
  }
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('no-deprecated')
    }
  },

  create: function (context) {
    const deprecated = new Map(),
          namespaces = new Map();

    function checkSpecifiers(node) {
      if (node.type !== 'ImportDeclaration') return;
      if (node.source == null) return; // local export, ignore

      const imports = _ExportMap2.default.get(node.source.value, context);
      if (imports == null) return;

      let moduleDeprecation;
      if (imports.doc && imports.doc.tags.some(t => t.title === 'deprecated' && (moduleDeprecation = t))) {
        context.report({ node, message: message(moduleDeprecation) });
      }

      if (imports.errors.length) {
        imports.reportErrors(context, node);
        return;
      }

      node.specifiers.forEach(function (im) {
        let imported, local;
        switch (im.type) {

          case 'ImportNamespaceSpecifier':
            {
              if (!imports.size) return;
              namespaces.set(im.local.name, imports);
              return;
            }

          case 'ImportDefaultSpecifier':
            imported = 'default';
            local = im.local.name;
            break;

          case 'ImportSpecifier':
            imported = im.imported.name;
            local = im.local.name;
            break;

          default:
            return; // can't handle this one
        }

        // unknown thing can't be deprecated
        const exported = imports.get(imported);
        if (exported == null) return;

        // capture import of deep namespace
        if (exported.namespace) namespaces.set(local, exported.namespace);

        const deprecation = getDeprecation(imports.get(imported));
        if (!deprecation) return;

        context.report({ node: im, message: message(deprecation) });

        deprecated.set(local, deprecation);
      });
    }

    return {
      'Program': (_ref) => {
        let body = _ref.body;
        return body.forEach(checkSpecifiers);
      },

      'Identifier': function (node) {
        if (node.parent.type === 'MemberExpression' && node.parent.property === node) {
          return; // handled by MemberExpression
        }

        // ignore specifier identifiers
        if (node.parent.type.slice(0, 6) === 'Import') return;

        if (!deprecated.has(node.name)) return;

        if ((0, _declaredScope2.default)(context, node.name) !== 'module') return;
        context.report({
          node,
          message: message(deprecated.get(node.name))
        });
      },

      'MemberExpression': function (dereference) {
        if (dereference.object.type !== 'Identifier') return;
        if (!namespaces.has(dereference.object.name)) return;

        if ((0, _declaredScope2.default)(context, dereference.object.name) !== 'module') return;

        // go deep
        var namespace = namespaces.get(dereference.object.name);
        var namepath = [dereference.object.name];
        // while property is namespace and parent is member expression, keep validating
        while (namespace instanceof _ExportMap2.default && dereference.type === 'MemberExpression') {

          // ignore computed parts for now
          if (dereference.computed) return;

          const metadata = namespace.get(dereference.property.name);

          if (!metadata) break;
          const deprecation = getDeprecation(metadata);

          if (deprecation) {
            context.report({ node: dereference.property, message: message(deprecation) });
          }

          // stash and pop
          namepath.push(dereference.property.name);
          namespace = metadata.namespace;
          dereference = dereference.parent;
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1kZXByZWNhdGVkLmpzIl0sIm5hbWVzIjpbIm1lc3NhZ2UiLCJkZXByZWNhdGlvbiIsImRlc2NyaXB0aW9uIiwiZ2V0RGVwcmVjYXRpb24iLCJtZXRhZGF0YSIsImRvYyIsInRhZ3MiLCJzb21lIiwidCIsInRpdGxlIiwibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsInVybCIsImNyZWF0ZSIsImNvbnRleHQiLCJkZXByZWNhdGVkIiwiTWFwIiwibmFtZXNwYWNlcyIsImNoZWNrU3BlY2lmaWVycyIsIm5vZGUiLCJzb3VyY2UiLCJpbXBvcnRzIiwiRXhwb3J0cyIsImdldCIsInZhbHVlIiwibW9kdWxlRGVwcmVjYXRpb24iLCJyZXBvcnQiLCJlcnJvcnMiLCJsZW5ndGgiLCJyZXBvcnRFcnJvcnMiLCJzcGVjaWZpZXJzIiwiZm9yRWFjaCIsImltIiwiaW1wb3J0ZWQiLCJsb2NhbCIsInNpemUiLCJzZXQiLCJuYW1lIiwiZXhwb3J0ZWQiLCJuYW1lc3BhY2UiLCJib2R5IiwicGFyZW50IiwicHJvcGVydHkiLCJzbGljZSIsImhhcyIsImRlcmVmZXJlbmNlIiwib2JqZWN0IiwibmFtZXBhdGgiLCJjb21wdXRlZCIsInB1c2giXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxTQUFTQSxPQUFULENBQWlCQyxXQUFqQixFQUE4QjtBQUM1QixTQUFPLGdCQUFnQkEsWUFBWUMsV0FBWixHQUEwQixPQUFPRCxZQUFZQyxXQUE3QyxHQUEyRCxHQUEzRSxDQUFQO0FBQ0Q7O0FBRUQsU0FBU0MsY0FBVCxDQUF3QkMsUUFBeEIsRUFBa0M7QUFDaEMsTUFBSSxDQUFDQSxRQUFELElBQWEsQ0FBQ0EsU0FBU0MsR0FBM0IsRUFBZ0M7O0FBRWhDLE1BQUlKLFdBQUo7QUFDQSxNQUFJRyxTQUFTQyxHQUFULENBQWFDLElBQWIsQ0FBa0JDLElBQWxCLENBQXVCQyxLQUFLQSxFQUFFQyxL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QUFoQixFQUEwQjs7QUFFMUIsZ0JBQU0vQyxXQUFXc0MsVUFBVWhCLEdBQVYsQ0FBY3NCLFlBQVlILFFBQVosQ0FBcUJMLElBQW5DLENBQWpCOztBQUVBLGNBQUksQ0FBQ3BDLFFBQUwsRUFBZTtBQUNmLGdCQUFNSCxjQUFjRSxlQUFlQyxRQUFmLENBQXBCOztBQUVBLGNBQUlILFdBQUosRUFBaUI7QUFDZmdCLG9CQUFRWSxNQUFSLENBQWUsRUFBRVAsTUFBTTBCLFlBQVlILFFBQXBCLEVBQThCN0MsU0FBU0EsUUFBUUMsV0FBUixDQUF2QyxFQUFmO0FBQ0Q7O0FBRUQ7QUFDQWlELG1CQUFTRSxJQUFULENBQWNKLFlBQVlILFFBQVosQ0FBcUJMLElBQW5DO0FBQ0FFLHNCQUFZdEMsU0FBU3NDLFNBQXJCO0FBQ0FNLHdCQUFjQSxZQUFZSixNQUExQjtBQUNEO0FBQ0Y7QUFsREksS0FBUDtBQW9ERDtBQTNIYyxDQUFqQiIsImZpbGUiOiJuby1kZXByZWNhdGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRlY2xhcmVkU2NvcGUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9kZWNsYXJlZFNjb3BlJ1xyXG5pbXBvcnQgRXhwb3J0cyBmcm9tICcuLi9FeHBvcnRNYXAnXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG5mdW5jdGlvbiBtZXNzYWdlKGRlcHJlY2F0aW9uKSB7XHJcbiAgcmV0dXJuICdEZXByZWNhdGVkJyArIChkZXByZWNhdGlvbi5kZXNjcmlwdGlvbiA/ICc6ICcgKyBkZXByZWNhdGlvbi5kZXNjcmlwdGlvbiA6ICcuJylcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RGVwcmVjYXRpb24obWV0YWRhdGEpIHtcclxuICBpZiAoIW1ldGFkYXRhIHx8ICFtZXRhZGF0YS5kb2MpIHJldHVyblxyXG5cclxuICBsZXQgZGVwcmVjYXRpb25cclxuICBpZiAobWV0YWRhdGEuZG9jLnRhZ3Muc29tZSh0ID0+IHQudGl0bGUgPT09ICdkZXByZWNhdGVkJyAmJiAoZGVwcmVjYXRpb24gPSB0KSkpIHtcclxuICAgIHJldHVybiBkZXByZWNhdGlvblxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3N1Z2dlc3Rpb24nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICB1cmw6IGRvY3NVcmwoJ25vLWRlcHJlY2F0ZWQnKSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlOiBmdW5jdGlvbiAoY29udGV4dCkge1xyXG4gICAgY29uc3QgZGVwcmVjYXRlZCA9IG5ldyBNYXAoKVxyXG4gICAgICAgICwgbmFtZXNwYWNlcyA9IG5ldyBNYXAoKVxyXG5cclxuICAgIGZ1bmN0aW9uIGNoZWNrU3BlY2lmaWVycyhub2RlKSB7XHJcbiAgICAgIGlmIChub2RlLnR5cGUgIT09ICdJbXBvcnREZWNsYXJhdGlvbicpIHJldHVyblxyXG4gICAgICBpZiAobm9kZS5zb3VyY2UgPT0gbnVsbCkgcmV0dXJuIC8vIGxvY2FsIGV4cG9ydCwgaWdub3JlXHJcblxyXG4gICAgICBjb25zdCBpbXBvcnRzID0gRXhwb3J0cy5nZXQobm9kZS5zb3VyY2UudmFsdWUsIGNvbnRleHQpXHJcbiAgICAgIGlmIChpbXBvcnRzID09IG51bGwpIHJldHVyblxyXG5cclxuICAgICAgbGV0IG1vZHVsZURlcHJlY2F0aW9uXHJcbiAgICAgIGlmIChpbXBvcnRzLmRvYyAmJlxyXG4gICAgICAgICAgaW1wb3J0cy5kb2MudGFncy5zb21lKHQgPT4gdC50aXRsZSA9PT0gJ2RlcHJlY2F0ZWQnICYmIChtb2R1bGVEZXByZWNhdGlvbiA9IHQpKSkge1xyXG4gICAgICAgIGNvbnRleHQucmVwb3J0KHsgbm9kZSwgbWVzc2FnZTogbWVzc2FnZShtb2R1bGVEZXByZWNhdGlvbikgfSlcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGltcG9ydHMuZXJyb3JzLmxlbmd0aCkge1xyXG4gICAgICAgIGltcG9ydHMucmVwb3J0RXJyb3JzKGNvbnRleHQsIG5vZGUpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG5vZGUuc3BlY2lmaWVycy5mb3JFYWNoKGZ1bmN0aW9uIChpbSkge1xyXG4gICAgICAgIGxldCBpbXBvcnRlZCwgbG9jYWxcclxuICAgICAgICBzd2l0Y2ggKGltLnR5cGUpIHtcclxuXHJcblxyXG4gICAgICAgICAgY2FzZSAnSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyJzp7XHJcbiAgICAgICAgICAgIGlmICghaW1wb3J0cy5zaXplKSByZXR1cm5cclxuICAgICAgICAgICAgbmFtZXNwYWNlcy5zZXQoaW0ubG9jYWwubmFtZSwgaW1wb3J0cylcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY2FzZSAnSW1wb3J0RGVmYXVsdFNwZWNpZmllcic6XHJcbiAgICAgICAgICAgIGltcG9ydGVkID0gJ2RlZmF1bHQnXHJcbiAgICAgICAgICAgIGxvY2FsID0gaW0ubG9jYWwubmFtZVxyXG4gICAgICAgICAgICBicmVha1xyXG5cclxuICAgICAgICAgIGNhc2UgJ0ltcG9ydFNwZWNpZmllcic6XHJcbiAgICAgICAgICAgIGltcG9ydGVkID0gaW0uaW1wb3J0ZWQubmFtZVxyXG4gICAgICAgICAgICBsb2NhbCA9IGltLmxvY2FsLm5hbWVcclxuICAgICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gLy8gY2FuJ3QgaGFuZGxlIHRoaXMgb25lXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB1bmtub3duIHRoaW5nIGNhbid0IGJlIGRlcHJlY2F0ZWRcclxuICAgICAgICBjb25zdCBleHBvcnRlZCA9IGltcG9ydHMuZ2V0KGltcG9ydGVkKVxyXG4gICAgICAgIGlmIChleHBvcnRlZCA9PSBudWxsKSByZXR1cm5cclxuXHJcbiAgICAgICAgLy8gY2FwdHVyZSBpbXBvcnQgb2YgZGVlcCBuYW1lc3BhY2VcclxuICAgICAgICBpZiAoZXhwb3J0ZWQubmFtZXNwYWNlKSBuYW1lc3BhY2VzLnNldChsb2NhbCwgZXhwb3J0ZWQubmFtZXNwYWNlKVxyXG5cclxuICAgICAgICBjb25zdCBkZXByZWNhdGlvbiA9IGdldERlcHJlY2F0aW9uKGltcG9ydHMuZ2V0KGltcG9ydGVkKSlcclxuICAgICAgICBpZiAoIWRlcHJlY2F0aW9uKSByZXR1cm5cclxuXHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQoeyBub2RlOiBpbSwgbWVzc2FnZTogbWVzc2FnZShkZXByZWNhdGlvbikgfSlcclxuXHJcbiAgICAgICAgZGVwcmVjYXRlZC5zZXQobG9jYWwsIGRlcHJlY2F0aW9uKVxyXG5cclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAnUHJvZ3JhbSc6ICh7IGJvZHkgfSkgPT4gYm9keS5mb3JFYWNoKGNoZWNrU3BlY2lmaWVycyksXHJcblxyXG4gICAgICAnSWRlbnRpZmllcic6IGZ1bmN0aW9uIChub2RlKSB7XHJcbiAgICAgICAgaWYgKG5vZGUucGFyZW50LnR5cGUgPT09ICdNZW1iZXJFeHByZXNzaW9uJyAmJiBub2RlLnBhcmVudC5wcm9wZXJ0eSA9PT0gbm9kZSkge1xyXG4gICAgICAgICAgcmV0dXJuIC8vIGhhbmRsZWQgYnkgTWVtYmVyRXhwcmVzc2lvblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaWdub3JlIHNwZWNpZmllciBpZGVudGlmaWVyc1xyXG4gICAgICAgIGlmIChub2RlLnBhcmVudC50eXBlLnNsaWNlKDAsIDYpID09PSAnSW1wb3J0JykgcmV0dXJuXHJcblxyXG4gICAgICAgIGlmICghZGVwcmVjYXRlZC5oYXMobm9kZS5uYW1lKSkgcmV0dXJuXHJcblxyXG4gICAgICAgIGlmIChkZWNsYXJlZFNjb3BlKGNvbnRleHQsIG5vZGUubmFtZSkgIT09ICdtb2R1bGUnKSByZXR1cm5cclxuICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgbWVzc2FnZTogbWVzc2FnZShkZXByZWNhdGVkLmdldChub2RlLm5hbWUpKSxcclxuICAgICAgICB9KVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgJ01lbWJlckV4cHJlc3Npb24nOiBmdW5jdGlvbiAoZGVyZWZlcmVuY2UpIHtcclxuICAgICAgICBpZiAoZGVyZWZlcmVuY2Uub2JqZWN0LnR5cGUgIT09ICdJZGVudGlmaWVyJykgcmV0dXJuXHJcbiAgICAgICAgaWYgKCFuYW1lc3BhY2VzLmhhcyhkZXJlZmVyZW5jZS5vYmplY3QubmFtZSkpIHJldHVyblxyXG5cclxuICAgICAgICBpZiAoZGVjbGFyZWRTY29wZShjb250ZXh0LCBkZXJlZmVyZW5jZS5vYmplY3QubmFtZSkgIT09ICdtb2R1bGUnKSByZXR1cm5cclxuXHJcbiAgICAgICAgLy8gZ28gZGVlcFxyXG4gICAgICAgIHZhciBuYW1lc3BhY2UgPSBuYW1lc3BhY2VzLmdldChkZXJlZmVyZW5jZS5vYmplY3QubmFtZSlcclxuICAgICAgICB2YXIgbmFtZXBhdGggPSBbZGVyZWZlcmVuY2Uub2JqZWN0Lm5hbWVdXHJcbiAgICAgICAgLy8gd2hpbGUgcHJvcGVydHkgaXMgbmFtZXNwYWNlIGFuZCBwYXJlbnQgaXMgbWVtYmVyIGV4cHJlc3Npb24sIGtlZXAgdmFsaWRhdGluZ1xyXG4gICAgICAgIHdoaWxlIChuYW1lc3BhY2UgaW5zdGFuY2VvZiBFeHBvcnRzICYmXHJcbiAgICAgICAgICAgICAgIGRlcmVmZXJlbmNlLnR5cGUgPT09ICdNZW1iZXJFeHByZXNzaW9uJykge1xyXG5cclxuICAgICAgICAgIC8vIGlnbm9yZSBjb21wdXRlZCBwYXJ0cyBmb3Igbm93XHJcbiAgICAgICAgICBpZiAoZGVyZWZlcmVuY2UuY29tcHV0ZWQpIHJldHVyblxyXG5cclxuICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0gbmFtZXNwYWNlLmdldChkZXJlZmVyZW5jZS5wcm9wZXJ0eS5uYW1lKVxyXG5cclxuICAgICAgICAgIGlmICghbWV0YWRhdGEpIGJyZWFrXHJcbiAgICAgICAgICBjb25zdCBkZXByZWNhdGlvbiA9IGdldERlcHJlY2F0aW9uKG1ldGFkYXRhKVxyXG5cclxuICAgICAgICAgIGlmIChkZXByZWNhdGlvbikge1xyXG4gICAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7IG5vZGU6IGRlcmVmZXJlbmNlLnByb3BlcnR5LCBtZXNzYWdlOiBtZXNzYWdlKGRlcHJlY2F0aW9uKSB9KVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIHN0YXNoIGFuZCBwb3BcclxuICAgICAgICAgIG5hbWVwYXRoLnB1c2goZGVyZWZlcmVuY2UucHJvcGVydHkubmFtZSlcclxuICAgICAgICAgIG5hbWVzcGFjZSA9IG1ldGFkYXRhLm5hbWVzcGFjZVxyXG4gICAgICAgICAgZGVyZWZlcmVuY2UgPSBkZXJlZmVyZW5jZS5wYXJlbnRcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9XHJcbiAgfSxcclxufVxyXG4iXX0=