'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = docsUrl;

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const repoUrl = 'https://github.com/benmosher/eslint-plugin-import';

function docsUrl(ruleName) {
  let commitish = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : `v${_package2.default.version}`;

  return `${repoUrl}/blob/${commitish}/docs/rules/${ruleName}.md`;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kb2NzVXJsLmpzIl0sIm5hbWVzIjpbImRvY3NVcmwiLCJyZXBvVXJsIiwicnVsZU5hbWUiLCJjb21taXRpc2giLCJwa2ciLCJ2ZXJzaW9uIl0sIm1hcHBpbmdzIjoiOzs7OztrQkFJd0JBLE87O0FBSnhCOzs7Ozs7QUFFQSxNQUFNQyxVQUFVLG1EQUFoQjs7QUFFZSxTQUFTRCxPQUFULENBQWlCRSxRQUFqQixFQUEwRDtBQUFBLE1BQS9CQyxTQUErQix1RUFBbEIsSUFBR0Msa0JBQUlDLE9BQVEsRUFBRzs7QUFDdkUsU0FBUSxHQUFFSixPQUFRLFNBQVFFLFNBQVUsZUFBY0QsUUFBUyxLQUEzRDtBQUNEIiwiZmlsZSI6ImRvY3NVcmwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGtnIGZyb20gJy4uL3BhY2thZ2UuanNvbidcclxuXHJcbmNvbnN0IHJlcG9VcmwgPSAnaHR0cHM6Ly9naXRodWIuY29tL2Jlbm1vc2hlci9lc2xpbnQtcGx1Z2luLWltcG9ydCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRvY3NVcmwocnVsZU5hbWUsIGNvbW1pdGlzaCA9IGB2JHtwa2cudmVyc2lvbn1gKSB7XHJcbiAgcmV0dXJuIGAke3JlcG9Vcmx9L2Jsb2IvJHtjb21taXRpc2h9L2RvY3MvcnVsZXMvJHtydWxlTmFtZX0ubWRgXHJcbn1cclxuIl19