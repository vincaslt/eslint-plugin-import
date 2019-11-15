'use strict';

var _vm = require('vm');

var _vm2 = _interopRequireDefault(_vm);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('dynamic-import-chunkname')
    },
    schema: [{
      type: 'object',
      properties: {
        importFunctions: {
          type: 'array',
          uniqueItems: true,
          items: {
            type: 'string'
          }
        },
        webpackChunknameFormat: {
          type: 'string'
        }
      }
    }]
  },

  create: function (context) {
    const config = context.options[0];

    var _ref = config || {},
        _ref$importFunctions = _ref.importFunctions;

    const importFunctions = _ref$importFunctions === undefined ? [] : _ref$importFunctions;

    var _ref2 = config || {},
        _ref2$webpackChunknam = _ref2.webpackChunknameFormat;

    const webpackChunknameFormat = _ref2$webpackChunknam === undefined ? '[0-9a-zA-Z-_/.]+' : _ref2$webpackChunknam;


    const paddedCommentRegex = /^ (\S[\s\S]+\S) $/;
    const commentStyleRegex = /^( \w+: ("[^"]*"|\d+|false|true),?)+ $/;
    const chunkSubstrFormat = ` webpackChunkName: "${webpackChunknameFormat}",? `;
    const chunkSubstrRegex = new RegExp(chunkSubstrFormat);

    return {
      CallExpression(node) {
        if (node.callee.type !== 'Import' && importFunctions.indexOf(node.callee.name) < 0) {
          return;
        }

        const sourceCode = context.getSourceCode();
        const arg = node.arguments[0];
        const leadingComments = sourceCode.getComments(arg).leading;

        if (!leadingComments || leadingComments.length === 0) {
          context.report({
            node,
            message: 'dynamic imports require a leading comment with the webpack chunkname'
          });
          return;
        }

        let isChunknamePresent = false;

        for (const comment of leadingComments) {
          if (comment.type !== 'Block') {
            context.report({
              node,
              message: 'dynamic imports require a /* foo */ style comment, not a // foo comment'
            });
            return;
          }

          if (!paddedCommentRegex.test(comment.value)) {
            context.report({
              node,
              message: `dynamic imports require a block comment padded with spaces - /* foo */`
            });
            return;
          }

          try {
            // just like webpack itself does
            _vm2.default.runInNewContext(`(function(){return {${comment.value}}})()`);
          } catch (error) {
            context.report({
              node,
              message: `dynamic imports require a "webpack" comment with valid syntax`
            });
            return;
          }

          if (!commentStyleRegex.test(comment.value)) {
            context.report({
              node,
              message: `dynamic imports require a leading comment in the form /*${chunkSubstrFormat}*/`
            });
            return;
          }

          if (chunkSubstrRegex.test(comment.value)) {
            isChunknamePresent = true;
          }
        }

        if (!isChunknamePresent) {
          context.report({
            node,
            message: `dynamic imports require a leading comment in the form /*${chunkSubstrFormat}*/`
          });
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9keW5hbWljLWltcG9ydC1jaHVua25hbWUuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsInVybCIsInNjaGVtYSIsInByb3BlcnRpZXMiLCJpbXBvcnRGdW5jdGlvbnMiLCJ1bmlxdWVJdGVtcyIsIml0ZW1zIiwid2VicGFja0NodW5rbmFtZUZvcm1hdCIsImNyZWF0ZSIsImNvbnRleHQiLCJjb25maWciLCJvcHRpb25zIiwicGFkZGVkQ29tbWVudFJlZ2V4IiwiY29tbWVudFN0eWxlUmVnZXgiLCJjaHVua1N1YnN0ckZvcm1hdCIsImNodW5rU3Vic3RyUmVnZXgiLCJSZWdFeHAiLCJDYWxsRXhwcmVzc2lvbiIsIm5vZGUiLCJjYWxsZWUiLCJpbmRleE9mIiwibmFtZSIsInNvdXJjZUNvZGUiLCJnZXRTb3VyY2VDb2RlIiwiYXJnIiwiYXJndW1lbnRzIiwibGVhZGluZ0NvbW1lbnRzIiwiZ2V0Q29tbWVudHMiLCJsZWFkaW5nIiwibGVuZ3RoIiwicmVwb3J0IiwibWVzc2FnZSIsImlzQ2h1bmtuYW1lUHJlc2VudCIsImNvbW1lbnQiLCJ0ZXN0IiwidmFsdWUiLCJ2bSIsInJ1bkluTmV3Q29udGV4dCIsImVycm9yIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7O0FBQ0E7Ozs7OztBQUVBQSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxZQURGO0FBRUpDLFVBQU07QUFDSkMsV0FBSyx1QkFBUSwwQkFBUjtBQURELEtBRkY7QUFLSkMsWUFBUSxDQUFDO0FBQ1BILFlBQU0sUUFEQztBQUVQSSxrQkFBWTtBQUNWQyx5QkFBaUI7QUFDZkwsZ0JBQU0sT0FEUztBQUVmTSx1QkFBYSxJQUZFO0FBR2ZDLGlCQUFPO0FBQ0xQLGtCQUFNO0FBREQ7QUFIUSxTQURQO0FBUVZRLGdDQUF3QjtBQUN0QlIsZ0JBQU07QUFEZ0I7QUFSZDtBQUZMLEtBQUQ7QUFMSixHQURTOztBQXVCZlMsVUFBUSxVQUFVQyxPQUFWLEVBQW1CO0FBQ3pCLFVBQU1DLFNBQVNELFFBQVFFLE9BQVIsQ0FBZ0IsQ0FBaEIsQ0FBZjs7QUFEeUIsZUFFUUQsVUFBVSxFQUZsQjtBQUFBLG9DQUVqQk4sZUFGaUI7O0FBQUEsVUFFakJBLGVBRmlCLHdDQUVDLEVBRkQ7O0FBQUEsZ0JBRytCTSxVQUFVLEVBSHpDO0FBQUEsc0NBR2pCSCxzQkFIaUI7O0FBQUEsVUFHakJBLHNCQUhpQix5Q0FHUSxrQkFIUjs7O0FBS3pCLFVBQU1LLHFCQUFxQixtQkFBM0I7QUFDQSxVQUFNQyxvQkFBb0Isd0NBQTFCO0FBQ0EsVUFBTUMsb0JBQXFCLHVCQUFzQlAsc0JBQXVCLE1BQXhFO0FBQ0EsVUFBTVEsbUJBQW1CLElBQUlDLE1BQUosQ0FBV0YsaUJBQVgsQ0FBekI7O0FBRUEsV0FBTztBQUNMRyxxQkFBZUMsSUFBZixFQUFxQjtBQUNuQixZQUFJQSxLQUFLQyxNQUFMLENBQVlwQixJQUFaLEtBQXFCLFFBQXJCLElBQWlDSyxnQkFBZ0JnQixPQUFoQixDQUF3QkYsS0FBS0MsTUFBTCxDQUFZRSxJQUFwQyxJQUE0QyxDQUFqRixFQUFvRjtBQUNsRjtBQUNEOztBQUVELGNBQU1DLGFBQWFiLFFBQVFjLGFBQVIsRUFBbkI7QUFDQSxjQUFNQyxNQUFNTixLQUFLTyxTQUFMLENBQWUsQ0FBZixDQUFaO0FBQ0EsY0FBTUMsa0JBQWtCSixXQUFXSyxXQUFYLENBQXVCSCxHQUF2QixFQUE0QkksT0FBcEQ7O0FBRUEsWUFBSSxDQUFDRixlQUFELElBQW9CQSxnQkFBZ0JHLE1BQWhCLEtBQTJCLENBQW5ELEVBQXNEO0FBQ3BEcEIsa0JBQVFxQixNQUFSLENBQWU7QUFDYlosZ0JBRGE7QUFFYmEscUJBQVM7QUFGSSxXQUFmO0FBSUE7QUFDRDs7QUFFRCxZQUFJQyxxQkFBcUIsS0FBekI7O0FBRUEsYUFBSyxNQUFNQyxPQUFYLElBQXNCUCxlQUF0QixFQUF1QztBQUNyQyxjQUFJTyxRQUFRbEMsSUFBUixLQUFpQixPQUFyQixFQUE4QjtBQUM1QlUsb0JBQVFxQixNQUFSLENBQWU7QUFDYlosa0JBRGE7QUFFYmEsdUJBQVM7QUFGSSxhQUFmO0FBSUE7QUFDRDs7QUFFRCxjQUFJLENBQUNuQixtQkFBbUJzQixJQUFuQixDQUF3QkQsUUFBUUUsS0FBaEMsQ0FBTCxFQUE2QztBQUMzQzFCLG9CQUFRcUIsTUFBUixDQUFlO0FBQ2JaLGtCQURhO0FBRWJhLHVCQUFVO0FBRkcsYUFBZjtBQUlBO0FBQ0Q7O0FBRUQsY0FBSTtBQUNGO0FBQ0FLLHlCQUFHQyxlQUFILENBQW9CLHVCQUFzQkosUUFBUUUsS0FBTSxPQUF4RDtBQUNELFdBSEQsQ0FJQSxPQUFPRyxLQUFQLEVBQWM7QUFDWjdCLG9CQUFRcUIsTUFBUixDQUFlO0FBQ2JaLGtCQURhO0FBRWJhLHVCQUFVO0FBRkcsYUFBZjtBQUlBO0FBQ0Q7O0FBRUQsY0FBSSxDQUFDbEIsa0JBQWtCcUIsSUFBbEIsQ0FBdUJELFFBQVFFLEtBQS9CLENBQUwsRUFBNEM7QUFDMUMxQixvQkFBUXFCLE1BQVIsQ0FBZTtBQUNiWixrQkFEYTtBQUViYSx1QkFDRywyREFBMERqQixpQkFBa0I7QUFIbEUsYUFBZjtBQUtBO0FBQ0Q7O0FBRUQsY0FBSUMsaUJBQWlCbUIsSUFBakIsQ0FBc0JELFFBQVFFLEtBQTlCLENBQUosRUFBMEM7QUFDeENILGlDQUFxQixJQUFyQjtBQUNEO0FBQ0Y7O0FBRUQsWUFBSSxDQUFDQSxrQkFBTCxFQUF5QjtBQUN2QnZCLGtCQUFRcUIsTUFBUixDQUFlO0FBQ2JaLGdCQURhO0FBRWJhLHFCQUNHLDJEQUEwRGpCLGlCQUFrQjtBQUhsRSxXQUFmO0FBS0Q7QUFDRjtBQXRFSSxLQUFQO0FBd0VEO0FBekdjLENBQWpCIiwiZmlsZSI6ImR5bmFtaWMtaW1wb3J0LWNodW5rbmFtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB2bSBmcm9tICd2bSdcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCdcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgdXJsOiBkb2NzVXJsKCdkeW5hbWljLWltcG9ydC1jaHVua25hbWUnKSxcclxuICAgIH0sXHJcbiAgICBzY2hlbWE6IFt7XHJcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgaW1wb3J0RnVuY3Rpb25zOiB7XHJcbiAgICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgICAgdW5pcXVlSXRlbXM6IHRydWUsXHJcbiAgICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICB3ZWJwYWNrQ2h1bmtuYW1lRm9ybWF0OiB7XHJcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfV0sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlOiBmdW5jdGlvbiAoY29udGV4dCkge1xyXG4gICAgY29uc3QgY29uZmlnID0gY29udGV4dC5vcHRpb25zWzBdXHJcbiAgICBjb25zdCB7IGltcG9ydEZ1bmN0aW9ucyA9IFtdIH0gPSBjb25maWcgfHwge31cclxuICAgIGNvbnN0IHsgd2VicGFja0NodW5rbmFtZUZvcm1hdCA9ICdbMC05YS16QS1aLV8vLl0rJyB9ID0gY29uZmlnIHx8IHt9XHJcblxyXG4gICAgY29uc3QgcGFkZGVkQ29tbWVudFJlZ2V4ID0gL14gKFxcU1tcXHNcXFNdK1xcUykgJC9cclxuICAgIGNvbnN0IGNvbW1lbnRTdHlsZVJlZ2V4ID0gL14oIFxcdys6IChcIlteXCJdKlwifFxcZCt8ZmFsc2V8dHJ1ZSksPykrICQvXHJcbiAgICBjb25zdCBjaHVua1N1YnN0ckZvcm1hdCA9IGAgd2VicGFja0NodW5rTmFtZTogXCIke3dlYnBhY2tDaHVua25hbWVGb3JtYXR9XCIsPyBgXHJcbiAgICBjb25zdCBjaHVua1N1YnN0clJlZ2V4ID0gbmV3IFJlZ0V4cChjaHVua1N1YnN0ckZvcm1hdClcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBDYWxsRXhwcmVzc2lvbihub2RlKSB7XHJcbiAgICAgICAgaWYgKG5vZGUuY2FsbGVlLnR5cGUgIT09ICdJbXBvcnQnICYmIGltcG9ydEZ1bmN0aW9ucy5pbmRleE9mKG5vZGUuY2FsbGVlLm5hbWUpIDwgMCkge1xyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzb3VyY2VDb2RlID0gY29udGV4dC5nZXRTb3VyY2VDb2RlKClcclxuICAgICAgICBjb25zdCBhcmcgPSBub2RlLmFyZ3VtZW50c1swXVxyXG4gICAgICAgIGNvbnN0IGxlYWRpbmdDb21tZW50cyA9IHNvdXJjZUNvZGUuZ2V0Q29tbWVudHMoYXJnKS5sZWFkaW5nXHJcblxyXG4gICAgICAgIGlmICghbGVhZGluZ0NvbW1lbnRzIHx8IGxlYWRpbmdDb21tZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogJ2R5bmFtaWMgaW1wb3J0cyByZXF1aXJlIGEgbGVhZGluZyBjb21tZW50IHdpdGggdGhlIHdlYnBhY2sgY2h1bmtuYW1lJyxcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBpc0NodW5rbmFtZVByZXNlbnQgPSBmYWxzZVxyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGNvbW1lbnQgb2YgbGVhZGluZ0NvbW1lbnRzKSB7XHJcbiAgICAgICAgICBpZiAoY29tbWVudC50eXBlICE9PSAnQmxvY2snKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICdkeW5hbWljIGltcG9ydHMgcmVxdWlyZSBhIC8qIGZvbyAqLyBzdHlsZSBjb21tZW50LCBub3QgYSAvLyBmb28gY29tbWVudCcsXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICghcGFkZGVkQ29tbWVudFJlZ2V4LnRlc3QoY29tbWVudC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgbWVzc2FnZTogYGR5bmFtaWMgaW1wb3J0cyByZXF1aXJlIGEgYmxvY2sgY29tbWVudCBwYWRkZWQgd2l0aCBzcGFjZXMgLSAvKiBmb28gKi9gLFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBqdXN0IGxpa2Ugd2VicGFjayBpdHNlbGYgZG9lc1xyXG4gICAgICAgICAgICB2bS5ydW5Jbk5ld0NvbnRleHQoYChmdW5jdGlvbigpe3JldHVybiB7JHtjb21tZW50LnZhbHVlfX19KSgpYClcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICBtZXNzYWdlOiBgZHluYW1pYyBpbXBvcnRzIHJlcXVpcmUgYSBcIndlYnBhY2tcIiBjb21tZW50IHdpdGggdmFsaWQgc3ludGF4YCxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCFjb21tZW50U3R5bGVSZWdleC50ZXN0KGNvbW1lbnQudmFsdWUpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgIG1lc3NhZ2U6XHJcbiAgICAgICAgICAgICAgICBgZHluYW1pYyBpbXBvcnRzIHJlcXVpcmUgYSBsZWFkaW5nIGNvbW1lbnQgaW4gdGhlIGZvcm0gLyoke2NodW5rU3Vic3RyRm9ybWF0fSovYCxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGNodW5rU3Vic3RyUmVnZXgudGVzdChjb21tZW50LnZhbHVlKSkge1xyXG4gICAgICAgICAgICBpc0NodW5rbmFtZVByZXNlbnQgPSB0cnVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWlzQ2h1bmtuYW1lUHJlc2VudCkge1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICBtZXNzYWdlOlxyXG4gICAgICAgICAgICAgIGBkeW5hbWljIGltcG9ydHMgcmVxdWlyZSBhIGxlYWRpbmcgY29tbWVudCBpbiB0aGUgZm9ybSAvKiR7Y2h1bmtTdWJzdHJGb3JtYXR9Ki9gLFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9XHJcbiAgfSxcclxufVxyXG4iXX0=