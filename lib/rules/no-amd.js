'use strict';

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
      url: (0, _docsUrl2.default)('no-amd')
    }
  },

  create: function (context) {
    return {
      'CallExpression': function (node) {
        if (context.getScope().type !== 'module') return;

        if (node.callee.type !== 'Identifier') return;
        if (node.callee.name !== 'require' && node.callee.name !== 'define') return;

        // todo: capture define((require, module, exports) => {}) form?
        if (node.arguments.length !== 2) return;

        const modules = node.arguments[0];
        if (modules.type !== 'ArrayExpression') return;

        // todo: check second arg type? (identifier or callback)

        context.report(node, `Expected imports instead of AMD ${node.callee.name}().`);
      }
    };
  }
}; /**
    * @fileoverview Rule to prefer imports to AMD
    * @author Jamund Ferguson
    */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1hbWQuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsInVybCIsImNyZWF0ZSIsImNvbnRleHQiLCJub2RlIiwiZ2V0U2NvcGUiLCJjYWxsZWUiLCJuYW1lIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwibW9kdWxlcyIsInJlcG9ydCJdLCJtYXBwaW5ncyI6Ijs7QUFLQTs7Ozs7O0FBRUE7QUFDQTtBQUNBOztBQUVBQSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxZQURGO0FBRUpDLFVBQU07QUFDSkMsV0FBSyx1QkFBUSxRQUFSO0FBREQ7QUFGRixHQURTOztBQVFmQyxVQUFRLFVBQVVDLE9BQVYsRUFBbUI7QUFDekIsV0FBTztBQUNMLHdCQUFrQixVQUFVQyxJQUFWLEVBQWdCO0FBQ2hDLFlBQUlELFFBQVFFLFFBQVIsR0FBbUJOLElBQW5CLEtBQTRCLFFBQWhDLEVBQTBDOztBQUUxQyxZQUFJSyxLQUFLRSxNQUFMLENBQVlQLElBQVosS0FBcUIsWUFBekIsRUFBdUM7QUFDdkMsWUFBSUssS0FBS0UsTUFBTCxDQUFZQyxJQUFaLEtBQXFCLFNBQXJCLElBQ0FILEtBQUtFLE1BQUwsQ0FBWUMsSUFBWixLQUFxQixRQUR6QixFQUNtQzs7QUFFbkM7QUFDQSxZQUFJSCxLQUFLSSxTQUFMLENBQWVDLE1BQWYsS0FBMEIsQ0FBOUIsRUFBaUM7O0FBRWpDLGNBQU1DLFVBQVVOLEtBQUtJLFNBQUwsQ0FBZSxDQUFmLENBQWhCO0FBQ0EsWUFBSUUsUUFBUVgsSUFBUixLQUFpQixpQkFBckIsRUFBd0M7O0FBRXhDOztBQUVBSSxnQkFBUVEsTUFBUixDQUFlUCxJQUFmLEVBQXNCLG1DQUFrQ0EsS0FBS0UsTUFBTCxDQUFZQyxJQUFLLEtBQXpFO0FBQ0Q7QUFqQkksS0FBUDtBQW9CRDtBQTdCYyxDQUFqQixDLENBWEEiLCJmaWxlIjoibm8tYW1kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byBwcmVmZXIgaW1wb3J0cyB0byBBTURcclxuICogQGF1dGhvciBKYW11bmQgRmVyZ3Vzb25cclxuICovXHJcblxyXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJ1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gUnVsZSBEZWZpbml0aW9uXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tYW1kJyksXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogZnVuY3Rpb24gKGNvbnRleHQpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICdDYWxsRXhwcmVzc2lvbic6IGZ1bmN0aW9uIChub2RlKSB7XHJcbiAgICAgICAgaWYgKGNvbnRleHQuZ2V0U2NvcGUoKS50eXBlICE9PSAnbW9kdWxlJykgcmV0dXJuXHJcblxyXG4gICAgICAgIGlmIChub2RlLmNhbGxlZS50eXBlICE9PSAnSWRlbnRpZmllcicpIHJldHVyblxyXG4gICAgICAgIGlmIChub2RlLmNhbGxlZS5uYW1lICE9PSAncmVxdWlyZScgJiZcclxuICAgICAgICAgICAgbm9kZS5jYWxsZWUubmFtZSAhPT0gJ2RlZmluZScpIHJldHVyblxyXG5cclxuICAgICAgICAvLyB0b2RvOiBjYXB0dXJlIGRlZmluZSgocmVxdWlyZSwgbW9kdWxlLCBleHBvcnRzKSA9PiB7fSkgZm9ybT9cclxuICAgICAgICBpZiAobm9kZS5hcmd1bWVudHMubGVuZ3RoICE9PSAyKSByZXR1cm5cclxuXHJcbiAgICAgICAgY29uc3QgbW9kdWxlcyA9IG5vZGUuYXJndW1lbnRzWzBdXHJcbiAgICAgICAgaWYgKG1vZHVsZXMudHlwZSAhPT0gJ0FycmF5RXhwcmVzc2lvbicpIHJldHVyblxyXG5cclxuICAgICAgICAvLyB0b2RvOiBjaGVjayBzZWNvbmQgYXJnIHR5cGU/IChpZGVudGlmaWVyIG9yIGNhbGxiYWNrKVxyXG5cclxuICAgICAgICBjb250ZXh0LnJlcG9ydChub2RlLCBgRXhwZWN0ZWQgaW1wb3J0cyBpbnN0ZWFkIG9mIEFNRCAke25vZGUuY2FsbGVlLm5hbWV9KCkuYClcclxuICAgICAgfSxcclxuICAgIH1cclxuXHJcbiAgfSxcclxufVxyXG4iXX0=