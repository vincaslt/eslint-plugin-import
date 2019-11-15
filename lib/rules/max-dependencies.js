'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _staticRequire = require('../core/staticRequire');

var _staticRequire2 = _interopRequireDefault(_staticRequire);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_MAX = 10;

const countDependencies = (dependencies, lastNode, context) => {
  var _ref = context.options[0] || { max: DEFAULT_MAX };

  const max = _ref.max;


  if (dependencies.size > max) {
    context.report(lastNode, `Maximum number of dependencies (${max}) exceeded.`);
  }
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('max-dependencies')
    },

    schema: [{
      'type': 'object',
      'properties': {
        'max': { 'type': 'number' }
      },
      'additionalProperties': false
    }]
  },

  create: context => {
    const dependencies = new Set(); // keep track of dependencies
    let lastNode; // keep track of the last node to report on

    return {
      ImportDeclaration(node) {
        dependencies.add(node.source.value);
        lastNode = node.source;
      },

      CallExpression(node) {
        if ((0, _staticRequire2.default)(node)) {
          var _node$arguments = _slicedToArray(node.arguments, 1);

          const requirePath = _node$arguments[0];

          dependencies.add(requirePath.value);
          lastNode = node;
        }
      },

      'Program:exit': function () {
        countDependencies(dependencies, lastNode, context);
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9tYXgtZGVwZW5kZW5jaWVzLmpzIl0sIm5hbWVzIjpbIkRFRkFVTFRfTUFYIiwiY291bnREZXBlbmRlbmNpZXMiLCJkZXBlbmRlbmNpZXMiLCJsYXN0Tm9kZSIsImNvbnRleHQiLCJvcHRpb25zIiwibWF4Iiwic2l6ZSIsInJlcG9ydCIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJ1cmwiLCJzY2hlbWEiLCJjcmVhdGUiLCJTZXQiLCJJbXBvcnREZWNsYXJhdGlvbiIsIm5vZGUiLCJhZGQiLCJzb3VyY2UiLCJ2YWx1ZSIsIkNhbGxFeHByZXNzaW9uIiwiYXJndW1lbnRzIiwicmVxdWlyZVBhdGgiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7OztBQUNBOzs7Ozs7QUFFQSxNQUFNQSxjQUFjLEVBQXBCOztBQUVBLE1BQU1DLG9CQUFvQixDQUFDQyxZQUFELEVBQWVDLFFBQWYsRUFBeUJDLE9BQXpCLEtBQXFDO0FBQUEsYUFDL0NBLFFBQVFDLE9BQVIsQ0FBZ0IsQ0FBaEIsS0FBc0IsRUFBRUMsS0FBS04sV0FBUCxFQUR5Qjs7QUFBQSxRQUN0RE0sR0FEc0QsUUFDdERBLEdBRHNEOzs7QUFHN0QsTUFBSUosYUFBYUssSUFBYixHQUFvQkQsR0FBeEIsRUFBNkI7QUFDM0JGLFlBQVFJLE1BQVIsQ0FDRUwsUUFERixFQUVHLG1DQUFrQ0csR0FBSSxhQUZ6QztBQUlEO0FBQ0YsQ0FURDs7QUFXQUcsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pDLFVBQU0sWUFERjtBQUVKQyxVQUFNO0FBQ0pDLFdBQUssdUJBQVEsa0JBQVI7QUFERCxLQUZGOztBQU1KQyxZQUFRLENBQ047QUFDRSxjQUFRLFFBRFY7QUFFRSxvQkFBYztBQUNaLGVBQU8sRUFBRSxRQUFRLFFBQVY7QUFESyxPQUZoQjtBQUtFLDhCQUF3QjtBQUwxQixLQURNO0FBTkosR0FEUzs7QUFrQmZDLFVBQVFaLFdBQVc7QUFDakIsVUFBTUYsZUFBZSxJQUFJZSxHQUFKLEVBQXJCLENBRGlCLENBQ2M7QUFDL0IsUUFBSWQsUUFBSixDQUZpQixDQUVKOztBQUViLFdBQU87QUFDTGUsd0JBQWtCQyxJQUFsQixFQUF3QjtBQUN0QmpCLHFCQUFha0IsR0FBYixDQUFpQkQsS0FBS0UsTUFBTCxDQUFZQyxLQUE3QjtBQUNBbkIsbUJBQVdnQixLQUFLRSxNQUFoQjtBQUNELE9BSkk7O0FBTUxFLHFCQUFlSixJQUFmLEVBQXFCO0FBQ25CLFlBQUksNkJBQWdCQSxJQUFoQixDQUFKLEVBQTJCO0FBQUEsK0NBQ0RBLEtBQUtLLFNBREo7O0FBQUEsZ0JBQ2pCQyxXQURpQjs7QUFFekJ2Qix1QkFBYWtCLEdBQWIsQ0FBaUJLLFlBQVlILEtBQTdCO0FBQ0FuQixxQkFBV2dCLElBQVg7QUFDRDtBQUNGLE9BWkk7O0FBY0wsc0JBQWdCLFlBQVk7QUFDMUJsQiwwQkFBa0JDLFlBQWxCLEVBQWdDQyxRQUFoQyxFQUEwQ0MsT0FBMUM7QUFDRDtBQWhCSSxLQUFQO0FBa0JEO0FBeENjLENBQWpCIiwiZmlsZSI6Im1heC1kZXBlbmRlbmNpZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaXNTdGF0aWNSZXF1aXJlIGZyb20gJy4uL2NvcmUvc3RhdGljUmVxdWlyZSdcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCdcclxuXHJcbmNvbnN0IERFRkFVTFRfTUFYID0gMTBcclxuXHJcbmNvbnN0IGNvdW50RGVwZW5kZW5jaWVzID0gKGRlcGVuZGVuY2llcywgbGFzdE5vZGUsIGNvbnRleHQpID0+IHtcclxuICBjb25zdCB7bWF4fSA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7IG1heDogREVGQVVMVF9NQVggfVxyXG5cclxuICBpZiAoZGVwZW5kZW5jaWVzLnNpemUgPiBtYXgpIHtcclxuICAgIGNvbnRleHQucmVwb3J0KFxyXG4gICAgICBsYXN0Tm9kZSxcclxuICAgICAgYE1heGltdW0gbnVtYmVyIG9mIGRlcGVuZGVuY2llcyAoJHttYXh9KSBleGNlZWRlZC5gXHJcbiAgICApXHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIHVybDogZG9jc1VybCgnbWF4LWRlcGVuZGVuY2llcycpLFxyXG4gICAgfSxcclxuXHJcbiAgICBzY2hlbWE6IFtcclxuICAgICAge1xyXG4gICAgICAgICd0eXBlJzogJ29iamVjdCcsXHJcbiAgICAgICAgJ3Byb3BlcnRpZXMnOiB7XHJcbiAgICAgICAgICAnbWF4JzogeyAndHlwZSc6ICdudW1iZXInIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnYWRkaXRpb25hbFByb3BlcnRpZXMnOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlOiBjb250ZXh0ID0+IHtcclxuICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IG5ldyBTZXQoKSAvLyBrZWVwIHRyYWNrIG9mIGRlcGVuZGVuY2llc1xyXG4gICAgbGV0IGxhc3ROb2RlIC8vIGtlZXAgdHJhY2sgb2YgdGhlIGxhc3Qgbm9kZSB0byByZXBvcnQgb25cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBJbXBvcnREZWNsYXJhdGlvbihub2RlKSB7XHJcbiAgICAgICAgZGVwZW5kZW5jaWVzLmFkZChub2RlLnNvdXJjZS52YWx1ZSlcclxuICAgICAgICBsYXN0Tm9kZSA9IG5vZGUuc291cmNlXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBDYWxsRXhwcmVzc2lvbihub2RlKSB7XHJcbiAgICAgICAgaWYgKGlzU3RhdGljUmVxdWlyZShub2RlKSkge1xyXG4gICAgICAgICAgY29uc3QgWyByZXF1aXJlUGF0aCBdID0gbm9kZS5hcmd1bWVudHNcclxuICAgICAgICAgIGRlcGVuZGVuY2llcy5hZGQocmVxdWlyZVBhdGgudmFsdWUpXHJcbiAgICAgICAgICBsYXN0Tm9kZSA9IG5vZGVcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAnUHJvZ3JhbTpleGl0JzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGNvdW50RGVwZW5kZW5jaWVzKGRlcGVuZGVuY2llcywgbGFzdE5vZGUsIGNvbnRleHQpXHJcbiAgICAgIH0sXHJcbiAgICB9XHJcbiAgfSxcclxufVxyXG4iXX0=