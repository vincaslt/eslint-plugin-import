'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function checkImports(imported, context) {
  for (const _ref of imported.entries()) {
    var _ref2 = _slicedToArray(_ref, 2);

    const module = _ref2[0];
    const nodes = _ref2[1];

    if (nodes.length > 1) {
      const message = `'${module}' imported multiple times.`;

      var _nodes = _toArray(nodes);

      const first = _nodes[0],
            rest = _nodes.slice(1);

      const sourceCode = context.getSourceCode();
      const fix = getFix(first, rest, sourceCode);

      context.report({
        node: first.source,
        message,
        fix // Attach the autofix (if any) to the first import.
      });

      for (const node of rest) {
        context.report({
          node: node.source,
          message
        });
      }
    }
  }
}

function getFix(first, rest, sourceCode) {
  // Sorry ESLint <= 3 users, no autofix for you. Autofixing duplicate imports
  // requires multiple `fixer.whatever()` calls in the `fix`: We both need to
  // update the first one, and remove the rest. Support for multiple
  // `fixer.whatever()` in a single `fix` was added in ESLint 4.1.
  // `sourceCode.getCommentsBefore` was added in 4.0, so that's an easy thing to
  // check for.
  if (typeof sourceCode.getCommentsBefore !== 'function') {
    return undefined;
  }

  // Adjusting the first import might make it multiline, which could break
  // `eslint-disable-next-line` comments and similar, so bail if the first
  // import has comments. Also, if the first import is `import * as ns from
  // './foo'` there's nothing we can do.
  if (hasProblematicComments(first, sourceCode) || hasNamespace(first)) {
    return undefined;
  }

  const defaultImportNames = new Set([first].concat(_toConsumableArray(rest)).map(getDefaultImportName).filter(Boolean));

  // Bail if there are multiple different default import names – it's up to the
  // user to choose which one to keep.
  if (defaultImportNames.size > 1) {
    return undefined;
  }

  // Leave it to the user to handle comments. Also skip `import * as ns from
  // './foo'` imports, since they cannot be merged into another import.
  const restWithoutComments = rest.filter(node => !(hasProblematicComments(node, sourceCode) || hasNamespace(node)));

  const specifiers = restWithoutComments.map(node => {
    const tokens = sourceCode.getTokens(node);
    const openBrace = tokens.find(token => isPunctuator(token, '{'));
    const closeBrace = tokens.find(token => isPunctuator(token, '}'));

    if (openBrace == null || closeBrace == null) {
      return undefined;
    }

    return {
      importNode: node,
      text: sourceCode.text.slice(openBrace.range[1], closeBrace.range[0]),
      hasTrailingComma: isPunctuator(sourceCode.getTokenBefore(closeBrace), ','),
      isEmpty: !hasSpecifiers(node)
    };
  }).filter(Boolean);

  const unnecessaryImports = restWithoutComments.filter(node => !hasSpecifiers(node) && !hasNamespace(node) && !specifiers.some(specifier => specifier.importNode === node));

  const shouldAddDefault = getDefaultImportName(first) == null && defaultImportNames.size === 1;
  const shouldAddSpecifiers = specifiers.length > 0;
  const shouldRemoveUnnecessary = unnecessaryImports.length > 0;

  if (!(shouldAddDefault || shouldAddSpecifiers || shouldRemoveUnnecessary)) {
    return undefined;
  }

  return fixer => {
    const tokens = sourceCode.getTokens(first);
    const openBrace = tokens.find(token => isPunctuator(token, '{'));
    const closeBrace = tokens.find(token => isPunctuator(token, '}'));
    const firstToken = sourceCode.getFirstToken(first);

    var _defaultImportNames = _slicedToArray(defaultImportNames, 1);

    const defaultImportName = _defaultImportNames[0];


    const firstHasTrailingComma = closeBrace != null && isPunctuator(sourceCode.getTokenBefore(closeBrace), ',');
    const firstIsEmpty = !hasSpecifiers(first);

    var _specifiers$reduce = specifiers.reduce((_ref3, specifier) => {
      var _ref4 = _slicedToArray(_ref3, 2);

      let result = _ref4[0],
          needsComma = _ref4[1];

      return [needsComma && !specifier.isEmpty ? `${result},${specifier.text}` : `${result}${specifier.text}`, specifier.isEmpty ? needsComma : true];
    }, ['', !firstHasTrailingComma && !firstIsEmpty]),
        _specifiers$reduce2 = _slicedToArray(_specifiers$reduce, 1);

    const specifiersText = _specifiers$reduce2[0];


    const fixes = [];

    if (shouldAddDefault && openBrace == null && shouldAddSpecifiers) {
      // `import './foo'` → `import def, {...} from './foo'`
      fixes.push(fixer.insertTextAfter(firstToken, ` ${defaultImportName}, {${specifiersText}} from`));
    } else if (shouldAddDefault && openBrace == null && !shouldAddSpecifiers) {
      // `import './foo'` → `import def from './foo'`
      fixes.push(fixer.insertTextAfter(firstToken, ` ${defaultImportName} from`));
    } else if (shouldAddDefault && openBrace != null && closeBrace != null) {
      // `import {...} from './foo'` → `import def, {...} from './foo'`
      fixes.push(fixer.insertTextAfter(firstToken, ` ${defaultImportName},`));
      if (shouldAddSpecifiers) {
        // `import def, {...} from './foo'` → `import def, {..., ...} from './foo'`
        fixes.push(fixer.insertTextBefore(closeBrace, specifiersText));
      }
    } else if (!shouldAddDefault && openBrace == null && shouldAddSpecifiers) {
      // `import './foo'` → `import {...} from './foo'`
      fixes.push(fixer.insertTextAfter(firstToken, ` {${specifiersText}} from`));
    } else if (!shouldAddDefault && openBrace != null && closeBrace != null) {
      // `import {...} './foo'` → `import {..., ...} from './foo'`
      fixes.push(fixer.insertTextBefore(closeBrace, specifiersText));
    }

    // Remove imports whose specifiers have been moved into the first import.
    for (const specifier of specifiers) {
      fixes.push(fixer.remove(specifier.importNode));
    }

    // Remove imports whose default import has been moved to the first import,
    // and side-effect-only imports that are unnecessary due to the first
    // import.
    for (const node of unnecessaryImports) {
      fixes.push(fixer.remove(node));
    }

    return fixes;
  };
}

function isPunctuator(node, value) {
  return node.type === 'Punctuator' && node.value === value;
}

// Get the name of the default import of `node`, if any.
function getDefaultImportName(node) {
  const defaultSpecifier = node.specifiers.find(specifier => specifier.type === 'ImportDefaultSpecifier');
  return defaultSpecifier != null ? defaultSpecifier.local.name : undefined;
}

// Checks whether `node` has a namespace import.
function hasNamespace(node) {
  const specifiers = node.specifiers.filter(specifier => specifier.type === 'ImportNamespaceSpecifier');
  return specifiers.length > 0;
}

// Checks whether `node` has any non-default specifiers.
function hasSpecifiers(node) {
  const specifiers = node.specifiers.filter(specifier => specifier.type === 'ImportSpecifier');
  return specifiers.length > 0;
}

// It's not obvious what the user wants to do with comments associated with
// duplicate imports, so skip imports with comments when autofixing.
function hasProblematicComments(node, sourceCode) {
  return hasCommentBefore(node, sourceCode) || hasCommentAfter(node, sourceCode) || hasCommentInsideNonSpecifiers(node, sourceCode);
}

// Checks whether `node` has a comment (that ends) on the previous line or on
// the same line as `node` (starts).
function hasCommentBefore(node, sourceCode) {
  return sourceCode.getCommentsBefore(node).some(comment => comment.loc.end.line >= node.loc.start.line - 1);
}

// Checks whether `node` has a comment (that starts) on the same line as `node`
// (ends).
function hasCommentAfter(node, sourceCode) {
  return sourceCode.getCommentsAfter(node).some(comment => comment.loc.start.line === node.loc.end.line);
}

// Checks whether `node` has any comments _inside,_ except inside the `{...}`
// part (if any).
function hasCommentInsideNonSpecifiers(node, sourceCode) {
  const tokens = sourceCode.getTokens(node);
  const openBraceIndex = tokens.findIndex(token => isPunctuator(token, '{'));
  const closeBraceIndex = tokens.findIndex(token => isPunctuator(token, '}'));
  // Slice away the first token, since we're no looking for comments _before_
  // `node` (only inside). If there's a `{...}` part, look for comments before
  // the `{`, but not before the `}` (hence the `+1`s).
  const someTokens = openBraceIndex >= 0 && closeBraceIndex >= 0 ? tokens.slice(1, openBraceIndex + 1).concat(tokens.slice(closeBraceIndex + 1)) : tokens.slice(1);
  return someTokens.some(token => sourceCode.getCommentsBefore(token).length > 0);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2.default)('no-duplicates')
    },
    fixable: 'code'
  },

  create: function (context) {
    const imported = new Map();
    const typesImported = new Map();
    return {
      'ImportDeclaration': function (n) {
        // resolved path will cover aliased duplicates
        const resolvedPath = (0, _resolve2.default)(n.source.value, context) || n.source.value;
        const importMap = n.importKind === 'type' ? typesImported : imported;

        if (importMap.has(resolvedPath)) {
          importMap.get(resolvedPath).push(n);
        } else {
          importMap.set(resolvedPath, [n]);
        }
      },

      'Program:exit': function () {
        checkImports(imported, context);
        checkImports(typesImported, context);
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1kdXBsaWNhdGVzLmpzIl0sIm5hbWVzIjpbImNoZWNrSW1wb3J0cyIsImltcG9ydGVkIiwiY29udGV4dCIsImVudHJpZXMiLCJtb2R1bGUiLCJub2RlcyIsImxlbmd0aCIsIm1lc3NhZ2UiLCJmaXJzdCIsInJlc3QiLCJzb3VyY2VDb2RlIiwiZ2V0U291cmNlQ29kZSIsImZpeCIsImdldEZpeCIsInJlcG9ydCIsIm5vZGUiLCJzb3VyY2UiLCJnZXRDb21tZW50c0JlZm9yZSIsInVuZGVmaW5lZCIsImhhc1Byb2JsZW1hdGljQ29tbWVudHMiLCJoYXNOYW1lc3BhY2UiLCJkZWZhdWx0SW1wb3J0TmFtZXMiLCJTZXQiLCJtYXAiLCJnZXREZWZhdWx0SW1wb3J0TmFtZSIsImZpbHRlciIsIkJvb2xlYW4iLCJzaXplIiwicmVzdFdpdGhvdXRDb21tZW50cyIsInNwZWNpZmllcnMiLCJ0b2tlbnMiLCJnZXRUb2tlbnMiLCJvcGVuQnJhY2UiLCJmaW5kIiwidG9rZW4iLCJpc1B1bmN0dWF0b3IiLCJjbG9zZUJyYWNlIiwiaW1wb3J0Tm9kZSIsInRleHQiLCJzbGljZSIsInJhbmdlIiwiaGFzVHJhaWxpbmdDb21tYSIsImdldFRva2VuQmVmb3JlIiwiaXNFbXB0eSIsImhhc1NwZWNpZmllcnMiLCJ1bm5lY2Vzc2FyeUltcG9ydHMiLCJzb21lIiwic3BlY2lmaWVyIiwic2hvdWxkQWRkRGVmYXVsdCIsInNob3VsZEFkZFNwZWNpZmllcnMiLCJzaG91bGRSZW1vdmVVbm5lY2Vzc2FyeSIsImZpeGVyIiwiZmlyc3RUb2tlbiIsImdldEZpcnN0VG9rZW4iLCJkZWZhdWx0SW1wb3J0TmFtZSIsImZpcnN0SGFzVHJhaWxpbmdDb21tYSIsImZpcnN0SXNFbXB0eSIsInJlZHVjZSIsInJlc3VsdCIsIm5lZWRzQ29tbWEiLCJzcGVjaWZpZXJzVGV4dCIsImZpeGVzIiwicHVzaCIsImluc2VydFRleHRBZnRlciIsImluc2VydFRleHRCZWZvcmUiLCJyZW1vdmUiLCJ2YWx1ZSIsInR5cGUiLCJkZWZhdWx0U3BlY2lmaWVyIiwibG9jYWwiLCJuYW1lIiwiaGFzQ29tbWVudEJlZm9yZSIsImhhc0NvbW1lbnRBZnRlciIsImhhc0NvbW1lbnRJbnNpZGVOb25TcGVjaWZpZXJzIiwiY29tbWVudCIsImxvYyIsImVuZCIsImxpbmUiLCJzdGFydCIsImdldENvbW1lbnRzQWZ0ZXIiLCJvcGVuQnJhY2VJbmRleCIsImZpbmRJbmRleCIsImNsb3NlQnJhY2VJbmRleCIsInNvbWVUb2tlbnMiLCJjb25jYXQiLCJleHBvcnRzIiwibWV0YSIsImRvY3MiLCJ1cmwiLCJmaXhhYmxlIiwiY3JlYXRlIiwiTWFwIiwidHlwZXNJbXBvcnRlZCIsIm4iLCJyZXNvbHZlZFBhdGgiLCJpbXBvcnRNYXAiLCJpbXBvcnRLaW5kIiwiaGFzIiwiZ2V0Iiwic2V0Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7QUFDQTs7Ozs7Ozs7OztBQUVBLFNBQVNBLFlBQVQsQ0FBc0JDLFFBQXRCLEVBQWdDQyxPQUFoQyxFQUF5QztBQUN2QyxxQkFBOEJELFNBQVNFLE9BQVQsRUFBOUIsRUFBa0Q7QUFBQTs7QUFBQSxVQUF0Q0MsTUFBc0M7QUFBQSxVQUE5QkMsS0FBOEI7O0FBQ2hELFFBQUlBLE1BQU1DLE1BQU4sR0FBZSxDQUFuQixFQUFzQjtBQUNwQixZQUFNQyxVQUFXLElBQUdILE1BQU8sNEJBQTNCOztBQURvQiw0QkFFS0MsS0FGTDs7QUFBQSxZQUViRyxLQUZhO0FBQUEsWUFFSEMsSUFGRzs7QUFHcEIsWUFBTUMsYUFBYVIsUUFBUVMsYUFBUixFQUFuQjtBQUNBLFlBQU1DLE1BQU1DLE9BQU9MLEtBQVAsRUFBY0MsSUFBZCxFQUFvQkMsVUFBcEIsQ0FBWjs7QUFFQVIsY0FBUVksTUFBUixDQUFlO0FBQ2JDLGNBQU1QLE1BQU1RLE1BREM7QUFFYlQsZUFGYTtBQUdiSyxXQUhhLENBR1I7QUFIUSxPQUFmOztBQU1BLFdBQUssTUFBTUcsSUFBWCxJQUFtQk4sSUFBbkIsRUFBeUI7QUFDdkJQLGdCQUFRWSxNQUFSLENBQWU7QUFDYkMsZ0JBQU1BLEtBQUtDLE1BREU7QUFFYlQ7QUFGYSxTQUFmO0FBSUQ7QUFDRjtBQUNGO0FBQ0Y7O0FBRUQsU0FBU00sTUFBVCxDQUFnQkwsS0FBaEIsRUFBdUJDLElBQXZCLEVBQTZCQyxVQUE3QixFQUF5QztBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFJLE9BQU9BLFdBQVdPLGlCQUFsQixLQUF3QyxVQUE1QyxFQUF3RDtBQUN0RCxXQUFPQyxTQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFJQyx1QkFBdUJYLEtBQXZCLEVBQThCRSxVQUE5QixLQUE2Q1UsYUFBYVosS0FBYixDQUFqRCxFQUFzRTtBQUNwRSxXQUFPVSxTQUFQO0FBQ0Q7O0FBRUQsUUFBTUcscUJBQXFCLElBQUlDLEdBQUosQ0FDekIsQ0FBQ2QsS0FBRCw0QkFBV0MsSUFBWCxHQUFpQmMsR0FBakIsQ0FBcUJDLG9CQUFyQixFQUEyQ0MsTUFBM0MsQ0FBa0RDLE9BQWxELENBRHlCLENBQTNCOztBQUlBO0FBQ0E7QUFDQSxNQUFJTCxtQkFBbUJNLElBQW5CLEdBQTBCLENBQTlCLEVBQWlDO0FBQy9CLFdBQU9ULFNBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0EsUUFBTVUsc0JBQXNCbkIsS0FBS2dCLE1BQUwsQ0FBWVYsUUFBUSxFQUM5Q0ksdUJBQXVCSixJQUF2QixFQUE2QkwsVUFBN0IsS0FDQVUsYUFBYUwsSUFBYixDQUY4QyxDQUFwQixDQUE1Qjs7QUFLQSxRQUFNYyxhQUFhRCxvQkFDaEJMLEdBRGdCLENBQ1pSLFFBQVE7QUFDWCxVQUFNZSxTQUFTcEIsV0FBV3FCLFNBQVgsQ0FBcUJoQixJQUFyQixDQUFmO0FBQ0EsVUFBTWlCLFlBQVlGLE9BQU9HLElBQVAsQ0FBWUMsU0FBU0MsYUFBYUQsS0FBYixFQUFvQixHQUFwQixDQUFyQixDQUFsQjtBQUNBLFVBQU1FLGFBQWFOLE9BQU9HLElBQVAsQ0FBWUMsU0FBU0MsYUFBYUQsS0FBYixFQUFvQixHQUFwQixDQUFyQixDQUFuQjs7QUFFQSxRQUFJRixhQUFhLElBQWIsSUFBcUJJLGNBQWMsSUFBdkMsRUFBNkM7QUFDM0MsYUFBT2xCLFNBQVA7QUFDRDs7QUFFRCxXQUFPO0FBQ0xtQixrQkFBWXRCLElBRFA7QUFFTHVCLFlBQU01QixXQUFXNEIsSUFBWCxDQUFnQkMsS0FBaEIsQ0FBc0JQLFVBQVVRLEtBQVYsQ0FBZ0IsQ0FBaEIsQ0FBdEIsRUFBMENKLFdBQVdJLEtBQVgsQ0FBaUIsQ0FBakIsQ0FBMUMsQ0FGRDtBQUdMQyx3QkFBa0JOLGFBQWF6QixXQUFXZ0MsY0FBWCxDQUEwQk4sVUFBMUIsQ0FBYixFQUFvRCxHQUFwRCxDQUhiO0FBSUxPLGVBQVMsQ0FBQ0MsY0FBYzdCLElBQWQ7QUFKTCxLQUFQO0FBTUQsR0FoQmdCLEVBaUJoQlUsTUFqQmdCLENBaUJUQyxPQWpCUyxDQUFuQjs7QUFtQkEsUUFBTW1CLHFCQUFxQmpCLG9CQUFvQkgsTUFBcEIsQ0FBMkJWLFFBQ3BELENBQUM2QixjQUFjN0IsSUFBZCxDQUFELElBQ0EsQ0FBQ0ssYUFBYUwsSUFBYixDQURELElBRUEsQ0FBQ2MsV0FBV2lCLElBQVgsQ0FBZ0JDLGFBQWFBLFVBQVVWLFVBQVYsS0FBeUJ0QixJQUF0RCxDQUh3QixDQUEzQjs7QUFNQSxRQUFNaUMsbUJBQW1CeEIscUJBQXFCaEIsS0FBckIsS0FBK0IsSUFBL0IsSUFBdUNhLG1CQUFtQk0sSUFBbkIsS0FBNEIsQ0FBNUY7QUFDQSxRQUFNc0Isc0JBQXNCcEIsV0FBV3ZCLE1BQVgsR0FBb0IsQ0FBaEQ7QUFDQSxRQUFNNEMsMEJBQTBCTCxtQkFBbUJ2QyxNQUFuQixHQUE0QixDQUE1RDs7QUFFQSxNQUFJLEVBQUUwQyxvQkFBb0JDLG1CQUFwQixJQUEyQ0MsdUJBQTdDLENBQUosRUFBMkU7QUFDekUsV0FBT2hDLFNBQVA7QUFDRDs7QUFFRCxTQUFPaUMsU0FBUztBQUNkLFVBQU1yQixTQUFTcEIsV0FBV3FCLFNBQVgsQ0FBcUJ2QixLQUFyQixDQUFmO0FBQ0EsVUFBTXdCLFlBQVlGLE9BQU9HLElBQVAsQ0FBWUMsU0FBU0MsYUFBYUQsS0FBYixFQUFvQixHQUFwQixDQUFyQixDQUFsQjtBQUNBLFVBQU1FLGFBQWFOLE9BQU9HLElBQVAsQ0FBWUMsU0FBU0MsYUFBYUQsS0FBYixFQUFvQixHQUFwQixDQUFyQixDQUFuQjtBQUNBLFVBQU1rQixhQUFhMUMsV0FBVzJDLGFBQVgsQ0FBeUI3QyxLQUF6QixDQUFuQjs7QUFKYyw2Q0FLY2Esa0JBTGQ7O0FBQUEsVUFLUGlDLGlCQUxPOzs7QUFPZCxVQUFNQyx3QkFDSm5CLGNBQWMsSUFBZCxJQUNBRCxhQUFhekIsV0FBV2dDLGNBQVgsQ0FBMEJOLFVBQTFCLENBQWIsRUFBb0QsR0FBcEQsQ0FGRjtBQUdBLFVBQU1vQixlQUFlLENBQUNaLGNBQWNwQyxLQUFkLENBQXRCOztBQVZjLDZCQVlXcUIsV0FBVzRCLE1BQVgsQ0FDdkIsUUFBdUJWLFNBQXZCLEtBQXFDO0FBQUE7O0FBQUEsVUFBbkNXLE1BQW1DO0FBQUEsVUFBM0JDLFVBQTJCOztBQUNuQyxhQUFPLENBQ0xBLGNBQWMsQ0FBQ1osVUFBVUosT0FBekIsR0FDSyxHQUFFZSxNQUFPLElBQUdYLFVBQVVULElBQUssRUFEaEMsR0FFSyxHQUFFb0IsTUFBTyxHQUFFWCxVQUFVVCxJQUFLLEVBSDFCLEVBSUxTLFVBQVVKLE9BQVYsR0FBb0JnQixVQUFwQixHQUFpQyxJQUo1QixDQUFQO0FBTUQsS0FSc0IsRUFTdkIsQ0FBQyxFQUFELEVBQUssQ0FBQ0oscUJBQUQsSUFBMEIsQ0FBQ0MsWUFBaEMsQ0FUdUIsQ0FaWDtBQUFBOztBQUFBLFVBWVBJLGNBWk87OztBQXdCZCxVQUFNQyxRQUFRLEVBQWQ7O0FBRUEsUUFBSWIsb0JBQW9CaEIsYUFBYSxJQUFqQyxJQUF5Q2lCLG1CQUE3QyxFQUFrRTtBQUNoRTtBQUNBWSxZQUFNQyxJQUFOLENBQ0VYLE1BQU1ZLGVBQU4sQ0FBc0JYLFVBQXRCLEVBQW1DLElBQUdFLGlCQUFrQixNQUFLTSxjQUFlLFFBQTVFLENBREY7QUFHRCxLQUxELE1BS08sSUFBSVosb0JBQW9CaEIsYUFBYSxJQUFqQyxJQUF5QyxDQUFDaUIsbUJBQTlDLEVBQW1FO0FBQ3hFO0FBQ0FZLFlBQU1DLElBQU4sQ0FBV1gsTUFBTVksZUFBTixDQUFzQlgsVUFBdEIsRUFBbUMsSUFBR0UsaUJBQWtCLE9BQXhELENBQVg7QUFDRCxLQUhNLE1BR0EsSUFBSU4sb0JBQW9CaEIsYUFBYSxJQUFqQyxJQUF5Q0ksY0FBYyxJQUEzRCxFQUFpRTtBQUN0RTtBQUNBeUIsWUFBTUMsSUFBTixDQUFXWCxNQUFNWSxlQUFOLENBQXNCWCxVQUF0QixFQUFtQyxJQUFHRSxpQkFBa0IsR0FBeEQsQ0FBWDtBQUNBLFVBQUlMLG1CQUFKLEVBQXlCO0FBQ3ZCO0FBQ0FZLGNBQU1DLElBQU4sQ0FBV1gsTUFBTWEsZ0JBQU4sQ0FBdUI1QixVQUF2QixFQUFtQ3dCLGNBQW5DLENBQVg7QUFDRDtBQUNGLEtBUE0sTUFPQSxJQUFJLENBQUNaLGdCQUFELElBQXFCaEIsYUFBYSxJQUFsQyxJQUEwQ2lCLG1CQUE5QyxFQUFtRTtBQUN4RTtBQUNBWSxZQUFNQyxJQUFOLENBQVdYLE1BQU1ZLGVBQU4sQ0FBc0JYLFVBQXRCLEVBQW1DLEtBQUlRLGNBQWUsUUFBdEQsQ0FBWDtBQUNELEtBSE0sTUFHQSxJQUFJLENBQUNaLGdCQUFELElBQXFCaEIsYUFBYSxJQUFsQyxJQUEwQ0ksY0FBYyxJQUE1RCxFQUFrRTtBQUN2RTtBQUNBeUIsWUFBTUMsSUFBTixDQUFXWCxNQUFNYSxnQkFBTixDQUF1QjVCLFVBQXZCLEVBQW1Dd0IsY0FBbkMsQ0FBWDtBQUNEOztBQUVEO0FBQ0EsU0FBSyxNQUFNYixTQUFYLElBQXdCbEIsVUFBeEIsRUFBb0M7QUFDbENnQyxZQUFNQyxJQUFOLENBQVdYLE1BQU1jLE1BQU4sQ0FBYWxCLFVBQVVWLFVBQXZCLENBQVg7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxTQUFLLE1BQU10QixJQUFYLElBQW1COEIsa0JBQW5CLEVBQXVDO0FBQ3JDZ0IsWUFBTUMsSUFBTixDQUFXWCxNQUFNYyxNQUFOLENBQWFsRCxJQUFiLENBQVg7QUFDRDs7QUFFRCxXQUFPOEMsS0FBUDtBQUNELEdBOUREO0FBK0REOztBQUVELFNBQVMxQixZQUFULENBQXNCcEIsSUFBdEIsRUFBNEJtRCxLQUE1QixFQUFtQztBQUNqQyxTQUFPbkQsS0FBS29ELElBQUwsS0FBYyxZQUFkLElBQThCcEQsS0FBS21ELEtBQUwsS0FBZUEsS0FBcEQ7QUFDRDs7QUFFRDtBQUNBLFNBQVMxQyxvQkFBVCxDQUE4QlQsSUFBOUIsRUFBb0M7QUFDbEMsUUFBTXFELG1CQUFtQnJELEtBQUtjLFVBQUwsQ0FDdEJJLElBRHNCLENBQ2pCYyxhQUFhQSxVQUFVb0IsSUFBVixLQUFtQix3QkFEZixDQUF6QjtBQUVBLFNBQU9DLG9CQUFvQixJQUFwQixHQUEyQkEsaUJBQWlCQyxLQUFqQixDQUF1QkMsSUFBbEQsR0FBeURwRCxTQUFoRTtBQUNEOztBQUVEO0FBQ0EsU0FBU0UsWUFBVCxDQUFzQkwsSUFBdEIsRUFBNEI7QUFDMUIsUUFBTWMsYUFBYWQsS0FBS2MsVUFBTCxDQUNoQkosTUFEZ0IsQ0FDVHNCLGFBQWFBLFVBQVVvQixJQUFWLEtBQW1CLDBCQUR2QixDQUFuQjtBQUVBLFNBQU90QyxXQUFXdkIsTUFBWCxHQUFvQixDQUEzQjtBQUNEOztBQUVEO0FBQ0EsU0FBU3NDLGFBQVQsQ0FBdUI3QixJQUF2QixFQUE2QjtBQUMzQixRQUFNYyxhQUFhZCxLQUFLYyxVQUFMLENBQ2hCSixNQURnQixDQUNUc0IsYUFBYUEsVUFBVW9CLElBQVYsS0FBbUIsaUJBRHZCLENBQW5CO0FBRUEsU0FBT3RDLFdBQVd2QixNQUFYLEdBQW9CLENBQTNCO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLFNBQVNhLHNCQUFULENBQWdDSixJQUFoQyxFQUFzQ0wsVUFBdEMsRUFBa0Q7QUFDaEQsU0FDRTZELGlCQUFpQnhELElBQWpCLEVBQXVCTCxVQUF2QixLQUNBOEQsZ0JBQWdCekQsSUFBaEIsRUFBc0JMLFVBQXRCLENBREEsSUFFQStELDhCQUE4QjFELElBQTlCLEVBQW9DTCxVQUFwQyxDQUhGO0FBS0Q7O0FBRUQ7QUFDQTtBQUNBLFNBQVM2RCxnQkFBVCxDQUEwQnhELElBQTFCLEVBQWdDTCxVQUFoQyxFQUE0QztBQUMxQyxTQUFPQSxXQUFXTyxpQkFBWCxDQUE2QkYsSUFBN0IsRUFDSitCLElBREksQ0FDQzRCLFdBQVdBLFFBQVFDLEdBQVIsQ0FBWUMsR0FBWixDQUFnQkMsSUFBaEIsSUFBd0I5RCxLQUFLNEQsR0FBTCxDQUFTRyxLQUFULENBQWVELElBQWYsR0FBc0IsQ0FEMUQsQ0FBUDtBQUVEOztBQUVEO0FBQ0E7QUFDQSxTQUFTTCxlQUFULENBQXlCekQsSUFBekIsRUFBK0JMLFVBQS9CLEVBQTJDO0FBQ3pDLFNBQU9BLFdBQVdxRSxnQkFBWCxDQUE0QmhFLElBQTVCLEVBQ0orQixJQURJLENBQ0M0QixXQUFXQSxRQUFRQyxHQUFSLENBQVlHLEtBQVosQ0FBa0JELElBQWxCLEtBQTJCOUQsS0FBSzRELEdBQUwsQ0FBU0MsR0FBVCxDQUFhQyxJQURwRCxDQUFQO0FBRUQ7O0FBRUQ7QUFDQTtBQUNBLFNBQVNKLDZCQUFULENBQXVDMUQsSUFBdkMsRUFBNkNMLFVBQTdDLEVBQXlEO0FBQ3ZELFFBQU1vQixTQUFTcEIsV0FBV3FCLFNBQVgsQ0FBcUJoQixJQUFyQixDQUFmO0FBQ0EsUUFBTWlFLGlCQUFpQmxELE9BQU9tRCxTQUFQLENBQWlCL0MsU0FBU0MsYUFBYUQsS0FBYixFQUFvQixHQUFwQixDQUExQixDQUF2QjtBQUNBLFFBQU1nRCxrQkFBa0JwRCxPQUFPbUQsU0FBUCxDQUFpQi9DLFNBQVNDLGFBQWFELEtBQWIsRUFBb0IsR0FBcEIsQ0FBMUIsQ0FBeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFNaUQsYUFBYUgsa0JBQWtCLENBQWxCLElBQXVCRSxtQkFBbUIsQ0FBMUMsR0FDZnBELE9BQU9TLEtBQVAsQ0FBYSxDQUFiLEVBQWdCeUMsaUJBQWlCLENBQWpDLEVBQW9DSSxNQUFwQyxDQUEyQ3RELE9BQU9TLEtBQVAsQ0FBYTJDLGtCQUFrQixDQUEvQixDQUEzQyxDQURlLEdBRWZwRCxPQUFPUyxLQUFQLENBQWEsQ0FBYixDQUZKO0FBR0EsU0FBTzRDLFdBQVdyQyxJQUFYLENBQWdCWixTQUFTeEIsV0FBV08saUJBQVgsQ0FBNkJpQixLQUE3QixFQUFvQzVCLE1BQXBDLEdBQTZDLENBQXRFLENBQVA7QUFDRDs7QUFFREYsT0FBT2lGLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKbkIsVUFBTSxTQURGO0FBRUpvQixVQUFNO0FBQ0pDLFdBQUssdUJBQVEsZUFBUjtBQURELEtBRkY7QUFLSkMsYUFBUztBQUxMLEdBRFM7O0FBU2ZDLFVBQVEsVUFBVXhGLE9BQVYsRUFBbUI7QUFDekIsVUFBTUQsV0FBVyxJQUFJMEYsR0FBSixFQUFqQjtBQUNBLFVBQU1DLGdCQUFnQixJQUFJRCxHQUFKLEVBQXRCO0FBQ0EsV0FBTztBQUNMLDJCQUFxQixVQUFVRSxDQUFWLEVBQWE7QUFDaEM7QUFDQSxjQUFNQyxlQUFlLHVCQUFRRCxFQUFFN0UsTUFBRixDQUFTa0QsS0FBakIsRUFBd0JoRSxPQUF4QixLQUFvQzJGLEVBQUU3RSxNQUFGLENBQVNrRCxLQUFsRTtBQUNBLGNBQU02QixZQUFZRixFQUFFRyxVQUFGLEtBQWlCLE1BQWpCLEdBQTBCSixhQUExQixHQUEwQzNGLFFBQTVEOztBQUVBLFlBQUk4RixVQUFVRSxHQUFWLENBQWNILFlBQWQsQ0FBSixFQUFpQztBQUMvQkMsb0JBQVVHLEdBQVYsQ0FBY0osWUFBZCxFQUE0QmhDLElBQTVCLENBQWlDK0IsQ0FBakM7QUFDRCxTQUZELE1BRU87QUFDTEUsb0JBQVVJLEdBQVYsQ0FBY0wsWUFBZCxFQUE0QixDQUFDRCxDQUFELENBQTVCO0FBQ0Q7QUFDRixPQVhJOztBQWFMLHNCQUFnQixZQUFZO0FBQzFCN0YscUJBQWFDLFFBQWIsRUFBdUJDLE9BQXZCO0FBQ0FGLHFCQUFhNEYsYUFBYixFQUE0QjFGLE9BQTVCO0FBQ0Q7QUFoQkksS0FBUDtBQWtCRDtBQTlCYyxDQUFqQiIsImZpbGUiOiJuby1kdXBsaWNhdGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJ1xyXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJ1xyXG5cclxuZnVuY3Rpb24gY2hlY2tJbXBvcnRzKGltcG9ydGVkLCBjb250ZXh0KSB7XHJcbiAgZm9yIChjb25zdCBbbW9kdWxlLCBub2Rlc10gb2YgaW1wb3J0ZWQuZW50cmllcygpKSB7XHJcbiAgICBpZiAobm9kZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICBjb25zdCBtZXNzYWdlID0gYCcke21vZHVsZX0nIGltcG9ydGVkIG11bHRpcGxlIHRpbWVzLmBcclxuICAgICAgY29uc3QgW2ZpcnN0LCAuLi5yZXN0XSA9IG5vZGVzXHJcbiAgICAgIGNvbnN0IHNvdXJjZUNvZGUgPSBjb250ZXh0LmdldFNvdXJjZUNvZGUoKVxyXG4gICAgICBjb25zdCBmaXggPSBnZXRGaXgoZmlyc3QsIHJlc3QsIHNvdXJjZUNvZGUpXHJcblxyXG4gICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgbm9kZTogZmlyc3Quc291cmNlLFxyXG4gICAgICAgIG1lc3NhZ2UsXHJcbiAgICAgICAgZml4LCAvLyBBdHRhY2ggdGhlIGF1dG9maXggKGlmIGFueSkgdG8gdGhlIGZpcnN0IGltcG9ydC5cclxuICAgICAgfSlcclxuXHJcbiAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiByZXN0KSB7XHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgbm9kZTogbm9kZS5zb3VyY2UsXHJcbiAgICAgICAgICBtZXNzYWdlLFxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpeChmaXJzdCwgcmVzdCwgc291cmNlQ29kZSkge1xyXG4gIC8vIFNvcnJ5IEVTTGludCA8PSAzIHVzZXJzLCBubyBhdXRvZml4IGZvciB5b3UuIEF1dG9maXhpbmcgZHVwbGljYXRlIGltcG9ydHNcclxuICAvLyByZXF1aXJlcyBtdWx0aXBsZSBgZml4ZXIud2hhdGV2ZXIoKWAgY2FsbHMgaW4gdGhlIGBmaXhgOiBXZSBib3RoIG5lZWQgdG9cclxuICAvLyB1cGRhdGUgdGhlIGZpcnN0IG9uZSwgYW5kIHJlbW92ZSB0aGUgcmVzdC4gU3VwcG9ydCBmb3IgbXVsdGlwbGVcclxuICAvLyBgZml4ZXIud2hhdGV2ZXIoKWAgaW4gYSBzaW5nbGUgYGZpeGAgd2FzIGFkZGVkIGluIEVTTGludCA0LjEuXHJcbiAgLy8gYHNvdXJjZUNvZGUuZ2V0Q29tbWVudHNCZWZvcmVgIHdhcyBhZGRlZCBpbiA0LjAsIHNvIHRoYXQncyBhbiBlYXN5IHRoaW5nIHRvXHJcbiAgLy8gY2hlY2sgZm9yLlxyXG4gIGlmICh0eXBlb2Ygc291cmNlQ29kZS5nZXRDb21tZW50c0JlZm9yZSAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIH1cclxuXHJcbiAgLy8gQWRqdXN0aW5nIHRoZSBmaXJzdCBpbXBvcnQgbWlnaHQgbWFrZSBpdCBtdWx0aWxpbmUsIHdoaWNoIGNvdWxkIGJyZWFrXHJcbiAgLy8gYGVzbGludC1kaXNhYmxlLW5leHQtbGluZWAgY29tbWVudHMgYW5kIHNpbWlsYXIsIHNvIGJhaWwgaWYgdGhlIGZpcnN0XHJcbiAgLy8gaW1wb3J0IGhhcyBjb21tZW50cy4gQWxzbywgaWYgdGhlIGZpcnN0IGltcG9ydCBpcyBgaW1wb3J0ICogYXMgbnMgZnJvbVxyXG4gIC8vICcuL2ZvbydgIHRoZXJlJ3Mgbm90aGluZyB3ZSBjYW4gZG8uXHJcbiAgaWYgKGhhc1Byb2JsZW1hdGljQ29tbWVudHMoZmlyc3QsIHNvdXJjZUNvZGUpIHx8IGhhc05hbWVzcGFjZShmaXJzdCkpIHtcclxuICAgIHJldHVybiB1bmRlZmluZWRcclxuICB9XHJcblxyXG4gIGNvbnN0IGRlZmF1bHRJbXBvcnROYW1lcyA9IG5ldyBTZXQoXHJcbiAgICBbZmlyc3QsIC4uLnJlc3RdLm1hcChnZXREZWZhdWx0SW1wb3J0TmFtZSkuZmlsdGVyKEJvb2xlYW4pXHJcbiAgKVxyXG5cclxuICAvLyBCYWlsIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBkaWZmZXJlbnQgZGVmYXVsdCBpbXBvcnQgbmFtZXMg4oCTIGl0J3MgdXAgdG8gdGhlXHJcbiAgLy8gdXNlciB0byBjaG9vc2Ugd2hpY2ggb25lIHRvIGtlZXAuXHJcbiAgaWYgKGRlZmF1bHRJbXBvcnROYW1lcy5zaXplID4gMSkge1xyXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIH1cclxuXHJcbiAgLy8gTGVhdmUgaXQgdG8gdGhlIHVzZXIgdG8gaGFuZGxlIGNvbW1lbnRzLiBBbHNvIHNraXAgYGltcG9ydCAqIGFzIG5zIGZyb21cclxuICAvLyAnLi9mb28nYCBpbXBvcnRzLCBzaW5jZSB0aGV5IGNhbm5vdCBiZSBtZXJnZWQgaW50byBhbm90aGVyIGltcG9ydC5cclxuICBjb25zdCByZXN0V2l0aG91dENvbW1lbnRzID0gcmVzdC5maWx0ZXIobm9kZSA9PiAhKFxyXG4gICAgaGFzUHJvYmxlbWF0aWNDb21tZW50cyhub2RlLCBzb3VyY2VDb2RlKSB8fFxyXG4gICAgaGFzTmFtZXNwYWNlKG5vZGUpXHJcbiAgKSlcclxuXHJcbiAgY29uc3Qgc3BlY2lmaWVycyA9IHJlc3RXaXRob3V0Q29tbWVudHNcclxuICAgIC5tYXAobm9kZSA9PiB7XHJcbiAgICAgIGNvbnN0IHRva2VucyA9IHNvdXJjZUNvZGUuZ2V0VG9rZW5zKG5vZGUpXHJcbiAgICAgIGNvbnN0IG9wZW5CcmFjZSA9IHRva2Vucy5maW5kKHRva2VuID0+IGlzUHVuY3R1YXRvcih0b2tlbiwgJ3snKSlcclxuICAgICAgY29uc3QgY2xvc2VCcmFjZSA9IHRva2Vucy5maW5kKHRva2VuID0+IGlzUHVuY3R1YXRvcih0b2tlbiwgJ30nKSlcclxuXHJcbiAgICAgIGlmIChvcGVuQnJhY2UgPT0gbnVsbCB8fCBjbG9zZUJyYWNlID09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgaW1wb3J0Tm9kZTogbm9kZSxcclxuICAgICAgICB0ZXh0OiBzb3VyY2VDb2RlLnRleHQuc2xpY2Uob3BlbkJyYWNlLnJhbmdlWzFdLCBjbG9zZUJyYWNlLnJhbmdlWzBdKSxcclxuICAgICAgICBoYXNUcmFpbGluZ0NvbW1hOiBpc1B1bmN0dWF0b3Ioc291cmNlQ29kZS5nZXRUb2tlbkJlZm9yZShjbG9zZUJyYWNlKSwgJywnKSxcclxuICAgICAgICBpc0VtcHR5OiAhaGFzU3BlY2lmaWVycyhub2RlKSxcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIC5maWx0ZXIoQm9vbGVhbilcclxuXHJcbiAgY29uc3QgdW5uZWNlc3NhcnlJbXBvcnRzID0gcmVzdFdpdGhvdXRDb21tZW50cy5maWx0ZXIobm9kZSA9PlxyXG4gICAgIWhhc1NwZWNpZmllcnMobm9kZSkgJiZcclxuICAgICFoYXNOYW1lc3BhY2Uobm9kZSkgJiZcclxuICAgICFzcGVjaWZpZXJzLnNvbWUoc3BlY2lmaWVyID0+IHNwZWNpZmllci5pbXBvcnROb2RlID09PSBub2RlKVxyXG4gIClcclxuXHJcbiAgY29uc3Qgc2hvdWxkQWRkRGVmYXVsdCA9IGdldERlZmF1bHRJbXBvcnROYW1lKGZpcnN0KSA9PSBudWxsICYmIGRlZmF1bHRJbXBvcnROYW1lcy5zaXplID09PSAxXHJcbiAgY29uc3Qgc2hvdWxkQWRkU3BlY2lmaWVycyA9IHNwZWNpZmllcnMubGVuZ3RoID4gMFxyXG4gIGNvbnN0IHNob3VsZFJlbW92ZVVubmVjZXNzYXJ5ID0gdW5uZWNlc3NhcnlJbXBvcnRzLmxlbmd0aCA+IDBcclxuXHJcbiAgaWYgKCEoc2hvdWxkQWRkRGVmYXVsdCB8fCBzaG91bGRBZGRTcGVjaWZpZXJzIHx8IHNob3VsZFJlbW92ZVVubmVjZXNzYXJ5KSkge1xyXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGZpeGVyID0+IHtcclxuICAgIGNvbnN0IHRva2VucyA9IHNvdXJjZUNvZGUuZ2V0VG9rZW5zKGZpcnN0KVxyXG4gICAgY29uc3Qgb3BlbkJyYWNlID0gdG9rZW5zLmZpbmQodG9rZW4gPT4gaXNQdW5jdHVhdG9yKHRva2VuLCAneycpKVxyXG4gICAgY29uc3QgY2xvc2VCcmFjZSA9IHRva2Vucy5maW5kKHRva2VuID0+IGlzUHVuY3R1YXRvcih0b2tlbiwgJ30nKSlcclxuICAgIGNvbnN0IGZpcnN0VG9rZW4gPSBzb3VyY2VDb2RlLmdldEZpcnN0VG9rZW4oZmlyc3QpXHJcbiAgICBjb25zdCBbZGVmYXVsdEltcG9ydE5hbWVdID0gZGVmYXVsdEltcG9ydE5hbWVzXHJcblxyXG4gICAgY29uc3QgZmlyc3RIYXNUcmFpbGluZ0NvbW1hID1cclxuICAgICAgY2xvc2VCcmFjZSAhPSBudWxsICYmXHJcbiAgICAgIGlzUHVuY3R1YXRvcihzb3VyY2VDb2RlLmdldFRva2VuQmVmb3JlKGNsb3NlQnJhY2UpLCAnLCcpXHJcbiAgICBjb25zdCBmaXJzdElzRW1wdHkgPSAhaGFzU3BlY2lmaWVycyhmaXJzdClcclxuXHJcbiAgICBjb25zdCBbc3BlY2lmaWVyc1RleHRdID0gc3BlY2lmaWVycy5yZWR1Y2UoXHJcbiAgICAgIChbcmVzdWx0LCBuZWVkc0NvbW1hXSwgc3BlY2lmaWVyKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIG5lZWRzQ29tbWEgJiYgIXNwZWNpZmllci5pc0VtcHR5XHJcbiAgICAgICAgICAgID8gYCR7cmVzdWx0fSwke3NwZWNpZmllci50ZXh0fWBcclxuICAgICAgICAgICAgOiBgJHtyZXN1bHR9JHtzcGVjaWZpZXIudGV4dH1gLFxyXG4gICAgICAgICAgc3BlY2lmaWVyLmlzRW1wdHkgPyBuZWVkc0NvbW1hIDogdHJ1ZSxcclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIFsnJywgIWZpcnN0SGFzVHJhaWxpbmdDb21tYSAmJiAhZmlyc3RJc0VtcHR5XVxyXG4gICAgKVxyXG5cclxuICAgIGNvbnN0IGZpeGVzID0gW11cclxuXHJcbiAgICBpZiAoc2hvdWxkQWRkRGVmYXVsdCAmJiBvcGVuQnJhY2UgPT0gbnVsbCAmJiBzaG91bGRBZGRTcGVjaWZpZXJzKSB7XHJcbiAgICAgIC8vIGBpbXBvcnQgJy4vZm9vJ2Ag4oaSIGBpbXBvcnQgZGVmLCB7Li4ufSBmcm9tICcuL2ZvbydgXHJcbiAgICAgIGZpeGVzLnB1c2goXHJcbiAgICAgICAgZml4ZXIuaW5zZXJ0VGV4dEFmdGVyKGZpcnN0VG9rZW4sIGAgJHtkZWZhdWx0SW1wb3J0TmFtZX0sIHske3NwZWNpZmllcnNUZXh0fX0gZnJvbWApXHJcbiAgICAgIClcclxuICAgIH0gZWxzZSBpZiAoc2hvdWxkQWRkRGVmYXVsdCAmJiBvcGVuQnJhY2UgPT0gbnVsbCAmJiAhc2hvdWxkQWRkU3BlY2lmaWVycykge1xyXG4gICAgICAvLyBgaW1wb3J0ICcuL2ZvbydgIOKGkiBgaW1wb3J0IGRlZiBmcm9tICcuL2ZvbydgXHJcbiAgICAgIGZpeGVzLnB1c2goZml4ZXIuaW5zZXJ0VGV4dEFmdGVyKGZpcnN0VG9rZW4sIGAgJHtkZWZhdWx0SW1wb3J0TmFtZX0gZnJvbWApKVxyXG4gICAgfSBlbHNlIGlmIChzaG91bGRBZGREZWZhdWx0ICYmIG9wZW5CcmFjZSAhPSBudWxsICYmIGNsb3NlQnJhY2UgIT0gbnVsbCkge1xyXG4gICAgICAvLyBgaW1wb3J0IHsuLi59IGZyb20gJy4vZm9vJ2Ag4oaSIGBpbXBvcnQgZGVmLCB7Li4ufSBmcm9tICcuL2ZvbydgXHJcbiAgICAgIGZpeGVzLnB1c2goZml4ZXIuaW5zZXJ0VGV4dEFmdGVyKGZpcnN0VG9rZW4sIGAgJHtkZWZhdWx0SW1wb3J0TmFtZX0sYCkpXHJcbiAgICAgIGlmIChzaG91bGRBZGRTcGVjaWZpZXJzKSB7XHJcbiAgICAgICAgLy8gYGltcG9ydCBkZWYsIHsuLi59IGZyb20gJy4vZm9vJ2Ag4oaSIGBpbXBvcnQgZGVmLCB7Li4uLCAuLi59IGZyb20gJy4vZm9vJ2BcclxuICAgICAgICBmaXhlcy5wdXNoKGZpeGVyLmluc2VydFRleHRCZWZvcmUoY2xvc2VCcmFjZSwgc3BlY2lmaWVyc1RleHQpKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKCFzaG91bGRBZGREZWZhdWx0ICYmIG9wZW5CcmFjZSA9PSBudWxsICYmIHNob3VsZEFkZFNwZWNpZmllcnMpIHtcclxuICAgICAgLy8gYGltcG9ydCAnLi9mb28nYCDihpIgYGltcG9ydCB7Li4ufSBmcm9tICcuL2ZvbydgXHJcbiAgICAgIGZpeGVzLnB1c2goZml4ZXIuaW5zZXJ0VGV4dEFmdGVyKGZpcnN0VG9rZW4sIGAgeyR7c3BlY2lmaWVyc1RleHR9fSBmcm9tYCkpXHJcbiAgICB9IGVsc2UgaWYgKCFzaG91bGRBZGREZWZhdWx0ICYmIG9wZW5CcmFjZSAhPSBudWxsICYmIGNsb3NlQnJhY2UgIT0gbnVsbCkge1xyXG4gICAgICAvLyBgaW1wb3J0IHsuLi59ICcuL2ZvbydgIOKGkiBgaW1wb3J0IHsuLi4sIC4uLn0gZnJvbSAnLi9mb28nYFxyXG4gICAgICBmaXhlcy5wdXNoKGZpeGVyLmluc2VydFRleHRCZWZvcmUoY2xvc2VCcmFjZSwgc3BlY2lmaWVyc1RleHQpKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbW92ZSBpbXBvcnRzIHdob3NlIHNwZWNpZmllcnMgaGF2ZSBiZWVuIG1vdmVkIGludG8gdGhlIGZpcnN0IGltcG9ydC5cclxuICAgIGZvciAoY29uc3Qgc3BlY2lmaWVyIG9mIHNwZWNpZmllcnMpIHtcclxuICAgICAgZml4ZXMucHVzaChmaXhlci5yZW1vdmUoc3BlY2lmaWVyLmltcG9ydE5vZGUpKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbW92ZSBpbXBvcnRzIHdob3NlIGRlZmF1bHQgaW1wb3J0IGhhcyBiZWVuIG1vdmVkIHRvIHRoZSBmaXJzdCBpbXBvcnQsXHJcbiAgICAvLyBhbmQgc2lkZS1lZmZlY3Qtb25seSBpbXBvcnRzIHRoYXQgYXJlIHVubmVjZXNzYXJ5IGR1ZSB0byB0aGUgZmlyc3RcclxuICAgIC8vIGltcG9ydC5cclxuICAgIGZvciAoY29uc3Qgbm9kZSBvZiB1bm5lY2Vzc2FyeUltcG9ydHMpIHtcclxuICAgICAgZml4ZXMucHVzaChmaXhlci5yZW1vdmUobm9kZSkpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZpeGVzXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpc1B1bmN0dWF0b3Iobm9kZSwgdmFsdWUpIHtcclxuICByZXR1cm4gbm9kZS50eXBlID09PSAnUHVuY3R1YXRvcicgJiYgbm9kZS52YWx1ZSA9PT0gdmFsdWVcclxufVxyXG5cclxuLy8gR2V0IHRoZSBuYW1lIG9mIHRoZSBkZWZhdWx0IGltcG9ydCBvZiBgbm9kZWAsIGlmIGFueS5cclxuZnVuY3Rpb24gZ2V0RGVmYXVsdEltcG9ydE5hbWUobm9kZSkge1xyXG4gIGNvbnN0IGRlZmF1bHRTcGVjaWZpZXIgPSBub2RlLnNwZWNpZmllcnNcclxuICAgIC5maW5kKHNwZWNpZmllciA9PiBzcGVjaWZpZXIudHlwZSA9PT0gJ0ltcG9ydERlZmF1bHRTcGVjaWZpZXInKVxyXG4gIHJldHVybiBkZWZhdWx0U3BlY2lmaWVyICE9IG51bGwgPyBkZWZhdWx0U3BlY2lmaWVyLmxvY2FsLm5hbWUgOiB1bmRlZmluZWRcclxufVxyXG5cclxuLy8gQ2hlY2tzIHdoZXRoZXIgYG5vZGVgIGhhcyBhIG5hbWVzcGFjZSBpbXBvcnQuXHJcbmZ1bmN0aW9uIGhhc05hbWVzcGFjZShub2RlKSB7XHJcbiAgY29uc3Qgc3BlY2lmaWVycyA9IG5vZGUuc3BlY2lmaWVyc1xyXG4gICAgLmZpbHRlcihzcGVjaWZpZXIgPT4gc3BlY2lmaWVyLnR5cGUgPT09ICdJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXInKVxyXG4gIHJldHVybiBzcGVjaWZpZXJzLmxlbmd0aCA+IDBcclxufVxyXG5cclxuLy8gQ2hlY2tzIHdoZXRoZXIgYG5vZGVgIGhhcyBhbnkgbm9uLWRlZmF1bHQgc3BlY2lmaWVycy5cclxuZnVuY3Rpb24gaGFzU3BlY2lmaWVycyhub2RlKSB7XHJcbiAgY29uc3Qgc3BlY2lmaWVycyA9IG5vZGUuc3BlY2lmaWVyc1xyXG4gICAgLmZpbHRlcihzcGVjaWZpZXIgPT4gc3BlY2lmaWVyLnR5cGUgPT09ICdJbXBvcnRTcGVjaWZpZXInKVxyXG4gIHJldHVybiBzcGVjaWZpZXJzLmxlbmd0aCA+IDBcclxufVxyXG5cclxuLy8gSXQncyBub3Qgb2J2aW91cyB3aGF0IHRoZSB1c2VyIHdhbnRzIHRvIGRvIHdpdGggY29tbWVudHMgYXNzb2NpYXRlZCB3aXRoXHJcbi8vIGR1cGxpY2F0ZSBpbXBvcnRzLCBzbyBza2lwIGltcG9ydHMgd2l0aCBjb21tZW50cyB3aGVuIGF1dG9maXhpbmcuXHJcbmZ1bmN0aW9uIGhhc1Byb2JsZW1hdGljQ29tbWVudHMobm9kZSwgc291cmNlQ29kZSkge1xyXG4gIHJldHVybiAoXHJcbiAgICBoYXNDb21tZW50QmVmb3JlKG5vZGUsIHNvdXJjZUNvZGUpIHx8XHJcbiAgICBoYXNDb21tZW50QWZ0ZXIobm9kZSwgc291cmNlQ29kZSkgfHxcclxuICAgIGhhc0NvbW1lbnRJbnNpZGVOb25TcGVjaWZpZXJzKG5vZGUsIHNvdXJjZUNvZGUpXHJcbiAgKVxyXG59XHJcblxyXG4vLyBDaGVja3Mgd2hldGhlciBgbm9kZWAgaGFzIGEgY29tbWVudCAodGhhdCBlbmRzKSBvbiB0aGUgcHJldmlvdXMgbGluZSBvciBvblxyXG4vLyB0aGUgc2FtZSBsaW5lIGFzIGBub2RlYCAoc3RhcnRzKS5cclxuZnVuY3Rpb24gaGFzQ29tbWVudEJlZm9yZShub2RlLCBzb3VyY2VDb2RlKSB7XHJcbiAgcmV0dXJuIHNvdXJjZUNvZGUuZ2V0Q29tbWVudHNCZWZvcmUobm9kZSlcclxuICAgIC5zb21lKGNvbW1lbnQgPT4gY29tbWVudC5sb2MuZW5kLmxpbmUgPj0gbm9kZS5sb2Muc3RhcnQubGluZSAtIDEpXHJcbn1cclxuXHJcbi8vIENoZWNrcyB3aGV0aGVyIGBub2RlYCBoYXMgYSBjb21tZW50ICh0aGF0IHN0YXJ0cykgb24gdGhlIHNhbWUgbGluZSBhcyBgbm9kZWBcclxuLy8gKGVuZHMpLlxyXG5mdW5jdGlvbiBoYXNDb21tZW50QWZ0ZXIobm9kZSwgc291cmNlQ29kZSkge1xyXG4gIHJldHVybiBzb3VyY2VDb2RlLmdldENvbW1lbnRzQWZ0ZXIobm9kZSlcclxuICAgIC5zb21lKGNvbW1lbnQgPT4gY29tbWVudC5sb2Muc3RhcnQubGluZSA9PT0gbm9kZS5sb2MuZW5kLmxpbmUpXHJcbn1cclxuXHJcbi8vIENoZWNrcyB3aGV0aGVyIGBub2RlYCBoYXMgYW55IGNvbW1lbnRzIF9pbnNpZGUsXyBleGNlcHQgaW5zaWRlIHRoZSBgey4uLn1gXHJcbi8vIHBhcnQgKGlmIGFueSkuXHJcbmZ1bmN0aW9uIGhhc0NvbW1lbnRJbnNpZGVOb25TcGVjaWZpZXJzKG5vZGUsIHNvdXJjZUNvZGUpIHtcclxuICBjb25zdCB0b2tlbnMgPSBzb3VyY2VDb2RlLmdldFRva2Vucyhub2RlKVxyXG4gIGNvbnN0IG9wZW5CcmFjZUluZGV4ID0gdG9rZW5zLmZpbmRJbmRleCh0b2tlbiA9PiBpc1B1bmN0dWF0b3IodG9rZW4sICd7JykpXHJcbiAgY29uc3QgY2xvc2VCcmFjZUluZGV4ID0gdG9rZW5zLmZpbmRJbmRleCh0b2tlbiA9PiBpc1B1bmN0dWF0b3IodG9rZW4sICd9JykpXHJcbiAgLy8gU2xpY2UgYXdheSB0aGUgZmlyc3QgdG9rZW4sIHNpbmNlIHdlJ3JlIG5vIGxvb2tpbmcgZm9yIGNvbW1lbnRzIF9iZWZvcmVfXHJcbiAgLy8gYG5vZGVgIChvbmx5IGluc2lkZSkuIElmIHRoZXJlJ3MgYSBgey4uLn1gIHBhcnQsIGxvb2sgZm9yIGNvbW1lbnRzIGJlZm9yZVxyXG4gIC8vIHRoZSBge2AsIGJ1dCBub3QgYmVmb3JlIHRoZSBgfWAgKGhlbmNlIHRoZSBgKzFgcykuXHJcbiAgY29uc3Qgc29tZVRva2VucyA9IG9wZW5CcmFjZUluZGV4ID49IDAgJiYgY2xvc2VCcmFjZUluZGV4ID49IDBcclxuICAgID8gdG9rZW5zLnNsaWNlKDEsIG9wZW5CcmFjZUluZGV4ICsgMSkuY29uY2F0KHRva2Vucy5zbGljZShjbG9zZUJyYWNlSW5kZXggKyAxKSlcclxuICAgIDogdG9rZW5zLnNsaWNlKDEpXHJcbiAgcmV0dXJuIHNvbWVUb2tlbnMuc29tZSh0b2tlbiA9PiBzb3VyY2VDb2RlLmdldENvbW1lbnRzQmVmb3JlKHRva2VuKS5sZW5ndGggPiAwKVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAncHJvYmxlbScsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tZHVwbGljYXRlcycpLFxyXG4gICAgfSxcclxuICAgIGZpeGFibGU6ICdjb2RlJyxcclxuICB9LFxyXG5cclxuICBjcmVhdGU6IGZ1bmN0aW9uIChjb250ZXh0KSB7XHJcbiAgICBjb25zdCBpbXBvcnRlZCA9IG5ldyBNYXAoKVxyXG4gICAgY29uc3QgdHlwZXNJbXBvcnRlZCA9IG5ldyBNYXAoKVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgJ0ltcG9ydERlY2xhcmF0aW9uJzogZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICAvLyByZXNvbHZlZCBwYXRoIHdpbGwgY292ZXIgYWxpYXNlZCBkdXBsaWNhdGVzXHJcbiAgICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gcmVzb2x2ZShuLnNvdXJjZS52YWx1ZSwgY29udGV4dCkgfHwgbi5zb3VyY2UudmFsdWVcclxuICAgICAgICBjb25zdCBpbXBvcnRNYXAgPSBuLmltcG9ydEtpbmQgPT09ICd0eXBlJyA/IHR5cGVzSW1wb3J0ZWQgOiBpbXBvcnRlZFxyXG5cclxuICAgICAgICBpZiAoaW1wb3J0TWFwLmhhcyhyZXNvbHZlZFBhdGgpKSB7XHJcbiAgICAgICAgICBpbXBvcnRNYXAuZ2V0KHJlc29sdmVkUGF0aCkucHVzaChuKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpbXBvcnRNYXAuc2V0KHJlc29sdmVkUGF0aCwgW25dKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgICdQcm9ncmFtOmV4aXQnOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY2hlY2tJbXBvcnRzKGltcG9ydGVkLCBjb250ZXh0KVxyXG4gICAgICAgIGNoZWNrSW1wb3J0cyh0eXBlc0ltcG9ydGVkLCBjb250ZXh0KVxyXG4gICAgICB9LFxyXG4gICAgfVxyXG4gIH0sXHJcbn1cclxuIl19