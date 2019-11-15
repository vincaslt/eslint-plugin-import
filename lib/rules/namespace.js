'use strict';

var _declaredScope = require('eslint-module-utils/declaredScope');

var _declaredScope2 = _interopRequireDefault(_declaredScope);

var _ExportMap = require('../ExportMap');

var _ExportMap2 = _interopRequireDefault(_ExportMap);

var _importDeclaration = require('../importDeclaration');

var _importDeclaration2 = _interopRequireDefault(_importDeclaration);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2.default)('namespace')
    },

    schema: [{
      'type': 'object',
      'properties': {
        'allowComputed': {
          'description': 'If `false`, will report computed (and thus, un-lintable) references ' + 'to namespace members.',
          'type': 'boolean',
          'default': false
        }
      },
      'additionalProperties': false
    }]
  },

  create: function namespaceRule(context) {

    // read options
    var _ref = context.options[0] || {},
        _ref$allowComputed = _ref.allowComputed;

    const allowComputed = _ref$allowComputed === undefined ? false : _ref$allowComputed;


    const namespaces = new Map();

    function makeMessage(last, namepath) {
      return `'${last.name}' not found in` + (namepath.length > 1 ? ' deeply ' : ' ') + `imported namespace '${namepath.join('.')}'.`;
    }

    return {

      // pick up all imports at body entry time, to properly respect hoisting
      Program: function (_ref2) {
        let body = _ref2.body;

        function processBodyStatement(declaration) {
          if (declaration.type !== 'ImportDeclaration') return;

          if (declaration.specifiers.length === 0) return;

          const imports = _ExportMap2.default.get(declaration.source.value, context);
          if (imports == null) return null;

          if (imports.errors.length) {
            imports.reportErrors(context, declaration);
            return;
          }

          for (const specifier of declaration.specifiers) {
            switch (specifier.type) {
              case 'ImportNamespaceSpecifier':
                if (!imports.size) {
                  context.report(specifier, `No exported names found in module '${declaration.source.value}'.`);
                }
                namespaces.set(specifier.local.name, imports);
                break;
              case 'ImportDefaultSpecifier':
              case 'ImportSpecifier':
                {
                  const meta = imports.get(
                  // default to 'default' for default http://i.imgur.com/nj6qAWy.jpg
                  specifier.imported ? specifier.imported.name : 'default');
                  if (!meta || !meta.namespace) break;
                  namespaces.set(specifier.local.name, meta.namespace);
                  break;
                }
            }
          }
        }
        body.forEach(processBodyStatement);
      },

      // same as above, but does not add names to local map
      ExportNamespaceSpecifier: function (namespace) {
        var declaration = (0, _importDeclaration2.default)(context);

        var imports = _ExportMap2.default.get(declaration.source.value, context);
        if (imports == null) return null;

        if (imports.errors.length) {
          imports.reportErrors(context, declaration);
          return;
        }

        if (!imports.size) {
          context.report(namespace, `No exported names found in module '${declaration.source.value}'.`);
        }
      },

      // todo: check for possible redefinition

      MemberExpression: function (dereference) {
        if (dereference.object.type !== 'Identifier') return;
        if (!namespaces.has(dereference.object.name)) return;

        if (dereference.parent.type === 'AssignmentExpression' && dereference.parent.left === dereference) {
          context.report(dereference.parent, `Assignment to member of namespace '${dereference.object.name}'.`);
        }

        // go deep
        var namespace = namespaces.get(dereference.object.name);
        var namepath = [dereference.object.name];
        // while property is namespace and parent is member expression, keep validating
        while (namespace instanceof _ExportMap2.default && dereference.type === 'MemberExpression') {

          if (dereference.computed) {
            if (!allowComputed) {
              context.report(dereference.property, 'Unable to validate computed reference to imported namespace \'' + dereference.object.name + '\'.');
            }
            return;
          }

          if (!namespace.has(dereference.property.name)) {
            context.report(dereference.property, makeMessage(dereference.property, namepath));
            break;
          }

          const exported = namespace.get(dereference.property.name);
          if (exported == null) return;

          // stash and pop
          namepath.push(dereference.property.name);
          namespace = exported.namespace;
          dereference = dereference.parent;
        }
      },

      VariableDeclarator: function (_ref3) {
        let id = _ref3.id,
            init = _ref3.init;

        if (init == null) return;
        if (init.type !== 'Identifier') return;
        if (!namespaces.has(init.name)) return;

        // check for redefinition in intermediate scopes
        if ((0, _declaredScope2.default)(context, init.name) !== 'module') return;

        // DFS traverse child namespaces
        function testKey(pattern, namespace) {
          let path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [init.name];

          if (!(namespace instanceof _ExportMap2.default)) return;

          if (pattern.type !== 'ObjectPattern') return;

          for (const property of pattern.properties) {
            if (property.type === 'ExperimentalRestProperty' || property.type === 'RestElement' || !property.key) {
              continue;
            }

            if (property.key.type !== 'Identifier') {
              context.report({
                node: property,
                message: 'Only destructure top-level names.'
              });
              continue;
            }

            if (!namespace.has(property.key.name)) {
              context.report({
                node: property,
                message: makeMessage(property.key, path)
              });
              continue;
            }

            path.push(property.key.name);
            const dependencyExportMap = namespace.get(property.key.name);
            // could be null when ignored or ambiguous
            if (dependencyExportMap !== null) {
              testKey(property.value, dependencyExportMap.namespace, path);
            }
            path.pop();
          }
        }

        testKey(id, namespaces.get(init.name));
      },

      JSXMemberExpression: function (_ref4) {
        let object = _ref4.object,
            property = _ref4.property;

        if (!namespaces.has(object.name)) return;
        var namespace = namespaces.get(object.name);
        if (!namespace.has(property.name)) {
          context.report({
            node: property,
            message: makeMessage(property, [object.name])
          });
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uYW1lc3BhY2UuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsInVybCIsInNjaGVtYSIsImNyZWF0ZSIsIm5hbWVzcGFjZVJ1bGUiLCJjb250ZXh0Iiwib3B0aW9ucyIsImFsbG93Q29tcHV0ZWQiLCJuYW1lc3BhY2VzIiwiTWFwIiwibWFrZU1lc3NhZ2UiLCJsYXN0IiwibmFtZXBhdGgiLCJuYW1lIiwibGVuZ3RoIiwiam9pbiIsIlByb2dyYW0iLCJib2R5IiwicHJvY2Vzc0JvZHlTdGF0ZW1lbnQiLCJkZWNsYXJhdGlvbiIsInNwZWNpZmllcnMiLCJpbXBvcnRzIiwiRXhwb3J0cyIsImdldCIsInNvdXJjZSIsInZhbHVlIiwiZXJyb3JzIiwicmVwb3J0RXJyb3JzIiwic3BlY2lmaWVyIiwic2l6ZSIsInJlcG9ydCIsInNldCIsImxvY2FsIiwiaW1wb3J0ZWQiLCJuYW1lc3BhY2UiLCJmb3JFYWNoIiwiRXhwb3J0TmFtZXNwYWNlU3BlY2lmaWVyIiwiTWVtYmVyRXhwcmVzc2lvbiIsImRlcmVmZXJlbmNlIiwib2JqZWN0IiwiaGFzIiwicGFyZW50IiwibGVmdCIsImNvbXB1dGVkIiwicHJvcGVydHkiLCJleHBvcnRlZCIsInB1c2giLCJWYXJpYWJsZURlY2xhcmF0b3IiLCJpZCIsImluaXQiLCJ0ZXN0S2V5IiwicGF0dGVybiIsInBhdGgiLCJwcm9wZXJ0aWVzIiwia2V5Iiwibm9kZSIsIm1lc3NhZ2UiLCJkZXBlbmRlbmN5RXhwb3J0TWFwIiwicG9wIiwiSlNYTWVtYmVyRXhwcmVzc2lvbiJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUFBLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKQyxVQUFNLFNBREY7QUFFSkMsVUFBTTtBQUNKQyxXQUFLLHVCQUFRLFdBQVI7QUFERCxLQUZGOztBQU1KQyxZQUFRLENBQ047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QUF0QixDQUFoQjtBQUNBLFlBQUksQ0FBQ3FCLFVBQVVNLEdBQVYsQ0FBY0ksU0FBUy9CLElBQXZCLENBQUwsRUFBbUM7QUFDakNSLGtCQUFReUIsTUFBUixDQUFlO0FBQ2J5QixrQkFBTVgsUUFETztBQUViWSxxQkFBUzlDLFlBQVlrQyxRQUFaLEVBQXNCLENBQUNMLE9BQU8xQixJQUFSLENBQXRCO0FBRkksV0FBZjtBQUlEO0FBQ0g7QUF0S0ksS0FBUDtBQXdLRDtBQS9NYyxDQUFqQiIsImZpbGUiOiJuYW1lc3BhY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVjbGFyZWRTY29wZSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL2RlY2xhcmVkU2NvcGUnXHJcbmltcG9ydCBFeHBvcnRzIGZyb20gJy4uL0V4cG9ydE1hcCdcclxuaW1wb3J0IGltcG9ydERlY2xhcmF0aW9uIGZyb20gJy4uL2ltcG9ydERlY2xhcmF0aW9uJ1xyXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJ1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3Byb2JsZW0nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICB1cmw6IGRvY3NVcmwoJ25hbWVzcGFjZScpLFxyXG4gICAgfSxcclxuXHJcbiAgICBzY2hlbWE6IFtcclxuICAgICAge1xyXG4gICAgICAgICd0eXBlJzogJ29iamVjdCcsXHJcbiAgICAgICAgJ3Byb3BlcnRpZXMnOiB7XHJcbiAgICAgICAgICAnYWxsb3dDb21wdXRlZCc6IHtcclxuICAgICAgICAgICAgJ2Rlc2NyaXB0aW9uJzpcclxuICAgICAgICAgICAgICAnSWYgYGZhbHNlYCwgd2lsbCByZXBvcnQgY29tcHV0ZWQgKGFuZCB0aHVzLCB1bi1saW50YWJsZSkgcmVmZXJlbmNlcyAnICtcclxuICAgICAgICAgICAgICAndG8gbmFtZXNwYWNlIG1lbWJlcnMuJyxcclxuICAgICAgICAgICAgJ3R5cGUnOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICAgICdkZWZhdWx0JzogZmFsc2UsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJzogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogZnVuY3Rpb24gbmFtZXNwYWNlUnVsZShjb250ZXh0KSB7XHJcblxyXG4gICAgLy8gcmVhZCBvcHRpb25zXHJcbiAgICBjb25zdCB7XHJcbiAgICAgIGFsbG93Q29tcHV0ZWQgPSBmYWxzZSxcclxuICAgIH0gPSBjb250ZXh0Lm9wdGlvbnNbMF0gfHwge31cclxuXHJcbiAgICBjb25zdCBuYW1lc3BhY2VzID0gbmV3IE1hcCgpXHJcblxyXG4gICAgZnVuY3Rpb24gbWFrZU1lc3NhZ2UobGFzdCwgbmFtZXBhdGgpIHtcclxuICAgICAgIHJldHVybiBgJyR7bGFzdC5uYW1lfScgbm90IGZvdW5kIGluYCArXHJcbiAgICAgICAgICAgICAgKG5hbWVwYXRoLmxlbmd0aCA+IDEgPyAnIGRlZXBseSAnIDogJyAnKSArXHJcbiAgICAgICAgICAgICAgYGltcG9ydGVkIG5hbWVzcGFjZSAnJHtuYW1lcGF0aC5qb2luKCcuJyl9Jy5gXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuXHJcbiAgICAgIC8vIHBpY2sgdXAgYWxsIGltcG9ydHMgYXQgYm9keSBlbnRyeSB0aW1lLCB0byBwcm9wZXJseSByZXNwZWN0IGhvaXN0aW5nXHJcbiAgICAgIFByb2dyYW06IGZ1bmN0aW9uICh7IGJvZHkgfSkge1xyXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NCb2R5U3RhdGVtZW50KGRlY2xhcmF0aW9uKSB7XHJcbiAgICAgICAgICBpZiAoZGVjbGFyYXRpb24udHlwZSAhPT0gJ0ltcG9ydERlY2xhcmF0aW9uJykgcmV0dXJuXHJcblxyXG4gICAgICAgICAgaWYgKGRlY2xhcmF0aW9uLnNwZWNpZmllcnMubGVuZ3RoID09PSAwKSByZXR1cm5cclxuXHJcbiAgICAgICAgICBjb25zdCBpbXBvcnRzID0gRXhwb3J0cy5nZXQoZGVjbGFyYXRpb24uc291cmNlLnZhbHVlLCBjb250ZXh0KVxyXG4gICAgICAgICAgaWYgKGltcG9ydHMgPT0gbnVsbCkgcmV0dXJuIG51bGxcclxuXHJcbiAgICAgICAgICBpZiAoaW1wb3J0cy5lcnJvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGltcG9ydHMucmVwb3J0RXJyb3JzKGNvbnRleHQsIGRlY2xhcmF0aW9uKVxyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBmb3IgKGNvbnN0IHNwZWNpZmllciBvZiBkZWNsYXJhdGlvbi5zcGVjaWZpZXJzKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoc3BlY2lmaWVyLnR5cGUpIHtcclxuICAgICAgICAgICAgICBjYXNlICdJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXInOlxyXG4gICAgICAgICAgICAgICAgaWYgKCFpbXBvcnRzLnNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoc3BlY2lmaWVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGBObyBleHBvcnRlZCBuYW1lcyBmb3VuZCBpbiBtb2R1bGUgJyR7ZGVjbGFyYXRpb24uc291cmNlLnZhbHVlfScuYClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG5hbWVzcGFjZXMuc2V0KHNwZWNpZmllci5sb2NhbC5uYW1lLCBpbXBvcnRzKVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICBjYXNlICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJzpcclxuICAgICAgICAgICAgICBjYXNlICdJbXBvcnRTcGVjaWZpZXInOiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZXRhID0gaW1wb3J0cy5nZXQoXHJcbiAgICAgICAgICAgICAgICAgIC8vIGRlZmF1bHQgdG8gJ2RlZmF1bHQnIGZvciBkZWZhdWx0IGh0dHA6Ly9pLmltZ3VyLmNvbS9uajZxQVd5LmpwZ1xyXG4gICAgICAgICAgICAgICAgICBzcGVjaWZpZXIuaW1wb3J0ZWQgPyBzcGVjaWZpZXIuaW1wb3J0ZWQubmFtZSA6ICdkZWZhdWx0JylcclxuICAgICAgICAgICAgICAgIGlmICghbWV0YSB8fCAhbWV0YS5uYW1lc3BhY2UpIGJyZWFrXHJcbiAgICAgICAgICAgICAgICBuYW1lc3BhY2VzLnNldChzcGVjaWZpZXIubG9jYWwubmFtZSwgbWV0YS5uYW1lc3BhY2UpXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBib2R5LmZvckVhY2gocHJvY2Vzc0JvZHlTdGF0ZW1lbnQpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBzYW1lIGFzIGFib3ZlLCBidXQgZG9lcyBub3QgYWRkIG5hbWVzIHRvIGxvY2FsIG1hcFxyXG4gICAgICBFeHBvcnROYW1lc3BhY2VTcGVjaWZpZXI6IGZ1bmN0aW9uIChuYW1lc3BhY2UpIHtcclxuICAgICAgICB2YXIgZGVjbGFyYXRpb24gPSBpbXBvcnREZWNsYXJhdGlvbihjb250ZXh0KVxyXG5cclxuICAgICAgICB2YXIgaW1wb3J0cyA9IEV4cG9ydHMuZ2V0KGRlY2xhcmF0aW9uLnNvdXJjZS52YWx1ZSwgY29udGV4dClcclxuICAgICAgICBpZiAoaW1wb3J0cyA9PSBudWxsKSByZXR1cm4gbnVsbFxyXG5cclxuICAgICAgICBpZiAoaW1wb3J0cy5lcnJvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBpbXBvcnRzLnJlcG9ydEVycm9ycyhjb250ZXh0LCBkZWNsYXJhdGlvbilcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFpbXBvcnRzLnNpemUpIHtcclxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KG5hbWVzcGFjZSxcclxuICAgICAgICAgICAgYE5vIGV4cG9ydGVkIG5hbWVzIGZvdW5kIGluIG1vZHVsZSAnJHtkZWNsYXJhdGlvbi5zb3VyY2UudmFsdWV9Jy5gKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIHRvZG86IGNoZWNrIGZvciBwb3NzaWJsZSByZWRlZmluaXRpb25cclxuXHJcbiAgICAgIE1lbWJlckV4cHJlc3Npb246IGZ1bmN0aW9uIChkZXJlZmVyZW5jZSkge1xyXG4gICAgICAgIGlmIChkZXJlZmVyZW5jZS5vYmplY3QudHlwZSAhPT0gJ0lkZW50aWZpZXInKSByZXR1cm5cclxuICAgICAgICBpZiAoIW5hbWVzcGFjZXMuaGFzKGRlcmVmZXJlbmNlLm9iamVjdC5uYW1lKSkgcmV0dXJuXHJcblxyXG4gICAgICAgIGlmIChkZXJlZmVyZW5jZS5wYXJlbnQudHlwZSA9PT0gJ0Fzc2lnbm1lbnRFeHByZXNzaW9uJyAmJlxyXG4gICAgICAgICAgICBkZXJlZmVyZW5jZS5wYXJlbnQubGVmdCA9PT0gZGVyZWZlcmVuY2UpIHtcclxuICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoZGVyZWZlcmVuY2UucGFyZW50LFxyXG4gICAgICAgICAgICAgICAgYEFzc2lnbm1lbnQgdG8gbWVtYmVyIG9mIG5hbWVzcGFjZSAnJHtkZXJlZmVyZW5jZS5vYmplY3QubmFtZX0nLmApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBnbyBkZWVwXHJcbiAgICAgICAgdmFyIG5hbWVzcGFjZSA9IG5hbWVzcGFjZXMuZ2V0KGRlcmVmZXJlbmNlLm9iamVjdC5uYW1lKVxyXG4gICAgICAgIHZhciBuYW1lcGF0aCA9IFtkZXJlZmVyZW5jZS5vYmplY3QubmFtZV1cclxuICAgICAgICAvLyB3aGlsZSBwcm9wZXJ0eSBpcyBuYW1lc3BhY2UgYW5kIHBhcmVudCBpcyBtZW1iZXIgZXhwcmVzc2lvbiwga2VlcCB2YWxpZGF0aW5nXHJcbiAgICAgICAgd2hpbGUgKG5hbWVzcGFjZSBpbnN0YW5jZW9mIEV4cG9ydHMgJiZcclxuICAgICAgICAgICAgICAgZGVyZWZlcmVuY2UudHlwZSA9PT0gJ01lbWJlckV4cHJlc3Npb24nKSB7XHJcblxyXG4gICAgICAgICAgaWYgKGRlcmVmZXJlbmNlLmNvbXB1dGVkKSB7XHJcbiAgICAgICAgICAgIGlmICghYWxsb3dDb21wdXRlZCkge1xyXG4gICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KGRlcmVmZXJlbmNlLnByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICAgJ1VuYWJsZSB0byB2YWxpZGF0ZSBjb21wdXRlZCByZWZlcmVuY2UgdG8gaW1wb3J0ZWQgbmFtZXNwYWNlIFxcJycgK1xyXG4gICAgICAgICAgICAgICAgZGVyZWZlcmVuY2Uub2JqZWN0Lm5hbWUgKyAnXFwnLicpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCFuYW1lc3BhY2UuaGFzKGRlcmVmZXJlbmNlLnByb3BlcnR5Lm5hbWUpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KFxyXG4gICAgICAgICAgICAgIGRlcmVmZXJlbmNlLnByb3BlcnR5LFxyXG4gICAgICAgICAgICAgIG1ha2VNZXNzYWdlKGRlcmVmZXJlbmNlLnByb3BlcnR5LCBuYW1lcGF0aCkpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3QgZXhwb3J0ZWQgPSBuYW1lc3BhY2UuZ2V0KGRlcmVmZXJlbmNlLnByb3BlcnR5Lm5hbWUpXHJcbiAgICAgICAgICBpZiAoZXhwb3J0ZWQgPT0gbnVsbCkgcmV0dXJuXHJcblxyXG4gICAgICAgICAgLy8gc3Rhc2ggYW5kIHBvcFxyXG4gICAgICAgICAgbmFtZXBhdGgucHVzaChkZXJlZmVyZW5jZS5wcm9wZXJ0eS5uYW1lKVxyXG4gICAgICAgICAgbmFtZXNwYWNlID0gZXhwb3J0ZWQubmFtZXNwYWNlXHJcbiAgICAgICAgICBkZXJlZmVyZW5jZSA9IGRlcmVmZXJlbmNlLnBhcmVudFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBWYXJpYWJsZURlY2xhcmF0b3I6IGZ1bmN0aW9uICh7IGlkLCBpbml0IH0pIHtcclxuICAgICAgICBpZiAoaW5pdCA9PSBudWxsKSByZXR1cm5cclxuICAgICAgICBpZiAoaW5pdC50eXBlICE9PSAnSWRlbnRpZmllcicpIHJldHVyblxyXG4gICAgICAgIGlmICghbmFtZXNwYWNlcy5oYXMoaW5pdC5uYW1lKSkgcmV0dXJuXHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGZvciByZWRlZmluaXRpb24gaW4gaW50ZXJtZWRpYXRlIHNjb3Blc1xyXG4gICAgICAgIGlmIChkZWNsYXJlZFNjb3BlKGNvbnRleHQsIGluaXQubmFtZSkgIT09ICdtb2R1bGUnKSByZXR1cm5cclxuXHJcbiAgICAgICAgLy8gREZTIHRyYXZlcnNlIGNoaWxkIG5hbWVzcGFjZXNcclxuICAgICAgICBmdW5jdGlvbiB0ZXN0S2V5KHBhdHRlcm4sIG5hbWVzcGFjZSwgcGF0aCA9IFtpbml0Lm5hbWVdKSB7XHJcbiAgICAgICAgICBpZiAoIShuYW1lc3BhY2UgaW5zdGFuY2VvZiBFeHBvcnRzKSkgcmV0dXJuXHJcblxyXG4gICAgICAgICAgaWYgKHBhdHRlcm4udHlwZSAhPT0gJ09iamVjdFBhdHRlcm4nKSByZXR1cm5cclxuXHJcbiAgICAgICAgICBmb3IgKGNvbnN0IHByb3BlcnR5IG9mIHBhdHRlcm4ucHJvcGVydGllcykge1xyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgcHJvcGVydHkudHlwZSA9PT0gJ0V4cGVyaW1lbnRhbFJlc3RQcm9wZXJ0eSdcclxuICAgICAgICAgICAgICB8fCBwcm9wZXJ0eS50eXBlID09PSAnUmVzdEVsZW1lbnQnXHJcbiAgICAgICAgICAgICAgfHwgIXByb3BlcnR5LmtleVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocHJvcGVydHkua2V5LnR5cGUgIT09ICdJZGVudGlmaWVyJykge1xyXG4gICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgICAgIG5vZGU6IHByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ09ubHkgZGVzdHJ1Y3R1cmUgdG9wLWxldmVsIG5hbWVzLicsXHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5hbWVzcGFjZS5oYXMocHJvcGVydHkua2V5Lm5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICAgICAgbm9kZTogcHJvcGVydHksXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBtYWtlTWVzc2FnZShwcm9wZXJ0eS5rZXksIHBhdGgpLFxyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgY29udGludWVcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGF0aC5wdXNoKHByb3BlcnR5LmtleS5uYW1lKVxyXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRlbmN5RXhwb3J0TWFwID0gbmFtZXNwYWNlLmdldChwcm9wZXJ0eS5rZXkubmFtZSlcclxuICAgICAgICAgICAgLy8gY291bGQgYmUgbnVsbCB3aGVuIGlnbm9yZWQgb3IgYW1iaWd1b3VzXHJcbiAgICAgICAgICAgIGlmIChkZXBlbmRlbmN5RXhwb3J0TWFwICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgdGVzdEtleShwcm9wZXJ0eS52YWx1ZSwgZGVwZW5kZW5jeUV4cG9ydE1hcC5uYW1lc3BhY2UsIHBhdGgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGF0aC5wb3AoKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGVzdEtleShpZCwgbmFtZXNwYWNlcy5nZXQoaW5pdC5uYW1lKSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIEpTWE1lbWJlckV4cHJlc3Npb246IGZ1bmN0aW9uKHtvYmplY3QsIHByb3BlcnR5fSkge1xyXG4gICAgICAgICBpZiAoIW5hbWVzcGFjZXMuaGFzKG9iamVjdC5uYW1lKSkgcmV0dXJuXHJcbiAgICAgICAgIHZhciBuYW1lc3BhY2UgPSBuYW1lc3BhY2VzLmdldChvYmplY3QubmFtZSlcclxuICAgICAgICAgaWYgKCFuYW1lc3BhY2UuaGFzKHByb3BlcnR5Lm5hbWUpKSB7XHJcbiAgICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICAgbm9kZTogcHJvcGVydHksXHJcbiAgICAgICAgICAgICBtZXNzYWdlOiBtYWtlTWVzc2FnZShwcm9wZXJ0eSwgW29iamVjdC5uYW1lXSksXHJcbiAgICAgICAgICAgfSlcclxuICAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfVxyXG4gIH0sXHJcbn1cclxuIl19