'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _importType = require('../core/importType');

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const enumValues = { enum: ['always', 'ignorePackages', 'never'] };
const patternProperties = {
  type: 'object',
  patternProperties: { '.*': enumValues }
};
const properties = {
  type: 'object',
  properties: {
    'pattern': patternProperties,
    'ignorePackages': { type: 'boolean' }
  }
};

function buildProperties(context) {

  const result = {
    defaultConfig: 'never',
    pattern: {},
    ignorePackages: false
  };

  context.options.forEach(obj => {

    // If this is a string, set defaultConfig to its value
    if (typeof obj === 'string') {
      result.defaultConfig = obj;
      return;
    }

    // If this is not the new structure, transfer all props to result.pattern
    if (obj.pattern === undefined && obj.ignorePackages === undefined) {
      Object.assign(result.pattern, obj);
      return;
    }

    // If pattern is provided, transfer all props
    if (obj.pattern !== undefined) {
      Object.assign(result.pattern, obj.pattern);
    }

    // If ignorePackages is provided, transfer it to result
    if (obj.ignorePackages !== undefined) {
      result.ignorePackages = obj.ignorePackages;
    }
  });

  return result;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('extensions')
    },

    schema: {
      anyOf: [{
        type: 'array',
        items: [enumValues],
        additionalItems: false
      }, {
        type: 'array',
        items: [enumValues, properties],
        additionalItems: false
      }, {
        type: 'array',
        items: [properties],
        additionalItems: false
      }, {
        type: 'array',
        items: [patternProperties],
        additionalItems: false
      }, {
        type: 'array',
        items: [enumValues, patternProperties],
        additionalItems: false
      }]
    }
  },

  create: function (context) {

    const props = buildProperties(context);

    function getModifier(extension) {
      return props.pattern[extension] || props.defaultConfig;
    }

    function isUseOfExtensionRequired(extension, isPackageMain) {
      return getModifier(extension) === 'always' && (!props.ignorePackages || !isPackageMain);
    }

    function isUseOfExtensionForbidden(extension) {
      return getModifier(extension) === 'never';
    }

    function isResolvableWithoutExtension(file) {
      const extension = _path2.default.extname(file);
      const fileWithoutExtension = file.slice(0, -extension.length);
      const resolvedFileWithoutExtension = (0, _resolve2.default)(fileWithoutExtension, context);

      return resolvedFileWithoutExtension === (0, _resolve2.default)(file, context);
    }

    function checkFileExtension(node) {
      const source = node.source;

      // bail if the declaration doesn't have a source, e.g. "export { foo };"

      if (!source) return;

      const importPath = source.value;

      // don't enforce anything on builtins
      if ((0, _importType.isBuiltIn)(importPath, context.settings)) return;

      const resolvedPath = (0, _resolve2.default)(importPath, context);

      // get extension from resolved path, if possible.
      // for unresolved, use source value.
      const extension = _path2.default.extname(resolvedPath || importPath).substring(1);

      // determine if this is a module
      const isPackageMain = (0, _importType.isExternalModuleMain)(importPath, context.settings) || (0, _importType.isScopedMain)(importPath);

      if (!extension || !importPath.endsWith(`.${extension}`)) {
        const extensionRequired = isUseOfExtensionRequired(extension, isPackageMain);
        const extensionForbidden = isUseOfExtensionForbidden(extension);
        if (extensionRequired && !extensionForbidden) {
          context.report({
            node: source,
            message: `Missing file extension ${extension ? `"${extension}" ` : ''}for "${importPath}"`
          });
        }
      } else if (extension) {
        if (isUseOfExtensionForbidden(extension) && isResolvableWithoutExtension(importPath)) {
          context.report({
            node: source,
            message: `Unexpected use of file extension "${extension}" for "${importPath}"`
          });
        }
      }
    }

    return {
      ImportDeclaration: checkFileExtension,
      ExportNamedDeclaration: checkFileExtension
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9leHRlbnNpb25zLmpzIl0sIm5hbWVzIjpbImVudW1WYWx1ZXMiLCJlbnVtIiwicGF0dGVyblByb3BlcnRpZXMiLCJ0eXBlIiwicHJvcGVydGllcyIsImJ1aWxkUHJvcGVydGllcyIsImNvbnRleHQiLCJyZXN1bHQiLCJkZWZhdWx0Q29uZmlnIiwicGF0dGVybiIsImlnbm9yZVBhY2thZ2VzIiwib3B0aW9ucyIsImZvckVhY2giLCJvYmoiLCJ1bmRlZmluZWQiLCJPYmplY3QiLCJhc3NpZ24iLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsImRvY3MiLCJ1cmwiLCJzY2hlbWEiLCJhbnlPZiIsIml0ZW1zIiwiYWRkaXRpb25hbEl0ZW1zIiwiY3JlYXRlIiwicHJvcHMiLCJnZXRNb2RpZmllciIsImV4dGVuc2lvbiIsImlzVXNlT2ZFeHRlbnNpb25SZXF1aXJlZCIsImlzUGFja2FnZU1haW4iLCJpc1VzZU9mRXh0ZW5zaW9uRm9yYmlkZGVuIiwiaXNSZXNvbHZhYmxlV2l0aG91dEV4dGVuc2lvbiIsImZpbGUiLCJwYXRoIiwiZXh0bmFtZSIsImZpbGVXaXRob3V0RXh0ZW5zaW9uIiwic2xpY2UiLCJsZW5ndGgiLCJyZXNvbHZlZEZpbGVXaXRob3V0RXh0ZW5zaW9uIiwiY2hlY2tGaWxlRXh0ZW5zaW9uIiwibm9kZSIsInNvdXJjZSIsImltcG9ydFBhdGgiLCJ2YWx1ZSIsInNldHRpbmdzIiwicmVzb2x2ZWRQYXRoIiwic3Vic3RyaW5nIiwiZW5kc1dpdGgiLCJleHRlbnNpb25SZXF1aXJlZCIsImV4dGVuc2lvbkZvcmJpZGRlbiIsInJlcG9ydCIsIm1lc3NhZ2UiLCJJbXBvcnREZWNsYXJhdGlvbiIsIkV4cG9ydE5hbWVkRGVjbGFyYXRpb24iXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7QUFFQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFFQSxNQUFNQSxhQUFhLEVBQUVDLE1BQU0sQ0FBRSxRQUFGLEVBQVksZ0JBQVosRUFBOEIsT0FB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SUFBR0EsU0FBVSxJQUExQixHQUFnQyxFQUFHLFFBQU9lLFVBQVc7QUFIcEUsV0FBZjtBQUtEO0FBQ0YsT0FWRCxNQVVPLElBQUlmLFNBQUosRUFBZTtBQUNwQixZQUFJRywwQkFBMEJILFNBQTFCLEtBQXdDSSw2QkFBNkJXLFVBQTdCLENBQTVDLEVBQXNGO0FBQ3BGdEMsa0JBQVE4QyxNQUFSLENBQWU7QUFDYlYsa0JBQU1DLE1BRE87QUFFYlUscUJBQVUscUNBQW9DeEIsU0FBVSxVQUFTZSxVQUFXO0FBRi9ELFdBQWY7QUFJRDtBQUNGO0FBQ0Y7O0FBRUQsV0FBTztBQUNMVSx5QkFBbUJiLGtCQURkO0FBRUxjLDhCQUF3QmQ7QUFGbkIsS0FBUDtBQUlEO0FBakhjLENBQWpCIiwiZmlsZSI6ImV4dGVuc2lvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5cclxuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJ1xyXG5pbXBvcnQgeyBpc0J1aWx0SW4sIGlzRXh0ZXJuYWxNb2R1bGVNYWluLCBpc1Njb3BlZE1haW4gfSBmcm9tICcuLi9jb3JlL2ltcG9ydFR5cGUnXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG5jb25zdCBlbnVtVmFsdWVzID0geyBlbnVtOiBbICdhbHdheXMnLCAnaWdub3JlUGFja2FnZXMnLCAnbmV2ZXInIF0gfVxyXG5jb25zdCBwYXR0ZXJuUHJvcGVydGllcyA9IHtcclxuICB0eXBlOiAnb2JqZWN0JyxcclxuICBwYXR0ZXJuUHJvcGVydGllczogeyAnLionOiBlbnVtVmFsdWVzIH0sXHJcbn1cclxuY29uc3QgcHJvcGVydGllcyA9IHtcclxuICB0eXBlOiAnb2JqZWN0JyxcclxuICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAncGF0dGVybic6IHBhdHRlcm5Qcm9wZXJ0aWVzLFxyXG4gICAgJ2lnbm9yZVBhY2thZ2VzJzogeyB0eXBlOiAnYm9vbGVhbicgfSxcclxuICB9LFxyXG59XHJcblxyXG5mdW5jdGlvbiBidWlsZFByb3BlcnRpZXMoY29udGV4dCkge1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IHtcclxuICAgICAgZGVmYXVsdENvbmZpZzogJ25ldmVyJyxcclxuICAgICAgcGF0dGVybjoge30sXHJcbiAgICAgIGlnbm9yZVBhY2thZ2VzOiBmYWxzZSxcclxuICAgIH1cclxuXHJcbiAgICBjb250ZXh0Lm9wdGlvbnMuZm9yRWFjaChvYmogPT4ge1xyXG5cclxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHN0cmluZywgc2V0IGRlZmF1bHRDb25maWcgdG8gaXRzIHZhbHVlXHJcbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIHJlc3VsdC5kZWZhdWx0Q29uZmlnID0gb2JqXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIHRoaXMgaXMgbm90IHRoZSBuZXcgc3RydWN0dXJlLCB0cmFuc2ZlciBhbGwgcHJvcHMgdG8gcmVzdWx0LnBhdHRlcm5cclxuICAgICAgaWYgKG9iai5wYXR0ZXJuID09PSB1bmRlZmluZWQgJiYgb2JqLmlnbm9yZVBhY2thZ2VzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBPYmplY3QuYXNzaWduKHJlc3VsdC5wYXR0ZXJuLCBvYmopXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIHBhdHRlcm4gaXMgcHJvdmlkZWQsIHRyYW5zZmVyIGFsbCBwcm9wc1xyXG4gICAgICBpZiAob2JqLnBhdHRlcm4gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24ocmVzdWx0LnBhdHRlcm4sIG9iai5wYXR0ZXJuKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiBpZ25vcmVQYWNrYWdlcyBpcyBwcm92aWRlZCwgdHJhbnNmZXIgaXQgdG8gcmVzdWx0XHJcbiAgICAgIGlmIChvYmouaWdub3JlUGFja2FnZXMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJlc3VsdC5pZ25vcmVQYWNrYWdlcyA9IG9iai5pZ25vcmVQYWNrYWdlc1xyXG4gICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIHJldHVybiByZXN1bHRcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3N1Z2dlc3Rpb24nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICB1cmw6IGRvY3NVcmwoJ2V4dGVuc2lvbnMnKSxcclxuICAgIH0sXHJcblxyXG4gICAgc2NoZW1hOiB7XHJcbiAgICAgIGFueU9mOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICAgIGl0ZW1zOiBbZW51bVZhbHVlc10sXHJcbiAgICAgICAgICBhZGRpdGlvbmFsSXRlbXM6IGZhbHNlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgIGVudW1WYWx1ZXMsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXMsXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgYWRkaXRpb25hbEl0ZW1zOiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgICBpdGVtczogW3Byb3BlcnRpZXNdLFxyXG4gICAgICAgICAgYWRkaXRpb25hbEl0ZW1zOiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgICBpdGVtczogW3BhdHRlcm5Qcm9wZXJ0aWVzXSxcclxuICAgICAgICAgIGFkZGl0aW9uYWxJdGVtczogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgZW51bVZhbHVlcyxcclxuICAgICAgICAgICAgcGF0dGVyblByb3BlcnRpZXMsXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgYWRkaXRpb25hbEl0ZW1zOiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICBjcmVhdGU6IGZ1bmN0aW9uIChjb250ZXh0KSB7XHJcblxyXG4gICAgY29uc3QgcHJvcHMgPSBidWlsZFByb3BlcnRpZXMoY29udGV4dClcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRNb2RpZmllcihleHRlbnNpb24pIHtcclxuICAgICAgcmV0dXJuIHByb3BzLnBhdHRlcm5bZXh0ZW5zaW9uXSB8fCBwcm9wcy5kZWZhdWx0Q29uZmlnXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaXNVc2VPZkV4dGVuc2lvblJlcXVpcmVkKGV4dGVuc2lvbiwgaXNQYWNrYWdlTWFpbikge1xyXG4gICAgICByZXR1cm4gZ2V0TW9kaWZpZXIoZXh0ZW5zaW9uKSA9PT0gJ2Fsd2F5cycgJiYgKCFwcm9wcy5pZ25vcmVQYWNrYWdlcyB8fCAhaXNQYWNrYWdlTWFpbilcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc1VzZU9mRXh0ZW5zaW9uRm9yYmlkZGVuKGV4dGVuc2lvbikge1xyXG4gICAgICByZXR1cm4gZ2V0TW9kaWZpZXIoZXh0ZW5zaW9uKSA9PT0gJ25ldmVyJ1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlzUmVzb2x2YWJsZVdpdGhvdXRFeHRlbnNpb24oZmlsZSkge1xyXG4gICAgICBjb25zdCBleHRlbnNpb24gPSBwYXRoLmV4dG5hbWUoZmlsZSlcclxuICAgICAgY29uc3QgZmlsZVdpdGhvdXRFeHRlbnNpb24gPSBmaWxlLnNsaWNlKDAsIC1leHRlbnNpb24ubGVuZ3RoKVxyXG4gICAgICBjb25zdCByZXNvbHZlZEZpbGVXaXRob3V0RXh0ZW5zaW9uID0gcmVzb2x2ZShmaWxlV2l0aG91dEV4dGVuc2lvbiwgY29udGV4dClcclxuXHJcbiAgICAgIHJldHVybiByZXNvbHZlZEZpbGVXaXRob3V0RXh0ZW5zaW9uID09PSByZXNvbHZlKGZpbGUsIGNvbnRleHQpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2hlY2tGaWxlRXh0ZW5zaW9uKG5vZGUpIHtcclxuICAgICAgY29uc3QgeyBzb3VyY2UgfSA9IG5vZGVcclxuXHJcbiAgICAgIC8vIGJhaWwgaWYgdGhlIGRlY2xhcmF0aW9uIGRvZXNuJ3QgaGF2ZSBhIHNvdXJjZSwgZS5nLiBcImV4cG9ydCB7IGZvbyB9O1wiXHJcbiAgICAgIGlmICghc291cmNlKSByZXR1cm5cclxuXHJcbiAgICAgIGNvbnN0IGltcG9ydFBhdGggPSBzb3VyY2UudmFsdWVcclxuXHJcbiAgICAgIC8vIGRvbid0IGVuZm9yY2UgYW55dGhpbmcgb24gYnVpbHRpbnNcclxuICAgICAgaWYgKGlzQnVpbHRJbihpbXBvcnRQYXRoLCBjb250ZXh0LnNldHRpbmdzKSkgcmV0dXJuXHJcblxyXG4gICAgICBjb25zdCByZXNvbHZlZFBhdGggPSByZXNvbHZlKGltcG9ydFBhdGgsIGNvbnRleHQpXHJcblxyXG4gICAgICAvLyBnZXQgZXh0ZW5zaW9uIGZyb20gcmVzb2x2ZWQgcGF0aCwgaWYgcG9zc2libGUuXHJcbiAgICAgIC8vIGZvciB1bnJlc29sdmVkLCB1c2Ugc291cmNlIHZhbHVlLlxyXG4gICAgICBjb25zdCBleHRlbnNpb24gPSBwYXRoLmV4dG5hbWUocmVzb2x2ZWRQYXRoIHx8IGltcG9ydFBhdGgpLnN1YnN0cmluZygxKVxyXG5cclxuICAgICAgLy8gZGV0ZXJtaW5lIGlmIHRoaXMgaXMgYSBtb2R1bGVcclxuICAgICAgY29uc3QgaXNQYWNrYWdlTWFpbiA9IGlzRXh0ZXJuYWxNb2R1bGVNYWluKGltcG9ydFBhdGgsIGNvbnRleHQuc2V0dGluZ3MpXHJcbiAgICAgICAgfHwgaXNTY29wZWRNYWluKGltcG9ydFBhdGgpXHJcblxyXG4gICAgICBpZiAoIWV4dGVuc2lvbiB8fCAhaW1wb3J0UGF0aC5lbmRzV2l0aChgLiR7ZXh0ZW5zaW9ufWApKSB7XHJcbiAgICAgICAgY29uc3QgZXh0ZW5zaW9uUmVxdWlyZWQgPSBpc1VzZU9mRXh0ZW5zaW9uUmVxdWlyZWQoZXh0ZW5zaW9uLCBpc1BhY2thZ2VNYWluKVxyXG4gICAgICAgIGNvbnN0IGV4dGVuc2lvbkZvcmJpZGRlbiA9IGlzVXNlT2ZFeHRlbnNpb25Gb3JiaWRkZW4oZXh0ZW5zaW9uKVxyXG4gICAgICAgIGlmIChleHRlbnNpb25SZXF1aXJlZCAmJiAhZXh0ZW5zaW9uRm9yYmlkZGVuKSB7XHJcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICAgIG5vZGU6IHNvdXJjZSxcclxuICAgICAgICAgICAgbWVzc2FnZTpcclxuICAgICAgICAgICAgICBgTWlzc2luZyBmaWxlIGV4dGVuc2lvbiAke2V4dGVuc2lvbiA/IGBcIiR7ZXh0ZW5zaW9ufVwiIGAgOiAnJ31mb3IgXCIke2ltcG9ydFBhdGh9XCJgLFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAoZXh0ZW5zaW9uKSB7XHJcbiAgICAgICAgaWYgKGlzVXNlT2ZFeHRlbnNpb25Gb3JiaWRkZW4oZXh0ZW5zaW9uKSAmJiBpc1Jlc29sdmFibGVXaXRob3V0RXh0ZW5zaW9uKGltcG9ydFBhdGgpKSB7XHJcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICAgIG5vZGU6IHNvdXJjZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogYFVuZXhwZWN0ZWQgdXNlIG9mIGZpbGUgZXh0ZW5zaW9uIFwiJHtleHRlbnNpb259XCIgZm9yIFwiJHtpbXBvcnRQYXRofVwiYCxcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgSW1wb3J0RGVjbGFyYXRpb246IGNoZWNrRmlsZUV4dGVuc2lvbixcclxuICAgICAgRXhwb3J0TmFtZWREZWNsYXJhdGlvbjogY2hlY2tGaWxlRXh0ZW5zaW9uLFxyXG4gICAgfVxyXG4gIH0sXHJcbn1cclxuIl19