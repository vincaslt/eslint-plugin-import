'use strict';

var _ExportMap = require('../ExportMap');

var _ExportMap2 = _interopRequireDefault(_ExportMap);

var _importDeclaration = require('../importDeclaration');

var _importDeclaration2 = _interopRequireDefault(_importDeclaration);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('no-named-as-default-member')
    }
  },

  create: function (context) {

    const fileImports = new Map();
    const allPropertyLookups = new Map();

    function handleImportDefault(node) {
      const declaration = (0, _importDeclaration2.default)(context);
      const exportMap = _ExportMap2.default.get(declaration.source.value, context);
      if (exportMap == null) return;

      if (exportMap.errors.length) {
        exportMap.reportErrors(context, declaration);
        return;
      }

      fileImports.set(node.local.name, {
        exportMap,
        sourcePath: declaration.source.value
      });
    }

    function storePropertyLookup(objectName, propName, node) {
      const lookups = allPropertyLookups.get(objectName) || [];
      lookups.push({ node, propName });
      allPropertyLookups.set(objectName, lookups);
    }

    function handlePropLookup(node) {
      const objectName = node.object.name;
      const propName = node.property.name;
      storePropertyLookup(objectName, propName, node);
    }

    function handleDestructuringAssignment(node) {
      const isDestructure = node.id.type === 'ObjectPattern' && node.init != null && node.init.type === 'Identifier';
      if (!isDestructure) return;

      const objectName = node.init.name;
      for (const _ref of node.id.properties) {
        const key = _ref.key;

        if (key == null) continue; // true for rest properties
        storePropertyLookup(objectName, key.name, key);
      }
    }

    function handleProgramExit() {
      allPropertyLookups.forEach((lookups, objectName) => {
        const fileImport = fileImports.get(objectName);
        if (fileImport == null) return;

        for (const _ref2 of lookups) {
          const propName = _ref2.propName;
          const node = _ref2.node;

          // the default import can have a "default" property
          if (propName === 'default') continue;
          if (!fileImport.exportMap.namespace.has(propName)) continue;

          context.report({
            node,
            message: `Caution: \`${objectName}\` also has a named export ` + `\`${propName}\`. Check if you meant to write ` + `\`import {${propName}} from '${fileImport.sourcePath}'\` ` + 'instead.'
          });
        }
      });
    }

    return {
      'ImportDefaultSpecifier': handleImportDefault,
      'MemberExpression': handlePropLookup,
      'VariableDeclarator': handleDestructuringAssignment,
      'Program:exit': handleProgramExit
    };
  }
}; /**
    * @fileoverview Rule to warn about potentially confused use of name exports
    * @author Desmond Brand
    * @copyright 2016 Desmond Brand. All rights reserved.
    * See LICENSE in root directory for full license.
    */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1uYW1lZC1hcy1kZWZhdWx0LW1lbWJlci5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwidXJsIiwiY3JlYXRlIiwiY29udGV4dCIsImZpbGVJbXBvcnRzIiwiTWFwIiwiYWxsUHJvcGVydHlMb29rdXBzIiwiaGFuZGxlSW1wb3J0RGVmYXVsdCIsIm5vZGUiLCJkZWNsYXJhdGlvbiIsImV4cG9ydE1hcCIsIkV4cG9ydHMiLCJnZXQiLCJzb3VyY2UiLCJ2YWx1ZSIsImVycm9ycyIsImxlbmd0aCIsInJlcG9ydEVycm9ycyIsInNldCIsImxvY2FsIiwibmFtZSIsInNvdXJjZVBhdGgiLCJzdG9yZVByb3BlcnR5TG9va3VwIiwib2JqZWN0TmFtZSIsInByb3BOYW1lIiwibG9va3VwcyIsInB1c2giLCJoYW5kbGVQcm9wTG9va3VwIiwib2JqZWN0IiwicHJvcGVydHkiLCJoYW5kbGVEZXN0cnVjdHVyaW5nQXNzaWdubWVudCIsImlzRGVzdHJ1Y3R1cmUiLCJpZCIsImluaXQiLCJwcm9wZXJ0aWVzIiwia2V5IiwiaGFuZGxlUHJvZ3JhbUV4aXQiLCJmb3JFYWNoIiwiZmlsZUltcG9ydCIsIm5hbWVzcGFjZSIsImhhcyIsInJlcG9ydCIsIm1lc3NhZ2UiXSwibWFwcGluZ3MiOiI7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQTtBQUNBO0FBQ0E7O0FBRUFBLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKQyxVQUFNLFlBREY7QUFFSkMsVUFBTTtBQUNKQyxXQUFLLHVCQUFRLDRCQUFSO0FBREQ7QUFGRixHQURTOztBQVFmQyxVQUFRLFVBQVNDLE9BQVQsRUFBa0I7O0FBRXhCLFVBQU1DLGNBQWMsSUFBSUMsR0FBSixFQUFwQjtBQUNBLFVBQU1DLHFCQUFxQixJQUFJRCxHQUFKLEVBQTNCOztBQUVBLGFBQVNFLG1CQUFULENBQTZCQyxJQUE3QixFQUFtQztBQUNq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O0FBTUQ7QUFyRmMsQ0FBakIsQyxDQWRBIiwiZmlsZSI6Im5vLW5hbWVkLWFzLWRlZmF1bHQtbWVtYmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byB3YXJuIGFib3V0IHBvdGVudGlhbGx5IGNvbmZ1c2VkIHVzZSBvZiBuYW1lIGV4cG9ydHNcclxuICogQGF1dGhvciBEZXNtb25kIEJyYW5kXHJcbiAqIEBjb3B5cmlnaHQgMjAxNiBEZXNtb25kIEJyYW5kLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiBTZWUgTElDRU5TRSBpbiByb290IGRpcmVjdG9yeSBmb3IgZnVsbCBsaWNlbnNlLlxyXG4gKi9cclxuaW1wb3J0IEV4cG9ydHMgZnJvbSAnLi4vRXhwb3J0TWFwJ1xyXG5pbXBvcnQgaW1wb3J0RGVjbGFyYXRpb24gZnJvbSAnLi4vaW1wb3J0RGVjbGFyYXRpb24nXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBSdWxlIERlZmluaXRpb25cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgdXJsOiBkb2NzVXJsKCduby1uYW1lZC1hcy1kZWZhdWx0LW1lbWJlcicpLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICBjcmVhdGU6IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuXHJcbiAgICBjb25zdCBmaWxlSW1wb3J0cyA9IG5ldyBNYXAoKVxyXG4gICAgY29uc3QgYWxsUHJvcGVydHlMb29rdXBzID0gbmV3IE1hcCgpXHJcblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlSW1wb3J0RGVmYXVsdChub2RlKSB7XHJcbiAgICAgIGNvbnN0IGRlY2xhcmF0aW9uID0gaW1wb3J0RGVjbGFyYXRpb24oY29udGV4dClcclxuICAgICAgY29uc3QgZXhwb3J0TWFwID0gRXhwb3J0cy5nZXQoZGVjbGFyYXRpb24uc291cmNlLnZhbHVlLCBjb250ZXh0KVxyXG4gICAgICBpZiAoZXhwb3J0TWFwID09IG51bGwpIHJldHVyblxyXG5cclxuICAgICAgaWYgKGV4cG9ydE1hcC5lcnJvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgZXhwb3J0TWFwLnJlcG9ydEVycm9ycyhjb250ZXh0LCBkZWNsYXJhdGlvbilcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgZmlsZUltcG9ydHMuc2V0KG5vZGUubG9jYWwubmFtZSwge1xyXG4gICAgICAgIGV4cG9ydE1hcCxcclxuICAgICAgICBzb3VyY2VQYXRoOiBkZWNsYXJhdGlvbi5zb3VyY2UudmFsdWUsXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc3RvcmVQcm9wZXJ0eUxvb2t1cChvYmplY3ROYW1lLCBwcm9wTmFtZSwgbm9kZSkge1xyXG4gICAgICBjb25zdCBsb29rdXBzID0gYWxsUHJvcGVydHlMb29rdXBzLmdldChvYmplY3ROYW1lKSB8fCBbXVxyXG4gICAgICBsb29rdXBzLnB1c2goe25vZGUsIHByb3BOYW1lfSlcclxuICAgICAgYWxsUHJvcGVydHlMb29rdXBzLnNldChvYmplY3ROYW1lLCBsb29rdXBzKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZVByb3BMb29rdXAobm9kZSkge1xyXG4gICAgICBjb25zdCBvYmplY3ROYW1lID0gbm9kZS5vYmplY3QubmFtZVxyXG4gICAgICBjb25zdCBwcm9wTmFtZSA9IG5vZGUucHJvcGVydHkubmFtZVxyXG4gICAgICBzdG9yZVByb3BlcnR5TG9va3VwKG9iamVjdE5hbWUsIHByb3BOYW1lLCBub2RlKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZURlc3RydWN0dXJpbmdBc3NpZ25tZW50KG5vZGUpIHtcclxuICAgICAgY29uc3QgaXNEZXN0cnVjdHVyZSA9IChcclxuICAgICAgICBub2RlLmlkLnR5cGUgPT09ICdPYmplY3RQYXR0ZXJuJyAmJlxyXG4gICAgICAgIG5vZGUuaW5pdCAhPSBudWxsICYmXHJcbiAgICAgICAgbm9kZS5pbml0LnR5cGUgPT09ICdJZGVudGlmaWVyJ1xyXG4gICAgICApXHJcbiAgICAgIGlmICghaXNEZXN0cnVjdHVyZSkgcmV0dXJuXHJcblxyXG4gICAgICBjb25zdCBvYmplY3ROYW1lID0gbm9kZS5pbml0Lm5hbWVcclxuICAgICAgZm9yIChjb25zdCB7IGtleSB9IG9mIG5vZGUuaWQucHJvcGVydGllcykge1xyXG4gICAgICAgIGlmIChrZXkgPT0gbnVsbCkgY29udGludWUgIC8vIHRydWUgZm9yIHJlc3QgcHJvcGVydGllc1xyXG4gICAgICAgIHN0b3JlUHJvcGVydHlMb29rdXAob2JqZWN0TmFtZSwga2V5Lm5hbWUsIGtleSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZVByb2dyYW1FeGl0KCkge1xyXG4gICAgICBhbGxQcm9wZXJ0eUxvb2t1cHMuZm9yRWFjaCgobG9va3Vwcywgb2JqZWN0TmFtZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZpbGVJbXBvcnQgPSBmaWxlSW1wb3J0cy5nZXQob2JqZWN0TmFtZSlcclxuICAgICAgICBpZiAoZmlsZUltcG9ydCA9PSBudWxsKSByZXR1cm5cclxuXHJcbiAgICAgICAgZm9yIChjb25zdCB7cHJvcE5hbWUsIG5vZGV9IG9mIGxvb2t1cHMpIHtcclxuICAgICAgICAgIC8vIHRoZSBkZWZhdWx0IGltcG9ydCBjYW4gaGF2ZSBhIFwiZGVmYXVsdFwiIHByb3BlcnR5XHJcbiAgICAgICAgICBpZiAocHJvcE5hbWUgPT09ICdkZWZhdWx0JykgY29udGludWVcclxuICAgICAgICAgIGlmICghZmlsZUltcG9ydC5leHBvcnRNYXAubmFtZXNwYWNlLmhhcyhwcm9wTmFtZSkpIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAoXHJcbiAgICAgICAgICAgICAgYENhdXRpb246IFxcYCR7b2JqZWN0TmFtZX1cXGAgYWxzbyBoYXMgYSBuYW1lZCBleHBvcnQgYCArXHJcbiAgICAgICAgICAgICAgYFxcYCR7cHJvcE5hbWV9XFxgLiBDaGVjayBpZiB5b3UgbWVhbnQgdG8gd3JpdGUgYCArXHJcbiAgICAgICAgICAgICAgYFxcYGltcG9ydCB7JHtwcm9wTmFtZX19IGZyb20gJyR7ZmlsZUltcG9ydC5zb3VyY2VQYXRofSdcXGAgYCArXHJcbiAgICAgICAgICAgICAgJ2luc3RlYWQuJ1xyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgJ0ltcG9ydERlZmF1bHRTcGVjaWZpZXInOiBoYW5kbGVJbXBvcnREZWZhdWx0LFxyXG4gICAgICAnTWVtYmVyRXhwcmVzc2lvbic6IGhhbmRsZVByb3BMb29rdXAsXHJcbiAgICAgICdWYXJpYWJsZURlY2xhcmF0b3InOiBoYW5kbGVEZXN0cnVjdHVyaW5nQXNzaWdubWVudCxcclxuICAgICAgJ1Byb2dyYW06ZXhpdCc6IGhhbmRsZVByb2dyYW1FeGl0LFxyXG4gICAgfVxyXG4gIH0sXHJcbn1cclxuIl19