'use strict';

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('no-named-default')
    }
  },

  create: function (context) {
    return {
      'ImportDeclaration': function (node) {
        node.specifiers.forEach(function (im) {
          if (im.type === 'ImportSpecifier' && im.imported.name === 'default') {
            context.report({
              node: im.local,
              message: `Use default import syntax to import '${im.local.name}'.` });
          }
        });
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1uYW1lZC1kZWZhdWx0LmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJ1cmwiLCJjcmVhdGUiLCJjb250ZXh0Iiwibm9kZSIsInNwZWNpZmllcnMiLCJmb3JFYWNoIiwiaW0iLCJpbXBvcnRlZCIsIm5hbWUiLCJyZXBvcnQiLCJsb2NhbCIsIm1lc3NhZ2UiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztBQUVBQSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxZQURGO0FBRUpDLFVBQU07QUFDSkMsV0FBSyx1QkFBUSxrQkFBUjtBQUREO0FBRkYsR0FEUzs7QUFRZkMsVUFBUSxVQUFVQyxPQUFWLEVBQW1CO0FBQ3pCLFdBQU87QUFDTCwyQkFBcUIsVUFBVUMsSUFBVixFQUFnQjtBQUNuQ0EsYUFBS0MsVUFBTCxDQUFnQkMsT0FBaEIsQ0FBd0IsVUFBVUMsRUFBVixFQUFjO0FBQ3BDLGNBQUlBLEdBQUdSLElBQUgsS0FBWSxpQkFBWixJQUFpQ1EsR0FBR0MsUUFBSCxDQUFZQyxJQUFaLEtBQXFCLFNBQTFELEVBQXFFO0FBQ25FTixvQkFBUU8sTUFBUixDQUFlO0FBQ2JOLG9CQUFNRyxHQUFHSSxLQURJO0FBRWJDLHVCQUFVLHdDQUF1Q0wsR0FBR0ksS0FBSCxDQUFTRixJQUFLLElBRmxELEVBQWY7QUFHRDtBQUNGLFNBTkQ7QUFPRDtBQVRJLEtBQVA7QUFXRDtBQXBCYyxDQUFqQiIsImZpbGUiOiJuby1uYW1lZC1kZWZhdWx0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCdcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgdXJsOiBkb2NzVXJsKCduby1uYW1lZC1kZWZhdWx0JyksXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogZnVuY3Rpb24gKGNvbnRleHQpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICdJbXBvcnREZWNsYXJhdGlvbic6IGZ1bmN0aW9uIChub2RlKSB7XHJcbiAgICAgICAgbm9kZS5zcGVjaWZpZXJzLmZvckVhY2goZnVuY3Rpb24gKGltKSB7XHJcbiAgICAgICAgICBpZiAoaW0udHlwZSA9PT0gJ0ltcG9ydFNwZWNpZmllcicgJiYgaW0uaW1wb3J0ZWQubmFtZSA9PT0gJ2RlZmF1bHQnKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgICBub2RlOiBpbS5sb2NhbCxcclxuICAgICAgICAgICAgICBtZXNzYWdlOiBgVXNlIGRlZmF1bHQgaW1wb3J0IHN5bnRheCB0byBpbXBvcnQgJyR7aW0ubG9jYWwubmFtZX0nLmAgfSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICB9LFxyXG4gICAgfVxyXG4gIH0sXHJcbn1cclxuIl19