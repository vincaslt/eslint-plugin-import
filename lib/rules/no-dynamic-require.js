'use strict';

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isRequire(node) {
  return node && node.callee && node.callee.type === 'Identifier' && node.callee.name === 'require' && node.arguments.length >= 1;
}

function isStaticValue(arg) {
  return arg.type === 'Literal' || arg.type === 'TemplateLiteral' && arg.expressions.length === 0;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('no-dynamic-require')
    }
  },

  create: function (context) {
    return {
      CallExpression(node) {
        if (isRequire(node) && !isStaticValue(node.arguments[0])) {
          context.report({
            node,
            message: 'Calls to require() should use string literals'
          });
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1keW5hbWljLXJlcXVpcmUuanMiXSwibmFtZXMiOlsiaXNSZXF1aXJlIiwibm9kZSIsImNhbGxlZSIsInR5cGUiLCJuYW1lIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiaXNTdGF0aWNWYWx1ZSIsImFyZyIsImV4cHJlc3Npb25zIiwibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJkb2NzIiwidXJsIiwiY3JlYXRlIiwiY29udGV4dCIsIkNhbGxFeHByZXNzaW9uIiwicmVwb3J0IiwibWVzc2FnZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0FBRUEsU0FBU0EsU0FBVCxDQUFtQkMsSUFBbkIsRUFBeUI7QUFDdkIsU0FBT0EsUUFDTEEsS0FBS0MsTUFEQSxJQUVMRCxLQUFLQyxNQUFMLENBQVlDLElBQVosS0FBcUIsWUFGaEIsSUFHTEYsS0FBS0MsTUFBTCxDQUFZRSxJQUFaLEtBQXFCLFNBSGhCLElBSUxILEtBQUtJLFNBQUwsQ0FBZUMsTUFBZixJQUF5QixDQUozQjtBQUtEOztBQUVELFNBQVNDLGFBQVQsQ0FBdUJDLEdBQXZCLEVBQTRCO0FBQzFCLFNBQU9BLElBQUlMLElBQUosS0FBYSxTQUFiLElBQ0pLLElBQUlMLElBQUosS0FBYSxpQkFBYixJQUFrQ0ssSUFBSUMsV0FBSixDQUFnQkgsTUFBaEIsS0FBMkIsQ0FEaEU7QUFFRDs7QUFFREksT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pULFVBQU0sWUFERjtBQUVKVSxVQUFNO0FBQ0pDLFdBQUssdUJBQVEsb0JBQVI7QUFERDtBQUZGLEdBRFM7O0FBUWZDLFVBQVEsVUFBVUMsT0FBVixFQUFtQjtBQUN6QixXQUFPO0FBQ0xDLHFCQUFlaEIsSUFBZixFQUFxQjtBQUNuQixZQUFJRCxVQUFVQyxJQUFWLEtBQW1CLENBQUNNLGNBQWNOLEtBQUtJLFNBQUwsQ0FBZSxDQUFmLENBQWQsQ0FBeEIsRUFBMEQ7QUFDeERXLGtCQUFRRSxNQUFSLENBQWU7QUFDYmpCLGdCQURhO0FBRWJrQixxQkFBUztBQUZJLFdBQWY7QUFJRDtBQUNGO0FBUkksS0FBUDtBQVVEO0FBbkJjLENBQWpCIiwiZmlsZSI6Im5vLWR5bmFtaWMtcmVxdWlyZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG5mdW5jdGlvbiBpc1JlcXVpcmUobm9kZSkge1xyXG4gIHJldHVybiBub2RlICYmXHJcbiAgICBub2RlLmNhbGxlZSAmJlxyXG4gICAgbm9kZS5jYWxsZWUudHlwZSA9PT0gJ0lkZW50aWZpZXInICYmXHJcbiAgICBub2RlLmNhbGxlZS5uYW1lID09PSAncmVxdWlyZScgJiZcclxuICAgIG5vZGUuYXJndW1lbnRzLmxlbmd0aCA+PSAxXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzU3RhdGljVmFsdWUoYXJnKSB7XHJcbiAgcmV0dXJuIGFyZy50eXBlID09PSAnTGl0ZXJhbCcgfHxcclxuICAgIChhcmcudHlwZSA9PT0gJ1RlbXBsYXRlTGl0ZXJhbCcgJiYgYXJnLmV4cHJlc3Npb25zLmxlbmd0aCA9PT0gMClcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3N1Z2dlc3Rpb24nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICB1cmw6IGRvY3NVcmwoJ25vLWR5bmFtaWMtcmVxdWlyZScpLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICBjcmVhdGU6IGZ1bmN0aW9uIChjb250ZXh0KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBDYWxsRXhwcmVzc2lvbihub2RlKSB7XHJcbiAgICAgICAgaWYgKGlzUmVxdWlyZShub2RlKSAmJiAhaXNTdGF0aWNWYWx1ZShub2RlLmFyZ3VtZW50c1swXSkpIHtcclxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogJ0NhbGxzIHRvIHJlcXVpcmUoKSBzaG91bGQgdXNlIHN0cmluZyBsaXRlcmFscycsXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH1cclxuICB9LFxyXG59XHJcbiJdfQ==