'use strict';

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const EXPORT_MESSAGE = 'Expected "export" or "export default"',
      IMPORT_MESSAGE = 'Expected "import" instead of "require()"'; /**
                                                                    * @fileoverview Rule to prefer ES6 to CJS
                                                                    * @author Jamund Ferguson
                                                                    */

function normalizeLegacyOptions(options) {
  if (options.indexOf('allow-primitive-modules') >= 0) {
    return { allowPrimitiveModules: true };
  }
  return options[0] || {};
}

function allowPrimitive(node, options) {
  if (!options.allowPrimitiveModules) return false;
  if (node.parent.type !== 'AssignmentExpression') return false;
  return node.parent.right.type !== 'ObjectExpression';
}

function allowRequire(node, options) {
  return options.allowRequire;
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const schemaString = { enum: ['allow-primitive-modules'] };
const schemaObject = {
  type: 'object',
  properties: {
    allowPrimitiveModules: { 'type': 'boolean' },
    allowRequire: { 'type': 'boolean' }
  },
  additionalProperties: false
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('no-commonjs')
    },

    schema: {
      anyOf: [{
        type: 'array',
        items: [schemaString],
        additionalItems: false
      }, {
        type: 'array',
        items: [schemaObject],
        additionalItems: false
      }]
    }
  },

  create: function (context) {
    const options = normalizeLegacyOptions(context.options);

    return {

      'MemberExpression': function (node) {

        // module.exports
        if (node.object.name === 'module' && node.property.name === 'exports') {
          if (allowPrimitive(node, options)) return;
          context.report({ node, message: EXPORT_MESSAGE });
        }

        // exports.
        if (node.object.name === 'exports') {
          const isInScope = context.getScope().variables.some(variable => variable.name === 'exports');
          if (!isInScope) {
            context.report({ node, message: EXPORT_MESSAGE });
          }
        }
      },
      'CallExpression': function (call) {
        if (context.getScope().type !== 'module') return;
        if (call.parent.type !== 'ExpressionStatement' && call.parent.type !== 'VariableDeclarator' && call.parent.type !== 'AssignmentExpression') return;

        if (call.callee.type !== 'Identifier') return;
        if (call.callee.name !== 'require') return;

        if (call.arguments.length !== 1) return;
        var module = call.arguments[0];

        if (module.type !== 'Literal') return;
        if (typeof module.value !== 'string') return;

        if (allowRequire(call, options)) return;

        // keeping it simple: all 1-string-arg `require` calls are reported
        context.report({
          node: call.callee,
          message: IMPORT_MESSAGE
        });
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1jb21tb25qcy5qcyJdLCJuYW1lcyI6WyJFWFBPUlRfTUVTU0FHRSIsIklNUE9SVF9NRVNTQUdFIiwibm9ybWFsaXplTGVnYWN5T3B0aW9ucyIsIm9wdGlvbnMiLCJpbmRleE9mIiwiYWxsb3dQcmltaXRpdmVNb2R1bGVzIiwiYWxsb3dQcmltaXRpdmUiLCJub2RlIiwicGFyZW50IiwidHlwZSIsInJpZ2h0IiwiYWxsb3dSZXF1aXJlIiwic2NoZW1hU3RyaW5nIiwiZW51bSIsInNjaGVtYU9iamVjdCIsInByb3BlcnRpZXMiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwiZG9jcyIsInVybCIsInNjaGVtYSIsImFueU9mIiwiaXRlbXMiLCJhZGRpdGlvbmFsSXRlbXMiLCJjcmVhdGUiLCJjb250ZXh0Iiwib2JqZWN0IiwibmFtZSIsInByb3BlcnR5IiwicmVwb3J0IiwibWVzc2FnZSIsImlzSW5TY29wZSIsImdldFNjb3BlIiwidmFyaWFibGVzIiwic29tZSIsInZhcmlhYmxlIiwiY2FsbCIsImNhbGxlZSIsImFyZ3VtZW50cyIsImxlbmd0aCIsInZhbHVlIl0sIm1hcHBpbmdzIjoiOztBQUtBOzs7Ozs7QUFFQSxNQUFNQSxpQkFBaUIsdUNBQXZCO0FBQUEsTUFDTUMsaUJBQWlCLDBDQUR2QixDLENBUEE7Ozs7O0FBVUEsU0FBU0Msc0JBQVQsQ0FBZ0NDLE9BQWhDLEVBQXlDO0FBQ3ZDLE1BQUlBLFFBQVFDLE9BQVIsQ0FBZ0IseUJBQWhCLEtBQThDLENBQWxELEVBQXFEO0FBQ25ELFdBQU8sRUFBRUMsdUJBQXVCLElBQXpCLEVBQVA7QUFDRDtBQUNELFNBQU9GLFFBQVEsQ0FBUixLQUFjLEVBQXJCO0FBQ0Q7O0FBRUQsU0FBU0csY0FBVCxDQUF3QkMsSUFBeEIsRUFBOEJKLE9BQTlCLEVBQXVDO0FBQ3JDLE1BQUksQ0FBQ0EsUUFBUUUscUJBQWIsRUFBb0MsT0FBTyxLQUFQO0FB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OztBQUV0QyxZQUFJL0IsYUFBYTJCLElBQWIsRUFBbUJuQyxPQUFuQixDQUFKLEVBQWlDOztBQUVqQztBQUNBd0IsZ0JBQVFJLE1BQVIsQ0FBZTtBQUNieEIsZ0JBQU0rQixLQUFLQyxNQURFO0FBRWJQLG1CQUFTL0I7QUFGSSxTQUFmO0FBSUQ7QUE3Q0ksS0FBUDtBQWdERDtBQTFFYyxDQUFqQiIsImZpbGUiOiJuby1jb21tb25qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gcHJlZmVyIEVTNiB0byBDSlNcclxuICogQGF1dGhvciBKYW11bmQgRmVyZ3Vzb25cclxuICovXHJcblxyXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJ1xyXG5cclxuY29uc3QgRVhQT1JUX01FU1NBR0UgPSAnRXhwZWN0ZWQgXCJleHBvcnRcIiBvciBcImV4cG9ydCBkZWZhdWx0XCInXHJcbiAgICAsIElNUE9SVF9NRVNTQUdFID0gJ0V4cGVjdGVkIFwiaW1wb3J0XCIgaW5zdGVhZCBvZiBcInJlcXVpcmUoKVwiJ1xyXG5cclxuZnVuY3Rpb24gbm9ybWFsaXplTGVnYWN5T3B0aW9ucyhvcHRpb25zKSB7XHJcbiAgaWYgKG9wdGlvbnMuaW5kZXhPZignYWxsb3ctcHJpbWl0aXZlLW1vZHVsZXMnKSA+PSAwKSB7XHJcbiAgICByZXR1cm4geyBhbGxvd1ByaW1pdGl2ZU1vZHVsZXM6IHRydWUgfVxyXG4gIH1cclxuICByZXR1cm4gb3B0aW9uc1swXSB8fCB7fVxyXG59XHJcblxyXG5mdW5jdGlvbiBhbGxvd1ByaW1pdGl2ZShub2RlLCBvcHRpb25zKSB7XHJcbiAgaWYgKCFvcHRpb25zLmFsbG93UHJpbWl0aXZlTW9kdWxlcykgcmV0dXJuIGZhbHNlXHJcbiAgaWYgKG5vZGUucGFyZW50LnR5cGUgIT09ICdBc3NpZ25tZW50RXhwcmVzc2lvbicpIHJldHVybiBmYWxzZVxyXG4gIHJldHVybiAobm9kZS5wYXJlbnQucmlnaHQudHlwZSAhPT0gJ09iamVjdEV4cHJlc3Npb24nKVxyXG59XHJcblxyXG5mdW5jdGlvbiBhbGxvd1JlcXVpcmUobm9kZSwgb3B0aW9ucykge1xyXG4gIHJldHVybiBvcHRpb25zLmFsbG93UmVxdWlyZVxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBSdWxlIERlZmluaXRpb25cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmNvbnN0IHNjaGVtYVN0cmluZyA9IHsgZW51bTogWydhbGxvdy1wcmltaXRpdmUtbW9kdWxlcyddIH1cclxuY29uc3Qgc2NoZW1hT2JqZWN0ID0ge1xyXG4gIHR5cGU6ICdvYmplY3QnLFxyXG4gIHByb3BlcnRpZXM6IHtcclxuICAgIGFsbG93UHJpbWl0aXZlTW9kdWxlczogeyAndHlwZSc6ICdib29sZWFuJyB9LFxyXG4gICAgYWxsb3dSZXF1aXJlOiB7ICd0eXBlJzogJ2Jvb2xlYW4nIH0sXHJcbiAgfSxcclxuICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgdXJsOiBkb2NzVXJsKCduby1jb21tb25qcycpLFxyXG4gICAgfSxcclxuXHJcbiAgICBzY2hlbWE6IHtcclxuICAgICAgYW55T2Y6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgICAgaXRlbXM6IFtzY2hlbWFTdHJpbmddLFxyXG4gICAgICAgICAgYWRkaXRpb25hbEl0ZW1zOiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgICBpdGVtczogW3NjaGVtYU9iamVjdF0sXHJcbiAgICAgICAgICBhZGRpdGlvbmFsSXRlbXM6IGZhbHNlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogZnVuY3Rpb24gKGNvbnRleHQpIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBub3JtYWxpemVMZWdhY3lPcHRpb25zKGNvbnRleHQub3B0aW9ucylcclxuXHJcbiAgICByZXR1cm4ge1xyXG5cclxuICAgICAgJ01lbWJlckV4cHJlc3Npb24nOiBmdW5jdGlvbiAobm9kZSkge1xyXG5cclxuICAgICAgICAvLyBtb2R1bGUuZXhwb3J0c1xyXG4gICAgICAgIGlmIChub2RlLm9iamVjdC5uYW1lID09PSAnbW9kdWxlJyAmJiBub2RlLnByb3BlcnR5Lm5hbWUgPT09ICdleHBvcnRzJykge1xyXG4gICAgICAgICAgaWYgKGFsbG93UHJpbWl0aXZlKG5vZGUsIG9wdGlvbnMpKSByZXR1cm5cclxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KHsgbm9kZSwgbWVzc2FnZTogRVhQT1JUX01FU1NBR0UgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGV4cG9ydHMuXHJcbiAgICAgICAgaWYgKG5vZGUub2JqZWN0Lm5hbWUgPT09ICdleHBvcnRzJykge1xyXG4gICAgICAgICAgY29uc3QgaXNJblNjb3BlID0gY29udGV4dC5nZXRTY29wZSgpXHJcbiAgICAgICAgICAgIC52YXJpYWJsZXNcclxuICAgICAgICAgICAgLnNvbWUodmFyaWFibGUgPT4gdmFyaWFibGUubmFtZSA9PT0gJ2V4cG9ydHMnKVxyXG4gICAgICAgICAgaWYgKCEgaXNJblNjb3BlKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHsgbm9kZSwgbWVzc2FnZTogRVhQT1JUX01FU1NBR0UgfSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9LFxyXG4gICAgICAnQ2FsbEV4cHJlc3Npb24nOiBmdW5jdGlvbiAoY2FsbCkge1xyXG4gICAgICAgIGlmIChjb250ZXh0LmdldFNjb3BlKCkudHlwZSAhPT0gJ21vZHVsZScpIHJldHVyblxyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgIGNhbGwucGFyZW50LnR5cGUgIT09ICdFeHByZXNzaW9uU3RhdGVtZW50J1xyXG4gICAgICAgICAgJiYgY2FsbC5wYXJlbnQudHlwZSAhPT0gJ1ZhcmlhYmxlRGVjbGFyYXRvcidcclxuICAgICAgICAgICYmIGNhbGwucGFyZW50LnR5cGUgIT09ICdBc3NpZ25tZW50RXhwcmVzc2lvbidcclxuICAgICAgICApIHJldHVyblxyXG5cclxuICAgICAgICBpZiAoY2FsbC5jYWxsZWUudHlwZSAhPT0gJ0lkZW50aWZpZXInKSByZXR1cm5cclxuICAgICAgICBpZiAoY2FsbC5jYWxsZWUubmFtZSAhPT0gJ3JlcXVpcmUnKSByZXR1cm5cclxuXHJcbiAgICAgICAgaWYgKGNhbGwuYXJndW1lbnRzLmxlbmd0aCAhPT0gMSkgcmV0dXJuXHJcbiAgICAgICAgdmFyIG1vZHVsZSA9IGNhbGwuYXJndW1lbnRzWzBdXHJcblxyXG4gICAgICAgIGlmIChtb2R1bGUudHlwZSAhPT0gJ0xpdGVyYWwnKSByZXR1cm5cclxuICAgICAgICBpZiAodHlwZW9mIG1vZHVsZS52YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVyblxyXG5cclxuICAgICAgICBpZiAoYWxsb3dSZXF1aXJlKGNhbGwsIG9wdGlvbnMpKSByZXR1cm5cclxuXHJcbiAgICAgICAgLy8ga2VlcGluZyBpdCBzaW1wbGU6IGFsbCAxLXN0cmluZy1hcmcgYHJlcXVpcmVgIGNhbGxzIGFyZSByZXBvcnRlZFxyXG4gICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgIG5vZGU6IGNhbGwuY2FsbGVlLFxyXG4gICAgICAgICAgbWVzc2FnZTogSU1QT1JUX01FU1NBR0UsXHJcbiAgICAgICAgfSlcclxuICAgICAgfSxcclxuICAgIH1cclxuXHJcbiAgfSxcclxufVxyXG4iXX0=