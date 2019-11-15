'use strict';

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('first')
    },
    fixable: 'code'
  },

  create: function (context) {
    function isPossibleDirective(node) {
      return node.type === 'ExpressionStatement' && node.expression.type === 'Literal' && typeof node.expression.value === 'string';
    }

    return {
      'Program': function (n) {
        const body = n.body,
              absoluteFirst = context.options[0] === 'absolute-first',
              message = 'Import in body of module; reorder to top.',
              sourceCode = context.getSourceCode(),
              originSourceCode = sourceCode.getText();
        let nonImportCount = 0,
            anyExpressions = false,
            anyRelative = false,
            lastLegalImp = null,
            errorInfos = [],
            shouldSort = true,
            lastSortNodesIndex = 0;
        body.forEach(function (node, index) {
          if (!anyExpressions && isPossibleDirective(node)) {
            return;
          }

          anyExpressions = true;

          if (node.type === 'ImportDeclaration') {
            if (absoluteFirst) {
              if (/^\./.test(node.source.value)) {
                anyRelative = true;
              } else if (anyRelative) {
                context.report({
                  node: node.source,
                  message: 'Absolute imports should come before relative imports.'
                });
              }
            }
            if (nonImportCount > 0) {
              for (let variable of context.getDeclaredVariables(node)) {
                if (!shouldSort) break;
                const references = variable.references;
                if (references.length) {
                  for (let reference of references) {
                    if (reference.identifier.range[0] < node.range[1]) {
                      shouldSort = false;
                      break;
                    }
                  }
                }
              }
              shouldSort && (lastSortNodesIndex = errorInfos.length);
              errorInfos.push({
                node,
                range: [body[index - 1].range[1], node.range[1]]
              });
            } else {
              lastLegalImp = node;
            }
          } else {
            nonImportCount++;
          }
        });
        if (!errorInfos.length) return;
        errorInfos.forEach(function (errorInfo, index) {
          const node = errorInfo.node,
                infos = {
            node,
            message
          };
          if (index < lastSortNodesIndex) {
            infos.fix = function (fixer) {
              return fixer.insertTextAfter(node, '');
            };
          } else if (index === lastSortNodesIndex) {
            const sortNodes = errorInfos.slice(0, lastSortNodesIndex + 1);
            infos.fix = function (fixer) {
              const removeFixers = sortNodes.map(function (_errorInfo) {
                return fixer.removeRange(_errorInfo.range);
              }),
                    range = [0, removeFixers[removeFixers.length - 1].range[1]];
              let insertSourceCode = sortNodes.map(function (_errorInfo) {
                const nodeSourceCode = String.prototype.slice.apply(originSourceCode, _errorInfo.range);
                if (/\S/.test(nodeSourceCode[0])) {
                  return '\n' + nodeSourceCode;
                }
                return nodeSourceCode;
              }).join(''),
                  insertFixer = null,
                  replaceSourceCode = '';
              if (!lastLegalImp) {
                insertSourceCode = insertSourceCode.trim() + insertSourceCode.match(/^(\s+)/)[0];
              }
              insertFixer = lastLegalImp ? fixer.insertTextAfter(lastLegalImp, insertSourceCode) : fixer.insertTextBefore(body[0], insertSourceCode);
              const fixers = [insertFixer].concat(removeFixers);
              fixers.forEach(function (computedFixer, i) {
                replaceSourceCode += originSourceCode.slice(fixers[i - 1] ? fixers[i - 1].range[1] : 0, computedFixer.range[0]) + computedFixer.text;
              });
              return fixer.replaceTextRange(range, replaceSourceCode);
            };
          }
          context.report(infos);
        });
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9maXJzdC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwidXJsIiwiZml4YWJsZSIsImNyZWF0ZSIsImNvbnRleHQiLCJpc1Bvc3NpYmxlRGlyZWN0aXZlIiwibm9kZSIsImV4cHJlc3Npb24iLCJ2YWx1ZSIsIm4iLCJib2R5IiwiYWJzb2x1dGVGaXJzdCIsIm9wdGlvbnMiLCJtZXNzYWdlIiwic291cmNlQ29kZSIsImdldFNvdXJjZUNvZGUiLCJvcmlnaW5Tb3VyY2VDb2RlIiwiZ2V0VGV4dCIsIm5vbkltcG9ydENvdW50IiwiYW55RXhwcmVzc2lvbnMiLCJhbnlSZWxhdGl2ZSIsImxhc3RMZWdhbEltcCIsImVycm9ySW5mb3MiLCJzaG91bGRTb3J0IiwibGFzdFNvcnROb2Rlc0luZGV4IiwiZm9yRWFjaCIsImluZGV4IiwidGVzdCIsInNvdXJjZSIsInJlcG9ydCIsInZhcmlhYmxlIiwiZ2V0RGVjbGFyZWRWYXJpYWJsZXMiLCJyZWZlcmVuY2VzIiwibGVuZ3RoIiwicmVmZXJlbmNlIiwiaWRlbnRpZmllciIsInJhbmdlIiwicHVzaCIsImVycm9ySW5mbyIsImluZm9zIiwiZml4IiwiZml4ZXIiLCJpbnNlcnRUZXh0QWZ0ZXIiLCJzb3J0Tm9kZXMiLCJzbGljZSIsInJlbW92ZUZpeGVycyIsIm1hcCIsIl9lcnJvckluZm8iLCJyZW1vdmVSYW5nZSIsImluc2VydFNvdXJjZUNvZGUiLCJub2RlU291cmNlQ29kZSIsIlN0cmluZyIsInByb3RvdHlwZSIsImFwcGx5Iiwiam9pbiIsImluc2VydEZpeGVyIiwicmVwbGFjZVNvdXJjZUNvZGUiLCJ0cmltIiwibWF0Y2giLCJpbnNlcnRUZXh0QmVmb3JlIiwiZml4ZXJzIiwiY29uY2F0IiwiY29tcHV0ZWRGaXhlciIsImkiLCJ0ZXh0IiwicmVwbGFjZVRleHRSYW5nZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0FBRUFBLE9BQU9D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QkFVSUMsb0JBQW9CLEVBVnhCO0FBV0Esa0JBQUksQ0FBQ25DLFlBQUwsRUFBbUI7QUFDZjRCLG1DQUNFQSxpQkFBaUJRLElBQWpCLEtBQTBCUixpQkFBaUJTLEtBQWpCLENBQXVCLFFBQXZCLEVBQWlDLENBQWpDLENBRDVCO0FBRUg7QUFDREgsNEJBQWNsQyxlQUNBb0IsTUFBTUMsZUFBTixDQUFzQnJCLFlBQXRCLEVBQW9DNEIsZ0JBQXBDLENBREEsR0FFQVIsTUFBTWtCLGdCQUFOLENBQXVCakQsS0FBSyxDQUFMLENBQXZCLEVBQWdDdUMsZ0JBQWhDLENBRmQ7QUFHQSxvQkFBTVcsU0FBUyxDQUFDTCxXQUFELEVBQWNNLE1BQWQsQ0FBcUJoQixZQUFyQixDQUFmO0FBQ0FlLHFCQUFPbkMsT0FBUCxDQUFlLFVBQVVxQyxhQUFWLEVBQXlCQyxDQUF6QixFQUE0QjtBQUN6Q1AscUNBQXNCeEMsaUJBQWlCNEIsS0FBakIsQ0FDcEJnQixPQUFPRyxJQUFJLENBQVgsSUFBZ0JILE9BQU9HLElBQUksQ0FBWCxFQUFjM0IsS0FBZCxDQUFvQixDQUFwQixDQUFoQixHQUF5QyxDQURyQixFQUN3QjBCLGNBQWMxQixLQUFkLENBQW9CLENBQXBCLENBRHhCLElBRWxCMEIsY0FBY0UsSUFGbEI7QUFHRCxlQUpEO0FBS0EscUJBQU92QixNQUFNd0IsZ0JBQU4sQ0FBdUI3QixLQUF2QixFQUE4Qm9CLGlCQUE5QixDQUFQO0FBQ0QsYUE5QkQ7QUErQkQ7QUFDRHBELGtCQUFReUIsTUFBUixDQUFlVSxLQUFmO0FBQ0QsU0E3Q0Q7QUE4Q0Q7QUF4R0ksS0FBUDtBQTBHRDtBQTFIYyxDQUFqQiIsImZpbGUiOiJmaXJzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIHVybDogZG9jc1VybCgnZmlyc3QnKSxcclxuICAgIH0sXHJcbiAgICBmaXhhYmxlOiAnY29kZScsXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlOiBmdW5jdGlvbiAoY29udGV4dCkge1xyXG4gICAgZnVuY3Rpb24gaXNQb3NzaWJsZURpcmVjdGl2ZSAobm9kZSkge1xyXG4gICAgICByZXR1cm4gbm9kZS50eXBlID09PSAnRXhwcmVzc2lvblN0YXRlbWVudCcgJiZcclxuICAgICAgICBub2RlLmV4cHJlc3Npb24udHlwZSA9PT0gJ0xpdGVyYWwnICYmXHJcbiAgICAgICAgdHlwZW9mIG5vZGUuZXhwcmVzc2lvbi52YWx1ZSA9PT0gJ3N0cmluZydcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAnUHJvZ3JhbSc6IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgY29uc3QgYm9keSA9IG4uYm9keVxyXG4gICAgICAgICAgICAsIGFic29sdXRlRmlyc3QgPSBjb250ZXh0Lm9wdGlvbnNbMF0gPT09ICdhYnNvbHV0ZS1maXJzdCdcclxuICAgICAgICAgICAgLCBtZXNzYWdlID0gJ0ltcG9ydCBpbiBib2R5IG9mIG1vZHVsZTsgcmVvcmRlciB0byB0b3AuJ1xyXG4gICAgICAgICAgICAsIHNvdXJjZUNvZGUgPSBjb250ZXh0LmdldFNvdXJjZUNvZGUoKVxyXG4gICAgICAgICAgICAsIG9yaWdpblNvdXJjZUNvZGUgPSBzb3VyY2VDb2RlLmdldFRleHQoKVxyXG4gICAgICAgIGxldCBub25JbXBvcnRDb3VudCA9IDBcclxuICAgICAgICAgICwgYW55RXhwcmVzc2lvbnMgPSBmYWxzZVxyXG4gICAgICAgICAgLCBhbnlSZWxhdGl2ZSA9IGZhbHNlXHJcbiAgICAgICAgICAsIGxhc3RMZWdhbEltcCA9IG51bGxcclxuICAgICAgICAgICwgZXJyb3JJbmZvcyA9IFtdXHJcbiAgICAgICAgICAsIHNob3VsZFNvcnQgPSB0cnVlXHJcbiAgICAgICAgICAsIGxhc3RTb3J0Tm9kZXNJbmRleCA9IDBcclxuICAgICAgICBib2R5LmZvckVhY2goZnVuY3Rpb24gKG5vZGUsIGluZGV4KXtcclxuICAgICAgICAgIGlmICghYW55RXhwcmVzc2lvbnMgJiYgaXNQb3NzaWJsZURpcmVjdGl2ZShub2RlKSkge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBhbnlFeHByZXNzaW9ucyA9IHRydWVcclxuXHJcbiAgICAgICAgICBpZiAobm9kZS50eXBlID09PSAnSW1wb3J0RGVjbGFyYXRpb24nKSB7XHJcbiAgICAgICAgICAgIGlmIChhYnNvbHV0ZUZpcnN0KSB7XHJcbiAgICAgICAgICAgICAgaWYgKC9eXFwuLy50ZXN0KG5vZGUuc291cmNlLnZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgYW55UmVsYXRpdmUgPSB0cnVlXHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChhbnlSZWxhdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICAgICAgICBub2RlOiBub2RlLnNvdXJjZSxcclxuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0Fic29sdXRlIGltcG9ydHMgc2hvdWxkIGNvbWUgYmVmb3JlIHJlbGF0aXZlIGltcG9ydHMuJyxcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChub25JbXBvcnRDb3VudCA+IDApIHtcclxuICAgICAgICAgICAgICBmb3IgKGxldCB2YXJpYWJsZSBvZiBjb250ZXh0LmdldERlY2xhcmVkVmFyaWFibGVzKG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXNob3VsZFNvcnQpIGJyZWFrXHJcbiAgICAgICAgICAgICAgICBjb25zdCByZWZlcmVuY2VzID0gdmFyaWFibGUucmVmZXJlbmNlc1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlZmVyZW5jZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgIGZvciAobGV0IHJlZmVyZW5jZSBvZiByZWZlcmVuY2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlZmVyZW5jZS5pZGVudGlmaWVyLnJhbmdlWzBdIDwgbm9kZS5yYW5nZVsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgc2hvdWxkU29ydCA9IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBzaG91bGRTb3J0ICYmIChsYXN0U29ydE5vZGVzSW5kZXggPSBlcnJvckluZm9zLmxlbmd0aClcclxuICAgICAgICAgICAgICBlcnJvckluZm9zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgIHJhbmdlOiBbYm9keVtpbmRleCAtIDFdLnJhbmdlWzFdLCBub2RlLnJhbmdlWzFdXSxcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGxhc3RMZWdhbEltcCA9IG5vZGVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbm9uSW1wb3J0Q291bnQrK1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgaWYgKCFlcnJvckluZm9zLmxlbmd0aCkgcmV0dXJuXHJcbiAgICAgICAgZXJyb3JJbmZvcy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvckluZm8sIGluZGV4KSB7XHJcbiAgICAgICAgICBjb25zdCBub2RlID0gZXJyb3JJbmZvLm5vZGVcclxuICAgICAgICAgICAgICAsIGluZm9zID0ge1xyXG4gICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGluZGV4IDwgbGFzdFNvcnROb2Rlc0luZGV4KSB7XHJcbiAgICAgICAgICAgIGluZm9zLmZpeCA9IGZ1bmN0aW9uIChmaXhlcikge1xyXG4gICAgICAgICAgICAgIHJldHVybiBmaXhlci5pbnNlcnRUZXh0QWZ0ZXIobm9kZSwgJycpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IGxhc3RTb3J0Tm9kZXNJbmRleCkge1xyXG4gICAgICAgICAgICBjb25zdCBzb3J0Tm9kZXMgPSBlcnJvckluZm9zLnNsaWNlKDAsIGxhc3RTb3J0Tm9kZXNJbmRleCArIDEpXHJcbiAgICAgICAgICAgIGluZm9zLmZpeCA9IGZ1bmN0aW9uIChmaXhlcikge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHJlbW92ZUZpeGVycyA9IHNvcnROb2Rlcy5tYXAoZnVuY3Rpb24gKF9lcnJvckluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZml4ZXIucmVtb3ZlUmFuZ2UoX2Vycm9ySW5mby5yYW5nZSlcclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgLCByYW5nZSA9IFswLCByZW1vdmVGaXhlcnNbcmVtb3ZlRml4ZXJzLmxlbmd0aCAtIDFdLnJhbmdlWzFdXVxyXG4gICAgICAgICAgICAgIGxldCBpbnNlcnRTb3VyY2VDb2RlID0gc29ydE5vZGVzLm1hcChmdW5jdGlvbiAoX2Vycm9ySW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVTb3VyY2VDb2RlID0gU3RyaW5nLnByb3RvdHlwZS5zbGljZS5hcHBseShcclxuICAgICAgICAgICAgICAgICAgICAgIG9yaWdpblNvdXJjZUNvZGUsIF9lcnJvckluZm8ucmFuZ2VcclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9cXFMvLnRlc3Qobm9kZVNvdXJjZUNvZGVbMF0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1xcbicgKyBub2RlU291cmNlQ29kZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVNvdXJjZUNvZGVcclxuICAgICAgICAgICAgICAgICAgfSkuam9pbignJylcclxuICAgICAgICAgICAgICAgICwgaW5zZXJ0Rml4ZXIgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAsIHJlcGxhY2VTb3VyY2VDb2RlID0gJydcclxuICAgICAgICAgICAgICBpZiAoIWxhc3RMZWdhbEltcCkge1xyXG4gICAgICAgICAgICAgICAgICBpbnNlcnRTb3VyY2VDb2RlID1cclxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRTb3VyY2VDb2RlLnRyaW0oKSArIGluc2VydFNvdXJjZUNvZGUubWF0Y2goL14oXFxzKykvKVswXVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpbnNlcnRGaXhlciA9IGxhc3RMZWdhbEltcCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXhlci5pbnNlcnRUZXh0QWZ0ZXIobGFzdExlZ2FsSW1wLCBpbnNlcnRTb3VyY2VDb2RlKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXhlci5pbnNlcnRUZXh0QmVmb3JlKGJvZHlbMF0sIGluc2VydFNvdXJjZUNvZGUpXHJcbiAgICAgICAgICAgICAgY29uc3QgZml4ZXJzID0gW2luc2VydEZpeGVyXS5jb25jYXQocmVtb3ZlRml4ZXJzKVxyXG4gICAgICAgICAgICAgIGZpeGVycy5mb3JFYWNoKGZ1bmN0aW9uIChjb21wdXRlZEZpeGVyLCBpKSB7XHJcbiAgICAgICAgICAgICAgICByZXBsYWNlU291cmNlQ29kZSArPSAob3JpZ2luU291cmNlQ29kZS5zbGljZShcclxuICAgICAgICAgICAgICAgICAgZml4ZXJzW2kgLSAxXSA/IGZpeGVyc1tpIC0gMV0ucmFuZ2VbMV0gOiAwLCBjb21wdXRlZEZpeGVyLnJhbmdlWzBdXHJcbiAgICAgICAgICAgICAgICApICsgY29tcHV0ZWRGaXhlci50ZXh0KVxyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGZpeGVyLnJlcGxhY2VUZXh0UmFuZ2UocmFuZ2UsIHJlcGxhY2VTb3VyY2VDb2RlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydChpbmZvcylcclxuICAgICAgICB9KVxyXG4gICAgICB9LFxyXG4gICAgfVxyXG4gIH0sXHJcbn1cclxuIl19